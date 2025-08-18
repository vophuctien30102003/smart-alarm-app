import { useThemeColor } from "@/theme/useThemeColor";
import { Stack } from "expo-router";

export default function SettingsLayout() {
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
                    title: "⚙️ Cài đặt",
                }} 
            />
            <Stack.Screen 
                name="notifications" 
                options={{
                    title: "Cài đặt thông báo",
                }} 
            />
            <Stack.Screen 
                name="appearance" 
                options={{
                    title: "Giao diện",
                }} 
            />
        </Stack>
    );
}
