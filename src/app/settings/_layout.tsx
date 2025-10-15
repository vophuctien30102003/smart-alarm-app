import { colors } from "@/shared";
import { Stack } from "expo-router";

export default function SettingsLayout() {
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
                    title: "⚙️ Settings",
                }}
            />
        </Stack>
    );
}
