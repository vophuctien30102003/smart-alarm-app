export type SoundUri = string | number;

export interface Sound {
  id: string;
  title: string;
  name?: string;
  uri: SoundUri; // Remote URI or require() asset identifier
  filename?: string;
  isDefault?: boolean;
}

// Legacy Sound type for backward compatibility
export type LegacySound = Sound;

// AlarmSound for specific alarm use cases
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
  fadeInDuration?: number; // seconds
}
