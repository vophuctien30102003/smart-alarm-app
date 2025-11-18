import { AlarmRepeatType, AlarmType, WeekDay } from '../enums';
import type { AlarmPayload } from './alarmPayload';
import type { LocationAlarmStatus } from './locationTracking.type';
import { AlarmSound } from './sound.type';

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
  time: string;
  repeatDays: WeekDay[];
  deleteAfterNotification: boolean;
}

export interface LocationAlarm extends BaseAlarm {
  type: AlarmType.LOCATION;
  targetLocation: LocationTarget;
  radiusMeters: number;
  timeBeforeArrival?: number;
  arrivalTrigger?: boolean;
  repeatType: AlarmRepeatType;
}

export interface SleepAlarm extends BaseAlarm {
  type: AlarmType.SLEEP;
  bedtime: string;
  wakeUpTime: string;
  repeatDays: WeekDay[];
  goalMinutes?: number;
  bedtimeNotificationIds?: string[];
  wakeNotificationIds?: string[];
  gentleWakeMinutes?: number;
}

export type Alarm = TimeAlarm | LocationAlarm | SleepAlarm;

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
  addAlarm: (alarm: AlarmPayload) => Promise<void>;
  updateAlarm: (id: string, updates: Partial<AlarmPayload>) => Promise<void>;
  deleteAlarm: (id: string) => Promise<void>;
  toggleAlarm: (id: string) => Promise<void>;
  triggerAlarm: (alarm: Alarm) => void;
  stopAlarm: () => Promise<void>;
  snoozeAlarm: () => void;
  setupAlarmTracking: (alarm: Alarm) => Promise<void>;
  cleanupAlarmTracking: (alarm: Alarm) => Promise<void>;
  scheduleNotifications: (alarm: Alarm) => Promise<void>;
  cancelNotifications: (alarmId: string) => Promise<void>;
  getNextAlarmTime: (alarm: Alarm) => Date | null;
  isAlarmActive: (alarm: Alarm) => boolean;
  startLocationTracking: () => Promise<void>;
  stopLocationTracking: () => Promise<void>;
  updateLocationAlarms: () => Promise<void>;
  getLocationAlarmStatus: (alarmId: string) => LocationAlarmStatus | null;
}

export type AlarmStore = AlarmState & AlarmActions;

export const isTimeAlarm = (alarm: Alarm): alarm is TimeAlarm => {
  return alarm.type === AlarmType.TIME;
};
export const isLocationAlarm = (alarm: Alarm): alarm is LocationAlarm => {
  return alarm.type === AlarmType.LOCATION;
};
export const isSleepAlarm = (alarm: Alarm): alarm is SleepAlarm => {
  return alarm.type === AlarmType.SLEEP;
};
