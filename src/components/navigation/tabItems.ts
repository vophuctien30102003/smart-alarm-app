
import { Href } from "expo-router";
import {  Map, Notification,  Setting} from 'iconsax-react-native';
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
        label: "Settings",
        icon: Setting,
        route: "/settings" as Href,
        testID: "tab-settings",
    },
];
