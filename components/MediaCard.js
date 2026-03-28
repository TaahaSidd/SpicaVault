import { Ionicons } from '@expo/vector-icons';
import { Image, StyleSheet, Text, TouchableWithoutFeedback, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
    runOnJS, useAnimatedStyle, useSharedValue, withSpring,
} from 'react-native-reanimated';
import { FontSize } from '../constants/theme';

const SPRING = { damping: 22, stiffness: 250 };

// ── Zoomable Photo ────────────────────────────────────────────────────────────
function ZoomablePhoto({ uri, onTap, width, height, scrollRef }) {
    const scale = useSharedValue(1);
    const savedScale = useSharedValue(1);
    const tx = useSharedValue(0);
    const ty = useSharedValue(0);
    const savedTx = useSharedValue(0);
    const savedTy = useSharedValue(0);

    // ── Worklet helpers ───────────────────────────────────────────────────────
    const resetZoom = (animated = true) => {
        'worklet';
        scale.value = animated ? withSpring(1, SPRING) : 1;
        tx.value = animated ? withSpring(0, SPRING) : 0;
        ty.value = animated ? withSpring(0, SPRING) : 0;
        savedScale.value = 1;
        savedTx.value = 0;
        savedTy.value = 0;
    };

    const clampTranslation = (val, screenSize, currentScale) => {
        'worklet';
        // How far can we pan before the image edge hits the screen edge
        const maxOffset = (screenSize * (currentScale - 1)) / 2;
        return Math.max(-maxOffset, Math.min(maxOffset, val));
    };

    // ── Pinch to zoom ─────────────────────────────────────────────────────────
    const pinch = Gesture.Pinch()
        .onUpdate(e => {
            'worklet';
            scale.value = Math.max(1, Math.min(savedScale.value * e.scale, 6));
        })
        .onEnd(() => {
            'worklet';
            if (scale.value < 1.05) {
                resetZoom();
            } else {
                savedScale.value = scale.value;
                // Clamp translation so image doesn't go out of bounds after pinch
                tx.value = clampTranslation(tx.value, width, scale.value);
                ty.value = clampTranslation(ty.value, height, scale.value);
                savedTx.value = tx.value;
                savedTy.value = ty.value;
            }
        });

    // ── Pan (only active when zoomed in) ──────────────────────────────────────
    const pan = Gesture.Pan()
        .minDistance(1)
        .averageTouches(true)
        .simultaneousWithExternalGesture(scrollRef)
        .onUpdate(e => {
            'worklet';
            if (scale.value > 1) {
                tx.value = clampTranslation(savedTx.value + e.translationX, width, scale.value);
                ty.value = clampTranslation(savedTy.value + e.translationY, height, scale.value);
            }
        })
        .onEnd(() => {
            'worklet';
            savedTx.value = tx.value;
            savedTy.value = ty.value;
        });

    // ── Double tap to zoom ────────────────────────────────────────────────────
    const doubleTap = Gesture.Tap()
        .numberOfTaps(2)
        .maxDelay(300)
        .maxDistance(20)
        .onEnd(() => {
            'worklet'; // ✅ must be FIRST line inside onEnd callback
            if (scale.value > 1) {
                resetZoom();
            } else {
                scale.value = withSpring(2.5, SPRING);
                savedScale.value = 2.5;
            }
        });

    // ── Single tap to toggle UI ───────────────────────────────────────────────
    const singleTap = Gesture.Tap()
        .maxDuration(250)
        .maxDistance(10)
        .onEnd(() => {
            'worklet';
            runOnJS(onTap)();
        });

    // ── Composition ───────────────────────────────────────────────────────────
    // Simultaneous: pinch + pan work together (two-finger drag while zoomed)
    // Exclusive: doubleTap wins over singleTap (wait to confirm it's not a double)
    const composed = Gesture.Simultaneous(
        pinch,
        pan,
        Gesture.Exclusive(doubleTap, singleTap),
    );

    const animStyle = useAnimatedStyle(() => ({
        transform: [
            { translateX: tx.value },
            { translateY: ty.value },
            { scale: scale.value },
        ],
    }));

    return (
        <GestureDetector gesture={composed}>
            <Animated.Image
                source={{ uri }}
                style={[{ width, height }, animStyle]}
                resizeMode="contain"
            />
        </GestureDetector>
    );
}

// ── Video Thumb ───────────────────────────────────────────────────────────────
function VideoThumb({ item, onPlay, width, height }) {
    return (
        <TouchableWithoutFeedback onPress={onPlay}>
            <View style={{ width, height, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' }}>
                <Image
                    source={{ uri: item.uri }}
                    style={StyleSheet.absoluteFill}
                    resizeMode="contain"
                />
                <View style={styles.videoOverlay}>
                    <View style={styles.playCircle}>
                        <Ionicons name="play" size={38} color="#fff" />
                    </View>
                    <Text style={styles.tapHint}>Tap to play</Text>
                </View>
            </View>
        </TouchableWithoutFeedback>
    );
}

// ── MediaCard ─────────────────────────────────────────────────────────────────
/**
 * Props:
 *   item        — { uri, type: 'image' | 'video', filename }
 *   width       — screen width
 *   height      — screen height
 *   onTap       — () => void
 *   onPlayVideo — () => void
 *   scrollRef   — ref to parent RNGH ScrollView
 */
export default function MediaCard({ item, width, height, onTap, onPlayVideo, scrollRef }) {
    if (item.type === 'video') {
        return <VideoThumb item={item} onPlay={onPlayVideo} width={width} height={height} />;
    }
    return (
        <ZoomablePhoto
            uri={item.uri}
            onTap={onTap}
            width={width}
            height={height}
            scrollRef={scrollRef}
        />
    );
}

const styles = StyleSheet.create({
    videoOverlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 12,
    },
    playCircle: {
        width: 80, height: 80, borderRadius: 40,
        backgroundColor: 'rgba(0,0,0,0.55)',
        justifyContent: 'center', alignItems: 'center',
        paddingLeft: 4,
    },
    tapHint: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: FontSize.sm,
    },
});