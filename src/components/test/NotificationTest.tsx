import { Audio } from 'expo-av';
import { useCallback, useEffect, useRef } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import PushNotification from 'react-native-push-notification';

const CHANNEL_ID = 'alarm-channel-v3';

const NotificationTest = () => {
  const soundRef = useRef<Audio.Sound | null>(null);
  const soundFile = require('@/assets/sound/alarm_clock.mp3');

  const setupAudio = useCallback(async () => {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        shouldDuckAndroid: true,
      });
    } catch (error) {
      console.error('Error setting up audio:', error);
    }
  }, []);

  const playSound = useCallback(async () => {
    try {
      if (soundRef.current) {
        await soundRef.current.stopAsync();
        await soundRef.current.unloadAsync();
      }

      const { sound } = await Audio.Sound.createAsync(soundFile, {
        isLooping: true,
        volume: 1.0,
      });

      soundRef.current = sound;
      await sound.playAsync();
    } catch (error) {
      console.error('Error playing sound:', error);
    }
  }, [soundFile]);

  const stopSound = useCallback(async () => {
    try {
      if (soundRef.current) {
        await soundRef.current.stopAsync();
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }
    } catch (error) {
      console.error('Error stopping sound:', error);
    }
  }, []);

  const createNotificationChannel = useCallback(() => {
    PushNotification.createChannel(
      {
        channelId: CHANNEL_ID,
        channelName: 'Alarm Channel',
        channelDescription: 'Channel for alarm notifications',
        playSound: true,
        soundName: 'alarm_clock.mp3',
        importance: 5,
        vibrate: true,
      },
      (created) => console.log(`📡 Channel created: ${created}`)
    );
  }, []);

  const configurePushNotification = useCallback(() => {
    PushNotification.configure({
      onNotification: (notification) => {
        if (!notification.userInteraction) {
          playSound();
          return;
        }

        if (notification.userInteraction && notification.action) {
          if (notification.action === 'Snooze') {
            PushNotification.cancelLocalNotification(notification.id);
            stopSound();

            PushNotification.localNotificationSchedule({
              channelId: CHANNEL_ID,
              id: Math.floor(Math.random() * 1000000),
              title: '⏰ Alarm Snoozed',
              message: 'Alarm will ring again in 10 seconds!',
              date: new Date(Date.now() + 10000),
              playSound: true,
              loopSound: true,
              soundName: 'alarm_clock.mp3',
              actions: ['Snooze', 'Stop'],
              vibrate: true,
              vibration: 1000,
              priority: 'high',
              allowWhileIdle: true,
              invokeApp: true,
              ongoing: false,
              autoCancel: false,
            });
          } else if (notification.action === 'Stop') {
            stopSound();
            PushNotification.cancelAllLocalNotifications();
          }

          notification.finish && notification.finish('backgroundFetchResultNoData');
          return;
        }

        if (notification.userInteraction) {
          console.log('👆 User tapped notification body');
        }

        notification.finish && notification.finish('backgroundFetchResultNoData');
      },

      onAction: (notification) => {
        console.log('🎯 onAction callback:', notification.action);
      },

      popInitialNotification: true,
      requestPermissions: true,
      permissions: { alert: true, badge: true, sound: true },
    });
  }, [playSound, stopSound]);

  const scheduleNotificationAfter5Seconds = useCallback(() => {
    console.log('📅 Scheduling sleep alarm notification...');
    PushNotification.cancelAllLocalNotifications();
    stopSound();

    const scheduledDate = new Date(Date.now() + 5000);

    PushNotification.localNotificationSchedule({
      channelId: CHANNEL_ID,
      id: 1,
      title: '🔔 Alarm Notification',
      message: 'Wake up! Tap Snooze or Stop!',
      bigText: 'Default alarm using alarm_clock.mp3',
      subText: 'Alarm Test',
      playSound: true,
      soundName: 'alarm_clock.mp3',
      loopSound: true,
      actions: ['Snooze', 'Stop'],
      date: scheduledDate,
      allowWhileIdle: true,
      priority: 'high',
      vibrate: true,
      vibration: 1000,
      invokeApp: true,
      ongoing: false,
      autoCancel: false,
    });
  }, [stopSound]);

  useEffect(() => {
    void setupAudio();
    configurePushNotification();
    createNotificationChannel();
    PushNotification.deleteChannel('alarm-channel');

    return () => {
      PushNotification.cancelAllLocalNotifications();
      void stopSound();
    };
  }, [configurePushNotification, createNotificationChannel, setupAudio, stopSound]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🔔 Alarm Notification</Text>

      <Pressable
        style={[styles.button, styles.primaryButton]}
        onPress={scheduleNotificationAfter5Seconds}
      >
        <Text style={styles.buttonText}>⏰ Schedule Alarm (5s)</Text>
      </Pressable>
    </View>
  );
};

export default NotificationTest;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  button: {
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 8,
  },
  primaryButton: {
    backgroundColor: '#3B82F6',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
});
