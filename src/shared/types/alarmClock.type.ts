import { WeekDay } from '../enums';

export interface AlarmClockType {
  id: string;
  label?: string;
  repeatDays: WeekDay[];
  enabled: boolean;
  schedule: {
    bedtime: {
      time: string; 
      enabled: boolean;
    };
    wake: {
      time: string; 
      enabled: boolean;
    };
  };
  settings: {
    gentleWakeUp?: number;
    snooze?: number;
    volume?: number;
    sound?: string;
    vibration?: boolean;
  };
}
