import { useTheme } from "@/contexts";
import { Stack } from "expo-router";

export default function AlarmClockLayout() {
    const { colors } = useTheme();

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
                name="add-alarm"
                options={{
                    title: "Thêm báo thức",
                    presentation: "modal",
                }}
            />
            <Stack.Screen
                name="edit-alarm"
                options={{
                    title: "Chỉnh sửa báo thức",
                }}
            />
        </Stack>
    );
}
