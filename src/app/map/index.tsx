import LocationAlarmManager from "@/components/alarm/LocationAlarmManager";
import LocationAlarmStatus from "@/components/alarm/LocationAlarmStatus";
import AddLocationModal from "@/components/map/AddLocationModal";
import FavoriteLocationList from "@/components/map/FavoriteLocationList";
import LocationHistoryList from "@/components/map/LocationHistoryList";
import MapViewComponent from "@/components/map/MapViewComponent";
import { locationHistoryService } from "@/services/locationService";
import { useLocationStore } from "@/store/locationStore";
import { LocationType } from "@/types/Location";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
    KeyboardAvoidingView,
    Platform,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function MapScreen() {
    const [showAddModal, setShowAddModal] = useState(false);
    const [showAlarmForm, setShowAlarmForm] = useState(false);
    const [selectedLocationForAlarm, setSelectedLocationForAlarm] =
        useState<LocationType | null>(null);
    const [activeTab, setActiveTab] = useState<"map" | "favorites" | "history">(
        "map"
    );
    const [selectedLocation, setSelectedLocation] =
        useState<LocationType | null>(null);
    const [historyCount, setHistoryCount] = useState(0);

    const { favoriteLocations } = useLocationStore();

    // Load history count for tab display
    useEffect(() => {
        const loadHistoryCount = async () => {
            try {
                const history = await locationHistoryService.loadLocationHistory();
                setHistoryCount(history.length);
            } catch (error) {
                console.error('Failed to load history count:', error);
            }
        };
        
        loadHistoryCount();
        
        // Reload count when tab becomes active
        if (activeTab === 'history') {
            loadHistoryCount();
        }
    }, [activeTab]);

    const handleCreateAlarmForLocation = (location: LocationType) => {
        setSelectedLocationForAlarm(location);
        setShowAlarmForm(true);
    };

    const handleLocationSelect = (location: LocationType) => {
        setSelectedLocation(location);
    };

    const handleMarkerPress = (location: LocationType) => {
        setSelectedLocation(location);
    };

    const renderTabContent = () => {
        switch (activeTab) {
            case "map":
                return (
                    <View className="flex-1">
                        <View className="px-4 py-3 bg-white border-b border-gray-200"></View>

                        <View className="flex-1 pb-[50px]">
                            <MapViewComponent />
                        </View>

                        {selectedLocation && (
                            <View className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-lg border-t border-gray-200">
                                <View className="w-12 h-1 bg-gray-300 rounded-full mx-auto mt-3 mb-4" />
                                <View className="px-4 pb-6">
                                    <Text className="text-lg font-bold text-gray-900 mb-1">
                                        {selectedLocation.name}
                                    </Text>
                                    <Text className="text-sm text-gray-600 mb-4">
                                        {selectedLocation.address}
                                    </Text>

                                    <View className="flex-row space-x-3">
                                        <TouchableOpacity
                                            onPress={() =>
                                                handleCreateAlarmForLocation(
                                                    selectedLocation
                                                )
                                            }
                                            className="flex-1 bg-blue-500 flex-row items-center justify-center py-3 rounded-lg"
                                        >
                                            <Ionicons
                                                name="alarm"
                                                size={18}
                                                color="white"
                                            />
                                            <Text className="text-white font-semibold ml-2">
                                                Create Alarm
                                            </Text>
                                        </TouchableOpacity>

                                        <TouchableOpacity
                                            onPress={() => {
                                                setSelectedLocationForAlarm(
                                                    selectedLocation
                                                );
                                                setShowAddModal(true);
                                            }}
                                            className="flex-1 bg-green-500 flex-row items-center justify-center py-3 rounded-lg"
                                        >
                                            <Ionicons
                                                name="heart"
                                                size={18}
                                                color="white"
                                            />
                                            <Text className="text-white font-semibold ml-2">
                                                Save
                                            </Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                        )}
                    </View>
                );
            case "favorites":
                return (
                    <FavoriteLocationList
                        onCreateAlarm={handleCreateAlarmForLocation}
                        onLocationSelect={handleLocationSelect}
                    />
                );
            case "history":
                return (
                    <LocationHistoryList
                        onCreateAlarm={handleCreateAlarmForLocation}
                        onLocationSelect={handleLocationSelect}
                    />
                );
            default:
                return null;
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            <KeyboardAvoidingView
                className="flex-1"
                behavior={Platform.OS === "ios" ? "padding" : "height"}
            >
                {/* Header */}
                <View className="bg-white shadow-sm border-b border-gray-200">
                    <View className="px-4 py-3">
                        <Text className="text-2xl font-bold text-gray-900">
                            Location
                        </Text>
                    </View>

                    {/* Quick Actions */}
                    <View className="px-4 pb-3 space-y-2">
                        {/* Location Alarm Status */}
                        <LocationAlarmStatus
                            onPress={() => setShowAlarmForm(true)}
                        />

                        <TouchableOpacity
                            onPress={() => setShowAddModal(true)}
                            className="bg-blue-500 flex-row items-center justify-center py-3 rounded-lg"
                        >
                            <Ionicons name="add" size={20} color="white" />
                            <Text className="text-white font-semibold text-base ml-2">
                                Add new location
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => setShowAlarmForm(true)}
                            className="bg-green-500 flex-row items-center justify-center py-3 rounded-lg"
                        >
                            <Ionicons name="alarm" size={20} color="white" />
                            <Text className="text-white font-semibold text-base ml-2">
                                Create location alarm
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* Tab Selector */}
                    <View className="flex-row mx-4 mb-3">
                        <TouchableOpacity
                            onPress={() => setActiveTab("map")}
                            className={`flex-1 py-2 items-center border-b-2 ${
                                activeTab === "map"
                                    ? "border-blue-500"
                                    : "border-gray-200"
                            }`}
                        >
                            <View className="flex-row items-center">
                                <Ionicons
                                    name="map"
                                    size={16}
                                    color={
                                        activeTab === "map"
                                            ? "#3B82F6"
                                            : "#6B7280"
                                    }
                                />
                                <Text
                                    className={`font-medium ml-1 ${
                                        activeTab === "map"
                                            ? "text-blue-500"
                                            : "text-gray-500"
                                    }`}
                                >
                                    Map
                                </Text>
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => setActiveTab("favorites")}
                            className={`flex-1 py-2 items-center border-b-2 ${
                                activeTab === "favorites"
                                    ? "border-blue-500"
                                    : "border-gray-200"
                            }`}
                        >
                            <View className="flex-row items-center">
                                <Ionicons
                                    name="heart"
                                    size={16}
                                    color={
                                        activeTab === "favorites"
                                            ? "#3B82F6"
                                            : "#6B7280"
                                    }
                                />
                                <Text
                                    className={`font-medium ml-1 ${
                                        activeTab === "favorites"
                                            ? "text-blue-500"
                                            : "text-gray-500"
                                    }`}
                                >
                                    Favorites ({favoriteLocations.length})
                                </Text>
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => setActiveTab("history")}
                            className={`flex-1 py-2 items-center border-b-2 ${
                                activeTab === "history"
                                    ? "border-blue-500"
                                    : "border-gray-200"
                            }`}
                        >
                            <View className="flex-row items-center">
                                <Ionicons
                                    name="time"
                                    size={16}
                                    color={
                                        activeTab === "history"
                                            ? "#3B82F6"
                                            : "#6B7280"
                                    }
                                />
                                <Text
                                    className={`font-medium ml-1 ${
                                        activeTab === "history"
                                            ? "text-blue-500"
                                            : "text-gray-500"
                                    }`}
                                >
                                    History ({historyCount})
                                </Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Content Area */}
                <View className="flex-1">{renderTabContent()}</View>

                {/* Modals */}
                <AddLocationModal
                    visible={showAddModal}
                    onClose={() => {
                        setShowAddModal(false);
                        setSelectedLocationForAlarm(null);
                    }}
                />

                <LocationAlarmManager
                    visible={showAlarmForm}
                    onClose={() => {
                        setShowAlarmForm(false);
                        setSelectedLocationForAlarm(null);
                    }}
                    selectedLocation={selectedLocationForAlarm || undefined}
                />
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
