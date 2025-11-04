import * as Notifications from "expo-notifications";
import { NOTIFICATION_CONSTANTS, NOTIFICATION_DATA_TYPES } from "../../shared/constants/";
import { WeekDay } from "../../shared/enums/";
import { SleepAlarm } from "../../shared/types/alarm.type";
import {
    formatDurationFromMinutes,
    getMinutesBetweenTimes,
    parseTimeString,
} from "../../shared/utils/timeUtils";
import { AlarmScheduler, SchedulingResult } from "./AlarmScheduler";

// Helper: Get next date for a time string (HH:mm)
const getNextDateForTime = (timeString: string, referenceDate?: Date): Date => {
    const { hours, minutes } = parseTimeString(timeString);
    const date = referenceDate ? new Date(referenceDate) : new Date();
    date.setHours(hours, minutes, 0, 0);
    
    if (!referenceDate && date <= new Date()) {
        date.setDate(date.getDate() + 1);
    }
    
    return date;
};

// Helper: Create weekly trigger for repeating alarms
const createWeeklyTrigger = (
    weekDay: WeekDay,
    hour: number,
    minute: number
): Notifications.WeeklyTriggerInput => ({
    type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
    channelId: NOTIFICATION_CONSTANTS.ALARM_CHANNEL_ID,
    weekday: weekDay + 1, // Convert 0-6 to 1-7 for Expo
    hour,
    minute,
});

// Helper: Get next weekday
const getNextWeekDay = (currentDay: WeekDay): WeekDay => {
    const days = [
        WeekDay.MONDAY, WeekDay.TUESDAY, WeekDay.WEDNESDAY, 
        WeekDay.THURSDAY, WeekDay.FRIDAY, WeekDay.SATURDAY, WeekDay.SUNDAY
    ];
    const currentIndex = days.indexOf(currentDay);
    return days[(currentIndex + 1) % 7];
};

export class SleepAlarmScheduler implements AlarmScheduler {
    private createContent(
        alarm: SleepAlarm,
        type: 'bedtime' | 'wake',
        sleepDurationDisplay?: string
    ): Notifications.NotificationContentInput {
        const isBedtime = type === 'bedtime';
        const content = {
            title: isBedtime ? "🛌 Bedtime Alarm" : "☀️ Wake Up Alarm",
            body: isBedtime
                ? `It's time for bed. Sleep schedule: ${sleepDurationDisplay} hours.`
                : "It's time to wake up. Have a great day!",
        };

        return {
            title: content.title,
            body: content.body,
            sound: true,
            priority: Notifications.AndroidNotificationPriority.MAX,
            data: {
                alarmId: alarm.id,
                alarmLabel: alarm.label,
                type: NOTIFICATION_DATA_TYPES.SLEEP_ALARM,
                sleepEvent: type,
            },
        };
    }

    private async scheduleOnce(alarm: SleepAlarm, sleepDurationDisplay: string): Promise<SchedulingResult> {
        const bedtimeDate = getNextDateForTime(alarm.bedtime);
        const wakeReferenceDate = new Date(bedtimeDate);
        const wakeDate = getNextDateForTime(alarm.wakeUpTime, wakeReferenceDate);

        const bedtimeContent = this.createContent(alarm, 'bedtime', sleepDurationDisplay);
        const wakeContent = this.createContent(alarm, 'wake');

        const bedtimeTrigger: Notifications.DateTriggerInput = {
            type: Notifications.SchedulableTriggerInputTypes.DATE,
            channelId: NOTIFICATION_CONSTANTS.ALARM_CHANNEL_ID,
            date: bedtimeDate,
        };

        const wakeTrigger: Notifications.DateTriggerInput = {
            type: Notifications.SchedulableTriggerInputTypes.DATE,
            channelId: NOTIFICATION_CONSTANTS.ALARM_CHANNEL_ID,
            date: wakeDate,
        };

        const [bedtimeId, wakeId] = await Promise.all([
            Notifications.scheduleNotificationAsync({ content: bedtimeContent, trigger: bedtimeTrigger }),
            Notifications.scheduleNotificationAsync({ content: wakeContent, trigger: wakeTrigger }),
        ]);

        return { bedtimeIds: [bedtimeId], wakeIds: [wakeId] };
    }

    private async scheduleRepeating(
        alarm: SleepAlarm,
        sleepDurationDisplay: string,
        bedtimeHour: number,
        bedtimeMinute: number,
        wakeHour: number,
        wakeMinute: number,
        bedtimeTotalMinutes: number,
        wakeTotalMinutes: number
    ): Promise<SchedulingResult> {
        const bedtimeIds: string[] = [];
        const wakeIds: string[] = [];

        for (const repeatDay of alarm.repeatDays!) {
            const bedtimeTrigger = createWeeklyTrigger(repeatDay, bedtimeHour, bedtimeMinute);
            const wakeDay = wakeTotalMinutes >= bedtimeTotalMinutes ? repeatDay : getNextWeekDay(repeatDay);
            const wakeTrigger = createWeeklyTrigger(wakeDay, wakeHour, wakeMinute);

            const bedtimeContent = this.createContent(alarm, 'bedtime', sleepDurationDisplay);
            const wakeContent = this.createContent(alarm, 'wake');

            const [bedtimeId, wakeId] = await Promise.all([
                Notifications.scheduleNotificationAsync({ content: bedtimeContent, trigger: bedtimeTrigger }),
                Notifications.scheduleNotificationAsync({ content: wakeContent, trigger: wakeTrigger }),
            ]);

            bedtimeIds.push(bedtimeId);
            wakeIds.push(wakeId);
        }

        return { bedtimeIds, wakeIds };
    }

    async schedule(alarm: SleepAlarm): Promise<SchedulingResult> {
        try {
            const sleepMinutes = getMinutesBetweenTimes(alarm.bedtime, alarm.wakeUpTime);
            const sleepDurationDisplay = formatDurationFromMinutes(sleepMinutes);

            const { hours: bedtimeHour, minutes: bedtimeMinute } = parseTimeString(alarm.bedtime);
            const { hours: wakeHour, minutes: wakeMinute } = parseTimeString(alarm.wakeUpTime);
            const bedtimeTotalMinutes = bedtimeHour * 60 + bedtimeMinute;
            const wakeTotalMinutes = wakeHour * 60 + wakeMinute;

            if (!alarm.repeatDays || alarm.repeatDays.length === 0) {
                return await this.scheduleOnce(alarm, sleepDurationDisplay);
            } else {
                return await this.scheduleRepeating(
                    alarm,
                    sleepDurationDisplay,
                    bedtimeHour,
                    bedtimeMinute,
                    wakeHour,
                    wakeMinute,
                    bedtimeTotalMinutes,
                    wakeTotalMinutes
                );
            }
        } catch (error) {
            console.error("❌ Error scheduling sleep alarm notifications:", error);
            throw error;
        }
    }

    async cancel(notificationIds: string[]): Promise<void> {
        const validIds = notificationIds.filter((id): id is string => !!id);
        if (validIds.length === 0) return;

        try {
            await Promise.all(validIds.map(id => Notifications.cancelScheduledNotificationAsync(id)));
        } catch (error) {
            console.error("❌ Error cancelling sleep alarm notifications:", error);
        }
    }
}