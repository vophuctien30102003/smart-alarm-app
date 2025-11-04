import * as Notifications from "expo-notifications";
import { NOTIFICATION_DATA_TYPES } from "../../shared/constants/alarmDefaults";
import { LocationAlarm } from "../../shared/types/alarm.type";
import { AlarmScheduler, SchedulingResult } from "./AlarmScheduler";

export class LocationAlarmScheduler implements AlarmScheduler {
    private createContent(alarm: LocationAlarm, title: string, body: string): Notifications.NotificationContentInput {
        return {
            title,
            body,
            sound: true,
            priority: Notifications.AndroidNotificationPriority.HIGH,
            data: {
                alarmId: alarm.id,
                alarmLabel: alarm.label,
                alarmType: "location",
                locationAddress: alarm.targetLocation?.address,
                type: NOTIFICATION_DATA_TYPES.LOCATION_ALARM,
            },
        };
    }

    async schedule(alarm: LocationAlarm, title: string, body: string): Promise<SchedulingResult> {
        try {
            const content = this.createContent(alarm, title, body);
            const notificationId = await Notifications.scheduleNotificationAsync({
                content,
                trigger: null,
            });
            return { notificationIds: [notificationId] };
        } catch (error) {
            console.error("❌ Error showing location alarm notification:", error);
            throw error;
        }
    }
}