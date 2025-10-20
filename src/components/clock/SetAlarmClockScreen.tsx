import { WeekDay } from "@/shared/enums";
import { LinearGradient } from "expo-linear-gradient";
import { Back } from "iconsax-react-native";
import { useState } from "react";
import { ScrollView, TouchableOpacity, View } from "react-native";
import { Text } from "../ui/text";
import { CustomAlarmClock } from "./CustomAlarmClock";

interface Props {
    onSave: (alarmData: any) => void;
    onBack: () => void;
}

export default function SetAlarmScreen({ onSave, onBack }: Props) {
    const [selectedDays, setSelectedDays] = useState<WeekDay[]>([]);
    const [bedtime] = useState("22:15");
    const [wakeTime] = useState("06:15");
    const [sleepDuration] = useState("08:00");

    const days = [
        { key: WeekDay.MONDAY, label: "Mo" },
        { key: WeekDay.TUESDAY, label: "Tu" },
        { key: WeekDay.WEDNESDAY, label: "We" },
        { key: WeekDay.THURSDAY, label: "Th" },
        { key: WeekDay.FRIDAY, label: "Fr" },
        { key: WeekDay.SATURDAY, label: "Sa" },
        { key: WeekDay.SUNDAY, label: "Su" },
    ];

    const toggleDay = (day: WeekDay) => {
        setSelectedDays(prev =>
            prev.includes(day)
                ? prev.filter(d => d !== day)
                : [...prev, day]
        );
    };

    const handleSave = () => {
        const alarmData = {
            selectedDays,
            bedtime,
            wakeTime,
            sleepDuration,
        };
        onSave(alarmData);
    };

    return (
        <LinearGradient className="flex-1" colors={["#9887C3", "#090212"]}>
            <View className="flex-row justify-between items-center px-5 pt-[60px] pb-5">
                <TouchableOpacity onPress={onBack}>
                    <Back size="32" color="#d9e3f0"/>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleSave} className="rounded-full px-4 py-2 bg-[#baaee0]">
                    <Text className="text-[#F8FAFC] text-[17px] font-medium">
                        Save
                    </Text>
                </TouchableOpacity>
            </View>
            <ScrollView
                className="flex-1 px-5"
                showsVerticalScrollIndicator={false}
            >
                <Text className="text-[17px] text-[#F8FAFC] mb-2" >Day of operation</Text>
                <View className="flex-row justify-between mb-8 p-4 border border-[#9887C3] rounded-2xl" style={{ backgroundColor: "rgba(20, 30, 48, 0.25)" }}>
                    {days.map((day) => (
                        <TouchableOpacity
                            key={day.key}
                            className={`w-10 h-10 rounded-full justify-center items-center ${
                                selectedDays.includes(day.key)
                                    ? "bg-[#9887C3]"
                                    : "bg-white/10"
                            }`}
                            onPress={() => toggleDay(day.key)}
                        >
                            <Text className="text-white text-sm font-medium">
                                {day.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <View className="flex-row justify-between mb-10">
                    <View className="flex-1 items-center">
                        <View className="flex-row items-center mb-2.5">
                            <Text className="text-base mr-2">🌙</Text>
                            <Text className="text-white text-base font-medium">
                                Bedtime
                            </Text>
                        </View>
                        <Text className="text-white text-4xl font-light">
                            {bedtime}
                        </Text>
                    </View>

                    <View className="flex-1 items-center">
                        <View className="flex-row items-center mb-2.5">
                            <Text className="text-base mr-2">☀️</Text>
                            <Text className="text-white text-base font-medium">
                                Wake up
                            </Text>
                        </View>
                        <Text className="text-white text-4xl font-light">
                            {wakeTime}
                        </Text>
                    </View>
                </View>

                <View className="items-center mb-10 h-[200px]">
                    <View className="relative w-40 h-40">
                        <View className="w-40 h-40 rounded-full border-2 border-white/20 justify-center items-center">
                            <View className="w-30 h-30 rounded-full bg-[#8179FF]/10 justify-center items-center">
                                <Text className="text-white text-xs mb-1">
                                    Sleep duration
                                </Text>
                                <Text className="text-white text-2xl font-light">
                                    {sleepDuration}
                                </Text>
                            </View>
                        </View>

                        <View className="absolute w-40 h-40 top-0 left-0">
                            {Array.from({ length: 12 }, (_, i) => (
                                <View
                                    key={i}
                                    className="absolute w-5 h-5 top-20 left-[70px] justify-center items-center"
                                    style={{
                                        transform: [
                                            { rotate: `${i * 30}deg` },
                                            { translateY: -80 },
                                        ],
                                    }}
                                >
                                    <Text className="text-white text-xs font-normal">
                                        {i === 0 ? 12 : i}
                                    </Text>
                                </View>
                            ))}
                        </View>
                    </View>
                </View>
                <CustomAlarmClock/>
            </ScrollView>
        </LinearGradient>
    );
}
