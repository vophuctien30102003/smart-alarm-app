import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { WeekDay } from '../shared/enums';
import { Alarm } from '../shared/types';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

const ALARM_CHANNEL_ID = 'alarms';
const LOCATION_ALARM_CHANNEL_ID = 'location-alarms';
const NOTIFICATION_VIBRATION_PATTERN = [0, 250, 250, 250];

export class NotificationManager {
  private static instance: NotificationManager;
  private expoPushToken: string | null = null;
  private isInitialized: boolean = false;
  private initializationPromise: Promise<boolean> | null = null;

  private constructor() {}

  static getInstance(): NotificationManager {
    if (!NotificationManager.instance) {
      NotificationManager.instance = new NotificationManager();
    }
    return NotificationManager.instance;
  }

  async initialize(): Promise<boolean> {
    if (this.isInitialized) {
      return true;
    }

    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    this.initializationPromise = this.performInitialization();
    const result = await this.initializationPromise;
    this.isInitialized = result;
    return result;
  }

  private async performInitialization(): Promise<boolean> {
    try {
      if (!Device.isDevice) {
        // console.warn('Must use physical device for Push Notifications');
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

      await this.setupNotificationChannels();

      const success = await this.setupPushToken();
      
      return success;
    } catch (error) {
      console.error('❌ Error initializing notifications:', error);
      return false;
    }
  }

  private async setupNotificationChannels(): Promise<void> {
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync(ALARM_CHANNEL_ID, {
          name: 'Alarm Notifications',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: NOTIFICATION_VIBRATION_PATTERN,
          lightColor: '#FF231F7C',
          sound: 'default',
          enableVibrate: true,
          bypassDnd: true,
        });

        await Notifications.setNotificationChannelAsync(LOCATION_ALARM_CHANNEL_ID, {
          name: 'Location Alarm Notifications',
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: NOTIFICATION_VIBRATION_PATTERN,
          lightColor: '#FF6B35',
          sound: 'default',
          enableVibrate: true,
        });
      }
  }

  private async setupPushToken(): Promise<boolean> {
    try {
      const projectId = Constants?.expoConfig?.extra?.eas?.projectId ?? 
                        Constants?.easConfig?.projectId;
      
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
      console.error('❌ Error setting up push token:', error);
      return false;
    }
  }

  async scheduleAlarmNotification(alarm: Alarm): Promise<string | null> {
    try {
      await this.initialize();

      const triggerDate = this.calculateNextTriggerDate(alarm);
      
      if (!triggerDate) {
        console.warn('Could not calculate trigger date for alarm:', alarm.id);
        return null;
      }

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: '⏰ Alarm',
          body: alarm.label || 'Wake up!',
          sound: true,
          priority: Notifications.AndroidNotificationPriority.MAX,
          data: {
            alarmId: alarm.id,
            alarmLabel: alarm.label,
            alarmTime: alarm.time,
            type: 'alarm',
          },
        },
        trigger: {
          date: triggerDate,
          channelId: ALARM_CHANNEL_ID,
        },
      });

      console.log(`📅 Scheduled alarm notification for ${triggerDate.toLocaleString()}`);
      return notificationId;
    } catch (error) {
      console.error('❌ Error scheduling notification:', error);
      return null;
    }
  }

  private calculateNextTriggerDate(alarm: Alarm): Date | null {
    const now = new Date();
    const [hours, minutes] = alarm.time.split(':').map(Number);
    
    if (isNaN(hours) || isNaN(minutes)) {
      console.error('Invalid time format:', alarm.time);
      return null;
    }
    
    let triggerDate = new Date();
    triggerDate.setHours(hours, minutes, 0, 0);

    if (triggerDate <= now) {
      if (alarm.repeatDays && alarm.repeatDays.length > 0) {
        const nextTriggerDate = this.getNextRepeatDate(alarm, triggerDate);
        return nextTriggerDate;
      } else {
        triggerDate.setDate(triggerDate.getDate() + 1);
      }
    }

    return triggerDate;
  }

  private getNextRepeatDate(alarm: Alarm, baseDate: Date): Date {
    const now = new Date();
    
    const repeatDaysAsNumbers = alarm.repeatDays?.map(weekDay => {
      return weekDay === WeekDay.SUNDAY ? 0 : weekDay;
    }) || [];

    for (let i = 0; i < 7; i++) {
      const testDate = new Date(baseDate);
      testDate.setDate(testDate.getDate() + i);
      const testDay = testDate.getDay();
      
      if (repeatDaysAsNumbers.includes(testDay)) {
        if (i === 0 && testDate > now) {
          return testDate;
        }
        if (i > 0) {
          return testDate;
        }
      }
    }

    const nextDate = new Date(baseDate);
    nextDate.setDate(nextDate.getDate() + 7);
    return nextDate;
  }

  async cancelAlarmNotification(notificationId: string): Promise<void> {
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
      console.log(`📅 Cancelled notification: ${notificationId}`);
    } catch (error) {
      console.error('❌ Error cancelling notification:', error);
    }
  }

  async cancelAllAlarmNotifications(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      console.log('📅 Cancelled all notifications');
    } catch (error) {
      console.error('❌ Error cancelling all notifications:', error);
    }
  }

  async showLocationAlarmNotification(alarm: Alarm, title: string, body: string): Promise<void> {
    try {
      await this.initialize();
      
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
            type: 'location-alarm',
          },
        },
        trigger: null,
      });
      
      console.log(`📍 Showed location alarm notification for: ${alarm.label}`);
    } catch (error) {
      console.error('❌ Error showing location alarm notification:', error);
    }
  }

  async getScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
    try {
      const notifications = await Notifications.getAllScheduledNotificationsAsync();
      console.log(`📅 Found ${notifications.length} scheduled notifications`);
      return notifications;
    } catch (error) {
      console.error('❌ Error getting scheduled notifications:', error);
      return [];
    }
  }

  addNotificationResponseListener(callback: (response: Notifications.NotificationResponse) => void) {
    return Notifications.addNotificationResponseReceivedListener((response) => {
      try {
        console.log('📱 Notification response received:', response.notification.request.content.data);
        callback(response);
      } catch (error) {
        console.error('❌ Error handling notification response:', error);
      }
    });
  }

  addNotificationReceivedListener(callback: (notification: Notifications.Notification) => void) {
    return Notifications.addNotificationReceivedListener((notification) => {
      try {
        console.log('📱 Notification received:', notification.request.content.data);
        callback(notification);
      } catch (error) {
        console.error('❌ Error handling notification received:', error);
      }
    });
  }

  async getNotificationStatus(): Promise<{
    isInitialized: boolean;
    hasToken: boolean;
    permissions: Notifications.NotificationPermissionsStatus;
    scheduledCount: number;
  }> {
    try {
      const permissions = await Notifications.getPermissionsAsync();
      const scheduled = await this.getScheduledNotifications();
      
      return {
        isInitialized: this.isInitialized,
        hasToken: !!this.expoPushToken,
        permissions,
        scheduledCount: scheduled.length,
      };
    } catch (error) {
      console.error('❌ Error getting notification status:', error);
      return {
        isInitialized: false,
        hasToken: false,
        permissions: { status: 'undetermined' } as any,
        scheduledCount: 0,
      };
    }
  }

  getExpoPushToken(): string | null {
    return this.expoPushToken;
  }
}

export default NotificationManager.getInstance();
