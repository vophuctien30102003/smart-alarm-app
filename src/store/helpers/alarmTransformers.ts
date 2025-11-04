import { ALARM_LOCATION_DEFAULTS, ALARM_TIME_DEFAULTS } from '@/shared/constants/alarmDefaults';
import { AlarmRepeatType, AlarmType } from '@/shared/enums';
import type { Alarm, LocationAlarm, SleepAlarm, TimeAlarm } from '@/shared/types/alarm.type';
import type { AlarmPayload, LocationAlarmPayload, SleepAlarmPayload, TimeAlarmPayload } from '@/shared/types/alarmPayload';
import { formatAlarmLabel } from '@/shared/utils/alarmUtils';
import { generateTimestampId } from '@/shared/utils/idUtils';

/**
 * Convert an Alarm object to its corresponding AlarmPayload
 */
export const alarmToPayload = (alarm: Alarm): AlarmPayload => {
  switch (alarm.type) {
    case AlarmType.TIME:
      return {
        type: AlarmType.TIME,
        label: alarm.label,
        isEnabled: alarm.isEnabled,
        sound: alarm.sound,
        volume: alarm.volume,
        vibrate: alarm.vibrate,
        snoozeEnabled: alarm.snoozeEnabled,
        snoozeDuration: alarm.snoozeDuration,
        maxSnoozeCount: alarm.maxSnoozeCount,
        time: alarm.time,
        repeatDays: alarm.repeatDays,
        deleteAfterNotification: alarm.deleteAfterNotification,
      } as TimeAlarmPayload;

    case AlarmType.SLEEP:
      return {
        type: AlarmType.SLEEP,
        label: alarm.label,
        isEnabled: alarm.isEnabled,
        sound: alarm.sound,
        volume: alarm.volume,
        vibrate: alarm.vibrate,
        snoozeEnabled: alarm.snoozeEnabled,
        snoozeDuration: alarm.snoozeDuration,
        maxSnoozeCount: alarm.maxSnoozeCount,
        bedtime: alarm.bedtime,
        wakeUpTime: alarm.wakeUpTime,
        repeatDays: alarm.repeatDays,
        goalMinutes: alarm.goalMinutes,
        gentleWakeMinutes: alarm.gentleWakeMinutes,
      } as SleepAlarmPayload;

    case AlarmType.LOCATION:
    default:
      return {
        type: AlarmType.LOCATION,
        label: alarm.label,
        isEnabled: alarm.isEnabled,
        sound: alarm.sound,
        volume: alarm.volume,
        vibrate: alarm.vibrate,
        snoozeEnabled: alarm.snoozeEnabled,
        snoozeDuration: alarm.snoozeDuration,
        maxSnoozeCount: alarm.maxSnoozeCount,
        targetLocation: alarm.targetLocation,
        radiusMeters: alarm.radiusMeters,
        timeBeforeArrival: alarm.timeBeforeArrival,
        arrivalTrigger: alarm.arrivalTrigger,
        repeatType: alarm.repeatType,
      } as LocationAlarmPayload;
  }
};

/**
 * Normalize AlarmPayload with default values
 */
export const normalizeAlarmPayload = (payload: AlarmPayload): AlarmPayload => {
  const baseLabel = formatAlarmLabel({
    label: payload.label,
    type: payload.type,
    repeatDays: 'repeatDays' in payload ? payload.repeatDays : undefined,
  });

  const defaults = payload.type === AlarmType.LOCATION ? ALARM_LOCATION_DEFAULTS : ALARM_TIME_DEFAULTS;

  const base = {
    ...payload,
    label: baseLabel,
    isEnabled: payload.isEnabled ?? true,
    volume: payload.volume ?? defaults.VOLUME,
    vibrate: payload.vibrate ?? true,
    snoozeEnabled: payload.snoozeEnabled ?? false,
    snoozeDuration: payload.snoozeDuration ?? defaults.SNOOZE_DURATION,
    maxSnoozeCount: payload.maxSnoozeCount ?? defaults.MAX_SNOOZE_COUNT,
  } as AlarmPayload;

  if (base.type === AlarmType.TIME) {
    return {
      ...base,
      repeatDays: base.repeatDays ?? [],
      deleteAfterNotification: base.deleteAfterNotification ?? false,
    } as TimeAlarmPayload;
  }

  if (base.type === AlarmType.SLEEP) {
    return {
      ...base,
      repeatDays: base.repeatDays ?? [],
    } as SleepAlarmPayload;
  }

  return {
    ...base,
    repeatType: base.repeatType ?? AlarmRepeatType.ONCE,
    arrivalTrigger: base.arrivalTrigger ?? true,
    radiusMeters: base.radiusMeters ?? ALARM_LOCATION_DEFAULTS.RADIUS_METERS,
    timeBeforeArrival: base.timeBeforeArrival ?? ALARM_LOCATION_DEFAULTS.TIME_BEFORE_ARRIVAL,
  } as LocationAlarmPayload;
};

/**
 * Build complete Alarm object from AlarmPayload
 */
export const buildAlarmFromPayload = (
  payload: AlarmPayload,
  base: Pick<Alarm, 'id' | 'createdAt' | 'notificationId'> & Partial<Alarm>
): Alarm => {
  const timestamp = new Date().toISOString();
  const defaults = payload.type === AlarmType.LOCATION ? ALARM_LOCATION_DEFAULTS : ALARM_TIME_DEFAULTS;

  const shared = {
    id: base.id,
    createdAt: base.createdAt,
    updatedAt: timestamp,
    label: payload.label!,
    isEnabled: payload.isEnabled ?? true,
    sound: payload.sound,
    volume: payload.volume ?? defaults.VOLUME,
    vibrate: payload.vibrate ?? true,
    snoozeEnabled: payload.snoozeEnabled ?? false,
    snoozeDuration: payload.snoozeDuration ?? defaults.SNOOZE_DURATION,
    maxSnoozeCount: payload.maxSnoozeCount ?? defaults.MAX_SNOOZE_COUNT,
    notificationId: base.notificationId,
  } as const;

  if (payload.type === AlarmType.TIME) {
    return {
      ...shared,
      type: AlarmType.TIME,
      time: payload.time,
      repeatDays: payload.repeatDays ?? [],
      deleteAfterNotification: payload.deleteAfterNotification ?? false,
    } as TimeAlarm;
  }

  if (payload.type === AlarmType.SLEEP) {
    return {
      ...shared,
      type: AlarmType.SLEEP,
      bedtime: payload.bedtime,
      wakeUpTime: payload.wakeUpTime,
      repeatDays: payload.repeatDays ?? [],
      goalMinutes: payload.goalMinutes,
      gentleWakeMinutes: payload.gentleWakeMinutes,
      bedtimeNotificationIds: [],
      wakeNotificationIds: [],
    } as SleepAlarm;
  }

  return {
    ...shared,
    type: AlarmType.LOCATION,
    targetLocation: payload.targetLocation,
    radiusMeters: payload.radiusMeters,
    timeBeforeArrival: payload.timeBeforeArrival,
    arrivalTrigger: payload.arrivalTrigger ?? true,
    repeatType: payload.repeatType ?? AlarmRepeatType.ONCE,
  } as LocationAlarm;
};

/**
 * Create a new alarm with generated ID and timestamp
 */
export const createNewAlarm = (payload: AlarmPayload): Alarm => {
  const normalized = normalizeAlarmPayload(payload);
  return buildAlarmFromPayload(normalized, {
    id: generateTimestampId(),
    createdAt: new Date().toISOString(),
  } as Alarm);
};
