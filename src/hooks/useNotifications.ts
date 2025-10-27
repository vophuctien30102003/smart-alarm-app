import * as Notifications from 'expo-notifications';
import { useCallback, useEffect, useRef } from 'react';
import notificationManager from '../services/NotificationManager';
import { useAlarmStore } from '../store/alarmStore';

export const useNotificationHandler = () => {
  const triggerAlarm = useAlarmStore(state => state.triggerAlarm);
  const alarms = useAlarmStore(state => state.alarms);
  const responseListener = useRef<Notifications.Subscription | null>(null);
  const notificationListener = useRef<Notifications.Subscription | null>(null);
  const lastTriggeredRef = useRef<Record<string, number>>({});

  const triggerIfNeeded = useCallback((alarmId: string | undefined) => {
    if (!alarmId) {
      return;
    }

    const now = Date.now();
    const lastTriggeredAt = lastTriggeredRef.current[alarmId] ?? 0;
    if (now - lastTriggeredAt < 3000) {
      return;
    }

    const alarm = alarms.find(a => a.id === alarmId);
    if (alarm) {
      lastTriggeredRef.current[alarmId] = now;
      triggerAlarm(alarm);
    } else {
      console.warn('Alarm not found for notification:', alarmId);
    }
  }, [alarms, triggerAlarm]);

  const handleNotificationResponse = useCallback((response: Notifications.NotificationResponse) => {
    const { data } = response.notification.request.content;
    const notificationType = data?.type;

    if ((notificationType === 'alarm' || notificationType === 'sleep-alarm' || notificationType === 'location-alarm')) {
      const alarmId = typeof data?.alarmId === 'string' ? data.alarmId : undefined;
      triggerIfNeeded(alarmId);
    }
  }, [triggerIfNeeded]);

  const handleNotificationReceived = useCallback((notification: Notifications.Notification) => {
    const { data } = notification.request.content;
    const notificationType = data?.type;

    if ((notificationType === 'alarm' || notificationType === 'sleep-alarm' || notificationType === 'location-alarm')) {
      const alarmId = typeof data?.alarmId === 'string' ? data.alarmId : undefined;
      triggerIfNeeded(alarmId);
    }
  }, [triggerIfNeeded]);

  useEffect(() => {
    // Initialize notification manager
    void notificationManager.initialize();

    // Set up listeners
    responseListener.current = notificationManager.addNotificationResponseListener(handleNotificationResponse);
    notificationListener.current = notificationManager.addNotificationReceivedListener(handleNotificationReceived);

    return () => {
      responseListener.current?.remove();
      notificationListener.current?.remove();
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
      const status = await notificationManager.getNotificationStatus();
      return status;
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

  return {
    checkPermissions,
    requestPermissions,
  };
};
