import pushSleepNotificationClient from '@/services/notifications/PushSleepNotificationClient';
import type { SleepAlarm } from '@/shared/types/alarm.type';

export const scheduleSleepNotifications = async (alarm: SleepAlarm) => {
  return pushSleepNotificationClient.scheduleSleepAlarm(alarm);
};

export const cancelSleepNotifications = async (alarm: SleepAlarm) => {
  const ids = [
    ...(alarm.bedtimeNotificationIds ?? []),
    ...(alarm.wakeNotificationIds ?? []),
  ];
  if (ids.length) {
    await pushSleepNotificationClient.cancelNotifications(ids);
  }
};
