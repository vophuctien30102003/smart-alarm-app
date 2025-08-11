import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs } from 'expo-router';
import { Platform } from 'react-native';

export default function TabLayout() {
  return (
    <Tabs 
      screenOptions={{ 
        tabBarActiveTintColor: '#667EEA',
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 0,
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: -4,
          },
          shadowOpacity: 0.08,
          shadowRadius: 12,
          height: Platform.OS === 'ios' ? 85 : 65,
          paddingBottom: Platform.OS === 'ios' ? 25 : 8,
          paddingTop: 8,
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 2,
        },
        tabBarIconStyle: {
          marginTop: 2,
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Trang chủ',
          tabBarIcon: ({ color, focused }) => (
            <FontAwesome 
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
          title: 'Báo thức',
          tabBarIcon: ({ color, focused }) => (
            <FontAwesome 
              size={22} 
              name={focused ? "bell" : "bell-o"} 
              color={color} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="alarm-map"
        options={{
          title: 'Bản đồ',
          tabBarIcon: ({ color, focused }) => (
            <FontAwesome 
              size={22} 
              name={focused ? "map" : "map-o"} 
              color={color} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Cài đặt',
          tabBarIcon: ({ color, focused }) => (
            <FontAwesome 
              size={22} 
              name={focused ? "cogs" : "cog"} 
              color={color} 
            />
          ),
        }}
      />
    </Tabs>
  );
}
