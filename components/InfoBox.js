import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Colors, FontSize, FontWeight, Radius, Spacing } from '../constants/theme';

const theme = Colors.dark;

export default function InfoBox({ message, variant = 'note', style }) {
    const isElevated = variant === 'elevated';

    return (
        <View style={[
            styles.container, 
            isElevated && styles.elevatedContainer, 
            style
        ]}>
            <Text style={[
                styles.text, 
                isElevated ? styles.textElevated : styles.textNote
            ]}>
                {message}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginTop: Spacing.xl,
        paddingHorizontal: Spacing.lg,
    },
    elevatedContainer: {
        backgroundColor: theme.elevated, // Pure surface color, no accent border
        padding: Spacing.md,
        borderRadius: Radius.md,
        marginTop: Spacing.md,
    },
    text: {
        fontSize: FontSize.sm,
        lineHeight: 20,
    },
    textNote: {
        color: theme.textSecondary,
        textAlign: 'center',
        opacity: 0.5, // Slightly more subtle
        paddingHorizontal: Spacing.xl,
    },
    textElevated: {
        color: theme.textSecondary,
        textAlign: 'left',
        fontWeight: FontWeight.medium,
    }
});