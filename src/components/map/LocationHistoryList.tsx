import { locationService } from '@/services/LocationService';
import { LocationType } from '@/types/Location';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

interface LocationHistoryListProps {
  onLocationSelect?: (location: LocationType) => void;
  onCreateAlarm?: (location: LocationType) => void;
}

export default function LocationHistoryList({ onLocationSelect, onCreateAlarm }: LocationHistoryListProps) {
  const [locationHistory, setLocationHistory] = useState<LocationType[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadLocationHistory();
  }, []);

  const loadLocationHistory = async () => {
    try {
      setLoading(true);
      const history = await locationService.loadLocationHistory();
      setLocationHistory(history);
    } catch (error) {
      console.error('Failed to load location history:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLongPress = (item: LocationType) => {
    Alert.alert(
      'Options',
      'What would you like to do with this location?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Create Alarm',
          onPress: () => onCreateAlarm?.(item)
        },
        {
          text: 'Select',
          onPress: () => onLocationSelect?.(item)
        },
        {
          text: 'Remove from History',
          style: 'destructive',
          onPress: () => handleRemoveFromHistory(item.id)
        }
      ]
    );
  };

  const handleRemoveFromHistory = async (locationId: string) => {
    try {
      await locationService.removeLocationFromHistory(locationId);
      // Reload the list
      await loadLocationHistory();
    } catch (error) {
      Alert.alert('Error', 'Failed to remove location from history');
    }
  };

  const handleClearHistory = () => {
    Alert.alert(
      'Clear History',
      'Are you sure you want to clear all location history? This will remove all locations where alarms have been set.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              await locationService.clearLocationHistory();
              setLocationHistory([]);
            } catch (error) {
              Alert.alert('Error', 'Failed to clear location history');
            }
          }
        }
      ]
    );
  };

  const renderHistoryItem = ({ item }: { item: LocationType }) => {
    return (
      <TouchableOpacity
        onPress={() => onLocationSelect?.(item)}
        onLongPress={() => handleLongPress(item)}
        className="flex-row items-center p-4 border-b border-gray-100 bg-white"
      >
        <View className="w-12 h-12 rounded-full items-center justify-center mr-3 bg-gray-100">
          <Ionicons name="time" size={20} color="#6B7280" />
        </View>
        
        <View className="flex-1">
          <Text className="text-base font-medium text-gray-900">
            {item.name}
          </Text>
          <Text className="text-sm text-gray-600 mt-1" numberOfLines={2}>
            {item.address}
          </Text>
        </View>

        <View className="flex-row items-center space-x-2">
          {onCreateAlarm && (
            <TouchableOpacity
              onPress={() => onCreateAlarm(item)}
              className="bg-green-100 p-2 rounded-full"
            >
              <Ionicons name="alarm" size={16} color="#10B981" />
            </TouchableOpacity>
          )}
          
          <View className="items-center">
            <Text className="text-blue-500 text-sm">Select</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View className="flex-1 items-center justify-center py-12">
      <Ionicons name="time" size={48} color="#9CA3AF" />
      <Text className="text-lg font-medium text-gray-500 mt-4">
        No alarm history
      </Text>
      <Text className="text-sm text-gray-400 mt-2 text-center px-8">
        Locations where you&apos;ve set alarms will appear here
      </Text>
    </View>
  );

  return (
    <View className="flex-1">
      <View className="flex-row items-center justify-between p-4 border-b border-gray-200">
        <Text className="text-lg font-semibold text-gray-900">
          Alarm History ({locationHistory.length})
        </Text>
        {locationHistory.length > 0 && (
          <TouchableOpacity 
            onPress={handleClearHistory}
            className="bg-red-100 px-3 py-1 rounded-full"
          >
            <Text className="text-red-600 text-sm font-medium">Clear</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={locationHistory}
        renderItem={renderHistoryItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmptyState}
      />
    </View>
  );
}
