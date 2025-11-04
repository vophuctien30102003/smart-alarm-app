import notificationManager from '@/services/NotificationManager';
import type { SleepAlarm } from '@/shared/types/alarm.type';

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
