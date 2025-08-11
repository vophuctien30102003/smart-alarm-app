import { Text } from "@/components/ui/text";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import { Animated, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function Index() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.8)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 1000,
                useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                tension: 50,
                friction: 7,
                useNativeDriver: true,
            }),
        ]).start();

        const timer = setTimeout(() => {
            router.replace("/(tabs)");
        }, 5000);

        return () => clearTimeout(timer);
    }, [fadeAnim, scaleAnim, router]);

    return (
        <View
            className="flex-1 justify-center items-center"
            style={{
                paddingTop: insets.top,
                backgroundColor: "#667eea",
            }}
        >
            <View className="absolute inset-0 bg-gradient-to-br from-indigo-600 to-purple-700" />

            <Animated.View
                className="items-center justify-center"
                style={{
                    opacity: fadeAnim,
                    transform: [{ scale: scaleAnim }],
                }}
            >
                <View className="w-32 h-32 bg-white rounded-3xl items-center justify-center mb-8 shadow-2xl">
                    <FontAwesome name="bell" size={64} color="#4F46E5" />
                </View>
                <Text className="text-4xl font-bold text-white mb-4 text-center">
                    Smart Alarm
                </Text>
                <Text className="text-lg text-white/80 text-center mb-8 px-8">
                    Báo thức thông minh cho cuộc sống hiện đại
                </Text>
                <View className="flex-row items-center">
                    <View className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse" />
                    <View
                        className="w-2 h-2 bg-white/70 rounded-full mr-2 animate-pulse"
                        style={{ animationDelay: "0.2s" }}
                    />
                    <View
                        className="w-2 h-2 bg-white/50 rounded-full animate-pulse"
                        style={{ animationDelay: "0.4s" }}
                    />
                </View>
                <Text className="text-white/60 text-sm mt-4">
                    Đang khởi động...
                </Text>
            </Animated.View>
            <View className="absolute bottom-8 items-center">
                <Text className="text-white/40 text-xs">Phiên bản 1.0.0</Text>
            </View>
        </View>
    );
}
