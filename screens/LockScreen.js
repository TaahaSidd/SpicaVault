/**
 * LockScreen.js
 *
 * Shown whenever the app locks (cold start or background > 30s).
 * Flow:
 *   1. On mount → try biometric automatically (if enabled + available)
 *   2. If biometric fails / cancelled / not available → show PIN keypad
 *   3. Correct PIN → call onUnlock()
 */

import { Ionicons } from '@expo/vector-icons';
import * as LocalAuthentication from 'expo-local-authentication';
import { useEffect, useRef, useState } from 'react';
import {
    Animated, Easing, StatusBar, StyleSheet,
    Text, TouchableOpacity, View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Brand, Colors, FontSize, FontWeight, Spacing } from '../constants/theme';
import { getBiometricEnabled, getPin } from '../utils/SecureSettings';

const theme = Colors.dark;
const PIN_LENGTH = 4;

function PinDots({ pin, shake }) {
    return (
        <Animated.View style={[styles.dotsRow, { transform: [{ translateX: shake }] }]}>
            {Array.from({ length: PIN_LENGTH }).map((_, i) => (
                <View
                    key={i}
                    style={[
                        styles.dot,
                        { backgroundColor: i < pin.length ? Brand.primary : theme.elevated },
                    ]}
                />
            ))}
        </Animated.View>
    );
}

function Keypad({ onPress, onDelete }) {
    const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '⌫'];
    return (
        <View style={styles.keypad}>
            {keys.map((key, i) => (
                <TouchableOpacity
                    key={i}
                    style={[styles.key, { backgroundColor: key === '' ? 'transparent' : theme.elevated }]}
                    onPress={() => { if (key === '⌫') onDelete(); else if (key) onPress(key); }}
                    activeOpacity={key === '' ? 1 : 0.6}
                    disabled={key === ''}
                >
                    <Text style={[styles.keyText, { color: key === '⌫' ? Brand.primary : '#fff' }]}>
                        {key}
                    </Text>
                </TouchableOpacity>
            ))}
        </View>
    );
}

