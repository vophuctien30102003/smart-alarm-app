import { useLocationTracking } from '@/hooks/useLocationTracking';
import notificationManager from '@/lib/NotificationManager';
import { useAlarmStore } from '@/store/alarmStore';
import { Alarm } from '@/types/AlarmClock';
import * as Location from 'expo-location';
import React, { useCallback, useEffect, useRef } from 'react';
import { Alert } from 'react-native';

interface LocationAlarmProviderProps {
  children: React.ReactNode;
}

export default function LocationAlarmProvider({ children }: LocationAlarmProviderProps) {
  const { alarms } = useAlarmStore();
  const handlerRef = useRef<((alarm: Alarm, isArrival: boolean) => Promise<void>) | null>(null);
  
  const {
    tracking,
    startTracking,
    stopTracking,
    addLocationAlarm,
  } = useLocationTracking({
    accuracy: Location.Accuracy.High,
    timeInterval: 10000,
    distanceInterval: 25,
    enableBackground: true,
  });

  const handleAlarmTrigger = useCallback(async (alarm: Alarm, isArrival: boolean) => {
    console.log(`🚨 Location alarm triggered: ${alarm.label} (${isArrival ? 'arrival' : 'departure'})`);
    
    try {
      const title = isArrival 
        ? `Arrived at ${alarm.targetLocation?.name || 'destination'}!`
        : `Left ${alarm.targetLocation?.name || 'location'}!`;
      
      const body = `Alarm: ${alarm.label}`;
      
      await notificationManager.showLocationAlarmNotification(alarm, title, body);

      Alert.alert(
        title,
        body,
        [
          { text: 'OK', style: 'default' }
        ]
      );

      if (alarm.vibrate) {
        try {
          const Haptics = await import('expo-haptics');
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        } catch (hapticsError) {
          console.warn('Haptics not available:', hapticsError);
        }
      }

    } catch (error) {
      console.error('Error handling alarm trigger:', error);
    }
  }, []);

  // Update the handler ref
  handlerRef.current = handleAlarmTrigger;

  useEffect(() => {
    const locationBasedAlarms = alarms.filter(
      alarm => alarm.isEnabled && alarm.isLocationBased && alarm.targetLocation
    );

    if (locationBasedAlarms.length > 0) {
      locationBasedAlarms.forEach(alarm => {
        if (!alarm.targetLocation) return;

        const onEnter = () => {
          if (alarm.arrivalTrigger && handlerRef.current) {
            handlerRef.current(alarm, true);
          }
        };

        const onExit = () => {
          if (!alarm.arrivalTrigger && handlerRef.current) {
            handlerRef.current(alarm, false);
          }
        };

        addLocationAlarm(
          alarm.id,
          alarm.targetLocation,
          alarm.radiusMeters || 100,
          alarm.arrivalTrigger || true,
          onEnter,
          onExit
        );
      });
      startTracking();
    } else {
      stopTracking();
    }
  }, [alarms, addLocationAlarm, startTracking, stopTracking]);

  useEffect(() => {
    if (tracking.error && tracking.error.includes('permission')) {
      Alert.alert(
        'Location Permission Required',
        'Location alarms require location permission to work properly. Please enable location access in your device settings.',
        [
          { text: 'OK', style: 'default' }
        ]
      );
    }
  }, [tracking.error]);

  return <>{children}</>;
}
