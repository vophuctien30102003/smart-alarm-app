import { AlarmSound, Sound } from '../types/sound.type';
import { getAllSounds, getDefaultSound } from '../utils/soundUtils';

export const DEFAULT_ALARM_SOUNDS: Sound[] = getAllSounds();

export const getDefaultAlarmSound = (): AlarmSound => {
  const defaultSound = getDefaultSound();
  
  return {
    id: defaultSound.id,
    name: defaultSound.title,
    uri: defaultSound.uri,
    isDefault: true,
  };
};

export const convertSoundToAlarmSound = (sound: Sound): AlarmSound => {
  return {
    id: sound.id,
    name: sound.title,
    uri: sound.uri,
    isDefault: sound.isDefault || false,
  };
};
