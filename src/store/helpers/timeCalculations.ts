import { WeekDay } from '@/shared/enums';
import type { Alarm, SleepAlarm, TimeAlarm } from '@/shared/types/alarm.type';
import { isLocationAlarm, isSleepAlarm, isTimeAlarm } from '@/shared/types/alarm.type';
import { mapWeekDayToNumber, parseTimeString } from '@/shared/utils/timeUtils';

const getNextWeekDay = (day: WeekDay): WeekDay => 
  day === WeekDay.SATURDAY ? WeekDay.SUNDAY : ((day + 1) as WeekDay);

const getNextDateForTime = (time: string, reference: Date = new Date()): Date => {
  const { hours, minutes } = parseTimeString(time);
  const candidate = new Date(reference);
  candidate.setHours(hours, minutes, 0, 0);
  return candidate <= reference 
    ? new Date(candidate.getTime() + 86400000)
    : candidate;
};

const getNextRepeatDate = (
  time: string,
  repeatDays: WeekDay[],
  shiftToNextDay = false,
): Date | null => {
  if (!repeatDays.length) return null;

  const now = new Date();
  const { hours, minutes } = parseTimeString(time);
  let best: Date | null = null;

  for (const day of repeatDays) {
    const dayForEvent = shiftToNextDay ? getNextWeekDay(day) : day;
    let diff = dayForEvent - now.getDay();
    if (diff < 0) diff += 7;

    const candidate = new Date(now);
    candidate.setDate(candidate.getDate() + diff);
    candidate.setHours(hours, minutes, 0, 0);

    if (candidate <= now) {
      candidate.setDate(candidate.getDate() + 7);
    }

    if (!best || candidate < best) {
      best = candidate;
    }
  }

  return best;
};

export const getNextSleepEventDate = (
  alarm: SleepAlarm,
  event: 'bedtime' | 'wake',
): Date | null => {
  if (!alarm.isEnabled) return null;

  const repeatDays = alarm.repeatDays ?? [];
  const { hours: bedHour, minutes: bedMinute } = parseTimeString(alarm.bedtime);
  const { hours: wakeHour, minutes: wakeMinute } = parseTimeString(alarm.wakeUpTime);
  const shiftToNextDay = (wakeHour * 60 + wakeMinute) < (bedHour * 60 + bedMinute);

  if (!repeatDays.length) {
    if (event === 'bedtime') {
      return getNextDateForTime(alarm.bedtime);
    }
    const bedtimeDate = getNextDateForTime(alarm.bedtime);
    return getNextDateForTime(alarm.wakeUpTime, bedtimeDate);
  }

  return event === 'bedtime'
    ? getNextRepeatDate(alarm.bedtime, repeatDays, false)
    : getNextRepeatDate(alarm.wakeUpTime, repeatDays, shiftToNextDay);
};

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
