import SetAlarmScreen from "@/components/features/alarm-clock/screens/SetAlarmClockScreen";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { SafeAreaView } from "react-native";

export default function SetAlarmPage() {
    const handleSave = (alarmData: any) => {
        router.back();
    };

    const handleBack = () => {
        router.back();
    };

    return (
        <SafeAreaView className="flex-1">
            <LinearGradient
                colors={["#9887C3", "#090212"]}
                className="flex-1"
            >
                <SetAlarmScreen 
                    onSave={handleSave}
                    onBack={handleBack}
                />
            </LinearGradient>
        </SafeAreaView>
    );
}
