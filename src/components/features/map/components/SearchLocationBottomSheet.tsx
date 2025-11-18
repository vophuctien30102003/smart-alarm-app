import { Text } from '@/components/ui';
import { useMapboxSearch } from '@/hooks/useMapboxSearch';
import { type LocationAlarm, isLocationAlarm } from '@/shared/types/alarm.type';
import { LocationType } from '@/shared/types/alarmLocation.type';
import { enumToLegacyRepeat } from '@/shared/utils/alarmOptions';
import { calculateDistance } from '@/shared/utils/locationUtils';
import { selectAlarms, useAlarmStore } from '@/store/alarmStore';
import { useLocationStore } from '@/store/locationStore';
import { mapAlarmActions, useMapAlarmStore } from '@/store/mapAlarmStore';
import { Ionicons } from '@expo/vector-icons';
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

interface SearchLocationBottomSheetProps {
  currentLocation?: {
    latitude: number;
    longitude: number;
  } | null;
}

const SearchLocationBottomSheet: React.FC<SearchLocationBottomSheetProps> = ({ currentLocation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const { results, loading } = useMapboxSearch(searchQuery, currentLocation ?? undefined);
  const { selectedDestination, setSelectedDestination } = useLocationStore();
  const setCurrentView = useMapAlarmStore(mapAlarmActions.setCurrentView);
  const setSelectedLocation = useMapAlarmStore(mapAlarmActions.setSelectedLocation);
  const setEditingAlarmId = useMapAlarmStore(mapAlarmActions.setEditingAlarmId);
  const alarms = useAlarmStore(selectAlarms);

  const locationAlarms = useMemo(
    () => alarms.filter(isLocationAlarm),
    [alarms],
  );

  const recentAlarms = useMemo(() =>
    [...locationAlarms]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5),
  [locationAlarms]);

  const handleLocationSelect = useCallback(
    (item: any) => {
      const location: LocationType = {
        id: item.id,
        name: item.name,
        address: item.address,
        coordinates: {
          latitude: item.coordinates.latitude,
          longitude: item.coordinates.longitude,
        },
        mapbox_id: item.mapbox_id,
      };

      setSelectedLocation(location);
      setSelectedDestination(location);
      setCurrentView('setAlarm');
      setSearchQuery('');
    },
    [setCurrentView, setSelectedDestination, setSelectedLocation]
  );

  const handleRecentAlarmSelect = useCallback(
    (alarm: LocationAlarm) => {
      const location: LocationType = {
        id: alarm.targetLocation.id,
        name: alarm.targetLocation.name,
        address: alarm.targetLocation.address,
        coordinates: {
          latitude: alarm.targetLocation.coordinates.latitude,
          longitude: alarm.targetLocation.coordinates.longitude,
        },
        mapbox_id: alarm.targetLocation.mapbox_id,
      };

      setSelectedLocation(location);
      setSelectedDestination(location);
      setEditingAlarmId(alarm.id);
      setCurrentView('setAlarm');
    },
    [setCurrentView, setSelectedDestination, setSelectedLocation, setEditingAlarmId]
  );

  const getDistanceText = useCallback(
    (targetLat: number, targetLng: number): string => {
      if (!currentLocation) return '';

      const distance = calculateDistance(
        { latitude: currentLocation.latitude, longitude: currentLocation.longitude },
        { latitude: targetLat, longitude: targetLng }
      );

      if (distance < 1) {
        return `${(distance * 1000).toFixed(0)}m away`;
      }

      return `${distance.toFixed(1)}km away`;
    },
    [currentLocation]
  );

  return (
    <View
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 1000,
      }}
    >
      <GestureHandlerRootView className="flex-1 bg-transparent">
        <BottomSheet
          snapPoints={['25%', '50%', '75%']}
          backgroundStyle={{
            backgroundColor: 'rgba(20, 30, 48, 0.25)',
          }}
          handleStyle={{
            backgroundColor: '#090212',
          }}
          handleIndicatorStyle={{
            backgroundColor: 'rgba(255,255,255,0.3)',
          }}
          enableContentPanningGesture
        >
          <SafeAreaView className="flex-1 bg-[#090212]">
            <View className="flex-row items-center px-4 pt-4 pb-8">
              <View className="flex-1 flex-row items-center bg-[#362e4b] rounded-2xl  h-16 px-4">
                <Ionicons name="search" size={20} color="#D9D9D9" style={{ marginRight: 8 }} />
                <TextInput
                  className="flex-1 text-[#D9D9D9] text-base h-11"
                  placeholder="Search Maps"
                  placeholderTextColor="rgba(255,255,255,0.7)"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
              </View>
            </View>
            <BottomSheetScrollView
              contentContainerStyle={{
                padding: 16,
                backgroundColor: 'transparent',
              }}
              style={{ backgroundColor: 'transparent' }}
            >
              {loading && <ActivityIndicator color="#fff" size="small" />}

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
                          {item.name || 'Unknown place'}
                        </Text>
                        <Text className="text-gray-300 text-sm mt-1">
                          {item.address || 'No address available'}
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

              {!searchQuery && recentAlarms.length > 0 && (
                <View className="mt-4">
                  <Text className="text-white text-lg font-semibold mb-3 px-1">
                    Recent Alarms
                  </Text>
                  {recentAlarms.map(alarm => (
                    <TouchableOpacity
                      key={alarm.id}
                      className="bg-[#362e4b] p-4 rounded-2xl mb-2"
                      onPress={() => handleRecentAlarmSelect(alarm)}
                    >
                      <View className="flex-row justify-between items-start">
                        <View className="flex-1">
                          <Text className="text-white text-base font-semibold">
                            {alarm.label}
                          </Text>
                          <Text className="text-gray-300 text-sm mt-1">
                            {alarm.targetLocation.address}
                          </Text>
                          <View className="flex-row items-center mt-1">
                            <Text className="text-blue-400 text-xs">
                              Radius: {(alarm.radiusMeters ?? 0)}m • {enumToLegacyRepeat(alarm.repeatType)}
                            </Text>
                            {currentLocation && (
                              <Text className="text-yellow-400 text-xs ml-2">
                                •
                                {getDistanceText(
                                  alarm.targetLocation.coordinates.latitude,
                                  alarm.targetLocation.coordinates.longitude,
                                )}
                              </Text>
                            )}
                          </View>
                        </View>
                        <View className="ml-3 flex items-center">
                          <View
                            className={`w-3 h-3 rounded-full ${alarm.isEnabled ? 'bg-green-500' : 'bg-gray-500'}`}
                          />
                        </View>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {selectedDestination && searchQuery === '' && (
                <View className="mt-4 p-4 bg-green-500/20 rounded-2xl">
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

              {!loading && searchQuery && results.length === 0 && (
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
};

export default React.memo(SearchLocationBottomSheet);
