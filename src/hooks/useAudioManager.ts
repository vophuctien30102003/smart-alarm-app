import { Sound } from "@/shared/types/sound.type";
import { getAllSounds } from "@/shared/utils/soundUtils";
import { useAudioPlayer } from "expo-audio";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export const useAudioManager = () => {
    const [currentSound, setCurrentSound] = useState<Sound | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const sounds = useMemo(() => getAllSounds(), []);
    
    const player1 = useAudioPlayer(sounds[0]?.uri);
    const player2 = useAudioPlayer(sounds[1]?.uri);
    const player3 = useAudioPlayer(sounds[2]?.uri);
    
    const playersRef = useRef<Record<string, any>>({
        [sounds[0]?.id]: player1,
        [sounds[1]?.id]: player2,
        [sounds[2]?.id]: player3,
    });

    const stopAllPlayers = useCallback(() => {
        Object.values(playersRef.current).forEach(player => player?.pause());
    }, []);

    const playSound = useCallback((sound: Sound) => {
        stopAllPlayers();
        const player = playersRef.current[sound.id];
        
        if (player) {
            player.seekTo(0);
            player.play();
            setCurrentSound(sound);
            setIsPlaying(true);
        }
    }, [stopAllPlayers]);

    const stopPlaying = useCallback(() => {
        stopAllPlayers();
        setCurrentSound(null);
        setIsPlaying(false);
    }, [stopAllPlayers]);

    useEffect(() => {
        return () => stopAllPlayers();
    }, [stopAllPlayers]);

    return { sounds, playSound, stopPlaying, currentSound, isPlaying };
};
