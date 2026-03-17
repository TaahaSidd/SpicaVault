import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
    StatusBar, StyleSheet, Text,
    TouchableOpacity, View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Brand, Colors, FontSize, FontWeight, Spacing } from '../constants/theme';

const theme = Colors.dark;
const PIN_LENGTH = 4;

function PinDots({ pin }) {
    return (
        <View style={styles.dotsRow}>
            {Array.from({ length: PIN_LENGTH }).map((_, i) => (
                <View
                    key={i}
                    style={[
                        styles.dot,
                        { backgroundColor: i < pin.length ? Brand.primary : theme.elevated }
                    ]}
                />
            ))}
        </View>
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
                    onPress={() => {
                        if (key === '⌫') onDelete();
                        else if (key !== '') onPress(key);
                    }}
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

export default function ChangePINScreen({ navigation }) {
    const [step, setStep] = useState('current'); // current | new | confirm
    const [currentPin, setCurrentPin] = useState('');
    const [newPin, setNewPin] = useState('');
    const [confirmPin, setConfirmPin] = useState('');
    const [error, setError] = useState('');

    const activePin = step === 'current' ? currentPin : step === 'new' ? newPin : confirmPin;
    const setter = step === 'current' ? setCurrentPin : step === 'new' ? setNewPin : setConfirmPin;

    const stepLabels = {
        current: 'Enter current PIN',
        new: 'Enter new PIN',
        confirm: 'Confirm new PIN',
    };

    const handlePress = (key) => {
        if (activePin.length >= PIN_LENGTH) return;
        const next = activePin + key;
        setter(next);
        setError('');

        if (next.length === PIN_LENGTH) {
            setTimeout(() => handleComplete(next), 200);
        }
    };

    const handleDelete = () => {
        if (activePin.length > 0) setter(activePin.slice(0, -1));
    };

    const handleComplete = (pin) => {
        if (step === 'current') {
            // TODO: validate current PIN
            setStep('new');
        } else if (step === 'new') {
            setStep('confirm');
        } else {
            if (pin === newPin) {
                // TODO: save new PIN
                navigation.goBack();
            } else {
                setError("PINs don't match. Try again.");
                setNewPin('');
                setConfirmPin('');
                setStep('new');
            }
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
            <StatusBar barStyle="light-content" backgroundColor={theme.background} />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={[styles.backBtn, { backgroundColor: theme.elevated }]}
                    activeOpacity={0.7}
                >
                    <Ionicons name="chevron-back" size={20} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Change PIN</Text>
                <View style={{ width: 40 }} />
            </View>

            <View style={styles.body}>
                {/* Step indicator */}
                <View style={styles.stepRow}>
                    {['current', 'new', 'confirm'].map((s, i) => (
                        <View
                            key={s}
                            style={[
                                styles.stepDot,
                                { backgroundColor: s === step ? Brand.primary : theme.elevated }
                            ]}
                        />
                    ))}
                </View>

                <Text style={styles.stepLabel}>{stepLabels[step]}</Text>

                <PinDots pin={activePin} />

                {error ? (
                    <Text style={styles.errorText}>{error}</Text>
                ) : null}

                <Keypad onPress={handlePress} onDelete={handleDelete} />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.md,
    },
    backBtn: {
        width: 40, height: 40, borderRadius: 999,
        alignItems: 'center', justifyContent: 'center',
    },
    headerTitle: {
        fontSize: FontSize.lg,
        fontWeight: FontWeight.bold,
        color: '#fff',
    },
    body: {
        flex: 1,
        alignItems: 'center',
        paddingTop: Spacing.xxl,
    },
    stepRow: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: Spacing.xl,
    },
    stepDot: {
        width: 8, height: 8, borderRadius: 4,
    },
    stepLabel: {
        fontSize: FontSize.lg,
        fontWeight: FontWeight.semibold,
        color: '#fff',
        marginBottom: Spacing.xl,
    },
    dotsRow: {
        flexDirection: 'row',
        gap: 16,
        marginBottom: Spacing.xl,
    },
    dot: {
        width: 16, height: 16, borderRadius: 8,
    },
    errorText: {
        color: '#EF4444',
        fontSize: FontSize.sm,
        marginBottom: Spacing.lg,
    },
    keypad: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        width: 280,
        gap: 12,
        justifyContent: 'center',
        marginTop: Spacing.md,
    },
    key: {
        width: 80, height: 80,
        borderRadius: 999,
        alignItems: 'center',
        justifyContent: 'center',
    },
    keyText: {
        fontSize: 24,
        fontWeight: FontWeight.semibold,
    },
});