import { useActiveAlarm } from '@/hooks/useAlarms';
import { useEffect } from 'react';

import AlarmSoundService from '@/services/AlarmSoundService';

export function AlarmPlayer() {
    const { activeAlarm, isPlaying } = useActiveAlarm();
    useEffect(() => {
        if (activeAlarm && isPlaying) {
            AlarmSoundService.start(activeAlarm).catch(error => {
                console.error('Failed to start alarm player:', error);
            });
        } else {
            AlarmSoundService.stop().catch(error => {
                console.error('Failed to stop alarm player:', error);
            });
        }
        return () => {
            AlarmSoundService.stop().catch(error => {
                console.error('Failed to cleanup alarm player:', error);
            });
        };
    }, [activeAlarm, isPlaying]);

    useEffect(() => {
        return () => {
            AlarmSoundService.stop().catch(error => {
                console.error('Failed to cleanup alarm player on unmount:', error);
            });
        };
    }, []);

    return null;
}
