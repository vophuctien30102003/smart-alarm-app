import type { SleepAlarm } from "@/shared/types/alarm.type";
import { Text, View } from "react-native";
import ListAlarmClock from "./ListAlarmClock";

interface AlarmListSectionProps {
    sleepAlarms: SleepAlarm[];
    onAddNewAlarm: () => void;
    onEditAlarm: (alarm: SleepAlarm) => void;
}

export const AlarmListSection: React.FC<AlarmListSectionProps> = ({
    sleepAlarms,
    onEditAlarm,
    onAddNewAlarm
}) => {
    return (
        <>
            <View>
                <Text className="text-white text-xl font-semibold mb-4">
                    Your Sleep Schedule
                </Text>
            </View>
            <ListAlarmClock alarms={sleepAlarms} onEditAlarm={onEditAlarm} onAddNewAlarm={onAddNewAlarm} />
        </>
    );
};
