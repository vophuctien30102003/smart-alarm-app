import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import LocationAlarmService from '../lib/LocationAlarmService';
import notificationManager from '../lib/NotificationManager';
import { WeekDay } from '../prototype/enum/day.enum';
import { Alarm, AlarmStore } from '../types/AlarmClock';
import { LocationType } from '../types/Location';
import { formatDistance, formatDuration, getDirections } from '../utils/directionsRouteUtils';
import { generateTimestampId } from '../utils/idUtils';

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
          };

          set((state) => ({
            alarms: [...state.alarms, newAlarm],
          }));

          if (newAlarm.isEnabled) {
            await get().setupAlarmNotifications(newAlarm);
          }
        } catch (error) {
          console.error('Failed to add alarm:', error);
          throw error;
        }
      },

      setupAlarmNotifications: async (alarm: Alarm) => {
        if (alarm.isLocationBased && alarm.targetLocation) {
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

        await get().cleanupAlarmNotifications(alarm);          const updatedAlarm = {
            ...alarm,
            ...updates,
            updatedAt: new Date(),
          };

          set((state) => ({
            alarms: state.alarms.map((a) =>
              a.id === id ? updatedAlarm : a
            ),
          }));

          // Re-setup notifications/tracking if enabled
          if (updatedAlarm.isEnabled) {
            await get().setupAlarmNotifications(updatedAlarm);
          }
        } catch (error) {
          console.error('Failed to update alarm:', error);
          throw error;
        }
      },

      cleanupAlarmNotifications: async (alarm: Alarm) => {
        if (alarm.notificationId) {
          await notificationManager.cancelAlarmNotification(alarm.notificationId);
        }
        if (alarm.isLocationBased) {
          locationService.removeLocationAlarm(alarm.id);
        }
      },

      deleteAlarm: async (id: string) => {
        try {
          const alarm = get().alarms.find(a => a.id === id);
          if (alarm) {
            await get().cleanupAlarmNotifications(alarm);
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
        if (alarm.isLocationBased) {
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
        if (alarm.isLocationBased || !alarm.isEnabled) {
          return null;
        }

        const [hours, minutes] = alarm.time.split(':').map(Number);
        const now = new Date();
        const alarmDate = new Date(now);
        alarmDate.setHours(hours, minutes, 0, 0);

        if (alarmDate <= now) {
          alarmDate.setDate(alarmDate.getDate() + 1);
        }

        if (alarm.repeatDays.length > 0) {
          const currentDay = alarmDate.getDay();
          const daysUntilNext = alarm.repeatDays
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
        return alarm.isEnabled && (alarm.isLocationBased || get().getNextAlarmTime(alarm) !== null);
      },

      // Location-based alarm methods
      startLocationTracking: async () => {
        try {
          await locationService.startLocationTracking();
          const alarms = get().alarms.filter(a => a.isEnabled && a.isLocationBased);
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
        const alarms = get().alarms.filter(a => a.isEnabled && a.isLocationBased);
        locationService.updateLocationAlarms(alarms);
      },

      getArrivalTimeEstimate: async (targetLocation: LocationType, currentPosition?: { latitude: number; longitude: number }) => {
        try {
          if (!currentPosition) {
            const currentLocation = await locationService.getCurrentLocation();
            if (!currentLocation) return null;
            currentPosition = {
              latitude: currentLocation.coords.latitude,
              longitude: currentLocation.coords.longitude
            };
          }

          const routeInfo = await getDirections(
            currentPosition,
            { latitude: targetLocation.coordinates.latitude, longitude: targetLocation.coordinates.longitude }
          );

          return routeInfo ? {
            duration: routeInfo.duration,
            distance: routeInfo.distance,
            formattedDuration: formatDuration(routeInfo.duration.value),
            formattedDistance: formatDistance(routeInfo.distance.value)
          } : null;
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
