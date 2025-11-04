import { useActiveAlarm } from '@/hooks/useAlarms';
import { isLocationAlarm, isSleepAlarm, isTimeAlarm } from '@/shared/types/alarm.type';
import { useCallback, useMemo } from 'react';

const ALARM_ICONS = {
  time: '⏰',
  location: '📍',
  sleep: '😴',
  default: '⏰',
} as const;

export function useAlarmOverlay() {
  const { activeAlarm, isPlaying, stopAlarm, snoozeAlarm } = useActiveAlarm();

  const shouldShowModal = useMemo(() => Boolean(activeAlarm && isPlaying), [activeAlarm, isPlaying]);

  const alarmMetadata = useMemo(() => {
    if (!activeAlarm) {
      return { icon: ALARM_ICONS.default, label: 'Alarm', timeText: '' };
    }

    if (isTimeAlarm(activeAlarm)) {
      return {
        icon: ALARM_ICONS.time,
        label: activeAlarm.label?.trim() || 'Alarm',
        timeText: activeAlarm.time,
      };
    }

    if (isLocationAlarm(activeAlarm)) {
      const locationName = activeAlarm.targetLocation?.name ?? 'Location Alarm';
      return {
        icon: ALARM_ICONS.location,
        label: activeAlarm.label?.trim() || locationName,
        timeText: `📍 ${locationName}`,
      };
    }

    if (isSleepAlarm(activeAlarm)) {
      return {
        icon: ALARM_ICONS.sleep,
        label: activeAlarm.label?.trim() || 'Sleep Schedule',
        timeText: `Sleep: ${activeAlarm.bedtime} → ${activeAlarm.wakeUpTime}`,
      };
    }

    return { icon: ALARM_ICONS.default, label: 'Alarm', timeText: 'Alarm' };
  }, [activeAlarm]);

  const snoozeText = activeAlarm?.snoozeEnabled 
    ? `Snooze (${activeAlarm.snoozeDuration || 5} min)` 
    : '';

  const handleStop = useCallback(() => stopAlarm(), [stopAlarm]);
  const handleSnooze = useCallback(() => {
    if (activeAlarm?.snoozeEnabled) snoozeAlarm();
  }, [activeAlarm?.snoozeEnabled, snoozeAlarm]);

  return {
    alarmIcon: alarmMetadata.icon,
    alarmLabel: alarmMetadata.label,
    alarmTimeText: alarmMetadata.timeText,
    handleSnooze,
    handleStop,
    isSnoozeEnabled: Boolean(activeAlarm?.snoozeEnabled),
    shouldShowModal,
    snoozeText,
  } as const;
}
