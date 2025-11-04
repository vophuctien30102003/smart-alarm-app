import type { WeekDay } from '@/shared/enums';
import { AlarmRepeatType, AlarmType } from '@/shared/enums';
import type { Alarm } from '@/shared/types/alarm.type';
import type {
  AlarmPayload,
  LocationAlarmPayload,
  SleepAlarmPayload,
  TimeAlarmPayload,
} from '@/shared/types/alarmPayload';
import { formatRepeatDays } from '@/shared/utils/timeUtils';

interface LabelOptions {
  label?: string;
  type: AlarmType;
  repeatDays?: WeekDay[];
}

export const formatAlarmLabel = ({ label, type, repeatDays }: LabelOptions): string => {
  const trimmed = (label ?? '').trim();
  if (trimmed.length > 0) return trimmed;

  if (type === AlarmType.SLEEP || type === AlarmType.TIME) {
    if (repeatDays && repeatDays.length > 0) {
      return formatRepeatDays(repeatDays);
    }
    return type === AlarmType.SLEEP ? 'Sleep schedule' : 'Alarm';
  }

  return 'Location alarm';
};

export const formatAlarmRepeatDescription = (alarm: Alarm): string => {
  if ('repeatDays' in alarm && alarm.repeatDays.length > 0) {
    return formatRepeatDays(alarm.repeatDays);
  }
  return 'Once';
};

// Validation utilities
const isNonEmpty = (value?: string) => typeof value === 'string' && value.trim().length > 0;
const isTimeString = (value: string) => /^([01]?\d|2[0-3]):[0-5]\d$/.test(value);
const isFiniteNumber = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value);

export const validateAlarmTime = (time: string): boolean => isTimeString(time);

export const validateAlarmLabel = (label: string): boolean => 
  isNonEmpty(label) && label.trim().length <= 50;

export const validateAlarmData = (alarm: {
  time: string;
  label: string;
  volume?: number;
  snoozeDuration?: number;
}): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!validateAlarmTime(alarm.time)) {
    errors.push('Invalid time format');
  }

  if (!validateAlarmLabel(alarm.label)) {
    errors.push('Label must be 1-50 characters long');
  }

  if (alarm.volume !== undefined && (alarm.volume < 0 || alarm.volume > 1)) {
    errors.push('Volume must be between 0 and 1');
  }

  if (alarm.snoozeDuration !== undefined && alarm.snoozeDuration < 1) {
    errors.push('Snooze duration must be at least 1 minute');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

const validateBase = (payload: AlarmPayload, errors: string[]) => {
  if (!isNonEmpty(payload.label)) {
    errors.push('Label must not be empty.');
  }

  const volume = payload.volume ?? 0.8;
  if (!isFiniteNumber(volume) || volume < 0 || volume > 1) {
    errors.push('Volume must be between 0 and 1.');
  }

  const snoozeDuration = payload.snoozeDuration ?? 5;
  if (!isFiniteNumber(snoozeDuration) || snoozeDuration <= 0) {
    errors.push('Snooze duration must be greater than 0.');
  }

  const maxSnooze = payload.maxSnoozeCount ?? 3;
  if (!isFiniteNumber(maxSnooze) || maxSnooze < 0) {
    errors.push('Max snooze count cannot be negative.');
  }
};

const validateTimeAlarm = (payload: TimeAlarmPayload, errors: string[]) => {
  if (!isTimeString(payload.time)) {
    errors.push('Invalid time format. Expected HH:mm.');
  }

  if (payload.repeatDays && !Array.isArray(payload.repeatDays)) {
    errors.push('Repeat days must be an array.');
  }
};

const validateSleepAlarm = (payload: SleepAlarmPayload, errors: string[]) => {
  if (!isTimeString(payload.bedtime) || !isTimeString(payload.wakeUpTime)) {
    errors.push('Bedtime and wake time must be in HH:mm format.');
  }

  if (payload.repeatDays && !Array.isArray(payload.repeatDays)) {
    errors.push('Repeat days must be an array.');
  }
};

const validateLocationAlarm = (payload: LocationAlarmPayload, errors: string[]) => {
  if (!payload.targetLocation) {
    errors.push('Target location is required.');
    return;
  }

  const { coordinates } = payload.targetLocation;
  if (
    !coordinates ||
    !isFiniteNumber(coordinates.latitude) ||
    !isFiniteNumber(coordinates.longitude)
  ) {
    errors.push('Target location coordinates are invalid.');
  }

  if (!isFiniteNumber(payload.radiusMeters) || payload.radiusMeters <= 0) {
    errors.push('Radius must be greater than 0.');
  }

  const repeatType = payload.repeatType ?? AlarmRepeatType.ONCE;
  if (!Object.values(AlarmRepeatType).includes(repeatType)) {
    errors.push('Invalid repeat type for location alarm.');
  }
};

export const validateAlarmPayload = (payload: AlarmPayload) => {
  const errors: string[] = [];

  validateBase(payload, errors);

  switch (payload.type) {
    case AlarmType.TIME:
      validateTimeAlarm(payload, errors);
      break;
    case AlarmType.SLEEP:
      validateSleepAlarm(payload, errors);
      break;
    case AlarmType.LOCATION:
      validateLocationAlarm(payload, errors);
      break;
    default:
      errors.push('Unsupported alarm type.');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const ensureValidAlarmPayload = <T extends AlarmPayload>(payload: T): T => {
  const result = validateAlarmPayload(payload);
  if (!result.isValid) {
    throw new Error(result.errors.join(' '));
  }
  return payload;
};