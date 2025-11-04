import { WeekDay } from '@/shared/enums';
import type { SleepAlarmFormData } from '@/shared/types/sleepAlarmForm.type';
import { addMinutesToTimeString, formatDurationFromMinutes, getMinutesBetweenTimes } from '@/shared/utils/timeUtils';
import { useCallback, useMemo, useReducer } from 'react';

export type PickerTarget = 'bedtime' | 'wake' | null;

const DEFAULT_BEDTIME = '22:15';
const DEFAULT_WAKE_TIME = '06:15';
const DEFAULT_SNOOZE_MINUTES = 10;
const DEFAULT_VOLUME = 0.8;
const DEFAULT_SOUND_ID = 'sound_0';
const DEFAULT_GENTLE_WAKE_MINUTES = 0;
const DEFAULT_VIBRATE = true;
const DEFAULT_SNOOZE_ENABLED = true;

export interface UseSleepAlarmFormOptions {
    initialData?: Partial<SleepAlarmFormData>;
}

interface FormState {
    selectedDays: WeekDay[];
    bedtime: string;
    wakeTime: string;
    label: string;
    snoozeEnabled: boolean;
    snoozeMinutes: number;
    volume: number;
    soundId: string;
    gentleWakeMinutes: number;
    vibrate: boolean;
    isPickerVisibleFor: PickerTarget;
}

type FormAction =
    | { type: 'SET_DAYS'; payload: WeekDay[] }
    | { type: 'TOGGLE_DAY'; payload: WeekDay }
    | { type: 'SET_BEDTIME'; payload: string }
    | { type: 'SET_WAKE_TIME'; payload: string }
    | { type: 'ADJUST_BEDTIME'; payload: number }
    | { type: 'ADJUST_WAKE_TIME'; payload: number }
    | { type: 'SET_LABEL'; payload: string }
    | { type: 'SET_SNOOZE_ENABLED'; payload: boolean }
    | { type: 'SET_SNOOZE_MINUTES'; payload: number }
    | { type: 'SET_VOLUME'; payload: number }
    | { type: 'SET_SOUND_ID'; payload: string }
    | { type: 'SET_GENTLE_WAKE_MINUTES'; payload: number }
    | { type: 'SET_VIBRATE'; payload: boolean }
    | { type: 'SET_PICKER_VISIBLE'; payload: PickerTarget };

function formReducer(state: FormState, action: FormAction): FormState {
    switch (action.type) {
        case 'SET_DAYS':
            return { ...state, selectedDays: action.payload };
        case 'TOGGLE_DAY':
            return {
                ...state,
                selectedDays: state.selectedDays.includes(action.payload)
                    ? state.selectedDays.filter(d => d !== action.payload)
                    : [...state.selectedDays, action.payload],
            };
        case 'SET_BEDTIME':
            return { ...state, bedtime: action.payload };
        case 'SET_WAKE_TIME':
            return { ...state, wakeTime: action.payload };
        case 'ADJUST_BEDTIME':
            return { ...state, bedtime: addMinutesToTimeString(state.bedtime, action.payload) };
        case 'ADJUST_WAKE_TIME':
            return { ...state, wakeTime: addMinutesToTimeString(state.wakeTime, action.payload) };
        case 'SET_LABEL':
            return { ...state, label: action.payload };
        case 'SET_SNOOZE_ENABLED':
            return { ...state, snoozeEnabled: action.payload };
        case 'SET_SNOOZE_MINUTES':
            return { ...state, snoozeMinutes: action.payload };
        case 'SET_VOLUME':
            return { ...state, volume: action.payload };
        case 'SET_SOUND_ID':
            return { ...state, soundId: action.payload };
        case 'SET_GENTLE_WAKE_MINUTES':
            return { ...state, gentleWakeMinutes: action.payload };
        case 'SET_VIBRATE':
            return { ...state, vibrate: action.payload };
        case 'SET_PICKER_VISIBLE':
            return { ...state, isPickerVisibleFor: action.payload };
        default:
            return state;
    }
}

