import { AlarmList, AlarmPlayer,  NextAlarm } from '@/components/alarm';
import { useActiveAlarm, useAlarmSounds, useAlarmSystem } from '@/hooks/useAlarms';
import { useThemeColor } from '@/theme/useThemeColor';
import { Alarm } from '@/types/alarm';
import { AudioManager } from '@/utils/audioManager';
import { useRouter } from 'expo-router';
import React from 'react';
import { View } from 'react-native';

export default function AlarmClockPage() {
    const { colors } = useThemeColor();
    const router = useRouter();
    const { activeAlarm, isPlaying } = useActiveAlarm();
    const { sounds } = useAlarmSounds();
    
    // Initialize alarm system
    useAlarmSystem();

    const handleEditAlarm = (alarm: Alarm) => {
        router.push({
            pathname: '/clock/edit-alarm',
            params: { alarmId: alarm.id }
        });
    };

    const handleAddAlarm = () => {
        router.push('/clock/add-alarm');
    };

    return (
        <View style={{ flex: 1, backgroundColor: colors.background }}>
            <NextAlarm />
            <AlarmList 
                onEditAlarm={handleEditAlarm}
                onAddAlarm={handleAddAlarm}
            />
            
            {/* Alarm Player Overlay */}
            {(isPlaying || activeAlarm) && <AlarmPlayer />}
        </View>
    );
}