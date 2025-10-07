import Mapbox, { Camera, LocationPuck, MapView, ShapeSource } from '@rnmapbox/maps';
import * as Location from 'expo-location';
import { useEffect, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';

Mapbox.setAccessToken('pk.eyJ1Ijoidm9waHVjdGllbjMwMTAiLCJhIjoiY21nM3psZ3NsMTd6aTJsczJ5MGo4dmFpbCJ9.ABrFoQw0bfcofGgV9j0A7A');

export default function MapViewComponent() {
  const [hasLocationPermission, setHasLocationPermission] = useState<boolean>(false);
  const [currentLocation, setCurrentLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  useEffect(() => {
    requestLocationPermission();
  }, []);

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Location permission is required to show your position on the map',
          [{ text: 'OK' }]
        );
        return;
      }
      
      setHasLocationPermission(true);
      
      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      
      setCurrentLocation({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      });
    } catch (error) {
      console.error('Error requesting location permission:', error);
      Alert.alert('Error', 'Could not access location services');
    }
  };

  return (
    <View style={styles.container}>
      <MapView 
        style={styles.map}
        styleURL={Mapbox.StyleURL.Street}
        logoEnabled={false}
      >
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
            <LocationPuck 
              puckBearingEnabled
              puckBearing="heading"
              pulsing={{isEnabled: true}}
            />
            <ShapeSource id="scooters" ></ShapeSource>
          </>
        )}
      </MapView>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1, 
  },
});