export function useSleepAlarmForm({ initialData }: UseSleepAlarmFormOptions = {}) {
    const [state, dispatch] = useReducer(formReducer, {
        selectedDays: initialData?.selectedDays ?? [],
        bedtime: initialData?.bedtime ?? DEFAULT_BEDTIME,
        wakeTime: initialData?.wakeTime ?? DEFAULT_WAKE_TIME,
        label: initialData?.label ?? '',
        snoozeEnabled: initialData?.snoozeEnabled ?? DEFAULT_SNOOZE_ENABLED,
        snoozeMinutes: initialData?.snoozeMinutes ?? DEFAULT_SNOOZE_MINUTES,
        volume: initialData?.volume ?? DEFAULT_VOLUME,
        soundId: initialData?.soundId ?? DEFAULT_SOUND_ID,
        gentleWakeMinutes: initialData?.gentleWakeMinutes ?? DEFAULT_GENTLE_WAKE_MINUTES,
        vibrate: initialData?.vibrate ?? DEFAULT_VIBRATE,
        isPickerVisibleFor: null,
    });

    const sleepMinutes = useMemo(
        () => getMinutesBetweenTimes(state.bedtime, state.wakeTime),
        [state.bedtime, state.wakeTime]
    );
    const sleepDuration = useMemo(() => formatDurationFromMinutes(sleepMinutes), [sleepMinutes]);

    const toggleDay = useCallback((day: WeekDay) => {
        dispatch({ type: 'TOGGLE_DAY', payload: day });
    }, []);

    const adjustBedtime = useCallback((delta: number) => {
        dispatch({ type: 'ADJUST_BEDTIME', payload: delta });
    }, []);

    const adjustWakeTime = useCallback((delta: number) => {
        dispatch({ type: 'ADJUST_WAKE_TIME', payload: delta });
    }, []);

    const createFormData = useCallback((): SleepAlarmFormData => ({
        selectedDays: state.selectedDays,
        bedtime: state.bedtime,
        wakeTime: state.wakeTime,
        goalMinutes: sleepMinutes,
        label: state.label,
        snoozeMinutes: state.snoozeEnabled ? state.snoozeMinutes : 0,
        snoozeEnabled: state.snoozeEnabled,
        volume: state.volume,
        soundId: state.soundId,
        gentleWakeMinutes: state.gentleWakeMinutes,
        vibrate: state.vibrate,
    }), [state, sleepMinutes]);

    return {
        state: {
            ...state,
            goalMinutes: sleepMinutes,
            sleepMinutes,
            sleepDuration,
        },
        actions: {
            setSelectedDays: useCallback((days: WeekDay[]) => dispatch({ type: 'SET_DAYS', payload: days }), []),
            setBedtime: useCallback((time: string) => dispatch({ type: 'SET_BEDTIME', payload: time }), []),
            setWakeTime: useCallback((time: string) => dispatch({ type: 'SET_WAKE_TIME', payload: time }), []),
            setLabel: useCallback((label: string) => dispatch({ type: 'SET_LABEL', payload: label }), []),
            setSnoozeMinutes: useCallback((mins: number) => dispatch({ type: 'SET_SNOOZE_MINUTES', payload: mins }), []),
            setSnoozeEnabled: useCallback((enabled: boolean) => dispatch({ type: 'SET_SNOOZE_ENABLED', payload: enabled }), []),
            setVolume: useCallback((vol: number) => dispatch({ type: 'SET_VOLUME', payload: vol }), []),
            setSoundId: useCallback((id: string) => dispatch({ type: 'SET_SOUND_ID', payload: id }), []),
            setGentleWakeMinutes: useCallback((mins: number) => dispatch({ type: 'SET_GENTLE_WAKE_MINUTES', payload: mins }), []),
            setVibrate: useCallback((vib: boolean) => dispatch({ type: 'SET_VIBRATE', payload: vib }), []),
            setPickerVisibleFor: useCallback((target: PickerTarget) => dispatch({ type: 'SET_PICKER_VISIBLE', payload: target }), []),
            toggleDay,
            adjustBedtime,
            adjustWakeTime,
            createFormData,
        },
    } as const;
}
