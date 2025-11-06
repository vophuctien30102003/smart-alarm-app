import { getDefaultAlarmSound, getDefaultAlarmSounds } from '@/shared/constants/sounds';
import type { AlarmSound } from '@/shared/types/sound.type';

let cachedSounds: AlarmSound[] | null = null;

const ensureSounds = (): AlarmSound[] => {
  if (!cachedSounds) {
    cachedSounds = getDefaultAlarmSounds();
  }
  if (!cachedSounds.length) {
    cachedSounds = [getDefaultAlarmSound()];
  }
  return cachedSounds;
};

export const listAlarmSounds = (): AlarmSound[] => {
  return [...ensureSounds()];
};

export const getAlarmSoundById = (soundId?: string | null): AlarmSound => {
  const sounds = ensureSounds();
  if (!soundId) {
    return sounds[0];
  }
  return sounds.find(sound => sound.id === soundId) ?? sounds[0];
};

export const getAlarmSoundId = (sound?: AlarmSound | null): string => {
  const sounds = ensureSounds();
  if (!sound) {
    return sounds[0].id;
  }
  return sound.id;
};

export const getDefaultAlarmSoundId = (): string => {
  return ensureSounds()[0].id;
};
export const getNativeSoundName = (soundId?: string | null): string => {
  const sound = getAlarmSoundById(soundId);
  const filename = sound.filename || 'default';
  return filename.replace('.mp3', '');
};
