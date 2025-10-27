import { useCallback, useMemo } from 'react';
import { isLocationAlarm, isSleepAlarm, isTimeAlarm } from '../shared/types/alarm.type';
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

  const sortedAlarms = useMemo(() => {
    const getPriority = (alarm: typeof alarms[number]) => {
      if (isTimeAlarm(alarm)) return 0;
      if (isSleepAlarm(alarm)) return 1;
      if (isLocationAlarm(alarm)) return 2;
      return 3;
    };

    return [...alarms].sort((a, b) => {
      const priorityDiff = getPriority(a) - getPriority(b);
      if (priorityDiff !== 0) {
        return priorityDiff;
      }

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
  }, [alarms]);

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

export const useAlarmValidation = () => {
  const validateAlarmTime = useCallback((time: string): boolean => {
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    return timeRegex.test(time);
  }, []);

  const validateAlarmLabel = useCallback((label: string): boolean => {
    return label.trim().length > 0 && label.trim().length <= 50;
  }, []);

  const validateAlarmData = useCallback((alarm: {
    time: string;
    label: string;
    volume?: number;
    snoozeDuration?: number;
  }): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (!validateAlarmTime(alarm.time)) {
      errors.push('Invalid time format');
    }

    if (!validateAlarmLabel(alarm.label)) {
      errors.push('Label must be 1-50 characters long');
    }

    if (alarm.volume !== undefined && (alarm.volume < 0 || alarm.volume > 1)) {
      errors.push('Volume must be between 0 and 1');
    }

    if (alarm.snoozeDuration !== undefined && alarm.snoozeDuration < 1) {
      errors.push('Snooze duration must be at least 1 minute');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }, [validateAlarmTime, validateAlarmLabel]);

  return {
    validateAlarmTime,
    validateAlarmLabel,
    validateAlarmData,
  };
};

export const useAlarmStats = () => {
  const alarms = useAlarmStore(state => state.alarms);

  const stats = useMemo(() => {
    const totalAlarms = alarms.length;
    const enabledAlarms = alarms.filter(alarm => alarm.isEnabled).length;
    const disabledAlarms = totalAlarms - enabledAlarms;
    const locationBasedAlarms = alarms.filter(alarm => isLocationAlarm(alarm)).length;
    const timeBasedAlarms = totalAlarms - locationBasedAlarms;

    return {
      totalAlarms,
      enabledAlarms,
      disabledAlarms,
      locationBasedAlarms,
      timeBasedAlarms,
    };
  }, [alarms]);

  return stats;
};
