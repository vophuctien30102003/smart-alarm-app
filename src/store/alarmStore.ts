import { WeekDay } from '@/shared/enums';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import LocationAlarmService from '../services/LocationAlarmService';
import notificationManager from '../services/NotificationManager';
import { Alarm, AlarmStore, isLocationAlarm, LocationAlarm, LocationTarget, TimeAlarm } from '../shared/types';
import { generateTimestampId } from '../shared/utils/idUtils';

const locationService = LocationAlarmService.getInstance();

const MAX_SNOOZE_COUNT = 3;
const DEFAULT_SNOOZE_DURATION = 5;
const DEFAULT_VOLUME = 0.8;

export const useAlarmStore = create<AlarmStore>()(
  persist(
    (set, get) => ({
      alarms: [],
      activeAlarm: null,
      isPlaying: false,
      isSnoozed: false,
      snoozeCount: 0,

      addAlarm: async (alarm: Omit<Alarm, 'id' | 'createdAt' | 'updatedAt'>) => {
        try {
          const newAlarm: Alarm = {
            ...alarm,
            id: generateTimestampId(),
            createdAt: new Date(),
            updatedAt: new Date(),
            volume: alarm.volume || DEFAULT_VOLUME,
            snoozeDuration: alarm.snoozeDuration || DEFAULT_SNOOZE_DURATION,
          } as Alarm;

          set((state) => ({
            alarms: [...state.alarms, newAlarm],
          }));

          if (newAlarm.isEnabled) {
            await get().setupAlarmTracking(newAlarm);
          }
        } catch (error) {
          console.error('Failed to add alarm:', error);
          throw error;
        }
      },

      setupAlarmTracking: async (alarm: Alarm) => {
        if (isLocationAlarm(alarm)) {
          locationService.addLocationAlarm(alarm);
          
          try {
            await locationService.startLocationTracking();
            locationService.setAlarmTriggerCallback((triggeredAlarm) => {
              get().triggerAlarm(triggeredAlarm);
            });
          } catch (error) {
            console.error('Failed to start location tracking:', error);
            Alert.alert('Location Error', 'Failed to start location tracking for alarm');
          }
        } else {
          const notificationId = await notificationManager.scheduleAlarmNotification(alarm);
          if (notificationId) {
            set((state) => ({
              alarms: state.alarms.map(a => 
                a.id === alarm.id 
                  ? { ...a, notificationId } 
                  : a
              ),
            }));
          }
        }
      },

      updateAlarm: async (id: string, updates: Partial<Alarm>) => {
        try {
          const alarm = get().alarms.find(a => a.id === id);
          if (!alarm) return;

          await get().cleanupAlarmTracking(alarm);
          
          const updatedAlarm: Alarm = {
            ...alarm,
            ...updates,
            updatedAt: new Date(),
          } as Alarm;

          set((state) => ({
            alarms: state.alarms.map((a) =>
              a.id === id ? updatedAlarm : a
            ),
          }));

          if (updatedAlarm.isEnabled) {
            await get().setupAlarmTracking(updatedAlarm);
          }
        } catch (error) {
          console.error('Failed to update alarm:', error);
          throw error;
        }
      },

      cleanupAlarmTracking: async (alarm: Alarm) => {
        if (alarm.notificationId) {
          await notificationManager.cancelAlarmNotification(alarm.notificationId);
        }
        if (isLocationAlarm(alarm)) {
          locationService.removeLocationAlarm(alarm.id);
        }
      },

      deleteAlarm: async (id: string) => {
        try {
          const alarm = get().alarms.find(a => a.id === id);
          if (alarm) {
            await get().cleanupAlarmTracking(alarm);
          }

          set((state) => ({
            alarms: state.alarms.filter((a) => a.id !== id),
          }));
        } catch (error) {
          console.error('Failed to delete alarm:', error);
          throw error;
        }
      },

      toggleAlarm: async (id: string) => {
        const alarm = get().alarms.find(a => a.id === id);
        if (!alarm) return;

        await get().updateAlarm(id, { isEnabled: !alarm.isEnabled });
      },

      triggerAlarm: (alarm: Alarm) => {
        if ((globalThis as any).snoozeTimeout) {
          clearTimeout((globalThis as any).snoozeTimeout);
          delete (globalThis as any).snoozeTimeout;
        }

        set({
          activeAlarm: alarm,
          isPlaying: true,
          isSnoozed: false,
          snoozeCount: 0,
        });
      },

      snoozeAlarm: () => {
        const { activeAlarm, snoozeCount } = get();
        if (!activeAlarm) return;

        const maxSnooze = activeAlarm.maxSnoozeCount || MAX_SNOOZE_COUNT;
        if (snoozeCount >= maxSnooze) {
          get().stopAlarm();
          return;
        }

        set({
          isPlaying: false,
          isSnoozed: true,
          snoozeCount: snoozeCount + 1,
        });

        const snoozeTimeout = setTimeout(() => {
          const currentState = get();
          if (currentState.isSnoozed && currentState.activeAlarm?.id === activeAlarm.id) {
            get().triggerAlarm(activeAlarm);
          }
        }, (activeAlarm.snoozeDuration || DEFAULT_SNOOZE_DURATION) * 60 * 1000);

        (globalThis as any).snoozeTimeout = snoozeTimeout;
      },

      stopAlarm: () => {
        if ((globalThis as any).snoozeTimeout) {
          clearTimeout((globalThis as any).snoozeTimeout);
          delete (globalThis as any).snoozeTimeout;
        }

        set({
          activeAlarm: null,
          isPlaying: false,
          isSnoozed: false,
          snoozeCount: 0,
        });
      },

      scheduleNotifications: async (alarm: Alarm) => {
        if (isLocationAlarm(alarm)) {
          // Location-based alarms don't use time-based notifications
          return;
        }
        await notificationManager.scheduleAlarmNotification(alarm);
      },

      cancelNotifications: async (alarmId: string) => {
        const alarm = get().alarms.find(a => a.id === alarmId);
        if (alarm?.notificationId) {
          await notificationManager.cancelAlarmNotification(alarm.notificationId);
        }
      },

      getNextAlarmTime: (alarm: Alarm): Date | null => {
        if (isLocationAlarm(alarm) || !alarm.isEnabled) {
          return null;
        }

        const timeAlarm = alarm as TimeAlarm;
        const [hours, minutes] = timeAlarm.time.split(':').map(Number);
        const now = new Date();
        const alarmDate = new Date(now);
        alarmDate.setHours(hours, minutes, 0, 0);

        if (alarmDate <= now) {
          alarmDate.setDate(alarmDate.getDate() + 1);
        }

        if (timeAlarm.repeatDays.length > 0) {
          const currentDay = alarmDate.getDay();
          const daysUntilNext = timeAlarm.repeatDays
            .map(day => {
              const dayNum = day === WeekDay.SUNDAY ? 0 : day;
              let diff = dayNum - currentDay;
              if (diff <= 0) diff += 7;
              return diff;
            })
            .sort((a, b) => a - b)[0];

          alarmDate.setDate(alarmDate.getDate() + daysUntilNext);
        }

        return alarmDate;
      },

      isAlarmActive: (alarm: Alarm): boolean => {
        return alarm.isEnabled && (isLocationAlarm(alarm) || get().getNextAlarmTime(alarm) !== null);
      },

      startLocationTracking: async () => {
        try {
          await locationService.startLocationTracking();
          const alarms = get().alarms.filter(a => a.isEnabled && isLocationAlarm(a)) as LocationAlarm[];
          locationService.updateLocationAlarms(alarms);
          
          locationService.setAlarmTriggerCallback((alarm) => {
            get().triggerAlarm(alarm);
          });
        } catch (error) {
          console.error('Failed to start location tracking:', error);
          throw error;
        }
      },

      stopLocationTracking: async () => {
        await locationService.stopLocationTracking();
      },

      updateLocationAlarms: () => {
        const alarms = get().alarms.filter(a => a.isEnabled && isLocationAlarm(a)) as LocationAlarm[];
        locationService.updateLocationAlarms(alarms);
      },

      getArrivalTimeEstimate: async (targetLocation: LocationTarget, currentPosition?: { latitude: number; longitude: number }) => {
        try {
          if (!currentPosition) {
            const currentLocation = await locationService.getCurrentLocation();
            if (!currentLocation) return null;
            currentPosition = {
              latitude: currentLocation.coords.latitude,
              longitude: currentLocation.coords.longitude
            };
          }

        } catch (error) {
          console.error('Failed to get arrival estimate:', error);
          return null;
        }
      },
      getLocationAlarmStatus: (alarmId: string) => {
        return locationService.getLocationAlarmStatus(alarmId);
      },
    }),
    {
      name: 'alarm-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        alarms: state.alarms,
      }),
    }
  )
);

locationService.setAlarmTriggerCallback((alarm) => {
  useAlarmStore.getState().triggerAlarm(alarm);
});
