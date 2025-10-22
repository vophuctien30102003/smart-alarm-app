import { DEFAULT_ALARM_SOUNDS } from "@/shared/constants";
import { WeekDay } from "@/shared/enums";
import type { SleepAlarmFormData } from "@/shared/types/sleepAlarmForm.type";
import { formatTime, timeStringToDate } from "@/shared/utils/timeUtils";
import { LinearGradient } from "expo-linear-gradient";
import { Back } from "iconsax-react-native";
import { ScrollView, TouchableOpacity, View } from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { Text } from "../ui/text";
import { CustomAlarmClock } from "./CustomAlarmClock";
import { useSleepAlarmForm } from "./hooks/useSleepAlarmForm";

interface Props {
    onSave: (alarmData: SleepAlarmFormData) => void;
    onBack: () => void;
    initialData?: Partial<SleepAlarmFormData>;
}

export default function SetAlarmScreen({ onSave, onBack, initialData }: Props) {
    const { state, actions } = useSleepAlarmForm({ initialData });

    const { selectedDays, bedtime, wakeTime, sleepDuration, snoozeMinutes, snoozeEnabled, volume, soundId, gentleWakeMinutes, vibrate, isPickerVisibleFor } = state;

    const days = [
        { key: WeekDay.MONDAY, label: "Mo" },
        { key: WeekDay.TUESDAY, label: "Tu" },
        { key: WeekDay.WEDNESDAY, label: "We" },
        { key: WeekDay.THURSDAY, label: "Th" },
        { key: WeekDay.FRIDAY, label: "Fr" },
        { key: WeekDay.SATURDAY, label: "Sa" },
        { key: WeekDay.SUNDAY, label: "Su" },
    ];

    const { toggleDay, adjustBedtime, adjustWakeTime } = actions;

    const handleSave = () => {
        const alarmData = actions.createFormData();
        onSave(alarmData);
    };

    const handleTimeConfirm = (date: Date) => {
        if (isPickerVisibleFor === "bedtime") {
            actions.setBedtime(formatTime(date));
        }
        if (isPickerVisibleFor === "wake") {
            actions.setWakeTime(formatTime(date));
        }
        actions.setPickerVisibleFor(null);
    };

    const handleTimeCancel = () => {
        actions.setPickerVisibleFor(null);
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
                        <TouchableOpacity onPress={() => actions.setPickerVisibleFor("bedtime") }>
                            <Text className="text-white text-4xl font-light">
                                {bedtime}
                            </Text>
                        </TouchableOpacity>
                        <View className="flex-row items-center mt-3">
                            <TouchableOpacity
                                onPress={() => adjustBedtime(-15)}
                                className="px-3 py-1 rounded-full bg-white/10 mr-2"
                            >
                                <Text className="text-white text-sm">-15m</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => adjustBedtime(15)}
                                className="px-3 py-1 rounded-full bg-white/10"
                            >
                                <Text className="text-white text-sm">+15m</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View className="flex-1 items-center">
                        <View className="flex-row items-center mb-2.5">
                            <Text className="text-base mr-2">☀️</Text>
                            <Text className="text-white text-base font-medium">
                                Wake up
                            </Text>
                        </View>
                        <TouchableOpacity onPress={() => actions.setPickerVisibleFor("wake") }>
                            <Text className="text-white text-4xl font-light">
                                {wakeTime}
                            </Text>
                        </TouchableOpacity>
                        <View className="flex-row items-center mt-3">
                            <TouchableOpacity
                                onPress={() => adjustWakeTime(-15)}
                                className="px-3 py-1 rounded-full bg-white/10 mr-2"
                            >
                                <Text className="text-white text-sm">-15m</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => adjustWakeTime(15)}
                                className="px-3 py-1 rounded-full bg-white/10"
                            >
                                <Text className="text-white text-sm">+15m</Text>
                            </TouchableOpacity>
                        </View>
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
                <CustomAlarmClock
                    gentleWakeMinutes={gentleWakeMinutes}
                    onSelectGentleWake={actions.setGentleWakeMinutes}
                    gentleWakeOptions={[0,5,10,15]}
                    snoozeEnabled={snoozeEnabled}
                    onToggleSnooze={actions.setSnoozeEnabled}
                    snoozeMinutes={snoozeMinutes}
                    snoozeOptions={[5,10,15]}
                    onSelectSnooze={actions.setSnoozeMinutes}
                    volume={volume}
                    onChangeVolume={actions.setVolume}
                    soundId={soundId}
                    soundOptions={DEFAULT_ALARM_SOUNDS.map(s => ({ id: s.id, title: s.title }))}
                    onSelectSound={actions.setSoundId}
                    vibrate={vibrate}
                    onToggleVibrate={actions.setVibrate}
                />
            </ScrollView>
            <DateTimePickerModal
                isVisible={isPickerVisibleFor !== null}
                mode="time"
                is24Hour
                date={timeStringToDate(isPickerVisibleFor === "wake" ? wakeTime : bedtime)}
                onConfirm={handleTimeConfirm}
                onCancel={handleTimeCancel}
                minuteInterval={1}
            />
        </LinearGradient>
    );
}
