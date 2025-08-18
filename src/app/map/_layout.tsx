import { useThemeColor } from "@/theme/useThemeColor";
import { Stack } from "expo-router";

export default function AlarmMapLayout() {
    const { colors } = useThemeColor();

    return (
        <Stack
            screenOptions={{
                headerStyle: {
                    backgroundColor: colors.background,
                },
                headerTintColor: colors.text,
                headerShown: false,
            }}
        >
            <Stack.Screen
                name="index"
                options={{
                    title: "🗺️ Báo thức theo vị trí",
                }}
            />
        </Stack>
    );
}
