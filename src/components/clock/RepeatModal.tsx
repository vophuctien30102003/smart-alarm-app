import { WeekDay } from "@/shared";
import React from "react";
import { Modal, Pressable, ScrollView, View } from "react-native";
import { Text } from "../ui/text";

interface RepeatModalProps {
    visible: boolean;
    onClose: () => void;
    repeatDays: WeekDay[];
    onToggleDay: (day: WeekDay) => void;
}

const RepeatModal: React.FC<RepeatModalProps> = ({
    visible,
    onClose,
    repeatDays,
    onToggleDay,
}) => {
    const weekDays: { day: WeekDay; label: string }[] = [
        { day: WeekDay.MONDAY, label: "Every Monday" },
        { day: WeekDay.TUESDAY, label: "Every Tuesday" },
        { day: WeekDay.WEDNESDAY, label: "Every Wednesday" },
        { day: WeekDay.THURSDAY, label: "Every Thursday" },
        { day: WeekDay.FRIDAY, label: "Every Friday" },
        { day: WeekDay.SATURDAY, label: "Every Saturday" },
        { day: WeekDay.SUNDAY, label: "Every Sunday" },
    ];

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="pageSheet"
        >
            <View className="flex-1 bg-black">
                <View className="flex-row items-center px-6 pt-12 pb-4">
                    <Pressable onPress={onClose}>
                        <Text className="text-orange-500 text-lg">
                            ‹ Back
                        </Text>
                    </Pressable>
                    <Text className="text-white text-lg font-medium ml-4">
                        Repeat
                    </Text>
                </View>

                <ScrollView className="flex-1 px-6">
                    {weekDays.map(({ day, label: dayLabel }) => (
                        <Pressable
                            key={day}
                            onPress={() => onToggleDay(day)}
                            className="flex-row justify-between items-center py-4 border-b border-gray-800"
                        >
                            <Text className="text-white text-lg">
                                {dayLabel}
                            </Text>
                            {repeatDays.includes(day) && (
                                <Text className="text-orange-500 text-lg">
                                    ✓
                                </Text>
                            )}
                        </Pressable>
                    ))}
                </ScrollView>
            </View>
        </Modal>
    );
};

export default RepeatModal;
