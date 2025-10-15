import { AlarmType, WeekDay } from "@/shared";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
    Alert,
    Modal,
    Pressable,
    ScrollView,
    Switch,
    View,
} from "react-native";
import { useAlarms } from "../../hooks/useAlarms";
import { getDefaultAlarmSound } from "../../shared/constants";
import { Alarm, AlarmSound, isTimeAlarm, Sound, TimeAlarm } from "../../shared/types";
import { Text } from "../ui/text";
import LabelModal from "./LabelModal";
import RepeatModal from "./RepeatModal";
import CustomTimePicker from "./SetTimeClock";
import SoundModal from "./SoundModal";

type AlarmFormModalProps = {
    visible: boolean;
    onClose: () => void;
    editingAlarm?: Alarm | null;
};

export default function FormAlarmClock({
    visible,
    onClose,
    editingAlarm,
}: AlarmFormModalProps) {
    const { addAlarm, updateAlarm } = useAlarms();
    
    const [hour, setHour] = useState(7);
    const [minute, setMinute] = useState(0);
    const [repeatDays, setRepeatDays] = useState<WeekDay[]>([]);
    const [label, setLabel] = useState("Alarm");
    const [tempLabel, setTempLabel] = useState("Alarm");
    const [selectedSound, setSelectedSound] = useState<Sound | null>(null);
    const [previewSound, setPreviewSound] = useState<Sound | null>(null);
    const [isSnoozeEnabled, setIsSnoozeEnabled] = useState(true);
    const [deleteAfterNotification, setDeleteAfterNotification] = useState(false);

    const [showRepeatModal, setShowRepeatModal] = useState(false);
    const [showSoundModal, setShowSoundModal] = useState(false);
    const [showLabelModal, setShowLabelModal] = useState(false);

    const resetForm = useCallback(() => {
        setHour(7);
        setMinute(0);
        setRepeatDays([]);
        setLabel("Alarm");
        setTempLabel("Alarm");
        setSelectedSound(null);
        setPreviewSound(null);
        setIsSnoozeEnabled(true);
        setDeleteAfterNotification(false);
    }, []);

    const initializeForm = useCallback(() => {
        if (editingAlarm && isTimeAlarm(editingAlarm)) {
            const [hours, minutes] = editingAlarm.time?.split(':').map(Number) || [7, 0];
            setHour(hours);
            setMinute(minutes);
            setRepeatDays(editingAlarm.repeatDays || []);
            setLabel(editingAlarm.label || "Alarm");
            setTempLabel(editingAlarm.label || "Alarm");
            // Convert AlarmSound to Sound format
            if (editingAlarm.sound) {
                const soundForState: Sound = {
                    id: editingAlarm.sound.id,
                    title: editingAlarm.sound.name,
                    name: editingAlarm.sound.name,
                    uri: editingAlarm.sound.uri,
                    isDefault: editingAlarm.sound.isDefault
                };
                setSelectedSound(soundForState);
            } else {
                setSelectedSound(null);
            }
            setIsSnoozeEnabled(editingAlarm.snoozeEnabled ?? true);
            setDeleteAfterNotification(editingAlarm.deleteAfterNotification ?? false);
        } else {
            resetForm();
        }
        setPreviewSound(null);
    }, [editingAlarm, resetForm]);

    useEffect(() => {
        if (visible) {
            initializeForm();
        }
    }, [visible, initializeForm]);

    const handleCloseSoundModal = useCallback(() => {
        if (previewSound) {
            setSelectedSound(previewSound);
        }
        setShowSoundModal(false);
        setPreviewSound(null);
    }, [previewSound]);

    const handleSaveAlarm = useCallback(async () => {
        const time = `${hour.toString().padStart(2, "0")}:${minute
            .toString()
            .padStart(2, "0")}`;

        // Convert Sound to AlarmSound if selected, otherwise use default
        const alarmSound: AlarmSound = selectedSound ? {
            id: selectedSound.id,
            name: selectedSound.name || selectedSound.title,
            uri: selectedSound.uri,
            isDefault: selectedSound.isDefault
        } : getDefaultAlarmSound();

        const alarmData: Omit<TimeAlarm, "id"> = {
            type: AlarmType.TIME,
            time,
            isEnabled: true,
            repeatDays,
            label,
            sound: alarmSound,
            volume: 0.8,
            snoozeEnabled: isSnoozeEnabled,
            snoozeDuration: 9,
            maxSnoozeCount: 3,
            deleteAfterNotification,
            createdAt: editingAlarm?.createdAt || new Date(),
            updatedAt: new Date(),
            vibrate: true,
        };

        try {
            if (editingAlarm) {
                await updateAlarm(editingAlarm.id, alarmData);
            } else {
                await addAlarm(alarmData);
            }
            onClose();
            resetForm();
        } catch (error) {
            console.error("Save alarm error:", error);
            Alert.alert("Error", "Could not save alarm");
        }
    }, [
        hour, 
        minute, 
        repeatDays, 
        label, 
        selectedSound, 
        isSnoozeEnabled, 
        deleteAfterNotification, 
        editingAlarm, 
        updateAlarm, 
        addAlarm, 
        onClose, 
        resetForm
    ]);

    const getRepeatText = useMemo(() => {
        if (repeatDays.length === 0) return "Never";
        if (repeatDays.length === 7) return "Every Day";
        if (
            repeatDays.length === 5 &&
            !repeatDays.includes(WeekDay.SATURDAY) &&
            !repeatDays.includes(WeekDay.SUNDAY)
        ) {
            return "Weekdays";
        }
        if (
            repeatDays.length === 2 &&
            repeatDays.includes(WeekDay.SATURDAY) &&
            repeatDays.includes(WeekDay.SUNDAY)
        ) {
            return "Weekends";
        }

        const shortNames = {
            [WeekDay.MONDAY]: "Mon",
            [WeekDay.TUESDAY]: "Tue",
            [WeekDay.WEDNESDAY]: "Wed",
            [WeekDay.THURSDAY]: "Thu",
            [WeekDay.FRIDAY]: "Fri",
            [WeekDay.SATURDAY]: "Sat",
            [WeekDay.SUNDAY]: "Sun",
        };

        return repeatDays.map((day) => shortNames[day]).join(" ");
    }, [repeatDays]);

    const handleTimeChange = useCallback((newHour: number, newMinute: number) => {
        setHour(newHour);
        setMinute(newMinute);
    }, []);

    const handleRepeatDayToggle = useCallback((day: WeekDay) => {
        setRepeatDays(prev => 
            prev.includes(day) 
                ? prev.filter(d => d !== day)
                : [...prev, day]
        );
    }, []);

    const handleLabelSave = useCallback(() => {
        if (tempLabel.trim()) {
            setLabel(tempLabel.trim());
        }
        setShowLabelModal(false);
    }, [tempLabel]);

    const handleSoundModalOpen = useCallback(() => {
        setPreviewSound(selectedSound);
        setShowSoundModal(true);
    }, [selectedSound]);

    return (
        <>
            <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
                <View className="flex-1 bg-black">
                    <View className="flex-row justify-between items-center px-6 pt-12 pb-4">
                        <Pressable onPress={onClose}>
                            <Text className="text-orange-500 text-lg">Cancel</Text>
                        </Pressable>
                        <Text className="text-white text-lg font-medium">
                            {editingAlarm ? "Edit Alarm" : "Add Alarm"}
                        </Text>
                        <Pressable onPress={handleSaveAlarm}>
                            <Text className="text-orange-500 text-lg">Save</Text>
                        </Pressable>
                    </View>

                    <ScrollView className="flex-1">                        
                        <View className="items-center mb-6">
                            <CustomTimePicker
                                initialHour={hour}
                                initialMinute={minute}
                                onTimeChange={handleTimeChange}
                            />
                        </View>
                        <View className="px-6">
                            <Pressable
                                onPress={() => setShowRepeatModal(true)}
                                className="flex-row justify-between items-center py-4 border-b border-gray-800"
                            >
                                <Text className="text-white text-lg">Repeat</Text>
                                <View className="flex-row items-center">
                                    <Text className="text-gray-400 text-lg mr-2">
                                        {getRepeatText}
                                    </Text>
                                    <Text className="text-gray-400 text-lg">›</Text>
                                </View>
                            </Pressable>

                            <Pressable
                                onPress={() => setShowLabelModal(true)}
                                className="flex-row justify-between items-center py-4 border-b border-gray-800"
                            >
                                <Text className="text-white text-lg">Label</Text>
                                <View className="flex-row items-center">
                                    <Text className="text-gray-400 text-lg mr-2">
                                        {label}
                                    </Text>
                                    <Text className="text-gray-400 text-lg">›</Text>
                                </View>
                            </Pressable>

                            <Pressable
                                onPress={handleSoundModalOpen}
                                className="flex-row justify-between items-center py-4 border-b border-gray-800"
                            >
                                <Text className="text-white text-lg">Sound</Text>
                                <View className="flex-row items-center">
                                    <Text className="text-gray-400 text-lg mr-2">
                                        {selectedSound?.title || "Radar"}
                                    </Text>
                                    <Text className="text-gray-400 text-lg">›</Text>
                                </View>
                            </Pressable>

                            <View className="flex-row justify-between items-center py-4 border-b border-gray-800">
                                <Text className="text-white text-lg">Snooze</Text>
                                <Switch
                                    value={isSnoozeEnabled}
                                    onValueChange={setIsSnoozeEnabled}
                                />
                            </View>

                            <View className="flex-row justify-between items-center py-4">
                                <View className="flex-1">
                                    <Text className="text-white text-lg">
                                        Delete After Alert
                                    </Text>
                                    <Text className="text-gray-400 text-sm mt-1">
                                        Auto delete alarm after notification
                                    </Text>
                                </View>
                                <Switch
                                    value={deleteAfterNotification}
                                    onValueChange={setDeleteAfterNotification}
                                />
                            </View>
                        </View>
                    </ScrollView>
                </View>
            </Modal>

            <RepeatModal
                visible={showRepeatModal}
                onClose={() => setShowRepeatModal(false)}
                repeatDays={repeatDays}
                onToggleDay={handleRepeatDayToggle}
            />

            <SoundModal
                visible={showSoundModal}
                onClose={handleCloseSoundModal}
                selectedSound={selectedSound}
                onSoundPreview={setPreviewSound}
            />

            <LabelModal
                visible={showLabelModal}
                onClose={() => setShowLabelModal(false)}
                label={tempLabel}
                onLabelChange={setTempLabel}
                onSave={handleLabelSave}
            />
        </>
    );
}
