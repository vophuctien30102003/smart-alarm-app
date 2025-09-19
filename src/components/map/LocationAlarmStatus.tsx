import { useLocationTracking } from '@/hooks/useLocationTracking';
import { useAlarmStore } from '@/store/alarmStore';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

interface LocationAlarmStatusProps {
  onPress?: () => void;
}

export default function LocationAlarmStatus({ onPress }: LocationAlarmStatusProps) {
  const { alarms } = useAlarmStore();
  const { tracking, alarmTriggers } = useLocationTracking();

  const locationAlarms = alarms.filter(
    alarm => alarm.isEnabled && alarm.isLocationBased && alarm.targetLocation
  );

  if (locationAlarms.length === 0) return null;

  const activeCount = alarmTriggers.length;
  const isTracking = tracking.isTracking;

  return (
    <TouchableOpacity
      onPress={onPress}
      className="bg-blue-50 border border-blue-200 rounded-lg p-3 mx-4 mb-3"
      activeOpacity={0.7}
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-1">
          <View className="flex-row items-center mb-1">
            <Ionicons 
              name={isTracking ? "radio-button-on" : "radio-button-off"} 
              size={16} 
              color={isTracking ? "#10B981" : "#EF4444"} 
            />
            <Text className="text-sm font-medium text-blue-800 ml-2">
              Location Alarms
            </Text>
          </View>
          
          <Text className="text-xs text-blue-600">
            {activeCount} active • {isTracking ? 'Tracking' : 'Not tracking'}
          </Text>
          
          {tracking.error && (
            <Text className="text-xs text-red-600 mt-1">
              {tracking.error}
            </Text>
          )}
        </View>

        <View className="flex-row items-center">
          {tracking.currentLocation && (
            <View className="bg-green-100 px-2 py-1 rounded-full mr-2">
              <Text className="text-green-800 text-xs font-medium">
                GPS Active
              </Text>
            </View>
          )}
          
          <Ionicons name="chevron-forward" size={16} color="#6B7280" />
        </View>
      </View>
    </TouchableOpacity>
  );
}
