import { MapLocationTracker } from "@/services/MapLocationTracker";
import { useMapAlarmStore } from "@/store/mapAlarmStore";
import { Ionicons } from "@expo/vector-icons";
import Mapbox, {
    Camera,
    LocationPuck,
    MapView,
    ShapeSource,
} from "@rnmapbox/maps";
import Constants from "expo-constants";
import * as Location from "expo-location";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import AlarmHistoryComponent from "./AlarmHistoryComponent";
import SearchLocationBottomSheetComponent from "./SearchLocationBottomSheetComponent";
import SetAlarmComponent from "./SetAlarmComponent";

Mapbox.setAccessToken(Constants.expoConfig?.extra?.mapboxAccessToken);

export default function MapViewComponent() {
    const [hasLocationPermission, setHasLocationPermission] =
        useState<boolean>(false);
    const [currentLocation, setCurrentLocation] = useState<{
        latitude: number;
        longitude: number;
    } | null>(null);

    const { 
        currentView, 
        setCurrentView, 
        alarms, 
        loadRecentAlarms 
    } = useMapAlarmStore();

    // Memoize location tracker instance
    const locationTracker = useMemo(() => MapLocationTracker.getInstance(), []);

    // Memoize active alarms count
    const activeAlarmsCount = useMemo(() => 
        alarms.filter(alarm => alarm.isActive).length, 
        [alarms]
    );

    useEffect(() => {
        requestLocationPermission();
        loadRecentAlarms();
    }, [loadRecentAlarms]);

    // Update location tracker when alarms change
    useEffect(() => {
        locationTracker.updateActiveAlarms(alarms);
    }, [alarms, locationTracker]);

    // Memoize handlers to prevent re-renders
    const handleHistoryPress = useCallback(() => {
        console.log('🔘 History button pressed! Current view:', currentView);
        console.log('🔘 Setting view to history...');
        setCurrentView('history');
    }, [currentView, setCurrentView]);

    const handleSetAlarmClose = useCallback(() => {
        setCurrentView('search');
    }, [setCurrentView]);

    const handleHistoryClose = useCallback(() => {
        setCurrentView('search');
    }, [setCurrentView]);

    const requestLocationPermission = async () => {
        try {
            const { status } =
                await Location.requestForegroundPermissionsAsync();
            if (status !== "granted") {
                Alert.alert(
                    "Permission Required",
                    "Location permission is required to show your position on the map",
                    [{ text: "OK" }]
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
            console.error("Error requesting location permission:", error);
            Alert.alert("Error", "Could not access location services");
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
                                    ? [
                                          currentLocation.longitude,
                                          currentLocation.latitude,
                                      ]
                                    : undefined
                            }
                            followZoomLevel={16}
                        />
                        <LocationPuck
                            puckBearingEnabled
                            puckBearing="heading"
                            pulsing={{ isEnabled: true }}
                        />
                        <ShapeSource id="scooters"></ShapeSource>
                    </>
                )}
            </MapView>

            {/* Floating Action Button for Alarm History */}
            <TouchableOpacity
                style={styles.historyButton}
                onPress={handleHistoryPress}
                activeOpacity={0.7}
            >
                <Ionicons name="time-outline" size={24} color="#fff" />
                {activeAlarmsCount > 0 && (
                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>
                            {activeAlarmsCount}
                        </Text>
                    </View>
                )}
            </TouchableOpacity>

            {/* Always show search bottom sheet */}
            <SearchLocationBottomSheetComponent currentLocation={currentLocation} />

            {/* Conditionally show other components */}
            <SetAlarmComponent
                isVisible={currentView === 'setAlarm'}
                onClose={handleSetAlarmClose}
                currentLocation={currentLocation}
            />
            
            <AlarmHistoryComponent
                isVisible={currentView === 'history'}
                onClose={handleHistoryClose}
            />
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
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        zIndex: 1500, // Ensure button is above other elements
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
