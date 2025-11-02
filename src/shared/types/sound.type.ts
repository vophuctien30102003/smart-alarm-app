export type SoundUri = string | number;

export interface Sound {
  id: string;
  title: string;
  name?: string;
  uri: SoundUri;
  filename?: string;
  isDefault?: boolean;
}

export type LegacySound = Sound;

export interface AlarmSound {
  id: string;
  name: string;
  uri: SoundUri;
  isDefault?: boolean;
}

export interface AudioSettings {
  volume: number;
  vibrate: boolean;
  fadeIn: boolean;
  fadeInDuration?: number; 
}
