import { useCallback, useMemo } from 'react';
import { sortAlarms, validateAlarmData, validateAlarmLabel, validateAlarmTime } from '../shared/utils/alarmUtils';
import { selectAlarms, useAlarmStore } from '../store/alarmStore';

export const useAlarms = () => {
  const alarms = useAlarmStore(selectAlarms);
  const _addAlarm = useAlarmStore(state => state.addAlarm);
  const _updateAlarm = useAlarmStore(state => state.updateAlarm);
  const _deleteAlarm = useAlarmStore(state => state.deleteAlarm);
  const _toggleAlarm = useAlarmStore(state => state.toggleAlarm);

  const addAlarm = useCallback(async (alarm: Parameters<typeof _addAlarm>[0]) => {
    try {
      await _addAlarm(alarm);
    } catch (error) {
      console.error('Failed to add alarm:', error);
      throw error;
    }
  }, [_addAlarm]);

  const updateAlarm = useCallback(async (id: string, updates: Parameters<typeof _updateAlarm>[1]) => {
    try {
      await _updateAlarm(id, updates);
    } catch (error) {
      console.error('Failed to update alarm:', error);
      throw error;
    }
  }, [_updateAlarm]);

  const deleteAlarm = useCallback(async (id: string) => {
    try {
      await _deleteAlarm(id);
    } catch (error) {
      console.error('Failed to delete alarm:', error);
      throw error;
    }
  }, [_deleteAlarm]);

  const toggleAlarm = useCallback(async (id: string) => {
    try {
      await _toggleAlarm(id);
    } catch (error) {
      console.error('Failed to toggle alarm:', error);
      throw error;
    }
  }, [_toggleAlarm]);

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
};

export const useAlarmValidation = () => {
  return {
    validateAlarmTime,
    validateAlarmLabel,
    validateAlarmData,
  };
};
