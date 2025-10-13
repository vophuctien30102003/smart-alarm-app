import { Alarm } from '@/types/AlarmClock';
import { AlarmHistory } from '@/types/AlarmHistory';
import { calculateDistance } from '@/utils/calculateDistanceUtils';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import * as Location from 'expo-location';

export class LocationAlarmManager {
  private static instance: LocationAlarmManager;
  private isTracking = false;
  private activeAlarms: Map<string, Alarm> = new Map();
  private locationSubscription: Location.LocationSubscription | null = null;
  private checkInterval: any = null;
  private sound: Audio.Sound | null = null;

  private constructor() {}

  static getInstance(): LocationAlarmManager {
    if (!LocationAlarmManager.instance) {
      LocationAlarmManager.instance = new LocationAlarmManager();
    }
    return LocationAlarmManager.instance;
  }

  async startLocationTracking(): Promise<void> {
    if (this.isTracking) {
      console.log('Location tracking already active');
      return;
    }

    try {
      // Request permissions
      const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
      if (foregroundStatus !== 'granted') {
        throw new Error('Foreground location permission not granted');
      }

      const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
      if (backgroundStatus !== 'granted') {
        console.warn('Background location permission not granted - limited functionality');
      }

      // Start location updates
      this.locationSubscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 10000, // 10 seconds
          distanceInterval: 50, // 50 meters
        },
        (location) => {
          this.handleLocationUpdate(location);
        }
      );

      this.isTracking = true;
      console.log('Location tracking started');

      // Backup interval check (in case location updates fail)
      this.checkInterval = setInterval(async () => {
        try {
          const location = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.High,
          });
          this.handleLocationUpdate(location);
        } catch (error) {
          console.error('Error getting current location:', error);
        }
      }, 15000); // 15 seconds

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

    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }

    if (this.sound) {
      await this.sound.unloadAsync();
      this.sound = null;
    }

    this.isTracking = false;
    this.activeAlarms.clear();
    console.log('Location tracking stopped');
  }

  addLocationAlarm(alarm: Alarm): void {
    if (!alarm.isLocationBased || !alarm.targetLocation) {
      console.warn('Invalid location alarm');
      return;
    }

    this.activeAlarms.set(alarm.id, alarm);
    console.log(`Added location alarm: ${alarm.label}`);
  }

  removeLocationAlarm(alarmId: string): void {
    this.activeAlarms.delete(alarmId);
    console.log(`Removed location alarm: ${alarmId}`);
  }

  private async handleLocationUpdate(location: Location.LocationObject): Promise<void> {
    if (!this.isTracking || this.activeAlarms.size === 0) {
      return;
    }

    const currentCoords = {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    };

    console.log('Current location:', currentCoords);

    for (const [alarmId, alarm] of this.activeAlarms) {
      if (!alarm.targetLocation) continue;

      const distance = calculateDistance(
        currentCoords.latitude,
        currentCoords.longitude,
        alarm.targetLocation.coordinates.latitude,
        alarm.targetLocation.coordinates.longitude
      );

      const distanceInMeters = distance * 1000;
      const radiusMeters = alarm.radiusMeters || 500;

      console.log(`Alarm ${alarm.label}: distance=${distanceInMeters.toFixed(0)}m, radius=${radiusMeters}m`);

      if (distanceInMeters <= radiusMeters) {
        console.log(`🚨 ALARM TRIGGERED! ${alarm.label} - Distance: ${distanceInMeters.toFixed(0)}m`);
        await this.triggerAlarm(alarm, distance);
        
        // Remove one-time alarms
        if (alarm.deleteAfterNotification) {
          this.removeLocationAlarm(alarmId);
        }
      }
    }
  }

  private async triggerAlarm(alarm: Alarm, distance: number): Promise<void> {
    try {
      // Haptic feedback
      if (alarm.vibrate) {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      // Play sound
      if (alarm.sound) {
        await this.playAlarmSound(alarm);
      }

      // Save to history
      await this.saveAlarmToHistory(alarm, distance);

      // Show notification (in a real app, you'd use expo-notifications)
      console.log(`🔔 Alarm notification: ${alarm.label}`);
      
    } catch (error) {
      console.error('Error triggering alarm:', error);
    }
  }

  private async playAlarmSound(alarm: Alarm): Promise<void> {
    try {
      if (this.sound) {
        await this.sound.unloadAsync();
      }

      // In a real app, you'd have different sound files
      // For now, we'll use a system sound or skip the actual sound file
      // const soundFile = require('@/assets/sound/alarm.mp3');
      
      // For demo purposes, we'll skip the actual sound file
      // const { sound } = await Audio.Sound.createAsync(soundFile, {
      //   shouldPlay: true,
      //   volume: alarm.volume || 0.8,
      //   isLooping: false,
      // });
      
      console.log(`🔊 Playing alarm sound for: ${alarm.label}`);

      // this.sound = sound;

      // Auto-stop after 30 seconds (commented out for demo)
      // setTimeout(async () => {
      //   if (this.sound) {
      //     await this.sound.stopAsync();
      //     await this.sound.unloadAsync();
      //     this.sound = null;
      //   }
      // }, 30000);

    } catch (error) {
      console.error('Error playing alarm sound:', error);
    }
  }

  private async saveAlarmToHistory(alarm: Alarm, distance: number): Promise<void> {
    try {
      if (!alarm.targetLocation) return;

      const historyItem: AlarmHistory = {
        id: `${Date.now()}-${Math.random()}`,
        name: alarm.targetLocation.name,
        address: alarm.targetLocation.address,
        distance: distance,
        timestamp: new Date(),
        radius: alarm.radiusMeters || 500,
        timeBeforeArrival: 5, // This should come from the alarm config
        sound: 'Default', // alarm.sound?.name || 'Default',
        repeat: alarm.repeatDays.length > 0 ? 'Custom' : 'Once',
        lineName: alarm.label.split(' - ')[0] || 'Unknown Line',
        coordinates: alarm.targetLocation.coordinates,
      };

      const ALARM_HISTORY_KEY = 'alarm_history';
      const existingHistory = await AsyncStorage.getItem(ALARM_HISTORY_KEY);
      const history: AlarmHistory[] = existingHistory ? JSON.parse(existingHistory) : [];
      history.unshift(historyItem);
      
      // Keep only last 50 items
      const limitedHistory = history.slice(0, 50);
      
      await AsyncStorage.setItem(ALARM_HISTORY_KEY, JSON.stringify(limitedHistory));
      console.log('Alarm saved to history');

    } catch (error) {
      console.error('Error saving alarm to history:', error);
    }
  }

  async stopAlarmSound(): Promise<void> {
    if (this.sound) {
      await this.sound.stopAsync();
      await this.sound.unloadAsync();
      this.sound = null;
    }
  }

  getActiveAlarmsCount(): number {
    return this.activeAlarms.size;
  }

  isTrackingActive(): boolean {
    return this.isTracking;
  }
}

export default LocationAlarmManager;
