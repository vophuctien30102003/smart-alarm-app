import type { SleepAlarm } from "@/shared/types/alarm.type";
import { Text, View } from "react-native";
import { AlarmListSection } from "./AlarmListSection";
import SleepGoalSelector from "./SleepGoalSelector";

interface AlarmTabContentProps {
    sleepGoalMinutes: number;
    onSleepGoalChange: (minutes: number) => void;
    sleepAlarms: SleepAlarm[];
    onAddNewAlarm: () => void;
    onEditAlarm: (alarm: SleepAlarm) => void;
}

export const AlarmTabContent: React.FC<AlarmTabContentProps> = ({
    sleepGoalMinutes,
    onSleepGoalChange,
    sleepAlarms,
    onAddNewAlarm,
    onEditAlarm,
}) => (
    <View className="flex-1 px-6 pt-4 ">
        <Text className="text-[#F8FAFC] text-[22px] font-bold text-center mb-2">
            Set your sleep schedule
        </Text>
        <Text className="text-[#B3B3B3] text-center mb-8 ">
            Your schedule is used to send bedtime reminders and suggest
            wake-up alerts.
        </Text>
        <SleepGoalSelector
            sleepGoalMinutes={sleepGoalMinutes}
            onChangeSleepGoal={onSleepGoalChange}
        />
        <AlarmListSection
            sleepAlarms={sleepAlarms}
            onEditAlarm={onEditAlarm}
            onAddNewAlarm={onAddNewAlarm}
        />
    </View>
);
