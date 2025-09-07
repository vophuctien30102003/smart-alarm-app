// import LocationAlarmProvider from "@/components/alarm/LocationAlarmProvider";
import TabNavigation from "@/components/navigation/TabNavigation";
import { GluestackUIProvider } from "@/components/ui/gluestack-ui-provider";
import { NotificationProvider } from "@/contexts/NotificationProvider";
import { Stack } from "expo-router";
import { memo } from "react";
import { View } from "react-native";
import "react-native-get-random-values";
import "./globals.css";

const MemoizedTabNavigation = memo(TabNavigation);

export default function RootLayoutNav() {
    return (
        <NotificationProvider>
            {/* <LocationAlarmProvider> */}
                <GluestackUIProvider mode={"light"}>
                    <View style={{ flex: 1 }}>
                        <Stack>
                            <Stack.Screen
                                name="index"
                                options={{ headerShown: false }}
                            />
                            <Stack.Screen
                                name="home"
                                options={{ headerShown: false }}
                            />
                            <Stack.Screen
                                name="clock"
                                options={{ headerShown: false }}
                            />
                            <Stack.Screen
                                name="map"
                                options={{ headerShown: false }}
                            />
                            <Stack.Screen
                                name="settings"
                                options={{ headerShown: false }}
                            />
                        </Stack>
                        <MemoizedTabNavigation />
                    </View>
                </GluestackUIProvider>
        </NotificationProvider>
    );
}
