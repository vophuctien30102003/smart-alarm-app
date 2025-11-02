import { LocationAlarm, SleepAlarm, TimeAlarm } from "../../shared/types/alarm.type";

export interface AlarmScheduler {
    schedule(alarm: TimeAlarm | SleepAlarm | LocationAlarm, ...args: any[]): Promise<any>;
    cancel?(notificationIds: string[]): Promise<void>;
}

export interface SchedulingResult {
    notificationIds?: string[];
    bedtimeIds?: string[];
    wakeIds?: string[];
}