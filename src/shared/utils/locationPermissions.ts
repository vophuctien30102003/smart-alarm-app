import * as Location from 'expo-location';
import { ALARM_CONSTANTS } from '../constants';

/**
 * Shared location permission utilities
 */
export class LocationPermissionManager {
  private static permissionsCache: {
    foreground?: Location.PermissionStatus;
    background?: Location.PermissionStatus;
    lastChecked?: Date;
  } = {};

  /**
   * Request and validate location permissions
   * @returns Object with foreground and background permission status
   */
  static async requestLocationPermissions(): Promise<{
    foreground: Location.PermissionStatus;
    background: Location.PermissionStatus;
  }> {
    // Check cache first (avoid multiple permission requests)
    const now = new Date();
    if (
      this.permissionsCache.foreground &&
      this.permissionsCache.background &&
      this.permissionsCache.lastChecked &&
      now.getTime() - this.permissionsCache.lastChecked.getTime() < 30000 // 30 seconds cache
    ) {
      return {
        foreground: this.permissionsCache.foreground,
        background: this.permissionsCache.background,
      };
    }

    try {
      // Request foreground permission first
      const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
      
      // Only request background if foreground is granted
      let backgroundStatus = Location.PermissionStatus.DENIED;
      if (foregroundStatus === 'granted') {
        const { status } = await Location.requestBackgroundPermissionsAsync();
        backgroundStatus = status;
      }

      // Cache results
      this.permissionsCache = {
        foreground: foregroundStatus,
        background: backgroundStatus,
        lastChecked: now,
      };

      return {
        foreground: foregroundStatus,
        background: backgroundStatus,
      };
    } catch (error) {
      console.error('❌ LocationPermissionManager: Failed to request permissions', error);
      throw new Error('Failed to request location permissions');
    }
  }

  /**
   * Check if we have sufficient permissions for location tracking
   */
  static async hasLocationPermissions(): Promise<boolean> {
    try {
      const { foreground } = await this.requestLocationPermissions();
      return foreground === 'granted';
    } catch {
      return false;
    }
  }

  /**
   * Get standardized location watch options
   */
  static getLocationWatchOptions(): Location.LocationOptions {
    return {
      accuracy: Location.Accuracy.High,
      timeInterval: ALARM_CONSTANTS.LOCATION_UPDATE_INTERVAL,
      distanceInterval: ALARM_CONSTANTS.LOCATION_DISTANCE_INTERVAL,
    };
  }

  /**
   * Clear permissions cache (useful for testing or after permission changes)
   */
  static clearCache(): void {
    this.permissionsCache = {};
  }
}
