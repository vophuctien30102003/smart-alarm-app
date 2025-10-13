import { MapAlarm } from '@/types/MapAlarm';
import { calculateDistance } from '@/utils/calculateDistanceUtils';
import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import * as Location from 'expo-location';

export class MapLocationTracker {
  private static instance: MapLocationTracker;
  private isTracking = false;
  private trackingInterval: any = null;
  private activeAlarms: Map<string, MapAlarm> = new Map();
  private triggeredAlarms: Set<string> = new Set(); // Prevent multiple triggers
  private sound: Audio.Sound | null = null;

  private constructor() {}

  static getInstance(): MapLocationTracker {
    if (!MapLocationTracker.instance) {
      MapLocationTracker.instance = new MapLocationTracker();
    }
    return MapLocationTracker.instance;
  }

  async startTracking(alarms: MapAlarm[]): Promise<void> {
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

      // Update active alarms
      this.updateActiveAlarms(alarms);

      if (this.activeAlarms.size === 0) {
        console.log('No active alarms to track');
        return;
      }

      // Start location tracking
      this.isTracking = true;
      this.trackingInterval = setInterval(async () => {
        await this.checkLocation();
      }, 10000); // Check every 10 seconds

      console.log(`🔍 Location tracking started for ${this.activeAlarms.size} alarms`);

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

    if (this.sound) {
      this.sound.unloadAsync().catch(console.error);
      this.sound = null;
    }

    console.log('🛑 Location tracking stopped');
  }

  updateActiveAlarms(alarms: MapAlarm[]): void {
    this.activeAlarms.clear();
    this.triggeredAlarms.clear();

    const activeAlarms = alarms.filter(alarm => alarm.isActive);
    activeAlarms.forEach(alarm => {
      this.activeAlarms.set(alarm.id, alarm);
    });

    console.log(`📍 Updated active alarms: ${this.activeAlarms.size}`);

    // Start or stop tracking based on active alarms
    if (this.activeAlarms.size === 0 && this.isTracking) {
      this.stopTracking();
    } else if (this.activeAlarms.size > 0 && !this.isTracking) {
      this.startTracking(alarms);
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

      console.log(`📍 Current location: ${currentCoords.latitude.toFixed(6)}, ${currentCoords.longitude.toFixed(6)}`);

      for (const [alarmId, alarm] of this.activeAlarms) {
        // Skip if already triggered (prevent spam)
        if (this.triggeredAlarms.has(alarmId)) {
          continue;
        }

        const distance = calculateDistance(
          currentCoords.latitude,
          currentCoords.longitude,
          alarm.lat,
          alarm.long
        );

        const distanceInMeters = distance * 1000;

        console.log(`🎯 ${alarm.lineName}: ${distanceInMeters.toFixed(0)}m from target (radius: ${alarm.radius}m)`);

        if (distanceInMeters <= alarm.radius) {
          console.log(`🚨 ALARM TRIGGERED! ${alarm.lineName}`);
          await this.triggerAlarm(alarm, distance);
          
          // Mark as triggered to prevent repeated notifications
          this.triggeredAlarms.add(alarmId);
          
          // For "Once" alarms, we might want to disable them
          if (alarm.repeat === 'Once') {
            // The store will handle disabling the alarm
            // This is just for local tracking prevention
          }
        }
      }

    } catch (error) {
      console.error('Error checking location:', error);
    }
  }

  private async triggerAlarm(alarm: MapAlarm, distance: number): Promise<void> {
    try {
      console.log(`🔔 Triggering alarm: ${alarm.lineName}`);

      // Haptic feedback
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // Play sound
      await this.playAlarmSound(alarm);

      // Log alarm trigger (in a real app, you might want to save this to history)
      console.log(`📝 Alarm logged: ${alarm.lineName} at ${distance.toFixed(2)}km`);

    } catch (error) {
      console.error('Error triggering alarm:', error);
    }
  }

  private async playAlarmSound(alarm: MapAlarm): Promise<void> {
    try {
      // Stop previous sound if playing
      if (this.sound) {
        await this.sound.unloadAsync();
        this.sound = null;
      }

      // In a real app, you would load different sound files based on alarm.sound
      // For now, we'll use a system sound or skip the actual audio
      console.log(`🔊 Playing sound: ${alarm.sound} for ${alarm.lineName}`);

      // Simulate sound duration
      setTimeout(async () => {
        if (this.sound) {
          await this.sound.unloadAsync();
          this.sound = null;
        }
      }, 10000); // Stop after 10 seconds

    } catch (error) {
      console.error('Error playing alarm sound:', error);
    }
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
