import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { Alarm } from '../types/AlarmClock';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: false,
    shouldShowList: false,
  }),
});

export class NotificationManager {
  private static instance: NotificationManager;
  private expoPushToken: string | null = null;

  private constructor() {}

  static getInstance(): NotificationManager {
    if (!NotificationManager.instance) {
      NotificationManager.instance = new NotificationManager();
    }
    return NotificationManager.instance;
  }

  async initialize(): Promise<boolean> {
    try {
      if (!Device.isDevice) {
        console.warn('Must use physical device for Push Notifications');
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
        await Notifications.setNotificationChannelAsync('alarms', {
          name: 'Alarm Notifications',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
          sound: 'default',
          enableVibrate: true,
        });
      }

      const projectId = Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
      
      if (!projectId) {
        console.warn('Project ID not found');
        return false;
      }

      const token = await Notifications.getExpoPushTokenAsync({
        projectId,
      });
      
      this.expoPushToken = token.data;
      
      return true;
    } catch (error) {
      console.error('❌ Error initializing notifications:', error);
      return false;
    }
  }

  async scheduleAlarmNotification(alarm: Alarm): Promise<string | null> {
    try {
      const now = new Date();
      const [hours, minutes] = alarm.time.split(':').map(Number);
      
      let triggerDate = new Date();
      triggerDate.setHours(hours, minutes, 0, 0);

      if (triggerDate <= now) {
        if (alarm.repeatDays && alarm.repeatDays.length > 0) {
          const currentDay = now.getDay();
          const nextDay = alarm.repeatDays.find(day => day > currentDay) || 
                          alarm.repeatDays[0];
          
          const daysUntilNext = nextDay > currentDay ? 
            nextDay - currentDay : 
            7 - currentDay + nextDay;
          
          triggerDate.setDate(triggerDate.getDate() + daysUntilNext);
        } else {
          triggerDate.setDate(triggerDate.getDate() + 1);
        }
      }

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: '⏰ Alarm',
          body: alarm.label || 'Wake up!',
          sound: true,
          data: {
            alarmId: alarm.id,
            alarmLabel: alarm.label,
            alarmTime: alarm.time,
          },
        },
        trigger: {
          date: triggerDate,
          channelId: 'alarms',
        },
      });

      return notificationId;
    } catch (error) {
      console.error('❌ Error scheduling notification:', error);
      return null;
    }
  }

  async cancelAlarmNotification(notificationId: string): Promise<void> {
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
    } catch (error) {
      console.error('❌ Error cancelling notification:', error);
    }
  }

  async cancelAllAlarmNotifications(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('❌ Error cancelling all notifications:', error);
    }
  }

  async showLocationAlarmNotification(alarm: Alarm, title: string, body: string): Promise<void> {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
          data: {
            alarmId: alarm.id,
            alarmLabel: alarm.label,
            alarmType: 'location',
            locationAddress: alarm.targetLocation?.address,
          },
        },
        trigger: null,
      });
    } catch (error) {
      console.error('❌ Error showing location alarm notification:', error);
    }
  }

  async getScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
    try {
      return await Notifications.getAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('❌ Error getting scheduled notifications:', error);
      return [];
    }
  }

  addNotificationResponseListener(callback: (response: Notifications.NotificationResponse) => void) {
    return Notifications.addNotificationResponseReceivedListener(callback);
  }

  addNotificationReceivedListener(callback: (notification: Notifications.Notification) => void) {
    return Notifications.addNotificationReceivedListener(callback);
  }
}

export default NotificationManager.getInstance();
