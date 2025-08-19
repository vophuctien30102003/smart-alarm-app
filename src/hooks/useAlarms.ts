import { useCallback, useEffect } from 'react';
import { AppState } from 'react-native';
import { initializeAlarmSystem, startAlarmChecker, stopAlarmChecker, useAlarmStore } from '../store/alarmStore';
import { Alarm, WeekDay } from '../types/alarm';

export const useAlarms = () => {
  const alarms = useAlarmStore(state => state.alarms);
  const addAlarm = useAlarmStore(state => state.addAlarm);
  const updateAlarm = useAlarmStore(state => state.updateAlarm);
  const deleteAlarm = useAlarmStore(state => state.deleteAlarm);
  const toggleAlarm = useAlarmStore(state => state.toggleAlarm);

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

export const useAlarmSounds = () => {
  const sounds = useAlarmStore(state => state.sounds);
  const loadSounds = useAlarmStore(state => state.loadSounds);
  const addCustomSound = useAlarmStore(state => state.addCustomSound);

  return {
    sounds,
    loadSounds,
    addCustomSound,
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

// Hook for managing alarm system lifecycle
export const useAlarmSystem = () => {
  useEffect(() => {
    let isInitialized = false;

    const initializeSystem = async () => {
      if (!isInitialized) {
        await initializeAlarmSystem();
        isInitialized = true;
      }
    };

    const handleAppStateChange = (nextAppState: string) => {
      if (nextAppState === 'active') {
        startAlarmChecker();
      } else if (nextAppState === 'background' || nextAppState === 'inactive') {
        // Keep checker running in background for alarms
        // stopAlarmChecker();
      }
    };

    initializeSystem();
    
    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription?.remove();
      stopAlarmChecker();
    };
  }, []);
};

// Hook for creating new alarms with validation
export const useCreateAlarm = () => {
  const addAlarm = useAlarmStore(state => state.addAlarm);

  const createAlarm = useCallback((
    time: string,
    label: string = '',
    repeatDays: WeekDay[] = [],
    soundName: string = 'Classic Bell',
    volume: number = 1.0,
    vibrate: boolean = true,
    snoozeEnabled: boolean = true,
    snoozeDuration: number = 9
  ) => {
    const newAlarm: Omit<Alarm, 'id' | 'createdAt' | 'updatedAt'> = {
      time,
      label,
      isEnabled: true,
      repeatDays,
      soundName,
      volume,
      vibrate,
      snoozeEnabled,
      snoozeDuration,
    };

    addAlarm(newAlarm);
  }, [addAlarm]);

  return { createAlarm };
};

// Hook for getting next alarm info
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

// Hook for time validation
export const useTimeValidation = () => {
  const validateTime = useCallback((time: string): boolean => {
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    return timeRegex.test(time);
  }, []);

  const formatTimeInput = useCallback((input: string): string => {
    // Remove non-numeric characters except colon
    const cleaned = input.replace(/[^\d:]/g, '');
    
    // Ensure proper format
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
