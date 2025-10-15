import { Sound } from '@/shared/types';

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

export const getAllSounds = (): Sound[] => {
    return Object.keys(soundAssets).map((filename, index) => ({
        id: `sound_${index}`,
        title: createDisplayName(filename),
        uri: soundAssets[filename as keyof typeof soundAssets],
        filename,
    }));
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

