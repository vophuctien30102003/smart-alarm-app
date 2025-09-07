import React from 'react';
import { Alert, Modal, View } from 'react-native';
import { useActiveAlarm } from '../../hooks/useAlarms';
import { Button } from '../ui/button';
import { Text } from '../ui/text';
import { AlarmPlayer } from './AlarmPlayer';

export const AlarmModal: React.FC = () => {
  const { activeAlarm, isPlaying, stopAlarm, snoozeAlarm } = useActiveAlarm();

  if (!activeAlarm || !isPlaying) {
    return null;
  }

  const handleStop = () => {
    Alert.alert(
      'Stop Alarm',
      'Are you sure you want to stop the alarm?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Dừng', 
          style: 'destructive',
          onPress: stopAlarm 
        },
      ]
    );
  };

  const handleSnooze = () => {
    if (activeAlarm.snoozeEnabled) {
      snoozeAlarm();
    }
  };

  return (
    <>
      <AlarmPlayer />
      <Modal
        visible={true}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View className="flex-1 bg-white justify-center items-center p-6">
          <View className="items-center space-y-6">
            <Text className="text-6xl">⏰</Text>
            
            <Text className="text-3xl font-bold text-center text-gray-800">
              {activeAlarm.label}
            </Text>
            
            <Text className="text-xl text-gray-600 text-center">
              {activeAlarm.time}
            </Text>
            
            <View className="space-y-4 w-full max-w-sm">
              {activeAlarm.snoozeEnabled && (
                <Button
                  className="bg-orange-500 p-4 rounded-lg"
                  onPress={handleSnooze}
                >
                  <Text className="text-white text-center font-semibold text-lg">
                    Snooze ({activeAlarm.snoozeDuration} min)
                  </Text>
                </Button>
              )}
              
              <Button
                className="bg-red-500 p-4 rounded-lg"
                onPress={handleStop}
              >
                <Text className="text-white text-center font-semibold text-lg">
                  Stop Alarm
                </Text>
              </Button>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

export default AlarmModal;
