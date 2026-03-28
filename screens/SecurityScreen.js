import { Ionicons } from '@expo/vector-icons';
import * as LocalAuthentication from 'expo-local-authentication';
import { useEffect, useRef, useState } from 'react';
import {
    Animated, Easing, ScrollView, StatusBar, StyleSheet,
    Switch, Text, TouchableOpacity, View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import InfoBox from '../components/InfoBox';
import { Brand, Colors, FontSize, FontWeight, Radius, Spacing } from '../constants/theme';
import {
    clearPin,
    getBiometricEnabled,
    getPin,
    getPinEnabled,
    setBiometricEnabled,
    setPin,
} from '../utils/SecureSettings';

const theme = Colors.dark;
const PIN_LENGTH = 4;

// ─── Pin Dots ─────────────────────────────────────────────────────────────────
function PinDots({ pin, shake }) {
    return (
        <Animated.View style={[styles.dotsRow, { transform: [{ translateX: shake }] }]}>
            {Array.from({ length: PIN_LENGTH }).map((_, i) => (
                <View
                    key={i}
                    style={[
                        styles.dot,
                        // Active dots use Brand.primary (Amber)
                        { backgroundColor: i < pin.length ? Brand.primary : theme.border },
                    ]}
                />
            ))}
        </Animated.View>
    );
}

// ─── Keypad ───────────────────────────────────────────────────────────────────
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
                    <Text style={[styles.keyText, { color: '#fff' }]}>
                        {key}
                    </Text>
                </TouchableOpacity>
            ))}
        </View>
    );
}

