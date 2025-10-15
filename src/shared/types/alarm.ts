import { AlarmRepeatType, AlarmType, WeekDay } from '../enums';
import { AlarmSound } from './sound';

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
  createdAt: Date;
  updatedAt: Date;
  notificationId?: string;
}

// Time-based alarm
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

// Union type for all alarms
export type Alarm = TimeAlarm | LocationAlarm;

// Alarm notification
export interface AlarmNotification {
  id: string;
  alarmId: string;
  scheduledTime: Date;
  isTriggered: boolean;
}

// State interfaces
export interface AlarmState {
  alarms: Alarm[];
  activeAlarm: Alarm | null;
  isPlaying: boolean;
  isSnoozed: boolean;
  snoozeCount: number;
}

export interface AlarmActions {
  // CRUD operations
  addAlarm: (alarm: Omit<Alarm, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateAlarm: (id: string, updates: Partial<Alarm>) => Promise<void>;
  deleteAlarm: (id: string) => Promise<void>;
  toggleAlarm: (id: string) => Promise<void>;

  // Playback control
  triggerAlarm: (alarm: Alarm) => void;
  stopAlarm: () => void;
  snoozeAlarm: () => void;

  // Notification & tracking management
  setupAlarmTracking: (alarm: Alarm) => Promise<void>;
  cleanupAlarmTracking: (alarm: Alarm) => Promise<void>;
  scheduleNotifications: (alarm: Alarm) => Promise<void>;
  cancelNotifications: (alarmId: string) => Promise<void>;

  // Utility functions
  getNextAlarmTime: (alarm: Alarm) => Date | null;
  isAlarmActive: (alarm: Alarm) => boolean;

  // Location tracking (for location alarms)
  startLocationTracking: () => Promise<void>;
  stopLocationTracking: () => Promise<void>;
  updateLocationAlarms: () => void;
  getLocationAlarmStatus: (alarmId: string) => any;
}

export type AlarmStore = AlarmState & AlarmActions;

// Type guards
export const isTimeAlarm = (alarm: Alarm): alarm is TimeAlarm => {
  return alarm.type === AlarmType.TIME;
};

export const isLocationAlarm = (alarm: Alarm): alarm is LocationAlarm => {
  return alarm.type === AlarmType.LOCATION;
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

// View mode for map screens
export type ViewMode = 'search' | 'setAlarm' | 'history';
