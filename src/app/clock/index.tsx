import { AlarmTabContent } from "@/components/features/alarm-clock/components/AlarmTabContent";
import HeaderTabs from "@/components/features/alarm-clock/components/HeaderTabClock";
import SetAlarmScreen from "@/components/features/alarm-clock/screens/SetAlarmClockScreen";
import { useSleepAlarmManagement } from "@/hooks/useSleepAlarmManagement";
import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";
import { SafeAreaView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function AlarmClockPage() {
    const [activeTab, setActiveTab] = useState<"alarm" | "timer">("alarm");
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

    if (showSetAlarm) {
        return (
            <SafeAreaView className="flex-1">
                <SetAlarmScreen
                    initialData={getEditingAlarmData()}
                    onSave={handleSaveAlarm}
                    onBack={handleBackFromSetAlarm}
                />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1" >
            <LinearGradient colors={["#9887C3", "#090212"]} style={{ paddingTop: insets.top }}  className="flex-1 ">
                <HeaderTabs activeTab={activeTab} onChangeTab={setActiveTab} />

                {activeTab === "alarm" ? (
                    <AlarmTabContent
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
