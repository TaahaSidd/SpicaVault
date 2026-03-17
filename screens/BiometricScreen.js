import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
    StatusBar, StyleSheet, Switch,
    Text, TouchableOpacity, View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Brand, Colors, FontSize, FontWeight, Radius, Spacing } from '../constants/theme';

const theme = Colors.dark;

export default function BiometricScreen({ navigation }) {
    const [biometricEnabled, setBiometricEnabled] = useState(false);
    const [fingerprintEnabled, setFingerprintEnabled] = useState(false);

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
                <Text style={styles.headerTitle}>Biometric</Text>
                <View style={{ width: 40 }} />
            </View>

            {/* Hero */}
            <View style={styles.hero}>
                <View style={[styles.heroIcon, { backgroundColor: '#22C55E15' }]}>
                    <Ionicons name="finger-print" size={56} color="#22C55E" />
                </View>
                <Text style={styles.heroTitle}>Biometric Unlock</Text>
                <Text style={styles.heroSub}>
                    Use your fingerprint or face to unlock SpicaVault instantly — no PIN needed.
                </Text>
            </View>

            {/* Settings */}
            <View style={styles.section}>
                <Text style={styles.sectionLabel}>OPTIONS</Text>
                <View style={[styles.card, { backgroundColor: theme.elevated }]}>
                    {/* Biometric toggle */}
                    <View style={styles.row}>
                        <View style={[styles.rowIcon, { backgroundColor: '#22C55E15' }]}>
                            <Ionicons name="finger-print-outline" size={18} color="#22C55E" />
                        </View>
                        <View style={styles.rowContent}>
                            <Text style={styles.rowLabel}>Enable Biometric</Text>
                            <Text style={styles.rowSub}>Unlock with fingerprint or face</Text>
                        </View>
                        <Switch
                            value={biometricEnabled}
                            onValueChange={setBiometricEnabled}
                            trackColor={{ false: theme.border, true: '#22C55E' }}
                            thumbColor="#fff"
                        />
                    </View>

                    <View style={styles.divider} />

                    {/* Fingerprint toggle */}
                    <View style={[styles.row, !biometricEnabled && { opacity: 0.4 }]}>
                        <View style={[styles.rowIcon, { backgroundColor: Brand.primary + '15' }]}>
                            <Ionicons name="hand-left-outline" size={18} color={Brand.primary} />
                        </View>
                        <View style={styles.rowContent}>
                            <Text style={styles.rowLabel}>Fingerprint</Text>
                            <Text style={styles.rowSub}>Use fingerprint sensor</Text>
                        </View>
                        <Switch
                            value={fingerprintEnabled}
                            onValueChange={setFingerprintEnabled}
                            disabled={!biometricEnabled}
                            trackColor={{ false: theme.border, true: Brand.primary }}
                            thumbColor="#fff"
                        />
                    </View>
                </View>

                <Text style={styles.note}>
                    Biometric data is stored securely on your device and never shared.
                </Text>
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
    hero: {
        alignItems: 'center',
        paddingVertical: Spacing.xxl,
        paddingHorizontal: 40,
        gap: Spacing.md,
    },
    heroIcon: {
        width: 100, height: 100, borderRadius: 999,
        alignItems: 'center', justifyContent: 'center',
        marginBottom: Spacing.sm,
    },
    heroTitle: {
        fontSize: FontSize.xl,
        fontWeight: FontWeight.bold,
        color: '#fff',
    },
    heroSub: {
        fontSize: FontSize.sm,
        color: '#9BA1B4',
        textAlign: 'center',
        lineHeight: 20,
    },
    section: {
        paddingHorizontal: Spacing.lg,
    },
    sectionLabel: {
        fontSize: FontSize.xs,
        fontWeight: FontWeight.bold,
        color: '#9BA1B4',
        letterSpacing: 1.5,
        marginBottom: Spacing.sm,
        marginLeft: 4,
    },
    card: { borderRadius: Radius.lg, overflow: 'hidden' },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: Spacing.lg,
        gap: Spacing.md,
    },
    rowIcon: {
        width: 36, height: 36, borderRadius: Radius.md,
        alignItems: 'center', justifyContent: 'center',
    },
    rowContent: { flex: 1 },
    rowLabel: {
        fontSize: FontSize.md,
        fontWeight: FontWeight.medium,
        color: '#fff',
    },
    rowSub: {
        fontSize: FontSize.xs,
        color: '#9BA1B4',
        marginTop: 2,
    },
    divider: {
        height: 0.5,
        backgroundColor: Colors.dark.border,
        marginLeft: 64,
    },
    note: {
        fontSize: FontSize.xs,
        color: '#9BA1B4',
        textAlign: 'center',
        marginTop: Spacing.lg,
        lineHeight: 18,
    },
});