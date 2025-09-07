import { useCallback } from 'react';
import { useAlarmStore } from '../store/alarmStore';

export const useAlarms = () => {
  const alarms = useAlarmStore(state => state.alarms);
  const _addAlarm = useAlarmStore(state => state.addAlarm);
  const _updateAlarm = useAlarmStore(state => state.updateAlarm);
  const _deleteAlarm = useAlarmStore(state => state.deleteAlarm);
  const _toggleAlarm = useAlarmStore(state => state.toggleAlarm);

  const addAlarm = useCallback(async (alarm: Parameters<typeof _addAlarm>[0]) => {
    await _addAlarm(alarm);
  }, [_addAlarm]);

  const updateAlarm = useCallback(async (id: string, updates: Parameters<typeof _updateAlarm>[1]) => {
    await _updateAlarm(id, updates);
  }, [_updateAlarm]);

  const deleteAlarm = useCallback(async (id: string) => {
    await _deleteAlarm(id);
  }, [_deleteAlarm]);

  const toggleAlarm = useCallback(async (id: string) => {
    await _toggleAlarm(id);
  }, [_toggleAlarm]);

  return {
    alarms,
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

export const useAlarmNotifications = () => {
  const scheduleNotifications = useAlarmStore(state => state.scheduleNotifications);
  const cancelNotifications = useAlarmStore(state => state.cancelNotifications);

  return {
    scheduleNotifications,
    cancelNotifications,
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

export const useTimeValidation = () => {
  const validateTime = useCallback((time: string): boolean => {
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    return timeRegex.test(time);
  }, []);

  const formatTimeInput = useCallback((input: string): string => {
    const cleaned = input.replace(/[^\d:]/g, '');
    
    if (cleaned.length >= 3 && !cleaned.includes(':')) {
      const hours = cleaned.slice(0, 2);
      const minutes = cleaned.slice(2, 4);
      return `${hours}:${minutes}`;
    }
    
    return cleaned;
  }, []);

  return {
    validateTime,
    formatTimeInput,
  };
};
