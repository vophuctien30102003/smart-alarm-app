import { Text } from "@/components/ui/text";
import { colors } from "@/constants";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { ScrollView, TouchableOpacity, View } from "react-native";

export default function HomePage() {
    const quickActions = [
        {
            title: "Quick Alarm",
            subtitle: "15 minutes",
            icon: "clock-o",
            color: colors.primary,
            onPress: () => {},
        },
        {
            title: "Nap Time",
            subtitle: "30 minutes",
            icon: "bed",
            color: colors.success,
            onPress: () => {},
        },
    ];
    return (
        <View className="flex-1 pt-[50px] bg-black">
            <ScrollView className="flex-1 px-6">
                <Text
                    className="text-2xl font-bold mb-6"
                    style={{ color: colors.text }}
                >
                    Good Morning!
                </Text>
                <View className="flex-row justify-between mb-6">
                    {quickActions.map((action, index) => (
                        <TouchableOpacity
                            key={index}
                            onPress={action.onPress}
                            className="flex-1 p-4 rounded-xl mr-3 items-center"
                            style={{
                                backgroundColor: colors.surface,
                                marginRight:
                                    index === quickActions.length - 1 ? 0 : 12,
                            }}
                            activeOpacity={0.7}
                        >
                            <View
                                className="w-12 h-12 rounded-full items-center justify-center mb-3"
                                style={{
                                    backgroundColor: action.color + "20",
                                }}
                            >
                                <FontAwesome
                                    name={action.icon as any}
                                    size={24}
                                    color={action.color}
                                />
                            </View>
                            <Text
                                className="font-semibold text-center mb-1"
                                style={{ color: colors.text }}
                            >
                                {action.title}
                            </Text>
                            <Text
                                className="text-xs text-center"
                                style={{ color: colors.textSecondary }}
                            >
                                {action.subtitle}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <Text
                    className="text-lg font-semibold mb-4"
                    style={{ color: colors.text }}
                >
                    Upcoming Alarms
                </Text>
            </ScrollView>
        </View>
    );
}
