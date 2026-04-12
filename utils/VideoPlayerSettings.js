import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'video_player_settings';

export const DEFAULT_SETTINGS = {
    autoplayNext: true,
    skipDuration: 10,          // seconds: 5 | 10 | 15 | 30
    defaultSpeed: 1.0,         // 0.5 | 0.75 | 1.0 | 1.25 | 1.5 | 2.0
    rememberPosition: true,    // resume from last position
    loopVideo: false,          // loop single video
    brightnessGesture: true,   // swipe left to control brightness
    volumeGesture: true,       // swipe right to control volume
    doubleTapSeek: true,       // double tap left/right to skip
    keepScreenOn: true,        // prevent screen sleep during playback
};

export async function getPlayerSettings() {
    try {
        const raw = await AsyncStorage.getItem(KEY);
        if (!raw) return DEFAULT_SETTINGS;
        return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
    } catch {
        return DEFAULT_SETTINGS;
    }
}

export async function savePlayerSettings(settings) {
    try {
        await AsyncStorage.setItem(KEY, JSON.stringify(settings));
    } catch { }
}

// Resume position helpers
const POSITION_PREFIX = 'vpos_';

export async function savePosition(filename, position) {
    try {
        await AsyncStorage.setItem(`${POSITION_PREFIX}${filename}`, String(position));
    } catch { }
}

export async function getSavedPosition(filename) {
    try {
        const val = await AsyncStorage.getItem(`${POSITION_PREFIX}${filename}`);
        return val ? parseFloat(val) : null;
    } catch {
        return null;
    }
}

export async function clearSavedPosition(filename) {
    try {
        await AsyncStorage.removeItem(`${POSITION_PREFIX}${filename}`);
    } catch { }
}