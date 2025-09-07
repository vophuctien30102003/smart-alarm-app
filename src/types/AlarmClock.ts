import { WeekDay } from "../prototype/enum/day.enum";
import { LocationType } from "./Location";
import { Sound } from "./Sound";

export interface Alarm {
  id: string;
  time: string;
  label: string;
  isEnabled: boolean;
  repeatDays: WeekDay[];
  sound?: Sound;
  volume: number;
  vibrate: boolean;
  snoozeEnabled: boolean;
  snoozeDuration: number;
  maxSnoozeCount?: number;
  deleteAfterNotification: boolean;
  notificationId?: string;
  createdAt: Date;
  updatedAt: Date;
  
  isLocationBased?: boolean;
  targetLocation?: LocationType;
  radiusMeters?: number;
  arrivalTrigger?: boolean;
}

export interface AlarmSound {
  id: string;
  name: string;
  uri: string | number; 
  isDefault?: boolean;
}

export interface AlarmNotification {
  id: string;
  alarmId: string;
  scheduledTime: Date;
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

  scheduleNotifications: (alarm: Alarm) => Promise<void>;
  cancelNotifications: (alarmId: string) => Promise<void>;

  getNextAlarmTime: (alarm: Alarm) => Date | null;
  isAlarmActive: (alarm: Alarm) => boolean;

  startLocationTracking: () => Promise<void>;
  stopLocationTracking: () => Promise<void>;
  updateLocationAlarms: () => void;
  getArrivalTimeEstimate: (targetLocation: LocationType, currentPosition?: { latitude: number; longitude: number }) => Promise<{
    duration: { text: string; value: number };
    distance: { text: string; value: number };
    formattedDuration: string;
    formattedDistance: string;
  } | null>;
  getLocationAlarmStatus: (alarmId: string) => any;
}

export type AlarmStore = AlarmState & AlarmActions;
