import { AlarmForm } from '@/components/alarm';
import { useAlarms } from '@/hooks/useAlarms';
import { useThemeColor } from '@/theme/useThemeColor';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { View } from 'react-native';

export default function EditAlarm() {
    const { colors } = useThemeColor();
    const router = useRouter();
    const { alarmId } = useLocalSearchParams();
    const { alarms } = useAlarms();
    
    const alarm = alarms.find(a => a.id === alarmId);

    const handleSave = () => {
        router.back();
    };

    const handleCancel = () => {
        router.back();
    };

    if (!alarm) {
        router.back();
        return null;
    }

    return (
        <View style={{ flex: 1, backgroundColor: colors.background }}>
            <AlarmForm 
                alarm={alarm}
                onSave={handleSave}
                onCancel={handleCancel}
            />
        </View>
    );
}
