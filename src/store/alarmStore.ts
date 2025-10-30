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
import {
    Alarm,
    AlarmStore,
    isLocationAlarm,
    isSleepAlarm,
    isTimeAlarm,
    LocationAlarm,
    LocationTarget,
    SleepAlarm,
} from '../shared/types/alarm.type';
import type { LocationAlarmStatus } from '../shared/types/locationTracking.type';
import { generateTimestampId } from '../shared/utils/idUtils';

import { mapWeekDayToNumber } from '../shared/utils/timeUtils';

const locationTracker = createLocationTracker();

const MAX_SNOOZE_COUNT = 3;
const DEFAULT_SNOOZE_DURATION = 5;
const DEFAULT_VOLUME = 0.8;

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

      return {
      alarms: [],
      activeAlarm: null,
      isPlaying: false,
      isSnoozed: false,
      snoozeCount: 0,

      addAlarm: async (alarm: AlarmPayload) => {
        try {
          const nowIso = new Date().toISOString();
          const normalized = normalizeAlarmPayload(alarm);
          ensureValidAlarmPayload(normalized);
          const newAlarm = buildAlarmFromPayload(normalized, {
            id: generateTimestampId(),
            createdAt: nowIso,
            notificationId: undefined,
          } as Alarm);

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
          await get().updateLocationAlarms();
          return;
        }

        if (isSleepAlarm(alarm)) {
          const { bedtimeIds, wakeIds } = await scheduleSleepNotifications(alarm);
          mergeAlarmInState(alarm.id, {
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
          set((state) => ({
            alarms: state.alarms.map(a => 
              a.id === alarm.id 
                ? { ...a, notificationId } 
                : a
            ),
          }));
        }
      },

      updateAlarm: async (id: string, updates: Partial<AlarmPayload>) => {
        try {
          const alarm = get().alarms.find(a => a.id === id);
          if (!alarm) return;

          await get().cleanupAlarmTracking(alarm);
          const basePayload = alarmToPayload(alarm);
          const merged = normalizeAlarmPayload({
            ...basePayload,
            ...updates,
            type: alarm.type,
          } as AlarmPayload);
          ensureValidAlarmPayload(merged);
          const updatedAlarm = buildAlarmFromPayload(merged, {
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
        if (isSleepAlarm(alarm)) {
          await cancelSleepNotifications(alarm);
        }

        if (alarm.notificationId) {
          await notificationManager.cancelAlarmNotification(alarm.notificationId);
        }
        if (isLocationAlarm(alarm)) {
          await locationTracker.removeLocationAlarm(alarm.id);
          return;
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
        clearSnoozeTimeout();

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
        if (isSleepAlarm(alarm)) {
          const { bedtimeIds, wakeIds } = await scheduleSleepNotifications(alarm);
          mergeAlarmInState(alarm.id, {
            bedtimeNotificationIds: bedtimeIds,
            wakeNotificationIds: wakeIds,
          });
          return;
        }

        if (!isTimeAlarm(alarm)) {
          return;
        }

        const notificationId = await notificationManager.scheduleAlarmNotification(alarm);
        if (notificationId) {
          mergeAlarmInState(alarm.id, { notificationId });
        }
      },

      cancelNotifications: async (alarmId: string) => {
        const alarm = get().alarms.find(a => a.id === alarmId);
        if (!alarm) {
          return;
        }

        if (isSleepAlarm(alarm)) {
          await cancelSleepNotifications(alarm);
          mergeAlarmInState(alarmId, {
            bedtimeNotificationIds: [],
            wakeNotificationIds: [],
          });
          return;
        }

        if (alarm.notificationId) {
          await notificationManager.cancelAlarmNotification(alarm.notificationId);
        }
      },

      getNextAlarmTime: (alarm: Alarm): Date | null => {
        if (!alarm.isEnabled || isLocationAlarm(alarm)) {
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

        if (!isTimeAlarm(alarm)) {
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
              let diff = mapWeekDayToNumber(day) - currentDay;
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

      getArrivalTimeEstimate: async (targetLocation: LocationTarget, currentPosition?: { latitude: number; longitude: number }) => {
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

  const isTimeAlarm = (alarm: Alarm) => alarm.type === AlarmType.TIME;
  const isSleepAlarm = (alarm: Alarm) => alarm.type === AlarmType.SLEEP;
  const isLocationAlarm = (alarm: Alarm) => alarm.type === AlarmType.LOCATION;

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

export const selectSleepAlarms = (state: AlarmStore) => state.alarms.filter(a => a.type === AlarmType.SLEEP) as SleepAlarm[];

export const selectActiveAlarms = (state: AlarmStore) => state.alarms.filter(a => a.isEnabled);
