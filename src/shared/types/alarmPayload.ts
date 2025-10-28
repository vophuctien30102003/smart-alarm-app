import { AlarmRepeatType, AlarmType, WeekDay } from '@/shared/enums';
import type { LocationTarget } from '@/shared/types/alarm.type';
import type { AlarmSound } from '@/shared/types/sound.type';

export interface BaseAlarmPayload {
  label?: string;
  isEnabled?: boolean;
  sound?: AlarmSound;
  volume?: number;
  vibrate?: boolean;
  snoozeEnabled?: boolean;
  snoozeDuration?: number;
  maxSnoozeCount?: number;
}

export interface TimeAlarmPayload extends BaseAlarmPayload {
  type: AlarmType.TIME;
  time: string;
  repeatDays?: WeekDay[];
  deleteAfterNotification?: boolean;
}

export interface SleepAlarmPayload extends BaseAlarmPayload {
  type: AlarmType.SLEEP;
  bedtime: string;
  wakeUpTime: string;
  repeatDays?: WeekDay[];
  goalMinutes?: number;
  gentleWakeMinutes?: number;
}

export interface LocationAlarmPayload extends BaseAlarmPayload {
  type: AlarmType.LOCATION;
  targetLocation: LocationTarget;
  radiusMeters: number;
  timeBeforeArrival?: number;
  arrivalTrigger?: boolean;
  repeatType?: AlarmRepeatType;
}

export type AlarmPayload = TimeAlarmPayload | SleepAlarmPayload | LocationAlarmPayload;
