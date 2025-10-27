import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { Modal, View } from 'react-native';
import { useAlarmOverlay } from '../hooks/useAlarmOverlay';
import { AlarmPlayer } from './AlarmPlayer';

export function AlarmModal() {
    const {
        alarmIcon,
        alarmLabel,
        alarmTimeText,
        handleSnooze,
        handleStop,
        isSnoozeEnabled,
        shouldShowModal,
        snoozeText,
    } = useAlarmOverlay();

    if (!shouldShowModal) {
        return null;
    }

    return (
        <>
            <AlarmPlayer />
            <Modal
                visible
                animationType="slide"
                presentationStyle="pageSheet"
            >
                <View className="flex-1 bg-white justify-center items-center p-6">
                    <View className="items-center space-y-6">
                        <Text className="text-6xl">{alarmIcon}</Text>

                        <Text className="text-3xl font-bold text-center text-gray-800">
                            {alarmLabel}
                        </Text>

                        <Text className="text-xl text-gray-600 text-center">
                            {alarmTimeText}
                        </Text>

                        <View className="space-y-4 w-full max-w-sm">
                            {isSnoozeEnabled && (
                                <Button
                                    className="bg-orange-500 p-4 rounded-lg"
                                    onPress={handleSnooze}
                                >
                                    <Text className="text-white text-center font-semibold text-lg">
                                        {snoozeText}
                                    </Text>
                                </Button>
                            )}

                            <Button
                                className="bg-red-500 p-4 rounded-lg"
                                onPress={handleStop}
                            >
                                <Text className="text-white text-center font-semibold text-lg">
                                    Stop Alarm
                                </Text>
                            </Button>
                        </View>
                    </View>
                </View>
            </Modal>
        </>
    );
}
