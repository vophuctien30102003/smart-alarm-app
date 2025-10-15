import { Sound } from "@/shared/types";
import React from "react";
import { FlatList, Modal, Pressable, View } from "react-native";
import { ListAudio } from "../shared-ui";
import { Text } from "../ui/text";

interface SoundModalProps {
    visible: boolean;
    onClose: () => void;
    selectedSound: Sound | null;
    onSoundPreview: (sound: Sound | null) => void;
}

const SoundModal: React.FC<SoundModalProps> = ({
    visible,
    onClose,
    selectedSound,
    onSoundPreview,
}) => {
    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="pageSheet"
        >
            <View className="flex-1 bg-black">
                <View className="flex-row items-center px-6 pt-12 pb-4">
                    <Pressable onPress={onClose}>
                        <Text className="text-orange-500 text-lg">
                            ‹ Back
                        </Text>
                    </Pressable>
                    <Text className="text-white text-lg font-medium ml-4">
                        Sound
                    </Text>
                </View>

                <FlatList
                    className="flex-1"
                    data={[]}
                    renderItem={() => null}
                    ListHeaderComponent={() => (
                        <>
                            <View className="px-6 pt-6">
                                <Pressable className="py-3">
                                    <Text className="text-orange-500 text-lg">
                                        Tone Store
                                    </Text>
                                </Pressable>
                            </View>

                            <View className="px-6 pt-6">
                                <Text className="text-gray-400 text-sm mb-4">
                                    RINGTONES
                                </Text>
                                <ListAudio
                                    previewMode={true}
                                    onSoundPreview={onSoundPreview}
                                    selectedSoundId={selectedSound?.id}
                                    showPlayButton={true}
                                />
                            </View>
                        </>
                    )}
                />
            </View>
        </Modal>
    );
};

export default SoundModal;
