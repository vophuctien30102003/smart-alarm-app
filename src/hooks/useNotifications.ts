import * as Notifications from 'expo-notifications';
import { useCallback, useEffect, useRef } from 'react';
import notificationManager from '../services/NotificationManager';
import { useAlarmStore } from '../store/alarmStore';

const TRIGGER_THROTTLE_MS = 3000;

export const useNotificationHandler = () => {
  const triggerAlarm = useAlarmStore(state => state.triggerAlarm);
  const alarms = useAlarmStore(state => state.alarms);
  const lastTriggeredRef = useRef<Record<string, number>>({});

  const triggerIfNeeded = useCallback((alarmId: string | undefined) => {
    if (!alarmId) return;

    const now = Date.now();
    const lastTriggeredAt = lastTriggeredRef.current[alarmId] ?? 0;
    if (now - lastTriggeredAt < TRIGGER_THROTTLE_MS) return;

    const alarm = alarms.find(a => a.id === alarmId);
    if (alarm) {
      lastTriggeredRef.current[alarmId] = now;
      triggerAlarm(alarm);
    } else {
      console.warn('Alarm not found for notification:', alarmId);
    }
  }, [alarms, triggerAlarm]);

  const handleNotification = useCallback((data: any) => {
    const notificationType = data?.type;
    const isAlarmType = notificationType === 'alarm' || 
                        notificationType === 'sleep-alarm' || 
                        notificationType === 'location-alarm';
    
    if (isAlarmType && typeof data?.alarmId === 'string') {
      triggerIfNeeded(data.alarmId);
    }
  }, [triggerIfNeeded]);

  const handleNotificationResponse = useCallback((response: Notifications.NotificationResponse) => {
    handleNotification(response.notification.request.content.data);
  }, [handleNotification]);

  const handleNotificationReceived = useCallback((notification: Notifications.Notification) => {
    handleNotification(notification.request.content.data);
  }, [handleNotification]);

  useEffect(() => {
    void notificationManager.initialize();

    const responseListener = notificationManager.addNotificationResponseListener(handleNotificationResponse);
    const notificationListener = notificationManager.addNotificationReceivedListener(handleNotificationReceived);

    return () => {
      responseListener?.remove();
      notificationListener?.remove();
    };
  }, [handleNotificationResponse, handleNotificationReceived]);

  return {
    scheduleNotification: notificationManager.scheduleAlarmNotification.bind(notificationManager),
    cancelNotification: notificationManager.cancelAlarmNotification.bind(notificationManager),
    getNotificationStatus: notificationManager.getNotificationStatus.bind(notificationManager),
  };
};

export const useNotificationPermissions = () => {
  const checkPermissions = useCallback(async () => {
    try {
      return await notificationManager.getNotificationStatus();
    } catch (error) {
      console.error('Error checking notification permissions:', error);
      return null;
    }
  }, []);

  const requestPermissions = useCallback(async () => {
    try {
      return await notificationManager.initialize();
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
      return false;
    }
  }, []);

  return { checkPermissions, requestPermissions };
};
