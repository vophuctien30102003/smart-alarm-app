import React, { useCallback, useMemo } from 'react';
import { Alert, Modal, View } from 'react-native';
import { useActiveAlarm } from '../../hooks/useAlarms';
import { isTimeAlarm } from '../../shared/types';
import { Button } from '../ui/button';
import { Text } from '../ui/text';
import { AlarmPlayer } from './AlarmPlayer';

export const AlarmModal: React.FC = () => {
  const { activeAlarm, isPlaying, stopAlarm, snoozeAlarm } = useActiveAlarm();

  const handleStop = useCallback(() => {
    Alert.alert(
      'Stop Alarm',
      'Are you sure you want to stop the alarm?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Stop', 
          style: 'destructive',
          onPress: stopAlarm 
        },
      ]
    );
  }, [stopAlarm]);

  const handleSnooze = useCallback(() => {
    if (activeAlarm?.snoozeEnabled) {
      snoozeAlarm();
    }
  }, [activeAlarm?.snoozeEnabled, snoozeAlarm]);

  const snoozeText = useMemo(() => {
    if (!activeAlarm?.snoozeEnabled) return '';
    return `Snooze (${activeAlarm.snoozeDuration || 5} min)`;
  }, [activeAlarm?.snoozeEnabled, activeAlarm?.snoozeDuration]);

  const alarmTimeText = useMemo(() => {
    if (!activeAlarm) return '';
    
    if (isTimeAlarm(activeAlarm)) {
      return activeAlarm.time;
    } else {
      return `📍 ${activeAlarm.targetLocation?.name || 'Location Alarm'}`;
    }
  }, [activeAlarm]);

  const shouldShowModal = useMemo(() => {
    return activeAlarm && isPlaying;
  }, [activeAlarm, isPlaying]);

  if (!shouldShowModal) {
    return null;
  }

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
              {activeAlarm.label || 'Alarm'}
            </Text>
            
            <Text className="text-xl text-gray-600 text-center">
              {alarmTimeText}
            </Text>
            
            <View className="space-y-4 w-full max-w-sm">
              {activeAlarm.snoozeEnabled && (
                <Button
                  className="bg-orange-500 p-4 rounded-lg"
                  onPress={handleSnooze}
                >
                  <Text className="text-white text-center font-semibold text-lg">
                    {snoozeText}
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
