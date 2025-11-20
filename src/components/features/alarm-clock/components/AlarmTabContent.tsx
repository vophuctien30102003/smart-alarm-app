import { Text, View } from "react-native";
import SleepGoalSelector from "./SleepGoalSelector";
import { useState } from "react";
import { useSleepAlarmManagement } from "@/hooks/useSleepAlarmManagement";
import ListAlarmClock from "./ListAlarmClock";

export default function AlarmTabContent() {
    const [sleepGoalMinutes, setSleepGoalMinutes] = useState(8 * 60);
    const { sleepAlarms, startAddAlarm, startEditAlarm } =
        useSleepAlarmManagement();

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
                onChangeSleepGoal={setSleepGoalMinutes}
            />
            <>
                <View>
                    <Text className="text-white text-xl font-semibold mb-4">
                        Your Sleep Schedule
                    </Text>
                </View>
                <ListAlarmClock
                    alarms={sleepAlarms}
                    onEditAlarm={startEditAlarm}
                    onAddNewAlarm={startAddAlarm}
                />
            </>
        </View>
    );
}
