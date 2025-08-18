import { useTheme } from "@/contexts";
import { Stack } from "expo-router";

export default function HomeLayout() {
    const { colors } = useTheme();

    return (
        <Stack
            screenOptions={{
                headerStyle: {
                    backgroundColor: colors.background,
                },
                headerTintColor: colors.text,
                headerShown: false, // Có thể customize cho từng page
            }}
        >
            <Stack.Screen 
                name="index" 
                options={{
                    title: "Trang chủ",
                }} 
            />
            {/* Có thể thêm các sub-pages của Home ở đây */}
        </Stack>
    );
}