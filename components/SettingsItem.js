import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors, FontSize, FontWeight, Radius, Spacing } from '../constants/theme';

const theme = Colors.dark;

/**
 * A unified row for settings and action lists.
 */
export function SettingsRow({
    icon,
    label,
    subtitle,
    onPress,
    destructive,
    rightElement,
    isLast
}) {
    return (
        /* Wrapped in a fragment to provide a single parent for JSX */
        <>
            <TouchableOpacity
                style={styles.row}
                onPress={onPress}
                activeOpacity={0.7}
            >
                <View style={styles.rowIcon}>
                    <Ionicons
                        name={icon}
                        size={20}
                        color={destructive ? '#EF4444' : theme.text}
                    />
                </View>
                <View style={styles.rowContent}>
                    <Text style={[styles.rowLabel, { color: destructive ? '#EF4444' : theme.text }]}>
                        {label}
                    </Text>
                    {subtitle && <Text style={styles.rowSubtitle}>{subtitle}</Text>}
                </View>

                {/* Show custom element or default chevron */}
                <View style={styles.rightContent}>
                    {rightElement || (
                        <Ionicons name="chevron-forward" size={16} color={theme.textSecondary} />
                    )}
                </View>
            </TouchableOpacity>

            {!isLast && <View style={styles.divider} />}
        </>
    );
}

/**
 * Small uppercase header for grouping settings sections.
 */
export function SectionHeader({ title }) {
    return <Text style={styles.sectionHeader}>{title}</Text>;
}

/**
 * A container card that wraps multiple SettingsRows.
 */
export function SettingsCard({ children }) {
    return (
        <View style={[styles.card, { backgroundColor: theme.elevated }]}>
            {children}
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        borderRadius: Radius.lg,
        overflow: 'hidden',
        marginBottom: Spacing.md,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: Spacing.lg,
        gap: Spacing.md,
    },
    rowIcon: {
        width: 24,
        height: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    rowContent: { flex: 1 },
    rightContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8
    },
    rowLabel: {
        fontSize: FontSize.md,
        fontWeight: FontWeight.medium
    },
    rowSubtitle: {
        fontSize: 12,
        color: theme.textSecondary,
        marginTop: 2
    },
    divider: {
        height: 0.5,
        backgroundColor: theme.border,
        marginLeft: 64 // Matches icon width + gap to align with text
    },
    sectionHeader: {
        fontSize: 12, // Slightly larger looks better in sentence case
        fontWeight: FontWeight.bold,
        color: theme.textSecondary,
        letterSpacing: 0.3, // Reduced from 1.2 for better readability
        marginBottom: Spacing.xs,
        marginTop: Spacing.sm,
        marginLeft: 4,
    },
});