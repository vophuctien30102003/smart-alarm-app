import AlarmSoundService from "@/services/AlarmSoundService";
import { ALARM_TIME_DEFAULTS } from "@/shared/constants/alarmDefaults";
import { AlarmRepeatType } from "@/shared/enums";
import type { AlarmPayload } from "@/shared/types/alarmPayload";
import { ensureValidAlarmPayload } from "@/shared/utils/alarmUtils";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
// import * as AlarmManager from "react-native-alarm-manager";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type {
  Alarm,
  AlarmStore,
  LocationAlarm,
  LocationTarget,
} from "../shared/types/alarm.type";
import { isLocationAlarm } from "../shared/types/alarm.type";
import type { LocationAlarmStatus } from "../shared/types/locationTracking.type";

import { createLocationTracker } from "@/store/modules/locationTracker";
import {
  clearSnoozeTimeout,
  scheduleSnoozeTimeout,
} from "@/store/modules/snoozeManager";
import {
  alarmToPayload,
  buildAlarmFromPayload,
  createNewAlarm,
  normalizeAlarmPayload,
} from "./helpers/alarmTransformers";
import {
  cancelNotificationsForAlarm,
  scheduleNotificationsForAlarm,
} from "./helpers/notificationHelpers";
import { getNextAlarmTime, isAlarmActive } from "./helpers/timeCalculations";

const locationTracker = createLocationTracker();

