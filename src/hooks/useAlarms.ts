import { useMemo } from 'react';
import { selectAlarms, useAlarmStore } from '../store/alarmStore';
import { sortAlarmsByPriority } from '../store/helpers/alarmSelectors';

export const useAlarms = () => {
  const alarms = useAlarmStore(selectAlarms);
  const addAlarm = useAlarmStore(state => state.addAlarm);
  const updateAlarm = useAlarmStore(state => state.updateAlarm);
  const deleteAlarm = useAlarmStore(state => state.deleteAlarm);
  const toggleAlarm = useAlarmStore(state => state.toggleAlarm);

  const sortedAlarms = useMemo(() => sortAlarmsByPriority(alarms || []), [alarms]);

  return { alarms: sortedAlarms, addAlarm, updateAlarm, deleteAlarm, toggleAlarm };
};

export const useActiveAlarm = () => {
  const activeAlarm = useAlarmStore(state => state.activeAlarm);
  const isPlaying = useAlarmStore(state => state.isPlaying);
  const isSnoozed = useAlarmStore(state => state.isSnoozed);
  const snoozeCount = useAlarmStore(state => state.snoozeCount);
  const stopAlarm = useAlarmStore(state => state.stopAlarm);
  const snoozeAlarm = useAlarmStore(state => state.snoozeAlarm);

  return {
    activeAlarm,
    isPlaying,
    isSnoozed,
    snoozeCount,
    stopAlarm,
    snoozeAlarm,
  };
};

export const useAlarmUtils = () => {
  const getNextAlarmTime = useAlarmStore(state => state.getNextAlarmTime);
  const isAlarmActive = useAlarmStore(state => state.isAlarmActive);

  return {
    getNextAlarmTime,
    isAlarmActive,
  };
};

export const useNextAlarm = () => {
  const alarms = useAlarmStore(state => state.alarms);
  const getNextAlarmTime = useAlarmStore(state => state.getNextAlarmTime);

  return useMemo(() => {
    const enabledAlarms = alarms
      .filter(alarm => alarm.isEnabled)
      .map(alarm => ({ alarm, nextTime: getNextAlarmTime(alarm) }))
      .filter(({ nextTime }) => nextTime !== null)
      .sort((a, b) => a.nextTime!.getTime() - b.nextTime!.getTime());

    return enabledAlarms[0] || null;
  }, [alarms, getNextAlarmTime]);
};
