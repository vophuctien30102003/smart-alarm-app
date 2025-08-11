import { Stack } from "expo-router";

export default function HomeLayout() {
    return (
        <Stack>
            <Stack.Screen 
                name="index" 
                options={{
                    title: "Home",
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