import { Audio } from 'expo-av';
import { AlarmSound } from '../types/alarm';

export class AudioManager {
  private static instance: AudioManager;
  private currentSound: Audio.Sound | null = null;
  private isPlaying: boolean = false;

  private constructor() {}

  public static getInstance(): AudioManager {
    if (!AudioManager.instance) {
      AudioManager.instance = new AudioManager();
    }
    return AudioManager.instance;
  }

  async initialize(): Promise<void> {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: true,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });
    } catch (error) {
      console.error('Failed to initialize audio:', error);
    }
  }

  async loadSound(uri: string): Promise<Audio.Sound | null> {
    try {
      const { sound } = await Audio.Sound.createAsync(
        { uri },
        {
          shouldPlay: false,
          isLooping: true,
          volume: 1.0,
        }
      );
      return sound;
    } catch (error) {
      console.error('Failed to load sound:', error);
      return null;
    }
  }

  async playAlarm(soundUri: string, volume: number = 1.0): Promise<boolean> {
    try {
      // Stop current sound if playing
      if (this.currentSound) {
        await this.stopAlarm();
      }

      this.currentSound = await this.loadSound(soundUri);
      if (!this.currentSound) return false;

      await this.currentSound.setVolumeAsync(volume);
      await this.currentSound.playAsync();
      this.isPlaying = true;
      
      return true;
    } catch (error) {
      console.error('Failed to play alarm:', error);
      return false;
    }
  }

  async stopAlarm(): Promise<void> {
    try {
      if (this.currentSound) {
        await this.currentSound.stopAsync();
        await this.currentSound.unloadAsync();
        this.currentSound = null;
      }
      this.isPlaying = false;
    } catch (error) {
      console.error('Failed to stop alarm:', error);
    }
  }

  async setVolume(volume: number): Promise<void> {
    try {
      if (this.currentSound) {
        await this.currentSound.setVolumeAsync(Math.max(0, Math.min(1, volume)));
      }
    } catch (error) {
      console.error('Failed to set volume:', error);
    }
  }

  getIsPlaying(): boolean {
    return this.isPlaying;
  }

  async fadeIn(duration: number = 3000): Promise<void> {
    if (!this.currentSound) return;

    const steps = 30;
    const stepDuration = duration / steps;
    const volumeStep = 1 / steps;

    for (let i = 0; i <= steps; i++) {
      await this.setVolume(i * volumeStep);
      await new Promise(resolve => setTimeout(resolve, stepDuration));
    }
  }

  async fadeOut(duration: number = 1000): Promise<void> {
    if (!this.currentSound) return;

    const steps = 10;
    const stepDuration = duration / steps;
    const currentStatus = await this.currentSound.getStatusAsync();
    
    if (currentStatus.isLoaded) {
      const startVolume = currentStatus.volume || 1;
      const volumeStep = startVolume / steps;

      for (let i = steps; i >= 0; i--) {
        await this.setVolume(i * volumeStep);
        await new Promise(resolve => setTimeout(resolve, stepDuration));
      }
    }
  }
}

export const getDefaultAlarmSounds = (): AlarmSound[] => {
  return [
    {
      id: 'default_1',
      name: 'Classic Bell',
      uri: 'https://www.learningcontainer.com/wp-content/uploads/2020/02/Kalimba.mp3',
      isDefault: true,
    },
    {
      id: 'default_2',
      name: 'Digital Beep',
      uri: 'https://www.learningcontainer.com/wp-content/uploads/2020/02/Kalimba.mp3',
      isDefault: false,
    },
    {
      id: 'default_3',
      name: 'Morning Birds',
      uri: 'https://www.learningcontainer.com/wp-content/uploads/2020/02/Kalimba.mp3',
      isDefault: false,
    },
    {
      id: 'default_4',
      name: 'Gentle Chime',
      uri: 'https://www.learningcontainer.com/wp-content/uploads/2020/02/Kalimba.mp3',
      isDefault: false,
    },
  ];
};

export const validateSoundUri = async (uri: string): Promise<boolean> => {
  try {
    const audioManager = AudioManager.getInstance();
    const sound = await audioManager.loadSound(uri);
    if (sound) {
      await sound.unloadAsync();
      return true;
    }
    return false;
  } catch {
    return false;
  }
};
