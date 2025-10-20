export interface AlarmClockType {
  id: string;
  label?: string;
  repeatDays: string[]; 
  enabled: boolean;
  schedule: {
    bedtime: {
      time: string; // "22:15"
      enabled: boolean;
    };
    wake: {
      time: string; // "06:15"
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
