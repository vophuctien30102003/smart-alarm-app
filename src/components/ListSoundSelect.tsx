import { Feather } from "@expo/vector-icons";
import BottomSheet, { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import type { AudioPlayer, AudioSource } from "expo-audio";
import { createAudioPlayer } from "expo-audio";
import { Back } from "iconsax-react-native";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Pressable, Text, TouchableOpacity, View } from "react-native";

import type { Sound } from "@/shared/types/sound.type";
import { getAllSounds } from "@/shared/utils/soundUtils";

type ListSoundSelectProps = {
    selectedSoundId?: string | null;
    onSelect?: (soundId: string) => void;
    title?: string;
    isVisible?: boolean;
    onClose?: () => void;
};

const SNAP_POINTS = ["75%"];
const noop = () => {};

export default function ListSoundSelect({
    selectedSoundId = null,
    onSelect = noop,
    title = "Alarm sounds",
    isVisible = false,
    onClose,
}: ListSoundSelectProps = {}) {
    const sounds = useMemo(() => getAllSounds(), []);
    const [playingSoundId, setPlayingSoundId] = useState<string | null>(null);
    const [previewedSoundId, setPreviewedSoundId] = useState<string | null>(null);
    const [sheetIndex, setSheetIndex] = useState(-1);
    const playerRef = useRef<AudioPlayer | null>(null);
    const sheetRef = useRef<BottomSheet>(null);
    const onSelectRef = useRef(onSelect);
    const onCloseRef = useRef(onClose);

    useEffect(() => {
        onSelectRef.current = onSelect;
        onCloseRef.current = onClose;
    }, [onSelect, onClose]);

    const stopPreview = useCallback(async () => {
        if (!playerRef.current) return;
        try {
            playerRef.current.pause();
            await playerRef.current.seekTo(0);
            playerRef.current.remove();
        } catch (error) {
            console.warn("Failed to stop preview", error);
        }
        playerRef.current = null;
        setPlayingSoundId(null);
    }, []);

    const playPreview = useCallback(
        async (sound: Sound) => {
            if (playingSoundId === sound.id) {
                await stopPreview();
                setPreviewedSoundId(null);
                return;
            }
            await stopPreview();
            try {
                const source: AudioSource =
                    typeof sound.uri === "number" ? sound.uri : { uri: sound.uri };
                const player = createAudioPlayer(source);
                player.loop = false;
                player.volume = 1;
                player.play();
                playerRef.current = player;
                setPlayingSoundId(sound.id);
                setPreviewedSoundId(sound.id);
            } catch (error) {
                console.warn("Failed to play preview", error);
            }
        },
        [playingSoundId, stopPreview]
    );

    const handleClose = useCallback(() => {
        void stopPreview();
        if (previewedSoundId) onSelectRef.current(previewedSoundId);
        setPreviewedSoundId(null);
        setSheetIndex(-1);
        sheetRef.current?.close();
        onCloseRef.current?.();
    }, [stopPreview, previewedSoundId]);

    const handleSheetChange = useCallback(
        (index: number) => {
            setSheetIndex(index);
            if (index === -1) handleClose();
        },
        [handleClose]
    );

    useEffect(() => {
        if (isVisible) {
            setPreviewedSoundId(null);
            setSheetIndex(0);
            const timer = setTimeout(() => sheetRef.current?.snapToIndex(0), 50);
            return () => clearTimeout(timer);
        } else {
            setSheetIndex(-1);
            sheetRef.current?.close();
            void stopPreview();
        }
    }, [isVisible, stopPreview]);

    useEffect(() => () => void stopPreview(), [stopPreview]);

    const soundItems = useMemo(
        () =>
            sounds.map((sound) => {
                const isPlaying = sound.id === playingSoundId;
                return (
                    <Pressable
                        key={sound.id}
                        onPress={() => void playPreview(sound)}
                        className="flex-row items-center px-4 py-3 border-t border-white/10"
                    >
                        <View className="flex-1">
                            <Text className="text-base font-medium text-white">
                                {sound.title}
                            </Text>
                        </View>
                        <View className="ml-3 h-9 w-9 items-center justify-center rounded-full bg-white/5">
                            <Feather
                                name={isPlaying ? "pause" : "play"}
                                size={18}
                                color={isPlaying ? "#fff" : "#0A84FF"}
                            />
                        </View>
                    </Pressable>
                );
            }),
        [sounds, playingSoundId, playPreview]
    );

    if (!isVisible && sheetIndex === -1) return null;

    return (
        <View
            style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 1000,
                pointerEvents: sheetIndex === -1 ? "none" : "auto",
            }}
        >
            <BottomSheet
                snapPoints={SNAP_POINTS}
                ref={sheetRef}
                index={sheetIndex}
                enablePanDownToClose
                onChange={handleSheetChange}
                backgroundStyle={{ backgroundColor: "#1C1C1E" }}
                handleIndicatorStyle={{ backgroundColor: "#3A3A3C" }}
            >
                <View className="flex-row items-center justify-between px-5 pb-3">
                    <TouchableOpacity onPress={handleClose}>
                        <Back size="24" color="#d9e3f0" />
                    </TouchableOpacity>
                    <Text className="text-lg font-semibold text-white">{title}</Text>
                    <View style={{ width: 24 }} />
                </View>
                <BottomSheetScrollView>
                    {soundItems}
                    <View className="h-6" />
                </BottomSheetScrollView>
            </BottomSheet>
        </View>
    );
}
