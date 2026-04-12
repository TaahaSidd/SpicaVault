import Slider from '@react-native-community/slider';
import { useRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Brand, Spacing } from '../constants/theme';

function fmt(s) {
    if (!s || isNaN(s) || s < 0) return '0:00';
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
}

/**
 * PlayerSeekBar
 * Props:
 *   currentTime       — number (seconds), live playback position
 *   duration          — number (seconds)
 *   isSeeking         — boolean
 *   seekValue         — number (seconds), preview while dragging
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
    const sliderRef = useRef(null);

    // The displayed time — seekValue while dragging, currentTime otherwise
    const displayTime = isSeeking ? seekValue : currentTime;
    console.log("Current:", currentTime, "Duration:", duration);

    return (
        <View style={styles.seekRow} pointerEvents="auto">
            <Text style={styles.timeText}>{fmt(displayTime)}</Text>

            <Slider
                ref={sliderRef}
                style={styles.slider}
                minimumValue={0}
                maximumValue={duration > 0 ? duration : 1}
                // ✅ Only pass value when NOT seeking — avoids Android fighting the drag
                value={isSeeking ? undefined : currentTime}
                onSlidingStart={onSlidingStart}
                onValueChange={onValueChange}
                onSlidingComplete={onSlidingComplete}
                minimumTrackTintColor={Brand.primary}
                maximumTrackTintColor="rgba(255,255,255,0.25)"
                thumbTintColor={Brand.primary}
                tapToSeek
            />

            <Text style={styles.timeText}>{fmt(duration)}</Text>
        </View>
    );
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
        minWidth: 38,
    },
    slider: {
        flex: 1,
        height: 40,
    },
});