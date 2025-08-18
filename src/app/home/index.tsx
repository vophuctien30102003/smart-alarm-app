import { Box } from "@/components/ui";
import { Text } from "@/components/ui/text";
import { useTheme } from "@/theme/useThemeColor";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useRouter } from "expo-router";
import React from "react";
import { ScrollView, TouchableOpacity, View } from "react-native";

export default function HomePage() {
    const { colors } = useTheme();
    const router = useRouter();

    const quickActions = [
        {
            title: "Báo thức nhanh",
            subtitle: "15 phút nữa",
            icon: "clock-o",
            color: colors.primary,
            onPress: () => {},
        },
        {
            title: "Ngủ trưa",
            subtitle: "30 phút",
            icon: "bed",
            color: colors.success,
            onPress: () => {},
        },
    ];

    const upcomingAlarms = [
        {
            time: "07:00",
            label: "Báo thức buổi sáng",
            remaining: "trong 8 giờ 30 phút",
        },
        {
            time: "22:00",
            label: "Nhắc nhở đi ngủ",
            remaining: "trong 23 giờ 30 phút",
        },
    ];

    return (
        <View style={{ flex: 1, backgroundColor: colors.background }}>
            <ScrollView className="flex-1 px-6 py-6">
                <Text
                    className="text-xl font-bold mb-4"
                    style={{ color: colors.text }}
                >
                    Thao tác nhanh
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
                                style={{ backgroundColor: action.color + "20" }}
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

                {/* Upcoming Alarms */}
                <Text
                    className="text-xl font-bold mb-4"
                    style={{ color: colors.text }}
                >
                    Báo thức sắp tới
                </Text>

                {upcomingAlarms.map((alarm, index) => (
                    <View
                        key={index}
                        className="flex-row items-center p-4 rounded-xl mb-3"
                        style={{ backgroundColor: colors.surface }}
                    >
                        <View
                            className="w-12 h-12 rounded-full items-center justify-center mr-4"
                            style={{ backgroundColor: colors.primary + "20" }}
                        >
                            <FontAwesome
                                name="bell"
                                size={20}
                                color={colors.primary}
                            />
                        </View>
                        <View className="flex-1">
                            <Text
                                className="text-2xl font-bold mb-1"
                                style={{ color: colors.text }}
                            >
                                {alarm.time}
                            </Text>
                            <Text
                                className="text-sm mb-1"
                                style={{ color: colors.text }}
                            >
                                {alarm.label}
                            </Text>
                            <Text
                                className="text-xs"
                                style={{ color: colors.textSecondary }}
                            >
                                {alarm.remaining}
                            </Text>
                        </View>
                    </View>
                ))}

                <View className="mt-6">
                    <Box
                        className="p-4 rounded-xl"
                        style={{ backgroundColor: colors.surface }}
                    >
                        <Text
                            className="text-xl font-bold mb-4"
                            style={{ color: colors.text }}
                        >
                            Map
                        </Text>
                    </Box>
                </View>
            </ScrollView>
        </View>
    );
}
