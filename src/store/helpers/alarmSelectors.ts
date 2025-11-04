import type { Alarm, AlarmStore, LocationAlarm, SleepAlarm, TimeAlarm } from '@/shared/types/alarm.type';
import { isLocationAlarm, isSleepAlarm, isTimeAlarm } from '@/shared/types/alarm.type';

export const selectAlarms = (state: AlarmStore) => state.alarms;
export const selectAlarmById = (id: string) => (state: AlarmStore) => 
  state.alarms.find(alarm => alarm.id === id);
export const selectSleepAlarms = (state: AlarmStore): SleepAlarm[] => 
  state.alarms.filter(isSleepAlarm);

export const selectTimeAlarms = (state: AlarmStore): TimeAlarm[] =>
  state.alarms.filter(isTimeAlarm);

export const selectLocationAlarms = (state: AlarmStore): LocationAlarm[] =>
  state.alarms.filter(isLocationAlarm);

export const selectActiveAlarms = (state: AlarmStore) => 
  state.alarms.filter(a => a.isEnabled);

export const selectActiveAlarmState = (state: AlarmStore) => ({
  activeAlarm: state.activeAlarm,
  isPlaying: state.isPlaying,
  isSnoozed: state.isSnoozed,
  snoozeCount: state.snoozeCount,
});

export const getAlarmPriority = (alarm: Alarm): number => {
  if (isTimeAlarm(alarm)) return 0;
  if (isSleepAlarm(alarm)) return 1;
  if (isLocationAlarm(alarm)) return 2;
  return 3;
};

export const sortAlarmsByPriority = (alarms: Alarm[]): Alarm[] => {
  return [...alarms].sort((a, b) => {
    const priorityDiff = getAlarmPriority(a) - getAlarmPriority(b);
    if (priorityDiff !== 0) return priorityDiff;

    if (isTimeAlarm(a) && isTimeAlarm(b)) {
      return a.time.localeCompare(b.time);
    }
    if (isSleepAlarm(a) && isSleepAlarm(b)) {
      return a.bedtime.localeCompare(b.bedtime);
    }
    if (isLocationAlarm(a) && isLocationAlarm(b)) {
      return a.label.localeCompare(b.label);
    }
    return 0;
  });
};