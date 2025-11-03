import AlarmSoundService from '@/services/AlarmSoundService';
import { AlarmRepeatType, AlarmType } from '@/shared/enums';
import type { AlarmPayload } from '@/shared/types/alarmPayload';
import { ensureValidAlarmPayload, formatAlarmLabel } from '@/shared/utils/alarmUtils';
import { createLocationTracker } from '@/store/modules/locationTracker';
import { cancelSleepNotifications, getNextSleepEventDate, scheduleSleepNotifications } from '@/store/modules/sleepScheduler';
import { clearSnoozeTimeout, scheduleSnoozeTimeout } from '@/store/modules/snoozeManager';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import notificationManager from '../services/NotificationManager';
import type { Alarm, AlarmStore, LocationAlarm, LocationTarget, SleepAlarm, TimeAlarm } from '../shared/types/alarm.type';
import { isLocationAlarm, isSleepAlarm, isTimeAlarm } from '../shared/types/alarm.type';
import type { LocationAlarmStatus } from '../shared/types/locationTracking.type';
import { generateTimestampId } from '../shared/utils/idUtils';

import { Platform } from 'react-native';
import * as AlarmManager from 'react-native-alarm-manager';
import { mapWeekDayToNumber } from '../shared/utils/timeUtils';

const locationTracker = createLocationTracker();

const MAX_SNOOZE_COUNT = 3;
const DEFAULT_SNOOZE_DURATION = 5;
const DEFAULT_VOLUME = 0.8;

type MergeAlarmFn = (id: string, partial: Partial<Alarm>) => void;

const scheduleNotificationsForAlarm = async (alarm: Alarm, merge: MergeAlarmFn) => {
  if (!alarm.isEnabled) {
    return;
  }

  if (isLocationAlarm(alarm)) {
    // Location alarms are handled via location tracker rather than notifications
    return;
  }

  if (isSleepAlarm(alarm)) {
    const { bedtimeIds, wakeIds } = await scheduleSleepNotifications(alarm);
    merge(alarm.id, {
      bedtimeNotificationIds: bedtimeIds,
      wakeNotificationIds: wakeIds,
    });
    return;
  }

  if (!isTimeAlarm(alarm)) {
    console.warn('Attempted to schedule notification for unsupported alarm type');
    return;
  }

  const notificationId = await notificationManager.scheduleAlarmNotification(alarm);
  if (notificationId) {
    merge(alarm.id, { notificationId });
  }
};

const cancelNotificationsForAlarm = async (alarm: Alarm, merge: MergeAlarmFn) => {
  if (isSleepAlarm(alarm)) {
    await cancelSleepNotifications(alarm);
    merge(alarm.id, {
      bedtimeNotificationIds: [],
      wakeNotificationIds: [],
    });
  }

  if (alarm.notificationId) {
    await notificationManager.cancelAlarmNotification(alarm.notificationId);
    merge(alarm.id, { notificationId: undefined });
  }
};

const computeNextTimeAlarmDate = (alarm: TimeAlarm): Date => {
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
      .map((day) => {
        let diff = mapWeekDayToNumber(day) - currentDay;
        if (diff <= 0) diff += 7;
        return diff;
      })
      .sort((a, b) => a - b)[0];

    alarmDate.setDate(alarmDate.getDate() + daysUntilNext);
  }

  return alarmDate;
};

