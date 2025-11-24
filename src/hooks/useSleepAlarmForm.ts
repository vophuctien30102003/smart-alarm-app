import { WeekDay } from '@/shared/enums';
import type { SleepAlarmFormData } from '@/shared/types/sleepAlarmForm.type';
import { getDefaultSound } from '@/shared/utils/soundUtils';
import { addMinutesToTimeString, formatDurationFromMinutes, getMinutesBetweenTimes } from '@/shared/utils/timeUtils';
import { useMemo, useReducer } from 'react';

export type PickerTarget = 'bedtime' | 'wake' | null;

const DEFAULTS = {
  BEDTIME: new Date().getHours() < 12 ? '22:30' : '23:30',
  WAKE_TIME: new Date().getHours() < 12 ? '07:00' : '08:00',
  SOUND_ID: getDefaultSound().id,
  SNOOZE_ENABLED: true,
  LABEL: 'Alarm',
} as const;

export interface UseSleepAlarmFormOptions {
  initialData?: Partial<SleepAlarmFormData>;
}

interface FormState {
  selectedDays: WeekDay[];
  bedtime: string;
  wakeTime: string;
  label: string;
  snoozeEnabled: boolean;
  soundId: string;
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
  | { type: 'SET_SOUND_ID'; payload: string }
  | { type: 'SET_PICKER_VISIBLE'; payload: PickerTarget };

function formReducer(state: FormState, action: FormAction): FormState {
  switch (action.type) {
    case 'SET_DAYS': return { ...state, selectedDays: action.payload };
    case 'TOGGLE_DAY':
      return {
        ...state,
        selectedDays: state.selectedDays.includes(action.payload)
          ? state.selectedDays.filter(d => d !== action.payload)
          : [...state.selectedDays, action.payload],
      };
    case 'SET_BEDTIME': return { ...state, bedtime: action.payload };
    case 'SET_WAKE_TIME': return { ...state, wakeTime: action.payload };
    case 'ADJUST_BEDTIME': return { ...state, bedtime: addMinutesToTimeString(state.bedtime, action.payload) };
    case 'ADJUST_WAKE_TIME': return { ...state, wakeTime: addMinutesToTimeString(state.wakeTime, action.payload) };
    case 'SET_LABEL': return { ...state, label: action.payload };
    case 'SET_SNOOZE_ENABLED': return { ...state, snoozeEnabled: action.payload };
    case 'SET_SOUND_ID': return { ...state, soundId: action.payload };
    case 'SET_PICKER_VISIBLE': return { ...state, isPickerVisibleFor: action.payload };
    default: return state;
  }
}

export function useSleepAlarmForm({ initialData }: UseSleepAlarmFormOptions = {}) {
  const [state, dispatch] = useReducer(formReducer, {
    selectedDays: initialData?.selectedDays ?? [],
    bedtime: initialData?.bedtime ?? DEFAULTS.BEDTIME,
    wakeTime: initialData?.wakeTime ?? DEFAULTS.WAKE_TIME,
    label: initialData?.label ?? DEFAULTS.LABEL,
    snoozeEnabled: initialData?.snoozeEnabled ?? DEFAULTS.SNOOZE_ENABLED,
    soundId: initialData?.soundId ?? DEFAULTS.SOUND_ID,
    isPickerVisibleFor: null,
  });

  const sleepMinutes = useMemo(
    () => getMinutesBetweenTimes(state.bedtime, state.wakeTime),
    [state.bedtime, state.wakeTime]
  );

  const sleepDuration = useMemo(() => formatDurationFromMinutes(sleepMinutes), [sleepMinutes]);

  const actions = useMemo(() => ({
    setSelectedDays: (days: WeekDay[]) => dispatch({ type: 'SET_DAYS', payload: days }),
    setBedtime: (time: string) => dispatch({ type: 'SET_BEDTIME', payload: time }),
    setWakeTime: (time: string) => dispatch({ type: 'SET_WAKE_TIME', payload: time }),
    setLabel: (label: string) => dispatch({ type: 'SET_LABEL', payload: label }),
    setSnoozeEnabled: (enabled: boolean) => dispatch({ type: 'SET_SNOOZE_ENABLED', payload: enabled }),
    setSoundId: (id: string) => dispatch({ type: 'SET_SOUND_ID', payload: id }),
    setPickerVisibleFor: (target: PickerTarget) => dispatch({ type: 'SET_PICKER_VISIBLE', payload: target }),
    toggleDay: (day: WeekDay) => dispatch({ type: 'TOGGLE_DAY', payload: day }),
    adjustBedtime: (delta: number) => dispatch({ type: 'ADJUST_BEDTIME', payload: delta }),
    adjustWakeTime: (delta: number) => dispatch({ type: 'ADJUST_WAKE_TIME', payload: delta }),
    createFormData: (): SleepAlarmFormData => ({
      selectedDays: state.selectedDays,
      bedtime: state.bedtime,
      wakeTime: state.wakeTime,
      goalMinutes: sleepMinutes,
      label: state.label.trim() || undefined,
      snoozeEnabled: state.snoozeEnabled,
      soundId: state.soundId,
    }),
  }), [state, sleepMinutes]);

  return {
    state: { ...state, goalMinutes: sleepMinutes, sleepMinutes, sleepDuration },
    actions,
  } as const;
}
