import { Box, Button, ButtonText, Text } from "@/components/ui";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function AlarmMapPage() {
    const insets = useSafeAreaInsets();

    const [locationAlarms] = useState([
        {
            id: 1,
            name: "Nhà",
            address: "123 Đường ABC, Quận 1, TP.HCM",
            type: "arriving", // arriving or leaving
            time: "06:30",
            radius: 500, // meters
            enabled: true,
            icon: "home",
        },
        {
            id: 2,
            name: "Công ty",
            address: "456 Đường XYZ, Quận 3, TP.HCM",
            type: "leaving",
            time: "08:00",
            radius: 200,
            enabled: true,
            icon: "building",
        },
        {
            id: 3,
            name: "Phòng gym",
            address: "789 Đường DEF, Quận 2, TP.HCM",
            type: "arriving",
            time: "18:00",
            radius: 100,
            enabled: false,
            icon: "heartbeat",
        },
    ]);

    // Wishlist Locations
    const wishlistLocations = [
        { id: 1, name: "Starbucks Coffee", type: "cafe", icon: "coffee" },
        {
            id: 2,
            name: "Siêu thị BigC",
            type: "shopping",
            icon: "shopping-cart",
        },
        {
            id: 3,
            name: "Bệnh viện Chợ Rẫy",
            type: "hospital",
            icon: "plus-square",
        },
        {
            id: 4,
            name: "Trường ĐH Bách Khoa",
            type: "education",
            icon: "graduation-cap",
        },
        { id: 5, name: "Công viên Tao Đàn", type: "park", icon: "tree" },
        { id: 6, name: "Cinema CGV", type: "entertainment", icon: "film" },
    ];

    const getTypeColor = (type: string) => {
        const colors: { [key: string]: string } = {
            arriving: "bg-green-500",
            leaving: "bg-red-500",
        };
        return colors[type] || "bg-gray-500";
    };

    const getTypeText = (type: string) => {
        return type === "arriving" ? "Khi đến" : "Khi rời";
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
                        Báo thức vị trí 📍
                    </Text>
                    <Text className="text-gray-500">
                        Báo thức dựa trên vị trí của bạn
                    </Text>
                </Box>

                {/* Add Location Button */}
                <Box className="mx-6 mb-6">
                    <Button
                        size="lg"
                        className="bg-green-500 rounded-2xl shadow-sm"
                        onPress={() => {
                            // TODO: Navigate to add location screen
                        }}
                    >
                        <View className="flex-row items-center py-3">
                            <FontAwesome
                                name="map-marker"
                                size={20}
                                color="white"
                                style={{ marginRight: 8 }}
                            />
                            <ButtonText className="text-white font-semibold">
                                Thêm vị trí mới
                            </ButtonText>
                        </View>
                    </Button>
                </Box>

                {/* Current Location Alarms */}
                <Box className="mx-6 mb-6">
                    <Text className="text-lg font-semibold text-gray-800 mb-4">
                        Báo thức đã thiết lập
                    </Text>

                    <View style={{ gap: 12 }}>
                        {locationAlarms.map((location) => (
                            <Box
                                key={location.id}
                                className="bg-white rounded-2xl p-6 shadow-sm"
                            >
                                <View className="flex-row items-start justify-between mb-4">
                                    <View className="flex-row items-start flex-1">
                                        <Box className="w-12 h-12 bg-blue-50 rounded-full items-center justify-center mr-4">
                                            <FontAwesome
                                                name={location.icon as any}
                                                size={20}
                                                color="#667EEA"
                                            />
                                        </Box>
                                        <View className="flex-1">
                                            <Text className="text-lg font-bold text-gray-800">
                                                {location.name}
                                            </Text>
                                            <Text className="text-sm text-gray-500 mb-2">
                                                {location.address}
                                            </Text>
                                            <View className="flex-row items-center mb-2">
                                                <Box
                                                    className={`px-2 py-1 rounded-full ${getTypeColor(
                                                        location.type
                                                    )} mr-2`}
                                                >
                                                    <Text className="text-xs font-medium text-white">
                                                        {getTypeText(
                                                            location.type
                                                        )}
                                                    </Text>
                                                </Box>
                                                <Text className="text-sm text-gray-600">
                                                    lúc {location.time}
                                                </Text>
                                            </View>
                                        </View>
                                    </View>
                                    <Box
                                        className={`w-3 h-3 rounded-full ${
                                            location.enabled
                                                ? "bg-green-400"
                                                : "bg-gray-300"
                                        }`}
                                    />
                                </View>

                                <Box className="bg-gray-50 rounded-xl p-3">
                                    <View className="flex-row items-center">
                                        <FontAwesome
                                            name="location-arrow"
                                            size={14}
                                            color="#9CA3AF"
                                            style={{ marginRight: 6 }}
                                        />
                                        <Text className="text-sm text-gray-500">
                                            Bán kính: {location.radius}m
                                        </Text>
                                    </View>
                                </Box>
                            </Box>
                        ))}
                    </View>
                </Box>

                {/* Map View Placeholder */}
                <Box className="mx-6 mb-6">
                    <Text className="text-lg font-semibold text-gray-800 mb-4">
                        Bản đồ
                    </Text>

                    <Box className="bg-white rounded-2xl p-6 shadow-sm">
                        <Pressable className="bg-gray-50 rounded-xl h-48 items-center justify-center">
                            <FontAwesome name="map" size={48} color="#9CA3AF" />
                            <Text className="text-gray-400 mt-4 text-center">
                                Bản đồ hiển thị vị trí báo thức
                            </Text>
                            <Text className="text-gray-400 text-sm mt-1">
                                Nhấn để xem chi tiết
                            </Text>
                        </Pressable>
                    </Box>
                </Box>

                {/* Suggested Locations (Wishlist) */}
                <Box className="mx-6 mb-8">
                    <Text className="text-lg font-semibold text-gray-800 mb-4">
                        Gợi ý địa điểm
                    </Text>

                    <Box className="bg-white rounded-2xl p-6 shadow-sm">
                        <Text className="text-sm text-gray-500 mb-4">
                            Các địa điểm phổ biến để thiết lập báo thức
                        </Text>

                        <View style={{ gap: 8 }}>
                            {[0, 1, 2].map((row) => (
                                <View
                                    key={row}
                                    className="flex-row justify-between"
                                >
                                    {wishlistLocations
                                        .slice(row * 2, (row + 1) * 2)
                                        .map((location) => (
                                            <Pressable
                                                key={location.id}
                                                className="bg-gray-50 rounded-xl p-4 items-center"
                                                style={{ width: "48%" }}
                                                onPress={() => {
                                                    // TODO: Add to location alarms
                                                }}
                                            >
                                                <Box className="w-10 h-10 bg-blue-100 rounded-full items-center justify-center mb-2">
                                                    <FontAwesome
                                                        name={
                                                            location.icon as any
                                                        }
                                                        size={16}
                                                        color="#667EEA"
                                                    />
                                                </Box>
                                                <Text className="text-sm font-medium text-gray-700 text-center">
                                                    {location.name}
                                                </Text>
                                                <Text className="text-xs text-gray-500 mt-1 capitalize">
                                                    {location.type}
                                                </Text>
                                            </Pressable>
                                        ))}
                                </View>
                            ))}
                        </View>
                    </Box>
                </Box>

                <Box className="h-20" />
            </ScrollView>
        </Box>
    );
}
