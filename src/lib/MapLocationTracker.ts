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

    if (this.sound) {
      this.sound.unloadAsync().catch(console.error);
      this.sound = null;
    }
  }

  updateActiveAlarms(alarms: MapAlarm[]): void {
    this.activeAlarms.clear();
    this.triggeredAlarms.clear();

    const activeAlarms = alarms.filter(alarm => alarm.isActive);
    activeAlarms.forEach(alarm => {
      this.activeAlarms.set(alarm.id, alarm);
    });


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


        if (distanceInMeters <= alarm.radius) {
          console.log(`🚨 ALARM TRIGGERED! ${alarm.lineName}`);
          await this.triggerAlarm(alarm, distance);
          
          this.triggeredAlarms.add(alarmId);
          
          if (alarm.repeat === 'Once') {
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
      if (this.sound) {
        await this.sound.unloadAsync();
        this.sound = null;
      }

      setTimeout(async () => {
        if (this.sound) {
          await this.sound.unloadAsync();
          this.sound = null;
        }
      }, 10000); 
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
