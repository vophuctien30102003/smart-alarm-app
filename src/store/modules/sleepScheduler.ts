import notificationManager from '@/services/NotificationManager';
import { WeekDay } from '@/shared/enums';
import type { SleepAlarm } from '@/shared/types/alarm.type';
import { parseTimeString } from '@/shared/utils/timeUtils';

export const getNextWeekDayValue = (day: WeekDay): WeekDay => {
  return day === WeekDay.SATURDAY ? WeekDay.SUNDAY : ((day + 1) as WeekDay);
};

export const getNextDateForTime = (time: string, reference: Date = new Date()): Date => {
  const { hours, minutes } = parseTimeString(time);
  const candidate = new Date(reference);
  candidate.setHours(hours, minutes, 0, 0);

  if (candidate <= reference) {
    candidate.setDate(candidate.getDate() + 1);
  }

  return candidate;
};

export const getNextRepeatDateForTime = (
  time: string,
  repeatDays: WeekDay[],
  shiftToNextDay: boolean = false,
): Date | null => {
  if (repeatDays.length === 0) {
    return null;
  }

  const now = new Date();
  const { hours, minutes } = parseTimeString(time);
  let best: Date | null = null;

  repeatDays.forEach((day) => {
    const dayForEvent = shiftToNextDay ? getNextWeekDayValue(day) : day;
    let diff = dayForEvent - now.getDay();
    if (diff < 0) {
      diff += 7;
    }

    const candidate = new Date(now);
    candidate.setDate(candidate.getDate() + diff);
    candidate.setHours(hours, minutes, 0, 0);

    if (candidate <= now) {
      candidate.setDate(candidate.getDate() + 7);
    }

    if (!best || candidate < best) {
      best = candidate;
    }
  });

  return best;
};

export const getNextSleepEventDate = (
  alarm: SleepAlarm,
  event: 'bedtime' | 'wake',
): Date | null => {
  if (!alarm.isEnabled) {
    return null;
  }

  const repeatDays = alarm.repeatDays ?? [];
  const { hours: bedHour, minutes: bedMinute } = parseTimeString(alarm.bedtime);
  const { hours: wakeHour, minutes: wakeMinute } = parseTimeString(alarm.wakeUpTime);
  const bedtimeMinutes = bedHour * 60 + bedMinute;
  const wakeMinutes = wakeHour * 60 + wakeMinute;

  if (repeatDays.length === 0) {
    if (event === 'bedtime') {
      return getNextDateForTime(alarm.bedtime);
    }

    const bedtimeDate = getNextDateForTime(alarm.bedtime);
    return getNextDateForTime(alarm.wakeUpTime, bedtimeDate);
  }

  const shiftToNextDay = wakeMinutes < bedtimeMinutes;
  if (event === 'bedtime') {
    return getNextRepeatDateForTime(alarm.bedtime, repeatDays, false);
  }

  return getNextRepeatDateForTime(alarm.wakeUpTime, repeatDays, shiftToNextDay) ?? null;
};

export const scheduleSleepNotifications = async (
  alarm: SleepAlarm,
  manager = notificationManager,
) => {
  return manager.scheduleSleepAlarmNotifications(alarm);
};

export const collectSleepNotificationIds = (alarm: SleepAlarm): string[] => {
  return [
    ...(alarm.bedtimeNotificationIds ?? []),
    ...(alarm.wakeNotificationIds ?? []),
  ];
};

export const cancelSleepNotifications = async (
  alarm: SleepAlarm,
  manager = notificationManager,
) => {
  const ids = collectSleepNotificationIds(alarm);
  if (ids.length > 0) {
    await manager.cancelSleepAlarmNotifications(ids);
  }
};
