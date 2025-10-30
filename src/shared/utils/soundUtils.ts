import { Sound } from '@/shared/types/sound.type';

const soundAssets = {
    'funny.mp3': require('../../assets/sound/funny.mp3'),
    'ghost-music.mp3': require('../../assets/sound/ghost-music.mp3'),
    'ringtone.mp3': require('../../assets/sound/ringtone.mp3'),
};

const createDisplayName = (filename: string): string => {
    return filename
        .replace('.mp3', '')
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
};

// Cache for sounds array to avoid recreating on each call
let soundsCache: Sound[] | null = null;

export const getAllSounds = (): Sound[] => {
    if (soundsCache) {
        return soundsCache;
    }

    soundsCache = Object.keys(soundAssets).map((filename, index) => ({
        id: `sound_${index}`,
        title: createDisplayName(filename),
        uri: soundAssets[filename as keyof typeof soundAssets],
        filename,
    }));

    return soundsCache;
};

export const getDefaultSound = (): Sound => {
    const sounds = getAllSounds();
    return sounds[0] || {
        id: 'default',
        title: 'Default',
        uri: soundAssets['ringtone.mp3'],
        filename: 'ringtone.mp3'
    };
};

export const getSoundById = (id: string): Sound | null => {
    const sounds = getAllSounds();
    return sounds.find(sound => sound.id === id) || null;
};

export const getSoundByFilename = (filename: string): Sound | null => {
    const sounds = getAllSounds();
    return sounds.find(sound => sound.filename === filename) || null;
};

export const getSoundByTitle = (title: string): Sound | null => {
    const normalized = title.trim().toLowerCase();
    const sounds = getAllSounds();
    return (
        sounds.find(sound => sound.title.toLowerCase() === normalized) || null
    );
};

export const resolveSound = (identifier?: string | null): Sound => {
    if (!identifier) {
        return getDefaultSound();
    }

    return (
        getSoundById(identifier) ||
        getSoundByFilename(identifier) ||
        getSoundByTitle(identifier) ||
        getDefaultSound()
    );
};

export const resolveSoundId = (identifier?: string | null): string => {
    return resolveSound(identifier).id;
};