const alarmToPayload = (alarm: Alarm): AlarmPayload => {
  switch (alarm.type) {
    case AlarmType.TIME:
      return {
        type: AlarmType.TIME,
        label: alarm.label,
        isEnabled: alarm.isEnabled,
        sound: alarm.sound,
        volume: alarm.volume,
        vibrate: alarm.vibrate,
        snoozeEnabled: alarm.snoozeEnabled,
        snoozeDuration: alarm.snoozeDuration,
        maxSnoozeCount: alarm.maxSnoozeCount,
        time: alarm.time,
        repeatDays: alarm.repeatDays,
        deleteAfterNotification: alarm.deleteAfterNotification,
      };
    case AlarmType.SLEEP:
      return {
        type: AlarmType.SLEEP,
        label: alarm.label,
        isEnabled: alarm.isEnabled,
        sound: alarm.sound,
        volume: alarm.volume,
        vibrate: alarm.vibrate,
        snoozeEnabled: alarm.snoozeEnabled,
        snoozeDuration: alarm.snoozeDuration,
        maxSnoozeCount: alarm.maxSnoozeCount,
        bedtime: alarm.bedtime,
        wakeUpTime: alarm.wakeUpTime,
        repeatDays: alarm.repeatDays,
        goalMinutes: alarm.goalMinutes,
        gentleWakeMinutes: alarm.gentleWakeMinutes,
      };
    case AlarmType.LOCATION:
    default:
      return {
        type: AlarmType.LOCATION,
        label: alarm.label,
        isEnabled: alarm.isEnabled,
        sound: alarm.sound,
        volume: alarm.volume,
        vibrate: alarm.vibrate,
        snoozeEnabled: alarm.snoozeEnabled,
        snoozeDuration: alarm.snoozeDuration,
        maxSnoozeCount: alarm.maxSnoozeCount,
        targetLocation: alarm.targetLocation,
        radiusMeters: alarm.radiusMeters,
        timeBeforeArrival: alarm.timeBeforeArrival,
        arrivalTrigger: alarm.arrivalTrigger,
        repeatType: alarm.repeatType,
      };
  }
};

const normalizeAlarmPayload = (payload: AlarmPayload): AlarmPayload => {
  const baseLabel = formatAlarmLabel({
    label: payload.label,
    type: payload.type,
    repeatDays: 'repeatDays' in payload ? payload.repeatDays : undefined,
  });

  const base = {
    ...payload,
    label: baseLabel,
    isEnabled: payload.isEnabled ?? true,
    volume: payload.volume ?? DEFAULT_VOLUME,
    vibrate: payload.vibrate ?? true,
    snoozeEnabled: payload.snoozeEnabled ?? false,
    snoozeDuration: payload.snoozeDuration ?? DEFAULT_SNOOZE_DURATION,
    maxSnoozeCount: payload.maxSnoozeCount ?? MAX_SNOOZE_COUNT,
  } as AlarmPayload;

  if (base.type === AlarmType.TIME) {
    return {
      ...base,
      repeatDays: base.repeatDays ?? [],
      deleteAfterNotification: base.deleteAfterNotification ?? false,
    };
  }

  if (base.type === AlarmType.SLEEP) {
    return {
      ...base,
      repeatDays: base.repeatDays ?? [],
    };
  }

  return {
    ...base,
    repeatType: base.repeatType ?? AlarmRepeatType.ONCE,
    arrivalTrigger: base.arrivalTrigger ?? true,
  };
};

const buildAlarmFromPayload = (
  payload: AlarmPayload,
  base: Pick<Alarm, 'id' | 'createdAt' | 'notificationId'> & Partial<Alarm>
): Alarm => {
  const timestamp = new Date().toISOString();

  const shared = {
    id: base.id,
    createdAt: base.createdAt,
    updatedAt: timestamp,
    label: payload.label!,
    isEnabled: payload.isEnabled ?? true,
    sound: payload.sound,
    volume: payload.volume ?? DEFAULT_VOLUME,
    vibrate: payload.vibrate ?? true,
    snoozeEnabled: payload.snoozeEnabled ?? false,
    snoozeDuration: payload.snoozeDuration ?? DEFAULT_SNOOZE_DURATION,
    maxSnoozeCount: payload.maxSnoozeCount ?? MAX_SNOOZE_COUNT,
    notificationId: base.notificationId,
  } as const;

  if (payload.type === AlarmType.TIME) {
    return {
      ...shared,
      type: AlarmType.TIME,
      time: payload.time,
      repeatDays: payload.repeatDays ?? [],
      deleteAfterNotification: payload.deleteAfterNotification ?? false,
    };
  }

  if (payload.type === AlarmType.SLEEP) {
    return {
      ...shared,
      type: AlarmType.SLEEP,
      bedtime: payload.bedtime,
      wakeUpTime: payload.wakeUpTime,
      repeatDays: payload.repeatDays ?? [],
      goalMinutes: payload.goalMinutes,
      gentleWakeMinutes: payload.gentleWakeMinutes,
      bedtimeNotificationIds: [],
      wakeNotificationIds: [],
    };
  }

  return {
    ...shared,
    type: AlarmType.LOCATION,
    targetLocation: payload.targetLocation,
    radiusMeters: payload.radiusMeters,
    timeBeforeArrival: payload.timeBeforeArrival,
    arrivalTrigger: payload.arrivalTrigger ?? true,
    repeatType: payload.repeatType ?? AlarmRepeatType.ONCE,
  };
};

