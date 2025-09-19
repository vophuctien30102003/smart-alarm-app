
import { Href } from "expo-router";
import { Home, Map, Notification, ProfileCircle } from 'iconsax-react-native';
import { ComponentType } from 'react';

export interface NavigationItem {
    name: string;
    label: string;
    icon: ComponentType<any>;
    route: Href;
    testID: string;
}

export const navigationItems: NavigationItem[] = [
    {
        name: "home",
        label: "Home",
        icon: Home,
        route: "/home" as Href,
        testID: "tab-home",
    },
    {
        name: "map",
        label: "Map", 
        icon: Map,
        route: "/map" as Href,
        testID: "tab-map",
    },
    {
        name: "clock",
        label: "Alarm",
        icon: Notification,
        route: "/clock" as Href,
        testID: "tab-clock",
    },
    {
        name: "settings",
        label: "Profile",
        icon: ProfileCircle,
        route: "/settings" as Href,
        testID: "tab-settings",
    },
];
