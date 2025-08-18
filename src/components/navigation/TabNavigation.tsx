import FontAwesome from "@expo/vector-icons/FontAwesome";
import { usePathname, useRouter } from "expo-router";
import React, { memo, useCallback, useMemo } from "react";
import { TouchableOpacity, View } from "react-native";
import { useTheme } from "../../contexts/ThemeContext";
import { Box, Text } from "../ui";

export type NavigationType = 'tabs' | 'stack' | 'drawer';

export interface NavigationItem {
  name: string;
  title: string;
  headerTitle: string;
  icon: string;
  focusedIcon?: string;
  route: string;
}

export const navigationItems: NavigationItem[] = [
  {
    name: "index",
    title: "Trang chủ",
    headerTitle: "Smart Alarm",
    icon: "home",
    focusedIcon: "home",
    route: "/home",
  },
  {
    name: "clock",
    title: "Báo thức", 
    headerTitle: "Báo thức của tôi",
    icon: "bell-o",
    focusedIcon: "bell",
    route: "/clock",
  },
  {
    name: "map",
    title: "Bản đồ",
    headerTitle: "Báo thức theo vị trí", 
    icon: "map-o",
    focusedIcon: "map",
    route: "/map",
  },
  {
    name: "settings",
    title: "Cài đặt",
    headerTitle: "Cài đặt ứng dụng",
    icon: "cog",
    focusedIcon: "cogs", 
    route: "/settings",
  },
];


const TabNavigation = memo(() => {
    const router = useRouter();
    const pathname = usePathname();
    const { colors } = useTheme();

    const handleTabPress = useCallback((route: string) => {
        if (pathname !== route) {
            router.push(route as any);
        }
    }, [pathname, router]);

    const tabItems = useMemo(() => {
        return navigationItems.map((item) => {
            const isActive = pathname.startsWith(item.route);
            const iconName =
                isActive && item.focusedIcon ? item.focusedIcon : item.icon;

            return (
                <TouchableOpacity
                    key={item.route}
                    onPress={() => handleTabPress(item.route)}
                    style={{
                        alignItems: "center",
                        justifyContent: "center",
                        flex: 1,
                        paddingVertical: 8,
                    }}
                    activeOpacity={0.7}
                >
                    <FontAwesome
                        name={iconName as any}
                        size={24}
                        color={isActive ? colors.primary : colors.textSecondary}
                        style={{ marginBottom: 4 }}
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
        });
    }, [pathname, colors, handleTabPress]);

    return (
        <Box className="absolute bottom-2 left-0 right-0 h-20">
            <View className="flex-row justify-between">{tabItems}</View>
        </Box>
    );
});

TabNavigation.displayName = "TabNavigation";

export default TabNavigation;
