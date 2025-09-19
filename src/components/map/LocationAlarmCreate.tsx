import { LocationType } from "@/types/Location";
import { memo, useCallback, useState } from "react";
import {
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import SearchLocation from "../searchLocations";

interface LocationAlarmCreateProps {
    selectedLocation?: LocationType;
    onSuccess: () => void;
}

const SwitchComponent = memo(
    ({
        label,
        value,
        onToggle,
    }: {
        label: string;
        value: boolean;
        onToggle: () => void;
    }) => (
        <View className="flex-row items-center justify-between">
            <Text className="text-sm font-medium text-gray-700">{label}</Text>
            <TouchableOpacity
                onPress={onToggle}
                className={`w-12 h-6 rounded-full ${
                    value ? "bg-blue-500" : "bg-gray-300"
                } flex-row items-center ${
                    value ? "justify-end" : "justify-start"
                }`}
            >
                <View className="w-5 h-5 bg-white rounded-full mx-0.5" />
            </TouchableOpacity>
        </View>
    )
);
SwitchComponent.displayName = "SwitchComponent";

export default function LocationAlarmCreate({
    selectedLocation,
    onSuccess,
}: LocationAlarmCreateProps) {
    const [label, setLabel] = useState("");
    const [radiusMeters, setRadiusMeters] = useState("100");
    const [vibrate, setVibrate] = useState(true);
    const [deleteAfterNotification, setDeleteAfterNotification] =
        useState(true);

    const handleVibrateToggle = useCallback(() => {
        setVibrate((prev) => !prev);
    }, []);

    const handleDeleteAfterNotificationToggle = useCallback(() => {
        setDeleteAfterNotification((prev) => !prev);
    }, []);

    return (
        <>
            <ScrollView className="flex-1 p-4">
                <View className="mb-6">
                    <Text className="text-sm font-medium text-gray-700 mb-2">
                        Alarm Label
                    </Text>
                    <TextInput
                        value={label}
                        onChangeText={setLabel}
                        placeholder="Enter alarm name"
                        className="border border-gray-300 rounded-lg px-3 py-3 text-base"
                    />
                </View>

                <View className="mb-6">
                    <Text className="text-sm font-medium text-gray-700 mb-2">
                        Detection Radius (meters)
                    </Text>
                    <TextInput
                        value={radiusMeters}
                        onChangeText={setRadiusMeters}
                        placeholder="100"
                        keyboardType="numeric"
                        className="border border-gray-300 rounded-lg px-3 py-3 text-base"
                    />
                    <Text className="text-xs text-gray-500 mt-1">
                        Recommended: 50-200 meters for accuracy
                    </Text>
                </View>

                <View className="space-y-4">
                    <SwitchComponent
                        label="Vibrate"
                        value={vibrate}
                        onToggle={handleVibrateToggle}
                    />

                    <SwitchComponent
                        label="Delete After Notification"
                        value={deleteAfterNotification}
                        onToggle={handleDeleteAfterNotificationToggle}
                    />
                </View>

                <View className="mt-8 pb-4"></View>
            </ScrollView>

            <SearchLocation/>
        </>
    );
}
