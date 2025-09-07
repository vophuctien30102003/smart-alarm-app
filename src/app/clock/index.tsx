import { useEffect, useState } from "react";
import {
    Alert,
    Modal,
    Pressable,
    ScrollView,
    Switch,
    TextInput,
    View,
} from "react-native";
import ListAudio from "../../components/ListAudio";
// import LocationAlarmManager from "../../components/alarm/LocationAlarmManager";
import { Text } from "../../components/ui/text";
import { useAlarms } from "../../hooks/useAlarms";
import { WeekDay } from "../../prototype/enum";
import { Alarm } from "../../types/AlarmClock";
import { Sound } from "../../types/Sound";

export default function AlarmClockPage() {
    const { alarms, toggleAlarm, addAlarm, updateAlarm } = useAlarms();

    const [showAlarmModal, setShowAlarmModal] = useState(false);
    // const [showLocationAlarmModal, setShowLocationAlarmModal] = useState(false);
    const [showRepeatModal, setShowRepeatModal] = useState(false);
    const [showSoundModal, setShowSoundModal] = useState(false);
    const [showTimeModal, setShowTimeModal] = useState(false);
    const [showLabelModal, setShowLabelModal] = useState(false);
    const [editingAlarm, setEditingAlarm] = useState<Alarm | null>(null);

    const [hour, setHour] = useState(7);
    const [minute, setMinute] = useState(0);
    const [tempTimeInput, setTempTimeInput] = useState("07:00");
    const [tempLabel, setTempLabel] = useState("Alarm");
    const [repeatDays, setRepeatDays] = useState<WeekDay[]>([]);
    const [label, setLabel] = useState("Alarm");
    const [selectedSound, setSelectedSound] = useState<Sound | null>(null);
    const [isSnoozeEnabled, setIsSnoozeEnabled] = useState(true);
    const [deleteAfterNotification, setDeleteAfterNotification] =
        useState(false);

    useEffect(() => {
        if (editingAlarm) {
            const [h, m] = (editingAlarm.time || "07:00").split(":");
            setHour(parseInt(h));
            setMinute(parseInt(m));
            setTempTimeInput(editingAlarm.time || "07:00");
            setRepeatDays(editingAlarm.repeatDays || []);
            setLabel(editingAlarm.label || "Alarm");
            setTempLabel(editingAlarm.label || "Alarm");
            setSelectedSound(editingAlarm.sound || null);
            setIsSnoozeEnabled(editingAlarm.snoozeEnabled ?? true);
            setDeleteAfterNotification(
                editingAlarm.deleteAfterNotification ?? false
            );
        }
    }, [editingAlarm]);

    useEffect(() => {
        const timeString = `${hour.toString().padStart(2, "0")}:${minute
            .toString()
            .padStart(2, "0")}`;
        setTempTimeInput(timeString);
    }, [hour, minute]);

    useEffect(() => {
        setTempLabel(label);
    }, [label]);

    const weekDays: { day: WeekDay; label: string }[] = [
        { day: WeekDay.MONDAY, label: "Every Monday" },
        { day: WeekDay.TUESDAY, label: "Every Tuesday" },
        { day: WeekDay.WEDNESDAY, label: "Every Wednesday" },
        { day: WeekDay.THURSDAY, label: "Every Thursday" },
        { day: WeekDay.FRIDAY, label: "Every Friday" },
        { day: WeekDay.SATURDAY, label: "Every Saturday" },
        { day: WeekDay.SUNDAY, label: "Every Sunday" },
    ];

    const formatTime = (time: string) => {
        return time || "00:00";
    };

    const getWeekDaysText = (days: WeekDay[]) => {
        if (days.length === 0) return "Never";
        if (days.length === 7) return "Every Day";

        const dayNames: Record<WeekDay, string> = {
            [WeekDay.MONDAY]: "Mon",
            [WeekDay.TUESDAY]: "Tue",
            [WeekDay.WEDNESDAY]: "Wed",
            [WeekDay.THURSDAY]: "Thu",
            [WeekDay.FRIDAY]: "Fri",
            [WeekDay.SATURDAY]: "Sat",
            [WeekDay.SUNDAY]: "Sun",
        };

        return days.map((day) => dayNames[day]).join(", ");
    };

    const getRepeatText = () => {
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
    };

    const resetForm = () => {
        setHour(7);
        setMinute(0);
        setTempTimeInput("07:00");
        setRepeatDays([]);
        setLabel("Alarm");
        setTempLabel("Alarm");
        setSelectedSound(null);
        setIsSnoozeEnabled(true);
        setDeleteAfterNotification(false);
        setEditingAlarm(null);
    };

    const handleEditAlarm = (alarm: Alarm) => {
        setEditingAlarm(alarm);
        setShowAlarmModal(true);
    };

    const handleAddNewAlarm = () => {
        resetForm();
        setShowAlarmModal(true);
    };

    const handleSaveAlarm = async () => {
        {
            const time = `${hour.toString().padStart(2, "0")}:${minute
                .toString()
                .padStart(2, "0")}`;

            const alarm: Omit<Alarm, "id"> = {
                time,
                isEnabled: true,
                repeatDays,
                label,
                sound: selectedSound || undefined,
                volume: 0.8,
                snoozeEnabled: isSnoozeEnabled,
                snoozeDuration: 9,
                deleteAfterNotification,
                createdAt: editingAlarm?.createdAt || new Date(),
                updatedAt: new Date(),
                vibrate: true,
            };

            try {
                if (editingAlarm) {
                    await updateAlarm(editingAlarm.id, alarm);
                } else {
                    await addAlarm(alarm);
                }
                setShowAlarmModal(false);
                resetForm();
            } catch (error) {
                console.error("Save alarm error:", error);
                Alert.alert("Error", "Could not save alarm");
            }
        }
    };

    return (
        <View className="flex-1 bg-black">
            {/* Header */}
            <View className="flex-row justify-between items-center px-6 pt-12 pb-4">
                {/* <Pressable onPress={() => setShowLocationAlarmModal(true)}>
                    <Text className="text-orange-500 text-lg">📍 Location</Text>
                </Pressable> */}
                <Pressable onPress={handleAddNewAlarm}>
                    <Text className="text-orange-500 text-3xl font-light">
                        +
                    </Text>
                </Pressable>
            </View>

            {/* Title */}
            <View className="px-6 mb-8">
                <Text className="text-white text-4xl font-light">Alarm</Text>
            </View>

            {/* Sleep | Wake Up Section */}
            <View className="px-6 mb-6">
                <View className="flex-row items-center mb-2">
                    <Text className="text-white text-lg mr-2">🛏️</Text>
                    <Text className="text-white text-lg">Sleep | Wake Up</Text>
                </View>
            </View>

            {/* Main Content */}
            <ScrollView className="flex-1 px-6">
                {alarms.length > 0 ? (
                    <View className="space-y-1">
                        {alarms.map((alarm) => (
                            <Pressable
                                key={alarm.id}
                                onPress={() => handleEditAlarm(alarm)}
                                className="active:opacity-70"
                            >
                                <View className="py-4 border-b border-gray-800">
                                    <View className="flex-row justify-between items-center">
                                        <View className="flex-1">
                                            <Text className="text-white text-3xl font-light mb-1">
                                                {formatTime(alarm.time)}
                                            </Text>
                                            <Text className="text-gray-400 text-base">
                                                {alarm.label}
                                            </Text>
                                            <Text className="text-gray-400 text-sm">
                                                {getWeekDaysText(
                                                    alarm.repeatDays
                                                )}
                                            </Text>
                                        </View>

                                        <View className="flex-row items-center">
                                            <Switch
                                                value={alarm.isEnabled}
                                                onValueChange={() =>
                                                    toggleAlarm(alarm.id)
                                                }
                                            />
                                        </View>
                                    </View>
                                </View>
                            </Pressable>
                        ))}
                    </View>
                ) : (
                    <View className="items-center mt-20">
                        <Text className="text-gray-500 text-4xl font-light mb-2">
                            No Alarm
                        </Text>
                        <Text className="text-gray-500 text-base mb-8">
                            Tomorrow Morning
                        </Text>
                        <Pressable
                            onPress={handleAddNewAlarm}
                            className="bg-orange-600 px-6 py-3 rounded-lg"
                        >
                            <Text className="text-white font-medium">
                                CHANGE
                            </Text>
                        </Pressable>
                    </View>
                )}
            </ScrollView>

            {/* Alarm Modal */}
            <Modal
                visible={showAlarmModal}
                animationType="slide"
                presentationStyle="pageSheet"
            >
                <View className="flex-1 bg-black">
                    {/* Header */}
                    <View className="flex-row justify-between items-center px-6 pt-12 pb-4">
                        <Pressable onPress={() => setShowAlarmModal(false)}>
                            <Text className="text-orange-500 text-lg">
                                Cancel
                            </Text>
                        </Pressable>
                        <Text className="text-white text-lg font-medium">
                            {editingAlarm ? "Edit Alarm" : "Add Alarm"}
                        </Text>
                        <Pressable onPress={handleSaveAlarm}>
                            <Text className="text-orange-500 text-lg">
                                Save
                            </Text>
                        </Pressable>
                    </View>

                    <ScrollView className="flex-1">
                        {/* Time Picker */}
                        <View className="items-center py-8">
                            <Pressable
                                onPress={() => setShowTimeModal(true)}
                                className="bg-gray-800 px-8 py-4 rounded-xl"
                            >
                                <Text className="text-white text-6xl font-light">
                                    {hour.toString().padStart(2, "0")}:
                                    {minute.toString().padStart(2, "0")}
                                </Text>
                            </Pressable>
                        </View>

                        {/* Options */}
                        <View className="px-6">
                            {/* Repeat */}
                            <Pressable
                                onPress={() => setShowRepeatModal(true)}
                                className="flex-row justify-between items-center py-4 border-b border-gray-800"
                            >
                                <Text className="text-white text-lg">
                                    Repeat
                                </Text>
                                <View className="flex-row items-center">
                                    <Text className="text-gray-400 text-lg mr-2">
                                        {getRepeatText()}
                                    </Text>
                                    <Text className="text-gray-400 text-lg">
                                        ›
                                    </Text>
                                </View>
                            </Pressable>

                            {/* Label */}
                            <Pressable
                                onPress={() => setShowLabelModal(true)}
                                className="flex-row justify-between items-center py-4 border-b border-gray-800"
                            >
                                <Text className="text-white text-lg">
                                    Label
                                </Text>
                                <View className="flex-row items-center">
                                    <Text className="text-gray-400 text-lg mr-2">
                                        {label}
                                    </Text>
                                    <Text className="text-gray-400 text-lg">
                                        ›
                                    </Text>
                                </View>
                            </Pressable>

                            {/* Sound */}
                            <Pressable
                                onPress={() => setShowSoundModal(true)}
                                className="flex-row justify-between items-center py-4 border-b border-gray-800"
                            >
                                <Text className="text-white text-lg">
                                    Sound
                                </Text>
                                <View className="flex-row items-center">
                                    <Text className="text-gray-400 text-lg mr-2">
                                        {selectedSound?.title || "Radar"}
                                    </Text>
                                    <Text className="text-gray-400 text-lg">
                                        ›
                                    </Text>
                                </View>
                            </Pressable>

                            {/* Snooze */}
                            <View className="flex-row justify-between items-center py-4 border-b border-gray-800">
                                <Text className="text-white text-lg">
                                    Snooze
                                </Text>
                                <Switch
                                    value={isSnoozeEnabled}
                                    onValueChange={setIsSnoozeEnabled}
                                />
                            </View>

                            {/* Delete After Notification */}
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

            {/* Repeat Modal */}
            <Modal
                visible={showRepeatModal}
                animationType="slide"
                presentationStyle="pageSheet"
            >
                <View className="flex-1 bg-black">
                    <View className="flex-row items-center px-6 pt-12 pb-4">
                        <Pressable onPress={() => setShowRepeatModal(false)}>
                            <Text className="text-orange-500 text-lg">
                                ‹ Back
                            </Text>
                        </Pressable>
                        <Text className="text-white text-lg font-medium ml-4">
                            Repeat
                        </Text>
                    </View>

                    <ScrollView className="flex-1 px-6">
                        {weekDays.map(({ day, label: dayLabel }) => (
                            <Pressable
                                key={day}
                                onPress={() => {
                                    setRepeatDays((prev) =>
                                        prev.includes(day)
                                            ? prev.filter((d) => d !== day)
                                            : [...prev, day]
                                    );
                                }}
                                className="flex-row justify-between items-center py-4 border-b border-gray-800"
                            >
                                <Text className="text-white text-lg">
                                    {dayLabel}
                                </Text>
                                {repeatDays.includes(day) && (
                                    <Text className="text-orange-500 text-lg">
                                        ✓
                                    </Text>
                                )}
                            </Pressable>
                        ))}
                    </ScrollView>
                </View>
            </Modal>

            {/* Sound Modal */}
            <Modal
                visible={showSoundModal}
                animationType="slide"
                presentationStyle="pageSheet"
            >
                <View className="flex-1 bg-black">
                    <View className="flex-row items-center px-6 pt-12 pb-4">
                        <Pressable onPress={() => setShowSoundModal(false)}>
                            <Text className="text-orange-500 text-lg">
                                ‹ Back
                            </Text>
                        </Pressable>
                        <Text className="text-white text-lg font-medium ml-4">
                            Sound
                        </Text>
                    </View>

                    {/* Vibration Option */}
                    <View className="px-6 py-4 border-b border-gray-800">
                        <View className="flex-row justify-between items-center">
                            <Text className="text-white text-lg">
                                Vibration
                            </Text>
                            <Text className="text-gray-400 text-lg">
                                Default ›
                            </Text>
                        </View>
                    </View>

                    {/* Store Section */}
                    <View className="px-6 pt-6">
                        <Text className="text-gray-400 text-sm mb-4">
                            STORE
                        </Text>
                        <Pressable className="py-3">
                            <Text className="text-orange-500 text-lg">
                                Tone Store
                            </Text>
                        </Pressable>
                    </View>

                    {/* Ringtones */}
                    <View className="px-6 pt-6">
                        <Text className="text-gray-400 text-sm mb-4">
                            RINGTONES
                        </Text>
                        <ScrollView>
                            <ListAudio
                                onSoundSelect={(sound) => {
                                    setSelectedSound(sound);
                                    setShowSoundModal(false);
                                }}
                                selectedSoundId={selectedSound?.id}
                            />
                        </ScrollView>
                    </View>
                </View>
            </Modal>

            {/* Time Input Modal */}
            <Modal
                visible={showTimeModal}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setShowTimeModal(false)}
            >
                <View className="flex-1 justify-center items-center bg-black bg-opacity-50">
                    <View className="bg-gray-800 rounded-xl p-6 mx-6 w-80">
                        <Text className="text-xl font-bold text-white text-center mb-6">
                            Set Time
                        </Text>

                        <View className="mb-6">
                            <TextInput
                                className="bg-gray-700 p-4 rounded-xl border border-gray-600 text-white text-center text-2xl"
                                value={tempTimeInput}
                                onChangeText={setTempTimeInput}
                                placeholder="07:00"
                                placeholderTextColor="#9CA3AF"
                                keyboardType="numeric"
                                maxLength={5}
                            />
                            <Text className="text-gray-400 text-center mt-2 text-sm">
                                Format: HH:MM (24-hour)
                            </Text>
                        </View>

                        <View className="flex-row space-x-3">
                            <Pressable
                                onPress={() => setShowTimeModal(false)}
                                className="flex-1 bg-gray-600 p-3 rounded-xl"
                            >
                                <Text className="text-white text-center font-semibold">
                                    Cancel
                                </Text>
                            </Pressable>

                            <Pressable
                                onPress={() => {
                                    if (
                                        /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(
                                            tempTimeInput
                                        )
                                    ) {
                                        const [h, m] = tempTimeInput.split(":");
                                        setHour(parseInt(h));
                                        setMinute(parseInt(m));
                                        setShowTimeModal(false);
                                    } else {
                                        Alert.alert(
                                            "Invalid time",
                                            "Please enter time in HH:MM format"
                                        );
                                    }
                                }}
                                className="flex-1 bg-orange-600 p-3 rounded-xl"
                            >
                                <Text className="text-white text-center font-semibold">
                                    Set Time
                                </Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Label Input Modal */}
            <Modal
                visible={showLabelModal}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setShowLabelModal(false)}
            >
                <View className="flex-1 justify-center items-center bg-black bg-opacity-50">
                    <View className="bg-gray-800 rounded-xl p-6 mx-6 w-80">
                        <Text className="text-xl font-bold text-white text-center mb-6">
                            Alarm Label
                        </Text>

                        <View className="mb-6">
                            <TextInput
                                className="bg-gray-700 p-4 rounded-xl border border-gray-600 text-white text-lg"
                                value={tempLabel}
                                onChangeText={setTempLabel}
                                placeholder="Enter alarm name"
                                placeholderTextColor="#9CA3AF"
                                autoFocus={true}
                            />
                        </View>

                        <View className="flex-row space-x-3">
                            <Pressable
                                onPress={() => setShowLabelModal(false)}
                                className="flex-1 bg-gray-600 p-3 rounded-xl"
                            >
                                <Text className="text-white text-center font-semibold">
                                    Cancel
                                </Text>
                            </Pressable>

                            <Pressable
                                onPress={() => {
                                    if (tempLabel.trim()) {
                                        setLabel(tempLabel.trim());
                                    }
                                    setShowLabelModal(false);
                                }}
                                className="flex-1 bg-orange-600 p-3 rounded-xl"
                            >
                                <Text className="text-white text-center font-semibold">
                                    Save
                                </Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Location Alarm Manager */}
            {/* <LocationAlarmManager
                visible={showLocationAlarmModal}
                onClose={() => setShowLocationAlarmModal(false)}
                mode="manage"
            /> */}
        </View>
    );
}
