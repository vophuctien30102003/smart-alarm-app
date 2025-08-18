import { Text } from '@/components/ui/text';
import { useThemeColor  } from '@/theme/useThemeColor';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, Switch, TouchableOpacity, View } from 'react-native';

interface Alarm {
    id: string;
    time: string;
    label: string;
    enabled: boolean;
    days: string[];
}

export default function AlarmClockPage() {
    const { colors } = useThemeColor();
    const router = useRouter();
    const [alarms, setAlarms] = useState<Alarm[]>([
        {
            id: '1',
            time: '07:00',
            label: 'Báo thức buổi sáng',
            enabled: true,
            days: ['T2', 'T3', 'T4', 'T5', 'T6']
        },
        {
            id: '2', 
            time: '22:00',
            label: 'Nhắc nhở đi ngủ',
            enabled: false,
            days: ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7']
        }
    ]);

    const toggleAlarm = (id: string) => {
        setAlarms(prev => prev.map(alarm => 
            alarm.id === id ? { ...alarm, enabled: !alarm.enabled } : alarm
        ));
    };

    return (
        <View style={{ flex: 1, backgroundColor: colors.background }}>
            <ScrollView className="flex-1 px-6 py-4">
                {alarms.map((alarm) => (
                    <TouchableOpacity
                        key={alarm.id}
                        onPress={() => router.push('/clock/edit-alarm')}
                        className="p-4 rounded-xl mb-4"
                        style={{ backgroundColor: colors.surface }}
                        activeOpacity={0.7}
                    >
                        <View className="flex-row items-center justify-between mb-2">
                            <Text 
                                className="text-3xl font-bold"
                                style={{ color: alarm.enabled ? colors.text : colors.textSecondary }}
                            >
                                {alarm.time}
                            </Text>
                            <Switch
                                value={alarm.enabled}
                                onValueChange={() => toggleAlarm(alarm.id)}
                                trackColor={{ false: colors.border, true: colors.primary + '40' }}
                                thumbColor={alarm.enabled ? colors.primary : colors.textSecondary}
                            />
                        </View>
                        
                        <Text 
                            className="text-lg mb-2"
                            style={{ color: alarm.enabled ? colors.text : colors.textSecondary }}
                        >
                            {alarm.label}
                        </Text>
                        
                        <View className="flex-row">
                            {alarm.days.map((day, index) => (
                                <View
                                    key={index}
                                    className="w-8 h-8 rounded-full items-center justify-center mr-2"
                                    style={{ 
                                        backgroundColor: alarm.enabled 
                                            ? colors.primary + '20' 
                                            : colors.border 
                                    }}
                                >
                                    <Text 
                                        className="text-xs font-semibold"
                                        style={{ 
                                            color: alarm.enabled 
                                                ? colors.primary 
                                                : colors.textSecondary 
                                        }}
                                    >
                                        {day}
                                    </Text>
                                </View>
                            ))}
                        </View>
                    </TouchableOpacity>
                ))}

                {/* Add Alarm Button */}
                <TouchableOpacity
                    onPress={() => router.push('/clock/add-alarm')}
                    className="p-6 rounded-xl items-center justify-center border-2 border-dashed mt-4"
                    style={{ borderColor: colors.border }}
                    activeOpacity={0.7}
                >
                    <FontAwesome name="plus" size={24} color={colors.textSecondary} />
                    <Text 
                        className="text-lg mt-2"
                        style={{ color: colors.textSecondary }}
                    >
                        Thêm báo thức mới
                    </Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}