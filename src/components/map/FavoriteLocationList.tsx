import { useLocationStore } from '@/store/locationStore';
import { FavoriteLocationType, LocationType } from '@/types/Location';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  Alert,
  FlatList,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import AddLocationModal from './AddLocationModal';

interface FavoriteLocationListProps {
  onLocationSelect?: (location: FavoriteLocationType) => void;
  onCreateAlarm?: (location: LocationType) => void;
}

export default function FavoriteLocationList({ onLocationSelect, onCreateAlarm }: FavoriteLocationListProps) {
  const { favoriteLocations, removeFromFavorites } = useLocationStore();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingLocation, setEditingLocation] = useState<FavoriteLocationType | null>(null);

  const handleLongPress = (item: FavoriteLocationType) => {
    Alert.alert(
      'Options',
      `What would you like to do with "${item.label}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Create Alarm',
          onPress: () => onCreateAlarm?.(item)
        },
        {
          text: 'Edit',
          onPress: () => setEditingLocation(item)
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => handleDelete(item)
        }
      ]
    );
  };

  const handleDelete = (item: FavoriteLocationType) => {
    Alert.alert(
      'Delete Location',
      `Are you sure you want to delete "${item.label}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => removeFromFavorites(item.id)
        }
      ]
    );
  };

  const handleAddNew = () => {
    setShowAddModal(true);
  };

  const renderFavoriteItem = ({ item }: { item: FavoriteLocationType }) => {
    const isNotSet = item.address.includes('Not set up yet');
    
    return (
      <TouchableOpacity
        onPress={() => isNotSet ? setEditingLocation(item) : onLocationSelect?.(item)}
        onLongPress={() => handleLongPress(item)}
        className={`flex-row items-center p-4 border-b border-gray-100 ${
          isNotSet ? 'bg-yellow-50' : 'bg-white'
        }`}
      >
        <View className={`w-12 h-12 rounded-full items-center justify-center mr-3 ${
          isNotSet ? 'bg-yellow-200' : 'bg-blue-100'
        }`}>
          <Text className="text-xl">{item.icon || '📍'}</Text>
        </View>
        
        <View className="flex-1">
          <Text className="text-base font-medium text-gray-900">
            {item.label}
          </Text>
          <Text className={`text-sm mt-1 ${
            isNotSet ? 'text-yellow-600 italic' : 'text-gray-600'
          }`} numberOfLines={2}>
            {item.address}
          </Text>
          {isNotSet && (
            <Text className="text-xs text-yellow-500 mt-1">
              Tap to set up address
            </Text>
          )}
        </View>

        <View className="flex-row items-center space-x-2">
          {!isNotSet && onCreateAlarm && (
            <TouchableOpacity
              onPress={() => onCreateAlarm(item)}
              className="bg-green-100 p-2 rounded-full"
            >
              <Ionicons name="alarm" size={16} color="#10B981" />
            </TouchableOpacity>
          )}
          
          <View className="items-center">
            {isNotSet ? (
              <Text className="text-yellow-500 text-sm">Set up</Text>
            ) : (
              <Text className="text-blue-500 text-sm">Select</Text>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View className="flex-1 items-center justify-center py-12">
      <Ionicons name="location" size={48} color="#9CA3AF" />
      <Text className="text-lg font-medium text-gray-500 mt-4">
        No favorite locations yet
      </Text>
      <Text className="text-sm text-gray-400 mt-2 text-center px-8">
        Add your favorite places to create location-based alarms
      </Text>
      <TouchableOpacity
        onPress={handleAddNew}
        className="bg-blue-500 px-6 py-3 rounded-lg mt-6"
      >
        <Text className="text-white font-medium">Add Your First Location</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View className="flex-1">
      <View className="flex-row items-center justify-between p-4 border-b border-gray-200">
        <Text className="text-lg font-semibold text-gray-900">
          Favorite Locations ({favoriteLocations.length})
        </Text>
        <TouchableOpacity 
          onPress={handleAddNew}
          className="bg-blue-500 px-3 py-1 rounded-full"
        >
          <Text className="text-white text-sm font-medium">+ Add</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={favoriteLocations}
        renderItem={renderFavoriteItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmptyState}
      />

      <AddLocationModal
        visible={showAddModal || editingLocation !== null}
        onClose={() => {
          setShowAddModal(false);
          setEditingLocation(null);
        }}
      />
    </View>
  );
}
