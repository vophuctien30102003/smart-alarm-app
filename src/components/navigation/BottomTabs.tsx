import AntDesign from "@expo/vector-icons/AntDesign";
import Entypo from "@expo/vector-icons/Entypo";
import { Tabs } from "expo-router";
export const BottomTabs = () => {
    return (
        <Tabs>
            <Tabs.Screen
                name="index"
                options={{
                    title: "Smart Alarm",
                    headerTitle: "Trang chủ",
                    tabBarIcon: ({ color, focused }) => (
                        <AntDesign
                            size={22}
                            name={focused ? "home" : "home"}
                            color={color}
                        />
                    ),
                }}
            />
            <Tabs.Screen
                name="alarm-clock"
                options={{
                    title: "Báo thức",
                    headerTitle: "Báo thức của tôi",
                    tabBarIcon: () => (
                        <AntDesign name="clockcircle" size={24} color="black" />
                    ),
                }}
            />
            <Tabs.Screen
                name="alarm-map"
                options={{
                    title: "Bản đồ",
                    headerTitle: "Báo thức theo vị trí",
                    tabBarIcon: () => (
                        <Entypo name="map" size={24} color="black" />
                    ),
                }}
            />
            <Tabs.Screen
                name="settings"
                options={{
                    title: "Cài đặt",
                    headerTitle: "Cài đặt ứng dụng",
                    tabBarIcon: ({ color, focused }) => (
                        <AntDesign name="setting" size={24} color="black" />
                    ),
                }}
            />
        </Tabs>
    );
};
