import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { NOTIFICATION_DATA_TYPES } from "../shared/constants";
import { NotificationChannels } from "../shared/helpers/NotificationChannels";
import { LocationAlarm, TimeAlarm } from "../shared/types/alarm.type";
import { LocationAlarmScheduler } from "./schedulers/LocationAlarmScheduler";

Notifications.setNotificationHandler({
    handleNotification: async () => {
        const baseResponse = {
            shouldPlaySound: true,
            shouldSetBadge: false,
            shouldShowBanner: true,
            shouldShowList: true,
        };

        if (Platform.OS === "android") {
            return {
                ...baseResponse,
                shouldShowList: false,
            };
        }

        return baseResponse;
    },
});

export class NotificationManager {
    private static instance: NotificationManager;
    private expoPushToken: string | null = null;
    private isInitialized: boolean = false;
    private initializationPromise: Promise<boolean> | null = null;

    private locationAlarmScheduler: LocationAlarmScheduler;

    private constructor() {
        this.locationAlarmScheduler = new LocationAlarmScheduler();
    }

    static getInstance(): NotificationManager {
        if (!NotificationManager.instance) {
            NotificationManager.instance = new NotificationManager();
        }
        return NotificationManager.instance;
    }

    async initialize(): Promise<boolean> {
        if (this.isInitialized) {
            return true;
        }

        if (this.initializationPromise) {
            return this.initializationPromise;
        }

        this.initializationPromise = this.setupNotificationChannels()
            .then(() => {
                this.isInitialized = true;
                return true;
            })
            .catch((error) => {
                console.error("❌ Failed to initialize NotificationManager:", error);
                this.isInitialized = false;
                return false;
            });

        const result = await this.initializationPromise;
        this.isInitialized = result;
        return result;
    }
    private async setupNotificationChannels(): Promise<void> {
        await NotificationChannels.setup();
    }
    
    // Note: Sleep alarm notifications are handled by PushSleepNotificationClient
    // See: src/services/notifications/PushSleepNotificationClient.ts

    /**
     * Schedule a time-based alarm notification
     * @param alarm TimeAlarm to schedule
     * @returns notification ID
     */
    async scheduleAlarmNotification(alarm: TimeAlarm): Promise<string> {
        try {
            await this.initialize();

            const trigger: Notifications.NotificationTriggerInput = {
                type: Notifications.SchedulableTriggerInputTypes.DATE,
                date: new Date(alarm.time),
            };

            const content: Notifications.NotificationContentInput = {
                title: alarm.label || "⏰ Alarm",
                body: "Time to wake up!",
                sound: true,
                priority: Notifications.AndroidNotificationPriority.MAX,
                data: {
                    alarmId: alarm.id,
                    type: NOTIFICATION_DATA_TYPES.TIME_ALARM,
                },
            };

            const notificationId = await Notifications.scheduleNotificationAsync({
                content,
                trigger,
            });

            console.log(`📅 Scheduled time alarm notification: ${notificationId}`);
            return notificationId;
        } catch (error) {
            console.error("❌ Error scheduling time alarm notification:", error);
            throw error;
        }
    }
    
    async cancelAlarmNotification(notificationId: string): Promise<void> {
        try {
            await Notifications.cancelScheduledNotificationAsync(notificationId);
            console.log(`📅 Cancelled notification: ${notificationId}`);
        } catch (error) {
            console.error(`❌ Error cancelling notification ${notificationId}:`, error);
            throw error;
        }
    }
    async cancelAllAlarmNotifications(): Promise<void> {
        try {
            await Notifications.cancelAllScheduledNotificationsAsync();
            console.log("📅 Cancelled all notifications");
        } catch (error) {
            console.error("❌ Error cancelling all notifications:", error);
            throw error;
        }
    }
    async showLocationAlarmNotification(
        alarm: LocationAlarm,
        title: string,
        body: string
    ): Promise<void> {
        try {
            await this.initialize();
            await this.locationAlarmScheduler.schedule(alarm, title, body);
        } catch (error) {
            console.error("❌ Error showing location alarm notification:", error);
        }
    }
    async getScheduledNotifications(): Promise<
        Notifications.NotificationRequest[]
    > {
        try {
            const notifications =
                await Notifications.getAllScheduledNotificationsAsync();
            console.log(
                `📅 Found ${notifications.length} scheduled notifications`
            );
            return notifications;
        } catch (error) {
            console.error("❌ Error getting scheduled notifications:", error);
            return [];
        }
    }
    addNotificationResponseListener(
        callback: (response: Notifications.NotificationResponse) => void
    ) {
        return Notifications.addNotificationResponseReceivedListener(
            (response) => {
                try {
                    callback(response);
                } catch (error) {
                    console.error("❌ Error handling notification response:", error);
                }
            }
        );
    }
    addNotificationReceivedListener(
        callback: (notification: Notifications.Notification) => void
    ) {
        return Notifications.addNotificationReceivedListener((notification) => {
            try {
                callback(notification);
            } catch (error) {
                console.error("❌ Error handling notification received:", error);
            }
        });
    }
    async getNotificationStatus(): Promise<{
        isInitialized: boolean;
        hasToken: boolean;
        permissions: Notifications.NotificationPermissionsStatus;
        scheduledCount: number;
    }> {
        try {
            const permissions = await Notifications.getPermissionsAsync();
            const scheduled = await this.getScheduledNotifications();
            return {
                isInitialized: this.isInitialized,
                hasToken: !!this.expoPushToken,
                permissions,
                scheduledCount: scheduled.length,
            };
        } catch (error) {
            console.error("❌ Error getting notification status:", error);
            return {
                isInitialized: false,
                hasToken: false,
                permissions: { status: "undetermined" } as any,
                scheduledCount: 0,
            };
        }
    }
    getExpoPushToken(): string | null {
        return this.expoPushToken;
    }
}
export default NotificationManager.getInstance();
