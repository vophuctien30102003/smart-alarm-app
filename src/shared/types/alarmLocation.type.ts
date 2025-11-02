import type { LocationTarget } from './alarm.type';

export type LocationRepeatOption = 'Once' | 'Weekdays' | 'Everyday';

export { enumToLegacyRepeat, legacyRepeatToEnum, LOCATION_REPEAT_OPTIONS } from '@/shared/utils/alarmOptions';

export type LocationType = LocationTarget & {
  createdAt?: Date | string;
  isFavorite?: boolean;
  type?: 'home' | 'work' | 'other';
};
export type Coordinates = {
  latitude: number;
  longitude: number;
}

export type ViewMode = 'search' | 'setAlarm' | 'history';
export interface BaseLocationAlarm {
  id: string;
  name: string;
  address: string;
  radius: number;
  timeBeforeArrival: number;
  sound: string;
  repeat: LocationRepeatOption;
  timestamp: Date | string;
}
export interface LocationAlarmType extends BaseLocationAlarm {
  lat: number;
  long: number;
  lineName: string;
  mapbox_id?: string;
  isActive: boolean;
}

export interface LocationAlarmHistoryType extends BaseLocationAlarm {
  distance: number;
  coordinates: Coordinates
}
export interface MapAlarmConfigType {
  lineName: string;
  timeBeforeArrival: number;
  radius: number;
  sound: string;
  repeat: LocationRepeatOption;
}
