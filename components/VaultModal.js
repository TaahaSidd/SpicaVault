import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef } from 'react';
import {
    Animated, Modal, Pressable,
    StyleSheet, Text, View,
} from 'react-native';
import { Brand, Colors, FontSize, FontWeight, Radius, Spacing } from '../constants/theme';
import Button from './Button'; // Assuming your Button component is in the same directory

const theme = Colors.dark;

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
    loading = false,       // New: Pass through to Button
    holdToTrigger = false, // New: Pass through to Button
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
                    style={[
                        styles.card,
                        { backgroundColor: theme.elevated, opacity, transform: [{ scale }] }
                    ]}
                    onStartShouldSetResponder={() => true}
                >
                    {/* Icon Section */}
                    {iconConfig && (
                        <View style={[styles.iconWrap, { backgroundColor: iconConfig.color + '15' }]}>
                            <Ionicons name={iconConfig.name} size={28} color={iconConfig.color} />
                        </View>
                    )}

                    {/* Content Section */}
                    {title && <Text style={styles.title}>{title}</Text>}
                    {message && <Text style={styles.message}>{message}</Text>}
                    {children && <View style={styles.customContent}>{children}</View>}

                    {/* Action Section */}
                    {type !== 'custom' && (
                        <View style={styles.btnRow}>
                            {secondaryText && (
                                <Button
                                    title={secondaryText}
                                    variant="secondary"
                                    onPress={onSecondary || onClose}
                                    disabled={loading}
                                />
                            )}
                            <Button
                                title={primaryText}
                                variant={primaryDestructive ? 'danger' : 'primary'}
                                onPress={onPrimary}
                                loading={loading}
                                holdToTrigger={holdToTrigger}
                                // If no secondary text, make the primary button fit content rather than flex
                                fullWidth={true}
                            />
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
        gap: Spacing.xs,
    },
    iconWrap: {
        width: 60,
        height: 60,
        borderRadius: 999,
        alignItems: 'center',
        justifyContent: 'center',
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
        paddingHorizontal: Spacing.sm,
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
});