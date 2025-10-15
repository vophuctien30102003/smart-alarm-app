import { useMapboxSearch } from "@/hooks/useMapboxSearch";
import { useLocationStore } from "@/store/locationStore";
import { useMapAlarmStore } from "@/store/mapAlarmStore";
import { Ionicons } from "@expo/vector-icons";
import BottomSheet, { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    SafeAreaView,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { LegacyLocationType, MapAlarm } from "../../shared/types";
import { calculateDistance } from "../../shared/utils/locationUtils";
import { Text } from "../ui";

interface SearchLocationBottomSheetProps {
    currentLocation?: {
        latitude: number;
        longitude: number;
    } | null;
}

const SearchLocationBottomSheetComponent = React.memo(({ currentLocation }: SearchLocationBottomSheetProps) => {
    const [searchQuery, setSearchQuery] = useState("");
    const { results, loading } = useMapboxSearch(searchQuery);
    const { selectedDestination, setSelectedDestination } = useLocationStore();
    const { 
        setCurrentView, 
        loadRecentAlarms, 
        getRecentAlarms,
        setSelectedLocation 
    } = useMapAlarmStore();
    
    useEffect(() => {
        loadRecentAlarms();
    }, [loadRecentAlarms]);
    
    const recentAlarms = useMemo(() => getRecentAlarms(), [getRecentAlarms]);
    
    const handleLocationSelect = useCallback((item: any) => {
        const location: LegacyLocationType = {
            id: item.id,
            name: item.name,
            address: item.address,
            coordinates: {
                latitude: item.coordinates.latitude,
                longitude: item.coordinates.longitude
            },
            mapbox_id: item.mapbox_id,
        };
        
        setSelectedLocation(location);
        setSelectedDestination(location);
        setCurrentView('setAlarm');
        setSearchQuery("");
    }, [setSelectedLocation, setSelectedDestination, setCurrentView]);
    
    const handleRecentAlarmSelect = useCallback((alarm: MapAlarm) => {
        const location: LegacyLocationType = {
            id: alarm.id,
            name: alarm.name,
            address: alarm.address,
            coordinates: {
                latitude: alarm.lat,
                longitude: alarm.long
            },
            mapbox_id: alarm.mapbox_id,
        };
        
        setSelectedLocation(location);
        setSelectedDestination(location);
        setCurrentView('setAlarm');
    }, [setSelectedLocation, setSelectedDestination, setCurrentView]);

    // Helper function to calculate and format distance
    const getDistanceText = useCallback((targetLat: number, targetLng: number): string => {
        if (!currentLocation) return '';
        
        const distance = calculateDistance(
            { latitude: currentLocation.latitude, longitude: currentLocation.longitude },
            { latitude: targetLat, longitude: targetLng }
        );
        
        if (distance < 1) {
            return `${(distance * 1000).toFixed(0)}m away`;
        } else {
            return `${distance.toFixed(1)}km away`;
        }
    }, [currentLocation]);

    return (
        <View
            style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 1000,
            }}
        >
            <GestureHandlerRootView className="flex-1 bg-transparent">
                <BottomSheet
                    snapPoints={["25%", "50%", "75%"]}
                    backgroundStyle={{
                        backgroundColor: "rgba(20, 30, 48, 0.25)",
                    }}
                    handleStyle={{
                        backgroundColor: "transparent",
                    }}
                    handleIndicatorStyle={{
                        backgroundColor: "rgba(255,255,255,0.3)",
                    }}
                    enableContentPanningGesture={true}
                >
                    <SafeAreaView className="flex-1 bg-transparent">
                        <View className="flex-row items-center px-4 pt-4 pb-8">
                            <View className="flex-1 flex-row items-center bg-[#rgba(20, 30, 48, 0.25)] rounded-full h-16 px-4">
                                <Ionicons
                                    name="search"
                                    size={20}
                                    color="#D9D9D9"
                                    style={{ marginRight: 8 }}
                                />
                                <TextInput
                                    className="flex-1 text-[#D9D9D9] text-base h-11"
                                    placeholder="Search Maps"
                                    placeholderTextColor="rgba(255,255,255,0.7)"
                                    value={searchQuery}
                                    onChangeText={setSearchQuery}
                                    autoFocus
                                />
                            </View>
                        </View>
                        <BottomSheetScrollView
                            contentContainerStyle={{
                                padding: 16,
                                backgroundColor: "transparent",
                            }}
                            style={{ backgroundColor: "transparent" }}
                        >
                            {loading && (
                                <ActivityIndicator color="#fff" size="small" />
                            )}

                            {!loading &&
                                searchQuery &&
                                results.length > 0 &&
                                results.map((item, index) => (
                                    <TouchableOpacity
                                        key={item.mapbox_id || index}
                                        className="bg-white/10 p-4 rounded-2xl mb-2"
                                        onPress={() => handleLocationSelect(item)}
                                    >
                                        <View className="flex-row justify-between items-start">
                                            <View className="flex-1">
                                                <Text className="text-white text-base font-semibold">
                                                    {item.name || "Unknown place"}
                                                </Text>
                                                <Text className="text-gray-300 text-sm mt-1">
                                                    {item.address || "No address available"}
                                                </Text>
                                            </View>
                                            {currentLocation && (
                                                <Text className="text-blue-400 text-xs ml-2">
                                                    {getDistanceText(item.coordinates.latitude, item.coordinates.longitude)}
                                                </Text>
                                            )}
                                        </View>
                                    </TouchableOpacity>
                                ))}

                            {/* Recent Alarms Section */}
                            {!searchQuery && recentAlarms.length > 0 && (
                                <View className="mt-4">
                                    <Text className="text-white text-lg font-semibold mb-3 px-1">
                                        Recent Alarms
                                    </Text>
                                    {recentAlarms.slice(0, 5).map((alarm) => (
                                        <TouchableOpacity
                                            key={alarm.id}
                                            className="bg-white/10 p-4 rounded-2xl mb-2"
                                            onPress={() => handleRecentAlarmSelect(alarm)}
                                        >
                                            <View className="flex-row justify-between items-start">
                                                <View className="flex-1">
                                                    <Text className="text-white text-base font-semibold">
                                                        {alarm.lineName || alarm.name}
                                                    </Text>
                                                    <Text className="text-gray-300 text-sm mt-1">
                                                        {alarm.address}
                                                    </Text>
                                                    <View className="flex-row items-center mt-1">
                                                        <Text className="text-blue-400 text-xs">
                                                            Radius: {alarm.radius}m • {alarm.repeat}
                                                        </Text>
                                                        {currentLocation && (
                                                            <Text className="text-yellow-400 text-xs ml-2">
                                                                • {getDistanceText(alarm.lat, alarm.long)}
                                                            </Text>
                                                        )}
                                                    </View>
                                                </View>
                                                <View className="ml-3 flex items-center">
                                                    <View className={`w-3 h-3 rounded-full ${alarm.isActive ? 'bg-green-500' : 'bg-gray-500'}`} />
                                                </View>
                                            </View>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            )}

                            {selectedDestination && searchQuery === "" && (
                                <View className="mt-4 p-4 bg-green-500/20 rounded-2xl">
                                    <Text className="text-white text-lg font-semibold mb-2">
                                        Selected Destination
                                    </Text>
                                    <Text className="text-white text-base font-medium">
                                        {selectedDestination.name}
                                    </Text>
                                    <Text className="text-gray-300 text-sm mt-1 mb-4">
                                        {selectedDestination.address}
                                    </Text>
                                    <TouchableOpacity
                                        className="bg-blue-500 p-3 rounded-xl"
                                        onPress={() => setCurrentView('setAlarm')}
                                    >
                                        <Text className="text-white text-center font-semibold">
                                            Set Alarm
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            )}

                            {!loading &&
                                searchQuery &&
                                results.length === 0 && (
                                    <Text className="text-gray-400 text-center mt-4">
                                        No results found
                                    </Text>
                                )}
                        </BottomSheetScrollView>
                    </SafeAreaView>
                </BottomSheet>
            </GestureHandlerRootView>
        </View>
    );
});

SearchLocationBottomSheetComponent.displayName = 'SearchLocationBottomSheetComponent';

export default SearchLocationBottomSheetComponent;
