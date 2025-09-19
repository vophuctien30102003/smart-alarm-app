import { useAudioPlayer } from 'expo-audio';
import React, { useCallback, useEffect, useRef } from 'react';
import { useActiveAlarm } from '../hooks/useAlarms';

export const AlarmPlayer: React.FC = () => {
  const { activeAlarm, isPlaying } = useActiveAlarm();
  const player = useAudioPlayer(activeAlarm?.sound?.uri || '');
  const cleanupRef = useRef<(() => void) | null>(null);

  const stopPlayer = useCallback(() => {
    if (player && player.playing) {
      player.pause();
      player.currentTime = 0;
    }
  }, [player]);

  const startPlayer = useCallback(() => {
    if (player && activeAlarm?.sound?.uri) {
      try {
        player.loop = true;
        player.volume = activeAlarm.volume || 0.8;
        player.play();
      } catch (error) {
        console.error('Failed to play alarm sound:', error);
      }
    }
  }, [player, activeAlarm?.sound?.uri, activeAlarm?.volume]);

  useEffect(() => {
    if (cleanupRef.current) {
      cleanupRef.current();
      cleanupRef.current = null;
    }

    if (activeAlarm && isPlaying && activeAlarm.sound?.uri) {
      startPlayer();
    } else {
      stopPlayer();
    }

    return () => {
      stopPlayer();
    };
  }, [activeAlarm, isPlaying, startPlayer, stopPlayer]);

  useEffect(() => {
    return () => {
      if (cleanupRef.current) {
        cleanupRef.current();
      }
      stopPlayer();
    };
  }, [stopPlayer]);

  return null;
};

export default AlarmPlayer;
