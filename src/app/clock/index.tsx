import { WeekDay } from "@/shared";
import { useState } from "react";
import {
    Pressable,
    ScrollView,
    Switch,
    View,
} from "react-native";
import { FormAlarmClock } from "../../components/clock";
import { Text } from "../../components/ui/text";
import { useAlarms } from "../../hooks/useAlarms";
import { Alarm, isTimeAlarm } from "../../shared/types";
import { useAlarmStore } from "../../store/alarmStore";

export default function AlarmClockPage() {
    const { alarms, toggleAlarm } = useAlarms();
    const { triggerAlarm } = useAlarmStore();

    const [showAlarmModal, setShowAlarmModal] = useState(false);
    const [editingAlarm, setEditingAlarm] = useState<Alarm | null>(null);

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

    const handleTestAlarm = () => {
        if (alarms.length > 0) {
            const firstAlarm = alarms[0];
            console.log('🧪 Testing alarm trigger for:', firstAlarm.label);
            triggerAlarm(firstAlarm);
        }
    };

    const handleEditAlarm = (alarm: Alarm) => {
        setEditingAlarm(alarm);
        setShowAlarmModal(true);
    };

    const handleAddNewAlarm = () => {
        setEditingAlarm(null);
        setShowAlarmModal(true);
    };

    const handleCloseModal = () => {
        setShowAlarmModal(false);
        setEditingAlarm(null);
    };

    return (
        <View className="flex-1">
            <View className="flex-row justify-between items-center px-6 pt-12 pb-4">
                <Pressable onPress={handleAddNewAlarm}>
                    <Text className="text-orange-500 text-3xl font-light">
                        +
                    </Text>
                </Pressable>
                {alarms.length > 0 && (
                    <Pressable onPress={handleTestAlarm} className="bg-blue-500 px-3 py-1 rounded">
                        <Text className="text-white text-sm">Test Alarm</Text>
                    </Pressable>
                )}
            </View>

            <View className="px-6 mb-8">
                <Text className="text-white text-4xl font-light">Alarm</Text>
            </View>

            <View className="px-6 mb-6">
                <View className="flex-row items-center mb-2">
                    <Text className="text-white text-lg mr-2">🛏️</Text>
                    <Text className="text-white text-lg">Sleep | Wake Up</Text>
                </View>
            </View>

            <ScrollView className="flex-1 px-6">
                {alarms.length > 0 ? (
                    <View className="space-y-1">
                        {alarms.map((alarm) => (
                            <Pressable
                                key={alarm.id}
                                onPress={() => handleEditAlarm(alarm)}
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

                                        <View className="flex-row items-center">
                                            <Switch
                                                value={alarm.isEnabled}
                                                onValueChange={() =>
                                                    toggleAlarm(alarm.id)
                                                }
                                            />
                                        </View>
                                    </View>
                                </View>
                            </Pressable>
                        ))}
                    </View>
                ) : (
                    <View className="items-center mt-20">
                        <Text className="text-gray-500 text-4xl font-light mb-2">
                            No Alarm
                        </Text>
                        <Text className="text-gray-500 text-base mb-8">
                            Tomorrow Morning
                        </Text>
                        <Pressable
                            onPress={handleAddNewAlarm}
                            className="bg-orange-600 px-6 py-3 rounded-lg"
                        >
                            <Text className="text-white font-medium">
                                CHANGE
                            </Text>
                        </Pressable>
                    </View>
                )}
            </ScrollView>

            <FormAlarmClock
                visible={showAlarmModal}
                onClose={handleCloseModal}
                editingAlarm={editingAlarm}
            />
        </View>
    );
}
