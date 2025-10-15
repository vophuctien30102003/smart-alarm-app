import * as Location from 'expo-location';

/**
 * Common interface for all location tracking services
 */
export interface ILocationTracker {
  /**
   * Start location tracking
   */
  startTracking(): Promise<void>;

  /**
   * Stop location tracking and cleanup
   */
  stopTracking(): Promise<void>;

  /**
   * Check if currently tracking
   */
  isTracking(): boolean;

  /**
   * Get number of active alarms being tracked
   */
  getActiveAlarmsCount(): number;
}

/**
 * Standardized location tracking configuration
 */
export interface LocationTrackingConfig {
  accuracy: Location.Accuracy;
  timeInterval: number; // milliseconds
  distanceInterval: number; // meters
  enableBackground: boolean;
}

/**
 * Standard location update event
 */
export interface LocationUpdateEvent {
  location: Location.LocationObject;
  timestamp: Date;
  accuracy: number;
}

/**
 * Alarm trigger callback signature
 */
export type AlarmTriggerCallback<T = any> = (alarm: T) => void;
