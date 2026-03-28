import { Ionicons } from '@expo/vector-icons';
import { PanResponder, StyleSheet, Text, View } from 'react-native';

const SwipeVerticalBar = ({ icon, value, visible, side, onValueChange }) => {
    if (!visible) return null;

    // Create a local PanResponder to handle taps/drags on the bar itself
    const panResponder = PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onPanResponderMove: (_, gestureState) => {
            // Calculate value based on touch position (0 to 200 height)
            // 0 is bottom (100%), 200 is top (0%) in terms of Y-coord
            const newValue = 1 - (gestureState.y0 + gestureState.dy - styles.vBarContainer.top) / 200;
            onValueChange(Math.min(1, Math.max(0, newValue)));
        },
        onPanResponderGrant: (_, gestureState) => {
            // Handle simple tap
            const newValue = 1 - (gestureState.y0 - 180) / 200; // rough calc for tap
            onValueChange(Math.min(1, Math.max(0, newValue)));
        }
    });

    const displayValue = Math.min(1, Math.max(0, value));
    const percentage = Math.round(displayValue * 100);

    return (
        <View 
            style={[styles.vBarContainer, side === 'left' ? { left: 25 } : { right: 25 }]}
            {...panResponder.panHandlers}
        >
            <View style={styles.vBarTrack}>
                <View
                    style={[
                        styles.vBarFill,
                        { height: `${percentage}%` }
                    ]}
                />
                <View style={styles.vBarIconWrapper}>
                    <Ionicons
                        name={icon}
                        size={18}
                        color={percentage > 20 ? "#000" : "#fff"}
                    />
                </View>
            </View>
            <Text style={styles.vBarLabel}>{percentage}%</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    vBarContainer: {
        position: 'absolute',
        top: '30%', // Made it slightly lower
        height: 180, // Shorter
        width: 36,   // Slimmer
        alignItems: 'center',
        zIndex: 999,
    },
    vBarTrack: {
        width: 32,
        height: 160,
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        borderRadius: 16,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        justifyContent: 'flex-end',
    },
    vBarFill: {
        width: '100%',
        backgroundColor: 'rgba(255, 255, 255, 0.85)',
    },
    vBarIconWrapper: {
        position: 'absolute',
        bottom: 8,
        left: 0,
        right: 0,
        alignItems: 'center',
    },
    vBarLabel: {
        color: '#fff',
        fontSize: 10,
        fontWeight: 'bold',
        marginTop: 6,
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: { width: -1, height: 1 },
        textShadowRadius: 1,
    },
});

export default SwipeVerticalBar;