import type { SleepAlarm } from '@/shared/types/alarm.type';
import { Text, View } from 'react-native';
import { AlarmListSection } from './AlarmListSection';
import { SleepGoalSelector } from './SleepGoalSelector';

interface AlarmTabContentProps {
  sleepGoal: number;
  onIncreaseGoal: () => void;
  onDecreaseGoal: () => void;
  sleepAlarms: SleepAlarm[];
  onAddNewAlarm: () => void;
  onEditAlarm: (alarm: SleepAlarm) => void;
}

export const AlarmTabContent: React.FC<AlarmTabContentProps> = ({
  sleepGoal,
  onIncreaseGoal,
  onDecreaseGoal,
  sleepAlarms,
  onAddNewAlarm,
  onEditAlarm,
}) => {
  return (
    <View className="flex-1 px-6 pt-8">
      <Text className="text-[#F8FAFC] text-[22px] font-bold text-center mb-2">
        Set your sleep schedule
      </Text>
      <Text className="text-[#B3B3B3] text-center mb-8 px-4">
        Your schedule is used to send bedtime reminders and suggest wake-up alerts.
      </Text>

      <SleepGoalSelector
        sleepGoal={sleepGoal}
        onIncrease={onIncreaseGoal}
        onDecrease={onDecreaseGoal}
      />

      <AlarmListSection
        sleepAlarms={sleepAlarms}
        onAddNewAlarm={onAddNewAlarm}
        onEditAlarm={onEditAlarm}
      />
    </View>
  );
};