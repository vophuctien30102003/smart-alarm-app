import { AlarmRepeatType, AlarmType, WeekDay } from '../enums';
import type { LocationAlarmStatus } from './locationTracking.type';
import { AlarmSound } from './sound.type';

// Location related types
export interface LocationTarget {
  id: string;
  name: string;
  address: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  mapbox_id?: string;
  type?: 'home' | 'work' | 'other';
}

// Base alarm interface - all alarms have these properties
export interface BaseAlarm {
  id: string;
  label: string;
  isEnabled: boolean;
  sound?: AlarmSound;
  volume: number;
  vibrate: boolean;
  snoozeEnabled: boolean;
  snoozeDuration: number;
  maxSnoozeCount: number;
  createdAt: Date | string;
  updatedAt: Date | string;
  notificationId?: string;
}

export interface TimeAlarm extends BaseAlarm {
  type: AlarmType.TIME;
  time: string; // HH:mm format
  repeatDays: WeekDay[];
  deleteAfterNotification: boolean;
}

// Location-based alarm
export interface LocationAlarm extends BaseAlarm {
  type: AlarmType.LOCATION;
  targetLocation: LocationTarget;
  radiusMeters: number;
  timeBeforeArrival?: number; // minutes before arrival
  arrivalTrigger?: boolean;
  repeatType: AlarmRepeatType;
}

// Sleep alarm combines bedtime and wake-up notifications
export interface SleepAlarm extends BaseAlarm {
  type: AlarmType.SLEEP;
  bedtime: string; // HH:mm format
  wakeUpTime: string; // HH:mm format
  repeatDays: WeekDay[];
  goalMinutes?: number;
  bedtimeNotificationIds?: string[];
  wakeNotificationIds?: string[];
  gentleWakeMinutes?: number; // minutes to ramp volume
}

// Union type for all alarms
export type Alarm = TimeAlarm | LocationAlarm | SleepAlarm;

// Alarm notification
export interface AlarmNotification {
  id: string;
  alarmId: string;
  scheduledTime: Date | string;
  isTriggered: boolean;
}

export interface AlarmState {
  alarms: Alarm[];
  activeAlarm: Alarm | null;
  isPlaying: boolean;
  isSnoozed: boolean;
  snoozeCount: number;
}

export interface AlarmActions {
  addAlarm: (alarm: Omit<Alarm, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateAlarm: (id: string, updates: Partial<Alarm>) => Promise<void>;
  deleteAlarm: (id: string) => Promise<void>;
  toggleAlarm: (id: string) => Promise<void>;

  triggerAlarm: (alarm: Alarm) => void;
  stopAlarm: () => void;
  snoozeAlarm: () => void;

  setupAlarmTracking: (alarm: Alarm) => Promise<void>;
  cleanupAlarmTracking: (alarm: Alarm) => Promise<void>;
  scheduleNotifications: (alarm: Alarm) => Promise<void>;
  cancelNotifications: (alarmId: string) => Promise<void>;

  getNextAlarmTime: (alarm: Alarm) => Date | null;
  isAlarmActive: (alarm: Alarm) => boolean;

  startLocationTracking: () => Promise<void>;
  stopLocationTracking: () => Promise<void>;
  updateLocationAlarms: () => void;
  getLocationAlarmStatus: (alarmId: string) => LocationAlarmStatus | null;
}

export type AlarmStore = AlarmState & AlarmActions;

// Type guards
export const isTimeAlarm = (alarm: Alarm): alarm is TimeAlarm => {
  return alarm.type === AlarmType.TIME;
};

export const isLocationAlarm = (alarm: Alarm): alarm is LocationAlarm => {
  return alarm.type === AlarmType.LOCATION;
};

export const isSleepAlarm = (alarm: Alarm): alarm is SleepAlarm => {
  return alarm.type === AlarmType.SLEEP;
};

// Legacy types for backward compatibility (will be removed after migration)
export interface LegacyMapAlarm {
  id: string;
  name: string;
  address: string;
  lat: number;
  long: number;
  radius: number;
  lineName: string;
  timeBeforeArrival: number;
  sound: string;
  repeat: 'Once' | 'Weekdays' | 'Everyday';
  isActive: boolean;
  timestamp: Date;
  mapbox_id?: string;
}
