import { useAudioPlayer } from 'expo-audio';
import * as Haptics from 'expo-haptics';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';
import { useActiveAlarm } from '../../hooks/useAlarms';
import { getDefaultAlarmSound } from '../../shared/constants';

export const AlarmPlayer: React.FC = () => {
  const { activeAlarm, isPlaying } = useActiveAlarm();
  const intervalRef = useRef<any>(null);
  const [audioUri, setAudioUri] = useState<any>('');
  
  // Determine sound URI to use
  useEffect(() => {
    if (activeAlarm?.sound?.uri) {
      setAudioUri(activeAlarm.sound.uri);
    } else {
      // Fallback to default sound
      const defaultSound = getDefaultAlarmSound();
      setAudioUri(defaultSound.uri);
    }
  }, [activeAlarm?.sound?.uri]);
  
  const player = useAudioPlayer(audioUri);

  const playVibration = useCallback(() => {
    if (Platform.OS === 'ios') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }
  }, []);

  const stopPlayer = useCallback(() => {
    try {
      if (player && player.playing) {
        player.pause();
        player.currentTime = 0;
      }
      
      // Stop vibration pattern
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    } catch (error) {
      console.error('Error stopping alarm player:', error);
    }
  }, [player]);

  const startPlayer = useCallback(() => {
    try {
      if (player && audioUri) {
        player.loop = true;
        player.volume = activeAlarm?.volume || 0.8;
        player.play();
        
        console.log('🔊 Playing alarm sound:', audioUri);
      } else {
        console.warn('⚠️  No audio player or URI available, using vibration only');
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
  }, [player, audioUri, activeAlarm?.volume, activeAlarm?.vibrate, playVibration]);

  useEffect(() => {
    if (activeAlarm && isPlaying) {
      console.log('🚨 Alarm triggered, starting player for:', activeAlarm.label);
      startPlayer();
    } else {
      stopPlayer();
    }

    return () => {
      stopPlayer();
    };
  }, [activeAlarm, isPlaying, startPlayer, stopPlayer]);

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      stopPlayer();
    };
  }, [stopPlayer]);

  return null;
};

export default AlarmPlayer;
