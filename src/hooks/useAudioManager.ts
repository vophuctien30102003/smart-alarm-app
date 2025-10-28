import { Sound } from "@/shared/types/sound.type";
import { getAllSounds } from "@/shared/utils/soundUtils";
import { useAudioPlayer } from "expo-audio";
import { useCallback, useMemo, useState } from "react";

export const useAudioManager = () => {
    const [currentPlayer, setCurrentPlayer] = useState<any>(null);
    const [currentSound, setCurrentSound] = useState<Sound | null>(null);
    const sounds = getAllSounds();
    
    const player1 = useAudioPlayer(sounds[0]?.uri);
    const player2 = useAudioPlayer(sounds[1]?.uri);
    const player3 = useAudioPlayer(sounds[2]?.uri);
    
    const players = useMemo(() => ({
        [sounds[0]?.id]: player1,
        [sounds[1]?.id]: player2,
        [sounds[2]?.id]: player3,
    }), [sounds, player1, player2, player3]);

    const playSound = useCallback((sound: Sound) => {
        Object.values(players).forEach(player => player?.pause());

        const player = players[sound.id];
        
        if (player) {
            player.seekTo(0);
            player.play();
            
            setCurrentPlayer(player);
            setCurrentSound(sound);
        }
    }, [players]);

    const stopPlaying = useCallback(() => {
        Object.values(players).forEach(player => player?.pause());
        setCurrentPlayer(null);
        setCurrentSound(null);
    }, [players]);

    return {
        sounds,
        playSound,
        stopPlaying,
        currentSound,
        isPlaying: !!currentPlayer,
    };
};
