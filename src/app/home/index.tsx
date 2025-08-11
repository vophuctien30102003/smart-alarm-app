import { Box, Button, ButtonText, Text } from "@/components/ui";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useRouter } from "expo-router";
import { Pressable, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function HomePage() {
    const router = useRouter();
    const insets = useSafeAreaInsets();

    // Sleep Dashboard Data
    const sleepData = {
        totalSleep: "8h 15m",
        deepSleep: "2h 45m",
        lightSleep: "5h 30m",
        sleepQuality: 85,
    };

    // Location Alarms
    const locationAlarms = [
        {
            id: 1,
            name: "Nhà",
            time: "06:30",
            status: "active",
            icon: "home",
        },
        {
            id: 2,
            name: "Công ty",
            time: "08:00",
            status: "active",
            icon: "building",
        },
    ];

    const nextAlarm = {
        time: "06:30",
        label: "Dậy sớm",
        timeRemaining: "7h 25m",
    };

    return (
        <Box
            className="flex-1"
            style={{ backgroundColor: "#F4F7FE", paddingTop: insets.top }}
        >
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Header */}
                <Box className="px-6 py-6">
                    <Text className="text-2xl font-bold text-gray-800 mb-2">
                        Chào buổi sáng! 👋
                    </Text>
                    <Text className="text-gray-500">
                        {new Date().toLocaleDateString("vi-VN", {
                            weekday: "long",
                            day: "numeric",
                            month: "long",
                        })}
                    </Text>
                </Box>

                {/* Sleep Dashboard */}
                <Box className="mx-6 mb-6">
                    <Box className="bg-white rounded-2xl p-6 shadow-sm">
                        <View className="flex-row items-center justify-between mb-4">
                            <Text className="text-lg font-semibold text-gray-800">
                                Tóm tắt giấc ngủ
                            </Text>
                            <Box className="bg-blue-50 px-3 py-1 rounded-full">
                                <Text className="text-blue-600 font-medium text-sm">
                                    {sleepData.sleepQuality}%
                                </Text>
                            </Box>
                        </View>

                        <View className="flex-row justify-between mb-4">
                            <View className="items-center">
                                <Text className="text-2xl font-bold text-gray-800">
                                    {sleepData.totalSleep}
                                </Text>
                                <Text className="text-gray-500 text-sm">
                                    Tổng thời gian
                                </Text>
                            </View>
                            <View className="items-center">
                                <Text className="text-xl font-semibold text-blue-600">
                                    {sleepData.deepSleep}
                                </Text>
                                <Text className="text-gray-500 text-sm">
                                    Ngủ sâu
                                </Text>
                            </View>
                            <View className="items-center">
                                <Text className="text-xl font-semibold text-green-600">
                                    {sleepData.lightSleep}
                                </Text>
                                <Text className="text-gray-500 text-sm">
                                    Ngủ nhẹ
                                </Text>
                            </View>
                        </View>

                        {/* Sleep Quality Bar */}
                        <Box className="bg-gray-100 h-2 rounded-full overflow-hidden">
                            <Box
                                className="h-full bg-gradient-to-r from-blue-400 to-green-400 rounded-full"
                                style={{
                                    width: `${sleepData.sleepQuality}%`,
                                    backgroundColor: "#667EEA",
                                }}
                            />
                        </Box>
                    </Box>
                </Box>

                {/* Location Alarms Map */}
                <Box className="mx-6 mb-6">
                    <Box className="bg-white rounded-2xl p-6 shadow-sm">
                        <Text className="text-lg font-semibold text-gray-800 mb-4">
                            Báo thức vị trí & Thời gian
                        </Text>

                        {/* Map placeholder */}
                        <Pressable className="bg-gray-50 rounded-xl h-32 items-center justify-center mb-4">
                            <FontAwesome name="map" size={32} color="#9CA3AF" />
                            <Text className="text-gray-400 mt-2">
                                Bản đồ báo thức
                            </Text>
                        </Pressable>

                        {/* Location list */}
                        <View>
                            {locationAlarms.map((location) => (
                                <View
                                    key={location.id}
                                    className="flex-row items-center justify-between py-3 border-t border-gray-100"
                                >
                                    <View className="flex-row items-center">
                                        <Box className="w-10 h-10 bg-blue-50 rounded-full items-center justify-center mr-3">
                                            <FontAwesome
                                                name={location.icon as any}
                                                size={16}
                                                color="#667EEA"
                                            />
                                        </Box>
                                        <View>
                                            <Text className="font-medium text-gray-800">
                                                {location.name}
                                            </Text>
                                            <Text className="text-sm text-gray-500">
                                                {location.time}
                                            </Text>
                                        </View>
                                    </View>
                                    <Box className="w-3 h-3 bg-green-400 rounded-full" />
                                </View>
                            ))}
                        </View>
                    </Box>
                </Box>

                {/* Next Alarm */}
                <Box className="mx-6 mb-6">
                    <Box className="bg-white rounded-2xl p-6 shadow-sm">
                        <Text className="text-lg font-semibold text-gray-800 mb-4">
                            Báo thức tiếp theo
                        </Text>

                        <View className="flex-row items-center justify-between">
                            <View>
                                <Text className="text-3xl font-bold text-gray-800">
                                    {nextAlarm.time}
                                </Text>
                                <Text className="text-gray-500">
                                    {nextAlarm.label}
                                </Text>
                            </View>
                            <View className="items-end">
                                <Text className="text-blue-600 font-medium">
                                    trong {nextAlarm.timeRemaining}
                                </Text>
                                <Text className="text-sm text-gray-400">
                                    còn lại
                                </Text>
                            </View>
                        </View>
                    </Box>
                </Box>

                {/* Quick Access */}
                <Box className="mx-6 mb-8">
                    <Text className="text-lg font-semibold text-gray-800 mb-4">
                        Truy cập nhanh
                    </Text>

                    <View className="flex-row justify-between">
                        <Button
                            size="lg"
                            className="bg-white rounded-2xl shadow-sm flex-1 mr-2"
                            onPress={() => router.push("/(tabs)/alarm-clock")}
                        >
                            <View className="items-center py-4">
                                <Box className="w-12 h-12 bg-blue-100 rounded-full items-center justify-center mb-3">
                                    <FontAwesome
                                        name="plus"
                                        size={20}
                                        color="#667EEA"
                                    />
                                </Box>
                                <ButtonText className="text-gray-800 font-medium">
                                    Thêm báo thức
                                </ButtonText>
                            </View>
                        </Button>

                        <Button
                            size="lg"
                            className="bg-white rounded-2xl shadow-sm flex-1 ml-2"
                            onPress={() => router.push("/(tabs)/alarm-map")}
                        >
                            <View className="items-center py-4">
                                <Box className="w-12 h-12 bg-green-100 rounded-full items-center justify-center mb-3">
                                    <FontAwesome
                                        name="map-marker"
                                        size={20}
                                        color="#48BB78"
                                    />
                                </Box>
                                <ButtonText className="text-gray-800 font-medium">
                                    Thêm vị trí
                                </ButtonText>
                            </View>
                        </Button>
                    </View>
                </Box>

                <Box className="h-20" />
            </ScrollView>
        </Box>
    );
}
