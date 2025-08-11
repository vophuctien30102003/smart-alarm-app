import { Box } from "@/components/ui/box";
import { Button, ButtonText } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useState } from 'react';
import { ScrollView, Switch, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function AlarmClockPage() {
    const insets = useSafeAreaInsets();
    
    // Alarm List
    const [alarms, setAlarms] = useState([
        {
            id: 1,
            time: '06:30',
            label: 'Dậy sớm',
            enabled: true,
            days: ['T2', 'T3', 'T4', 'T5', 'T6'],
            sound: 'Chuông mặc định'
        },
        {
            id: 2,
            time: '22:00',
            label: 'Đi ngủ',
            enabled: false,
            days: ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'],
            sound: 'Nhạc êm dịu'
        },
        {
            id: 3,
            time: '07:45',
            label: 'Đi làm',
            enabled: true,
            days: ['T2', 'T3', 'T4', 'T5', 'T6'],
            sound: 'Chuông lớn'
        }
    ]);

    const toggleAlarm = (id: number) => {
        setAlarms(prev => prev.map(alarm => 
            alarm.id === id ? { ...alarm, enabled: !alarm.enabled } : alarm
        ));
    };

    // Bedtime Routine Data
    const bedtimeRoutine = {
        enabled: true,
        sleepTime: '23:00',
        wakeUpTime: '07:00',
        windDownDuration: 30, // minutes
        activities: ['Đọc sách', 'Thiền', 'Nhạc nhẹ']
    };

    return (
        <Box className="flex-1" style={{ backgroundColor: '#F4F7FE', paddingTop: insets.top }}>
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Header */}
                <Box className="px-6 py-6">
                    <Text className="text-2xl font-bold text-gray-800 mb-2">
                        Báo thức & Lịch trình
                    </Text>
                    <Text className="text-gray-500">
                        Quản lý báo thức và thời gian ngủ
                    </Text>
                </Box>

                {/* Add New Alarm Button */}
                <Box className="mx-6 mb-6">
                    <Button
                        size="lg"
                        className="bg-blue-500 rounded-2xl shadow-sm"
                        onPress={() => {
                            // TODO: Navigate to add alarm screen
                        }}
                    >
                        <View className="flex-row items-center py-3">
                            <FontAwesome name="plus" size={20} color="white" style={{ marginRight: 8 }} />
                            <ButtonText className="text-white font-semibold">
                                Thêm báo thức mới
                            </ButtonText>
                        </View>
                    </Button>
                </Box>

                {/* Alarm List */}
                <Box className="mx-6 mb-6">
                    <Text className="text-lg font-semibold text-gray-800 mb-4">
                        Danh sách báo thức
                    </Text>
                    
                    <View style={{ gap: 12 }}>
                        {alarms.map((alarm) => (
                            <Box key={alarm.id} className="bg-white rounded-2xl p-6 shadow-sm">
                                <View className="flex-row items-center justify-between mb-3">
                                    <View className="flex-1">
                                        <Text className="text-3xl font-bold text-gray-800">
                                            {alarm.time}
                                        </Text>
                                        <Text className="text-gray-600 font-medium">
                                            {alarm.label}
                                        </Text>
                                    </View>
                                    <Switch
                                        value={alarm.enabled}
                                        onValueChange={() => toggleAlarm(alarm.id)}
                                        trackColor={{ false: "#E5E7EB", true: "#667EEA" }}
                                        thumbColor={alarm.enabled ? "#FFFFFF" : "#9CA3AF"}
                                    />
                                </View>

                                {/* Days */}
                                <View className="flex-row mb-3" style={{ gap: 8 }}>
                                    {['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'].map((day) => (
                                        <Box
                                            key={day}
                                            className={`w-8 h-8 rounded-full items-center justify-center ${
                                                alarm.days.includes(day) 
                                                    ? 'bg-blue-500' 
                                                    : 'bg-gray-200'
                                            }`}
                                        >
                                            <Text className={`text-xs font-medium ${
                                                alarm.days.includes(day) 
                                                    ? 'text-white' 
                                                    : 'text-gray-500'
                                            }`}>
                                                {day}
                                            </Text>
                                        </Box>
                                    ))}
                                </View>

                                {/* Sound Info */}
                                <View className="flex-row items-center">
                                    <FontAwesome name="volume-up" size={14} color="#9CA3AF" style={{ marginRight: 6 }} />
                                    <Text className="text-sm text-gray-500">
                                        {alarm.sound}
                                    </Text>
                                </View>
                            </Box>
                        ))}
                    </View>
                </Box>

                {/* Bedtime Routine */}
                <Box className="mx-6 mb-8">
                    <Text className="text-lg font-semibold text-gray-800 mb-4">
                        Thói quen trước khi ngủ
                    </Text>
                    
                    <Box className="bg-white rounded-2xl p-6 shadow-sm">
                        <View className="flex-row items-center justify-between mb-4">
                            <View className="flex-row items-center">
                                <Box className="w-12 h-12 bg-purple-100 rounded-full items-center justify-center mr-3">
                                    <FontAwesome name="moon-o" size={20} color="#8B5CF6" />
                                </Box>
                                <View>
                                    <Text className="font-semibold text-gray-800">
                                        Chế độ ngủ
                                    </Text>
                                    <Text className="text-sm text-gray-500">
                                        {bedtimeRoutine.sleepTime} - {bedtimeRoutine.wakeUpTime}
                                    </Text>
                                </View>
                            </View>
                            <Switch
                                value={bedtimeRoutine.enabled}
                                trackColor={{ false: "#E5E7EB", true: "#8B5CF6" }}
                                thumbColor={bedtimeRoutine.enabled ? "#FFFFFF" : "#9CA3AF"}
                            />
                        </View>

                        <Box className="bg-purple-50 rounded-xl p-4 mb-4">
                            <View className="flex-row items-center mb-2">
                                <FontAwesome name="clock-o" size={14} color="#8B5CF6" style={{ marginRight: 6 }} />
                                <Text className="text-sm font-medium text-purple-700">
                                    Thời gian chuẩn bị: {bedtimeRoutine.windDownDuration} phút
                                </Text>
                            </View>
                            <Text className="text-xs text-purple-600">
                                Bắt đầu thư giãn từ {
                                    new Date(new Date(`1970-01-01T${bedtimeRoutine.sleepTime}:00`).getTime() - bedtimeRoutine.windDownDuration * 60000)
                                        .toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
                                }
                            </Text>
                        </Box>

                        <View style={{ gap: 8 }}>
                            <Text className="font-medium text-gray-700">
                                Hoạt động thư giãn:
                            </Text>
                            {bedtimeRoutine.activities.map((activity, index) => (
                                <View key={index} className="flex-row items-center">
                                    <Box className="w-6 h-6 bg-purple-100 rounded-full items-center justify-center mr-3">
                                        <Text className="text-xs font-medium text-purple-600">
                                            {index + 1}
                                        </Text>
                                    </Box>
                                    <Text className="text-gray-600">
                                        {activity}
                                    </Text>
                                </View>
                            ))}
                        </View>

                        <TouchableOpacity className="mt-4">
                            <View className="flex-row items-center justify-center py-3 bg-purple-50 rounded-xl">
                                <FontAwesome name="edit" size={16} color="#8B5CF6" style={{ marginRight: 6 }} />
                                <Text className="font-medium text-purple-600">
                                    Tùy chỉnh thói quen
                                </Text>
                            </View>
                        </TouchableOpacity>
                    </Box>
                </Box>

                <Box className="h-20" />
            </ScrollView>
        </Box>
    );
}
