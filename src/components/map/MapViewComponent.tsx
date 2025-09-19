import { useCurrentLocation } from "@/hooks/useCurrentLocation";
import { AppleMaps, GoogleMaps } from "expo-maps";
import { AppleMapsMapType } from "expo-maps/build/apple/AppleMaps.types";
import { GoogleMapsMapType } from "expo-maps/build/google/GoogleMaps.types";
import React, { useEffect, useRef } from "react";
import { Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const SF_ZOOM = 15;

export default function MapViewScreen() {
  const ref = useRef<AppleMaps.MapView | GoogleMaps.MapView>(null);
  
  const { currentLocation, loading, getCurrentLocation } = useCurrentLocation();

  useEffect(() => {
    if (!currentLocation && !loading) {
      getCurrentLocation();
    }
  }, [currentLocation, loading, getCurrentLocation]);

  const cameraPosition = currentLocation ? {
    coordinates: {
      latitude: currentLocation.latitude,
      longitude: currentLocation.longitude,
    },
    zoom: SF_ZOOM,
  } : undefined;

  const allMarkers = currentLocation ? [{
    coordinates: { 
      latitude: currentLocation.latitude, 
      longitude: currentLocation.longitude 
    },
    title: "Vị trí hiện tại",
    snippet: "vị trí hiện tại",
    draggable: false,
  }] : [];

  const allMarkersApple = currentLocation ? [{
    coordinates: { 
      latitude: currentLocation.latitude, 
      longitude: currentLocation.longitude 
    },
    title: "Vị trí hiện tại",
    tintColor: "vị trí hiện tại",
    systemImage: "location.fill",
  }] : [];

  const renderCurrentLocationButton = () => (
    <TouchableOpacity
      style={styles.currentLocationButton}
      onPress={async () => {
        if (loading) return;
        
        await getCurrentLocation();
        
        setTimeout(() => {
          if (currentLocation && ref.current && 'setCameraPosition' in ref.current) {
            ref.current.setCameraPosition({
              coordinates: {
                latitude: currentLocation.latitude,
                longitude: currentLocation.longitude,
              },
              zoom: SF_ZOOM,
            });
          }
        }, 100);
      }}
      disabled={loading}
    >
      <Text style={styles.buttonText}>
        {loading ? "Đang tải..." : "📍 Vị trí của tôi"}
      </Text>
    </TouchableOpacity>
  );

  if (Platform.OS === "ios") {
    return (
      <View style={styles.container}>
        <AppleMaps.View
          ref={ref as React.RefObject<AppleMaps.MapView>}
          style={styles.mapView}
          cameraPosition={cameraPosition}
          properties={{
            isTrafficEnabled: false,
            mapType: AppleMapsMapType.STANDARD,
            selectionEnabled: true,
          }}
          markers={allMarkersApple}
        />
        <SafeAreaView
          style={styles.overlay}
          pointerEvents="box-none"
        >
          {renderCurrentLocationButton()}
        </SafeAreaView>
      </View>
    );
  } else if (Platform.OS === "android") {
    return (
      <View style={styles.container}>
        <GoogleMaps.View
          ref={ref as React.RefObject<GoogleMaps.MapView>}
          style={styles.mapView}
          cameraPosition={cameraPosition}
          properties={{
            isBuildingEnabled: true,
            isIndoorEnabled: true,
            mapType: GoogleMapsMapType.TERRAIN,
            selectionEnabled: true,
            isMyLocationEnabled: false,
            isTrafficEnabled: true,
          }}
          markers={allMarkers}
        />
        <SafeAreaView style={styles.overlay} pointerEvents="box-none">
          {renderCurrentLocationButton()}
        </SafeAreaView>
      </View>
    );
  } else {
    return <Text>Maps are only available on Android and iOS</Text>;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  mapView: {
    flex: 1,
    margin: 10,
    borderRadius: 15,
    overflow: 'hidden',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 40,
    pointerEvents: 'box-none',
  },
  currentLocationButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
  },
});
