import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { FontSize, FontWeight, Spacing } from '../constants/theme';

/**
 * PlayerTopBar
 * Props:
 *   title        — string
 *   speed        — number
 *   onBack       — () => void
 *   onSpeedPress — () => void
 */
export default function PlayerTopBar({ title, speed, onBack, onSpeedPress }) {
    return (
        <View style={styles.topBar}>
            <TouchableOpacity style={styles.iconBtn} onPress={onBack}>
                <Ionicons name="chevron-back" size={26} color="#fff" />
            </TouchableOpacity>

            <Text style={styles.title} numberOfLines={1}>{title}</Text>

            <TouchableOpacity style={styles.speedBadge} onPress={onSpeedPress}>
                <Text style={styles.speedText}>{speed}×</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    topBar: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spacing.md,
        paddingTop: 16,
        paddingBottom: 10,
        backgroundColor: 'rgba(0,0,0,0.55)',
    },
    iconBtn: {
        width: 40, height: 40,
        justifyContent: 'center', alignItems: 'center',
    },
    title: {
        flex: 1,
        color: '#fff',
        fontSize: FontSize.sm,
        fontWeight: FontWeight.medium,
        paddingHorizontal: 8,
    },
    speedBadge: {
        paddingHorizontal: 10, paddingVertical: 4,
        borderRadius: 6, borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.35)',
    },
    speedText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
});