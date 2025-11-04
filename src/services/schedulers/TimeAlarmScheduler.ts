import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import * as AlarmManager from "react-native-alarm-manager";
import { NOTIFICATION_CONTENT } from "../../shared/constants/notificationConstants";
import { ALARM_CHANNEL_ID } from "../../shared/helpers/NotificationChannels";
import { TimeAlarm } from "../../shared/types/alarm.type";
import { NotificationUtils } from "../../shared/utils/NotificationUtils";
import { AlarmScheduler, SchedulingResult } from "./AlarmScheduler";

export class TimeAlarmScheduler implements AlarmScheduler {
    private async createContent(alarm: TimeAlarm): Promise<Notifications.NotificationContentInput> {
        return {
            title: NOTIFICATION_CONTENT.TIME_ALARM.title,
            body: alarm.label || NOTIFICATION_CONTENT.TIME_ALARM.body,
            sound: true,
            priority: Notifications.AndroidNotificationPriority.MAX,
            data: { alarmId: alarm.id }
        };
    }

    private async scheduleIOS(alarm: TimeAlarm): Promise<string> {
        const triggerDate = NotificationUtils.calculateNextTriggerDate(alarm);
        if (!triggerDate) throw new Error("Cannot calculate trigger date");

        const content = await this.createContent(alarm);
        const trigger: Notifications.DateTriggerInput = {
            type: Notifications.SchedulableTriggerInputTypes.DATE,
            channelId: ALARM_CHANNEL_ID,
            date: triggerDate,
        };

        const notificationId = await Notifications.scheduleNotificationAsync({
            content,
            trigger,
        });
        return notificationId;
    }

    private async scheduleAndroid(alarm: TimeAlarm): Promise<string> {
        const triggerDate = NotificationUtils.calculateNextTriggerDate(alarm);
        if (!triggerDate) throw new Error("Cannot calculate trigger date");

        const alarmTime = `${String(triggerDate.getHours()).padStart(2, "0")}:${String(
            triggerDate.getMinutes()
        ).padStart(2, "0")}:00`;

        console.log("Alarm time:", alarmTime);
        return new Promise((resolve, reject) => {
            AlarmManager.schedule(
                {
                    alarm_time: alarmTime,
                    alarm_title: NOTIFICATION_CONTENT.TIME_ALARM.title,
                    alarm_text: alarm.label || NOTIFICATION_CONTENT.TIME_ALARM.body,
                    alarm_sound: "alarm_sound.mp3",
                    alarm_icon: "ic_launcher",
                    alarm_sound_loop: true,
                    alarm_vibration: true,
                    alarm_noti_removable: false,
                    alarm_activate: true,
                },
                (msg) => {
                    console.log("✅ Alarm scheduled:", msg);
                    resolve(alarm.id);
                },
                (err) => {
                    console.error("❌ Failed to schedule:", err);
                    reject(err);
                }
            );
        });
    }

    async schedule(alarm: TimeAlarm): Promise<SchedulingResult> {
        try {
            console.log("🔔 Scheduling time alarm:", alarm);
            const notificationId = Platform.OS === "android"
                ? await this.scheduleAndroid(alarm)
                : await this.scheduleIOS(alarm);

            return { notificationIds: [notificationId] };
        } catch (error) {
            console.error("❌ Error scheduling time alarm:", error);
            throw error;
        }
    }
}