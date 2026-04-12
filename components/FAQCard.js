/**
 * FAQCard.js
 *
 * Expandable accordion card for FAQ items.
 *
 * Usage:
 *   import FAQCard from '../components/FAQCard';
 *   <FAQCard question="..." answer="..." />
 */

import { Ionicons } from '@expo/vector-icons';
import { useRef, useState } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors, FontSize, FontWeight, Spacing } from '../constants/theme';

const theme = Colors.dark;

export default function FAQCard({ question, answer }) {
    const [expanded, setExpanded] = useState(false);
    const animHeight = useRef(new Animated.Value(0)).current;
    const animOpacity = useRef(new Animated.Value(0)).current;
    const animRotate = useRef(new Animated.Value(0)).current;

    const toggle = () => {
        const toValue = expanded ? 0 : 1;
        Animated.parallel([
            Animated.spring(animHeight, {
                toValue, damping: 20, stiffness: 200, useNativeDriver: false,
            }),
            Animated.timing(animOpacity, {
                toValue, duration: 200, useNativeDriver: false,
            }),
            Animated.spring(animRotate, {
                toValue, damping: 20, stiffness: 200, useNativeDriver: false,
            }),
        ]).start();
        setExpanded(e => !e);
    };

    const rotate = animRotate.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '180deg'],
    });

    // Estimate max height based on answer length — generous enough for any answer
    const maxHeight = animHeight.interpolate({
        inputRange: [0, 1],
        outputRange: [0, Math.max(80, answer.length * 0.6)],
    });

    return (
        <TouchableOpacity
            style={[styles.card, expanded && styles.cardExpanded]}
            onPress={toggle}
            activeOpacity={0.85}
        >
            {/* Question row */}
            <View style={styles.questionRow}>
                <Text style={styles.question}>{question}</Text>
                <Animated.View style={{ transform: [{ rotate }] }}>
                    <Ionicons name="chevron-down" size={16} color={theme.textSecondary} />
                </Animated.View>
            </View>

            {/* Answer — animated expand */}
            <Animated.View style={{ maxHeight, overflow: 'hidden', opacity: animOpacity }}>
                <View style={styles.divider} />
                <Text style={styles.answer}>{answer}</Text>
            </Animated.View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: Colors.dark.elevated,
        borderRadius: 14,
        padding: Spacing.lg,
        marginBottom: Spacing.sm,
    },
    cardExpanded: {
        // Subtle border highlight when open
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    questionRow: {
        flexDirection: 'row', alignItems: 'center',
        justifyContent: 'space-between', gap: Spacing.md,
    },
    question: {
        flex: 1,
        fontSize: FontSize.md, fontWeight: FontWeight.semibold,
        color: '#fff', lineHeight: 22,
    },
    divider: {
        height: StyleSheet.hairlineWidth,
        backgroundColor: 'rgba(255,255,255,0.08)',
        marginVertical: Spacing.sm,
    },
    answer: {
        fontSize: FontSize.sm, color: Colors.dark.textSecondary,
        lineHeight: 20, paddingBottom: Spacing.xs,
    },
});