import type { AudioPlayer, AudioSource } from 'expo-audio';
import { createAudioPlayer, setAudioModeAsync } from 'expo-audio';
import * as Haptics from 'expo-haptics';
import React, { useCallback, useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import { useActiveAlarm } from '../../hooks/useAlarms';
import { ALARM_CONSTANTS, getDefaultAlarmSound } from '../../shared/constants';

export const AlarmPlayer: React.FC = () => {
  const { activeAlarm, isPlaying } = useActiveAlarm();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const soundRef = useRef<AudioPlayer | null>(null);

  const playVibration = useCallback(() => {
    if (Platform.OS === 'ios') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }
  }, []);

  const stopPlayer = useCallback(async () => {
    try {
      const player = soundRef.current;
      if (player) {
        soundRef.current = null;

        try {
          player.pause();
          await player.seekTo(0);
        } catch (error) {
          console.warn('Failed to reset alarm audio position:', error);
        } finally {
          try {
            player.remove();
          } catch (removeError) {
            console.warn('Failed to release alarm audio player:', removeError);
          }
        }
      }

      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    } catch (error) {
      console.error('Error stopping alarm player:', error);
    }
  }, []);

  const startPlayer = useCallback(async () => {
    try {
      await stopPlayer();

      const soundIdentifier = activeAlarm?.sound?.uri ?? getDefaultAlarmSound().uri;
      const source: AudioSource = typeof soundIdentifier === 'number' ? soundIdentifier : { uri: soundIdentifier };

      await setAudioModeAsync({
        allowsRecording: false,
        playsInSilentMode: true,
        shouldPlayInBackground: true,
        interruptionModeAndroid: 'doNotMix',
        shouldRouteThroughEarpiece: false,
      });

      const player = createAudioPlayer(source);

      player.volume = activeAlarm?.volume ?? ALARM_CONSTANTS.DEFAULT_VOLUME;
      player.loop = true;
      player.play();

      soundRef.current = player;
      console.log('🔊 Playing alarm sound:', soundIdentifier);

      if (!soundRef.current && !activeAlarm?.vibrate) {
        console.warn('⚠️  No audio sound instance available, using vibration only');
      }

      // Start vibration pattern if enabled
      if (activeAlarm?.vibrate) {
        playVibration();
        intervalRef.current = setInterval(() => {
          playVibration();
        }, 1000); // Vibrate every second
      }
    } catch (error) {
      console.error('Error starting alarm player:', error);
      // Even if audio fails, still provide vibration feedback
      if (activeAlarm?.vibrate) {
        playVibration();
        intervalRef.current = setInterval(() => {
          playVibration();
        }, 1000);
      }
    }
  }, [activeAlarm?.sound?.uri, activeAlarm?.volume, activeAlarm?.vibrate, playVibration, stopPlayer]);

  useEffect(() => {
    if (activeAlarm && isPlaying) {
      console.log('🚨 Alarm triggered, starting player for:', activeAlarm.label);
      startPlayer().catch(error => {
        console.error('Failed to start alarm player:', error);
      });
    } else {
      stopPlayer().catch(error => {
        console.error('Failed to stop alarm player:', error);
      });
    }

    return () => {
      stopPlayer().catch(error => {
        console.error('Failed to cleanup alarm player:', error);
      });
    };
  }, [activeAlarm, isPlaying, startPlayer, stopPlayer]);

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      stopPlayer().catch(error => {
        console.error('Failed to cleanup alarm player on unmount:', error);
      });
    };
  }, [stopPlayer]);

  return null;
};

export default AlarmPlayer;
