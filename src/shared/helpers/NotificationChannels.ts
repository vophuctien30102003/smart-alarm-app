import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

const ALARM_CHANNEL_ID = "alarms";
const LOCATION_ALARM_CHANNEL_ID = "location-alarms";
const NOTIFICATION_VIBRATION_PATTERN = [0, 250, 250, 250];

export class NotificationChannels {
    static async setup(): Promise<void> {
        if (Platform.OS !== "android") return;

        await Notifications.setNotificationChannelAsync(ALARM_CHANNEL_ID, {
            name: "Alarm Notifications",
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: NOTIFICATION_VIBRATION_PATTERN,
            lightColor: "#FF231F7C",
            sound: "default",
            enableVibrate: true,
            bypassDnd: true,
        });

        await Notifications.setNotificationChannelAsync(LOCATION_ALARM_CHANNEL_ID, {
            name: "Location Alarm Notifications",
            importance: Notifications.AndroidImportance.HIGH,
            vibrationPattern: NOTIFICATION_VIBRATION_PATTERN,
            lightColor: "#FF6B35",
            sound: "default",
            enableVibrate: true,
        });
    }
}

export { ALARM_CHANNEL_ID, LOCATION_ALARM_CHANNEL_ID, NOTIFICATION_VIBRATION_PATTERN };
