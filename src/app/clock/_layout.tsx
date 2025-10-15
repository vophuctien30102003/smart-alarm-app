import { colors } from "@/shared";
import { Stack } from "expo-router";

export default function AlarmClockLayout() {
    return (
            <Stack
                screenOptions={{
                    headerStyle: {
                        backgroundColor: colors.background,
                    },
                    headerTintColor: colors.text,
                    headerShown: false,
                }}
            ></Stack>
    );
}
