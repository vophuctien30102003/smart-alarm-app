import React, { useEffect, useState } from 'react';
import { Animated, Dimensions, StyleSheet, Text, View } from 'react-native';
import { useActiveAlarm } from '../../hooks/useAlarms';
import { formatTimeDisplay } from '../../utils/timeUtils';
import { Box } from '../ui/box';
import { Button } from '../ui/button';

const { height } = Dimensions.get('window');

export const AlarmPlayer: React.FC = () => {
  const { activeAlarm, isPlaying, isSnoozed, snoozeCount, stopAlarm, snoozeAlarm } = useActiveAlarm();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [pulseAnim] = useState(new Animated.Value(1));
  const [slideAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (isPlaying) {
      // Pulse animation for alarm
      const pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      );

      // Slide in animation
      Animated.timing(slideAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();

      pulseAnimation.start();

      return () => {
        pulseAnimation.stop();
      };
    } else {
      // Slide out animation
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [isPlaying, pulseAnim, slideAnim]);

  if (!activeAlarm) return null;

  const handleStop = async () => {
    await stopAlarm();
  };

  const handleSnooze = async () => {
    if (activeAlarm.snoozeEnabled) {
      await snoozeAlarm();
    }
  };

  const slideTransform = {
    transform: [
      {
        translateY: slideAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [height, 0],
        }),
      },
    ],
  };

  const pulseTransform = {
    transform: [{ scale: pulseAnim }],
  };

  return (
    <Animated.View style={[styles.container, slideTransform]}>
      <Box className="flex-1 justify-center items-center bg-gradient-to-br from-blue-900 to-purple-900">
        <View style={styles.content}>
          {/* Current Time */}
          <Text style={styles.currentTime}>
            {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>

          {/* Alarm Info */}
          <Animated.View style={[styles.alarmInfo, pulseTransform]}>
            <Text style={styles.alarmIcon}>⏰</Text>
            <Text style={styles.alarmTime}>
              {formatTimeDisplay(activeAlarm.time)}
            </Text>
            {activeAlarm.label && (
              <Text style={styles.alarmLabel}>{activeAlarm.label}</Text>
            )}
          </Animated.View>

          {/* Status */}
          <View style={styles.statusContainer}>
            {isSnoozed ? (
              <Text style={styles.statusText}>
                Snoozed {snoozeCount} time{snoozeCount !== 1 ? 's' : ''}
              </Text>
            ) : (
              <Text style={styles.statusText}>ALARM</Text>
            )}
          </View>

          {/* Sound Info */}
          <View style={styles.soundInfo}>
            <Text style={styles.soundText}>🔊 {activeAlarm.soundName}</Text>
            <Text style={styles.volumeText}>
              Volume: {Math.round(activeAlarm.volume * 100)}%
            </Text>
            {activeAlarm.vibrate && (
              <Text style={styles.vibrateText}>📳 Vibrating</Text>
            )}
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          {activeAlarm.snoozeEnabled && !isSnoozed && (
            <Button
              variant="outline"
              size="lg"
              onPress={handleSnooze}
              className="mr-4 border-white border-2 bg-transparent"
              style={styles.snoozeButton}
            >
              <Text style={styles.snoozeButtonText}>
                😴 Snooze ({activeAlarm.snoozeDuration}m)
              </Text>
            </Button>
          )}

          <Button
            variant="solid"
            size="lg"
            onPress={handleStop}
            className="bg-red-500"
            style={styles.stopButton}
          >
            <Text style={styles.stopButtonText}>🛑 Stop</Text>
          </Button>
        </View>

        {/* Additional Info */}
        <View style={styles.bottomInfo}>
          <Text style={styles.infoText}>
            Swipe up to dismiss • Shake device to snooze
          </Text>
        </View>
      </Box>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
    backgroundColor: '#1e1b4b',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  currentTime: {
    fontSize: 24,
    color: '#e5e7eb',
    marginBottom: 40,
    fontFamily: 'monospace',
  },
  alarmInfo: {
    alignItems: 'center',
    marginBottom: 40,
  },
  alarmIcon: {
    fontSize: 80,
    marginBottom: 20,
  },
  alarmTime: {
    fontSize: 72,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    lineHeight: 80,
  },
  alarmLabel: {
    fontSize: 20,
    color: '#d1d5db',
    marginTop: 10,
    textAlign: 'center',
  },
  statusContainer: {
    marginBottom: 30,
  },
  statusText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ef4444',
    textAlign: 'center',
    letterSpacing: 2,
  },
  soundInfo: {
    alignItems: 'center',
    marginBottom: 50,
  },
  soundText: {
    fontSize: 16,
    color: '#d1d5db',
    marginBottom: 5,
  },
  volumeText: {
    fontSize: 14,
    color: '#9ca3af',
    marginBottom: 3,
  },
  vibrateText: {
    fontSize: 14,
    color: '#9ca3af',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 40,
  },
  snoozeButton: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 25,
  },
  snoozeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  stopButton: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 25,
    minWidth: 120,
  },
  stopButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  bottomInfo: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  infoText: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
  },
});
