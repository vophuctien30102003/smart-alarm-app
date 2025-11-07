import { useActiveAlarm } from '@/hooks/useAlarms';
import AlarmSoundService from '@/services/AlarmSoundService';
import { isLocationAlarm } from '@/shared/types/alarm.type';
import { memo, useEffect, useRef } from 'react';

function AlarmPlayerComponent() {
    const { activeAlarm, isPlaying } = useActiveAlarm();
    const lastStateRef = useRef({ alarmId: '', isPlaying: false });
    
    useEffect(() => {
        const alarmId = activeAlarm?.id ?? '';
    const shouldPlay = !!(activeAlarm && isPlaying && !isLocationAlarm(activeAlarm));
        
        // Skip if no state change
        if (lastStateRef.current.alarmId === alarmId && 
            lastStateRef.current.isPlaying === shouldPlay) {
            return;
        }
        
        lastStateRef.current = { alarmId, isPlaying: shouldPlay };
        
        if (shouldPlay) {
            AlarmSoundService.start(activeAlarm).catch(console.error);
        } else {
            AlarmSoundService.stop().catch(console.error);
        }

        // Cleanup on unmount
        return () => {
            void AlarmSoundService.stop();
        };
    }, [activeAlarm, isPlaying]);

    return null;
}

export const AlarmPlayer = memo(AlarmPlayerComponent);
