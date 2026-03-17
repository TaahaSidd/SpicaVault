import { Ionicons } from '@expo/vector-icons';
import { useRef, useState } from 'react';
import {
    Dimensions, FlatList, Image,
    Share, StatusBar, StyleSheet, Text,
    TouchableOpacity, TouchableWithoutFeedback, View,
} from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, {
    runOnJS, useAnimatedStyle, useSharedValue, withSpring,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast, { useToast } from '../components/Toast';
import VaultModal from '../components/VaultModal';
import { Brand, Colors, FontSize, FontWeight, Spacing } from '../constants/theme';
import { useVaultStorage } from '../context/VaultContext';

const { width, height } = Dimensions.get('window');
const THUMB_SIZE = 60;
const THUMB_GAP = 3;

// ── Zoomable Photo ────────────────────────────────────────────────────────────
function ZoomablePhoto({ uri, onTap }) {
    const scale = useSharedValue(1);
    const savedScale = useSharedValue(1);
    const tx = useSharedValue(0), ty = useSharedValue(0);
    const savedX = useSharedValue(0), savedY = useSharedValue(0);

    const pinch = Gesture.Pinch()
        .onUpdate(e => { scale.value = Math.max(1, Math.min(savedScale.value * e.scale, 5)); })
        .onEnd(() => {
            if (scale.value < 1.1) {
                scale.value = withSpring(1); tx.value = withSpring(0); ty.value = withSpring(0);
                savedScale.value = 1; savedX.value = 0; savedY.value = 0;
            } else savedScale.value = scale.value;
        });

    const pan = Gesture.Pan()
        .onUpdate(e => { if (scale.value > 1) { tx.value = savedX.value + e.translationX; ty.value = savedY.value + e.translationY; } })
        .onEnd(() => { savedX.value = tx.value; savedY.value = ty.value; });

    const doubleTap = Gesture.Tap().numberOfTaps(2).onEnd(() => {
        if (scale.value > 1) {
            scale.value = withSpring(1); tx.value = withSpring(0); ty.value = withSpring(0);
            savedScale.value = 1; savedX.value = 0; savedY.value = 0;
        } else { scale.value = withSpring(2.5); savedScale.value = 2.5; }
    });

    const singleTap = Gesture.Tap()
        .maxDuration(250)
        .onEnd(() => { runOnJS(onTap)(); });

    const composed = Gesture.Simultaneous(pinch, pan, Gesture.Exclusive(doubleTap, singleTap));

    const animStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: tx.value }, { translateY: ty.value }, { scale: scale.value }],
    }));

    return (
        <GestureDetector gesture={composed}>
            <Animated.Image source={{ uri }} style={[styles.mediaImage, animStyle]} resizeMode="contain" />
        </GestureDetector>
    );
}

