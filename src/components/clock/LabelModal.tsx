import React from "react";
import { Modal, Pressable, TextInput, View } from "react-native";
import { Text } from "../ui/text";

interface LabelModalProps {
    visible: boolean;
    onClose: () => void;
    label: string;
    onLabelChange: (label: string) => void;
    onSave: () => void;
}

const LabelModal: React.FC<LabelModalProps> = ({
    visible,
    onClose,
    label,
    onLabelChange,
    onSave,
}) => {
    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
            onRequestClose={onClose}
        >
            <View className="flex-1 justify-center items-center bg-black bg-opacity-50">
                <View className="bg-gray-800 rounded-xl p-6 mx-6 w-80">
                    <Text className="text-xl font-bold text-white text-center mb-6">
                        Alarm Label
                    </Text>

                    <View className="mb-6">
                        <TextInput
                            className="bg-gray-700 p-4 rounded-xl border border-gray-600 text-white text-lg"
                            value={label}
                            onChangeText={onLabelChange}
                            placeholder="Enter alarm name"
                            placeholderTextColor="#9CA3AF"
                            autoFocus={true}
                        />
                    </View>

                    <View className="flex-row space-x-3">
                        <Pressable
                            onPress={onClose}
                            className="flex-1 bg-gray-600 p-3 rounded-xl"
                        >
                            <Text className="text-white text-center font-semibold">
                                Cancel
                            </Text>
                        </Pressable>

                        <Pressable
                            onPress={onSave}
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
    );
};

export default LabelModal;
