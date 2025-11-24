import { ALARM_TIME_DEFAULTS, getDefaultAlarmSound } from '@/shared/constants';
import type { Alarm } from '@/shared/types/alarm.type';
import type { AudioPlayer, AudioSource } from 'expo-audio';
import { createAudioPlayer, setAudioModeAsync } from 'expo-audio';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

class AlarmSoundService {
  private player: AudioPlayer | null = null;
  private vibrationInterval: ReturnType<typeof setInterval> | null = null;
  private isStarting = false;

  private clearVibration(): void {
    if (this.vibrationInterval) {
      clearInterval(this.vibrationInterval);
      this.vibrationInterval = null;
    }
  }

  private triggerVibration(alarm?: Alarm): void {
    const vibrate = () => {
      if (Platform.OS === 'ios') {
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      }
    };

    this.clearVibration();
    vibrate();
    this.vibrationInterval = setInterval(vibrate, 1000);
  }

  async start(alarm?: Alarm): Promise<void> {
    if (this.isStarting) return;
    
    this.isStarting = true;

    try {
      await this.stop();

      const soundIdentifier = alarm?.sound?.uri ?? getDefaultAlarmSound().uri;
      const source: AudioSource = typeof soundIdentifier === 'number' 
        ? soundIdentifier 
        : { uri: soundIdentifier };

      await setAudioModeAsync({
        allowsRecording: false,
        playsInSilentMode: true,
        shouldPlayInBackground: true,
        interruptionModeAndroid: 'doNotMix',
        shouldRouteThroughEarpiece: false,
      });

      const player = createAudioPlayer(source);
      player.loop = true;
      player.play();
      this.player = player;

      this.triggerVibration(alarm);
    } catch (error) {
      console.error('Failed to start alarm sound:', error);
      this.triggerVibration(alarm);
    } finally {
      this.isStarting = false;
    }
  }

  async stop(): Promise<void> {
    if (this.isStarting) return;
    
    this.clearVibration();

    const player = this.player;
    if (!player) return;

    this.player = null;

    try {
      player.loop = false;
      player.pause();
      await player.seekTo(0);
      player.remove();
      await setAudioModeAsync({ shouldPlayInBackground: false });
    } catch (error) {
      console.warn('Failed to stop alarm player:', error);
    }
  }

  dispose(): void {
    this.clearVibration();
    if (this.player) {
      this.player.remove();
      this.player = null;
    }
  }
}

export default new AlarmSoundService();
