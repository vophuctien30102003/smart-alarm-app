import { useAlarms } from '@/hooks/useAlarms';
import { AlarmType } from '@/shared/enums';
import { isSleepAlarm, type SleepAlarm } from '@/shared/types/alarm.type';
import type { SleepAlarmPayload } from '@/shared/types/alarmPayload';
import type { SleepAlarmFormData } from '@/shared/types/sleepAlarmForm.type';
import { formatAlarmLabel } from '@/shared/utils/alarmUtils';
import { useCallback, useMemo, useState } from 'react';

export const useSleepAlarmManagement = () => {
  const [showSetAlarm, setShowSetAlarm] = useState(false);
  const [editingAlarmId, setEditingAlarmId] = useState<string | null>(null);

  const { alarms, addAlarm, updateAlarm } = useAlarms();

  const sleepAlarms = useMemo(() => alarms.filter(isSleepAlarm), [alarms]);

  const handleSaveAlarm = useCallback(async (alarmData: SleepAlarmFormData) => {
    const labelToUse = formatAlarmLabel({ 
      label: alarmData.label, 
      type: AlarmType.SLEEP,
      repeatDays: alarmData.selectedDays 
    });

    try {
      if (editingAlarmId) {
        const updates: Partial<SleepAlarmPayload> = {
          type: AlarmType.SLEEP,
          label: labelToUse,
          bedtime: alarmData.bedtime,
          wakeUpTime: alarmData.wakeTime,
          repeatDays: alarmData.selectedDays,
          goalMinutes: alarmData.goalMinutes,
          isEnabled: true,
        };
        await updateAlarm(editingAlarmId, updates);
      } else {
        const payload: SleepAlarmPayload = {
          type: AlarmType.SLEEP,
          label: labelToUse,
          bedtime: alarmData.bedtime,
          wakeUpTime: alarmData.wakeTime,
          repeatDays: alarmData.selectedDays,
          goalMinutes: alarmData.goalMinutes,
          isEnabled: true,
          vibrate: true,
          snoozeEnabled: false,
          snoozeDuration: 5,
          maxSnoozeCount: 0,
        };
        await addAlarm(payload);
      }
    } catch (error) {
      console.error('Failed to save sleep alarm', error);
    } finally {
      setEditingAlarmId(null);
      setShowSetAlarm(false);
    }
  }, [editingAlarmId, updateAlarm, addAlarm]);

  const handleBackFromSetAlarm = useCallback(() => {
    setShowSetAlarm(false);
    setEditingAlarmId(null);
  }, []);

  const startAddAlarm = useCallback(() => setShowSetAlarm(true), []);

  const startEditAlarm = useCallback((alarm: SleepAlarm) => {
    setEditingAlarmId(alarm.id);
    setShowSetAlarm(true);
  }, []);

  const getEditingAlarmData = useCallback(() => {
    if (!editingAlarmId) return undefined;
    const editingAlarm = sleepAlarms.find((alarm) => alarm.id === editingAlarmId);
    return editingAlarm ? {
      bedtime: editingAlarm.bedtime,
      wakeTime: editingAlarm.wakeUpTime,
      selectedDays: editingAlarm.repeatDays,
      goalMinutes: editingAlarm.goalMinutes ?? 0,
      label: editingAlarm.label,
    } : undefined;
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