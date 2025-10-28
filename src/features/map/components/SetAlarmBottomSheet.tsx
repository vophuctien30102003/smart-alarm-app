import { useAlarms } from '@/hooks/useAlarms';
import { convertSoundToAlarmSound } from '@/shared/constants/sounds';
import { AlarmType } from '@/shared/enums';
import { type LocationAlarm, isLocationAlarm } from '@/shared/types/alarm.type';
import type { LocationRepeatOption } from '@/shared/types/alarmLocation.type';
import type { LocationAlarmPayload } from '@/shared/types/alarmPayload';
import { calculateDistance } from '@/shared/utils/locationUtils';
import { formatAlarmLabel } from '@/shared/utils/alarmFormatters';
import { LOCATION_REPEAT_OPTIONS, enumToLegacyRepeat, legacyRepeatToEnum } from '@/shared/utils/alarmOptions';
import { getAllSounds, resolveSound, resolveSoundId } from '@/shared/utils/soundUtils';
import { selectAlarms, useAlarmStore } from '@/store/alarmStore';
import { useLocationStore } from '@/store/locationStore';
import { mapAlarmActions, mapAlarmSelectors, useMapAlarmStore } from '@/store/mapAlarmStore';
import { Ionicons } from '@expo/vector-icons';
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import Slider from '@react-native-community/slider';
import React, { useEffect, useMemo, useState } from 'react';
import {
    Alert,
    SafeAreaView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

interface SetAlarmBottomSheetProps {
  isVisible: boolean;
  onClose: () => void;
  currentLocation?: {
    latitude: number;
    longitude: number;
  } | null;
}

const SetAlarmBottomSheet: React.FC<SetAlarmBottomSheetProps> = ({ isVisible, onClose, currentLocation }) => {
  const selectedLocation = useMapAlarmStore(mapAlarmSelectors.selectedLocation);
  const editingAlarmId = useMapAlarmStore(mapAlarmSelectors.editingAlarmId);
  const setEditingAlarmId = useMapAlarmStore(mapAlarmActions.setEditingAlarmId);
  const { selectedDestination } = useLocationStore();
  const allAlarms = useAlarmStore(selectAlarms);
  const { addAlarm, updateAlarm } = useAlarms();

  const locationAlarms = useMemo(
    () => allAlarms.filter(isLocationAlarm),
    [allAlarms],
  );

  const editingAlarm = useMemo<LocationAlarm | undefined>(() => {
    if (!editingAlarmId) {
      return undefined;
    }
    return locationAlarms.find((alarm) => alarm.id === editingAlarmId);
  }, [editingAlarmId, locationAlarms]);

  const availableSounds = useMemo(() => getAllSounds(), []);
  const defaultSoundId = availableSounds[0]?.id ?? resolveSoundId();

  const [lineName, setLineName] = useState('');
  const [timeBeforeArrival, setTimeBeforeArrival] = useState(5);
  const [radius, setRadius] = useState(500);
  const [selectedSoundId, setSelectedSoundId] = useState(defaultSoundId);
  const [repeat, setRepeat] = useState<LocationRepeatOption>('Once');
  const [isLoading, setIsLoading] = useState(false);
  const selectedSound = useMemo(() => resolveSound(selectedSoundId), [selectedSoundId]);

  const timeOptions = [1, 2, 5, 10, 15, 20, 30];
  const soundOptions = availableSounds;
  const repeatOptions = LOCATION_REPEAT_OPTIONS;

  useEffect(() => {
    if (editingAlarm) {
      setLineName(editingAlarm.label);
      setTimeBeforeArrival(editingAlarm.timeBeforeArrival ?? 5);
      setRadius(editingAlarm.radiusMeters ?? 500);
      setRepeat(enumToLegacyRepeat(editingAlarm.repeatType));
      setSelectedSoundId(resolveSoundId(editingAlarm.sound?.id));
    } else {
      setLineName('');
      setTimeBeforeArrival(5);
      setRadius(500);
      setSelectedSoundId(defaultSoundId);
      setRepeat(LOCATION_REPEAT_OPTIONS[0]);
    }
  }, [defaultSoundId, editingAlarm, isVisible]);

  const handleSaveAlarm = async () => {
    const location = selectedLocation || selectedDestination || editingAlarm?.targetLocation;

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

      const targetLocation = {
        id: location.mapbox_id || location.id,
        name: location.name,
        address: location.address,
        coordinates: {
          latitude: location.coordinates.latitude,
          longitude: location.coordinates.longitude,
        },
        mapbox_id: location.mapbox_id,
      };

      const selectedAlarmSound = convertSoundToAlarmSound(selectedSound);
      const repeatType = legacyRepeatToEnum(repeat);
      const labelToUse = formatAlarmLabel({
        label: lineName,
        type: AlarmType.LOCATION,
      });

      if (editingAlarm && editingAlarmId) {
        const updates: Partial<LocationAlarmPayload> = {
          type: AlarmType.LOCATION,
          label: labelToUse,
          targetLocation,
          radiusMeters: radius,
          timeBeforeArrival,
          repeatType,
          sound: selectedAlarmSound,
          arrivalTrigger: true,
        };
        await updateAlarm(editingAlarmId, updates);

        setEditingAlarmId(null);
        Alert.alert('Success', 'Alarm updated successfully!');
      } else {
        const payload: LocationAlarmPayload = {
          type: AlarmType.LOCATION,
          label: labelToUse,
          isEnabled: true,
          sound: selectedAlarmSound,
          volume: 1,
          vibrate: true,
          snoozeEnabled: false,
          snoozeDuration: 5,
          maxSnoozeCount: 0,
          targetLocation,
          radiusMeters: radius,
          timeBeforeArrival,
          arrivalTrigger: true,
          repeatType,
        };

        await addAlarm(payload);

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
    setEditingAlarmId(null);
    onClose();
  };

  if (!isVisible) return null;

  const location = selectedLocation || selectedDestination || editingAlarm?.targetLocation;

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
          enableContentPanningGesture
          onClose={handleClose}
        >
          <SafeAreaView className="flex-1">
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
              {location && (
                <View className="bg-gray-800 p-4 rounded-xl mb-6">
                  <Text className="text-white text-lg font-bold mb-2">Destination</Text>
                  <Text className="text-white text-base font-medium">{location.name}</Text>
                  <Text className="text-gray-300 text-sm mt-1">{location.address}</Text>
                  {currentLocation && (
                    <Text className="text-blue-400 text-sm mt-2">
                      Distance:
                      {calculateDistance(
                        { latitude: currentLocation.latitude, longitude: currentLocation.longitude },
                        { latitude: location.coordinates.latitude, longitude: location.coordinates.longitude }
                      ).toFixed(2)}{' '}
                      km
                    </Text>
                  )}
                </View>
              )}

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

              <View className="mb-6">
                <Text className="text-white text-base font-medium mb-3">
                  Time Before Arrival: {timeBeforeArrival} min
                </Text>
                <View className="flex-row flex-wrap gap-2">
                  {timeOptions.map(time => (
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

              <View className="mb-6">
                <Text className="text-white text-base font-medium mb-3">Alarm Sound</Text>
                <Text className="text-gray-300 text-sm mb-3">Current: {selectedSound.title}</Text>
                <View className="flex-row flex-wrap gap-2">
                  {soundOptions.map(soundOption => (
                    <TouchableOpacity
                      key={soundOption.id}
                      className={`px-4 py-2 rounded-full ${
                        selectedSoundId === soundOption.id ? 'bg-blue-500' : 'bg-gray-700'
                      }`}
                      onPress={() => setSelectedSoundId(soundOption.id)}
                    >
                      <Text className="text-white text-sm">{soundOption.title}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View className="mb-8">
                <Text className="text-white text-base font-medium mb-3">Repeat</Text>
                <View className="flex-row flex-wrap gap-2">
                  {repeatOptions.map(repeatOption => (
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

              <TouchableOpacity
                className={`p-4 rounded-xl ${isLoading ? 'bg-gray-600' : 'bg-blue-500'}`}
                onPress={handleSaveAlarm}
                disabled={isLoading}
              >
                <Text className="text-white text-center font-bold text-lg">
                  {isLoading ? 'Saving...' : editingAlarm ? 'Update Alarm' : 'Save Alarm'}
                </Text>
              </TouchableOpacity>
            </BottomSheetScrollView>
          </SafeAreaView>
        </BottomSheet>
      </GestureHandlerRootView>
    </View>
  );
};

export default React.memo(SetAlarmBottomSheet);
