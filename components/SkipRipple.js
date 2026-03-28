import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { FontSize, FontWeight, Spacing } from '../constants/theme';

/**
 * PlayerTopBar
 * The top row of the video player: back button, video title, speed badge.
 *
 * Props:
 *   title        — string, displayed in the center
 *   speed        — number, current playback speed (e.g. 1.0)
 *   onBack       — () => void
 *   onSpeedPress — () => void, toggles the speed menu
 */
export default function PlayerTopBar({ title, speed, onBack, onSpeedPress }) {
    return (
        <View style={styles.topBar}>
            <TouchableOpacity style={styles.iconBtn} onPress={onBack}>
                <Ionicons name="chevron-back" size={26} color="#fff" />
            </TouchableOpacity>

            <Text style={styles.title} numberOfLines={1}>
                {title}
            </Text>

            <TouchableOpacity style={styles.speedBadge} onPress={onSpeedPress}>
                <Text style={styles.speedBadgeText}>{speed}×</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    topBar: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spacing.md,
        paddingTop: 48,
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    iconBtn: {
        width: 44,
        height: 44,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        flex: 1,
        color: '#fff',
        fontSize: FontSize.sm,
        fontWeight: FontWeight.medium,
        paddingHorizontal: 10,
    },
    speedBadge: {
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.3)',
    },
    speedBadgeText: {
        color: '#fff',
        fontSize: 13,
    },
});