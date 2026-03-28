import Slider from '@react-native-community/slider';
import { StyleSheet, Text, View } from 'react-native';
import { Brand, Spacing } from '../constants/theme';

/**
 * PlayerSeekBar
 * Props:
 *   currentTime       — number (seconds)
 *   duration          — number (seconds)
 *   isSeeking         — boolean
 *   seekValue         — number (seconds)
 *   onSlidingStart    — (value: number) => void
 *   onValueChange     — (value: number) => void
 *   onSlidingComplete — (value: number) => void
 */
export default function PlayerSeekBar({
    currentTime,
    duration,
    isSeeking,
    seekValue,
    onSlidingStart,
    onValueChange,
    onSlidingComplete,
}) {
    return (
        <View style={styles.seekRow} pointerEvents="auto">
            <Text style={styles.timeText}>
                {fmt(isSeeking ? seekValue : currentTime)}
            </Text>

            <Slider
                style={styles.slider}
                minimumValue={0}
                maximumValue={duration || 1}
                value={isSeeking ? seekValue : currentTime}
                onSlidingStart={onSlidingStart}
                onValueChange={onValueChange}
                onSlidingComplete={onSlidingComplete}
                minimumTrackTintColor={Brand.primary}
                maximumTrackTintColor="rgba(255,255,255,0.3)"
                thumbTintColor={Brand.primary}
            />

            <Text style={styles.timeText}>{fmt(duration)}</Text>
        </View>
    );
}

function fmt(s) {
    if (!s || isNaN(s)) return '0:00';
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
}

const styles = StyleSheet.create({
    seekRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spacing.md,
        paddingBottom: Spacing.xs,
    },
    timeText: {
        color: '#fff',
        fontSize: 11,
        minWidth: 35,
    },
    slider: {
        flex: 1,
        height: 40,
    },
});