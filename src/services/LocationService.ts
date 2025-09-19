import { Alarm } from '@/types/AlarmClock';
import { LocationType } from '@/types/Location';
import { calculateDistance } from '@/utils/calculateDistanceUtils';
import { getDirections } from '@/utils/directionsRouteUtils';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import notificationManager from './NotificationManager';

const LOCATION_HISTORY_KEY = 'location_history';

export interface LocationAlarmConfig {
  alarm: Alarm;
  currentLocation: Location.LocationObject;
  isInRange: boolean;
  distance: number;
  estimatedArrivalTime?: number;
}

export interface LocationHistoryServiceProps {
  saveLocationToHistory: (location: LocationType) => Promise<void>;
  loadLocationHistory: () => Promise<LocationType[]>;
  clearLocationHistory: () => Promise<void>;
  removeLocationFromHistory: (locationId: string) => Promise<void>;
}

export class LocationService implements LocationHistoryServiceProps {
  private static instance: LocationService;
  private activeLocationAlarms: Map<string, LocationAlarmConfig> = new Map();
  private locationSubscription: Location.LocationSubscription | null = null;
  private isTracking = false;
  private onAlarmTrigger: ((alarm: Alarm) => void) | null = null;

  static getInstance(): LocationService {
    if (!LocationService.instance) {
      LocationService.instance = new LocationService();
    }
    return LocationService.instance;
  }

  
  setAlarmTriggerCallback(callback: (alarm: Alarm) => void): void {
    this.onAlarmTrigger = callback;
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
        console.warn('Background location permission not granted. Location alarms may not work when app is in background.');
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
      console.log('Location tracking started for location alarms');
    } catch (error) {
      console.error('Failed to start location tracking:', error);
      throw error;
    }
  }

  async stopLocationTracking(): Promise<void> {
    if (this.locationSubscription) {
      this.locationSubscription.remove();
      this.locationSubscription = null;
    }
    this.isTracking = false;
    this.activeLocationAlarms.clear();
    console.log('Location tracking stopped');
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


  addLocationAlarm(alarm: Alarm): void {
    if (!alarm.isLocationBased || !alarm.targetLocation) {
      console.warn('Attempted to add non-location alarm to location tracking');
      return;
    }

    this.activeLocationAlarms.set(alarm.id, {
      alarm,
      currentLocation: {} as Location.LocationObject,
      isInRange: false,
      distance: Infinity,
    });

    console.log(`Added location alarm: ${alarm.label} for location ${alarm.targetLocation.address}`);
  }

  removeLocationAlarm(alarmId: string): void {
    this.activeLocationAlarms.delete(alarmId);
    console.log(`Removed location alarm: ${alarmId}`);
  }

  updateLocationAlarms(alarms: Alarm[]): void {
    this.activeLocationAlarms.clear();

    alarms
      .filter(alarm => alarm.isEnabled && alarm.isLocationBased && alarm.targetLocation)
      .forEach(alarm => this.addLocationAlarm(alarm));

    console.log(`Updated location alarms. Active count: ${this.activeLocationAlarms.size}`);
  }

  getActiveLocationAlarms(): LocationAlarmConfig[] {
    return Array.from(this.activeLocationAlarms.values());
  }

  getLocationAlarmStatus(alarmId: string): LocationAlarmConfig | null {
    return this.activeLocationAlarms.get(alarmId) || null;
  }


  async saveLocationToHistory(location: LocationType): Promise<void> {
    try {
      const existingHistory = await this.loadLocationHistory();
     
      const filteredHistory = existingHistory.filter(
        (item) => 
          item.id !== location.id && 
          !(item.coordinates.latitude === location.coordinates.latitude && 
            item.coordinates.longitude === location.coordinates.longitude)
      );
      
      const updatedHistory = [location, ...filteredHistory].slice(0, 20);
      
      await AsyncStorage.setItem(LOCATION_HISTORY_KEY, JSON.stringify(updatedHistory));
    } catch (error) {
      console.error('Failed to save location to history:', error);
      throw new Error('Failed to save location to history');
    }
  }

  async loadLocationHistory(): Promise<LocationType[]> {
    try {
      const historyJson = await AsyncStorage.getItem(LOCATION_HISTORY_KEY);
      if (!historyJson) {
        return [];
      }
      
      const history = JSON.parse(historyJson);
      return Array.isArray(history) ? history : [];
    } catch (error) {
      console.error('Failed to load location history:', error);
      return [];
    }
  }

  async clearLocationHistory(): Promise<void> {
    try {
      await AsyncStorage.removeItem(LOCATION_HISTORY_KEY);
    } catch (error) {
      console.error('Failed to clear location history:', error);
      throw new Error('Failed to clear location history');
    }
  }

  async removeLocationFromHistory(locationId: string): Promise<void> {
    try {
      const existingHistory = await this.loadLocationHistory();
      const updatedHistory = existingHistory.filter(item => item.id !== locationId);
      
      await AsyncStorage.setItem(LOCATION_HISTORY_KEY, JSON.stringify(updatedHistory));
    } catch (error) {
      console.error('Failed to remove location from history:', error);
      throw new Error('Failed to remove location from history');
    }
  }


  private async handleLocationUpdate(location: Location.LocationObject): Promise<void> {
    for (const [alarmId, config] of this.activeLocationAlarms) {
      const { alarm } = config;
      
      if (!alarm.targetLocation) continue;

      const distance = calculateDistance(
        location.coords.latitude,
        location.coords.longitude,
        alarm.targetLocation.coordinates.latitude,
        alarm.targetLocation.coordinates.longitude
      ) * 1000;

      const radiusMeters = alarm.radiusMeters || 100;
      const wasInRange = config.isInRange;
      const isInRange = distance <= radiusMeters;

      const updatedConfig: LocationAlarmConfig = {
        ...config,
        currentLocation: location,
        isInRange,
        distance,
      };

      if (!isInRange && distance > radiusMeters) {
        try {
          const routeInfo = await getDirections(
            { latitude: location.coords.latitude, longitude: location.coords.longitude },
            { latitude: alarm.targetLocation.coordinates.latitude, longitude: alarm.targetLocation.coordinates.longitude },
            'driving'
          );
          
          if (routeInfo) {
            updatedConfig.estimatedArrivalTime = Math.ceil(routeInfo.duration.value / 60);
          }
        } catch (error) {
          console.warn('Failed to get route information:', error);
        }
      }

      this.activeLocationAlarms.set(alarmId, updatedConfig);

      if (this.shouldTriggerAlarm(alarm, wasInRange, isInRange)) {
        await this.triggerLocationAlarm(alarm, updatedConfig);
      }
    }
  }

  private shouldTriggerAlarm(alarm: Alarm, wasInRange: boolean, isInRange: boolean): boolean {
    if (alarm.arrivalTrigger) {
      return !wasInRange && isInRange;
    } else {
      return wasInRange && !isInRange;
    }
  }

  private async triggerLocationAlarm(alarm: Alarm, config: LocationAlarmConfig): Promise<void> {
    console.log(`Triggering location alarm: ${alarm.label}`);
    
    const title = alarm.arrivalTrigger 
      ? `Arrived at ${alarm.targetLocation?.address || 'destination'}!`
      : `Left ${alarm.targetLocation?.address || 'location'}!`;
    
    const body = `Alarm: ${alarm.label}`;
    
    await notificationManager.showLocationAlarmNotification(alarm, title, body);

    if (this.onAlarmTrigger) {
      this.onAlarmTrigger(alarm);
    }

    if (alarm.deleteAfterNotification) {
      this.removeLocationAlarm(alarm.id);
    }
  }
}

export const locationService = LocationService.getInstance();
export default locationService;
