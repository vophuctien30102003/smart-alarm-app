import { Text } from "@/components/ui/text";
import { useThemeColor } from "@/theme/useThemeColor";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { Animated, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
export default function UIStartApp() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { colors } = useThemeColor();

    useEffect(() => {
        const timer = setTimeout(() => {
            router.replace("/home");
        }, 2000);

        return () => clearTimeout(timer);
    }, [router]);

    return (
        <View
            className="flex-1 justify-center items-center"
            style={{
                paddingTop: insets.top,
                backgroundColor: colors.background,
            }}
        >
            <View
                className="absolute inset-0"
                style={{
                    backgroundColor: colors.surface,
                }}
            />

            <Animated.View className="items-center justify-center">
                <View className="w-32 h-32 bg-white rounded-3xl items-center justify-center mb-8 shadow-2xl">
                    <FontAwesome name="bell" size={64} color={colors.primary} />
                </View>
                <Text
                    className="text-4xl font-bold mb-4 text-center"
                    style={{ color: colors.text }}
                >
                    Smart Alarm
                </Text>
            </Animated.View>
            <View className="absolute bottom-8 items-center">
                <Text
                    className="text-xs"
                    style={{ color: colors.textSecondary }}
                >
                    Phiên bản 1.0.0
                </Text>
            </View>
        </View>
    );
}
