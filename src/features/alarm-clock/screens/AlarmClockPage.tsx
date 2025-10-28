import { useAlarms } from '@/hooks/useAlarms';
import { AlarmType } from '@/shared/enums';
import { isSleepAlarm } from '@/shared/types/alarm.type';
import type { SleepAlarmPayload } from '@/shared/types/alarmPayload';
import type { SleepAlarmFormData } from '@/shared/types/sleepAlarmForm.type';
import { formatAlarmLabel } from '@/shared/utils/alarmFormatters';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useMemo, useState } from 'react';
import { SafeAreaView, Text, TouchableOpacity, View } from 'react-native';
import HeaderTabs from '../components/HeaderTabClock';
import ListAlarmClock from '../components/ListAlarmClock';
import SetAlarmScreen from './SetAlarmClockScreen';

export default function AlarmClockPage() {
    const [sleepGoal, setSleepGoal] = useState(8);
    const [activeTab, setActiveTab] = useState<'alarm' | 'timer'>('alarm');
    const [showSetAlarm, setShowSetAlarm] = useState(false);
    const [editingAlarmId, setEditingAlarmId] = useState<string | null>(null);

    const { alarms, addAlarm, updateAlarm } = useAlarms();

    const sleepAlarms = useMemo(() => alarms.filter(isSleepAlarm), [alarms]);

    const handleSaveAlarm = async (alarmData: SleepAlarmFormData) => {
        const editingAlarm = editingAlarmId ? sleepAlarms.find((alarm) => alarm.id === editingAlarmId) : undefined;
        const preferredLabel = alarmData.label?.trim().length
            ? alarmData.label
            : editingAlarm?.label;
        const labelToUse = formatAlarmLabel({
            label: preferredLabel,
            type: AlarmType.SLEEP,
            repeatDays: alarmData.selectedDays,
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
    };

    const handleBackFromSetAlarm = () => {
        setShowSetAlarm(false);
        setEditingAlarmId(null);
    };

    if (showSetAlarm) {
        const editingAlarm = sleepAlarms.find((alarm) => alarm.id === editingAlarmId);
        return (
            <SafeAreaView className="flex-1">
                <SetAlarmScreen 
                    initialData={editingAlarm ? {
                        bedtime: editingAlarm.bedtime,
                        wakeTime: editingAlarm.wakeUpTime,
                        selectedDays: editingAlarm.repeatDays,
                        goalMinutes: editingAlarm.goalMinutes ?? 0,
                        label: editingAlarm.label,
                    } : undefined}
                    onSave={handleSaveAlarm}
                    onBack={handleBackFromSetAlarm}
                />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1">
            <LinearGradient
                colors={["#9887C3", "#090212"]}
                className="flex-1 pt-10"
            >
                <HeaderTabs
                    activeTab={activeTab}
                    onChangeTab={setActiveTab}
                />

                {activeTab === 'alarm' ? (
                    <View className="flex-1 px-6 pt-8">
                        <Text className="text-[#F8FAFC] text-[22px] font-bold text-center mb-2">
                            Set your sleep schedule
                        </Text>
                        <Text className="text-[#B3B3B3]  text-center mb-8 px-4">
                            Your schedule is used to send bedtime reminders and
                            suggest wake-up alerts.
                        </Text>

                        <View style={{ backgroundColor: 'rgba(20, 30, 48, 0.25)' }} className="flex-row items-center justify-between mb-8 px-4 py-3 border border-[#9887C3] rounded-2xl">
                            <View className="flex-row items-center">
                                <Text className="text-2xl mr-2">😴</Text>
                                <Text className="text-white text-lg">
                                    Sleep goal
                                </Text>
                            </View>
                            <View className="flex-row items-center">
                                <TouchableOpacity
                                    onPress={() =>
                                        setSleepGoal(Math.max(4, sleepGoal - 0.5))
                                    }
                                    className="w-8 h-8 rounded-full bg-white/20 items-center justify-center mr-3"
                                >
                                    <Ionicons name="remove" size={16} color="white" />
                                </TouchableOpacity>
                                <Text className="text-blue-300 text-lg font-medium min-w-[80px] text-center">
                                    {sleepGoal} hours
                                </Text>
                                <TouchableOpacity
                                    onPress={() =>
                                        setSleepGoal(Math.min(12, sleepGoal + 0.5))
                                    }
                                    className="w-8 h-8 rounded-full bg-white/20 items-center justify-center ml-3"
                                >
                                    <Ionicons name="add" size={16} color="white" />
                                </TouchableOpacity>
                            </View>
                        </View>

                        <Text className="text-white text-xl font-semibold mb-4">
                            Your Sleep Schedule
                        </Text>
                        <ListAlarmClock
                            alarms={sleepAlarms}
                            onAddNewAlarm={() => setShowSetAlarm(true)}
                            onEditAlarm={(alarm) => {
                                if (isSleepAlarm(alarm)) {
                                    setEditingAlarmId(alarm.id);
                                    setShowSetAlarm(true);
                                }
                            }}
                        />
                    </View>
                ) : (
                    <View className="flex-1 items-center justify-center">
                        <Text className="text-white text-lg">Timer Coming Soon...</Text>
                    </View>
                )}
            </LinearGradient>
        </SafeAreaView>
    );
}
