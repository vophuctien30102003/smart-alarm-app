import { Text, TextInput, View } from "react-native";

type SleepGoalSelectorProps = {
    sleepGoalMinutes: number;
    onChangeSleepGoal?: (minutes: number) => void;
};

export default function SleepGoalSelector({
    sleepGoalMinutes,
    onChangeSleepGoal,
}: SleepGoalSelectorProps) {
    const normalizedGoal = Math.max(sleepGoalMinutes, 0);
    const hours = Math.floor(normalizedGoal / 60);
    const minutes = Math.max(normalizedGoal % 60, 0);

    const handleHoursChange = (value: string) => {
        const sanitized = value.replace(/[^0-9]/g, "");
        const parsedHours = Number(sanitized) || 0;
        const totalMinutes = parsedHours * 60 + minutes;
        onChangeSleepGoal?.(totalMinutes);
    };

    const handleMinutesChange = (value: string) => {
        const sanitized = value.replace(/[^0-9]/g, "");
        const clampedMinutes = Math.max(0, Math.min(59, Number(sanitized) || 0));
        const totalMinutes = hours * 60 + clampedMinutes;
        onChangeSleepGoal?.(totalMinutes);
    };

    return (
        <View
            style={{ backgroundColor: "rgba(20, 30, 48, 0.25)" }}
            className="flex-row items-center justify-between mb-8 px-4 py-3 border border-[#9887C3] rounded-2xl"
        >
            <View className="flex-row items-center">
                <Text className="text-2xl mr-2">😴</Text>
                <Text className="text-white text-lg">Sleep goal</Text>
            </View>
            <View className="flex-row items-center gap-2">
                <View className="flex-row items-center">
                    <TextInput
                        value={String(hours)}
                        keyboardType="number-pad"
                        maxLength={2}
                        onChangeText={handleHoursChange}
                        placeholder="0"
                        placeholderTextColor="rgba(255,255,255,0.5)"
                        className="text-[#8179FF] text-lg font-medium text-center py-0 min-w-6 border-b border-[#8179FF]"
                        />
                    <Text className="text-[#B3B3B3] text-lg">hours</Text>
                </View>
                <View className="flex-row items-center">
                    <TextInput
                        value={String(minutes)}
                        keyboardType="number-pad"
                        maxLength={2}
                        onChangeText={handleMinutesChange}
                        placeholderTextColor="rgba(255,255,255,0.5)"
                        className="text-[#8179FF] text-lg font-medium text-center py-0 min-w-6 border-b border-[#8179FF]"
                        />
                    <Text className="text-[#B3B3B3] text-lg ">minutes</Text>
                </View>
            </View>
        </View>
    );
}
