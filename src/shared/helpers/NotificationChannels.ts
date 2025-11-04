import { NOTIFICATION_CONSTANTS } from "@/shared/constants/alarmDefaults";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

export class NotificationChannels {
    static async setup(): Promise<void> {
        if (Platform.OS !== "android") return;

        await Notifications.setNotificationChannelAsync(
            NOTIFICATION_CONSTANTS.ALARM_CHANNEL_ID,
            {
                name: "Alarm Notifications",
                importance: Notifications.AndroidImportance.MAX,
                vibrationPattern: [...NOTIFICATION_CONSTANTS.VIBRATION_PATTERN],
                lightColor: "#FF231F7C",
                sound: "default",
                enableVibrate: true,
                bypassDnd: true,
            }
        );

        await Notifications.setNotificationChannelAsync(
            NOTIFICATION_CONSTANTS.LOCATION_ALARM_CHANNEL_ID,
            {
                name: "Location Alarm Notifications",
                importance: Notifications.AndroidImportance.HIGH,
                vibrationPattern: [...NOTIFICATION_CONSTANTS.VIBRATION_PATTERN],
                lightColor: "#FF6B35",
                sound: "default",
                enableVibrate: true,
            }
        );
    }
}
