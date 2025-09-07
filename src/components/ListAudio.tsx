import { Text, TouchableOpacity, View } from "react-native";
import { useAudioManager } from "../hooks/useAudioManager";
import { Sound } from "../types/Sound";
import { Button, ButtonText } from "./ui";

interface ListAudioProps {
    onSoundSelect?: (sound: Sound) => void;
    selectedSoundId?: string;
    showPlayButton?: boolean;
}

export default function ListAudio({ 
    onSoundSelect, 
    selectedSoundId, 
    showPlayButton = true 
}: ListAudioProps) {
    const { sounds, playSound, stopPlaying, currentSound, isPlaying } = useAudioManager();

    const handleSoundPress = (sound: Sound) => {
        if (onSoundSelect) {
            onSoundSelect(sound);
        }
        if (showPlayButton) {
            if (currentSound?.id === sound.id && isPlaying) {
                stopPlaying();
            } else {
                playSound(sound);
            }
        }
    };

    return (
        <View className="flex w-full">
            {sounds.map((sound) => {
                const isSelected = selectedSoundId === sound.id;
                const isCurrentlyPlaying = currentSound?.id === sound.id && isPlaying;
                
                return (
                    <TouchableOpacity
                        key={sound.id}
                        className="py-4 border-b border-gray-800 flex-row justify-between items-center"
                        onPress={() => handleSoundPress(sound)}
                    >
                        <View className="flex-1">
                            <Text className="text-white text-lg">
                                {sound.title}
                            </Text>
                        </View>
                        
                        {showPlayButton && (
                            <Button
                                className={`px-3 py-1 rounded mr-3 ${
                                    isCurrentlyPlaying 
                                        ? 'bg-red-600' 
                                        : 'bg-gray-600'
                                }`}
                                onPress={() => handleSoundPress(sound)}
                            >
                                <ButtonText className="text-white text-sm">
                                    {isCurrentlyPlaying ? 'Stop' : 'Play'}
                                </ButtonText>
                            </Button>
                        )}
                        
                        {isSelected && (
                            <Text className="text-orange-500 text-lg">✓</Text>
                        )}
                    </TouchableOpacity>
                );
            })}
        </View>
    );
}
