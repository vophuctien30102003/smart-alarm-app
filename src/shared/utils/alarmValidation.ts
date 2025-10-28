import { AlarmRepeatType, AlarmType } from '@/shared/enums';
import type {
    AlarmPayload,
    LocationAlarmPayload,
    SleepAlarmPayload,
    TimeAlarmPayload,
} from '@/shared/types/alarmPayload';

const isNonEmpty = (value?: string) => typeof value === 'string' && value.trim().length > 0;

const isTimeString = (value: string) => /^([01]?\d|2[0-3]):[0-5]\d$/.test(value);

const isFiniteNumber = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value);

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
