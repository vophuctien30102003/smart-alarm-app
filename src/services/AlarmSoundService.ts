import { ALARM_CONSTANTS, getDefaultAlarmSound } from '@/shared/constants';
import type { Alarm } from '@/shared/types/alarm.type';
import type { AudioPlayer, AudioSource } from 'expo-audio';
import { createAudioPlayer, setAudioModeAsync } from 'expo-audio';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

class AlarmSoundService {
  private player: AudioPlayer | null = null;
  private vibrationInterval: ReturnType<typeof setInterval> | null = null;

  private clearVibration() {
    if (this.vibrationInterval) {
      clearInterval(this.vibrationInterval);
      this.vibrationInterval = null;
    }
  }

  private triggerVibration(alarm?: Alarm) {
    if (!alarm?.vibrate) {
      return;
    }

    const vibrate = () => {
      if (Platform.OS === 'ios') {
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      }
    };

    this.clearVibration();
    vibrate();
    this.vibrationInterval = setInterval(() => {
      vibrate();
    }, 1000);
  }

  async start(alarm?: Alarm) {
    await this.stop();

    try {
      const soundIdentifier = alarm?.sound?.uri ?? getDefaultAlarmSound().uri;
      const source: AudioSource = typeof soundIdentifier === 'number' ? soundIdentifier : { uri: soundIdentifier };

      await setAudioModeAsync({
        allowsRecording: false,
        playsInSilentMode: true,
        shouldPlayInBackground: true,
        interruptionModeAndroid: 'doNotMix',
        shouldRouteThroughEarpiece: false,
      });

      const player = createAudioPlayer(source);
      player.volume = alarm?.volume ?? ALARM_CONSTANTS.DEFAULT_VOLUME;
      player.loop = true;
      player.play();
      this.player = player;

      this.triggerVibration(alarm);
    } catch (error) {
      console.error('Failed to start alarm sound:', error);
      this.triggerVibration(alarm);
    }
  }

  async stop() {
    this.clearVibration();

    const player = this.player;
    if (!player) {
      return;
    }

    this.player = null;

    try {
      player.loop = false;
    } catch (error) {
      console.warn('Failed to clear alarm audio loop state:', error);
    }

    try {
      player.pause();
    } catch (error) {
      console.warn('Failed to pause alarm player:', error);
    }

    try {
      await player.seekTo(0);
    } catch (error) {
      console.warn('Failed to reset alarm audio position:', error);
    }

    try {
      player.remove();
    } catch (error) {
      console.warn('Failed to dispose alarm audio player:', error);
    }

    try {
      await setAudioModeAsync({ shouldPlayInBackground: false });
    } catch (error) {
      console.warn('Failed to reset audio mode after stopping alarm:', error);
    }
  }
}

export default new AlarmSoundService();
