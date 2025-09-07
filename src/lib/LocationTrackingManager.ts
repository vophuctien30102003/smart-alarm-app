import { Alarm } from '@/types/AlarmClock';
import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';

const LOCATION_TASK_NAME = 'background-location-task';

class LocationTrackingManager {
  private static instance: LocationTrackingManager;
  private isTracking = false;
  private locationAlarms: Alarm[] = [];
  private alarmStoreCallback: ((alarm: Alarm) => void) | null = null;

  static getInstance(): LocationTrackingManager {
    if (!LocationTrackingManager.instance) {
      LocationTrackingManager.instance = new LocationTrackingManager();
    }
    return LocationTrackingManager.instance;
  }

  setAlarmCallback(callback: (alarm: Alarm) => void) {
    this.alarmStoreCallback = callback;
  }

  async startLocationTracking() {
    if (this.isTracking) return;

    const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
    if (foregroundStatus !== 'granted') {
      throw new Error('Foreground location permission not granted');
    }

    const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
    if (backgroundStatus !== 'granted') {
      throw new Error('Background location permission not granted');
    }

    TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }) => {
      if (error) {
        console.error('Location tracking error:', error);
        return;
      }
      if (data) {
        const { locations } = data as any;
        this.handleLocationUpdate(locations[0]);
      }
    });

    await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
      accuracy: Location.Accuracy.High,
      timeInterval: 5000,
      distanceInterval: 10,
      foregroundService: {
        notificationTitle: 'Smart Alarm Location Tracking',
        notificationBody: 'Tracking your location for location-based alarms',
      },
    });

    this.isTracking = true;
  }

  async stopLocationTracking() {
    if (!this.isTracking) return;

    await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
    this.isTracking = false;
    this.locationAlarms = [];
  }

  updateLocationAlarms(alarms: Alarm[]) {
    this.locationAlarms = alarms.filter(
      (alarm: Alarm) => alarm.isEnabled && alarm.isLocationBased && alarm.targetLocation
    );
  }

  private handleLocationUpdate(location: Location.LocationObject) {
    if (!location || this.locationAlarms.length === 0) return;

    const currentCoords = {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    };

    this.locationAlarms.forEach(alarm => {
      if (!alarm.targetLocation) return;

      const distance = this.calculateDistance(
        currentCoords,
        alarm.targetLocation.coordinates
      );

      const radiusMeters = alarm.radiusMeters || 100;

      if (alarm.arrivalTrigger && distance <= radiusMeters) {
        this.triggerLocationAlarm(alarm, distance);
      } else if (!alarm.arrivalTrigger && distance >= radiusMeters) {
        this.triggerLocationAlarm(alarm, distance);
      }
    });
  }

  private calculateDistance(
    coord1: { latitude: number; longitude: number },
    coord2: { latitude: number; longitude: number }
  ): number {
    const R = 6371e3;
    const φ1 = coord1.latitude * Math.PI / 180;
    const φ2 = coord2.latitude * Math.PI / 180;
    const Δφ = (coord2.latitude - coord1.latitude) * Math.PI / 180;
    const Δλ = (coord2.longitude - coord1.longitude) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }

  private triggerLocationAlarm(alarm: Alarm, distance: number) {
    if (this.alarmStoreCallback) {
      this.alarmStoreCallback(alarm);
    }
  }
}

export default LocationTrackingManager;
