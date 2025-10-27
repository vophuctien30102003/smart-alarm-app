import LocationAlarmService from '@/services/LocationAlarmService';
import type { LocationAlarm, LocationTarget } from '@/shared/types/alarm.type';
import type { LocationAlarmStatus } from '@/shared/types/locationTracking.type';
import { calculateDistanceInMeters } from '@/shared/utils/locationUtils';
import type { LocationObject } from 'expo-location';

export interface LocationTrackerCallbacks {
  onTrigger?: (alarm: LocationAlarm) => void;
  onComplete?: (alarm: LocationAlarm) => void;
}

type LocationServiceLike = Pick<
  LocationAlarmService,
  | 'registerCallbacks'
  | 'startLocationTracking'
  | 'stopLocationTracking'
  | 'updateLocationAlarms'
  | 'removeLocationAlarm'
  | 'getLocationAlarmStatus'
  | 'getCurrentLocation'
>;

const defaultService = LocationAlarmService.getInstance();

export const createLocationTracker = (service: LocationServiceLike = defaultService) => {
  const registerCallbacks = (callbacks: LocationTrackerCallbacks) => {
    service.registerCallbacks(callbacks);
  };

  const syncLocationAlarms = async (alarms: LocationAlarm[]) => {
    await service.updateLocationAlarms(alarms);
  };

  const startTracking = async (alarms: LocationAlarm[] = []) => {
    await service.startLocationTracking();
    if (alarms.length > 0) {
      await syncLocationAlarms(alarms);
    }
  };

  const stopTracking = async () => {
    await service.stopLocationTracking();
  };

  const removeLocationAlarm = async (alarmId: string) => {
    await service.removeLocationAlarm(alarmId);
  };

  const getLocationAlarmStatus = (alarmId: string): LocationAlarmStatus | null => {
    return service.getLocationAlarmStatus(alarmId);
  };

  const getCurrentLocation = (): Promise<LocationObject | null> => service.getCurrentLocation();

  const estimateArrivalTime = async (
    targetLocation: LocationTarget,
    currentPosition?: { latitude: number; longitude: number }
  ): Promise<Date | null> => {
    try {
      if (!targetLocation?.coordinates) {
        console.warn('estimateArrivalTime called without coordinates');
        return null;
      }

      let position = currentPosition;

      if (!position) {
        const currentLocation = await getCurrentLocation();
        if (!currentLocation) {
          return null;
        }

        position = {
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
        };
      }

      const distanceMeters = calculateDistanceInMeters(position, targetLocation.coordinates);
      if (!Number.isFinite(distanceMeters)) {
        return null;
      }

      const averageSpeedMetersPerMinute = 83.33; // ~5 km/h walking speed
      const minutesUntilArrival = distanceMeters / averageSpeedMetersPerMinute;

      return new Date(Date.now() + minutesUntilArrival * 60 * 1000);
    } catch (error) {
      console.error('Failed to estimate arrival time:', error);
      return null;
    }
  };

  return {
    registerCallbacks,
    syncLocationAlarms,
    startTracking,
    stopTracking,
    removeLocationAlarm,
    getLocationAlarmStatus,
    getCurrentLocation,
    estimateArrivalTime,
  };
};

export type LocationTracker = ReturnType<typeof createLocationTracker>;
