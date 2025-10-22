import { ScrollView, Switch, TouchableOpacity, View } from "react-native";
import { Text } from "../../components/ui/text";
import { useAlarms } from "../../hooks/useAlarms";
import { SleepAlarm } from "../../shared/types/alarm.type";
import {
    formatDurationFromMinutes,
    formatRepeatDays,
    getMinutesBetweenTimes,
} from "../../shared/utils/timeUtils";

interface Props {
    alarms: SleepAlarm[];
    onEditAlarm: (alarm: SleepAlarm) => void;
    onAddNewAlarm: () => void;
}

export default function ListAlarmClock({
    alarms,
    onEditAlarm,
    onAddNewAlarm,
}: Props) {
    const { toggleAlarm } = useAlarms();

    return (
        <ScrollView className="flex-1">
            {alarms.length > 0 ? (
                <View className="space-y-4">
                    {alarms.map((alarm) => {
                        const durationMinutes =
                            alarm.goalMinutes ??
                            getMinutesBetweenTimes(
                                alarm.bedtime,
                                alarm.wakeUpTime
                            );
                        const repeatSummary = alarm.repeatDays?.length
                            ? formatRepeatDays(alarm.repeatDays)
                            : "Once";

                        return (
                            <View
                                key={alarm.id}
                                style={{
                                    backgroundColor: "rgba(20, 30, 48, 0.4)",
                                }}
                                className="rounded-2xl border border-white/15 p-4 mb-4"
                            >
                                <View className="flex-row justify-between items-center mb-3">
                                    <View className="flex-1">
                                        <Text className="text-white text-base font-semibold">
                                            {alarm.label || "Sleep schedule"}
                                        </Text>
                                        <Text className="text-gray-400 text-xs mt-1">
                                            {repeatSummary}
                                        </Text>
                                    </View>
                                    <Switch
                                        value={alarm.isEnabled}
                                        onValueChange={() =>
                                            toggleAlarm(alarm.id)
                                        }
                                    />
                                </View>

                                <View className="flex-row justify-between bg-white/5 rounded-xl p-3">
                                    <View className="flex-1 mr-3">
                                        <Text className="text-xs text-gray-300 mb-1 flex-row items-center">
                                            🌙 Bedtime
                                        </Text>
                                        <Text className="text-white text-2xl font-light">
                                            {alarm.bedtime}
                                        </Text>
                                    </View>
                                    <View className="w-px bg-white/10" />
                                    <View className="flex-1 ml-3">
                                        <Text className="text-xs text-gray-300 mb-1 flex-row items-center">
                                            ☀️ Wake up
                                        </Text>
                                        <Text className="text-white text-2xl font-light">
                                            {alarm.wakeUpTime}
                                        </Text>
                                    </View>
                                </View>

                                <View className="flex-row justify-between items-center mt-3">
                                    <Text className="text-gray-400 text-xs">
                                        Sleep duration ·{" "}
                                        {formatDurationFromMinutes(
                                            durationMinutes
                                        )}
                                    </Text>
                                    <TouchableOpacity
                                        onPress={() => onEditAlarm(alarm)}
                                        className="px-3 py-1 rounded-full bg-white/10"
                                    >
                                        <Text className="text-[#8179FF] text-xs font-semibold">
                                            Edit
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        );
                    })}
                    <TouchableOpacity
                        style={{ backgroundColor: "rgba(20, 30, 48, 0.25)" }}
                        className="rounded-xl p-4 border border-white/20"
                        onPress={onAddNewAlarm}
                    >
                        <Text className="text-[#8179FF] text-left text-lg">
                           Add schedule
                        </Text>
                    </TouchableOpacity>
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
