import { WeekDay } from "@/shared/enums";
import {
    Pressable,
    ScrollView,
    Switch,
    TouchableOpacity,
    View,
} from "react-native";
import { Text } from "../../components/ui/text";
import { useAlarms } from "../../hooks/useAlarms";
import { Alarm, isTimeAlarm } from "../../shared/types";

interface Props {
    alarms: Alarm[];
    onEditAlarm: (alarm: Alarm) => void;
    onAddNewAlarm: () => void;
}

export default function ListAlarmClock({
    alarms,
    onEditAlarm,
    onAddNewAlarm,
}: Props) {
    const { toggleAlarm } = useAlarms();

    const formatTime = (alarm: Alarm) => {
        if (isTimeAlarm(alarm)) {
            return alarm.time || "00:00";
        }
        return "Location Alarm";
    };

    const getWeekDaysText = (alarm: Alarm) => {
        if (!isTimeAlarm(alarm)) return "Location Based";

        const days = alarm.repeatDays;
        if (days.length === 0) return "Never";
        if (days.length === 7) return "Every Day";

        const dayNames: Record<WeekDay, string> = {
            [WeekDay.MONDAY]: "Mon",
            [WeekDay.TUESDAY]: "Tue",
            [WeekDay.WEDNESDAY]: "Wed",
            [WeekDay.THURSDAY]: "Thu",
            [WeekDay.FRIDAY]: "Fri",
            [WeekDay.SATURDAY]: "Sat",
            [WeekDay.SUNDAY]: "Sun",
        };

        return days.map((day) => dayNames[day]).join(", ");
    };

    return (
        <ScrollView className="flex-1">
            {alarms.length > 0 ? (
                <View className="space-y-1">
                    {alarms.map((alarm) => (
                        <Pressable
                            key={alarm.id}
                            onPress={() => onEditAlarm(alarm)}
                            className="active:opacity-70"
                        >
                            <View className="py-4 border-b border-gray-800">
                                <View className="flex-row justify-between items-center">
                                    <View className="flex-1">
                                        <Text className="text-white text-3xl font-light mb-1">
                                            {formatTime(alarm)}
                                        </Text>
                                        <Text className="text-gray-400 text-base">
                                            {alarm.label}
                                        </Text>
                                        <Text className="text-gray-400 text-sm">
                                            {getWeekDaysText(alarm)}
                                        </Text>
                                    </View>

                                    <Switch
                                        value={alarm.isEnabled}
                                        onValueChange={() =>
                                            toggleAlarm(alarm.id)
                                        }
                                    />
                                </View>
                            </View>
                        </Pressable>
                    ))}
                </View>
            ) : (
                <TouchableOpacity
                    style={{ backgroundColor: "rgba(20, 30, 48, 0.25)" }}
                    className="rounded-xl p-4 border border-white/20"
                    onPress={onAddNewAlarm}
                >
                    <Text className="text-[#8179FF] text-left text-lg">
                        Set your first sleep schedule
                    </Text>
                </TouchableOpacity>
            )}
        </ScrollView>
    );
}
