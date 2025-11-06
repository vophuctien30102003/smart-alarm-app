import {
    NOTIFICATION_CONSTANTS,
    NOTIFICATION_DATA_TYPES,
} from "@/shared/constants";
import { WeekDay } from "@/shared/enums";
import type { SleepAlarm } from "@/shared/types/alarm.type";
import {
    formatDurationFromMinutes,
    getMinutesBetweenTimes,
    parseTimeString,
} from "@/shared/utils/timeUtils";
import { Audio } from "expo-av";
import PushNotification from "react-native-push-notification";
import AlarmSoundService from "../AlarmSoundService";
import type { SleepNotificationClient } from "./SleepNotificationClient";

const getNextDateForTime = (timeString: string, referenceDate?: Date): Date => {
    const { hours, minutes } = parseTimeString(timeString);
    const date = referenceDate ? new Date(referenceDate) : new Date();
    date.setHours(hours, minutes, 0, 0);
    if (!referenceDate && date <= new Date()) {
        date.setDate(date.getDate() + 1);
    }
    return date;
};
const getNextWeekDay = (currentDay: WeekDay): WeekDay => {
    const days = [
        WeekDay.MONDAY,
        WeekDay.TUESDAY,
        WeekDay.WEDNESDAY,
        WeekDay.THURSDAY,
        WeekDay.FRIDAY,
        WeekDay.SATURDAY,
        WeekDay.SUNDAY,
    ];
    const currentIndex = days.indexOf(currentDay);
    return days[(currentIndex + 1) % 7];
};
const getDateForWeekDay = (
    weekDay: WeekDay,
    hours: number,
    minutes: number
): Date => {
    const now = new Date();
    const currentDay = now.getDay();
    const targetDay = weekDay + 1;
    let daysUntilTarget = targetDay - currentDay;
    if (daysUntilTarget < 0) {
        daysUntilTarget += 7;
    } else if (daysUntilTarget === 0) {
        const targetTime = new Date(now);
        targetTime.setHours(hours, minutes, 0, 0);
        if (targetTime <= now) {
            daysUntilTarget = 7;
        }
    }
    const targetDate = new Date(now);
    targetDate.setDate(now.getDate() + daysUntilTarget);
    targetDate.setHours(hours, minutes, 0, 0);
    return targetDate;
};
const buildNotificationData = (
    alarm: SleepAlarm,
    sleepEvent: "bedtime" | "wake",
    extras?: Record<string, unknown>
) => ({
    alarmId: alarm.id,
    alarmLabel: alarm.label,
    type: NOTIFICATION_DATA_TYPES.SLEEP_ALARM,
    sleepEvent,
    ...extras,
});
export class PushSleepNotificationClient implements SleepNotificationClient {
    private notificationCallbacks: Map<string, (data: any) => void> = new Map();
    private actionCallbacks: Map<string, (data: any) => void> = new Map();
    private isConfigured = false;

    async initialize(): Promise<boolean> {
        return new Promise((resolve) => {
            if (this.isConfigured) {
                resolve(true);
                return;
            }
            Audio.setAudioModeAsync({
                allowsRecordingIOS: false,
                playsInSilentModeIOS: true,
                staysActiveInBackground: true,
                shouldDuckAndroid: true,
            }).catch(console.error);
            PushNotification.createChannel(
                {
                    channelId: NOTIFICATION_CONSTANTS.SLEEP_ALARM_CHANNEL_ID,
                    channelName: "Sleep Alarm Notifications",
                    channelDescription:
                        "Bedtime and wake-up alarm notifications",
                    playSound: true,
                    soundName: "wake_up.mp3",
                    importance: 4,
                    vibrate: true,
                },
                (created) =>
                    console.log(`📡 Sleep alarm channel created: ${created}`)
            );
            PushNotification.configure({
                onNotification: (notification) => {
                    const data = notification.data;
                    if (notification.userInteraction) {
                        this.handleUserAction(notification);
                        notification.finish("backgroundFetchResultNoData");
                        return;
                    }
                    this.notificationCallbacks.forEach((cb) => {
                        try {
                            cb({
                                alarmId: data.alarmId,
                                type: data.type,
                                sleepEvent: data.sleepEvent,
                                notificationId: data.notificationId,
                            });
                        } catch (error) {
                            console.error(
                                "❌ Error in notification callback:",
                                error
                            );
                        }
                    });
                    this.playAlarmSound(data);
                    notification.finish("backgroundFetchResultNoData");
                },
                onAction: (notification) => {
                    this.handleUserAction(notification);
                },
                popInitialNotification: true,
                requestPermissions: true,
                permissions: { alert: true, badge: true, sound: true },
            });
            this.isConfigured = true;
            resolve(true);
        });
    }

