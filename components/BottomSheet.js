import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef } from 'react';
import {
    Animated, Dimensions, Modal, PanResponder,
    Pressable, StyleSheet, Text, View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, FontSize, FontWeight, Spacing } from '../constants/theme';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const theme = Colors.dark;

export default function BottomSheet({
    visible,
    onClose,
    title,
    children,
    snapPoint = 0.5,
    showHandle = true,
    showCloseBtn = true,
}) {
    const insets = useSafeAreaInsets();
    const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
    const overlayOpacity = useRef(new Animated.Value(0)).current;

    // Calculate height including safe area to prevent clipping
    const sheetHeight = (SCREEN_HEIGHT * snapPoint) + insets.bottom;

    useEffect(() => {
        if (visible) {
            Animated.parallel([
                Animated.spring(translateY, {
                    toValue: 0, useNativeDriver: true,
                    tension: 65, friction: 11,
                }),
                Animated.timing(overlayOpacity, {
                    toValue: 1, duration: 200, useNativeDriver: true,
                }),
            ]).start();
        } else {
            close();
        }
    }, [visible]);

    const close = () => {
        Animated.parallel([
            Animated.timing(translateY, {
                toValue: SCREEN_HEIGHT, duration: 280, useNativeDriver: true,
            }),
            Animated.timing(overlayOpacity, {
                toValue: 0, duration: 200, useNativeDriver: true,
            }),
        ]).start(() => onClose?.());
    };

    const panResponder = useRef(PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: (_, gs) => gs.dy > 5,
        onPanResponderMove: (_, gs) => {
            if (gs.dy > 0) translateY.setValue(gs.dy);
        },
        onPanResponderRelease: (_, gs) => {
            if (gs.dy > (sheetHeight * 0.35) || gs.vy > 0.5) {
                close();
            } else {
                Animated.spring(translateY, {
                    toValue: 0, useNativeDriver: true,
                    tension: 65, friction: 11,
                }).start();
            }
        },
    })).current;

    if (!visible) return null;

    return (
        <Modal transparent animationType="none" visible={visible} onRequestClose={close}>
            <Animated.View style={[styles.overlay, { opacity: overlayOpacity }]}>
                <Pressable style={StyleSheet.absoluteFill} onPress={close} />
            </Animated.View>

            <Animated.View style={[
                styles.sheet,
                { height: sheetHeight, transform: [{ translateY }], backgroundColor: theme.elevated }
            ]}>
                <View {...panResponder.panHandlers} style={styles.handleArea}>
                    {showHandle && <View style={[styles.handle, { backgroundColor: theme.border }]} />}
                    {(title || showCloseBtn) && (
                        <View style={[styles.header, { borderBottomColor: theme.border }]}>
                            <Text style={styles.headerTitle}>{title || ''}</Text>
                            {showCloseBtn && (
                                <Pressable onPress={close} hitSlop={12}>
                                    <Ionicons name="close" size={22} color={theme.textSecondary} />
                                </Pressable>
                            )}
                        </View>
                    )}
                </View>

                {/* Content with automatic bottom padding for Safe Area */}
                <View style={[styles.content, { paddingBottom: insets.bottom + Spacing.md }]}>
                    {children}
                </View>
            </Animated.View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.6)' },
    sheet: {
        position: 'absolute',
        bottom: 0, left: 0, right: 0,
        borderTopLeftRadius: 28, borderTopRightRadius: 28,
        overflow: 'hidden'
    },
    handleArea: { paddingTop: Spacing.sm },
    handle: { width: 36, height: 4, borderRadius: 2, alignSelf: 'center', marginBottom: Spacing.sm },
    header: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, borderBottomWidth: 0.5,
    },
    headerTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: '#fff' },
    content: { flex: 1, paddingHorizontal: Spacing.lg, paddingTop: Spacing.md },
});