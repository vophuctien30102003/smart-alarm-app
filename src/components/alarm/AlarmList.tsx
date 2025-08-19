import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useAlarms, useAlarmUtils } from '../../hooks/useAlarms';
import { Alarm } from '../../types/alarm';
import { formatRepeatDays, formatTimeDisplay } from '../../utils/timeUtils';
import { Box } from '../ui/box';
import { Button } from '../ui/button';

interface AlarmItemProps {
  alarm: Alarm;
  onEdit: (alarm: Alarm) => void;
  onDelete: (id: string) => void;
  onToggle: (id: string) => void;
}

const AlarmItem: React.FC<AlarmItemProps> = ({ alarm, onEdit, onDelete, onToggle }) => {
  const { getNextAlarmTime } = useAlarmUtils();
  const nextTime = getNextAlarmTime(alarm);

  return (
    <Box className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-3 shadow-sm">
      <View style={styles.alarmHeader}>
        <View>
          <Text style={[styles.timeText, { opacity: alarm.isEnabled ? 1 : 0.5 }]}>
            {formatTimeDisplay(alarm.time)}
          </Text>
          {alarm.label && (
            <Text style={[styles.labelText, { opacity: alarm.isEnabled ? 1 : 0.5 }]}>
              {alarm.label}
            </Text>
          )}
          <Text style={[styles.repeatText, { opacity: alarm.isEnabled ? 1 : 0.5 }]}>
            {formatRepeatDays(alarm.repeatDays)}
          </Text>
          {nextTime && alarm.isEnabled && (
            <Text style={styles.nextTimeText}>
              Next: {nextTime.toLocaleDateString()} {formatTimeDisplay(nextTime.toTimeString().slice(0, 5))}
            </Text>
          )}
        </View>
        
        <View style={styles.alarmActions}>
          <Button 
            variant={alarm.isEnabled ? 'solid' : 'outline'}
            size="sm"
            onPress={() => onToggle(alarm.id)}
            className={`mr-2 ${alarm.isEnabled ? 'bg-green-500' : 'bg-gray-300'}`}
          >
            <Text className="text-white font-medium">
              {alarm.isEnabled ? 'ON' : 'OFF'}
            </Text>
          </Button>
        </View>
      </View>

      <View style={styles.alarmDetails}>
        <Text style={styles.detailText}>
          🔊 {alarm.soundName} | Volume: {Math.round(alarm.volume * 100)}%
        </Text>
        {alarm.vibrate && <Text style={styles.detailText}>📳 Vibrate</Text>}
        {alarm.snoozeEnabled && (
          <Text style={styles.detailText}>
            😴 Snooze {alarm.snoozeDuration}min
          </Text>
        )}
      </View>

      <View style={styles.buttonRow}>
        <Button 
          variant="outline" 
          size="sm" 
          onPress={() => onEdit(alarm)}
          className="flex-1 mr-2"
        >
          <Text>Edit</Text>
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          onPress={() => onDelete(alarm.id)}
          className="flex-1 bg-red-50 border-red-200"
        >
          <Text className="text-red-600">Delete</Text>
        </Button>
      </View>
    </Box>
  );
};

interface AlarmListProps {
  onEditAlarm: (alarm: Alarm) => void;
  onAddAlarm: () => void;
}

export const AlarmList: React.FC<AlarmListProps> = ({ onEditAlarm, onAddAlarm }) => {
  const { alarms, deleteAlarm, toggleAlarm } = useAlarms();

  const handleDelete = (id: string) => {
    // You might want to add a confirmation dialog here
    deleteAlarm(id);
  };

  const sortedAlarms = [...alarms].sort((a, b) => {
    // Sort by time
    const [aHours, aMinutes] = a.time.split(':').map(Number);
    const [bHours, bMinutes] = b.time.split(':').map(Number);
    
    const aTotal = aHours * 60 + aMinutes;
    const bTotal = bHours * 60 + bMinutes;
    
    return aTotal - bTotal;
  });

  return (
    <Box className="flex-1 p-4">
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Alarms</Text>
        <Button onPress={onAddAlarm} className="bg-blue-500">
          <Text className="text-white font-medium">+ Add</Text>
        </Button>
      </View>

      {sortedAlarms.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No alarms set</Text>
          <Text style={styles.emptySubtext}>Tap &quot;Add&quot; to create your first alarm</Text>
        </View>
      ) : (
        <FlatList
          data={sortedAlarms}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <AlarmItem
              alarm={item}
              onEdit={onEditAlarm}
              onDelete={handleDelete}
              onToggle={toggleAlarm}
            />
          )}
          showsVerticalScrollIndicator={false}
        />
      )}
    </Box>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  alarmHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  timeText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  labelText: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 2,
  },
  repeatText: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 2,
  },
  nextTimeText: {
    fontSize: 12,
    color: '#10b981',
    marginTop: 4,
    fontWeight: '500',
  },
  alarmActions: {
    alignItems: 'flex-end',
  },
  alarmDetails: {
    marginBottom: 12,
  },
  detailText: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 2,
  },
  buttonRow: {
    flexDirection: 'row',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    color: '#6b7280',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9ca3af',
  },
});
