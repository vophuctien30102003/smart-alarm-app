import { SleepAlarm } from "@/shared/types/alarm.type";
import { Add } from "iconsax-react-native";
import { Text, TouchableOpacity, View } from "react-native";
import ListAlarmClock from "./ListAlarmClock";
import SleepGoalSelector from "./SleepGoalSelector";

interface Props {
    sleepAlarms: SleepAlarm[];
    sleepGoalMinutes: number;
    onSleepGoalChange: (minutes: number) => void;
    onAddNewAlarm: () => void;
    onEditAlarm: (alarm: SleepAlarm) => void;
}

export default function AlarmTabContent({
    sleepAlarms,
    sleepGoalMinutes,
    onSleepGoalChange,
    onAddNewAlarm,
    onEditAlarm,
}: Props) {
    return (
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
            <>
                <View className="flex-row items-center justify-between mb-4">
                    <Text className="text-white text-xl font-semibold">
                        Your Sleep Schedule
                    </Text>
                    <TouchableOpacity
                        onPress={onAddNewAlarm}
                        className="bg-[rgba(152,135,195,0.25)] rounded-full p-2"
                    >
                        <Add size={24} color="#d9e3f0" />
                    </TouchableOpacity>
                </View>
                <ListAlarmClock
                    alarms={sleepAlarms}
                    onAddNewAlarm={onAddNewAlarm}
                    onEditAlarm={onEditAlarm}
                />
            </>
        </View>
    );
}