    private handleUserAction(notification: any): void {
        const data = notification?.data ?? notification?.userInfo ?? {};
        const action = notification?.action;
        void AlarmSoundService.stop();
        const notificationId = notification?.id ?? data?.notificationId;
        if (notificationId) {
            PushNotification.cancelLocalNotification(String(notificationId));
        }
        if (action === "Snooze") {
            const snoozeId = Math.floor(Math.random() * 1000000);
            // const snoozeDate = new Date(Date.now() + 10 * 60 * 1000);
            const snoozeDate = new Date(Date.now() + 10 * 1000);

            PushNotification.localNotificationSchedule({
                channelId: NOTIFICATION_CONSTANTS.SLEEP_ALARM_CHANNEL_ID,
                id: snoozeId,
                title: "⏰ Sleep Alarm Snoozed",
                message: "Alarm will ring again in 10 minutes!",
                playSound: true,
                soundName: "wake_up.mp3",
                actions: ["Snooze", "Stop"],
                date: snoozeDate,
                allowWhileIdle: true,
                priority: "high",
                vibrate: true,
                vibration: 300,
                invokeApp: true,
                ongoing: false,
                autoCancel: true,
                userInfo: { ...data, notificationId: snoozeId },
                data: { ...data, notificationId: snoozeId },
            });
        }
        if (action) {
            this.actionCallbacks.forEach((cb) => {
                try {
                    cb({
                        alarmId: data?.alarmId,
                        action,
                        type: data?.type,
                        sleepEvent: data?.sleepEvent,
                        extras: data,
                    });
                } catch (error) {
                    console.error("❌ Error in action callback:", error);
                }
            });
        }
    }

    private playAlarmSound(data: any): void {
        try {
            const alarmConfig = {
                sound: undefined,
                volume: 0.8,
                vibrate: true,
            } as any;
            void AlarmSoundService.start(alarmConfig);
        } catch (error) {
            console.error("❌ Error starting alarm sound:", error);
        }
    }

    private scheduleNotification(
        id: number,
        title: string,
        message: string,
        date: Date,
        data: any,
        repeatType?: "minute" | "hour" | "day" | "week"
    ): string {
        const notificationId = String(id);
        PushNotification.localNotificationSchedule({
            channelId: NOTIFICATION_CONSTANTS.SLEEP_ALARM_CHANNEL_ID,
            id,
            title,
            message,
            bigText: message,
            playSound: true,
            soundName: "wake_up.mp3",
            actions: ["Snooze", "Stop"],
            date,
            allowWhileIdle: true,
            priority: "high",
            vibrate: true,
            vibration: 300,
            invokeApp: true,
            ongoing: false,
            autoCancel: false,
            repeatType,
            userInfo: { ...data, notificationId },
            data: { ...data, notificationId },
        });
        return notificationId;
    }

    private async scheduleOnce(
        alarm: SleepAlarm,
        sleepDurationDisplay: string
    ): Promise<{ bedtimeIds: string[]; wakeIds: string[] }> {
        const bedtimeDate = getNextDateForTime(alarm.bedtime);
        const wakeReferenceDate = new Date(bedtimeDate);
        const wakeDate = getNextDateForTime(
            alarm.wakeUpTime,
            wakeReferenceDate
        );
        const bedtimeId = Math.floor(Math.random() * 1000000);
        const wakeId = Math.floor(Math.random() * 1000000);
        this.scheduleNotification(
            bedtimeId,
            "🛌 Bedtime Alarm",
            `It's time for bed. Sleep schedule: ${sleepDurationDisplay} hours.`,
            bedtimeDate,
            buildNotificationData(alarm, "bedtime")
        );
        this.scheduleNotification(
            wakeId,
            "☀️ Wake Up Alarm",
            "It's time to wake up. Have a great day!",
            wakeDate,
            buildNotificationData(alarm, "wake")
        );
        return { bedtimeIds: [String(bedtimeId)], wakeIds: [String(wakeId)] };
    }

