import type { SleepAlarm } from '@/shared/types/alarm.type';
import { Text } from 'react-native';
import ListAlarmClock from './ListAlarmClock';

interface AlarmListSectionProps {
  sleepAlarms: SleepAlarm[];
  onAddNewAlarm: () => void;
  onEditAlarm: (alarm: SleepAlarm) => void;
}

export const AlarmListSection: React.FC<AlarmListSectionProps> = ({
  sleepAlarms,
  onAddNewAlarm,
  onEditAlarm,
}) => {
  return (
    <>
      <Text className="text-white text-xl font-semibold mb-4">
        Your Sleep Schedule
      </Text>
      <ListAlarmClock
        alarms={sleepAlarms}
        onAddNewAlarm={onAddNewAlarm}
        onEditAlarm={onEditAlarm}
      />
    </>
  );
};