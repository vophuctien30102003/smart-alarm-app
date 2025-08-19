export interface Alarm {
  id: string;
  time: string; // HH:mm format
  label: string;
  isEnabled: boolean;
  repeatDays: WeekDay[];
  soundUri?: string;
  soundName: string;
  volume: number; // 0-1
  vibrate: boolean;
  snoozeEnabled: boolean;
  snoozeDuration: number; // minutes
  createdAt: Date;
  updatedAt: Date;
}

export interface AlarmSound {
  id: string;
  name: string;
  uri: string;
  isDefault?: boolean;
}

export enum WeekDay {
  SUNDAY = 0,
  MONDAY = 1,
  TUESDAY = 2,
  WEDNESDAY = 3,
  THURSDAY = 4,
  FRIDAY = 5,
  SATURDAY = 6,
}

export interface AlarmNotification {
  id: string;
  alarmId: string;
  scheduledTime: Date;
  isTriggered: boolean;
}

export interface AlarmState {
  alarms: Alarm[];
  sounds: AlarmSound[];
  activeAlarm: Alarm | null;
  isPlaying: boolean;
  isSnoozed: boolean;
  snoozeCount: number;
}

export interface AlarmActions {
  addAlarm: (alarm: Omit<Alarm, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateAlarm: (id: string, updates: Partial<Alarm>) => void;
  deleteAlarm: (id: string) => void;
  toggleAlarm: (id: string) => void;
  
  triggerAlarm: (alarm: Alarm) => void;
  stopAlarm: () => void;
  snoozeAlarm: () => void;
  
  loadSounds: () => void;
  addCustomSound: (sound: AlarmSound) => void;
  
  scheduleNotifications: (alarm: Alarm) => Promise<void>;
  cancelNotifications: (alarmId: string) => Promise<void>;
  
  getNextAlarmTime: (alarm: Alarm) => Date | null;
  isAlarmActive: (alarm: Alarm) => boolean;
}

export type AlarmStore = AlarmState & AlarmActions;
