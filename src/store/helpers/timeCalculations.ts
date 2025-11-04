import type { Alarm, TimeAlarm } from '@/shared/types/alarm.type';
import { isLocationAlarm, isSleepAlarm, isTimeAlarm } from '@/shared/types/alarm.type';
import { mapWeekDayToNumber, parseTimeString } from '@/shared/utils/timeUtils';
import { getNextSleepEventDate } from '@/store/modules/sleepScheduler';

export const computeNextTimeAlarmDate = (alarm: TimeAlarm): Date => {
  const { hours, minutes } = parseTimeString(alarm.time);
  const now = new Date();
  const alarmDate = new Date(now);
  alarmDate.setHours(hours, minutes, 0, 0);

  if (alarmDate <= now) {
    alarmDate.setDate(alarmDate.getDate() + 1);
  }

  if (alarm.repeatDays.length > 0) {
    const currentDay = alarmDate.getDay();
    const daysUntilNext = alarm.repeatDays
      .map((day) => {
        let diff = mapWeekDayToNumber(day) - currentDay;
        if (diff <= 0) diff += 7;
        return diff;
      })
      .sort((a, b) => a - b)[0];

    alarmDate.setDate(alarmDate.getDate() + daysUntilNext);
  }

  return alarmDate;
};

export const getNextAlarmTime = (alarm: Alarm): Date | null => {
  if (!alarm.isEnabled || isLocationAlarm(alarm)) return null;

  if (isSleepAlarm(alarm)) {
    const nextBedtime = getNextSleepEventDate(alarm, 'bedtime');
    const nextWake = getNextSleepEventDate(alarm, 'wake');
    if (nextBedtime && nextWake) {
      return nextBedtime < nextWake ? nextBedtime : nextWake;
    }
    return nextBedtime ?? nextWake ?? null;
  }

  if (isTimeAlarm(alarm)) {
    return computeNextTimeAlarmDate(alarm);
  }

  return null;
};

export const isAlarmActive = (alarm: Alarm): boolean => {
  return Boolean(alarm.isEnabled && (isLocationAlarm(alarm) || getNextAlarmTime(alarm)));
};
