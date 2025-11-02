import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { NotificationChannels } from "../shared/helpers/NotificationChannels";
import { LocationAlarm, SleepAlarm, TimeAlarm } from "../shared/types/alarm.type";
import { LocationAlarmScheduler } from "./schedulers/LocationAlarmScheduler";
import { SleepAlarmScheduler } from "./schedulers/SleepAlarmScheduler";
import { TimeAlarmScheduler } from "./schedulers/TimeAlarmScheduler";

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

    private timeAlarmScheduler: TimeAlarmScheduler;
    private sleepAlarmScheduler: SleepAlarmScheduler;
    private locationAlarmScheduler: LocationAlarmScheduler;

    private constructor() {
        this.timeAlarmScheduler = new TimeAlarmScheduler();
        this.sleepAlarmScheduler = new SleepAlarmScheduler();
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
                console.log("✅ NotificationManager initialized successfully");
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
    async scheduleAlarmNotification(alarm: TimeAlarm): Promise<string | null> {
        try {
            await this.initialize();
            const result = await this.timeAlarmScheduler.schedule(alarm);
            return result.notificationIds?.[0] || null;
        } catch (error) {
            console.error("❌ Error scheduling alarm:", error);
            return null;
        }
    }

    async scheduleSleepAlarmNotifications(alarm: SleepAlarm): Promise<{
        bedtimeIds: string[];
        wakeIds: string[];
    }> {
        try {
            await this.initialize();
            const result = await this.sleepAlarmScheduler.schedule(alarm);
            return {
                bedtimeIds: result.bedtimeIds || [],
                wakeIds: result.wakeIds || [],
            };
        } catch (error) {
            console.error("❌ Error scheduling sleep alarm notifications:", error);
            return { bedtimeIds: [], wakeIds: [] };
        }
    }

    async cancelSleepAlarmNotifications(
        notificationIds: string[]
    ): Promise<void> {
        await this.sleepAlarmScheduler.cancel?.(notificationIds);
    }
    async cancelAlarmNotification(notificationId: string): Promise<void> {
        try {
            await Notifications.cancelScheduledNotificationAsync(notificationId);
            console.log(`📅 Cancelled notification: ${notificationId}`);
        } catch (error) {
            console.error(`❌ Error cancelling notification ${notificationId}:`, error);
            throw error; // Re-throw to let caller handle
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
