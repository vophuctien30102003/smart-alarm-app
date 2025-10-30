import { AlarmRepeatType } from '@/shared/enums';
import { LocationAlarm } from '@/shared/types/alarm.type';
import type { LocationAlarmStatus } from '@/shared/types/locationTracking.type';
import { calculateDistance } from '@/shared/utils/locationUtils';
import * as Location from 'expo-location';
import notificationManager from './NotificationManager';

class LocationAlarmService {
  private static instance: LocationAlarmService;
  private activeLocationAlarms: Map<string, LocationAlarmStatus> = new Map();
  private locationSubscription: Location.LocationSubscription | null = null;
  private isTracking = false;
  private onAlarmTrigger: ((alarm: LocationAlarm) => void) | null = null;
  private onAlarmComplete: ((alarm: LocationAlarm) => void) | null = null;
  private triggeredAlarms: Set<string> = new Set();

  static getInstance(): LocationAlarmService {
    if (!LocationAlarmService.instance) {
      LocationAlarmService.instance = new LocationAlarmService();
    }
    return LocationAlarmService.instance;
  }

  registerCallbacks(callbacks: {
    onTrigger?: (alarm: LocationAlarm) => void;
    onComplete?: (alarm: LocationAlarm) => void;
  }) {
    this.onAlarmTrigger = callbacks.onTrigger ?? null;
    this.onAlarmComplete = callbacks.onComplete ?? null;
  }

  setAlarmTriggerCallback(callback: (alarm: LocationAlarm) => void) {
    this.registerCallbacks({ onTrigger: callback });
  }

  async startLocationTracking(): Promise<void> {
    if (this.isTracking) return;

    try {
      const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
      if (foregroundStatus !== 'granted') {
        throw new Error('Foreground location permission not granted');
      }

      const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
      if (backgroundStatus !== 'granted') {
        console.warn('⚠️ LocationAlarmService: Background permission not granted. Limited functionality.');
      }

      this.locationSubscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 10000,
          distanceInterval: 50,
        },
        this.handleLocationUpdate.bind(this)
      );

      this.isTracking = true;
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
  }

  addLocationAlarm(alarm: LocationAlarm): void {
    if (!alarm.targetLocation) {
      console.warn('Attempted to add location alarm without target location');
      return;
    }

    this.triggeredAlarms.delete(alarm.id);

    this.activeLocationAlarms.set(alarm.id, {
      alarm,
      currentLocation: null,
      isInRange: false,
      distance: Infinity,
    });
  }

  async removeLocationAlarm(alarmId: string): Promise<void> {
    this.activeLocationAlarms.delete(alarmId);
    this.triggeredAlarms.delete(alarmId);
    console.log(`Removed location alarm: ${alarmId}`);

    if (this.activeLocationAlarms.size === 0) {
      await this.stopLocationTracking();
    }
  }

  async updateLocationAlarms(alarms: LocationAlarm[]): Promise<void> {
    const enabledAlarms = alarms.filter(alarm => alarm.isEnabled && alarm.targetLocation);

    const incomingIds = new Set(enabledAlarms.map(alarm => alarm.id));

    for (const existingId of Array.from(this.activeLocationAlarms.keys())) {
      if (!incomingIds.has(existingId)) {
        this.activeLocationAlarms.delete(existingId);
        this.triggeredAlarms.delete(existingId);
      }
    }

    enabledAlarms.forEach((alarm) => {
      this.addLocationAlarm(alarm);
    });

    this.triggeredAlarms.forEach((id) => {
      if (!incomingIds.has(id)) {
        this.triggeredAlarms.delete(id);
      }
    });

    if (this.activeLocationAlarms.size === 0) {
      void this.stopLocationTracking();
      return;
    }
    if (!this.isTracking) {
      await this.startLocationTracking();
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
        this.triggeredAlarms.add(alarmId);
        continue;
      }

      if (!isInRange && this.triggeredAlarms.has(alarmId)) {
        this.triggeredAlarms.delete(alarmId);
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

    if (alarm.repeatType === AlarmRepeatType.ONCE) {
      this.onAlarmComplete?.(alarm);
    }

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
