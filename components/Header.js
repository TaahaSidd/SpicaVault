import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Brand, Colors, FontSize, FontWeight, Spacing } from '../constants/theme';

const theme = Colors.dark;

export default function Header({
    type = 'brand',
    title,
    subtitle,
    selectionCount,
    onBack,
    onAction,
    actionText,
    actionIcon,

    // ── Generic Slot Props (For Player/Viewer) ──────────
    left,           // React Component/Icon for the left slot
    center,         // React Component/Text for the center slot
    right,          // React Component/Icons for the right slot
}) {
    const insets = useSafeAreaInsets();

    // 1. BRAND
    if (type === 'brand') {
        return (
            <View style={styles.header}>
                <View style={styles.brandRow}>
                    <Text style={styles.brandTitle}>{title || 'SpicaVault'}</Text>
                    {subtitle && <Text style={styles.headerSubtitle}>{subtitle}</Text>}
                </View>
                {onAction && (
                    <TouchableOpacity onPress={onAction} style={styles.actionBtn} activeOpacity={0.7}>
                        {actionIcon
                            ? <Ionicons name={actionIcon} size={22} color={Brand.primary} />
                            : <Text style={[styles.actionText, { color: Brand.primary }]}>{actionText}</Text>
                        }
                    </TouchableOpacity>
                )}
            </View>
        );
    }

    // 2. SELECTION
    if (type === 'selection') {
        return (
            <View style={styles.selectionHeader}>
                <View style={styles.selectionLeft}>
                    <TouchableOpacity onPress={onBack} style={styles.iconBtn} activeOpacity={0.7}>
                        <Ionicons name="close" size={22} color={theme.text} />
                    </TouchableOpacity>
                    <Text style={styles.selectionCount}>{selectionCount} selected</Text>
                </View>
                <TouchableOpacity onPress={onAction} activeOpacity={0.7}>
                    <Text style={[styles.actionText, { color: Brand.primary }]}>
                        {actionText || 'All'}
                    </Text>
                </TouchableOpacity>
            </View>
        );
    }

    // 3. SUBPAGE
    if (type === 'subpage') {
        return (
            <View style={styles.header}>
                <TouchableOpacity
                    style={[styles.backBtn, { backgroundColor: theme.elevated }]}
                    onPress={onBack}
                    activeOpacity={0.7}
                >
                    <Ionicons name="chevron-back" size={20} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.subpageTitle}>{title}</Text>
                <View style={{ width: 36 }} />
            </View>
        );
    }

    // 4. PLAYER / VIEWER (The "Transparent Overlay" types)
    if (type === 'player' || type === 'viewer') {
        return (
            <View style={[
                styles.overlayHeader,
                { paddingTop: Math.max(insets.top, 12) }
            ]}>
                {/* LEFT SLOT */}
                <View style={styles.slotLeft}>
                    {left || (
                        <TouchableOpacity onPress={onBack} style={styles.iconBtn}>
                            <Ionicons name="chevron-back" size={26} color="#fff" />
                        </TouchableOpacity>
                    )}
                </View>

                {/* CENTER SLOT */}
                <View style={styles.slotCenter}>
                    {center || (
                        <Text style={styles.centerText} numberOfLines={1}>{title}</Text>
                    )}
                </View>

                {/* RIGHT SLOT */}
                <View style={styles.slotRight}>
                    {right}
                </View>
            </View>
        );
    }

    return null;
}

const styles = StyleSheet.create({
    // ── Shared / Brand ──────────────────────────────────────────────────────
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.md,
    },
    iconBtn: {
        width: 44, height: 44,
        alignItems: 'center', justifyContent: 'center',
    },
    actionBtn: { padding: Spacing.xs },
    actionText: { fontSize: FontSize.md, fontWeight: FontWeight.semibold },
    backBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
    brandRow: { flexDirection: 'row', alignItems: 'baseline', gap: Spacing.sm },
    brandTitle: { fontSize: 26, fontWeight: FontWeight.bold, color: Brand.primary, letterSpacing: -0.3 },
    headerSubtitle: { fontSize: FontSize.sm, color: theme.textSecondary },
    subpageTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: '#fff' },

    // ── Selection ────────────────────────────────────────────────────────────
    selectionHeader: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md,
        borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: theme.border,
        backgroundColor: theme.background,
    },
    selectionLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
    selectionCount: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: theme.text },

    // ── Overlay Types (Player/Viewer) ────────────────────────────────────────
    overlayHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spacing.sm,
        paddingBottom: 12,
        //backgroundColor: 'rgba(255, 0, 0, 0.5)',
    },
    slotLeft: {
        flex: 1,
        alignItems: 'flex-start',
        justifyContent: 'center',
    },
    slotCenter: {
        flex: 4, // More room for filenames
        alignItems: 'center',
        justifyContent: 'center',
    },
    slotRight: {
        flex: 2, // Space for multiple icons (Speed, Mute, Menu)
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: 8,
    },
    centerText: {
        color: '#fff',
        fontSize: FontSize.sm,
        fontWeight: FontWeight.medium,
        textAlign: 'center',
    },
});