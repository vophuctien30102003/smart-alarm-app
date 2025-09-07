import FontAwesome from "@expo/vector-icons/FontAwesome";
import { usePathname, useRouter, Href } from "expo-router";
import React, { useCallback } from "react";
import { TouchableOpacity, View } from "react-native";
import { colors } from "../../constants";
import { Box, Text } from "../ui";
import { NavigationItem, navigationItems } from "./tabItems";

export default function TabNavigation() {
    const router = useRouter();
    const pathname = usePathname();

    const handleTabPress = useCallback(
        (route: Href) => {
            if (pathname !== route) {
                router.replace(route);
            }
        },
        [pathname, router]
    );

    return (
        <Box className="absolute bottom-2 left-0 right-0 h-20">
            <View className="flex-row justify-between">
                {navigationItems.map((item: NavigationItem) => {
                    const isActive = pathname.startsWith(`${item.route}`);
                    return (
                        <TouchableOpacity
                            key={`tab-${item.route}`}
                            onPress={() => handleTabPress(item.route as Href)}
                            className="items-center justify-center flex-1 py-2"
                            activeOpacity={0.7}
                        >
                            <FontAwesome
                                name={item.icon}
                                size={24}
                                color={
                                    isActive
                                        ? colors.primary
                                        : colors.textSecondary
                                }
                                className="mb-2"
                            />
                            <Text
                                className="text-xs font-medium"
                                style={{
                                    color: isActive
                                        ? colors.primary
                                        : colors.textSecondary,
                                }}
                            >
                                {item.title}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>
        </Box>
    );
}
