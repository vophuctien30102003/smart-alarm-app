/**
 * Base notification interface for all notification types
 */
export interface BaseNotification {
  id: string;
  title: string;
  body: string;
  data?: Record<string, any>;
  trigger?: {
    date?: Date;
    repeats?: boolean;
  };
}

/**
 * Enhanced notification with additional properties
 */
export interface EnhancedNotification extends BaseNotification {
  sound?: boolean;
  vibrate?: boolean;
  scheduledTime?: Date;
  isTriggered?: boolean;
}

/**
 * Alarm-specific notification data
 */
export interface AlarmNotificationData {
  alarmId: string;
  alarmType: 'time' | 'location';
  alarmLabel: string;
}


export interface AlarmHistory {
  id: string;
  alarmId: string;
  alarmLabel: string;
  triggeredAt: Date;
  duration?: number; // how long the alarm played in seconds
  action: 'stopped' | 'snoozed' | 'dismissed';
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
}
