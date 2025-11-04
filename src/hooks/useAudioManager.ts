import { Sound } from "@/shared/types/sound.type";
import { getAllSounds } from "@/shared/utils/soundUtils";
import { useAudioPlayer } from "expo-audio";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export const useAudioManager = () => {
    const [currentSound, setCurrentSound] = useState<Sound | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const sounds = useMemo(() => getAllSounds(), []);
    
    // Lazy load only the first three sounds
    const player1 = useAudioPlayer(sounds[0]?.uri);
    const player2 = useAudioPlayer(sounds[1]?.uri);
    const player3 = useAudioPlayer(sounds[2]?.uri);
    
    const playersRef = useRef<Record<string, any>>({});
    
    // Update players ref when they're available
    useEffect(() => {
        if (sounds[0] && player1) playersRef.current[sounds[0].id] = player1;
        if (sounds[1] && player2) playersRef.current[sounds[1].id] = player2;
        if (sounds[2] && player3) playersRef.current[sounds[2].id] = player3;
    }, [sounds, player1, player2, player3]);

    const playSound = useCallback((sound: Sound) => {
        // Stop all players
        Object.values(playersRef.current).forEach(player => player?.pause());

        const player = playersRef.current[sound.id];
        
        if (player) {
            player.seekTo(0);
            player.play();
            setCurrentSound(sound);
            setIsPlaying(true);
        }
    }, []);

    const stopPlaying = useCallback(() => {
        Object.values(playersRef.current).forEach(player => player?.pause());
        setCurrentSound(null);
        setIsPlaying(false);
    }, []);

    // Cleanup on unmount
    useEffect(() => {
        const players = playersRef.current;
        return () => {
            Object.values(players).forEach(player => player?.pause());
        };
    }, []);

    return {
        sounds,
        playSound,
        stopPlaying,
        currentSound,
        isPlaying,
    };
};
