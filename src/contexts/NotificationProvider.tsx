import { NOTIFICATION_DATA_TYPES } from '@/shared/constants';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import notificationManager from '../services/NotificationManager';
import pushSleepNotificationClient from '../services/notifications/PushSleepNotificationClient';
import { useAlarmStore } from '../store/alarmStore';

interface NotificationContextType {
  isInitialized: boolean;
  hasPermission: boolean;
  initializeNotifications: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};

interface Props {
  children: React.ReactNode;
}

export const NotificationProvider: React.FC<Props> = ({ children }) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const { triggerAlarm, stopAlarm, snoozeAlarm } = useAlarmStore();

  const initializeNotifications = useCallback(async () => {
    try {
      const [notifSuccess, sleepSuccess] = await Promise.all([
        notificationManager.initialize(),
        pushSleepNotificationClient.initialize(),
      ]);
      setHasPermission(notifSuccess && sleepSuccess);
      setIsInitialized(true);
    } catch (error) {
      console.error('❌ Error initializing notifications:', error);
      setIsInitialized(true);
      setHasPermission(false);
    }
  }, []);

  useEffect(() => {
    initializeNotifications();
    const handleNotification = (data: Record<string, unknown> | undefined) => {
      const alarmId = data?.alarmId;
      if (typeof alarmId === 'string') {
        const alarms = useAlarmStore.getState().alarms;
        const alarm = alarms.find(a => a.id === alarmId);
        if (alarm) {
          triggerAlarm(alarm);
        }
      }
    };
    const responseSubscription = notificationManager.addNotificationResponseListener((response) => {
      handleNotification(response.notification.request.content.data as Record<string, unknown>);
    });
    const receivedSubscription = notificationManager.addNotificationReceivedListener((notification) => {
      handleNotification(notification.request.content.data as Record<string, unknown>);
    });
    const unsubscribeReceived = pushSleepNotificationClient.onNotificationReceived((data) => {
      if (data.type !== NOTIFICATION_DATA_TYPES.SLEEP_ALARM) {
        return;
      }
      const alarms = useAlarmStore.getState().alarms;
      const alarm = alarms.find(a => a.id === data.alarmId);
      if (alarm) {
        triggerAlarm(alarm);
      }
    });
    const unsubscribeAction = pushSleepNotificationClient.onNotificationAction((data) => {
      if (data.action === 'Stop') {
        void stopAlarm();
        return;
      }
      if (data.action === 'Snooze' && data.type === NOTIFICATION_DATA_TYPES.SLEEP_ALARM) {
        snoozeAlarm();
      }
    });
    return () => {
      responseSubscription.remove();
      receivedSubscription.remove();
      unsubscribeReceived();
      unsubscribeAction();
    };
  }, [initializeNotifications, triggerAlarm, stopAlarm, snoozeAlarm]);

  const value = useMemo<NotificationContextType>(() => ({
    isInitialized,
    hasPermission,
    initializeNotifications,
  }), [isInitialized, hasPermission, initializeNotifications]);

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
