import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, FontSize, FontWeight, Radius, Spacing } from '../constants/theme';

const theme = Colors.dark;

const TYPES = {
    success: { icon: 'checkmark-circle', color: '#22C55E' },
    error: { icon: 'close-circle', color: '#EF4444' },
    info: { icon: 'information-circle', color: '#3B82F6' },
    warning: { icon: 'warning', color: '#F59E0B' },
};

export default function Toast({ visible, type = 'success', title, message, onHide }) {
    const insets = useSafeAreaInsets();
    const anim = useRef(new Animated.Value(0)).current;
    const config = TYPES[type] || TYPES.info;

    useEffect(() => {
        if (visible) {
            Animated.spring(anim, {
                toValue: 1, useNativeDriver: true,
                tension: 80, friction: 11,
            }).start();
            const timer = setTimeout(() => {
                Animated.timing(anim, {
                    toValue: 0, duration: 250, useNativeDriver: true,
                }).start(() => onHide?.());
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [visible]);

    if (!visible) return null;

    return (
        <Animated.View style={[
            styles.container,
            { top: insets.top + 12 },
            {
                opacity: anim,
                transform: [{
                    translateY: anim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [-20, 0],
                    })
                }]
            }
        ]}>
            <View style={[styles.toast, { backgroundColor: theme.elevated }]}>
                <Ionicons name={config.icon} size={18} color={config.color} />
                <View style={styles.textWrap}>
                    {title && <Text style={styles.title}>{title}</Text>}
                    {message && <Text style={[styles.message, { color: config.color + 'CC' }]}>{message}</Text>}
                </View>
            </View>
        </Animated.View>
    );
}

// ── useToast hook ─────────────────────────────────────────────────────────────
import { useState } from 'react';

export function useToast() {
    const [toast, setToast] = useState(null);

    const show = (type, title, message) => {
        setToast({ visible: true, type, title, message });
    };

    const hide = () => setToast(null);

    return {
        toast,
        showSuccess: (title, message) => show('success', title, message),
        showError: (title, message) => show('error', title, message),
        showInfo: (title, message) => show('info', title, message),
        showWarning: (title, message) => show('warning', title, message),
        hideToast: hide,
    };
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        alignSelf: 'center',
        zIndex: 999,
    },
    toast: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: Radius.full,
        paddingVertical: Spacing.sm + 2,
        paddingHorizontal: Spacing.lg,
        gap: Spacing.sm,
        elevation: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    textWrap: { flexShrink: 1 },
    title: {
        fontSize: FontSize.sm,
        fontWeight: FontWeight.bold,
        color: '#fff',
    },
    message: {
        fontSize: FontSize.xs,
        marginTop: 1,
    },
});