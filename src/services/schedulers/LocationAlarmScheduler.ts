import { resolveSound } from "@/shared/utils/soundUtils";
import PushNotification from "react-native-push-notification";
import {
    NOTIFICATION_CONSTANTS,
    NOTIFICATION_DATA_TYPES,
} from "../../shared/constants/alarmDefaults";
import { LocationAlarm } from "../../shared/types/alarm.type";
import pushSleepNotificationClient from "../notifications/PushSleepNotificationClient";
import { AlarmScheduler, SchedulingResult } from "./AlarmScheduler";

export class LocationAlarmScheduler implements AlarmScheduler {
    private isChannelCreated = false;
    private currentChannelSound: string | null = null;

    private ensureChannel(soundName: string): void {
        if (this.isChannelCreated && this.currentChannelSound === soundName) {
            return;
        }

        if (this.isChannelCreated && this.currentChannelSound !== soundName) {
            PushNotification.deleteChannel(
                NOTIFICATION_CONSTANTS.LOCATION_ALARM_CHANNEL_ID
            );
            this.isChannelCreated = false;
            this.currentChannelSound = null;
        }

        if (this.isChannelCreated) {
            return;
        }

        PushNotification.createChannel(
            {
                channelId: NOTIFICATION_CONSTANTS.LOCATION_ALARM_CHANNEL_ID,
                channelName: "Location Alarm Notifications",
                channelDescription: "Alerts triggered by location-based alarms",
                playSound: true,
                loopSound: true,
                soundName,
                importance: 4,
                vibrate: true,
            },
            (created) => {
                this.isChannelCreated = true;
                this.currentChannelSound = soundName;
                console.log(`📡 Location alarm channel created: ${created}`);
            }
        );
    }

    private async ensureConfigured(soundName: string): Promise<void> {
        await pushSleepNotificationClient.initialize();
        this.ensureChannel(soundName);
    }

    private buildNotificationData(alarm: LocationAlarm) {
        return {
            alarmId: alarm.id,
            alarmLabel: alarm.label,
            alarmType: "location",
            locationAddress: alarm.targetLocation?.address,
            type: NOTIFICATION_DATA_TYPES.LOCATION_ALARM,
        };
    }

    async schedule(
        alarm: LocationAlarm,
        title: string,
        body: string
    ): Promise<SchedulingResult> {
        try {
            const notificationId = Math.floor(Math.random() * 1000000).toString();
            const data = this.buildNotificationData(alarm);
            const sound = resolveSound(alarm.sound?.id);
            const soundName =  "alarm_clock.mp3";
            

            await this.ensureConfigured(soundName);

            PushNotification.localNotification({
                channelId: NOTIFICATION_CONSTANTS.LOCATION_ALARM_CHANNEL_ID,
                id: notificationId,
                title,
                message: body,
                bigText: body,
                playSound: true,
                soundName,
                priority: "high",
                importance: 4,
                vibrate: true,
                vibration: 300,
                allowWhileIdle: true,
                invokeApp: true,
                autoCancel: true,
                actions: ["Stop"],
                userInfo: { ...data, notificationId },
                data: { ...data, notificationId },
            });

            return { notificationIds: [notificationId] };
        } catch (error) {
            console.error("❌ Error showing location alarm notification:", error);
            throw error;
        }
    }

    async cancel(notificationIds: string[] = []): Promise<void> {
        if (!notificationIds.length) return;

        notificationIds.forEach((id) => {
            const numericId = parseInt(id, 10);
            if (!Number.isNaN(numericId)) {
                PushNotification.cancelLocalNotification(String(numericId));
            } else {
                PushNotification.cancelLocalNotification(id);
            }
        });
    }
}