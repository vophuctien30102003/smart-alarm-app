import LocationAlarmService from '@/lib/LocationAlarmService';
import { useAlarmStore } from '@/store/alarmStore';
import { useLocationStore } from '@/store/locationStore';
import { LocationType } from '@/types/Location';
import SearchLocation from '@/utils/searchLocationUtils';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Modal,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

interface LocationAlarmManagerProps {
  visible: boolean;
  onClose: () => void;
  selectedLocation?: LocationType;
  mode?: 'create' | 'manage';
}

export default function LocationAlarmManager({
  visible,
  onClose,
  selectedLocation,
  mode = 'create'
}: LocationAlarmManagerProps) {
  const [currentMode, setCurrentMode] = useState(mode);
  
  // Form states
  const [label, setLabel] = useState('');
  const [radiusMeters, setRadiusMeters] = useState('100');
  const [arrivalTrigger, setArrivalTrigger] = useState(true);
  const [vibrate, setVibrate] = useState(true);
  const [snoozeEnabled, setSnoozeEnabled] = useState(true);
  const [snoozeDuration, setSnoozeDuration] = useState('5');
  const [maxSnoozeCount, setMaxSnoozeCount] = useState('3');
  const [deleteAfterNotification, setDeleteAfterNotification] = useState(true);

  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<LocationType | null>(
    selectedLocation || null
  );
  const [loading, setLoading] = useState(false);
  const [routePreview, setRoutePreview] = useState<{
    duration: string;
    distance: string;
  } | null>(null);
  const [loadingRoute, setLoadingRoute] = useState(false);

  const { favoriteLocations } = useLocationStore();
  const { alarms, addAlarm, deleteAlarm, getArrivalTimeEstimate } = useAlarmStore();
  const locationService = LocationAlarmService.getInstance();

  const locationAlarms = alarms.filter(alarm => alarm.isLocationBased && alarm.isEnabled);
  const activeLocationAlarms = locationService.getActiveLocationAlarms();
  const isTrackingActive = locationService.isLocationTrackingActive();

  const handleSave = async () => {
    if (!label.trim()) {
      Alert.alert('Error', 'Please enter an alarm label');
      return;
    }

    if (!currentLocation) {
      Alert.alert('Error', 'Please select a location');
      return;
    }

    const radius = parseInt(radiusMeters);
    if (isNaN(radius) || radius < 10 || radius > 10000) {
      Alert.alert('Error', 'Radius must be between 10 and 10000 meters');
      return;
    }

    try {
      setLoading(true);
      await addAlarm({
        time: '00:00',
        label: label.trim(),
        isEnabled: true,
        repeatDays: [],
        volume: 0.8,
        vibrate,
        snoozeEnabled,
        snoozeDuration: parseInt(snoozeDuration),
        maxSnoozeCount: parseInt(maxSnoozeCount),
        deleteAfterNotification,
        
        isLocationBased: true,
        targetLocation: currentLocation,
        radiusMeters: radius,
        arrivalTrigger,
      });

      Alert.alert(
        'Success', 
        `Location alarm created! You will be notified when you ${
          arrivalTrigger ? 'arrive at' : 'leave'
        } ${currentLocation.address}`
      );
      
      resetForm();
      setCurrentMode('manage');
    } catch (error) {
      console.error('Failed to create location alarm:', error);
      Alert.alert('Error', 'Failed to create location alarm');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAlarm = (alarmId: string, alarmLabel: string) => {
    Alert.alert(
      'Delete Alarm',
      `Are you sure you want to delete "${alarmLabel}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteAlarm(alarmId)
        }
      ]
    );
  };

  const resetForm = () => {
    setLabel('');
    setRadiusMeters('100');
    setArrivalTrigger(true);
    setVibrate(true);
    setSnoozeEnabled(true);
    setSnoozeDuration('5');
    setMaxSnoozeCount('3');
    setDeleteAfterNotification(true);
    setCurrentLocation(selectedLocation || null);
    setRoutePreview(null);
  };

  // Load route preview when location changes
  const loadRoutePreview = async () => {
    if (!currentLocation) return;
    
    setLoadingRoute(true);
    try {
      const routeInfo = await getArrivalTimeEstimate(currentLocation);
      if (routeInfo) {
        setRoutePreview({
          duration: routeInfo.formattedDuration,
          distance: routeInfo.formattedDistance
        });
      }
    } catch (error) {
      console.error('Failed to load route preview:', error);
    } finally {
      setLoadingRoute(false);
    }
  };

  useEffect(() => {
    if (currentLocation) {
      loadRoutePreview();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentLocation]);

  const renderLocationAlarm = ({ item }: { item: any }) => {
    const status = activeLocationAlarms.find(active => active.alarm.id === item.id);
    const distance = status ? Math.round(status.distance) : null;
    const isInRange = status?.isInRange || false;

    return (
      <View className="bg-white rounded-lg p-4 m-2 border border-gray-200">
        <View className="flex-row items-center justify-between mb-2">
          <Text className="text-base font-semibold text-gray-900 flex-1" numberOfLines={1}>
            {item.label}
          </Text>
          <View className="flex-row items-center space-x-2">
            {isInRange ? (
              <View className="bg-green-100 px-2 py-1 rounded-full">
                <Text className="text-green-800 text-xs font-medium">In Range</Text>
              </View>
            ) : (
              <View className="bg-blue-100 px-2 py-1 rounded-full">
                <Text className="text-blue-800 text-xs font-medium">Tracking</Text>
              </View>
            )}
            <TouchableOpacity
              onPress={() => handleDeleteAlarm(item.id, item.label)}
              className="p-1"
            >
              <Ionicons name="trash" size={16} color="#EF4444" />
            </TouchableOpacity>
          </View>
        </View>

        <View className="flex-row items-center mb-2">
          <Ionicons name="location" size={14} color="#6B7280" />
          <Text className="text-sm text-gray-600 ml-1 flex-1" numberOfLines={1}>
            {item.targetLocation?.address}
          </Text>
        </View>

        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <Ionicons 
              name={item.arrivalTrigger ? "enter" : "exit"} 
              size={14} 
              color="#6B7280" 
            />
            <Text className="text-sm text-gray-600 ml-1">
              {item.arrivalTrigger ? "On arrival" : "On departure"}
            </Text>
          </View>

          {distance !== null && (
            <View className="flex-row items-center">
              <Ionicons name="walk" size={14} color="#6B7280" />
              <Text className="text-sm text-gray-600 ml-1">
                {distance}m away
              </Text>
            </View>
          )}
        </View>

        {status?.estimatedArrivalTime && (
          <View className="flex-row items-center mt-2">
            <Ionicons name="time" size={14} color="#6B7280" />
            <Text className="text-sm text-gray-600 ml-1">
              ~{status.estimatedArrivalTime} min arrival
            </Text>
          </View>
        )}
      </View>
    );
  };

  const renderCreateForm = () => (
    <ScrollView className="flex-1 p-4">
      {/* Alarm Label */}
      <View className="mb-6">
        <Text className="text-sm font-medium text-gray-700 mb-2">
          Alarm Label
        </Text>
        <TextInput
          value={label}
          onChangeText={setLabel}
          placeholder="Enter alarm name"
          className="border border-gray-300 rounded-lg px-3 py-3 text-base"
        />
      </View>

      {/* Location Selection */}
      <View className="mb-6">
        <Text className="text-sm font-medium text-gray-700 mb-2">
          Location
        </Text>
        <TouchableOpacity
          onPress={() => setShowLocationPicker(true)}
          className="border border-gray-300 rounded-lg px-3 py-3 flex-row items-center justify-between"
        >
          <View className="flex-1">
            <Text className={currentLocation ? "text-black font-medium" : "text-gray-500"}>
              {currentLocation?.address || "Select a location"}
            </Text>
            {currentLocation && (
              <Text className="text-xs text-gray-500 mt-1">
                {currentLocation.name}
              </Text>
            )}
          </View>
          <Ionicons name="chevron-forward" size={20} color="#666" />
        </TouchableOpacity>
        
        {/* Route Preview */}
        {currentLocation && (
          <View className="mt-2 p-3 bg-blue-50 rounded-lg">
            {loadingRoute ? (
              <View className="flex-row items-center">
                <ActivityIndicator size="small" color="#3B82F6" />
                <Text className="ml-2 text-blue-600">Loading route...</Text>
              </View>
            ) : routePreview ? (
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center">
                  <Ionicons name="navigate" size={16} color="#3B82F6" />
                  <Text className="ml-2 text-blue-600 font-medium">
                    {routePreview.distance} • {routePreview.duration}
                  </Text>
                </View>
                <TouchableOpacity onPress={loadRoutePreview}>
                  <Ionicons name="refresh" size={16} color="#3B82F6" />
                </TouchableOpacity>
              </View>
            ) : (
              <Text className="text-blue-600">Unable to calculate route</Text>
            )}
          </View>
        )}
      </View>

      {/* Trigger Type */}
      <View className="mb-6">
        <Text className="text-sm font-medium text-gray-700 mb-2">
          Trigger When
        </Text>
        <View className="flex-row space-x-2">
          <TouchableOpacity
            onPress={() => setArrivalTrigger(true)}
            className={`flex-1 py-3 px-4 rounded-lg border ${
              arrivalTrigger
                ? 'bg-blue-500 border-blue-500'
                : 'bg-white border-gray-300'
            }`}
          >
            <Text
              className={`text-center font-medium ${
                arrivalTrigger ? 'text-white' : 'text-gray-700'
              }`}
            >
              Arriving
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setArrivalTrigger(false)}
            className={`flex-1 py-3 px-4 rounded-lg border ${
              !arrivalTrigger
                ? 'bg-blue-500 border-blue-500'
                : 'bg-white border-gray-300'
            }`}
          >
            <Text
              className={`text-center font-medium ${
                !arrivalTrigger ? 'text-white' : 'text-gray-700'
              }`}
            >
              Leaving
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Detection Radius */}
      <View className="mb-6">
        <Text className="text-sm font-medium text-gray-700 mb-2">
          Detection Radius (meters)
        </Text>
        <TextInput
          value={radiusMeters}
          onChangeText={setRadiusMeters}
          placeholder="100"
          keyboardType="numeric"
          className="border border-gray-300 rounded-lg px-3 py-3 text-base"
        />
        <Text className="text-xs text-gray-500 mt-1">
          Recommended: 50-200 meters for accuracy
        </Text>
      </View>

      {/* Quick Settings */}
      <View className="space-y-4">
        <View className="flex-row items-center justify-between">
          <Text className="text-sm font-medium text-gray-700">Vibrate</Text>
          <TouchableOpacity
            onPress={() => setVibrate(!vibrate)}
            className={`w-12 h-6 rounded-full ${
              vibrate ? 'bg-blue-500' : 'bg-gray-300'
            } flex-row items-center ${vibrate ? 'justify-end' : 'justify-start'}`}
          >
            <View className="w-5 h-5 bg-white rounded-full mx-0.5" />
          </TouchableOpacity>
        </View>

        <View className="flex-row items-center justify-between">
          <Text className="text-sm font-medium text-gray-700">Delete After Notification</Text>
          <TouchableOpacity
            onPress={() => setDeleteAfterNotification(!deleteAfterNotification)}
            className={`w-12 h-6 rounded-full ${
              deleteAfterNotification ? 'bg-blue-500' : 'bg-gray-300'
            } flex-row items-center ${deleteAfterNotification ? 'justify-end' : 'justify-start'}`}
          >
            <View className="w-5 h-5 bg-white rounded-full mx-0.5" />
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );

  const renderManageView = () => {
    if (locationAlarms.length === 0) {
      return (
        <View className="flex-1 items-center justify-center p-6">
          <Ionicons name="location-outline" size={48} color="#9CA3AF" />
          <Text className="text-gray-500 font-medium mt-4">No Location Alarms</Text>
          <Text className="text-gray-400 text-sm text-center mt-2">
            Create your first location-based alarm
          </Text>
          <TouchableOpacity
            onPress={() => setCurrentMode('create')}
            className="bg-blue-500 px-6 py-3 rounded-lg mt-4"
          >
            <Text className="text-white font-medium">Create Alarm</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View className="flex-1">
        <View className="flex-row items-center justify-between p-4 border-b border-gray-200">
          <Text className="text-lg font-semibold text-gray-900">
            Active Alarms ({locationAlarms.length})
          </Text>
          <View className="flex-row items-center">
            <View className={`w-2 h-2 rounded-full mr-2 ${
              isTrackingActive ? 'bg-green-500' : 'bg-red-500'
            }`} />
            <Text className={`text-sm font-medium ${
              isTrackingActive ? 'text-green-600' : 'text-red-600'
            }`}>
              {isTrackingActive ? 'Tracking' : 'Stopped'}
            </Text>
          </View>
        </View>

        <FlatList
          data={locationAlarms}
          renderItem={renderLocationAlarm}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
        
        <View className="p-4 border-t border-gray-200">
          <TouchableOpacity
            onPress={() => setCurrentMode('create')}
            className="bg-blue-500 py-3 rounded-lg items-center"
          >
            <Text className="text-white font-medium">Create New Alarm</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View className="flex-1 bg-white">
        <View className="flex-row items-center justify-between p-4 border-b border-gray-200">
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color="#666" />
          </TouchableOpacity>
          <View className="flex-row items-center space-x-4">
            <TouchableOpacity
              onPress={() => setCurrentMode('manage')}
              className={`px-3 py-1 rounded-full ${
                currentMode === 'manage' ? 'bg-blue-500' : 'bg-gray-100'
              }`}
            >
              <Text className={`text-sm font-medium ${
                currentMode === 'manage' ? 'text-white' : 'text-gray-600'
              }`}>
                Manage
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setCurrentMode('create')}
              className={`px-3 py-1 rounded-full ${
                currentMode === 'create' ? 'bg-blue-500' : 'bg-gray-100'
              }`}
            >
              <Text className={`text-sm font-medium ${
                currentMode === 'create' ? 'text-white' : 'text-gray-600'
              }`}>
                Create
              </Text>
            </TouchableOpacity>
          </View>
          {currentMode === 'create' && (
            <TouchableOpacity 
              onPress={handleSave}
              disabled={loading || !currentLocation || !label.trim()}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#007AFF" />
              ) : (
                <Text className={`font-medium ${
                  currentLocation && label.trim() ? 'text-blue-500' : 'text-gray-400'
                }`}>
                  Save
                </Text>
              )}
            </TouchableOpacity>
          )}
          {currentMode === 'manage' && <View />}
        </View>

        {currentMode === 'create' ? renderCreateForm() : renderManageView()}

        {/* Location Picker Modal */}
        <Modal visible={showLocationPicker} animationType="slide">
          <View className="flex-1 bg-white">
            <View className="flex-row items-center justify-between p-4 border-b border-gray-200">
              <TouchableOpacity onPress={() => setShowLocationPicker(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
              <Text className="text-lg font-semibold">Select Location</Text>
              <View />
            </View>

            <View className="flex-1">
              {/* Search Section */}
              <View className="p-4 border-b border-gray-200">
                <Text className="text-sm font-medium text-gray-700 mb-2">
                  Search New Location
                </Text>
                <SearchLocation
                  onLocationSelect={(location) => {
                    setCurrentLocation(location);
                    setShowLocationPicker(false);
                  }}
                  placeholder="Search for alarm location..."
                />
              </View>

              {/* Favorites Section */}
              <ScrollView className="flex-1 p-4">
                <Text className="text-sm font-medium text-gray-700 mb-3">
                  Saved Locations ({favoriteLocations.length})
                </Text>
                
                {favoriteLocations.map((location) => (
                  <TouchableOpacity
                    key={location.id}
                    onPress={() => {
                      setCurrentLocation(location);
                      setShowLocationPicker(false);
                    }}
                    className="py-3 px-4 border-b border-gray-200 flex-row items-center"
                  >
                    <View className="w-8 h-8 bg-blue-100 rounded-full items-center justify-center mr-3">
                      <Ionicons name="location" size={16} color="#3B82F6" />
                    </View>
                    <View className="flex-1">
                      <Text className="font-medium">{location.label || location.name}</Text>
                      <Text className="text-gray-600 text-sm">{location.address}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
                
                {favoriteLocations.length === 0 && (
                  <View className="py-8 items-center">
                    <Ionicons name="location-outline" size={48} color="#D1D5DB" />
                    <Text className="text-gray-500 mt-2">No saved locations</Text>
                    <Text className="text-gray-400 text-sm text-center mt-1">
                      Add locations from the Map tab or search above
                    </Text>
                  </View>
                )}
              </ScrollView>
            </View>
          </View>
        </Modal>
      </View>
    </Modal>
  );
}
