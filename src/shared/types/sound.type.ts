export type SoundUri = string | number;

export interface Sound {
  id: string;
  title: string;
  name?: string;
  uri: SoundUri;
  filename?: string;
  isDefault?: boolean;
}

export interface AlarmSound {
  id: string;
  name: string;
  filename?: string;
  uri: SoundUri;
  isDefault?: boolean;
}
