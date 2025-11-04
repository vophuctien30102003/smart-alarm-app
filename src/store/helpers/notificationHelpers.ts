import notificationManager from '@/services/NotificationManager';
import type { Alarm } from '@/shared/types/alarm.type';
import { isLocationAlarm, isSleepAlarm, isTimeAlarm } from '@/shared/types/alarm.type';
import { cancelSleepNotifications, scheduleSleepNotifications } from '@/store/modules/sleepScheduler';

type MergeAlarmFn = (id: string, partial: Partial<Alarm>) => void;

/**
 * Schedule notifications for an alarm
 */
export const scheduleNotificationsForAlarm = async (
  alarm: Alarm,
  merge: MergeAlarmFn
): Promise<void> => {
  if (!alarm.isEnabled || isLocationAlarm(alarm)) return;

  if (isSleepAlarm(alarm)) {
    const { bedtimeIds, wakeIds } = await scheduleSleepNotifications(alarm);
    merge(alarm.id, { bedtimeNotificationIds: bedtimeIds, wakeNotificationIds: wakeIds });
    return;
  }

  if (!isTimeAlarm(alarm)) {
    console.warn('Attempted to schedule notification for unsupported alarm type');
    return;
  }

  const notificationId = await notificationManager.scheduleAlarmNotification(alarm);
  if (notificationId) {
    merge(alarm.id, { notificationId });
  }
};

/**
 * Cancel all notifications for an alarm
 */
export const cancelNotificationsForAlarm = async (
  alarm: Alarm,
  merge: MergeAlarmFn
): Promise<void> => {
  if (isSleepAlarm(alarm)) {
    await cancelSleepNotifications(alarm);
    merge(alarm.id, { bedtimeNotificationIds: [], wakeNotificationIds: [] });
  }

  if (alarm.notificationId) {
    await notificationManager.cancelAlarmNotification(alarm.notificationId);
    merge(alarm.id, { notificationId: undefined });
  }
};
