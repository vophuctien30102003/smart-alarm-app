import { Text } from '@/components/ui/text';
import { useTheme } from '@/theme/useThemeColor';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, TouchableOpacity, View } from 'react-native';

export default function Settings() {
    const { colors, isDark } = useTheme();
    const router = useRouter();

    const settingItems = [
        {
            title: "Thông báo",
            subtitle: "Cài đặt âm thanh và rung",
            icon: "bell",
            route: "/settings/notifications",
            onPress: () => router.push("/settings/notifications"),
        },
        {
            title: "Giao diện",
            subtitle: `Chế độ ${isDark ? 'tối' : 'sáng'}`,
            icon: "lightbulb-o",
            route: "/settings/appearance", 
            onPress: () => router.push("/settings/appearance"),
        },
        {
            title: "Sao lưu",
            subtitle: "Đồng bộ dữ liệu",
            icon: "cloud",
            route: "",
            onPress: () => {},
        },
        {
            title: "Về ứng dụng",
            subtitle: "Phiên bản 1.0.0",
            icon: "info-circle",
            route: "",
            onPress: () => {},
        },
    ];

    return (
        <View style={{ flex: 1, backgroundColor: colors.background }}>
            <ScrollView className="flex-1 px-6 py-4">
                {settingItems.map((item, index) => (
                    <TouchableOpacity
                        key={index}
                        onPress={item.onPress}
                        className="flex-row items-center py-4 px-4 rounded-xl mb-3"
                        style={{ backgroundColor: colors.surface }}
                        activeOpacity={0.7}
                    >
                        <View 
                            className="w-10 h-10 rounded-full items-center justify-center mr-4"
                            style={{ backgroundColor: colors.primary + '20' }}
                        >
                            <FontAwesome 
                                name={item.icon as any} 
                                size={20} 
                                color={colors.primary} 
                            />
                        </View>
                        <View className="flex-1">
                            <Text 
                                className="text-lg font-semibold mb-1"
                                style={{ color: colors.text }}
                            >
                                {item.title}
                            </Text>
                            <Text 
                                className="text-sm"
                                style={{ color: colors.textSecondary }}
                            >
                                {item.subtitle}
                            </Text>
                        </View>
                        {item.route && (
                            <FontAwesome 
                                name="chevron-right" 
                                size={16} 
                                color={colors.textSecondary} 
                            />
                        )}
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );
}
