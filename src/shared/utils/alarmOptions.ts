import { AlarmRepeatType } from '@/shared/enums';
import type { LocationRepeatOption } from '@/shared/types/alarmLocation.type';
import type { AlarmSound, Sound } from '@/shared/types/sound.type';
import { getAllSounds, getDefaultSound } from '@/shared/utils/soundUtils';

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

export const convertSoundToAlarmSound = (sound: Sound): AlarmSound => {
  return {
    id: sound.id,
    name: sound.title,
    uri: sound.uri,
    isDefault: sound.isDefault ?? false,
  };
};

export const getDefaultAlarmSound = (): AlarmSound => {
  const defaultSound = getDefaultSound();
  return convertSoundToAlarmSound(defaultSound);
};

// Lazy load sounds to avoid calling getAllSounds on import
let cachedAlarmSounds: AlarmSound[] | null = null;

export const getDefaultAlarmSounds = (): AlarmSound[] => {
  if (cachedAlarmSounds) {
    return cachedAlarmSounds;
  }

  cachedAlarmSounds = getAllSounds().map(convertSoundToAlarmSound);
  return cachedAlarmSounds;
};
