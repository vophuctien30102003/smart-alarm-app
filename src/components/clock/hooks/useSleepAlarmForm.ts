import { WeekDay } from "@/shared/enums";
import type { SleepAlarmFormData } from "@/shared/types/sleepAlarmForm.type";
import { addMinutesToTimeString, formatDurationFromMinutes, getMinutesBetweenTimes } from "@/shared/utils/timeUtils";
import { useCallback, useMemo, useState } from "react";

export type PickerTarget = "bedtime" | "wake" | null;

const DEFAULT_BEDTIME = "22:15";
const DEFAULT_WAKE_TIME = "06:15";
const DEFAULT_SNOOZE_MINUTES = 10;
const DEFAULT_VOLUME = 0.8;
const DEFAULT_SOUND_ID = "sound_0";
const DEFAULT_GENTLE_WAKE_MINUTES = 0;
const DEFAULT_VIBRATE = true;
const DEFAULT_SNOOZE_ENABLED = true;

export interface UseSleepAlarmFormOptions {
    initialData?: Partial<SleepAlarmFormData>;
}

export function useSleepAlarmForm({ initialData }: UseSleepAlarmFormOptions = {}) {
    const [selectedDays, setSelectedDays] = useState<WeekDay[]>(initialData?.selectedDays ?? []);
    const [bedtime, setBedtime] = useState(initialData?.bedtime ?? DEFAULT_BEDTIME);
    const [wakeTime, setWakeTime] = useState(initialData?.wakeTime ?? DEFAULT_WAKE_TIME);
    const [label, setLabel] = useState(initialData?.label ?? "");
    const [snoozeEnabled, setSnoozeEnabled] = useState(initialData?.snoozeEnabled ?? DEFAULT_SNOOZE_ENABLED);
    const [snoozeMinutes, setSnoozeMinutes] = useState(initialData?.snoozeMinutes ?? DEFAULT_SNOOZE_MINUTES);
    const [volume, setVolume] = useState(initialData?.volume ?? DEFAULT_VOLUME);
    const [soundId, setSoundId] = useState(initialData?.soundId ?? DEFAULT_SOUND_ID);
    const [gentleWakeMinutes, setGentleWakeMinutes] = useState(initialData?.gentleWakeMinutes ?? DEFAULT_GENTLE_WAKE_MINUTES);
    const [vibrate, setVibrate] = useState(initialData?.vibrate ?? DEFAULT_VIBRATE);
    const [isPickerVisibleFor, setPickerVisibleFor] = useState<PickerTarget>(null);

    const sleepMinutes = useMemo(() => getMinutesBetweenTimes(bedtime, wakeTime), [bedtime, wakeTime]);
    const sleepDuration = useMemo(() => formatDurationFromMinutes(sleepMinutes), [sleepMinutes]);

    const toggleDay = useCallback((day: WeekDay) => {
        setSelectedDays(prev => prev.includes(day)
            ? prev.filter(d => d !== day)
            : [...prev, day]
        );
    }, []);

    const adjustBedtime = useCallback((delta: number) => {
        setBedtime(prev => addMinutesToTimeString(prev, delta));
    }, []);

    const adjustWakeTime = useCallback((delta: number) => {
        setWakeTime(prev => addMinutesToTimeString(prev, delta));
    }, []);

    const createFormData = useCallback((): SleepAlarmFormData => ({
        selectedDays,
        bedtime,
        wakeTime,
        goalMinutes: sleepMinutes,
        label,
        snoozeMinutes: snoozeEnabled ? snoozeMinutes : 0,
        snoozeEnabled,
        volume,
        soundId,
        gentleWakeMinutes,
        vibrate,
    }), [bedtime, gentleWakeMinutes, label, selectedDays, sleepMinutes, snoozeEnabled, snoozeMinutes, soundId, vibrate, volume, wakeTime]);

    return {
        state: {
            selectedDays,
            bedtime,
            wakeTime,
            goalMinutes: sleepMinutes,
            label,
            snoozeMinutes,
            snoozeEnabled,
            volume,
            soundId,
            gentleWakeMinutes,
            vibrate,
            sleepMinutes,
            sleepDuration,
            isPickerVisibleFor,
        },
        actions: {
            setSelectedDays,
            setBedtime,
            setWakeTime,
            setLabel,
            setSnoozeMinutes,
            setSnoozeEnabled,
            setVolume,
            setSoundId,
            setGentleWakeMinutes,
            setVibrate,
            setPickerVisibleFor,
            toggleDay,
            adjustBedtime,
            adjustWakeTime,
            createFormData,
        },
    } as const;
}
