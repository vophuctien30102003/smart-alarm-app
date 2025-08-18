import { Text } from '@/components/ui/text';
import { useThemeColor } from '@/theme/useThemeColor';
import React from 'react';
import { View } from 'react-native';

export default function EditAlarm() {
    const { colors } = useThemeColor();

    return (
        <View style={{ flex: 1, backgroundColor: colors.background }}>
            <View className="flex-1 items-center justify-center">
                <Text 
                    className="text-xl"
                    style={{ color: colors.text }}
                >
                    Trang chỉnh sửa báo thức
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
