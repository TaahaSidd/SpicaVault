import { useEffect, useRef } from 'react';
import {
    Animated, Modal, StyleSheet,
    Text, TouchableOpacity, TouchableWithoutFeedback, View,
} from 'react-native';
import { Colors, FontSize, Radius, Spacing } from '../constants/theme';

const theme = Colors.dark;

/**
 * DropdownMenu
 * Clean minimal dropdown — no icons, text only.
 * Appears just below the anchor (e.g. three-dot button).
 *
 * Props:
 *   visible    — boolean
 *   onClose    — () => void
 *   anchor     — { x, y, width, height } — position of the trigger button
 *   items      — [{ label: string, onPress: () => void, destructive?: boolean }]
 */
export default function DropdownMenu({ visible, onClose, anchor, items = [] }) {
    const opacity = useRef(new Animated.Value(0)).current;
    const scale = useRef(new Animated.Value(0.95)).current;

    useEffect(() => {
        if (visible) {
            Animated.parallel([
                Animated.timing(opacity, { toValue: 1, duration: 150, useNativeDriver: true }),
                Animated.spring(scale, { toValue: 1, tension: 200, friction: 20, useNativeDriver: true }),
            ]).start();
        } else {
            opacity.setValue(0);
            scale.setValue(0.95);
        }
    }, [visible]);

    if (!visible || !anchor) return null;

    // Position just below and aligned to the right of the anchor
    const top = anchor.y + anchor.height + 4;
    const right = anchor.windowWidth - anchor.x - anchor.width;

    return (
        <Modal transparent visible={visible} animationType="none" onRequestClose={onClose}>
            <TouchableWithoutFeedback onPress={onClose}>
                <View style={StyleSheet.absoluteFill} />
            </TouchableWithoutFeedback>

            <Animated.View
                style={[
                    styles.menu,
                    { top, right, opacity, transform: [{ scale }] },
                ]}
            >
                {items.map((item, index) => (
                    <TouchableOpacity
                        key={item.label}
                        style={[
                            styles.item,
                            index < items.length - 1 && styles.itemBorder,
                        ]}
                        onPress={() => { onClose(); setTimeout(item.onPress, 150); }}
                        activeOpacity={0.6}
                    >
                        <Text style={[styles.itemText, item.destructive && styles.itemDestructive]}>
                            {item.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </Animated.View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    menu: {
        position: 'absolute',
        minWidth: 160,
        backgroundColor: Colors.dark.elevated,
        borderRadius: Radius.md,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 12,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: 'rgba(255,255,255,0.08)',
    },
    item: {
        paddingHorizontal: Spacing.lg,
        paddingVertical: 13,
    },
    itemBorder: {
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: 'rgba(255,255,255,0.07)',
    },
    itemText: {
        color: '#fff',
        fontSize: FontSize.sm,
    },
    itemDestructive: {
        color: '#EF4444',
    },
});