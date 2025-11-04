import { useActiveAlarm } from '@/hooks/useAlarms';
import { isLocationAlarm, isSleepAlarm, isTimeAlarm } from '@/shared/types/alarm.type';
import { useCallback, useMemo } from 'react';

export function useAlarmOverlay() {
    const { activeAlarm, isPlaying, stopAlarm, snoozeAlarm } = useActiveAlarm();

    const shouldShowModal = useMemo(() => Boolean(activeAlarm && isPlaying), [activeAlarm, isPlaying]);

    const alarmIcon = useMemo(() => {
        if (!activeAlarm) {
            return '⏰';
        }

        if (isTimeAlarm(activeAlarm)) {
            return '⏰';
        }

        if (isLocationAlarm(activeAlarm)) {
            return '📍';
        }

        if (isSleepAlarm(activeAlarm)) {
            return '😴';
        }

        return '⏰';
    }, [activeAlarm]);

    const fallbackLabel = useMemo(() => {
        if (!activeAlarm) {
            return 'Alarm';
        }

        if (isLocationAlarm(activeAlarm)) {
            return activeAlarm.targetLocation?.name ?? 'Location Alarm';
        }

        if (isSleepAlarm(activeAlarm)) {
            return 'Sleep Schedule';
        }

        return 'Alarm';
    }, [activeAlarm]);

    const alarmLabel = useMemo(() => {
        const customLabel = activeAlarm?.label?.trim();
        return customLabel && customLabel.length > 0 ? customLabel : fallbackLabel;
    }, [activeAlarm?.label, fallbackLabel]);

    const alarmTimeText = useMemo(() => {
        if (!activeAlarm) {
            return '';
        }

        if (isTimeAlarm(activeAlarm)) {
            return activeAlarm.time;
        }

        if (isLocationAlarm(activeAlarm)) {
            return `📍 ${activeAlarm.targetLocation?.name ?? 'Location Alarm'}`;
        }

        if (isSleepAlarm(activeAlarm)) {
            return `Sleep: ${activeAlarm.bedtime} → ${activeAlarm.wakeUpTime}`;
        }

        return 'Alarm';
    }, [activeAlarm]);

    const snoozeText = useMemo(() => {
        if (!activeAlarm?.snoozeEnabled) {
            return '';
        }
        return `Snooze (${activeAlarm.snoozeDuration || 5} min)`;
    }, [activeAlarm?.snoozeEnabled, activeAlarm?.snoozeDuration]);

    const handleStop = useCallback(async () => {
        await stopAlarm();
    }, [stopAlarm]);

    const handleSnooze = useCallback(() => {
        if (activeAlarm?.snoozeEnabled) snoozeAlarm();
    }, [activeAlarm?.snoozeEnabled, snoozeAlarm]);

    const isSnoozeEnabled = Boolean(activeAlarm?.snoozeEnabled);

    return {
        alarmIcon,
        alarmLabel,
        alarmTimeText,
        handleSnooze,
        handleStop,
        isSnoozeEnabled,
        shouldShowModal,
        snoozeText,
    } as const;
}
