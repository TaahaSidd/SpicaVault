import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

/**
 * PlayerBottomBar
 * Props:
 *   isPlaying   — boolean
 *   hasPrev     — boolean
 *   hasNext     — boolean
 *   onPrev      — () => void
 *   onNext      — () => void
 *   onSkipBack  — () => void  (−10s)
 *   onSkipFwd   — () => void  (+10s)
 *   onPlayPause — () => void
 */
export default function PlayerBottomBar({
    isPlaying,
    hasPrev,
    hasNext,
    onPrev,
    onNext,
    onSkipBack,
    onSkipFwd,
    onPlayPause,
}) {
    return (
        <View style={styles.bar} pointerEvents="auto">
            <TouchableOpacity
                style={[styles.btn, !hasPrev && styles.disabled]}
                onPress={onPrev}
                disabled={!hasPrev}
            >
                <Ionicons name="play-skip-back" size={24} color="#fff" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.btn} onPress={onSkipBack}>
                <Ionicons name="play-back" size={24} color="#fff" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.playBtn} onPress={onPlayPause}>
                <Ionicons name={isPlaying ? 'pause' : 'play'} size={32} color="#fff" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.btn} onPress={onSkipFwd}>
                <Ionicons name="play-forward" size={24} color="#fff" />
            </TouchableOpacity>

            <TouchableOpacity
                style={[styles.btn, !hasNext && styles.disabled]}
                onPress={onNext}
                disabled={!hasNext}
            >
                <Ionicons name="play-skip-forward" size={24} color="#fff" />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    bar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        paddingVertical: 12,
        paddingBottom: 36,
        backgroundColor: 'rgba(0,0,0,0.55)',
    },
    btn: {
        width: 44, height: 44,
        justifyContent: 'center', alignItems: 'center',
    },
    playBtn: {
        width: 64, height: 64, borderRadius: 32,
        backgroundColor: 'rgba(255,255,255,0.12)',
        justifyContent: 'center', alignItems: 'center',
    },
    disabled: { opacity: 0.3 },
});