import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Brand } from '../constants/theme';

export default function PlayerControlsRow({
    brightness,
    volume,
    isMuted,
    isLandscape,
    onBrightness,
    onVolume,
    onMute,
    onLock,
    onOrientation,
}) {
    const [expandedSlider, setExpandedSlider] = useState(null);

    const toggle = (name) =>
        setExpandedSlider(prev => (prev === name ? null : name));

    return (
        <View style={styles.row}>
            {/* Brightness */}
            <TouchableOpacity
                style={[styles.circleBtn, expandedSlider === 'brightness' && styles.activeBtn]}
                onPress={() => toggle('brightness')}
            >
                <Ionicons name="sunny-outline" size={20} color="#fff" />
            </TouchableOpacity>

            {expandedSlider === 'brightness' && (
                <Slider
                    style={styles.slider}
                    minimumValue={0}
                    maximumValue={1}
                    value={brightness}
                    onValueChange={onBrightness}
                    minimumTrackTintColor={Brand.primary}
                    maximumTrackTintColor="rgba(255,255,255,0.2)"
                    thumbTintColor="#fff"
                />
            )}

            {/* Volume Toggle */}
            <TouchableOpacity
                style={[styles.circleBtn, expandedSlider === 'volume' && styles.activeBtn]}
                onPress={() => toggle('volume')}
            >
                <Ionicons
                    name={volume < 0.4 ? 'volume-low-outline' : 'volume-medium-outline'}
                    size={20}
                    color="#fff"
                />
            </TouchableOpacity>

            {expandedSlider === 'volume' && (
                <Slider
                    style={styles.slider}
                    minimumValue={0}
                    maximumValue={1}
                    value={volume}
                    onValueChange={onVolume}
                    minimumTrackTintColor={Brand.primary}
                    maximumTrackTintColor="rgba(255,255,255,0.2)"
                    thumbTintColor="#fff"
                />
            )}

            {/* Mute */}
            <TouchableOpacity style={styles.circleBtn} onPress={onMute}>
                <Ionicons
                    name={isMuted ? 'volume-mute' : 'volume-high'}
                    size={20}
                    color={isMuted ? Brand.primary : "#fff"}
                />
            </TouchableOpacity>

            {/* Lock */}
            <TouchableOpacity style={styles.circleBtn} onPress={onLock}>
                <Ionicons name="lock-open-outline" size={18} color="#fff" />
            </TouchableOpacity>

            {/* Orientation Toggle */}
            <TouchableOpacity style={styles.circleBtn} onPress={onOrientation}>
                <Ionicons
                    name={isLandscape ? 'phone-portrait-outline' : 'phone-landscape-outline'}
                    size={18}
                    color="#fff"
                />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 10,
        backgroundColor: 'transparent', // Transparent
        gap: 8,
    },
    circleBtn: {
        width: 38,
        height: 38,
        borderRadius: 19,
        backgroundColor: 'rgba(0,0,0,0.3)', // Circular shadow for visibility
        justifyContent: 'center',
        alignItems: 'center',
    },
    activeBtn: {
        backgroundColor: 'rgba(255,255,255,0.2)',
    },
    slider: {
        width: 100,
        height: 40,
    },
});