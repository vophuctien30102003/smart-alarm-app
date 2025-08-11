import { Box, Text } from "@/components/ui";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useState } from "react";
import {
    Alert,
    ScrollView,
    Switch,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function SettingsPage() {
    const insets = useSafeAreaInsets();

    // Settings state
    const [settings, setSettings] = useState({
        notifications: true,
        vibration: true,
        darkMode: false,
        autoBackup: true,
        smartWakeUp: true,
    });

    const toggleSetting = (key: keyof typeof settings) => {
        setSettings((prev) => ({
            ...prev,
            [key]: !prev[key],
        }));
    };

    const settingsItems = [
        {
            icon: "bell",
            title: "Thông báo",
            subtitle: "Hiển thị thông báo báo thức",
            key: "notifications" as keyof typeof settings,
            color: "#FF6B6B",
        },
        {
            icon: "mobile",
            title: "Rung",
            subtitle: "Rung khi có báo thức",
            key: "vibration" as keyof typeof settings,
            color: "#4ECDC4",
        },
        {
            icon: "moon-o",
            title: "Chế độ tối",
            subtitle: "Giao diện tối cho ứng dụng",
            key: "darkMode" as keyof typeof settings,
            color: "#9B59B6",
        },
        {
            icon: "cloud-upload",
            title: "Sao lưu tự động",
            subtitle: "Tự động sao lưu dữ liệu",
            key: "autoBackup" as keyof typeof settings,
            color: "#3498DB",
        },
        {
            icon: "brain",
            title: "Đánh thức thông minh",
            subtitle: "Đánh thức trong giai đoạn ngủ nhẹ",
            key: "smartWakeUp" as keyof typeof settings,
            color: "#E74C3C",
        },
    ];

    const accountItems = [
        { icon: "user", title: "Thông tin cá nhân", color: "#667EEA" },
        { icon: "lock", title: "Bảo mật", color: "#48BB78" },
        { icon: "credit-card", title: "Thanh toán", color: "#ED8936" },
        { icon: "users", title: "Chia sẻ với gia đình", color: "#9F7AEA" },
    ];

    const supportItems = [
        { icon: "question-circle", title: "Trợ giúp & FAQ", color: "#38B2AC" },
        { icon: "star", title: "Đánh giá ứng dụng", color: "#D69E2E" },
        { icon: "envelope", title: "Liên hệ hỗ trợ", color: "#E53E3E" },
        { icon: "file-text", title: "Điều khoản sử dụng", color: "#718096" },
    ];

    return (
        <Box
            className="flex-1"
            style={{ backgroundColor: "#F4F7FE", paddingTop: insets.top }}
        >
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Header */}
                <Box className="px-6 py-6">
                    <Text className="text-2xl font-bold text-gray-800 mb-2">
                        Cài đặt ⚙️
                    </Text>
                    <Text className="text-gray-500">
                        Tùy chỉnh ứng dụng theo ý muốn
                    </Text>
                </Box>

                {/* User Profile */}
                <Box className="mx-6 mb-6">
                    <Box className="bg-white rounded-2xl p-6 shadow-sm">
                        <View className="flex-row items-center">
                            <Box className="w-16 h-16 bg-blue-100 rounded-full items-center justify-center mr-4">
                                <FontAwesome
                                    name="user"
                                    size={28}
                                    color="#667EEA"
                                />
                            </Box>
                            <View className="flex-1">
                                <Text className="text-xl font-bold text-gray-800">
                                    Nguyễn Văn A
                                </Text>
                                <Text className="text-gray-500">
                                    user@example.com
                                </Text>
                                <Text className="text-sm text-blue-600 mt-1">
                                    Premium Member
                                </Text>
                            </View>
                            <TouchableOpacity>
                                <FontAwesome
                                    name="edit"
                                    size={20}
                                    color="#9CA3AF"
                                />
                            </TouchableOpacity>
                        </View>
                    </Box>
                </Box>

                {/* App Settings */}
                <Box className="mx-6 mb-6">
                    <Text className="text-lg font-semibold text-gray-800 mb-4">
                        Cài đặt ứng dụng
                    </Text>

                    <Box className="bg-white rounded-2xl shadow-sm">
                        <View>
                            {settingsItems.map((item, index) => (
                                <Box key={item.key}>
                                    <View className="flex-row items-center justify-between px-6 py-4">
                                        <View className="flex-row items-center flex-1">
                                            <Box
                                                className="w-10 h-10 rounded-full items-center justify-center mr-4"
                                                style={{
                                                    backgroundColor:
                                                        item.color + "20",
                                                }}
                                            >
                                                <FontAwesome
                                                    name={item.icon as any}
                                                    size={16}
                                                    color={item.color}
                                                />
                                            </Box>
                                            <View className="flex-1">
                                                <Text className="font-medium text-gray-800">
                                                    {item.title}
                                                </Text>
                                                <Text className="text-sm text-gray-500">
                                                    {item.subtitle}
                                                </Text>
                                            </View>
                                        </View>
                                        <Switch
                                            value={settings[item.key]}
                                            onValueChange={() =>
                                                toggleSetting(item.key)
                                            }
                                            trackColor={{
                                                false: "#E5E7EB",
                                                true: item.color,
                                            }}
                                            thumbColor={
                                                settings[item.key]
                                                    ? "#FFFFFF"
                                                    : "#9CA3AF"
                                            }
                                        />
                                    </View>
                                    {index < settingsItems.length - 1 && (
                                        <Box className="ml-14 h-px bg-gray-100" />
                                    )}
                                </Box>
                            ))}
                        </View>
                    </Box>
                </Box>

                {/* Account Settings */}
                <Box className="mx-6 mb-6">
                    <Text className="text-lg font-semibold text-gray-800 mb-4">
                        Tài khoản
                    </Text>

                    <Box className="bg-white rounded-2xl shadow-sm">
                        <View>
                            {accountItems.map((item, index) => (
                                <Box key={item.title}>
                                    <TouchableOpacity
                                        onPress={() => {
                                            Alert.alert(
                                                "Thông báo",
                                                `Đang phát triển: ${item.title}`
                                            );
                                        }}
                                    >
                                        <View className="flex-row items-center justify-between px-6 py-4">
                                            <View className="flex-row items-center flex-1">
                                                <Box
                                                    className="w-10 h-10 rounded-full items-center justify-center mr-4"
                                                    style={{
                                                        backgroundColor:
                                                            item.color + "20",
                                                    }}
                                                >
                                                    <FontAwesome
                                                        name={item.icon as any}
                                                        size={16}
                                                        color={item.color}
                                                    />
                                                </Box>
                                                <Text className="font-medium text-gray-800">
                                                    {item.title}
                                                </Text>
                                            </View>
                                            <FontAwesome
                                                name="chevron-right"
                                                size={14}
                                                color="#9CA3AF"
                                            />
                                        </View>
                                    </TouchableOpacity>
                                    {index < accountItems.length - 1 && (
                                        <Box className="ml-14 h-px bg-gray-100" />
                                    )}
                                </Box>
                            ))}
                        </View>
                    </Box>
                </Box>

                {/* Support & About */}
                <Box className="mx-6 mb-6">
                    <Text className="text-lg font-semibold text-gray-800 mb-4">
                        Hỗ trợ & Thông tin
                    </Text>

                    <Box className="bg-white rounded-2xl shadow-sm">
                        <View>
                            {supportItems.map((item, index) => (
                                <Box key={item.title}>
                                    <TouchableOpacity
                                        onPress={() => {
                                            Alert.alert(
                                                "Thông báo",
                                                `Đang phát triển: ${item.title}`
                                            );
                                        }}
                                    >
                                        <View className="flex-row items-center justify-between px-6 py-4">
                                            <View className="flex-row items-center flex-1">
                                                <Box
                                                    className="w-10 h-10 rounded-full items-center justify-center mr-4"
                                                    style={{
                                                        backgroundColor:
                                                            item.color + "20",
                                                    }}
                                                >
                                                    <FontAwesome
                                                        name={item.icon as any}
                                                        size={16}
                                                        color={item.color}
                                                    />
                                                </Box>
                                                <Text className="font-medium text-gray-800">
                                                    {item.title}
                                                </Text>
                                            </View>
                                            <FontAwesome
                                                name="chevron-right"
                                                size={14}
                                                color="#9CA3AF"
                                            />
                                        </View>
                                    </TouchableOpacity>
                                    {index < supportItems.length - 1 && (
                                        <Box className="ml-14 h-px bg-gray-100" />
                                    )}
                                </Box>
                            ))}
                        </View>
                    </Box>
                </Box>

                {/* App Version */}
                <Box className="mx-6 mb-8">
                    <Box className="bg-white rounded-2xl p-6 shadow-sm">
                        <View className="items-center">
                            <Text className="font-medium text-gray-600 mb-1">
                                Smart Alarm App
                            </Text>
                            <Text className="text-sm text-gray-500 mb-3">
                                Phiên bản 1.0.0 (Build 100)
                            </Text>
                            <Text className="text-xs text-gray-400 text-center">
                                © 2024 Smart Alarm Team. All rights reserved.
                            </Text>
                        </View>
                    </Box>
                </Box>

                <Box className="h-20" />
            </ScrollView>
        </Box>
    );
}
