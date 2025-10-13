import { BlurView } from 'expo-blur';
import React from 'react';
import { View } from 'react-native';

interface TabBarBackgroundProps {
  children: React.ReactNode;
}

export default function TabBarBackground({ children }: TabBarBackgroundProps) {
  return (
    <View className="absolute bottom-5 left-5 right-5 h-20 rounded-[25px] overflow-hidden shadow-lg">
      <BlurView intensity={80} className="flex-1 rounded-[25px]">
        <View className="absolute inset-0 bg-[#1e1e2e]/85 rounded-[25px]" />
        {children}
      </BlurView>
    </View>
  );
}

