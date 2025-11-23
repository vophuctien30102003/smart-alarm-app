import AlarmTabContent from "@/components/features/alarm-clock/components/AlarmTabContent";
import HeaderTabs from "@/components/features/alarm-clock/components/HeaderTabClock";
import SetAlarmScreen from "@/components/features/alarm-clock/screens/SetAlarmClockScreen";
import { useSleepAlarmManagement } from "@/hooks/useSleepAlarmManagement";
import { SleepAlarmFormData } from "@/shared/types/sleepAlarmForm.type";
import { formatTime } from "@/shared/utils/timeUtils";
import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";
import { SafeAreaView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function AlarmClockPage() {
    const [activeTab, setActiveTab] = useState<"alarm" | "timer">("alarm");
    const [sleepGoalMinutes, setSleepGoalMinutes] = useState(8 * 60);
    const insets = useSafeAreaInsets();
    const {
        sleepAlarms,
        showSetAlarm,
        handleSaveAlarm,
        handleBackFromSetAlarm,
        startAddAlarm,
        startEditAlarm,
        getEditingAlarmData,
    } = useSleepAlarmManagement();

    const buildDefaultSleepAlarmData = (): Partial<SleepAlarmFormData> => {
        const now = new Date();
        const bedtime = formatTime(now);
        const wakeTime = formatTime(
            new Date(now.getTime() + sleepGoalMinutes * 60 * 1000),
        );

        return {
            bedtime,
            wakeTime,
            goalMinutes: sleepGoalMinutes,
        };
    };

    if (showSetAlarm) {
        const initialData = getEditingAlarmData() ?? buildDefaultSleepAlarmData();

        return (
            <SafeAreaView className="flex-1">
                <SetAlarmScreen
                    initialData={initialData}
                    onSave={handleSaveAlarm}
                    onBack={handleBackFromSetAlarm}
                />
            </SafeAreaView>
        );
    }
    return (
        <SafeAreaView className="flex-1">
            <LinearGradient
                colors={["#9887C3", "#090212"]}
                style={{ paddingTop: insets.top }}
                className="flex-1 "
            >
                <HeaderTabs activeTab={activeTab} onChangeTab={setActiveTab} />

                {activeTab === "alarm" ? (
                     <AlarmTabContent
                     sleepGoalMinutes={sleepGoalMinutes}
                     onSleepGoalChange={setSleepGoalMinutes}
                     sleepAlarms={sleepAlarms}
                     onAddNewAlarm={startAddAlarm}
                     onEditAlarm={startEditAlarm}
                 />
                ) : (
                    <View className="flex-1 items-center justify-center">
                        <Text className="text-white text-lg">
                            Timer Coming Soon...
                        </Text>
                    </View>
                )}
            </LinearGradient>
        </SafeAreaView>
    );
}
