import { useAlarms } from "@/hooks/useAlarms";
import { type LocationAlarm } from "@/shared/types/alarm.type";
import { Alert, Switch, Text, View } from "react-native";

export default function ItemAlarmLocation({ alarm }: { alarm: LocationAlarm }) {
     const { toggleAlarm } = useAlarms()

    const handleToggleActive = async (id: string) => {
        try {
            await toggleAlarm(id);
        } catch (error) {
            console.error("Error toggling alarm:", error);
            Alert.alert("Error", "Failed to update alarm status");
        }
    };
    return (
        <View key={alarm.id} className="flex bg-[rgba(152,135,195,0.10)]">
            <View className="flex-row justify-between items-start mb-3">
                <View className="flex-1">
                    <Text className="text-gray-300 text-base font-medium">
                        {alarm.targetLocation.name}
                    </Text>
                    <Text className="text-gray-400 text-sm mt-1">
                        {alarm.targetLocation.address}
                    </Text>
                </View>
                <Switch
                    value={alarm.isEnabled}
                    onValueChange={() => handleToggleActive(alarm.id)}
                    trackColor={{ false: "#374151", true: "#3B82F6" }}
                    thumbColor={alarm.isEnabled ? "#60A5FA" : "#9CA3AF"}
                />
            </View>
        </View>
    );
}
