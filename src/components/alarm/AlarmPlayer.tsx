import { useAudioPlayer } from 'expo-audio';
import React, { useEffect } from 'react';
import { useActiveAlarm } from '../../hooks/useAlarms';

export const AlarmPlayer: React.FC = () => {
  const { activeAlarm, isPlaying } = useActiveAlarm();
  const player = useAudioPlayer(activeAlarm?.sound?.uri || '');

  useEffect(() => {
    if (activeAlarm && isPlaying && activeAlarm.sound?.uri) {
      // Play the alarm sound
      player.play();
      player.loop = true;
      player.volume = activeAlarm.volume || 0.8;
    } else {
      // Stop the sound
      player.pause();
    }

    // Cleanup when component unmounts or alarm stops
    return () => {
      player.pause();
    };
  }, [activeAlarm, isPlaying, player]);

  // This component doesn't render anything visible
  // It just handles the audio playing logic
  return null;
};

export default AlarmPlayer;
