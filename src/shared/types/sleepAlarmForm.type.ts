import { WeekDay } from "@/shared/enums";

export interface SleepAlarmFormData {
    bedtime: string;
    wakeTime: string;
    selectedDays: WeekDay[];
    goalMinutes: number;
    label?: string;
    snoozeMinutes: number;
    snoozeEnabled: boolean;
    volume: number;
    soundId: string;
    gentleWakeMinutes: number;
    vibrate: boolean;
}

export interface SleepAlarmFormOptions {
    gentleWakeChoices: number[];
    snoozeChoices: number[];
}
