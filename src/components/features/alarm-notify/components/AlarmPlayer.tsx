import { useActiveAlarm } from '@/hooks/useAlarms';
import AlarmSoundService from '@/services/AlarmSoundService';
import { useEffect, useRef } from 'react';

export function AlarmPlayer() {
    const { activeAlarm, isPlaying } = useActiveAlarm();
    const lastStateRef = useRef({ alarmId: '', isPlaying: false });
    
    useEffect(() => {
        const alarmId = activeAlarm?.id ?? '';
        const shouldPlay = !!(activeAlarm && isPlaying);
        
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
    }, [activeAlarm, isPlaying]);

    useEffect(() => {
        return () => {
            void AlarmSoundService.stop();
        };
    }, []);

    return null;
}
