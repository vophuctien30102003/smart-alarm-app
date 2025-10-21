import { convertSoundToAlarmSound } from '@/shared/constants/sounds';
import { AlarmType } from '@/shared/enums';
import type { LocationAlarm } from '@/shared/types/alarm.type';
import { LocationAlarmType, legacyRepeatToEnum } from '@/shared/types/alarmLocation.type';
import { calculateDistance } from '@/shared/utils';
import { resolveSound } from '@/shared/utils/soundUtils';
import { useAlarmStore } from '@/store/alarmStore';
import { useMapAlarmStore } from '@/store/mapAlarmStore';
import * as Location from 'expo-location';
import notificationManager from './NotificationManager';
// TODO: Migrate to shared utilities after MapViewComponent is stable
// import { LocationPermissionManager } from '@/shared/utils/locationPermissions';
// import { ALARM_CONSTANTS } from '@/shared/constants';

export class MapLocationTracker {
  private static instance: MapLocationTracker;
  private isTracking = false;
  private trackingInterval: any = null;
  private activeAlarms: Map<string, LocationAlarmType> = new Map();
  private triggeredAlarms: Set<string> = new Set(); // Prevent multiple triggers

  private constructor() {}

  static getInstance(): MapLocationTracker {
    if (!MapLocationTracker.instance) {
      MapLocationTracker.instance = new MapLocationTracker();
    }
    return MapLocationTracker.instance;
  }

  async startTracking(alarms: LocationAlarmType[]): Promise<void> {
    if (this.isTracking) {
      console.log('🔄 MapLocationTracker: Already tracking');
      return;
    }

    try {
      // TODO: Replace with LocationPermissionManager.requestLocationPermissions()
      const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
      if (foregroundStatus !== 'granted') {
        throw new Error('Foreground location permission not granted');
      }

      const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
      if (backgroundStatus !== 'granted') {
        console.warn('⚠️ MapLocationTracker: Background permission not granted - limited functionality');
      }

      this.activeAlarms.clear();
      this.triggeredAlarms.clear();

      alarms
        .filter(alarm => alarm.isActive)
        .forEach(alarm => this.activeAlarms.set(alarm.id, alarm));

      if (this.activeAlarms.size === 0) {
        console.log('No active alarms to track');
        return;
      }

      this.isTracking = true;
      this.trackingInterval = setInterval(async () => {
        await this.checkLocation();
      }, 10000); 


      // Initial check
      await this.checkLocation();

    } catch (error) {
      console.error('Failed to start location tracking:', error);
      throw error;
    }
  }

  stopTracking(): void {
    if (this.trackingInterval) {
      clearInterval(this.trackingInterval);
      this.trackingInterval = null;
    }

    this.isTracking = false;
    this.activeAlarms.clear();
    this.triggeredAlarms.clear();
  }

  updateActiveAlarms(alarms: LocationAlarmType[]): void {
    this.activeAlarms.clear();
    this.triggeredAlarms.clear();

    const activeAlarms = alarms.filter(alarm => alarm.isActive);
    activeAlarms.forEach(alarm => {
      this.activeAlarms.set(alarm.id, alarm);
    });


    if (this.activeAlarms.size === 0 && this.isTracking) {
      this.stopTracking();
    } else if (this.activeAlarms.size > 0 && !this.isTracking) {
      void this.startTracking(alarms);
    }
  }

  private async checkLocation(): Promise<void> {
    if (this.activeAlarms.size === 0) {
      return;
    }

    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const currentCoords = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };

      for (const [alarmId, alarm] of this.activeAlarms) {
        // Skip if already triggered (prevent spam)
        if (this.triggeredAlarms.has(alarmId)) {
          continue;
        }

        const distanceKm = calculateDistance(
          { latitude: currentCoords.latitude, longitude: currentCoords.longitude },
          { latitude: alarm.lat, longitude: alarm.long }
        );

        const distanceMeters = distanceKm * 1000;

        const wasTriggered = this.triggeredAlarms.has(alarmId);

        if (distanceMeters <= alarm.radius) {
          if (wasTriggered) {
            continue;
          }
          console.log(`🚨 ALARM TRIGGERED! ${alarm.lineName}`);
          await this.triggerAlarm(alarm, distanceKm);
          
          this.triggeredAlarms.add(alarmId);
          
          if (alarm.repeat === 'Once') {
            this.activeAlarms.delete(alarmId);
          }
        } else if (wasTriggered) {
          this.triggeredAlarms.delete(alarmId);
        }
      }

      if (this.isTracking && this.activeAlarms.size === 0) {
        this.stopTracking();
        }

    } catch (error) {
      console.error('Error checking location:', error);
    }
  }

  private async triggerAlarm(alarm: LocationAlarmType, distanceKm: number): Promise<void> {
    try {
      console.log(`🔔 Triggering alarm: ${alarm.lineName}`);

      const alarmStore = useAlarmStore.getState();
      const mapStore = useMapAlarmStore.getState();

      const locationAlarm = this.mapToLocationAlarm(alarm);

      alarmStore.triggerAlarm(locationAlarm);

      await notificationManager.showLocationAlarmNotification(
        locationAlarm,
        `Approaching ${alarm.name}`,
        `${alarm.lineName} is within ${alarm.radius}m`
      );

      if (alarm.repeat === 'Once') {
        await mapStore.updateAlarm(alarm.id, { isActive: false });
      }

      console.log(`📝 Alarm logged: ${alarm.lineName} at ${distanceKm.toFixed(2)}km`);

    } catch (error) {
      console.error('Error triggering alarm:', error);
    }
  }

  private mapToLocationAlarm(alarm: LocationAlarmType): LocationAlarm {
    const soundData = resolveSound(alarm.sound);
    const alarmSound = convertSoundToAlarmSound(soundData);

    const repeatType = legacyRepeatToEnum(alarm.repeat);

    return {
      id: alarm.id,
      label: alarm.lineName || alarm.name,
      isEnabled: true,
      sound: alarmSound,
      volume: 1,
      vibrate: true,
      snoozeEnabled: false,
      snoozeDuration: 5,
      maxSnoozeCount: 0,
      createdAt:
        typeof alarm.timestamp === 'string'
          ? alarm.timestamp
          : alarm.timestamp?.toISOString?.() ?? new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      type: AlarmType.LOCATION,
      targetLocation: {
        id: alarm.mapbox_id || alarm.id,
        name: alarm.name,
        address: alarm.address,
        coordinates: {
          latitude: alarm.lat,
          longitude: alarm.long,
        },
        mapbox_id: alarm.mapbox_id,
      },
      radiusMeters: alarm.radius,
      timeBeforeArrival: alarm.timeBeforeArrival,
      arrivalTrigger: true,
      repeatType,
    };
  }

  // Reset triggered alarms (call this when alarms are updated)
  resetTriggeredAlarms(): void {
    this.triggeredAlarms.clear();
    console.log('🔄 Reset triggered alarms');
  }

  getTrackingStatus(): {
    isTracking: boolean;
    activeAlarmsCount: number;
    triggeredAlarmsCount: number;
  } {
    return {
      isTracking: this.isTracking,
      activeAlarmsCount: this.activeAlarms.size,
      triggeredAlarmsCount: this.triggeredAlarms.size,
    };
  }
}

export default MapLocationTracker;
