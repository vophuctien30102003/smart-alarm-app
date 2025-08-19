import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useNextAlarm } from '../../hooks/useAlarms';
import { formatRepeatDays, formatTimeDisplay } from '../../utils/timeUtils';
import { Box } from '../ui/box';

export const NextAlarm: React.FC = () => {
  const nextAlarm = useNextAlarm();
  const [timeUntilAlarm, setTimeUntilAlarm] = useState('');

  useEffect(() => {
    if (!nextAlarm?.nextTime) return;

    const updateTimeUntil = () => {
      const now = new Date();
      const diff = nextAlarm.nextTime!.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeUntilAlarm('Now');
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      if (days > 0) {
        setTimeUntilAlarm(`${days}d ${hours}h ${minutes}m`);
      } else if (hours > 0) {
        setTimeUntilAlarm(`${hours}h ${minutes}m`);
      } else {
        setTimeUntilAlarm(`${minutes}m`);
      }
    };

    updateTimeUntil();
    const interval = setInterval(updateTimeUntil, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [nextAlarm]);

  if (!nextAlarm) {
    return (
      <Box className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mx-4 my-2">
        <View style={styles.noAlarmContainer}>
          <Text style={styles.noAlarmIcon}>😴</Text>
          <Text style={styles.noAlarmText}>No upcoming alarms</Text>
          <Text style={styles.noAlarmSubtext}>Tap + to add an alarm</Text>
        </View>
      </Box>
    );
  }

  const { alarm, nextTime } = nextAlarm;

  return (
    <Box className="bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg p-4 mx-4 my-2">
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerText}>⏰ Next Alarm</Text>
        </View>
        
        <View style={styles.alarmDetails}>
          <Text style={styles.timeText}>
            {formatTimeDisplay(alarm.time)}
          </Text>
          
          <View style={styles.infoContainer}>
            {alarm.label && (
              <Text style={styles.labelText}>{alarm.label}</Text>
            )}
            
            <Text style={styles.dateText}>
              {nextTime?.toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'short',
                day: 'numeric'
              })}
            </Text>
            
            <Text style={styles.repeatText}>
              {formatRepeatDays(alarm.repeatDays)}
            </Text>
          </View>
        </View>

        <View style={styles.countdown}>
          <Text style={styles.countdownLabel}>Rings in</Text>
          <Text style={styles.countdownTime}>{timeUntilAlarm}</Text>
        </View>

        <View style={styles.soundInfo}>
          <Text style={styles.soundText}>
            🔊 {alarm.soundName} • {Math.round(alarm.volume * 100)}%
          </Text>
          {alarm.vibrate && (
            <Text style={styles.vibrateText}>📳 Vibrate</Text>
          )}
          {alarm.snoozeEnabled && (
            <Text style={styles.snoozeText}>
              😴 Snooze {alarm.snoozeDuration}min
            </Text>
          )}
        </View>
      </View>
    </Box>
  );
};

const styles = StyleSheet.create({
  noAlarmContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  noAlarmIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  noAlarmText: {
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '500',
    marginBottom: 4,
  },
  noAlarmSubtext: {
    fontSize: 14,
    color: '#9ca3af',
  },
  container: {
    // Container styles handled by Box component
  },
  header: {
    marginBottom: 12,
  },
  headerText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1d4ed8',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  alarmDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  timeText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#1f2937',
    marginRight: 16,
  },
  infoContainer: {
    flex: 1,
  },
  labelText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 2,
  },
  dateText: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 2,
  },
  repeatText: {
    fontSize: 12,
    color: '#9ca3af',
  },
  countdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1d4ed8',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 12,
  },
  countdownLabel: {
    fontSize: 14,
    color: 'white',
    fontWeight: '500',
  },
  countdownTime: {
    fontSize: 18,
    color: 'white',
    fontWeight: 'bold',
  },
  soundInfo: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  soundText: {
    fontSize: 12,
    color: '#6b7280',
    marginRight: 12,
  },
  vibrateText: {
    fontSize: 12,
    color: '#6b7280',
    marginRight: 12,
  },
  snoozeText: {
    fontSize: 12,
    color: '#6b7280',
  },
});
