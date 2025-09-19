import { BlurView } from 'expo-blur';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { colors } from '../constants/colors';

interface TabBarBackgroundProps {
  children: React.ReactNode;
}

export default function TabBarBackground({ children }: TabBarBackgroundProps) {
  return (
    <View style={styles.container}>
      <BlurView intensity={80} style={styles.blurContainer}>
        <View style={styles.overlay} />
        {children}
      </BlurView>
    </View>
  );
}

export function useBottomTabOverflow() {
  return 16;
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    height: 80,
    borderRadius: 25,
    overflow: 'hidden',
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 25,
    elevation: 10,
  },
  blurContainer: {
    flex: 1,
    borderRadius: 25,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(30, 30, 46, 0.85)',
    borderRadius: 25,
  },
});
