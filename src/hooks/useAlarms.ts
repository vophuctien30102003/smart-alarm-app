import { useMemo } from 'react';
import { sortAlarms } from '../shared/utils/alarmUtils';
import { selectAlarms, useAlarmStore } from '../store/alarmStore';

export const useAlarms = () => {
  const alarms = useAlarmStore(selectAlarms);
  const addAlarm = useAlarmStore(state => state.addAlarm);
  const updateAlarm = useAlarmStore(state => state.updateAlarm);
  const deleteAlarm = useAlarmStore(state => state.deleteAlarm);
  const toggleAlarm = useAlarmStore(state => state.toggleAlarm);

  const sortedAlarms = useMemo(() => sortAlarms(alarms), [alarms]);

  return {
    alarms: sortedAlarms,
    addAlarm,
    updateAlarm,
    deleteAlarm,
    toggleAlarm,
  };
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
    const nextAlarm = alarms
      .filter(alarm => alarm.isEnabled)
      .map(alarm => ({
        alarm,
        nextTime: getNextAlarmTime(alarm)
      }))
      .filter(({ nextTime }) => nextTime !== null)
      .sort((a, b) => {
        if (!a.nextTime || !b.nextTime) return 0;
        return a.nextTime.getTime() - b.nextTime.getTime();
      })[0];

    return nextAlarm || null;
  }, [alarms, getNextAlarmTime]);
};
