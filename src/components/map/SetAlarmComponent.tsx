import { calculateDistance } from '@/shared/utils';
import { useLocationStore } from '@/store/locationStore';
import { useMapAlarmStore } from '@/store/mapAlarmStore';
import { Ionicons } from '@expo/vector-icons';
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import Slider from '@react-native-community/slider';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  SafeAreaView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

interface SetAlarmComponentProps {
  isVisible: boolean;
  onClose: () => void;
  currentLocation?: {
    latitude: number;
    longitude: number;
  } | null;
}

const SetAlarmComponent = React.memo(({ isVisible, onClose, currentLocation }: SetAlarmComponentProps) => {
  const { selectedLocation, editingAlarm, addAlarm, updateAlarm, setEditingAlarm } = useMapAlarmStore();
  const { selectedDestination } = useLocationStore();
  
  const [lineName, setLineName] = useState('');
  const [timeBeforeArrival, setTimeBeforeArrival] = useState(5);
  const [radius, setRadius] = useState(500);
  const [sound, setSound] = useState('Classic bell');
  const [repeat, setRepeat] = useState<'Once' | 'Weekdays' | 'Everyday'>('Once');
  const [isLoading, setIsLoading] = useState(false);

  const timeOptions = [1, 2, 5, 10, 15, 20, 30];
  const soundOptions = ['Classic bell', 'Gentle chime', 'Alert tone', 'Natural sound'];
  const repeatOptions: ('Once' | 'Weekdays' | 'Everyday')[] = ['Once', 'Weekdays', 'Everyday'];

  useEffect(() => {
    if (editingAlarm) {
      // Pre-fill form when editing
      setLineName(editingAlarm.lineName);
      setTimeBeforeArrival(editingAlarm.timeBeforeArrival);
      setRadius(editingAlarm.radius);
      setSound(editingAlarm.sound);
      setRepeat(editingAlarm.repeat);
    } else {
      // Reset form for new alarm
      setLineName('');
      setTimeBeforeArrival(5);
      setRadius(500);
      setSound('Classic bell');
      setRepeat('Once');
    }
  }, [editingAlarm, isVisible]);

  const handleSaveAlarm = async () => {
    const location = selectedLocation || selectedDestination;
    
    if (!location) {
      Alert.alert('Error', 'No location selected');
      return;
    }

    if (!lineName.trim()) {
      Alert.alert('Error', 'Please enter a line name');
      return;
    }

    try {
      setIsLoading(true);

      const alarmData = {
        name: location.name,
        address: location.address,
        lat: location.coordinates.latitude,
        long: location.coordinates.longitude,
        radius,
        lineName: lineName.trim(),
        timeBeforeArrival,
        sound,
        repeat,
        isActive: true,
        mapbox_id: location.mapbox_id,
      };

      if (editingAlarm) {
        // Update existing alarm
        await updateAlarm(editingAlarm.id, alarmData);
        setEditingAlarm(null);
        Alert.alert('Success', 'Alarm updated successfully!');
      } else {
        // Create new alarm
        await addAlarm(alarmData);
        Alert.alert('Success', 'Alarm saved successfully!');
      }

      onClose();
    } catch (error) {
      console.error('Error saving alarm:', error);
      Alert.alert('Error', 'Failed to save alarm');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setEditingAlarm(null);
    onClose();
  };

  if (!isVisible) return null;

  const location = selectedLocation || selectedDestination;

  return (
    <View
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 2000,
      }}
    >
      <GestureHandlerRootView className="flex-1 bg-transparent">
        <BottomSheet
          snapPoints={['85%']}
          backgroundStyle={{
            backgroundColor: '#1f2937',
          }}
          handleStyle={{
            backgroundColor: '#1f2937',
          }}
          handleIndicatorStyle={{
            backgroundColor: 'rgba(255,255,255,0.3)',
          }}
          enableContentPanningGesture={true}
          onClose={handleClose}
        >
          <SafeAreaView className="flex-1">
            {/* Header */}
            <View className="flex-row items-center justify-between px-4 pb-4 border-b border-gray-600">
              <TouchableOpacity onPress={handleClose}>
                <Ionicons name="close" size={24} color="#fff" />
              </TouchableOpacity>
              <Text className="text-white text-xl font-bold">
                {editingAlarm ? 'Edit Alarm' : 'Set Alarm'}
              </Text>
              <View style={{ width: 24 }} />
            </View>

            <BottomSheetScrollView
              contentContainerStyle={{ padding: 16 }}
              style={{ backgroundColor: '#1f2937' }}
            >
              {/* Location Info */}
              {location && (
                <View className="bg-gray-800 p-4 rounded-xl mb-6">
                  <Text className="text-white text-lg font-bold mb-2">Destination</Text>
                  <Text className="text-white text-base font-medium">{location.name}</Text>
                  <Text className="text-gray-300 text-sm mt-1">{location.address}</Text>
                  {currentLocation && (
                    <Text className="text-blue-400 text-sm mt-2">
                      Distance: {calculateDistance(
                        { latitude: currentLocation.latitude, longitude: currentLocation.longitude },
                        { latitude: location.coordinates.latitude, longitude: location.coordinates.longitude }
                      ).toFixed(2)} km
                    </Text>
                  )}
                </View>
              )}

              {/* Line Name */}
              <View className="mb-6">
                <Text className="text-white text-base font-medium mb-2">Line Name *</Text>
                <TextInput
                  className="bg-gray-800 text-white p-3 rounded-xl text-base"
                  placeholder="e.g., Line 41, Bus Route 15"
                  placeholderTextColor="#9CA3AF"
                  value={lineName}
                  onChangeText={setLineName}
                />
              </View>

              {/* Time Before Arrival */}
              <View className="mb-6">
                <Text className="text-white text-base font-medium mb-3">
                  Time Before Arrival: {timeBeforeArrival} min
                </Text>
                <View className="flex-row flex-wrap gap-2">
                  {timeOptions.map((time) => (
                    <TouchableOpacity
                      key={time}
                      className={`px-4 py-2 rounded-full ${
                        timeBeforeArrival === time ? 'bg-blue-500' : 'bg-gray-700'
                      }`}
                      onPress={() => setTimeBeforeArrival(time)}
                    >
                      <Text className="text-white text-sm">{time} min</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Radius */}
              <View className="mb-6">
                <Text className="text-white text-base font-medium mb-2">
                  Radius: {radius}m
                </Text>
                <Slider
                  style={{ width: '100%', height: 40 }}
                  minimumValue={100}
                  maximumValue={2000}
                  value={radius}
                  onValueChange={setRadius}
                  step={50}
                  minimumTrackTintColor="#3B82F6"
                  maximumTrackTintColor="#374151"
                />
                <View className="flex-row justify-between">
                  <Text className="text-gray-400 text-xs">100m</Text>
                  <Text className="text-gray-400 text-xs">2000m</Text>
                </View>
              </View>

              {/* Alarm Sound */}
              <View className="mb-6">
                <Text className="text-white text-base font-medium mb-3">Alarm Sound</Text>
                <View className="flex-row flex-wrap gap-2">
                  {soundOptions.map((soundOption) => (
                    <TouchableOpacity
                      key={soundOption}
                      className={`px-4 py-2 rounded-full ${
                        sound === soundOption ? 'bg-blue-500' : 'bg-gray-700'
                      }`}
                      onPress={() => setSound(soundOption)}
                    >
                      <Text className="text-white text-sm">{soundOption}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Repeat */}
              <View className="mb-8">
                <Text className="text-white text-base font-medium mb-3">Repeat</Text>
                <View className="flex-row flex-wrap gap-2">
                  {repeatOptions.map((repeatOption) => (
                    <TouchableOpacity
                      key={repeatOption}
                      className={`px-6 py-3 rounded-full ${
                        repeat === repeatOption ? 'bg-blue-500' : 'bg-gray-700'
                      }`}
                      onPress={() => setRepeat(repeatOption)}
                    >
                      <Text className="text-white text-sm">{repeatOption}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Save Button */}
              <TouchableOpacity
                className={`p-4 rounded-xl ${
                  isLoading ? 'bg-gray-600' : 'bg-blue-500'
                }`}
                onPress={handleSaveAlarm}
                disabled={isLoading}
              >
                <Text className="text-white text-center font-bold text-lg">
                  {isLoading 
                    ? 'Saving...' 
                    : editingAlarm 
                      ? 'Update Alarm' 
                      : 'Save Alarm'
                  }
                </Text>
              </TouchableOpacity>
            </BottomSheetScrollView>
          </SafeAreaView>
        </BottomSheet>
      </GestureHandlerRootView>
    </View>
  );
});

SetAlarmComponent.displayName = 'SetAlarmComponent';

export default SetAlarmComponent;
