import Slider from '@react-native-community/slider';
import React, { useCallback, useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { useAlarms, useAlarmSounds, useTimeValidation } from '../../hooks/useAlarms';
import { Alarm, WeekDay } from '../../types/alarm';
import { AudioManager } from '../../utils/audioManager';
import { formatTimeDisplay, getWeekDayName, parseTimeString } from '../../utils/timeUtils';
import { Box } from '../ui/box';
import { Button } from '../ui/button';

interface AlarmFormProps {
  alarm?: Alarm;
  onSave: () => void;
  onCancel: () => void;
}

const WEEKDAYS = [
  WeekDay.SUNDAY,
  WeekDay.MONDAY,
  WeekDay.TUESDAY,
  WeekDay.WEDNESDAY,
  WeekDay.THURSDAY,
  WeekDay.FRIDAY,
  WeekDay.SATURDAY,
];

export const AlarmForm: React.FC<AlarmFormProps> = ({ alarm, onSave, onCancel }) => {
  const { addAlarm, updateAlarm } = useAlarms();
  const { sounds } = useAlarmSounds();
  const { validateTime, formatTimeInput } = useTimeValidation();

  const [formData, setFormData] = useState({
    time: alarm?.time || '07:00',
    label: alarm?.label || '',
    isEnabled: alarm?.isEnabled ?? true,
    repeatDays: alarm?.repeatDays || [],
    soundName: alarm?.soundName || 'Classic Bell',
    volume: alarm?.volume || 1.0,
    vibrate: alarm?.vibrate ?? true,
    snoozeEnabled: alarm?.snoozeEnabled ?? true,
    snoozeDuration: alarm?.snoozeDuration || 9,
  });

  const [timeInput, setTimeInput] = useState(formData.time);
  const [isPreviewPlaying, setIsPreviewPlaying] = useState(false);
  const [audioManager] = useState(() => AudioManager.getInstance());

  useEffect(() => {
    if (alarm) {
      setFormData({
        time: alarm.time,
        label: alarm.label,
        isEnabled: alarm.isEnabled,
        repeatDays: alarm.repeatDays,
        soundName: alarm.soundName,
        volume: alarm.volume,
        vibrate: alarm.vibrate,
        snoozeEnabled: alarm.snoozeEnabled,
        snoozeDuration: alarm.snoozeDuration,
      });
      setTimeInput(alarm.time);
    }
    
    // Initialize audio manager
    audioManager.initialize();
  }, [alarm, audioManager]);

  useEffect(() => {
    // Cleanup preview on unmount
    return () => {
      audioManager.stopAlarm().catch(console.error);
    };
  }, [audioManager]);

  const stopPreview = useCallback(async () => {
    try {
      await audioManager.stopAlarm();
      setIsPreviewPlaying(false);
    } catch (error) {
      console.error('Failed to stop preview:', error);
    }
  }, [audioManager]);

  const playPreview = useCallback(async (soundName: string) => {
    try {
      const sound = sounds.find(s => s.name === soundName);
      if (!sound) return;

      setIsPreviewPlaying(true);
      await audioManager.playAlarm(sound.uri, formData.volume);
      
      // Stop preview after 3 seconds
      setTimeout(async () => {
        await stopPreview();
      }, 3000);
    } catch (error) {
      console.error('Failed to play preview:', error);
      setIsPreviewPlaying(false);
    }
  }, [sounds, formData.volume, audioManager, stopPreview]);

  const handleTimeChange = (text: string) => {
    const formatted = formatTimeInput(text);
    setTimeInput(formatted);
    
    if (validateTime(formatted)) {
      setFormData(prev => ({ ...prev, time: formatted }));
    }
  };

  const toggleWeekDay = (day: WeekDay) => {
    setFormData(prev => ({
      ...prev,
      repeatDays: prev.repeatDays.includes(day)
        ? prev.repeatDays.filter(d => d !== day)
        : [...prev.repeatDays, day]
    }));
  };

  const handleSave = () => {
    if (!validateTime(formData.time)) {
      Alert.alert('Invalid Time', 'Please enter a valid time in HH:MM format');
      return;
    }

    try {
      if (alarm) {
        updateAlarm(alarm.id, formData);
      } else {
        addAlarm(formData);
      }
      onSave();
    } catch {
      Alert.alert('Error', 'Failed to save alarm');
    }
  };

  const incrementTime = (minutes: number) => {
    const { hours, minutes: mins } = parseTimeString(formData.time);
    let newMinutes = mins + minutes;
    let newHours = hours;

    if (newMinutes >= 60) {
      newHours += Math.floor(newMinutes / 60);
      newMinutes = newMinutes % 60;
    } else if (newMinutes < 0) {
      newHours -= Math.ceil(Math.abs(newMinutes) / 60);
      newMinutes = 60 + (newMinutes % 60);
    }

    if (newHours >= 24) newHours = newHours % 24;
    if (newHours < 0) newHours = 24 + (newHours % 24);

    const newTime = `${newHours.toString().padStart(2, '0')}:${newMinutes.toString().padStart(2, '0')}`;
    setFormData(prev => ({ ...prev, time: newTime }));
    setTimeInput(newTime);
  };

  return (
    <ScrollView style={styles.container}>
      <Box className="p-4">
        <Text style={styles.sectionTitle}>Time</Text>
        <View style={styles.timeContainer}>
          <Button 
            variant="outline" 
            size="sm" 
            onPress={() => incrementTime(-15)}
            className="px-3"
          >
            <Text>-15m</Text>
          </Button>
          
          <View style={styles.timeInputContainer}>
            <TextInput
              style={styles.timeInput}
              value={timeInput}
              onChangeText={handleTimeChange}
              placeholder="HH:MM"
              maxLength={5}
              keyboardType="numeric"
            />
            <Text style={styles.timeDisplay}>
              {validateTime(timeInput) ? formatTimeDisplay(timeInput) : 'Invalid'}
            </Text>
          </View>
          
          <Button 
            variant="outline" 
            size="sm" 
            onPress={() => incrementTime(15)}
            className="px-3"
          >
            <Text>+15m</Text>
          </Button>
        </View>

        <Text style={styles.sectionTitle}>Label</Text>
        <TextInput
          style={styles.textInput}
          value={formData.label}
          onChangeText={(text) => setFormData(prev => ({ ...prev, label: text }))}
          placeholder="Alarm label (optional)"
          maxLength={50}
        />

        <Text style={styles.sectionTitle}>Repeat</Text>
        <View style={styles.weekDaysContainer}>
          {WEEKDAYS.map(day => (
            <Button
              key={day}
              variant={formData.repeatDays.includes(day) ? 'solid' : 'outline'}
              size="sm"
              onPress={() => toggleWeekDay(day)}
              className={`mr-2 mb-2 ${formData.repeatDays.includes(day) ? 'bg-blue-500' : ''}`}
            >
              <Text className={formData.repeatDays.includes(day) ? 'text-white' : 'text-gray-700'}>
                {getWeekDayName(day)}
              </Text>
            </Button>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Sound</Text>
        <View style={styles.soundContainer}>
          {sounds.map(sound => (
            <View key={sound.id} style={styles.soundItem}>
              <Button
                variant={formData.soundName === sound.name ? 'solid' : 'outline'}
                size="sm"
                onPress={() => setFormData(prev => ({ ...prev, soundName: sound.name }))}
                className={`flex-1 mr-2 mb-2 ${formData.soundName === sound.name ? 'bg-green-500' : ''}`}
              >
                <Text className={formData.soundName === sound.name ? 'text-white' : 'text-gray-700'}>
                  {sound.name}
                </Text>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onPress={() => playPreview(sound.name)}
                className="mb-2 bg-blue-50 border-blue-200"
                disabled={isPreviewPlaying}
              >
                <Text className="text-blue-600">
                  {isPreviewPlaying && formData.soundName === sound.name ? '⏸️' : '▶️'}
                </Text>
              </Button>
            </View>
          ))}
        </View>

        {isPreviewPlaying && (
          <View style={styles.previewInfo}>
            <Text style={styles.previewText}>
              🔊 Playing: {formData.soundName} at {Math.round(formData.volume * 100)}%
            </Text>
            <Text style={styles.previewSubtext}>
              Preview will stop automatically in 3 seconds
            </Text>
            <Button
              variant="outline"
              size="sm"
              onPress={stopPreview}
              className="mt-2 bg-red-50 border-red-200"
            >
              <Text className="text-red-600">⏹️ Stop</Text>
            </Button>
          </View>
        )}

        <Text style={styles.sectionTitle}>Volume: {Math.round(formData.volume * 100)}%</Text>
        <Slider
          style={styles.slider}
          value={formData.volume}
          onValueChange={(value: number) => {
            setFormData(prev => ({ ...prev, volume: value }));
          }}
          onSlidingComplete={(value: number) => {
            // Test current volume when user stops sliding
            if (formData.soundName) {
              playPreview(formData.soundName);
            }
          }}
          minimumValue={0.1}
          maximumValue={1.0}
          step={0.1}
          minimumTrackTintColor="#3b82f6"
          maximumTrackTintColor="#e5e7eb"
          thumbTintColor="#3b82f6"
        />
        
        <View style={styles.volumeInfo}>
          <Text style={styles.volumeHint}>
            💡 Drag the slider to test volume level
          </Text>
        </View>

        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>Vibrate</Text>
          <Switch
            value={formData.vibrate}
            onValueChange={(value) => setFormData(prev => ({ ...prev, vibrate: value }))}
            trackColor={{ false: '#e5e7eb', true: '#3b82f6' }}
            thumbColor={formData.vibrate ? '#ffffff' : '#f3f4f6'}
          />
        </View>

        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>Enable Snooze</Text>
          <Switch
            value={formData.snoozeEnabled}
            onValueChange={(value) => setFormData(prev => ({ ...prev, snoozeEnabled: value }))}
            trackColor={{ false: '#e5e7eb', true: '#3b82f6' }}
            thumbColor={formData.snoozeEnabled ? '#ffffff' : '#f3f4f6'}
          />
        </View>

        {formData.snoozeEnabled && (
          <>
            <Text style={styles.sectionTitle}>
              Snooze Duration: {formData.snoozeDuration} minutes
            </Text>
            <Slider
              style={styles.slider}
              value={formData.snoozeDuration}
              onValueChange={(value: number) => setFormData(prev => ({ ...prev, snoozeDuration: Math.round(value) }))}
              minimumValue={1}
              maximumValue={30}
              step={1}
              minimumTrackTintColor="#3b82f6"
              maximumTrackTintColor="#e5e7eb"
              thumbTintColor="#3b82f6"
            />
          </>
        )}

        <View style={styles.buttonContainer}>
          <Button 
            variant="outline" 
            onPress={onCancel}
            className="flex-1 mr-2"
          >
            <Text>Cancel</Text>
          </Button>
          <Button 
            variant="solid" 
            onPress={handleSave}
            className="flex-1 bg-blue-500"
          >
            <Text className="text-white font-medium">
              {alarm ? 'Update' : 'Save'}
            </Text>
          </Button>
        </View>
      </Box>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginTop: 20,
    marginBottom: 12,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  timeInputContainer: {
    alignItems: 'center',
    marginHorizontal: 20,
  },
  timeInput: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#1f2937',
    borderBottomWidth: 2,
    borderBottomColor: '#3b82f6',
    paddingVertical: 8,
    paddingHorizontal: 16,
    minWidth: 120,
  },
  timeDisplay: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: 'white',
  },
  weekDaysContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  soundContainer: {
    flexDirection: 'column',
  },
  soundItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  previewInfo: {
    backgroundColor: '#eff6ff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    alignItems: 'center',
  },
  previewText: {
    fontSize: 14,
    color: '#1d4ed8',
    fontWeight: '500',
    textAlign: 'center',
  },
  previewSubtext: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
    textAlign: 'center',
  },
  slider: {
    width: '100%',
    height: 40,
  },
  volumeInfo: {
    alignItems: 'center',
    marginBottom: 16,
  },
  volumeHint: {
    fontSize: 12,
    color: '#6b7280',
    fontStyle: 'italic',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  switchLabel: {
    fontSize: 16,
    color: '#374151',
  },
  buttonContainer: {
    flexDirection: 'row',
    marginTop: 30,
    marginBottom: 20,
  },
});
