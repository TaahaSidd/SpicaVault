import { Ionicons } from '@expo/vector-icons';
import { useEvent } from 'expo';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useEffect, useRef, useState } from 'react';
import {
    Dimensions, PanResponder, StatusBar,
    StyleSheet, Text, TouchableOpacity, View,
} from 'react-native';
import { Brand, FontSize, FontWeight, Spacing } from '../constants/theme';

const { width, height } = Dimensions.get('window');

function fmt(s) {
    if (!s || isNaN(s)) return '0:00';
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
}

export default function VideoPlayerScreen({ route, navigation }) {
    const { item } = route.params || {};

    const [showControls, setShowControls] = useState(true);
    const [muted, setMuted] = useState(false);
    const [isSeeking, setIsSeeking] = useState(false);
    const [seekValue, setSeekValue] = useState(0);
    const controlsTimer = useRef(null);
    const progressBarWidth = useRef(0);

    const player = useVideoPlayer(item?.uri ?? '', p => {
        p.loop = false;
        p.play();
    });

    const { isPlaying } = useEvent(player, 'playingChange', { isPlaying: player.playing });
    const { currentTime } = useEvent(player, 'timeUpdate', { currentTime: player.currentTime ?? 0 });
    const duration = player.duration ?? 0;
    const progress = duration > 0 ? (isSeeking ? seekValue : currentTime) / duration : 0;

    // Auto hide controls after 3s when playing
    useEffect(() => {
        if (isPlaying && showControls) {
            clearTimeout(controlsTimer.current);
            controlsTimer.current = setTimeout(() => setShowControls(false), 3000);
        }
        return () => clearTimeout(controlsTimer.current);
    }, [isPlaying, showControls]);

    const showControlsTemporarily = () => {
        setShowControls(true);
        clearTimeout(controlsTimer.current);
        if (isPlaying) {
            controlsTimer.current = setTimeout(() => setShowControls(false), 3000);
        }
    };

    const togglePlay = () => {
        if (isPlaying) { player.pause(); setShowControls(true); clearTimeout(controlsTimer.current); }
        else { player.play(); showControlsTemporarily(); }
    };

    const skipBack = () => {
        player.currentTime = Math.max((player.currentTime ?? 0) - 10, 0);
        showControlsTemporarily();
    };

    const skipForward = () => {
        player.currentTime = Math.min((player.currentTime ?? 0) + 10, duration);
        showControlsTemporarily();
    };

    const toggleMute = () => {
        player.muted = !muted;
        setMuted(!muted);
    };

    // Seek bar with PanResponder
    const seekPan = useRef(PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onPanResponderGrant: e => {
            setIsSeeking(true);
            const ratio = Math.max(0, Math.min(1, e.nativeEvent.locationX / progressBarWidth.current));
            setSeekValue(ratio * duration);
            showControlsTemporarily();
        },
        onPanResponderMove: e => {
            const ratio = Math.max(0, Math.min(1, e.nativeEvent.locationX / progressBarWidth.current));
            setSeekValue(ratio * duration);
        },
        onPanResponderRelease: e => {
            const ratio = Math.max(0, Math.min(1, e.nativeEvent.locationX / progressBarWidth.current));
            player.currentTime = ratio * duration;
            setIsSeeking(false);
        },
    })).current;

    const handleBack = () => {
        player.pause();
        navigation.goBack();
    };

    return (
        <View style={styles.screen}>
            <StatusBar hidden />

            {/* Full screen video */}
            <VideoView
                player={player}
                style={styles.video}
                contentFit="contain"
                nativeControls={false}
            />

            {/* Tap area to toggle controls */}
            <TouchableOpacity
                style={styles.tapArea}
                activeOpacity={1}
                onPress={showControlsTemporarily}
            />

            {/* Controls overlay */}
            {showControls && (
                <View style={styles.overlay}>
                    {/* Top bar */}
                    <View style={styles.topBar}>
                        <TouchableOpacity style={styles.iconBtn} onPress={handleBack} activeOpacity={0.7}>
                            <Ionicons name="chevron-back" size={26} color="#fff" />
                        </TouchableOpacity>
                        <Text style={styles.title} numberOfLines={1}>{item?.filename ?? ''}</Text>
                        <TouchableOpacity style={styles.iconBtn} onPress={toggleMute} activeOpacity={0.7}>
                            <Ionicons name={muted ? 'volume-mute' : 'volume-high'} size={22} color="#fff" />
                        </TouchableOpacity>
                    </View>

                    {/* Center controls */}
                    <View style={styles.centerRow}>
                        <TouchableOpacity style={styles.skipBtn} onPress={skipBack} activeOpacity={0.7}>
                            <Ionicons name="play-back" size={32} color="#fff" />
                            <Text style={styles.skipLabel}>10</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.playBtn} onPress={togglePlay} activeOpacity={0.7}>
                            <Ionicons name={isPlaying ? 'pause' : 'play'} size={44} color="#fff" />
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.skipBtn} onPress={skipForward} activeOpacity={0.7}>
                            <Ionicons name="play-forward" size={32} color="#fff" />
                            <Text style={styles.skipLabel}>10</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Bottom seek bar */}
                    <View style={styles.bottomBar}>
                        <Text style={styles.timeText}>{fmt(isSeeking ? seekValue : currentTime)}</Text>

                        <View
                            style={styles.seekTrack}
                            onLayout={e => { progressBarWidth.current = e.nativeEvent.layout.width; }}
                            {...seekPan.panHandlers}
                        >
                            {/* Background */}
                            <View style={styles.seekBg} />
                            {/* Progress */}
                            <View style={[styles.seekFill, { width: `${progress * 100}%` }]} />
                            {/* Thumb */}
                            <View style={[styles.seekThumb, { left: `${Math.min(progress * 100, 97)}%` }]} />
                        </View>

                        <Text style={styles.timeText}>{fmt(duration)}</Text>
                    </View>
                </View>
            )}

            {/* Show play icon when paused + controls hidden */}
            {!showControls && !isPlaying && (
                <TouchableOpacity
                    style={styles.pausedOverlay}
                    activeOpacity={1}
                    onPress={showControlsTemporarily}
                >
                    <Ionicons name="play-circle" size={72} color="rgba(255,255,255,0.5)" />
                </TouchableOpacity>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    screen: { flex: 1, backgroundColor: '#000' },
    video: { ...StyleSheet.absoluteFillObject },
    tapArea: { ...StyleSheet.absoluteFillObject },

    // Controls overlay
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.35)',
        justifyContent: 'space-between',
    },

    // Top bar
    topBar: {
        flexDirection: 'row', alignItems: 'center',
        paddingHorizontal: Spacing.md, paddingTop: 48, paddingBottom: Spacing.md,
        gap: Spacing.sm,
        backgroundColor: 'rgba(0,0,0,0.4)',
    },
    iconBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
    title: {
        flex: 1, color: '#fff',
        fontSize: FontSize.sm, fontWeight: FontWeight.medium,
    },

    // Center
    centerRow: {
        flexDirection: 'row', alignItems: 'center',
        justifyContent: 'center', gap: 48,
    },
    skipBtn: { alignItems: 'center', gap: 4 },
    skipLabel: { color: '#fff', fontSize: 11 },
    playBtn: {
        width: 80, height: 80, borderRadius: 40,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center', alignItems: 'center',
        paddingLeft: 4,
    },

    // Bottom seek
    bottomBar: {
        flexDirection: 'row', alignItems: 'center',
        paddingHorizontal: Spacing.md, paddingBottom: 40,
        paddingTop: Spacing.md, gap: Spacing.sm,
        backgroundColor: 'rgba(0,0,0,0.4)',
    },
    timeText: { color: '#fff', fontSize: 12, minWidth: 40, textAlign: 'center' },
    seekTrack: {
        flex: 1, height: 40,
        justifyContent: 'center',
    },
    seekBg: {
        position: 'absolute', left: 0, right: 0,
        height: 3, backgroundColor: 'rgba(255,255,255,0.3)',
        borderRadius: 2,
    },
    seekFill: {
        position: 'absolute', left: 0,
        height: 3, backgroundColor: Brand.primary,
        borderRadius: 2,
    },
    seekThumb: {
        position: 'absolute',
        width: 16, height: 16, borderRadius: 8,
        backgroundColor: Brand.primary,
        top: 12, marginLeft: -8,
    },

    // Paused overlay
    pausedOverlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center', alignItems: 'center',
    },
});