import { useMapAlarmStore } from "@/store/mapAlarmStore";
import { Ionicons } from "@expo/vector-icons";
import BottomSheet, { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import React, { useEffect } from "react";
import {
  Alert,
  SafeAreaView,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { MapAlarm } from "../../shared/types";

interface AlarmHistoryComponentProps {
  isVisible: boolean;
  onClose: () => void;
}

const AlarmHistoryComponent = React.memo(({ isVisible, onClose }: AlarmHistoryComponentProps) => {
  
  const { 
    alarms, 
    toggleAlarmActive, 
    deleteAlarm, 
    setEditingAlarm, 
    setCurrentView,
    loadRecentAlarms
  } = useMapAlarmStore();

  useEffect(() => {
    if (isVisible) {
      loadRecentAlarms();
    }
  }, [isVisible, loadRecentAlarms]);

  const handleToggleActive = async (id: string) => {
    try {
      await toggleAlarmActive(id);
    } catch (error) {
      console.error('Error toggling alarm:', error);
      Alert.alert('Error', 'Failed to update alarm status');
    }
  };

  const handleEditAlarm = (alarm: MapAlarm) => {
    setEditingAlarm(alarm);
    setCurrentView('setAlarm');
    onClose();
  };

  const handleDeleteAlarm = (alarm: MapAlarm) => {
    Alert.alert(
      'Delete Alarm',
      `Are you sure you want to delete "${alarm.lineName}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteAlarm(alarm.id);
            } catch (error) {
              console.error('Error deleting alarm:', error);
              Alert.alert('Error', 'Failed to delete alarm');
            }
          },
        },
      ]
    );
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderAlarmItem = (alarm: MapAlarm) => (
    <View key={alarm.id} className="bg-gray-800 mx-4 mb-3 rounded-xl p-4">
      <View className="flex-row justify-between items-start mb-3">
        <View className="flex-1">
          <Text className="text-white text-lg font-bold">{alarm.lineName}</Text>
          <Text className="text-gray-300 text-base font-medium">{alarm.name}</Text>
          <Text className="text-gray-400 text-sm mt-1">{alarm.address}</Text>
        </View>
        <Switch
          value={alarm.isActive}
          onValueChange={() => handleToggleActive(alarm.id)}
          trackColor={{ false: '#374151', true: '#3B82F6' }}
          thumbColor={alarm.isActive ? '#60A5FA' : '#9CA3AF'}
        />
      </View>

      <View className="flex-row flex-wrap gap-2 mb-3">
        <View className="bg-blue-500/20 px-3 py-1 rounded-full">
          <Text className="text-blue-400 text-xs">
            Radius: {alarm.radius}m
          </Text>
        </View>
        <View className="bg-green-500/20 px-3 py-1 rounded-full">
          <Text className="text-green-400 text-xs">
            Alert: {alarm.timeBeforeArrival} min
          </Text>
        </View>
        <View className="bg-purple-500/20 px-3 py-1 rounded-full">
          <Text className="text-purple-400 text-xs">
            {alarm.repeat}
          </Text>
        </View>
        <View className="bg-orange-500/20 px-3 py-1 rounded-full">
          <Text className="text-orange-400 text-xs">
            {alarm.sound}
          </Text>
        </View>
      </View>

      <View className="flex-row justify-between items-center">
        <Text className="text-gray-500 text-xs">
          Created: {formatDate(alarm.timestamp)}
        </Text>
        <View className="flex-row gap-2">
          <TouchableOpacity
            className="bg-blue-500 px-4 py-2 rounded-lg"
            onPress={() => handleEditAlarm(alarm)}
          >
            <Text className="text-white text-sm font-medium">Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="bg-red-500 px-4 py-2 rounded-lg"
            onPress={() => handleDeleteAlarm(alarm)}
          >
            <Text className="text-white text-sm font-medium">Delete</Text>
          </TouchableOpacity>
        </View>
      </View>

      {alarm.isActive && (
        <View className="mt-3 bg-green-500/10 p-2 rounded-lg">
          <Text className="text-green-400 text-xs text-center">
            ✓ Active - Location tracking enabled
          </Text>
        </View>
      )}
    </View>
  );

  const activeAlarms = alarms.filter(alarm => alarm.isActive);
  const inactiveAlarms = alarms.filter(alarm => !alarm.isActive);

  if (!isVisible) return null;

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
          onClose={onClose}
        >
          <SafeAreaView className="flex-1">
            {/* Header */}
            <View className="flex-row items-center justify-between px-4 pb-4 border-b border-gray-600">
              <TouchableOpacity onPress={onClose}>
                <Ionicons name="close" size={24} color="#fff" />
              </TouchableOpacity>
              <Text className="text-white text-xl font-bold">Alarm History</Text>
              <Text className="text-gray-400 text-sm">
                {alarms.length} total
              </Text>
            </View>

            {alarms.length === 0 ? (
              <View className="flex-1 justify-center items-center px-8">
                <Ionicons name="alarm-outline" size={64} color="#6B7280" />
                <Text className="text-gray-400 text-lg font-medium mt-4 text-center">
                  No Alarms Yet
                </Text>
                <Text className="text-gray-500 text-base mt-2 text-center">
                  Set your first location alarm to get started!
                </Text>
              </View>
            ) : (
              <BottomSheetScrollView
                contentContainerStyle={{ paddingVertical: 16 }}
                style={{ backgroundColor: '#1f2937' }}
              >
                {/* Stats */}
                <View className="flex-row justify-around mx-4 mb-6 bg-gray-800 rounded-xl p-4">
                  <View className="items-center">
                    <Text className="text-green-400 text-2xl font-bold">
                      {activeAlarms.length}
                    </Text>
                    <Text className="text-gray-300 text-sm">Active</Text>
                  </View>
                  <View className="items-center">
                    <Text className="text-gray-400 text-2xl font-bold">
                      {inactiveAlarms.length}
                    </Text>
                    <Text className="text-gray-300 text-sm">Inactive</Text>
                  </View>
                  <View className="items-center">
                    <Text className="text-blue-400 text-2xl font-bold">
                      {alarms.length}
                    </Text>
                    <Text className="text-gray-300 text-sm">Total</Text>
                  </View>
                </View>

                {/* Active Alarms */}
                {activeAlarms.length > 0 && (
                  <>
                    <Text className="text-white text-lg font-semibold mb-3 px-4">
                      Active Alarms ({activeAlarms.length})
                    </Text>
                    {activeAlarms.map(renderAlarmItem)}
                  </>
                )}

                {/* Inactive Alarms */}
                {inactiveAlarms.length > 0 && (
                  <>
                    <Text className="text-gray-400 text-lg font-semibold mb-3 px-4 mt-4">
                      Inactive Alarms ({inactiveAlarms.length})
                    </Text>
                    {inactiveAlarms.map(renderAlarmItem)}
                  </>
                )}
              </BottomSheetScrollView>
            )}
          </SafeAreaView>
        </BottomSheet>
      </GestureHandlerRootView>
    </View>
  );
});

AlarmHistoryComponent.displayName = 'AlarmHistoryComponent';

export default AlarmHistoryComponent;