export const useAlarmStore = create<AlarmStore>()(
  persist(
    (set, get) => {
      const updateAlarmInState = (id: string, transformer: (alarm: Alarm) => Alarm) => {
        set((state) => ({
          alarms: state.alarms.map((alarm) => (alarm.id === id ? transformer(alarm) : alarm)),
        }));
      };

      const mergeAlarmInState = (id: string, partial: Partial<Alarm>) => {
        updateAlarmInState(id, (alarm) => ({ ...alarm, ...partial } as Alarm));
      };

      const getLocationAlarmsFromState = () => get().alarms.filter(isLocationAlarm) as LocationAlarm[];
      const findAlarmById = (id: string) => get().alarms.find((alarm) => alarm.id === id);

      return {
        alarms: [],
        activeAlarm: null,
        isPlaying: false,
        isSnoozed: false,
        snoozeCount: 0,

        addAlarm: async (alarm: AlarmPayload) => {
          try {
            const normalized = normalizeAlarmPayload(alarm);
            ensureValidAlarmPayload(normalized);

            const newAlarm = buildAlarmFromPayload(normalized, {
              id: generateTimestampId(),
              createdAt: new Date().toISOString(),
            } as Alarm);

            set((state) => ({ alarms: [...state.alarms, newAlarm] }));

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
            await get().updateLocationAlarms();
            return;
          }

          await scheduleNotificationsForAlarm(alarm, mergeAlarmInState);
        },

        updateAlarm: async (id: string, updates: Partial<AlarmPayload>) => {
          try {
            const alarm = findAlarmById(id);
            if (!alarm) return;

            await get().cleanupAlarmTracking(alarm);

            const mergedPayload = normalizeAlarmPayload({
              ...alarmToPayload(alarm),
              ...updates,
              type: alarm.type,
            } as AlarmPayload);

            ensureValidAlarmPayload(mergedPayload);

            const updatedAlarm = buildAlarmFromPayload(mergedPayload, {
              ...alarm,
              notificationId: alarm.notificationId,
            });

            updateAlarmInState(id, () => updatedAlarm);

            if (updatedAlarm.isEnabled) {
              await get().setupAlarmTracking(updatedAlarm);
            }
          } catch (error) {
            console.error('Failed to update alarm:', error);
            throw error;
          }
        },

        cleanupAlarmTracking: async (alarm: Alarm) => {
          await cancelNotificationsForAlarm(alarm, mergeAlarmInState);

          if (isLocationAlarm(alarm)) {
            await locationTracker.removeLocationAlarm(alarm.id);
          }
        },

        deleteAlarm: async (id: string) => {
          try {
            const alarm = findAlarmById(id);
            if (alarm) {
              await get().cleanupAlarmTracking(alarm);
            }

            set((state) => ({
              alarms: state.alarms.filter((existing) => existing.id !== id),
            }));
          } catch (error) {
            console.error('Failed to delete alarm:', error);
            throw error;
          }
        },

        toggleAlarm: async (id: string) => {
          const alarm = findAlarmById(id);
          if (!alarm) return;

          await get().updateAlarm(id, { isEnabled: !alarm.isEnabled });
        },

        triggerAlarm: (alarm: Alarm) => {
          clearSnoozeTimeout();

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

          scheduleSnoozeTimeout(
            activeAlarm,
            activeAlarm.snoozeDuration || DEFAULT_SNOOZE_DURATION,
            (alarmToTrigger) => {
              const currentState = get();
              if (currentState.isSnoozed && currentState.activeAlarm?.id === alarmToTrigger.id) {
                get().triggerAlarm(alarmToTrigger);
              }
            }
          );
        },

        stopAlarm: () => {
          void AlarmSoundService.stop();

          if (Platform.OS === 'android') {
            try {
              AlarmManager.stop(
                () => console.log('✅ Native alarm service stopped'),
                (error: unknown) => console.error('❌ Failed to stop native alarm service', error)
              );
            } catch (error) {
              console.error('❌ Failed to invoke native alarm stop', error);
            }
          }

          clearSnoozeTimeout();

          set({
            activeAlarm: null,
            isPlaying: false,
            isSnoozed: false,
            snoozeCount: 0,
          });
        },

        scheduleNotifications: async (alarm: Alarm) => {
          await scheduleNotificationsForAlarm(alarm, mergeAlarmInState);
        },

        cancelNotifications: async (alarmId: string) => {
          const alarm = findAlarmById(alarmId);
          if (!alarm) return;

          await cancelNotificationsForAlarm(alarm, mergeAlarmInState);
        },

        getNextAlarmTime: (alarm: Alarm): Date | null => {
          if (!alarm.isEnabled) {
            return null;
          }

          if (isLocationAlarm(alarm)) {
            return null;
          }

          if (isSleepAlarm(alarm)) {
            const nextBedtime = getNextSleepEventDate(alarm, 'bedtime');
            const nextWake = getNextSleepEventDate(alarm, 'wake');

            if (nextBedtime && nextWake) {
              return nextBedtime < nextWake ? nextBedtime : nextWake;
            }

            return nextBedtime ?? nextWake ?? null;
          }

          if (isTimeAlarm(alarm)) {
            return computeNextTimeAlarmDate(alarm);
          }

          return null;
        },

        isAlarmActive: (alarm: Alarm): boolean => {
          return Boolean(alarm.isEnabled && (isLocationAlarm(alarm) || get().getNextAlarmTime(alarm)));
        },

        startLocationTracking: async () => {
          try {
            await locationTracker.startTracking(getLocationAlarmsFromState());
          } catch (error) {
            console.error('Failed to start location tracking:', error);
            throw error;
          }
        },

        stopLocationTracking: async () => {
          await locationTracker.stopTracking();
        },

        updateLocationAlarms: async () => {
          await locationTracker.syncLocationAlarms(getLocationAlarmsFromState());
        },

        getArrivalTimeEstimate: async (
          targetLocation: LocationTarget,
          currentPosition?: { latitude: number; longitude: number }
        ) => {
          return locationTracker.estimateArrivalTime(targetLocation, currentPosition);
        },

        getLocationAlarmStatus: (alarmId: string) => {
          return locationTracker.getLocationAlarmStatus(alarmId) as LocationAlarmStatus | null;
        },
      };
    },
    {
      name: 'alarm-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        alarms: state.alarms,
      }),
    }
  )
);

locationTracker.registerCallbacks({
  onTrigger: (alarm) => {
    useAlarmStore.getState().triggerAlarm(alarm);
  },
  onComplete: (alarm) => {
    if (alarm.repeatType === AlarmRepeatType.ONCE) {
      void useAlarmStore.getState().updateAlarm(alarm.id, { isEnabled: false });
    }
  },
});

// Selectors (exported helpers) to reduce recomputation in components/hooks
export const selectAlarms = (state: AlarmStore) => state.alarms;

export const selectSortedAlarms = (state: AlarmStore) => {
  const alarms = state.alarms;

  const getPriority = (alarm: Alarm) => {
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
      return (a as any).time.localeCompare((b as any).time);
    }

    if (isSleepAlarm(a) && isSleepAlarm(b)) {
      return (a as any).bedtime.localeCompare((b as any).bedtime);
    }

    if (isLocationAlarm(a) && isLocationAlarm(b)) {
      return (a as any).label.localeCompare((b as any).label);
    }

    return 0;
  });
};

export const selectSleepAlarms = (state: AlarmStore): SleepAlarm[] => state.alarms.filter(isSleepAlarm);

export const selectActiveAlarms = (state: AlarmStore) => state.alarms.filter(a => a.isEnabled);