// ─── Inline PIN flow ──────────────────────────────────────────────────────────
function PinFlow({ mode, onSuccess, onCancel }) {
    const firstStep = mode === 'change' || mode === 'disable' ? 'current' : 'new';
    const [step, setStep] = useState(firstStep);
    const [current, setCurrent] = useState('');
    const [newPin, setNewPin] = useState('');
    const [confirm, setConfirm] = useState('');
    const [error, setError] = useState('');
    const shakeAnim = useRef(new Animated.Value(0)).current;

    const stepLabels = {
        current: 'Enter current PIN',
        new: mode === 'change' ? 'Enter new PIN' : 'Set a PIN',
        confirm: 'Confirm PIN',
    };

    const activePin = step === 'current' ? current : step === 'new' ? newPin : confirm;
    const setter = step === 'current' ? setCurrent : step === 'new' ? setNewPin : setConfirm;

    function shake() {
        shakeAnim.setValue(0);
        Animated.sequence([
            Animated.timing(shakeAnim, { toValue: 10, duration: 60, useNativeDriver: true, easing: Easing.linear }),
            Animated.timing(shakeAnim, { toValue: -10, duration: 60, useNativeDriver: true, easing: Easing.linear }),
            Animated.timing(shakeAnim, { toValue: 6, duration: 60, useNativeDriver: true, easing: Easing.linear }),
            Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true, easing: Easing.linear }),
        ]).start();
    }

    function handlePress(key) {
        if (activePin.length >= PIN_LENGTH) return;
        const next = activePin + key;
        setter(next);
        setError('');
        if (next.length === PIN_LENGTH) setTimeout(() => handleComplete(next), 200);
    }

    function handleDelete() {
        if (activePin.length > 0) setter(activePin.slice(0, -1));
    }

    async function handleComplete(pin) {
        if (step === 'current') {
            const stored = await getPin();
            if (pin !== stored) {
                setError('Incorrect PIN');
                setCurrent('');
                shake();
                return;
            }
            if (mode === 'disable') { onSuccess(); return; }
            setStep('new');
        } else if (step === 'new') {
            setStep('confirm');
        } else {
            if (pin !== newPin) {
                setError("PINs don't match");
                setNewPin('');
                setConfirm('');
                setStep('new');
                shake();
                return;
            }
            await setPin(pin);
            onSuccess();
        }
    }

    const steps = mode === 'set' ? ['new', 'confirm'] : ['current', 'new', 'confirm'];
    const stepIndex = steps.indexOf(step);

    return (
        <View style={styles.pinFlow}>
            <View style={styles.flowStepRow}>
                {steps.map((s, i) => (
                    <View key={s} style={[
                        styles.flowStepDot,
                        { backgroundColor: i <= stepIndex ? Brand.primary : theme.border },
                    ]} />
                ))}
            </View>

            <Text style={styles.pinFlowLabel}>{stepLabels[step]}</Text>
            <PinDots pin={activePin} shake={shakeAnim} />

            {error ? <Text style={styles.errorText}>{error}</Text> : <View style={{ height: 20 }} />}

            <Keypad onPress={handlePress} onDelete={handleDelete} />

            <TouchableOpacity onPress={onCancel} style={styles.cancelBtn} activeOpacity={0.7}>
                <Text style={[styles.cancelText, { color: theme.textSecondary }]}>Cancel</Text>
            </TouchableOpacity>
        </View>
    );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function SecurityScreen({ navigation }) {
    const [pinEnabled, setPinEnabled] = useState(false);
    const [biometricEnabled, setBiometricEnabledState] = useState(false);
    const [biometricAvail, setBiometricAvail] = useState(false);
    const [pinFlow, setPinFlow] = useState(null);

    useEffect(() => { loadSettings(); }, []);

    async function loadSettings() {
        const [pin, bio, hasBio] = await Promise.all([
            getPinEnabled(),
            getBiometricEnabled(),
            LocalAuthentication.hasHardwareAsync(),
        ]);
        setPinEnabled(pin);
        setBiometricEnabledState(bio);
        setBiometricAvail(hasBio);
    }

    async function handlePinToggle(val) {
        if (val) {
            setPinFlow('set');
        } else {
            const stored = await getPin();
            if (stored) {
                setPinFlow('disable');
            } else {
                await clearPin();
                await setBiometricEnabled(false);
                setPinEnabled(false);
                setBiometricEnabledState(false);
            }
        }
    }

    async function handlePinFlowSuccess() {
        setPinFlow(null);
        if (pinFlow === 'set' || pinFlow === 'change') {
            setPinEnabled(true);
        } else if (pinFlow === 'disable') {
            await clearPin();
            await setBiometricEnabled(false);
            setPinEnabled(false);
            setBiometricEnabledState(false);
        }
    }

    async function handleBiometricToggle(val) {
        if (val) {
            const result = await LocalAuthentication.authenticateAsync({
                promptMessage: 'Confirm biometric to enable',
                cancelLabel: 'Cancel',
            });
            if (!result.success) return;
        }
        await setBiometricEnabled(val);
        setBiometricEnabledState(val);
    }

    if (pinFlow) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
                <StatusBar barStyle="light-content" backgroundColor={theme.background} />
                <View style={styles.header}>
                    <TouchableOpacity
                        onPress={() => setPinFlow(null)}
                        style={[styles.backBtn, { backgroundColor: theme.elevated }]}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="chevron-back" size={20} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>
                        {pinFlow === 'set' ? 'Set PIN' : pinFlow === 'change' ? 'Change PIN' : 'Disable PIN'}
                    </Text>
                    <View style={{ width: 40 }} />
                </View>
                <PinFlow
                    mode={pinFlow}
                    onSuccess={handlePinFlowSuccess}
                    onCancel={() => setPinFlow(null)}
                />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
            <StatusBar barStyle="light-content" backgroundColor={theme.background} />

            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={[styles.backBtn, { backgroundColor: theme.elevated }]}
                    activeOpacity={0.7}
                >
                    <Ionicons name="chevron-back" size={20} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Security</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>

                <SectionHeader title="PIN LOCK" />
                <View style={[styles.card, { backgroundColor: theme.elevated }]}>
                    <View style={styles.row}>
                        <View style={styles.rowIcon}>
                            <Ionicons name="keypad-outline" size={20} color={theme.text} />
                        </View>
                        <View style={styles.rowContent}>
                            <Text style={styles.rowLabel}>PIN Lock</Text>
                            <Text style={styles.rowSub}>Require PIN to open vault</Text>
                        </View>
                        <Switch
                            value={pinEnabled}
                            onValueChange={handlePinToggle}
                            trackColor={{ false: theme.border, true: Brand.primary + '40' }}
                            thumbColor={pinEnabled ? Brand.primary : '#94A3B8'}
                        />
                    </View>

                    {pinEnabled && (
                        <>
                            <View style={styles.divider} />
                            <TouchableOpacity
                                style={styles.row}
                                onPress={() => setPinFlow('change')}
                                activeOpacity={0.7}
                            >
                                <View style={styles.rowIcon}>
                                    <Ionicons name="create-outline" size={20} color={theme.text} />
                                </View>
                                <View style={styles.rowContent}>
                                    <Text style={styles.rowLabel}>Change PIN</Text>
                                    <Text style={styles.rowSub}>Update your current PIN</Text>
                                </View>
                                <Ionicons name="chevron-forward" size={16} color={theme.textSecondary} />
                            </TouchableOpacity>
                        </>
                    )}
                </View>

                <SectionHeader title="BIOMETRIC" />
                <View style={[styles.card, { backgroundColor: theme.elevated }]}>
                    <View style={[styles.row, (!pinEnabled || !biometricAvail) && { opacity: 0.3 }]}>
                        <View style={styles.rowIcon}>
                            <Ionicons name="finger-print-outline" size={20} color={theme.text} />
                        </View>
                        <View style={styles.rowContent}>
                            <Text style={styles.rowLabel}>Biometric Unlock</Text>
                            <Text style={styles.rowSub}>
                                {!biometricAvail
                                    ? 'Not available on device'
                                    : !pinEnabled
                                        ? 'Enable PIN lock first'
                                        : 'Use fingerprint or face'}
                            </Text>
                        </View>
                        <Switch
                            value={biometricEnabled}
                            onValueChange={handleBiometricToggle}
                            disabled={!pinEnabled || !biometricAvail}
                            trackColor={{ false: theme.border, true: Brand.primary + '40' }}
                            thumbColor={biometricEnabled ? Brand.primary : '#94A3B8'}
                        />
                    </View>
                </View>
                
                <InfoBox
                    message="Biometric data is stored securely on your device. Disabling PIN will also disable biometric unlock."
                />
                <View style={{ height: 40 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

// Utility component for headers
function SectionHeader({ title }) {
    return (
        <Text style={styles.sectionLabel}>{title}</Text>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md,
    },
    backBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
    headerTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: '#fff' },
    content: { paddingHorizontal: Spacing.lg },
    sectionLabel: {
        fontSize: 11, fontWeight: FontWeight.bold,
        color: theme.textSecondary, letterSpacing: 1.2,
        marginBottom: Spacing.xs, marginTop: Spacing.lg, marginLeft: 4,
        textTransform: 'uppercase'
    },
    card: { borderRadius: Radius.lg, overflow: 'hidden' },
    row: {
        flexDirection: 'row', alignItems: 'center',
        padding: Spacing.lg, gap: Spacing.md,
    },
    rowIcon: { width: 24, height: 24, alignItems: 'center', justifyContent: 'center' },
    rowContent: { flex: 1 },
    rowLabel: { fontSize: FontSize.md, fontWeight: FontWeight.medium, color: '#fff' },
    rowSub: { fontSize: 12, color: theme.textSecondary, marginTop: 4 },
    divider: { height: 0.5, backgroundColor: theme.border, marginLeft: 64 },
    note: {
        fontSize: 12, color: theme.textSecondary,
        textAlign: 'center', marginTop: Spacing.xl, lineHeight: 18,
        paddingHorizontal: Spacing.xl, opacity: 0.6
    },

    pinFlow: { flex: 1, alignItems: 'center', paddingTop: Spacing.xl },
    flowStepRow: { flexDirection: 'row', gap: 10, marginBottom: Spacing.xl },
    flowStepDot: { width: 6, height: 6, borderRadius: 3 },
    pinFlowLabel: {
        fontSize: FontSize.lg, fontWeight: FontWeight.semibold,
        color: '#fff', marginBottom: Spacing.xl,
    },
    dotsRow: { flexDirection: 'row', gap: 20, marginBottom: Spacing.lg },
    dot: { width: 14, height: 14, borderRadius: 7 },
    errorText: { color: '#EF4444', fontSize: FontSize.sm, marginBottom: Spacing.sm },
    keypad: {
        flexDirection: 'row', flexWrap: 'wrap',
        width: 280, gap: 12, justifyContent: 'center', marginTop: Spacing.md,
    },
    key: {
        width: 76, height: 76, borderRadius: 38,
        alignItems: 'center', justifyContent: 'center',
    },
    keyText: { fontSize: 28, fontWeight: FontWeight.medium },
    cancelBtn: { marginTop: Spacing.xl, padding: Spacing.md },
    cancelText: { fontSize: FontSize.md },
});