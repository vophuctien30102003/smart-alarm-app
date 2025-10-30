import { Text } from "@/components/ui/text";
import { useAlarms } from "@/hooks/useAlarms";
import { SleepAlarm } from "@/shared/types/alarm.type";
import {
    formatDurationFromMinutes,
    formatRepeatDays,
    getMinutesBetweenTimes,
} from "@/shared/utils/timeUtils";
import { FlatList, TouchableOpacity, View } from "react-native";
import { Switch } from "@/components";
import { memo, useCallback } from "react";
import { Moon, Sun1 } from "iconsax-react-native";

interface Props {
    alarms: SleepAlarm[];
    onEditAlarm: (alarm: SleepAlarm) => void;
    onAddNewAlarm: () => void;
}

const SleepAlarmItem = memo(function SleepAlarmItem({
    item,
    onEdit,
    onToggle,
}: {
    item: SleepAlarm;
    onEdit: (alarm: SleepAlarm) => void;
    onToggle: (id: string) => void;
}) {
    const durationMinutes =
        item.goalMinutes ??
        getMinutesBetweenTimes(item.bedtime, item.wakeUpTime);
    const repeatSummary = item.repeatDays?.length
        ? formatRepeatDays(item.repeatDays)
        : "Once";
    return (
        <View
            style={{ backgroundColor: "rgba(20, 30, 48, 0.4)" }}
            className="rounded-2xl border border-white/15 p-4 mb-4"
        >
            <View className="flex-row justify-between items-center mb-3">
                <View className="flex-1">
                    <Text className="text-white text-base font-semibold">
                        {item.label || "Sleep schedule"}
                    </Text>
                    <Text className="text-gray-400 text-xs mt-1">
                        {repeatSummary}
                    </Text>
                </View>
                <Switch
                    value={item.isEnabled}
                    onValueChange={() => onToggle(item.id)}
                />
            </View>
            <View className="flex-row justify-between bg-white/5 rounded-xl p-3">
                <View className="flex-1 justify-center items-center">
                    <View className="flex-row items-center mb-1 gap-2">
                        <Moon size="24" color="#f5ce85" variant="Bold" />
                        <Text className="text-[13px] text-[#B3B3B3] mb-1 flex-row items-center">Bedtime</Text>   
                    </View>
                    <Text className="text-white text-2xl font-light">
                        {item.bedtime}
                    </Text>
                </View>
                <View className="w-px bg-white/10" />
                <View className="flex-1  justify-center items-center">
                    <View className="flex-row items-center mb-1 gap-2">
                        <Sun1 size="24" color="#f5ce85" variant="Bold" />
                        <Text className="text-[13px] text-[#B3B3B3] mb-1 flex-row items-center">Wake-up</Text>   
                    </View>
                    <Text className="text-white text-2xl font-light">
                        {item.wakeUpTime}
                    </Text>
                </View>
            </View>
            <View className="flex-row justify-between items-center mt-3">
                <Text className="text-gray-400 text-xs">
                    Sleep duration ·{" "}
                    {formatDurationFromMinutes(durationMinutes)}
                </Text>
                <TouchableOpacity
                    onPress={() => onEdit(item)}
                    className="px-3 py-1 rounded-full bg-white/10"
                >
                    <Text className="text-[#8179FF] text-xs font-semibold">
                        Edit
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
});
SleepAlarmItem.displayName = "SleepAlarmItem";

function ListAlarmClock({ alarms, onEditAlarm, onAddNewAlarm }: Props) {
    const { toggleAlarm } = useAlarms();
    const handleEditAlarm = useCallback(
        (alarm: SleepAlarm) => {
            onEditAlarm(alarm);
        },
        [onEditAlarm]
    );
    const handleToggleAlarm = useCallback(
        (id: string) => {
            toggleAlarm(id);
        },
        [toggleAlarm]
    );
    const renderItem = useCallback(
        ({ item }: { item: SleepAlarm }) => (
            <SleepAlarmItem
                item={item}
                onEdit={handleEditAlarm}
                onToggle={handleToggleAlarm}
            />
        ),
        [handleEditAlarm, handleToggleAlarm]
    );
    const footer = useCallback(
        () => (
            <TouchableOpacity
                style={{ backgroundColor: "rgba(20, 30, 48, 0.25)" }}
                className="rounded-xl p-4 border border-white/20"
                onPress={onAddNewAlarm}
            >
                <Text className="text-[#8179FF] text-left text-lg">
                    Add schedule
                </Text>
            </TouchableOpacity>
        ),
        [onAddNewAlarm]
    );
    return (
        <View className="flex-1">
            <FlatList
                data={alarms}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                ListFooterComponent={footer}
                contentContainerStyle={{ paddingBottom: 24 }}
            />
        </View>
    );
}

export default memo(ListAlarmClock);
