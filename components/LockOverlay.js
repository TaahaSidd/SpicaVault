import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useRef } from 'react';
import {
    Animated, StyleSheet,
    TouchableOpacity, TouchableWithoutFeedback, View
} from 'react-native';
import { Brand } from '../constants/theme';

const FULL_WIDTH = 150;
const ICON_WIDTH = 44;
const COLLAPSE_DELAY = 800; // ms before collapsing
const FADE_AFTER_COLLAPSE = 300; // ms after collapse before fading out

export default function LockOverlay({ onUnlock }) {
    const textOpacity = useRef(new Animated.Value(1)).current;
    const pillWidth = useRef(new Animated.Value(FULL_WIDTH)).current;
    const pillOpacity = useRef(new Animated.Value(1)).current;
    const collapseTimer = useRef(null);
    const fadeTimer = useRef(null);

    const fadeOut = useCallback(() => {
        Animated.timing(pillOpacity, {
            toValue: 0, duration: 400, useNativeDriver: true,
        }).start();
    }, [pillOpacity]);

    const collapse = useCallback(() => {
        Animated.parallel([
            Animated.timing(textOpacity, {
                toValue: 0, duration: 200, useNativeDriver: true,
            }),
            Animated.spring(pillWidth, {
                toValue: ICON_WIDTH,
                damping: 20, stiffness: 250, useNativeDriver: false,
            }),
        ]).start(() => {
            // Once collapsed to icon → wait then fade entire pill out
            fadeTimer.current = setTimeout(fadeOut, FADE_AFTER_COLLAPSE);
        });
    }, [textOpacity, pillWidth, fadeOut]);

    const expand = useCallback(() => {
        clearTimeout(collapseTimer.current);
        clearTimeout(fadeTimer.current);

        // Snap opacity back first so it reappears instantly
        Animated.timing(pillOpacity, {
            toValue: 1, duration: 150, useNativeDriver: true,
        }).start();

        Animated.parallel([
            Animated.timing(textOpacity, {
                toValue: 1, duration: 300, useNativeDriver: true,
            }),
            Animated.spring(pillWidth, {
                toValue: FULL_WIDTH,
                damping: 20, stiffness: 250, useNativeDriver: false,
            }),
        ]).start();

        // Schedule next collapse
        collapseTimer.current = setTimeout(collapse, COLLAPSE_DELAY);
    }, [textOpacity, pillWidth, pillOpacity, collapse]);

    useEffect(() => {
        collapseTimer.current = setTimeout(collapse, COLLAPSE_DELAY);
        return () => {
            clearTimeout(collapseTimer.current);
            clearTimeout(fadeTimer.current);
        };
    }, [collapse]);

    return (
        <TouchableWithoutFeedback onPress={expand}>
            <View style={StyleSheet.absoluteFill}>
                <View style={styles.pillWrap}>
                    <Animated.View style={{ opacity: pillOpacity }}>
                        <TouchableOpacity onPress={onUnlock} activeOpacity={0.85}>
                            <Animated.View style={[styles.pill, { width: pillWidth }]}>
                                <View style={styles.iconContainer}>
                                    <Ionicons name="lock-closed" size={18} color={Brand.primary} />
                                </View>
                                <Animated.Text
                                    style={[styles.pillText, { opacity: textOpacity }]}
                                    numberOfLines={1}
                                >
                                    Tap to unlock
                                </Animated.Text>
                            </Animated.View>
                        </TouchableOpacity>
                    </Animated.View>
                </View>
            </View>
        </TouchableWithoutFeedback>
    );
}

const styles = StyleSheet.create({
    pillWrap: {
        position: 'absolute', bottom: 80,
        left: 0, right: 0, alignItems: 'center',
    },
    pill: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.85)',
        height: 44, borderRadius: 22,
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)',
        overflow: 'hidden',
    },
    iconContainer: {
        width: 44, height: 44,
        alignItems: 'center', justifyContent: 'center',
    },
    pillText: {
        color: '#fff', fontSize: 14, fontWeight: '600',
        width: 100, marginLeft: 2,
    },
});