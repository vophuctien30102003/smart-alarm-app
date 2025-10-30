import { Ionicons } from '@expo/vector-icons';
import { Text, TouchableOpacity, View } from 'react-native';

interface SleepGoalSelectorProps {
  sleepGoal: number;
  onIncrease: () => void;
  onDecrease: () => void;
}

export const SleepGoalSelector: React.FC<SleepGoalSelectorProps> = ({
  sleepGoal,
  onIncrease,
  onDecrease,
}) => {
  return (
    <View
      style={{ backgroundColor: 'rgba(20, 30, 48, 0.25)' }}
      className="flex-row items-center justify-between mb-8 px-4 py-3 border border-[#9887C3] rounded-2xl"
    >
      <View className="flex-row items-center">
        <Text className="text-2xl mr-2">😴</Text>
        <Text className="text-white text-lg">Sleep goal</Text>
      </View>
      <View className="flex-row items-center">
        <TouchableOpacity
          onPress={onDecrease}
          className="w-8 h-8 rounded-full bg-white/20 items-center justify-center mr-3"
        >
          <Ionicons name="remove" size={16} color="white" />
        </TouchableOpacity>
        <Text className="text-blue-300 text-lg font-medium min-w-[80px] text-center">
          {sleepGoal} hours
        </Text>
        <TouchableOpacity
          onPress={onIncrease}
          className="w-8 h-8 rounded-full bg-white/20 items-center justify-center ml-3"
        >
          <Ionicons name="add" size={16} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
};