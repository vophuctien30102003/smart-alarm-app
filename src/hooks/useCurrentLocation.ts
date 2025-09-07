import * as Location from "expo-location";
import { useCallback, useState } from "react";
import { Alert } from "react-native";

export function useCurrentLocation() {
  const [currentLocation, setCurrentLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  const getCurrentLocation = useCallback(async () => {
    if (loading) return; 
    
    setLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission denied",
          "Location permission is required to show your current location"
        );
        return;
      }

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      setCurrentLocation({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      });
    } catch (error) {
      console.error("Error getting current location:", error);
      Alert.alert("Error", "Could not get current location");
    } finally {
      setLoading(false);
    }
  }, [loading]);

  return { currentLocation, loading, getCurrentLocation };
}
