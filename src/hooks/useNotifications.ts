import * as Notifications from 'expo-notifications';
import { useCallback, useEffect, useRef } from 'react';
import notificationManager from '../lib/NotificationManager';
import { useAlarmStore } from '../store/alarmStore';

export const useNotificationHandler = () => {
  const triggerAlarm = useAlarmStore(state => state.triggerAlarm);
  const alarms = useAlarmStore(state => state.alarms);
  const responseListener = useRef<Notifications.Subscription | null>(null);
  const notificationListener = useRef<Notifications.Subscription | null>(null);

  const handleNotificationResponse = useCallback((response: Notifications.NotificationResponse) => {
    const { data } = response.notification.request.content;
    
    if (data?.type === 'alarm' && data?.alarmId) {
      const alarm = alarms.find(a => a.id === data.alarmId);
      if (alarm) {
        triggerAlarm(alarm);
      }
    }
  }, [alarms, triggerAlarm]);

  const handleNotificationReceived = useCallback((notification: Notifications.Notification) => {
    const { data } = notification.request.content;
    
    if (data?.type === 'alarm' && data?.alarmId) {
      const alarm = alarms.find(a => a.id === data.alarmId);
      if (alarm) {
        triggerAlarm(alarm);
      }
    }
  }, [alarms, triggerAlarm]);

  useEffect(() => {
    // Initialize notification manager
    notificationManager.initialize();

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
