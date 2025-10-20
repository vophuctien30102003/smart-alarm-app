import { Text, TouchableOpacity, View } from "react-native";

interface HeaderTabsProps {
    activeTab: "alarm" | "timer";
    onChangeTab: (tab: "alarm" | "timer") => void;
}

export default function HeaderTabs({
    activeTab,
    onChangeTab,
}: HeaderTabsProps) {
    return (
        <View className="flex-row items-center justify-center pt-6">
            <View className="flex-row items-center justify-center gap-2 border border-[#9887C3] rounded-[24px] p-1">
                <TouchableOpacity
                    onPress={() => onChangeTab("alarm")}
                    className={`px-4 rounded-[20px] ${
                        activeTab === "alarm"
                            ? "bg-[rgba(20,30,48,0.5)] py-1"
                            : "bg-transparent"
                    }`}
                >
                    <Text
                        className={`text-lg font-medium ${
                            activeTab === "alarm"
                                ? "text-white"
                                : "text-white/60"
                        }`}
                    >
                        Alarm
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => onChangeTab("timer")}
                    className={`px-4  rounded-[20px] ${
                        activeTab === "timer"
                            ? "bg-[rgba(20,30,48,0.5)]"
                            : "bg-transparent"
                    }`}
                >
                    <Text
                        className={`text-lg font-medium ${
                            activeTab === "timer"
                                ? "text-white"
                                : "text-white/60"
                        }`}
                    >
                        Timer
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}
