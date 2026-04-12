import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

export default function SkipIndicator({ label, isForward }) {
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Fade in, then out
        Animated.sequence([
            Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
            Animated.delay(600),
            Animated.timing(fadeAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
        ]).start();
    }, [label]);

    return (
        <View style={[styles.container, isForward ? { alignItems: 'flex-end' } : { alignItems: 'flex-start' }]}>
            <Animated.View style={[styles.bubble, { opacity: fadeAnim }]}>
                <Ionicons
                    name={isForward ? "play-forward" : "play-back"}
                    size={28}
                    color="#fff"
                />
                <Text style={styles.text}>{label}</Text>
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        justifyContent: 'center',
        paddingHorizontal: 40,
        zIndex: 99,
    },
    bubble: {
        backgroundColor: 'rgba(0,0,0,0.5)',
        paddingVertical: 15,
        paddingHorizontal: 20,
        borderRadius: 40,
        alignItems: 'center',
        gap: 4,
    },
    text: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
    },
});