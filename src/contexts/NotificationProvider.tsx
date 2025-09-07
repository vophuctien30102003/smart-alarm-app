import React, { createContext, useContext, useEffect, useState } from 'react';
import notificationManager from '../lib/NotificationManager';
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
  const { triggerAlarm } = useAlarmStore();

  const initializeNotifications = async () => {
    try {
      const success = await notificationManager.initialize();
      setHasPermission(success);
      setIsInitialized(true);
      
    } catch (error) {
      console.error('❌ Error initializing notifications:', error);
      setIsInitialized(true);
      setHasPermission(false);
    }
  };

  useEffect(() => {
    initializeNotifications();

    const responseSubscription = notificationManager.addNotificationResponseListener((response) => {
      const { alarmId } = response.notification.request.content.data || {};
      
      if (alarmId) {
        const alarms = useAlarmStore.getState().alarms;
        const alarm = alarms.find(a => a.id === alarmId);
        if (alarm) {
          triggerAlarm(alarm);
        }
      }
    });

    const receivedSubscription = notificationManager.addNotificationReceivedListener((notification) => {
      const { alarmId } = notification.request.content.data || {};
      
      if (alarmId) {
        const alarms = useAlarmStore.getState().alarms;
        const alarm = alarms.find(a => a.id === alarmId);
        if (alarm) {
          triggerAlarm(alarm);
        }
      }
    });

    return () => {
      responseSubscription.remove();
      receivedSubscription.remove();
    };
  }, [triggerAlarm]);

  const value: NotificationContextType = {
    isInitialized,
    hasPermission,
    initializeNotifications,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