export default function LockScreen({ onUnlock }) {
    const [pin, setPin] = useState('');
    const [error, setError] = useState('');
    const [showPin, setShowPin] = useState(false);
    const [bioAvailable, setBioAvailable] = useState(false);
    const shakeAnim = useRef(new Animated.Value(0)).current;
    // Prevent double-firing biometric on strict mode
    const bioAttempted = useRef(false);

    useEffect(() => {
        initLock();
    }, []);

    async function initLock() {
        const [bioEnabled, hasHardware, enrolled] = await Promise.all([
            getBiometricEnabled(),
            LocalAuthentication.hasHardwareAsync(),
            LocalAuthentication.isEnrolledAsync(),
        ]);

        const bioReady = bioEnabled && hasHardware && enrolled;
        setBioAvailable(bioReady);

        if (bioReady && !bioAttempted.current) {
            bioAttempted.current = true;
            await tryBiometric();
        } else {
            // No biometric — go straight to PIN
            setShowPin(true);
        }
    }

    async function tryBiometric() {
        try {
            const result = await LocalAuthentication.authenticateAsync({
                promptMessage: 'Unlock SpicaVault',
                cancelLabel: 'Use PIN',
                disableDeviceFallback: true, // we handle PIN ourselves
            });

            if (result.success) {
                onUnlock();
            } else {
                // User cancelled or failed → show PIN
                setShowPin(true);
            }
        } catch {
            setShowPin(true);
        }
    }

    function shake() {
        shakeAnim.setValue(0);
        Animated.sequence([
            Animated.timing(shakeAnim, { toValue: 10, duration: 60, useNativeDriver: true, easing: Easing.linear }),
            Animated.timing(shakeAnim, { toValue: -10, duration: 60, useNativeDriver: true, easing: Easing.linear }),
            Animated.timing(shakeAnim, { toValue: 6, duration: 60, useNativeDriver: true, easing: Easing.linear }),
            Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true, easing: Easing.linear }),
        ]).start();
    }

    async function handlePress(key) {
        if (pin.length >= PIN_LENGTH) return;
        const next = pin + key;
        setPin(next);
        setError('');

        if (next.length === PIN_LENGTH) {
            setTimeout(() => verifyPin(next), 200);
        }
    }

    function handleDelete() {
        if (pin.length > 0) setPin(p => p.slice(0, -1));
    }

    async function verifyPin(entered) {
        const stored = await getPin();
        if (entered === stored) {
            onUnlock();
        } else {
            setError('Incorrect PIN');
            setPin('');
            shake();
        }
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top', 'bottom']}>
            <StatusBar barStyle="light-content" backgroundColor={theme.background} />

            {/* Logo / App name */}
            <View style={styles.topSection}>
                {/* <View style={styles.logoWrap}>
                    <Ionicons name="lock-closed" size={32} color={Brand.primary} />
                </View> */}
                <Text style={styles.appName}>SpicaVault</Text>
                <Text style={styles.subtitle}>
                    {showPin ? 'Enter your PIN' : 'Authenticating…'}
                </Text>
            </View>

            {/* PIN area — only shown after biometric attempt */}
            {showPin && (
                <View style={styles.pinSection}>
                    <PinDots pin={pin} shake={shakeAnim} />

                    {error
                        ? <Text style={styles.errorText}>{error}</Text>
                        : <View style={{ height: 20 }} />
                    }

                    <Keypad onPress={handlePress} onDelete={handleDelete} />

                    {/* Biometric retry button */}
                    {bioAvailable && (
                        <TouchableOpacity
                            style={styles.bioBtn}
                            onPress={tryBiometric}
                            activeOpacity={0.7}
                        >
                            <Ionicons name="finger-print" size={28} color={Brand.primary} />
                            <Text style={[styles.bioText, { color: Brand.primary }]}>
                                Use biometric
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>
            )}

            {/* Waiting for biometric state */}
            {!showPin && (
                <View style={styles.bioWaiting}>
                    <Ionicons name="finger-print" size={64} color={Brand.primary} style={{ opacity: 0.8 }} />
                    <TouchableOpacity
                        onPress={() => setShowPin(true)}
                        activeOpacity={0.7}
                        style={styles.usePinBtn}
                    >
                        <Text style={[styles.usePinText, { color: theme.textSecondary }]}>Use PIN instead</Text>
                    </TouchableOpacity>
                </View>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    topSection: { alignItems: 'center', paddingTop: 60, gap: 10 },
    logoWrap: {
        width: 72, height: 72, borderRadius: 20,
        backgroundColor: Brand.primary + '18',
        alignItems: 'center', justifyContent: 'center',
        marginBottom: 4,
    },
    appName: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: '#fff' },
    subtitle: { fontSize: FontSize.sm, color: theme.textSecondary },

    pinSection: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 0 },
    dotsRow: { flexDirection: 'row', gap: 16, marginBottom: Spacing.lg },
    dot: { width: 16, height: 16, borderRadius: 8 },
    errorText: { color: '#EF4444', fontSize: FontSize.sm, marginBottom: Spacing.sm },
    keypad: {
        flexDirection: 'row', flexWrap: 'wrap',
        width: 280, gap: 12, justifyContent: 'center', marginTop: Spacing.md,
    },
    key: {
        width: 80, height: 80, borderRadius: 999,
        alignItems: 'center', justifyContent: 'center',
    },
    keyText: { fontSize: 24, fontWeight: FontWeight.semibold },

    bioBtn: { alignItems: 'center', marginTop: 32, gap: 6 },
    bioText: { fontSize: FontSize.sm, fontWeight: FontWeight.medium },

    bioWaiting: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 24 },
    usePinBtn: { padding: Spacing.md },
    usePinText: { fontSize: FontSize.sm },
});