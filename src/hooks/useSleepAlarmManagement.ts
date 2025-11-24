import { useAlarms } from '@/hooks/useAlarms';
import { AlarmType } from '@/shared/enums';
import { isSleepAlarm, type SleepAlarm } from '@/shared/types/alarm.type';
import type { SleepAlarmPayload } from '@/shared/types/alarmPayload';
import type { SleepAlarmFormData } from '@/shared/types/sleepAlarmForm.type';
import { convertSoundIdToAlarmSound, formatAlarmLabel } from '@/shared/utils/alarmUtils';
import { getDefaultSound } from '@/shared/utils/soundUtils';
import { useCallback, useMemo, useState } from 'react';

export const useSleepAlarmManagement = () => {
  const [showSetAlarm, setShowSetAlarm] = useState(false);
  const [editingAlarmId, setEditingAlarmId] = useState<string | null>(null);
  const { alarms, addAlarm, updateAlarm } = useAlarms();

  const sleepAlarms = useMemo(() => alarms.filter(isSleepAlarm), [alarms]);

  const handleSaveAlarm = useCallback(async (alarmData: SleepAlarmFormData) => {
    const payload: SleepAlarmPayload = {
      type: AlarmType.SLEEP,
      label: formatAlarmLabel({ label: alarmData.label, type: AlarmType.SLEEP, repeatDays: alarmData.selectedDays }),
      bedtime: alarmData.bedtime,
      wakeUpTime: alarmData.wakeTime,
      repeatDays: alarmData.selectedDays,
      goalMinutes: alarmData.goalMinutes,
      isEnabled: true,
      snoozeEnabled: alarmData.snoozeEnabled,
      sound: convertSoundIdToAlarmSound(alarmData.soundId),
      volume: 1,
      vibrate: true,
      snoozeDuration: 5,
      maxSnoozeCount: 0,
    };

    try {
      if (editingAlarmId) {
        await updateAlarm(editingAlarmId, payload);
      } else {
        await addAlarm(payload);
      }
      setEditingAlarmId(null);
      setShowSetAlarm(false);
    } catch (error) {
      console.error('Failed to save sleep alarm', error);
    }
  }, [editingAlarmId, updateAlarm, addAlarm]);

  const handleBackFromSetAlarm = useCallback(() => {
    setShowSetAlarm(false);
    setEditingAlarmId(null);
  }, []);

  const startAddAlarm = useCallback(() => {
    setEditingAlarmId(null);
    setShowSetAlarm(true);
  }, []);

  const startEditAlarm = useCallback((alarm: SleepAlarm) => {
    setEditingAlarmId(alarm.id);
    setShowSetAlarm(true);
  }, []);

  const getEditingAlarmData = useCallback((): Partial<SleepAlarmFormData> | undefined => {
    if (!editingAlarmId) return undefined;
    const alarm = sleepAlarms.find(a => a.id === editingAlarmId);
    if (!alarm) return undefined;
    return {
      bedtime: alarm.bedtime,
      wakeTime: alarm.wakeUpTime,
      selectedDays: alarm.repeatDays,
      goalMinutes: alarm.goalMinutes ?? 0,
      label: alarm.label,
      snoozeEnabled: alarm.snoozeEnabled,
      soundId: alarm.sound?.id ?? getDefaultSound().id,
    };
  }, [editingAlarmId, sleepAlarms]);

  return {
    sleepAlarms,
    showSetAlarm,
    editingAlarmId,
    handleSaveAlarm,
    handleBackFromSetAlarm,
    startAddAlarm,
    startEditAlarm,
    getEditingAlarmData,
  };
};