export const useAlarmStore = create<AlarmStore>()(
  persist(
    (set, get) => {
      const mergeAlarmUpdate = (id: string, updates: Partial<Alarm>) => {
        set((state) => ({
          alarms: state.alarms.map((a) => 
            a.id === id ? ({ ...a, ...updates } as Alarm) : a
          ),
        }));
      };

      const findAlarm = (id: string) => get().alarms.find((a) => a.id === id);
      const getLocationAlarms = () => get().alarms.filter(isLocationAlarm) as LocationAlarm[];

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
                        const newAlarm = createNewAlarm(normalized);

                        set((state) => ({
                            alarms: [...state.alarms, newAlarm],
                        }));

                        if (newAlarm.isEnabled) {
                            await get().setupAlarmTracking(newAlarm);
                        }
                    } catch (error) {
                        console.error("Failed to add alarm:", error);
                        throw error;
                    }
                },

                setupAlarmTracking: async (alarm: Alarm) => {
                    if (isLocationAlarm(alarm)) {
                        await get().updateLocationAlarms();
                        return;
                    }
                    await scheduleNotificationsForAlarm(alarm, mergeAlarmUpdate);
                },

                updateAlarm: async (
                    id: string,
                    updates: Partial<AlarmPayload>
                ) => {
                    try {
                        const alarm = findAlarm(id);
                        if (!alarm) return;

                        await get().cleanupAlarmTracking(alarm);

                        const mergedPayload = normalizeAlarmPayload({
                            ...alarmToPayload(alarm),
                            ...updates,
                            type: alarm.type,
                        } as AlarmPayload);

                        ensureValidAlarmPayload(mergedPayload);

                        const updatedAlarm = buildAlarmFromPayload(
                            mergedPayload,
                            {
                                ...alarm,
                                notificationId: alarm.notificationId,
                            }
                        );

                        set((state) => ({
                            alarms: state.alarms.map((a) =>
                                a.id === id ? updatedAlarm : a
                            ),
                        }));

                        if (updatedAlarm.isEnabled) {
                            await get().setupAlarmTracking(updatedAlarm);
                        }
                    } catch (error) {
                        console.error("Failed to update alarm:", error);
                        throw error;
                    }
                },

                cleanupAlarmTracking: async (alarm: Alarm) => {
                    await cancelNotificationsForAlarm(alarm, mergeAlarmUpdate);

                    if (isLocationAlarm(alarm)) {
                        await locationTracker.removeLocationAlarm(alarm.id);
                    }

                    const { activeAlarm, stopAlarm } = get();
                    if (activeAlarm?.id === alarm.id) {
                        await stopAlarm();
                    }
                },

                deleteAlarm: async (id: string) => {
                    try {
                        const alarm = findAlarm(id);
                        if (alarm) {
                            await get().cleanupAlarmTracking(alarm);
                        }
                        set((state) => ({
                            alarms: state.alarms.filter((a) => a.id !== id),
                        }));
                    } catch (error) {
                        console.error("Failed to delete alarm:", error);
                        throw error;
                    }
                },

                toggleAlarm: async (id: string) => {
                    const alarm = findAlarm(id);
                    if (alarm) {
                        await get().updateAlarm(id, {
                            isEnabled: !alarm.isEnabled,
                        });
                    }
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

                    const maxSnooze =
                        activeAlarm.maxSnoozeCount ||
                        ALARM_TIME_DEFAULTS.MAX_SNOOZE_COUNT;
                    if (snoozeCount >= maxSnooze) {
                        void get().stopAlarm();
                        return;
                    }

                    set({
                        isPlaying: false,
                        isSnoozed: true,
                        snoozeCount: snoozeCount + 1,
                    });

                    scheduleSnoozeTimeout(
                        activeAlarm,
                        activeAlarm.snoozeDuration ||
                            ALARM_TIME_DEFAULTS.SNOOZE_DURATION,
                        (alarmToTrigger) => {
                            const currentState = get();
                            if (
                                currentState.isSnoozed &&
                                currentState.activeAlarm?.id ===
                                    alarmToTrigger.id
                            ) {
                                get().triggerAlarm(alarmToTrigger);
                            }
                        }
                    );
                },

                stopAlarm: async () => {
                    const { activeAlarm } = get();
                    if (!activeAlarm) return;

                    await AlarmSoundService.stop();

                    // if (Platform.OS === "android") {
                    //     try {
                    //         AlarmManager.stop(() => {}, console.error);
                    //     } catch (error) {
                    //         console.error(
                    //             "Failed to stop Android alarm:",
                    //             error
                    //         );
                    //     }
                    // }

                    clearSnoozeTimeout();
                    set({
                        activeAlarm: null,
                        isPlaying: false,
                        isSnoozed: false,
                        snoozeCount: 0,
                    });
                },

                scheduleNotifications: async (alarm: Alarm) => {
                    await scheduleNotificationsForAlarm(alarm, mergeAlarmUpdate);
                },

                cancelNotifications: async (alarmId: string) => {
                    const alarm = findAlarm(alarmId);
                    if (alarm) {
                        await cancelNotificationsForAlarm(alarm, mergeAlarmUpdate);
                    }
                },

                getNextAlarmTime,
                isAlarmActive,

                startLocationTracking: async () => {
                    try {
                        await locationTracker.startTracking(
                            getLocationAlarms()
                        );
                    } catch (error) {
                        console.error(
                            "Failed to start location tracking:",
                            error
                        );
                        throw error;
                    }
                },

                stopLocationTracking: async () => {
                    await locationTracker.stopTracking();
                },

                updateLocationAlarms: async () => {
                    await locationTracker.syncLocationAlarms(
                        getLocationAlarms()
                    );
                },

                getArrivalTimeEstimate: async (
                    targetLocation: LocationTarget,
                    currentPosition?: { latitude: number; longitude: number }
                ) => {
                    return locationTracker.estimateArrivalTime(
                        targetLocation,
                        currentPosition
                    );
                },

                getLocationAlarmStatus: (alarmId: string) => {
                    return locationTracker.getLocationAlarmStatus(
                        alarmId
                    ) as LocationAlarmStatus | null;
                },
            };
        },
        {
            name: "alarm-storage",
            storage: createJSONStorage(() => AsyncStorage),
            partialize: (state) => ({ alarms: state.alarms }),
        }
    )
);

locationTracker.registerCallbacks({
    onTrigger: (alarm) => {
        useAlarmStore.getState().triggerAlarm(alarm);
    },
    onComplete: (alarm) => {
        if (alarm.repeatType === AlarmRepeatType.ONCE) {
            void useAlarmStore
                .getState()
                .updateAlarm(alarm.id, { isEnabled: false });
        }
    },
});

export {
  selectActiveAlarms,
  selectAlarmById,
  selectAlarms,
  selectSleepAlarms,
  sortAlarmsByPriority
} from "./helpers/alarmSelectors";

export type { SleepAlarm } from "../shared/types/alarm.type";
