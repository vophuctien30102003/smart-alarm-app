import TabNavigation from '@/components/navigation/TabNavigation';
import { GluestackUIProvider } from '@/components/ui/gluestack-ui-provider';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { Stack, usePathname } from 'expo-router';
import React, { memo } from 'react';
import { View } from 'react-native';
import 'react-native-reanimated';
import './globals.css';

const MemoizedTabNavigation = memo(TabNavigation);

export default function RootLayoutNav() {
  const pathname = usePathname();
  
  const shouldShowTabNavigation = pathname !== '/';

  return (
    <GluestackUIProvider mode={'light'}>
      <ThemeProvider>
        <View style={{ flex: 1 }}>
          <Stack>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="home" options={{ headerShown: false }} />
            <Stack.Screen name="clock" options={{ headerShown: false }} />
            <Stack.Screen name="map" options={{ headerShown: false }} />
            <Stack.Screen name="settings" options={{ headerShown: false }} />
          </Stack>
          {shouldShowTabNavigation && <MemoizedTabNavigation />}
        </View>
      </ThemeProvider>
    </GluestackUIProvider>
  );
}
