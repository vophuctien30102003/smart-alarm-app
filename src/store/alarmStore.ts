import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import {
    Alarm,
    AlarmStore
} from '../types/alarm';
import {
    AudioManager,
    NotificationManager,
    generateAlarmId,
    getDefaultAlarmSounds,
    getNextAlarmTime,
    isAlarmDue
} from '../utils';

const audioManager = AudioManager.getInstance();
const notificationManager = NotificationManager.getInstance();

export const useAlarmStore = create<AlarmStore>()(
  persist(
    (set, get) => ({
      alarms: [],
      sounds: getDefaultAlarmSounds(),
      activeAlarm: null,
      isPlaying: false,
      isSnoozed: false,
      snoozeCount: 0,

      addAlarm: (alarmData) => {
        const newAlarm: Alarm = {
          ...alarmData,
          id: generateAlarmId(),
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        set((state) => ({
          alarms: [...state.alarms, newAlarm]
        }));

        if (newAlarm.isEnabled) {
          notificationManager.scheduleAlarmNotification(newAlarm);
        }
      },

      updateAlarm: (id, updates) => {
        set((state) => ({
          alarms: state.alarms.map(alarm => 
            alarm.id === id 
              ? { ...alarm, ...updates, updatedAt: new Date() }
              : alarm
          )
        }));

        const updatedAlarm = get().alarms.find(alarm => alarm.id === id);
        if (updatedAlarm) {
          notificationManager.cancelAlarmNotifications(id);
          
          if (updatedAlarm.isEnabled) {
            notificationManager.scheduleAlarmNotification(updatedAlarm);
          }
        }
      },

      deleteAlarm: (id) => {
        set((state) => ({
          alarms: state.alarms.filter(alarm => alarm.id !== id)
        }));

        notificationManager.cancelAlarmNotifications(id);
      },

      toggleAlarm: (id) => {
        const alarm = get().alarms.find(a => a.id === id);
        if (alarm) {
          get().updateAlarm(id, { isEnabled: !alarm.isEnabled });
        }
      },

      triggerAlarm: async (alarm) => {
        try {
          set({
            activeAlarm: alarm,
            isPlaying: true,
            isSnoozed: false,
            snoozeCount: 0,
          });

          const soundUri = alarm.soundUri || get().sounds.find(s => s.isDefault)?.uri || '';
          await audioManager.playAlarm(soundUri, alarm.volume);

          if (alarm.vibrate) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          }

          audioManager.fadeIn(3000);

          notificationManager.presentLocalNotification(
            '⏰ Alarm!',
            alarm.label || `Wake up! (${alarm.time})`
          );

        } catch (error) {
          console.error('Failed to trigger alarm:', error);
        }
      },

      stopAlarm: async () => {
        try {
          await audioManager.fadeOut(1000);
          await audioManager.stopAlarm();
          
          set({
            activeAlarm: null,
            isPlaying: false,
            isSnoozed: false,
            snoozeCount: 0,
          });
        } catch (error) {
          console.error('Failed to stop alarm:', error);
        }
      },

      snoozeAlarm: async () => {
        const { activeAlarm, snoozeCount } = get();
        if (!activeAlarm || !activeAlarm.snoozeEnabled) return;

        try {
          await audioManager.stopAlarm();
          
          const newSnoozeCount = snoozeCount + 1;

          set({
            isPlaying: false,
            isSnoozed: true,
            snoozeCount: newSnoozeCount,
          });

          // Schedule a new notification for snooze
          setTimeout(() => {
            if (get().isSnoozed && get().activeAlarm?.id === activeAlarm.id) {
              get().triggerAlarm(activeAlarm);
            }
          }, activeAlarm.snoozeDuration * 60 * 1000);

        } catch (error) {
          console.error('Failed to snooze alarm:', error);
        }
      },

      loadSounds: () => {
        // Load default sounds - this can be extended to load from device
        set({ sounds: getDefaultAlarmSounds() });
      },

      addCustomSound: (sound) => {
        set((state) => ({
          sounds: [...state.sounds, sound]
        }));
      },

      scheduleNotifications: async (alarm) => {
        try {
          await notificationManager.scheduleAlarmNotification(alarm);
        } catch (error) {
          console.error('Failed to schedule notifications:', error);
        }
      },

      cancelNotifications: async (alarmId) => {
        try {
          await notificationManager.cancelAlarmNotifications(alarmId);
        } catch (error) {
          console.error('Failed to cancel notifications:', error);
        }
      },

      getNextAlarmTime: (alarm) => {
        return getNextAlarmTime(alarm);
      },

      isAlarmActive: (alarm) => {
        return alarm.isEnabled && getNextAlarmTime(alarm) !== null;
      },
    }),
    {
      name: 'alarm-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        alarms: state.alarms,
        sounds: state.sounds,
      }),
    }
  )
);

// Background alarm checker
let alarmChecker: any = null;

export const startAlarmChecker = () => {
  if (alarmChecker) return;

  alarmChecker = setInterval(() => {
    const { alarms, triggerAlarm, isPlaying } = useAlarmStore.getState();
    
    if (isPlaying) return; // Don't check if alarm is already playing

    for (const alarm of alarms) {
      if (alarm.isEnabled && isAlarmDue(alarm, 5000)) { // 5 second tolerance
        triggerAlarm(alarm);
        break; // Only trigger one alarm at a time
      }
    }
  }, 1000); // Check every second
};

export const stopAlarmChecker = () => {
  if (alarmChecker) {
    clearInterval(alarmChecker);
    alarmChecker = null;
  }
};

// Initialize managers
export const initializeAlarmSystem = async () => {
  try {
    await audioManager.initialize();
    await notificationManager.initialize();
    startAlarmChecker();
    return true;
  } catch (error) {
    console.error('Failed to initialize alarm system:', error);
    return false;
  }
};
