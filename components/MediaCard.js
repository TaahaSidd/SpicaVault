import { Ionicons } from '@expo/vector-icons';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
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
        const maxOffset = (screenSize * (currentScale - 1)) / 2;
        return Math.max(-maxOffset, Math.min(maxOffset, val));
    };

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
                tx.value = clampTranslation(tx.value, width, scale.value);
                ty.value = clampTranslation(ty.value, height, scale.value);
                savedTx.value = tx.value;
                savedTy.value = ty.value;
            }
        });

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

    const doubleTap = Gesture.Tap()
        .numberOfTaps(2)
        .maxDelay(300)
        .maxDistance(20)
        .onEnd(() => {
            'worklet';
            if (scale.value > 1) {
                resetZoom();
            } else {
                scale.value = withSpring(2.5, SPRING);
                savedScale.value = 2.5;
            }
        });

    const singleTap = Gesture.Tap()
        .maxDuration(250)
        .maxDistance(10)
        .onEnd(() => {
            'worklet';
            runOnJS(onTap)();
        });

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
// Only the play button circle triggers video playback — tapping elsewhere does nothing
function VideoThumb({ item, onPlay, onTap, width, height }) {
    return (
        <View
            style={{ width, height, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' }}
        >
            {/* Thumbnail image — tappable to toggle UI only */}
            <Image
                source={{ uri: item.uri }}
                style={StyleSheet.absoluteFill}
                resizeMode="contain"
            />

            {/* Dark scrim so play button stands out */}
            <View style={styles.scrim} />

            {/* Overlay — tap anywhere on overlay toggles UI */}
            <Animated.View
                style={StyleSheet.absoluteFill}
                onTouchEnd={onTap}
            />

            {/* Play button — ONLY this triggers video playback */}
            <TouchableOpacity
                style={styles.playCircle}
                onPress={onPlay}
                activeOpacity={0.8}
            >
                <Ionicons name="play" size={38} color="#fff" />
            </TouchableOpacity>

            <Text style={styles.tapHint} pointerEvents="none">Tap to play</Text>
        </View>
    );
}

// ── MediaCard ─────────────────────────────────────────────────────────────────
export default function MediaCard({ item, width, height, onTap, onPlayVideo, scrollRef }) {
    if (item.type === 'video') {
        return (
            <VideoThumb
                item={item}
                onPlay={onPlayVideo}
                onTap={onTap}
                width={width}
                height={height}
            />
        );
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
    scrim: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.25)',
    },
    playCircle: {
        width: 80, height: 80, borderRadius: 40,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center', alignItems: 'center',
        paddingLeft: 4,
        zIndex: 10,
        // Subtle border so it pops against dark backgrounds
        borderWidth: 1.5,
        borderColor: 'rgba(255,255,255,0.3)',
    },
    tapHint: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: FontSize.sm,
        marginTop: 12,
        zIndex: 10,
    },
});