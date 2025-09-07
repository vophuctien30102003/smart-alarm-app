import { colors } from "@/constants";
import { Stack } from "expo-router";

export default function AlarmMapLayout() {
    return (
        <Stack
            screenOptions={{
                headerTintColor: colors.text,
                headerShown: false,
            }}
        >
        </Stack>
    );
}
