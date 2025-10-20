import { useState } from "react";
import { TouchableOpacity, View } from "react-native";
import { Text } from "../ui/text";
import { ArrowDown2 } from "iconsax-react-native";

export function CustomAlarmClock() {
    const [gentleWakeUp] = useState("5 min");
    const [snooze] = useState("10 min");
    const [alarmVolume] = useState(70);
    const [alarmSound] = useState("Classic bell");
    const [vibration, setVibration] = useState(true);
    const [showDetails, setShowDetails] = useState(false);

    return (
        <>
            <View className="flex-row justify-between items-center py-3">
                <Text className="text-[#F8FAFC] text-[17px] font-semibold">
                    Custom alarm
                </Text>
                <TouchableOpacity
                    className="bg-[#9887C340] rounded-full p-2"
                    onPress={() => setShowDetails(!showDetails)}
                >
                    <ArrowDown2 size="24" color="#d9e3f0" />
                </TouchableOpacity>
            </View>

            {showDetails && (
                <View>
                    <View className="flex-row justify-between items-center py-3 border-b border-white/10">
                        <View className="flex-row items-center flex-1">
                            <Text className="text-base mr-3">🎵</Text>
                            <Text className="text-white text-base font-medium">
                                Gentle wake up
                            </Text>
                        </View>
                        <Text className="text-[#8179FF] text-sm font-medium">
                            {gentleWakeUp}
                        </Text>
                    </View>

                    <View className="flex-row justify-between items-center py-3 border-b border-white/10">
                        <View className="flex-row items-center flex-1">
                            <Text className="text-base mr-3">⏰</Text>
                            <Text className="text-white text-base font-medium">
                                Snooze
                            </Text>
                        </View>
                        <Text className="text-[#8179FF] text-sm font-medium">
                            {snooze}
                        </Text>
                    </View>

                    <View className="flex-row justify-between items-center py-3 border-b border-white/10">
                        <View className="flex-row items-center flex-1">
                            <Text className="text-base mr-3">🔊</Text>
                            <Text className="text-white text-base font-medium">
                                Alarm volume
                            </Text>
                        </View>
                        <View className="flex-row items-center flex-1 ml-7">
                            <Text className="text-xs text-gray-400">Min</Text>
                            <View className="flex-1 h-1 bg-white/20 rounded mx-3 relative">
                                <View
                                    className="h-1 bg-[#8179FF] rounded"
                                    style={{ width: `${alarmVolume}%` }}
                                />
                                <View
                                    className="absolute top-[-6px] w-4 h-4 rounded-full bg-white"
                                    style={{ left: `${alarmVolume - 5}%` }}
                                />
                            </View>
                            <Text className="text-xs text-gray-400">Max</Text>
                        </View>
                    </View>

                    {/* Alarm Sound */}
                    <View className="flex-row justify-between items-center py-3 border-b border-white/10">
                        <View className="flex-row items-center flex-1">
                            <Text className="text-base mr-3">🎵</Text>
                            <Text className="text-white text-base font-medium">
                                Alarm sound
                            </Text>
                        </View>
                        <Text className="text-[#8179FF] text-sm font-medium">
                            {alarmSound}
                        </Text>
                    </View>

                    {/* Vibration */}
                    <View className="flex-row justify-between items-center py-3">
                        <View className="flex-row items-center flex-1">
                            <Text className="text-base mr-3">📳</Text>
                            <Text className="text-white text-base font-medium">
                                Vibration
                            </Text>
                        </View>
                        <TouchableOpacity
                            className={`w-[50px] h-7 rounded-full p-0.5 justify-center ${
                                vibration ? "bg-[#8179FF]" : "bg-white/20"
                            }`}
                            onPress={() => setVibration(!vibration)}
                        >
                            <View
                                className={`w-6 h-6 rounded-full bg-white ${
                                    vibration
                                        ? "translate-x-[22px]"
                                        : "translate-x-0"
                                }`}
                            />
                        </TouchableOpacity>
                    </View>
                </View>
            )}
        </>
    );
}
