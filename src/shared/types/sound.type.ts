export interface Sound {
  id: string;
  title: string;
  name?: string;
  uri: any; // Can be string, number, or require() result
  filename?: string;
  isDefault?: boolean;
}

// Legacy Sound type for backward compatibility
export type LegacySound = Sound;

// AlarmSound for specific alarm use cases
export interface AlarmSound {
  id: string;
  name: string;
  uri: string | number;
  isDefault?: boolean;
}

export interface AudioSettings {
  volume: number;
  vibrate: boolean;
  fadeIn: boolean;
  fadeInDuration?: number; // seconds
}