    private async scheduleRepeating(
        alarm: SleepAlarm,
        sleepDurationDisplay: string,
        bedtimeHour: number,
        bedtimeMinute: number,
        wakeHour: number,
        wakeMinute: number
    ): Promise<{ bedtimeIds: string[]; wakeIds: string[] }> {
        const bedtimeIds: string[] = [];
        const wakeIds: string[] = [];
        const bedtimeTotalMinutes = bedtimeHour * 60 + bedtimeMinute;
        const wakeTotalMinutes = wakeHour * 60 + wakeMinute;
        for (const repeatDay of alarm.repeatDays!) {
            const wakeDay =
                wakeTotalMinutes >= bedtimeTotalMinutes
                    ? repeatDay
                    : getNextWeekDay(repeatDay);
            const bedtimeId = Math.floor(Math.random() * 1000000);
            const wakeId = Math.floor(Math.random() * 1000000);
            this.scheduleNotification(
                bedtimeId,
                "🛌 Bedtime Alarm",
                `It's time for bed. Sleep schedule: ${sleepDurationDisplay} hours.`,
                getDateForWeekDay(repeatDay, bedtimeHour, bedtimeMinute),
                buildNotificationData(alarm, "bedtime", { repeatDay }),
                "week"
            );
            this.scheduleNotification(
                wakeId,
                "☀️ Wake Up Alarm",
                "It's time to wake up. Have a great day!",
                getDateForWeekDay(wakeDay, wakeHour, wakeMinute),
                buildNotificationData(alarm, "wake", { repeatDay: wakeDay }),
                "week"
            );
            bedtimeIds.push(String(bedtimeId));
            wakeIds.push(String(wakeId));
        }
        return { bedtimeIds, wakeIds };
    }

    async scheduleSleepAlarm(
        alarm: SleepAlarm
    ): Promise<{ bedtimeIds: string[]; wakeIds: string[] }> {
        try {
            const sleepMinutes = getMinutesBetweenTimes(
                alarm.bedtime,
                alarm.wakeUpTime
            );
            const sleepDurationDisplay =
                formatDurationFromMinutes(sleepMinutes);

            const { hours: bedtimeHour, minutes: bedtimeMinute } =
                parseTimeString(alarm.bedtime);
            const { hours: wakeHour, minutes: wakeMinute } = parseTimeString(
                alarm.wakeUpTime
            );

            if (!alarm.repeatDays?.length) {
                return await this.scheduleOnce(alarm, sleepDurationDisplay);
            }

            return await this.scheduleRepeating(
                alarm,
                sleepDurationDisplay,
                bedtimeHour,
                bedtimeMinute,
                wakeHour,
                wakeMinute
            );
        } catch (error) {
            console.error(
                "❌ Error scheduling sleep alarm notifications:",
                error
            );
            throw error;
        }
    }

    async cancelNotifications(notificationIds: string[]): Promise<void> {
        if (!notificationIds.length) return;

        notificationIds.forEach((id) => {
            const numericId = parseInt(id, 10);
            if (!isNaN(numericId)) {
                PushNotification.cancelLocalNotification(numericId);
            }
        });
    }

    onNotificationReceived(
        callback: (data: {
            alarmId: string;
            type: string;
            sleepEvent?: "bedtime" | "wake";
        }) => void
    ): () => void {
        const id = Math.random().toString(36);
        this.notificationCallbacks.set(id, callback);
        return () => this.notificationCallbacks.delete(id);
    }

    onNotificationAction(
        callback: (data: {
            alarmId: string;
            action: string;
            type?: string;
            sleepEvent?: "bedtime" | "wake";
            extras?: Record<string, unknown>;
        }) => void
    ): () => void {
        const id = Math.random().toString(36);
        this.actionCallbacks.set(id, callback);
        return () => this.actionCallbacks.delete(id);
    }
}

// Export singleton instance
export default new PushSleepNotificationClient();
