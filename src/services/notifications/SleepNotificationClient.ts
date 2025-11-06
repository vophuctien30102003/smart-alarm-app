
import type { SleepAlarm } from '@/shared/types/alarm.type';
export interface SleepNotificationClient {
  initialize(): Promise<boolean>;
  scheduleSleepAlarm(alarm: SleepAlarm): Promise<{
    bedtimeIds: string[];
    wakeIds: string[];
  }>;
  cancelNotifications(notificationIds: string[]): Promise<void>;
  onNotificationReceived(
    callback: (data: { alarmId: string; type: string; sleepEvent?: 'bedtime' | 'wake' }) => void
  ): () => void;
  onNotificationAction(
    callback: (data: { alarmId: string; action: string }) => void
  ): () => void;
}
