import { ALARM_LOCATION_DEFAULTS } from '@/shared/constants/alarmDefaults';
import { convertSoundToAlarmSound } from '@/shared/constants/sounds';
import { AlarmRepeatType, AlarmType } from '@/shared/enums';
import type { LocationAlarm } from '@/shared/types/alarm.type';
import { isLocationAlarm } from '@/shared/types/alarm.type';
import type { LocationAlarmType, LocationRepeatOption, LocationType, ViewMode } from '@/shared/types/alarmLocation.type';
import type { LocationAlarmPayload } from '@/shared/types/alarmPayload';
import { enumToLegacyRepeat, legacyRepeatToEnum } from '@/shared/utils/alarmOptions';
import { resolveSound } from '@/shared/utils/soundUtils';
import { useAlarmStore } from '@/store/alarmStore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

const STORAGE_KEY = 'map-alarm-storage';

const ensureDateString = (value: Date | string | undefined): string => {
  if (!value) return new Date().toISOString();
  return typeof value === 'string' ? value : value.toISOString();
};

const isLegacyLocationAlarm = (
  alarm: LocationAlarm | LocationAlarmType,
): alarm is LocationAlarmType => {
  return (
    alarm !== null &&
    typeof alarm === 'object' &&
    'lat' in alarm &&
    'long' in alarm &&
    !('targetLocation' in alarm)
  );
};

const normalizeLocationAlarm = (
  alarm: LocationAlarm | LocationAlarmType,
): LocationAlarm => {
  if (isLegacyLocationAlarm(alarm)) {
    const sound = convertSoundToAlarmSound(resolveSound(alarm.sound));

    return {
      id: alarm.id,
      label: alarm.lineName || alarm.name,
      isEnabled: alarm.isActive ?? true,
      sound,
      snoozeEnabled: false,
      createdAt: ensureDateString(alarm.timestamp),
      updatedAt: new Date().toISOString(),
      type: AlarmType.LOCATION,
      targetLocation: {
        id: alarm.mapbox_id || alarm.id,
        name: alarm.name,
        address: alarm.address,
        coordinates: {
          latitude: alarm.lat,
          longitude: alarm.long,
        },
        mapbox_id: alarm.mapbox_id,
      },
      radiusMeters: alarm.radius,
      timeBeforeArrival: alarm.timeBeforeArrival,
      arrivalTrigger: true,
      repeatType: legacyRepeatToEnum(alarm.repeat),
    };
  }

  const sound = alarm.sound ?? convertSoundToAlarmSound(resolveSound());
  const targetLocation = alarm.targetLocation ?? {
    id: alarm.id,
    name: alarm.label ?? 'Location Alarm',
    address: '',
    coordinates: {
      latitude: 0,
      longitude: 0,
    },
  };

  return {
    ...alarm,
    label: alarm.label ?? targetLocation.name ?? 'Location Alarm',
    isEnabled: alarm.isEnabled ?? true,
    sound,
    snoozeEnabled: alarm.snoozeEnabled ?? false,
    createdAt: ensureDateString(alarm.createdAt),
    updatedAt: ensureDateString(alarm.updatedAt),
    type: AlarmType.LOCATION,
    targetLocation,
    radiusMeters: alarm.radiusMeters ?? ALARM_LOCATION_DEFAULTS.RADIUS_METERS,
    timeBeforeArrival: alarm.timeBeforeArrival ?? ALARM_LOCATION_DEFAULTS.TIME_BEFORE_ARRIVAL,
    arrivalTrigger: alarm.arrivalTrigger ?? true,
    repeatType: alarm.repeatType ?? AlarmRepeatType.ONCE,
  };
};

const normalizeAlarmsArray = (
  alarms: (LocationAlarm | LocationAlarmType)[] = [],
): LocationAlarm[] => alarms.map(normalizeLocationAlarm);

interface MapAlarmStore {
  currentView: ViewMode;
  selectedLocation: LocationType | null;
  editingAlarmId: string | null;
  setCurrentView: (view: ViewMode) => void;
  setSelectedLocation: (location: LocationType | null) => void;
  setEditingAlarmId: (alarmId: string | null) => void;
  reset: () => void;
}

export const useMapAlarmStore = create<MapAlarmStore>()((set) => ({
  currentView: 'search',
  selectedLocation: null,
  editingAlarmId: null,
  setCurrentView: (view) => set({ currentView: view }),
  setSelectedLocation: (location) => set({ selectedLocation: location }),
  setEditingAlarmId: (alarmId) => set({ editingAlarmId: alarmId }),
  reset: () =>
    set({
      currentView: 'search',
      selectedLocation: null,
      editingAlarmId: null,
    }),
}));

export const mapAlarmSelectors = {
  currentView: (state: MapAlarmStore) => state.currentView,
  selectedLocation: (state: MapAlarmStore) => state.selectedLocation,
  editingAlarmId: (state: MapAlarmStore) => state.editingAlarmId,
} as const;

export const mapAlarmActions = {
  setCurrentView: (state: MapAlarmStore) => state.setCurrentView,
  setSelectedLocation: (state: MapAlarmStore) => state.setSelectedLocation,
  setEditingAlarmId: (state: MapAlarmStore) => state.setEditingAlarmId,
  reset: (state: MapAlarmStore) => state.reset,
} as const;

export const mapRepeatTypeToOption = (
  repeatType: AlarmRepeatType,
): LocationRepeatOption => {
  return enumToLegacyRepeat(repeatType);
};

export const mapOptionToRepeatType = (
  option: LocationRepeatOption,
): AlarmRepeatType => {
  return legacyRepeatToEnum(option);
};

export const migrateLegacyLocationAlarms = async () => {
  try {
    const storedValue = await AsyncStorage.getItem(STORAGE_KEY);
    if (!storedValue) {
      return;
    }

    const parsed = JSON.parse(storedValue) as
      | LocationAlarmType[]
      | {
          alarms?: (LocationAlarm | LocationAlarmType)[];
        }
      | null;

    const legacyAlarms = Array.isArray(parsed)
      ? parsed
      : Array.isArray(parsed?.alarms)
        ? parsed.alarms
        : [];

    const normalized = normalizeAlarmsArray(legacyAlarms);
    if (normalized.length === 0) {
      await AsyncStorage.removeItem(STORAGE_KEY);
      return;
    }

    const alarmStore = useAlarmStore.getState();
    const existingLocationIds = new Set(
      alarmStore.alarms
        .filter(isLocationAlarm)
        .map((alarm) => alarm.targetLocation?.id ?? alarm.id),
    );

    for (const alarm of normalized) {
      const targetId = alarm.targetLocation?.id ?? alarm.id;
      if (existingLocationIds.has(targetId)) {
        continue;
      }

      const payload: LocationAlarmPayload = {
        type: AlarmType.LOCATION,
        label: alarm.label,
        isEnabled: alarm.isEnabled,
        sound: alarm.sound,
        snoozeEnabled: alarm.snoozeEnabled,
        targetLocation: alarm.targetLocation,
        radiusMeters: alarm.radiusMeters,
        timeBeforeArrival: alarm.timeBeforeArrival,
        arrivalTrigger: alarm.arrivalTrigger,
        repeatType: alarm.repeatType,
      };

      await alarmStore.addAlarm(payload);
    }

    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to migrate legacy location alarms:', error);
  }
};
