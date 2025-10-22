import { LocationAlarm } from '@/shared/types/alarm.type';
import type { LocationAlarmStatus } from '@/shared/types/locationTracking.type';
import { calculateDistance } from '@/shared/utils';
import * as Location from 'expo-location';
import notificationManager from './NotificationManager';
// TODO: Migrate to shared utilities
// import { LocationPermissionManager } from '@/shared/utils/locationPermissions';
// import { ALARM_CONSTANTS } from '@/shared/constants';

class LocationAlarmService {
  private static instance: LocationAlarmService;
  private activeLocationAlarms: Map<string, LocationAlarmStatus> = new Map();
  private locationSubscription: Location.LocationSubscription | null = null;
  private isTracking = false;
  private onAlarmTrigger: ((alarm: LocationAlarm) => void) | null = null;

  static getInstance(): LocationAlarmService {
    if (!LocationAlarmService.instance) {
      LocationAlarmService.instance = new LocationAlarmService();
    }
    return LocationAlarmService.instance;
  }

  setAlarmTriggerCallback(callback: (alarm: LocationAlarm) => void) {
    this.onAlarmTrigger = callback;
  }

  async startLocationTracking(): Promise<void> {
    if (this.isTracking) return;

    try {
      // TODO: Replace with LocationPermissionManager.requestLocationPermissions()
      const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
      if (foregroundStatus !== 'granted') {
        throw new Error('Foreground location permission not granted');
      }

      const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
      if (backgroundStatus !== 'granted') {
        console.warn('⚠️ LocationAlarmService: Background permission not granted. Limited functionality.');
      }

      // TODO: Replace with LocationPermissionManager.getLocationWatchOptions()
      this.locationSubscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 10000, // TODO: Use ALARM_CONSTANTS.LOCATION_UPDATE_INTERVAL
          distanceInterval: 50, // TODO: Use ALARM_CONSTANTS.LOCATION_DISTANCE_INTERVAL
        },
        this.handleLocationUpdate.bind(this)
      );

      this.isTracking = true;
      console.log('✅ LocationAlarmService: Location tracking started');
    } catch (error) {
      console.error('❌ LocationAlarmService: Failed to start tracking:', error);
      throw error;
    }
  }

  async stopLocationTracking(): Promise<void> {
    if (this.locationSubscription) {
      this.locationSubscription.remove();
      this.locationSubscription = null;
    }
    if (!this.isTracking) {
      return;
    }
    this.isTracking = false;
    this.activeLocationAlarms.clear();
    console.log('Location tracking stopped');
  }

  addLocationAlarm(alarm: LocationAlarm): void {
    if (!alarm.targetLocation) {
      console.warn('Attempted to add location alarm without target location');
      return;
    }

    this.activeLocationAlarms.set(alarm.id, {
      alarm,
      currentLocation: null,
      isInRange: false,
      distance: Infinity,
    });

    console.log(`Added location alarm: ${alarm.label} for location ${alarm.targetLocation.address}`);
  }

  async removeLocationAlarm(alarmId: string): Promise<void> {
    this.activeLocationAlarms.delete(alarmId);
    console.log(`Removed location alarm: ${alarmId}`);

    if (this.activeLocationAlarms.size === 0) {
      await this.stopLocationTracking();
    }
  }

  updateLocationAlarms(alarms: LocationAlarm[]): void {
    this.activeLocationAlarms.clear();

    const enabledAlarms = alarms.filter(alarm => alarm.isEnabled && alarm.targetLocation);
    enabledAlarms.forEach(alarm => this.addLocationAlarm(alarm));

    if (enabledAlarms.length === 0) {
      console.log('No location alarms to track');
    } else {
      console.log(`Updated location alarms. Active count: ${this.activeLocationAlarms.size}`);
    }

    if (this.activeLocationAlarms.size === 0) {
      void this.stopLocationTracking();
    }
  }

  private async handleLocationUpdate(location: Location.LocationObject): Promise<void> {
    for (const [alarmId, config] of this.activeLocationAlarms) {
      const { alarm } = config;
      
      if (!alarm.targetLocation) continue;

      const distanceKm = calculateDistance(
        {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        },
        alarm.targetLocation.coordinates
      );

      const distance = distanceKm * 1000;

  const radiusMeters = alarm.radiusMeters || 100;
      const wasInRange = config.isInRange;
      const isInRange = distance <= radiusMeters;

      const updatedConfig: LocationAlarmStatus = {
        ...config,
        currentLocation: location,
        isInRange,
        distance,
      };

      

      this.activeLocationAlarms.set(alarmId, updatedConfig);

      if (this.shouldTriggerAlarm(alarm, wasInRange, isInRange)) {
        await this.triggerLocationAlarm(alarm, updatedConfig);
      }
    }
  }

  private shouldTriggerAlarm(alarm: LocationAlarm, wasInRange: boolean, isInRange: boolean): boolean {
    if (alarm.arrivalTrigger) {
      return !wasInRange && isInRange;
    } else {
      return wasInRange && !isInRange;
    }
  }

  private async triggerLocationAlarm(alarm: LocationAlarm, config: LocationAlarmStatus): Promise<void> {
    console.log(`Triggering location alarm: ${alarm.label}`);
    
    const title = alarm.arrivalTrigger 
      ? `Arrived at ${alarm.targetLocation?.address || 'destination'}!`
      : `Left ${alarm.targetLocation?.address || 'location'}!`;
    
    const body = `Alarm: ${alarm.label}`;
    
  await notificationManager.showLocationAlarmNotification(alarm, title, body);

    if (this.onAlarmTrigger) {
      this.onAlarmTrigger(alarm);
    }

    // LocationAlarms don't have deleteAfterNotification property
    // They are managed differently than time-based alarms
  }

  // TODO: derive accurate arrival estimate once travel mode is known

  getActiveLocationAlarms(): LocationAlarmStatus[] {
    return Array.from(this.activeLocationAlarms.values());
  }

  getLocationAlarmStatus(alarmId: string): LocationAlarmStatus | null {
    return this.activeLocationAlarms.get(alarmId) || null;
  }

  isLocationTrackingActive(): boolean {
    return this.isTracking;
  }

  async getCurrentLocation(): Promise<Location.LocationObject | null> {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Location permission not granted');
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      return location;
    } catch (error) {
      console.error('Failed to get current location:', error);
      return null;
    }
  }
}

export default LocationAlarmService;
