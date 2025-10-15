import { Sound } from "@/shared/types";
import { useCallback, useEffect, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { useAudioManager } from "../../hooks/useAudioManager";
import { Button, ButtonText } from "../ui";

interface ListAudioProps {
    onSoundSelect?: (sound: Sound) => void;
    selectedSoundId?: string;
    showPlayButton?: boolean;
    previewMode?: boolean;
    onSoundPreview?: (sound: Sound | null) => void; 
}

export default function ListAudio({ 
    onSoundSelect, 
    selectedSoundId, 
    showPlayButton = true,
    previewMode = false,
    onSoundPreview
}: ListAudioProps) {
    const { sounds, playSound, stopPlaying, currentSound, isPlaying } = useAudioManager();
    const [previewingSound, setPreviewingSound] = useState<Sound | null>(null);

    useEffect(() => {
        if (previewMode && onSoundPreview) {
            onSoundPreview(previewingSound);
        }
    }, [previewingSound, previewMode, onSoundPreview]);

    const handleSoundPress = useCallback((sound: Sound) => {
        if (previewMode) {
            if (currentSound?.id === sound.id && isPlaying) {
                stopPlaying();
                setPreviewingSound(null);
            } else {
                playSound(sound);
                setPreviewingSound(sound);
            }
        } else {
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
        }
    }, [previewMode, currentSound, isPlaying, stopPlaying, playSound, onSoundSelect, showPlayButton]);

    return (
        <View className="flex w-full">
            {sounds.map((sound) => {
                const isSelected = selectedSoundId === sound.id;
                const isCurrentlyPlaying = currentSound?.id === sound.id && isPlaying;
                const isPreviewing = previewMode && previewingSound?.id === sound.id;
                
                return (
                    <TouchableOpacity
                        key={sound.id}
                        className="py-4 border-b border-gray-800 flex-row justify-between items-center"
                        onPress={() => handleSoundPress(sound)}
                    >
                        <View className="flex-1">
                            <Text className={`text-lg ${
                                isPreviewing ? 'text-orange-500' : 'text-white'
                            }`}>
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
                        
                        {(isSelected || (!previewMode && isSelected)) && (
                            <Text className="text-orange-500 text-lg">✓</Text>
                        )}
                    </TouchableOpacity>
                );
            })}
        </View>
    );
}
