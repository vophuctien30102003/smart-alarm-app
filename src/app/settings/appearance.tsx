import { Text } from '@/components/ui/text';
import { useTheme } from '@/theme/useThemeColor';
import React from 'react';
import { View } from 'react-native';

export default function Appearance() {
    const { colors } = useTheme();

    return (
        <View style={{ flex: 1, backgroundColor: colors.background }}>
            <View className="flex-1 items-center justify-center">
                <Text 
                    className="text-xl"
                    style={{ color: colors.text }}
                >
                    Cài đặt giao diện
                </Text>
                <Text 
                    className="text-sm mt-2"
                    style={{ color: colors.textSecondary }}
                >
                    (Chức năng sẽ được phát triển sau)
                </Text>
            </View>
        </View>
    );
}
