import notificationManager from '@/services/NotificationManager';
import { WeekDay } from '@/shared/enums';
import type { SleepAlarm } from '@/shared/types/alarm.type';
import { parseTimeString } from '@/shared/utils/timeUtils';

const getNextWeekDay = (day: WeekDay): WeekDay => 
  day === WeekDay.SATURDAY ? WeekDay.SUNDAY : ((day + 1) as WeekDay);

const getNextDateForTime = (time: string, reference: Date = new Date()): Date => {
  const { hours, minutes } = parseTimeString(time);
  const candidate = new Date(reference);
  candidate.setHours(hours, minutes, 0, 0);
  return candidate <= reference 
    ? new Date(candidate.getTime() + 86400000) // +1 day
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

export const scheduleSleepNotifications = async (alarm: SleepAlarm) => {
  return notificationManager.scheduleSleepAlarmNotifications(alarm);
};

export const cancelSleepNotifications = async (alarm: SleepAlarm) => {
  const ids = [
    ...(alarm.bedtimeNotificationIds ?? []),
    ...(alarm.wakeNotificationIds ?? []),
  ];
  if (ids.length) {
    await notificationManager.cancelSleepAlarmNotifications(ids);
  }
};
