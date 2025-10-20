// Alarm-related types (excluding AlarmSound to avoid conflict)
export {
  Alarm, AlarmActions, AlarmNotification,
  AlarmState, AlarmStore, BaseAlarm, isLocationAlarm, isTimeAlarm, LegacyMapAlarm, LocationAlarm, LocationTarget, TimeAlarm
} from './alarm';

// Location-related types  
export {
  FavoriteLocation,
  LegacyLocationType, LocationCoordinates
} from './location';
export * from './locationTracking';

// Sound-related types (including AlarmSound)
export * from './sound';

// Map alarm types
export {
  AlarmMapHistory, MapAlarm,
  MapAlarmConfig,
  ViewMode
} from './alarmMap.type';


// Notification types
export * from './notification';

// Notification types
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

export interface AlarmNotificationData {
  alarmId: string;
  alarmType: 'time' | 'location';
  alarmLabel: string;
}

// History types
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
