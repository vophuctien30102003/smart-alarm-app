import { Stack } from "expo-router";

export default function AlarmMapLayout() {
    return (
        <Stack>
            <Stack.Screen 
                name="index" 
                options={{
                    title: "Alarm Map",
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