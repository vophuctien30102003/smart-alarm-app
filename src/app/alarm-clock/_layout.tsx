import { Stack } from "expo-router";

export default function AlarmClockLayout() {
    return (
        <Stack>
            <Stack.Screen 
                name="index" 
                options={{
                    title: "Alarm Clock",
                    headerStyle: {
                        backgroundColor: '#f8f9fa',
                    },
                    headerTintColor: '#333',
                    headerTitleStyle: {
                        fontWeight: 'bold',
                    },
                }}
            />
        </Stack>
    );
}