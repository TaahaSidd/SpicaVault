import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef } from 'react';
import {
    Animated, Modal, Pressable,
    StyleSheet, Text, TouchableOpacity, View,
} from 'react-native';
import { Brand, Colors, FontSize, FontWeight, Radius, Spacing } from '../constants/theme';

const theme = Colors.dark;

/**
 * VaultModal — general purpose modal
 *
 * Usage:
 * <VaultModal
 *   visible={show}
 *   type="confirm"           // confirm | alert | custom
 *   title="Delete File"
 *   message="This cannot be undone."
 *   primaryText="Delete"
 *   secondaryText="Cancel"
 *   primaryDestructive       // makes primary button red
 *   onPrimary={() => {}}
 *   onSecondary={() => {}}
 *   onClose={() => setShow(false)}
 * >
 *   // optional custom content for type="custom"
 * </VaultModal>
 */

const ICONS = {
    delete: { name: 'trash-outline', color: '#EF4444' },
    warning: { name: 'warning-outline', color: '#F59E0B' },
    success: { name: 'checkmark-circle-outline', color: '#22C55E' },
    info: { name: 'information-circle-outline', color: '#3B82F6' },
    lock: { name: 'lock-closed-outline', color: Brand.primary },
};

export default function VaultModal({
    visible,
    type = 'confirm',
    icon,
    title,
    message,
    primaryText = 'Confirm',
    secondaryText = 'Cancel',
    primaryDestructive = false,
    onPrimary,
    onSecondary,
    onClose,
    children,
}) {
    const scale = useRef(new Animated.Value(0.9)).current;
    const opacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (visible) {
            Animated.parallel([
                Animated.spring(scale, {
                    toValue: 1, useNativeDriver: true,
                    tension: 80, friction: 10,
                }),
                Animated.timing(opacity, {
                    toValue: 1, duration: 180, useNativeDriver: true,
                }),
            ]).start();
        } else {
            scale.setValue(0.9);
            opacity.setValue(0);
        }
    }, [visible]);

    const iconConfig = icon ? ICONS[icon] : null;

    return (
        <Modal
            transparent
            visible={visible}
            animationType="none"
            onRequestClose={onClose}
        >
            <Pressable style={styles.overlay} onPress={onClose}>
                <Animated.View
                    style={[styles.card, { backgroundColor: theme.elevated, opacity, transform: [{ scale }] }]}
                    onStartShouldSetResponder={() => true}
                >
                    {/* Icon */}
                    {iconConfig && (
                        <View style={[styles.iconWrap, { backgroundColor: iconConfig.color + '15' }]}>
                            <Ionicons name={iconConfig.name} size={28} color={iconConfig.color} />
                        </View>
                    )}

                    {/* Title */}
                    {title && <Text style={styles.title}>{title}</Text>}

                    {/* Message */}
                    {message && <Text style={styles.message}>{message}</Text>}

                    {/* Custom content */}
                    {children && <View style={styles.customContent}>{children}</View>}

                    {/* Buttons */}
                    {type !== 'custom' && (
                        <View style={styles.btnRow}>
                            {secondaryText && (
                                <TouchableOpacity
                                    style={[styles.btn, { backgroundColor: theme.overlay }]}
                                    onPress={onSecondary || onClose}
                                    activeOpacity={0.7}
                                >
                                    <Text style={[styles.btnText, { color: theme.textSecondary }]}>
                                        {secondaryText}
                                    </Text>
                                </TouchableOpacity>
                            )}
                            <TouchableOpacity
                                style={[styles.btn, {
                                    backgroundColor: primaryDestructive ? '#EF4444' : Brand.primary,
                                    flex: secondaryText ? 1 : undefined,
                                    paddingHorizontal: secondaryText ? undefined : Spacing.xxl,
                                }]}
                                onPress={onPrimary}
                                activeOpacity={0.8}
                            >
                                <Text style={[styles.btnText, {
                                    color: primaryDestructive ? '#fff' : '#000',
                                    fontWeight: FontWeight.bold,
                                }]}>
                                    {primaryText}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </Animated.View>
            </Pressable>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.65)',
        alignItems: 'center',
        justifyContent: 'center',
        padding: Spacing.xl,
    },
    card: {
        width: '100%',
        borderRadius: Radius.xl,
        padding: Spacing.xl,
        alignItems: 'center',
        gap: Spacing.sm,
    },
    iconWrap: {
        width: 60, height: 60, borderRadius: 999,
        alignItems: 'center', justifyContent: 'center',
        marginBottom: Spacing.sm,
    },
    title: {
        fontSize: FontSize.lg,
        fontWeight: FontWeight.bold,
        color: '#fff',
        textAlign: 'center',
    },
    message: {
        fontSize: FontSize.sm,
        color: Colors.dark.textSecondary,
        textAlign: 'center',
        lineHeight: 20,
    },
    customContent: {
        width: '100%',
        marginTop: Spacing.sm,
    },
    btnRow: {
        flexDirection: 'row',
        gap: Spacing.sm,
        marginTop: Spacing.md,
        width: '100%',
    },
    btn: {
        flex: 1,
        paddingVertical: Spacing.md,
        borderRadius: Radius.full,
        alignItems: 'center',
    },
    btnText: {
        fontSize: FontSize.md,
        fontWeight: FontWeight.semibold,
    },
});