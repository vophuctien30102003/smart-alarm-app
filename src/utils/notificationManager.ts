import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { Alarm } from '../types/alarm';
import { getNextAlarmTime } from './timeUtils';

export class NotificationManager {
  private static instance: NotificationManager;

  private constructor() {}

  public static getInstance(): NotificationManager {
    if (!NotificationManager.instance) {
      NotificationManager.instance = new NotificationManager();
    }
    return NotificationManager.instance;
  }

  async initialize(): Promise<boolean> {
    try {
      // Configure notification behavior
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: false,
          shouldShowBanner: true,
          shouldShowList: true,
        }),
      });

      if (!Device.isDevice) {
        console.warn('Must use physical device for notifications');
        return false;
      }

      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.warn('Failed to get push token for push notification!');
        return false;
      }

      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('alarm', {
          name: 'Alarm notifications',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
          sound: 'default',
          enableVibrate: true,
        });
      }

      return true;
    } catch (error) {
      console.error('Failed to initialize notifications:', error);
      return false;
    }
  }

  async scheduleAlarmNotification(alarm: Alarm): Promise<string[]> {
    const notificationIds: string[] = [];

    try {
      // Cancel existing notifications for this alarm
      await this.cancelAlarmNotifications(alarm.id);

      if (!alarm.isEnabled) {
        return notificationIds;
      }

      const nextAlarmTime = getNextAlarmTime(alarm);
      if (!nextAlarmTime) {
        return notificationIds;
      }

      // Schedule notification for the alarm
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: '⏰ Alarm',
          body: alarm.label || `Time to wake up! (${alarm.time})`,
          sound: 'default',
        },
        trigger: null,
      });

      notificationIds.push(notificationId);
      return notificationIds;
    } catch (error) {
      console.error('Failed to schedule alarm notification:', error);
      return notificationIds;
    }
  }

  async cancelAlarmNotifications(alarmId: string): Promise<void> {
    try {
      const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
      const alarmNotifications = scheduledNotifications.filter(
        notification => notification.identifier.startsWith(`alarm_${alarmId}`)
      );

      for (const notification of alarmNotifications) {
        await Notifications.cancelScheduledNotificationAsync(notification.identifier);
      }
    } catch (error) {
      console.error('Failed to cancel alarm notifications:', error);
    }
  }

  async cancelAllAlarmNotifications(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Failed to cancel all alarm notifications:', error);
    }
  }

  async presentLocalNotification(title: string, body: string): Promise<void> {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          sound: 'default',
        },
        trigger: null,
      });
    } catch (error) {
      console.error('Failed to present notification:', error);
    }
  }
}
