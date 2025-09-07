
import { Href } from "expo-router";
import FontAwesome from "@expo/vector-icons/FontAwesome";

type IconType = keyof typeof FontAwesome.glyphMap;

export interface NavigationItem {
    name: string;
    title: string;
    headerTitle: string;
    icon: IconType;
    route: Href;
}
export const navigationItems: NavigationItem[] = [
    {
        name: "home",
        title: "Home",
        headerTitle: "Smart Alarm",
        icon: "home",
        route: "/home",
    },
    {
        name: "clock",
        title: "Alarm",
        headerTitle: "My Alarms",
        icon: "bell-o",
        route: "/clock",
    },
    {
        name: "map",
        title: "Map",
        headerTitle: "Location-Based Alarms",
        icon: "map-o",
        route: "/map",
    },
    {
        name: "settings",
        title: "Settings",
        headerTitle: "App Settings",
        icon: "cog",
        route: "/settings",
    },
];
