import AlarmHistoryBottomSheet from '@/components/features/map/components/AlarmHistoryBottomSheet';
import SearchLocationBottomSheet from '@/components/features/map/components/SearchLocationBottomSheet';
import SetAlarmBottomSheet from '@/components/features/map/components/SetAlarmBottomSheet';
import { isLocationAlarm } from '@/shared/types/alarm.type';
import { selectAlarms, useAlarmStore } from '@/store/alarmStore';
import { mapAlarmActions, mapAlarmSelectors, migrateLegacyLocationAlarms, useMapAlarmStore } from '@/store/mapAlarmStore';
import { Ionicons } from '@expo/vector-icons';
import Mapbox, { Camera, LocationPuck, MapView, ShapeSource } from '@rnmapbox/maps';
import Constants from 'expo-constants';
import { useCallback, useEffect, useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import useLocationPermission from '@/hooks/useLocationPermission';

Mapbox.setAccessToken(Constants.expoConfig?.extra?.mapboxAccessToken);

const MapScreen = () => {
  const { hasLocationPermission, currentLocation } = useLocationPermission();
  const currentView = useMapAlarmStore(mapAlarmSelectors.currentView);
  const setCurrentView = useMapAlarmStore(mapAlarmActions.setCurrentView);
  const alarms = useAlarmStore(selectAlarms);
  const updateLocationAlarms = useAlarmStore(state => state.updateLocationAlarms);
  const startLocationTracking = useAlarmStore(state => state.startLocationTracking);

  const locationAlarms = useMemo(() => alarms.filter(isLocationAlarm), [alarms]);
  const locationAlarmsSignature = useMemo(
    () =>
      locationAlarms
        .map(alarm => `${alarm.id}:${alarm.isEnabled}:${alarm.updatedAt}`)
        .join('|'),
    [locationAlarms],
  );
  const activeAlarmsCount = useMemo(
    () => locationAlarms.filter(alarm => alarm.isEnabled).length,
    [locationAlarms],
  );

  useEffect(() => {
    void migrateLegacyLocationAlarms().then(() => {
      void updateLocationAlarms();
      void startLocationTracking();
    });
  }, [startLocationTracking, updateLocationAlarms]);

  useEffect(() => {
    void updateLocationAlarms();
  }, [updateLocationAlarms, locationAlarmsSignature]);

  const handleHistoryPress = useCallback(() => {
    setCurrentView('history');
  }, [setCurrentView]);

  const handleSetAlarmClose = useCallback(() => {
    setCurrentView('search');
  }, [setCurrentView]);

  const handleHistoryClose = useCallback(() => {
    setCurrentView('search');
  }, [setCurrentView]);

  return (
    <View style={styles.container}>
      <MapView style={styles.map} styleURL={Mapbox.StyleURL.Street} logoEnabled={false}>
        {hasLocationPermission && (
          <>
            <Camera
              followUserLocation
              animationDuration={1000}
              centerCoordinate={
                currentLocation
                  ? [currentLocation.longitude, currentLocation.latitude]
                  : undefined
              }
              followZoomLevel={16}
            />
            <LocationPuck puckBearingEnabled puckBearing="heading" pulsing={{ isEnabled: true }} />
            <ShapeSource id="scooters" />
          </>
        )}
      </MapView>

      <TouchableOpacity style={styles.historyButton} onPress={handleHistoryPress} activeOpacity={0.7}>
        <Ionicons name="time-outline" size={24} color="#fff" />
        {activeAlarmsCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{activeAlarmsCount}</Text>
          </View>
        )}
      </TouchableOpacity>

      <SearchLocationBottomSheet currentLocation={currentLocation} />

      <SetAlarmBottomSheet
        isVisible={currentView === 'setAlarm'}
        onClose={handleSetAlarmClose}
        currentLocation={currentLocation}
      />

      <AlarmHistoryBottomSheet isVisible={currentView === 'history'} onClose={handleHistoryClose} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  historyButton: {
    position: 'absolute',
    top: 60,
    right: 16,
    backgroundColor: '#3B82F6',
    borderRadius: 24,
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 1500,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default MapScreen;