// ── Video thumb — tap goes to full screen player ──────────────────────────────
function VideoThumb({ item, onPlay }) {
    return (
        <TouchableWithoutFeedback onPress={onPlay}>
            <View style={styles.mediaContainer}>
                <Image source={{ uri: item.uri }} style={styles.mediaImage} resizeMode="contain" />
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

// ── Thumbnail strip ───────────────────────────────────────────────────────────
function ThumbnailStrip({ items, currentIndex, onSelect }) {
    return (
        <FlatList
            data={items}
            horizontal
            keyExtractor={i => i.uri}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.stripContent}
            style={styles.strip}
            renderItem={({ item, index }) => {
                const isActive = index === currentIndex;
                return (
                    <TouchableOpacity
                        onPress={() => onSelect(index)}
                        activeOpacity={0.8}
                        style={[styles.thumb, isActive && styles.thumbActive]}
                    >
                        <Image source={{ uri: item.uri }} style={styles.thumbImage} resizeMode="cover" />
                        {item.type === 'video' && (
                            <View style={styles.thumbVideoIcon}>
                                <Ionicons name="videocam" size={9} color="#fff" />
                            </View>
                        )}
                        {isActive && <View style={styles.thumbBorder} />}
                    </TouchableOpacity>
                );
            }}
        />
    );
}

// ── Main Screen ───────────────────────────────────────────────────────────────
export default function MediaViewerScreen({ route, navigation }) {
    const { item, items = [] } = route.params || {};
    const allItems = items.length > 0 ? items : [item];
    const initialIndex = Math.max(0, allItems.findIndex(i => i.uri === item?.uri));

    const [currentIndex, setCurrentIndex] = useState(initialIndex);
    const [showUI, setShowUI] = useState(true);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const { deleteFromVault, toggleFavourite, isFavourite } = useVaultStorage();
    const { toast, showSuccess, showError, hideToast } = useToast();
    const flatListRef = useRef(null);

    const currentItem = allItems[currentIndex];
    const favState = isFavourite(currentItem?.filename ?? '');

    const goTo = (index) => {
        setCurrentIndex(index);
        flatListRef.current?.scrollToIndex({ index, animated: true });
    };

    const toggleUI = () => setShowUI(p => !p);

    const handleDelete = async () => {
        try {
            await deleteFromVault(currentItem.filename);
            setShowDeleteModal(false);
            showSuccess('Deleted', 'File removed from vault.');
            setTimeout(() => {
                if (allItems.length <= 1) navigation.goBack();
                else goTo(Math.max(0, currentIndex - 1));
            }, 800);
        } catch (e) { showError('Error', 'Could not delete file.'); }
    };

    const handleShare = async () => {
        try { await Share.share({ url: currentItem.uri, title: currentItem.filename }); }
        catch (e) { showError('Error', 'Could not share file.'); }
    };

    const handleFav = async () => {
        const newState = await toggleFavourite(currentItem.filename);
        showSuccess(newState ? 'Added ♥' : 'Removed', newState ? 'Added to favourites.' : 'Removed from favourites.');
    };

    const renderItem = ({ item: mediaItem, index }) => (
        <View style={styles.mediaContainer}>
            {mediaItem.type === 'video'
                ? <VideoThumb
                    item={mediaItem}
                    onPlay={() => navigation.navigate('VideoPlayer', { item: mediaItem })}
                />
                : <ZoomablePhoto uri={mediaItem.uri} onTap={toggleUI} />
            }
        </View>
    );

    return (
        <GestureHandlerRootView style={styles.screen}>
            <StatusBar barStyle="light-content" backgroundColor="#000" hidden={!showUI} />

            <FlatList
                ref={flatListRef}
                data={allItems}
                renderItem={renderItem}
                keyExtractor={i => i.uri}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                initialScrollIndex={initialIndex}
                getItemLayout={(_, index) => ({ length: width, offset: width * index, index })}
                onMomentumScrollEnd={e => {
                    const index = Math.round(e.nativeEvent.contentOffset.x / width);
                    setCurrentIndex(index);
                }}
            />

            {/* Top bar */}
            {showUI && (
                <SafeAreaView style={styles.topBar} edges={['top']}>
                    <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
                        <Ionicons name="chevron-back" size={26} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.counter}>{currentIndex + 1} / {allItems.length}</Text>
                    <TouchableOpacity
                        style={styles.iconBtn}
                        onPress={() => navigation.navigate('MediaInfo', { item: currentItem })}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="information-circle-outline" size={24} color="#fff" />
                    </TouchableOpacity>
                </SafeAreaView>
            )}

            {/* Bottom UI */}
            {showUI && (
                <SafeAreaView style={styles.bottomUI} edges={['bottom']}>
                    {allItems.length > 1 && (
                        <ThumbnailStrip items={allItems} currentIndex={currentIndex} onSelect={goTo} />
                    )}
                    <View style={styles.actionRow}>
                        <TouchableOpacity style={styles.actionBtn} onPress={handleFav} activeOpacity={0.7}>
                            <Ionicons name={favState ? 'heart' : 'heart-outline'} size={22} color={favState ? '#EC4899' : '#fff'} />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.actionBtn} onPress={handleShare} activeOpacity={0.7}>
                            <Ionicons name="share-outline" size={22} color="#fff" />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.actionBtn} onPress={() => setShowDeleteModal(true)} activeOpacity={0.7}>
                            <Ionicons name="trash-outline" size={22} color="#EF4444" />
                        </TouchableOpacity>
                    </View>
                </SafeAreaView>
            )}

            <VaultModal
                visible={showDeleteModal}
                icon="delete"
                title="Delete File"
                message="This will permanently remove the file from your vault."
                primaryText="Delete"
                primaryDestructive
                secondaryText="Cancel"
                onPrimary={handleDelete}
                onSecondary={() => setShowDeleteModal(false)}
                onClose={() => setShowDeleteModal(false)}
            />

            {toast && <Toast {...toast} onHide={hideToast} />}
        </GestureHandlerRootView>
    );
}

const styles = StyleSheet.create({
    screen: { flex: 1, backgroundColor: '#000' },
    mediaContainer: { width, height, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' },
    mediaImage: { width: '100%', height: '100%' },

    // Video thumb
    videoOverlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center', alignItems: 'center', gap: 12,
    },
    playCircle: {
        width: 80, height: 80, borderRadius: 40,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center', alignItems: 'center', paddingLeft: 4,
    },
    tapHint: { color: 'rgba(255,255,255,0.7)', fontSize: FontSize.sm },

    // Top bar
    topBar: {
        position: 'absolute', top: 0, left: 0, right: 0,
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: Spacing.sm,
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    iconBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
    counter: { color: '#fff', fontSize: FontSize.sm, fontWeight: FontWeight.semibold },

    // Bottom UI
    bottomUI: {
        position: 'absolute', bottom: 0, left: 0, right: 0,
        backgroundColor: 'rgba(0,0,0,0.65)',
    },
    strip: { height: THUMB_SIZE + 10 },
    stripContent: { paddingHorizontal: Spacing.md, paddingVertical: 5, gap: THUMB_GAP },
    thumb: { width: THUMB_SIZE, height: THUMB_SIZE, borderRadius: 6, overflow: 'hidden', opacity: 0.55 },
    thumbActive: { opacity: 1 },
    thumbImage: { width: '100%', height: '100%' },
    thumbVideoIcon: {
        position: 'absolute', bottom: 3, left: 3,
        backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 3, padding: 2,
    },
    thumbBorder: {
        ...StyleSheet.absoluteFillObject,
        borderWidth: 2, borderColor: Brand.primary, borderRadius: 6,
    },
    actionRow: {
        flexDirection: 'row', justifyContent: 'space-around',
        paddingVertical: Spacing.md,
        borderTopWidth: 0.5, borderTopColor: 'rgba(255,255,255,0.08)',
    },
    actionBtn: { padding: Spacing.sm },
});