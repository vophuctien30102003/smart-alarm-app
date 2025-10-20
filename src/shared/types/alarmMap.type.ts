export interface MapAlarm {
  id: string;
  name: string;
  address: string;
  lat: number;
  long: number;
  radius: number;
  lineName: string;
  timeBeforeArrival: number; // in minutes
  sound: string;
  repeat: 'Once' | 'Weekdays' | 'Everyday';
  isActive: boolean;
  timestamp: Date;
  mapbox_id?: string;
}

export interface MapAlarmConfig {
  lineName: string;
  timeBeforeArrival: number;
  radius: number;
  sound: string;
  repeat: 'Once' | 'Weekdays' | 'Everyday';
}

export type ViewMode = 'search' | 'setAlarm' | 'history';

export interface AlarmMapHistory {
  id: string;
  name: string;
  address: string;
  distance: number;
  timestamp: Date;
  radius: number;
  timeBeforeArrival: number;
  sound: string;
  repeat: string;
  lineName: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
}
