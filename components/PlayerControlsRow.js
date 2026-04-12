import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
// Updated to include Radius
import { Brand, Radius } from '../constants/theme';

export default function PlayerControlsRow({
    brightness,
    volume,
    isMuted,
    isLandscape,
    isLooping,
    showBrightness = true,
    showVolume = true,
    onBrightness,
    onVolume,
    onMute,
    onLock,
    onOrientation,
    onLoopToggle,
}) {
    const [expandedSlider, setExpandedSlider] = useState(null);
    const toggle = (name) => setExpandedSlider(p => p === name ? null : name);

    return (
        <View style={styles.row}>

            {/* ── Brightness icon + slider (optional) ── */}
            {showBrightness && (
                <>
                    <TouchableOpacity
                        // Added style for background and active state
                        style={[styles.iconBtn, expandedSlider === 'brightness' && styles.activeIconBtn]}
                        onPress={() => toggle('brightness')}
                    >
                        <Ionicons name="sunny-outline" size={18} color="#fff" />
                    </TouchableOpacity>
                    {expandedSlider === 'brightness' && (
                        <Slider
                            style={styles.slider}
                            minimumValue={0}
                            maximumValue={1}
                            value={brightness}
                            onValueChange={onBrightness}
                            minimumTrackTintColor={Brand.primary}
                            maximumTrackTintColor="rgba(255,255,255,0.25)"
                            thumbTintColor="#fff" // Clean white thumb
                        />
                    )}
                </>
            )}

            {/* ── Mute — always visible ── */}
            <TouchableOpacity
                // Added style for background and active state
                style={[styles.iconBtn, expandedSlider === 'volume' && styles.activeIconBtn]}
                onPress={() => {
                    if (showVolume) {
                        if (expandedSlider === 'volume') onMute();
                        else toggle('volume');
                    } else {
                        onMute();
                    }
                }}
            >
                <Ionicons
                    name={isMuted ? 'volume-mute' : volume < 0.4 ? 'volume-low' : 'volume-medium'}
                    size={18}
                    color="#fff"
                />
            </TouchableOpacity>

            {/* ── Volume slider (optional) ── */}
            {showVolume && expandedSlider === 'volume' && (
                <Slider
                    style={styles.slider}
                    minimumValue={0}
                    maximumValue={1}
                    value={isMuted ? 0 : volume}
                    onValueChange={onVolume}
                    minimumTrackTintColor={Brand.primary}
                    maximumTrackTintColor="rgba(255,255,255,0.25)"
                    thumbTintColor="#fff" // Clean white thumb
                />
            )}

            {/* ── Loop — always visible ── */}
            <TouchableOpacity
                // Special background color when looping is active
                style={[styles.iconBtn, isLooping && styles.loopActiveBtn]}
                onPress={onLoopToggle}
            >
                <Ionicons
                    name="repeat"
                    size={18}
                    color="#fff" // Keep icon white
                />
            </TouchableOpacity>

            {/* ── Lock — always visible ── */}
            <TouchableOpacity style={styles.iconBtn} onPress={onLock}>
                <Ionicons name="lock-open-outline" size={18} color="#fff" />
            </TouchableOpacity>

            {/* ── Orientation — always visible ── */}
            <TouchableOpacity style={styles.iconBtn} onPress={onOrientation}>
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
        justifyContent: 'flex-start',
        paddingHorizontal: 12,
        paddingVertical: 10,
        paddingLeft: 26,
        gap: 8,
    },
    iconBtn: {
        width: 36,
        height: 36,
        borderRadius: Radius.full,
        justifyContent: 'center',
        alignItems: 'center',
        // Now using your Orange/Amber
        backgroundColor: Brand.primary,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    activeIconBtn: {
        // A slightly darker/deeper orange when expanded
        backgroundColor: Brand.primaryDim,
    },
    loopActiveBtn: {
        // Keep it bright orange, maybe add a white border for loop active?
        backgroundColor: Brand.primary,
        borderWidth: 1.5,
        borderColor: '#fff',
    },
    slider: {
        width: 110,
        height: 36,
        marginHorizontal: 4,
    },
});