import { AlarmRepeatType } from '../enums';
import type { LocationTarget } from './alarm.type';

export type LocationRepeatOption = 'Once' | 'Weekdays' | 'Everyday';

export const LOCATION_REPEAT_OPTIONS: LocationRepeatOption[] = [
  'Once',
  'Weekdays',
  'Everyday',
];

export const legacyRepeatToEnum = (repeat: LocationRepeatOption): AlarmRepeatType => {
  switch (repeat) {
    case 'Weekdays':
      return AlarmRepeatType.WEEKDAYS;
    case 'Everyday':
      return AlarmRepeatType.EVERYDAY;
    default:
      return AlarmRepeatType.ONCE;
  }
};

export const enumToLegacyRepeat = (repeat: AlarmRepeatType): LocationRepeatOption => {
  switch (repeat) {
    case AlarmRepeatType.WEEKDAYS:
      return 'Weekdays';
    case AlarmRepeatType.EVERYDAY:
      return 'Everyday';
    default:
      return 'Once';
  }
};

export type LocationType = LocationTarget & {
  createdAt?: Date | string;
  isFavorite?: boolean;
  type?: 'home' | 'work' | 'other';
};

export type ViewMode = 'search' | 'setAlarm' | 'history';

/**
 * @deprecated Use LocationAlarm from `shared/types/alarm.type.ts`
 */
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

/**
 * @deprecated Use LocationAlarm from `shared/types/alarm.type.ts`
 */
export interface LocationAlarmType extends BaseLocationAlarm {
  lat: number;
  long: number;
  lineName: string;
  mapbox_id?: string;
  isActive: boolean;
}

/**
 * @deprecated Use LocationAlarm from `shared/types/alarm.type.ts`
 */
export interface LocationAlarmHistoryType extends BaseLocationAlarm {
  distance: number;
  coordinates: {
    latitude: number;
    longitude: number;
  };
}

/**
 * @deprecated Use specialized config objects in UI components
 */
export interface MapAlarmConfigType {
  lineName: string;
  timeBeforeArrival: number;
  radius: number;
  sound: string;
  repeat: LocationRepeatOption;
}
