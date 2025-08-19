import { AlarmForm } from '@/components/alarm';
import { useThemeColor } from '@/theme/useThemeColor';
import { useRouter } from 'expo-router';
import React from 'react';
import { View } from 'react-native';

export default function AddAlarm() {
    const { colors } = useThemeColor();
    const router = useRouter();

    const handleSave = () => {
        router.back();
    };

    const handleCancel = () => {
        router.back();
    };

    return (
        <View style={{ flex: 1, backgroundColor: colors.background }}>
            <AlarmForm 
                onSave={handleSave}
                onCancel={handleCancel}
            />
        </View>
    );
}
