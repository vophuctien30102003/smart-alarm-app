import { Stack } from "expo-router";

export default function SettingLayout() {
    return (
        <Stack>
            <Stack.Screen 
                name="index" 
                options={{
                    title: "Settings",
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