import { LocationType } from '@/types/Location';
import { calculateDistance } from '@/utils/calculateDistanceUtils';
import * as Location from 'expo-location';
import { useCallback, useEffect, useRef, useState } from 'react';

export interface LocationTracking {
  currentLocation: Location.LocationObject | null;
  isTracking: boolean;
  accuracy: Location.Accuracy;
  error: string | null;
  permissionStatus: Location.PermissionStatus | null;
}

export interface LocationAlarmTrigger {
  targetLocation: LocationType;
  radiusMeters: number;
  onEnter?: () => void;
  onExit?: () => void;
  arrivalTrigger: boolean;
}

interface UseLocationTrackingOptions {
  accuracy?: Location.Accuracy;
  timeInterval?: number;
  distanceInterval?: number;
  enableBackground?: boolean;
}

export function useLocationTracking(options: UseLocationTrackingOptions = {}) {
  const {
    accuracy = Location.Accuracy.High,
    timeInterval = 10000,
    distanceInterval = 50,
    enableBackground = false,
  } = options;

  const [tracking, setTracking] = useState<LocationTracking>({
    currentLocation: null,
    isTracking: false,
    accuracy,
    error: null,
    permissionStatus: null,
  });

  const [alarmTriggers, setAlarmTriggers] = useState<Map<string, LocationAlarmTrigger>>(new Map());
  const [triggeredAlarms, setTriggeredAlarms] = useState<Set<string>>(new Set());
  
  const watchSubscription = useRef<Location.LocationSubscription | null>(null);
  const lastKnownPositions = useRef<Map<string, boolean>>(new Map());

  const requestPermissions = useCallback(async () => {
    try {
      const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
      
      if (foregroundStatus !== 'granted') {
        setTracking(prev => ({
          ...prev,
          error: 'Foreground location permission denied',
          permissionStatus: foregroundStatus,
        }));
        return false;
      }

      if (enableBackground) {
        const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
        if (backgroundStatus !== 'granted') {
          console.warn('Background location permission denied');
        }
      }

      setTracking(prev => ({
        ...prev,
        error: null,
        permissionStatus: foregroundStatus,
      }));

      return true;
    } catch (error) {
      setTracking(prev => ({
        ...prev,
        error: `Permission error: ${error}`,
      }));
      return false;
    }
  }, [enableBackground]);

  // Check alarm triggers based on current location
  const checkAlarmTriggers = useCallback((location: Location.LocationObject) => {
    alarmTriggers.forEach((trigger, id) => {
      const distance = calculateDistance(
        location.coords.latitude,
        location.coords.longitude,
        trigger.targetLocation.coordinates.latitude,
        trigger.targetLocation.coordinates.longitude
      ) * 1000; // Convert to meters

      const isInRadius = distance <= trigger.radiusMeters;
      const wasInRadius = lastKnownPositions.current.get(id) || false;
      const hasTriggered = triggeredAlarms.has(id);

      // Update position tracking
      lastKnownPositions.current.set(id, isInRadius);

      // Check for trigger conditions (only trigger once per session)
      if (!hasTriggered) {
        if (trigger.arrivalTrigger && !wasInRadius && isInRadius) {
          // Entering the zone
          trigger.onEnter?.();
          setTriggeredAlarms(prev => new Set(prev).add(id));
        } else if (!trigger.arrivalTrigger && wasInRadius && !isInRadius) {
          // Leaving the zone
          trigger.onExit?.();
          setTriggeredAlarms(prev => new Set(prev).add(id));
        }
      }
    });
  }, [alarmTriggers, triggeredAlarms]);

  // Start location tracking
  const startTracking = useCallback(async () => {
    if (tracking.isTracking) return true;

    const hasPermission = await requestPermissions();
    if (!hasPermission) return false;

    try {
      const subscription = await Location.watchPositionAsync(
        {
          accuracy,
          timeInterval,
          distanceInterval,
        },
        (location) => {
          setTracking(prev => ({
            ...prev,
            currentLocation: location,
            error: null,
          }));

          // Check alarm triggers
          checkAlarmTriggers(location);
        }
      );

      watchSubscription.current = subscription;
      setTracking(prev => ({
        ...prev,
        isTracking: true,
        error: null,
      }));

      return true;
    } catch (error) {
      setTracking(prev => ({
        ...prev,
        error: `Failed to start tracking: ${error}`,
        isTracking: false,
      }));
      return false;
    }
  }, [tracking.isTracking, requestPermissions, accuracy, timeInterval, distanceInterval, checkAlarmTriggers]);

  // Stop location tracking
  const stopTracking = useCallback(() => {
    if (watchSubscription.current) {
      watchSubscription.current.remove();
      watchSubscription.current = null;
    }

    setTracking(prev => ({
      ...prev,
      isTracking: false,
      currentLocation: null,
    }));

    // Clear alarm states
    lastKnownPositions.current.clear();
    setTriggeredAlarms(new Set());
  }, []);

  // Get current location once
  const getCurrentLocation = useCallback(async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return null;

    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy,
      });

      setTracking(prev => ({
        ...prev,
        currentLocation: location,
        error: null,
      }));

      return location;
    } catch (error) {
      setTracking(prev => ({
        ...prev,
        error: `Failed to get location: ${error}`,
      }));
      return null;
    }
  }, [requestPermissions, accuracy]);

  // Add location alarm trigger
  const addLocationAlarm = useCallback((
    id: string,
    targetLocation: LocationType,
    radiusMeters: number,
    arrivalTrigger: boolean,
    onEnter?: () => void,
    onExit?: () => void
  ) => {
    const trigger: LocationAlarmTrigger = {
      targetLocation,
      radiusMeters,
      arrivalTrigger,
      onEnter,
      onExit,
    };

    setAlarmTriggers(prev => new Map(prev.set(id, trigger)));
    lastKnownPositions.current.set(id, false); // Start assuming outside radius
  }, []);

  // Remove location alarm trigger
  const removeLocationAlarm = useCallback((id: string) => {
    setAlarmTriggers(prev => {
      const newMap = new Map(prev);
      newMap.delete(id);
      return newMap;
    });
    lastKnownPositions.current.delete(id);
    setTriggeredAlarms(prev => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
  }, []);

  // Get distance to target location
  const getDistanceToLocation = useCallback((targetLocation: LocationType): number | null => {
    if (!tracking.currentLocation) return null;

    return calculateDistance(
      tracking.currentLocation.coords.latitude,
      tracking.currentLocation.coords.longitude,
      targetLocation.coordinates.latitude,
      targetLocation.coordinates.longitude
    ) * 1000; // Convert to meters
  }, [tracking.currentLocation]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopTracking();
    };
  }, [stopTracking]);

  return {
    tracking,
    alarmTriggers: Array.from(alarmTriggers.entries()),
    triggeredAlarms: Array.from(triggeredAlarms),
    startTracking,
    stopTracking,
    getCurrentLocation,
    addLocationAlarm,
    removeLocationAlarm,
    getDistanceToLocation,
  };
}
