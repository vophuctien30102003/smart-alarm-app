import { Switch } from "@/components";
import ListSoundSelect from "@/components/ListSoundSelect";
import { Text } from "@/components/ui/text";
import { getDefaultSound, getSoundById } from "@/shared/utils/soundUtils";
import { Alarm, ArrowDown2, Clock, Spotify } from "iconsax-react-native";
import { useCallback, useMemo, useState } from "react";
import { TextInput, TouchableOpacity, View } from "react-native";


export const CustomAlarmClock = () => {
    const [showDetails, setShowDetails] = useState(true);
    const [selectedSoundId, setSelectedSoundId] = useState<string>(
        () => getDefaultSound().id
    );
    const [showSoundSheet, setShowSoundSheet] = useState(false);

    const selectedSound = useMemo(
        () => getSoundById(selectedSoundId),
        [selectedSoundId]
    );

    const toggleDetails = useCallback(
        () => setShowDetails((prev) => !prev),
        []
    );

    const handleSoundSelect = useCallback((soundId: string) => {
        setSelectedSoundId(soundId);
    }, []);

    const openSoundSheet = useCallback(() => setShowSoundSheet(true), []);
    const closeSoundSheet = useCallback(() => setShowSoundSheet(false), []);

    return (
        <>
            <View className="mt-8">
                <View className="flex-row justify-between items-center py-3">
                    <Text className="text-[#F8FAFC] text-[17px] font-semibold">
                        Custom alarm
                    </Text>
                    <TouchableOpacity
                        className="bg-[#9887C340] rounded-full p-2"
                        onPress={toggleDetails}
                        accessibilityRole="button"
                        accessibilityLabel="Toggle custom alarm settings"
                    >
                        <ArrowDown2
                            size="24"
                            color="#d9e3f0"
                            style={{
                                transform: [
                                    { rotate: showDetails ? "180deg" : "0deg" },
                                ],
                            }}
                        />
                    </TouchableOpacity>
                </View>

                {showDetails && (
                    <View className="space-y-4 flex-col gap-4 mb-4">
                        <View className="border border-white/10 rounded-2xl py-3 px-4 bg-white/5 flex-row justify-between items-center">
                            <View className="flex-row items-center gap-2">
                                <Alarm size="24" color="#d9e3f0" />
                                <Text className="text-[#F8FAFC] text-[16px]">
                                    Label
                                </Text>
                            </View>
                            <TextInput
                                className="text-[#F8FAFC] text-[16px] text-center"
                                placeholder="Alarm"
                                placeholderTextColor="#B3B3B3"
                            />
                        </View>

                        <View className="border border-white/10 rounded-2xl py-3 px-4 bg-white/5 flex-row justify-between items-center">
                            <View className="flex-row items-center gap-2">
                                <Clock
                                    size={24}
                                    color="#F8FAFC"
                                    className="p-4"
                                />
                                <Text className="text-[#F8FAFC] text-[16px]">
                                    Snooze
                                </Text>
                            </View>
                            <Switch />
                        </View>
                        <View className="border border-white/10 rounded-2xl py-3 px-4 bg-white/5 flex-row justify-between items-center">
                            <View className="flex-row items-center gap-2">
                                <Spotify
                                    size={24}
                                    color="#F8FAFC"
                                    className="p-4"
                                />
                                <Text className="text-[#F8FAFC] text-[16px]">
                                    Alarm sound
                                </Text>
                            </View>
                            <TouchableOpacity
                                onPress={openSoundSheet}
                                accessibilityRole="button"
                                accessibilityLabel="Choose alarm sound"
                            >
                                <Text className="text-[#B3B3B3] text-[16px]">
                                    {selectedSound?.title ?? "sound"} {" >"}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            </View>
            <ListSoundSelect
                selectedSoundId={selectedSoundId}
                onSelect={handleSoundSelect}
                isVisible={showSoundSheet}
                onClose={closeSoundSheet}
            />
        </>
    );
};
