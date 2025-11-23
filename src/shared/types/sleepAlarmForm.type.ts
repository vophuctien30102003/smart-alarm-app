import { WeekDay } from "@/shared/enums";

export interface SleepAlarmFormData {
    bedtime: string;
    wakeTime: string;
    selectedDays: WeekDay[];
    goalMinutes: number;
    label?: string;
    snoozeEnabled: boolean;
    soundId: string;
}

export interface SleepAlarmFormOptions {
    gentleWakeChoices: number[];
    snoozeChoices: number[];
}
