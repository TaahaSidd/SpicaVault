import { useEffect, useState } from 'react';
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CalculatorDecoy from '../components/CalculatorDecoy'; // Your new component
import Header from '../components/Header';
import InfoBox from '../components/InfoBox';
import { SectionHeader, SettingsCard, SettingsRow } from '../components/SettingsItem';
import Toast, { useToast } from '../components/Toast';
import { Brand, Colors, FontSize, FontWeight, Radius, Spacing } from '../constants/theme';
import { getCalcCode, getStealthMode, setCalcCode, setStealthMode } from '../utils/SecureSettings';

const theme = Colors.dark;

export default function StealthModeScreen({ navigation }) {
    const [activeMode, setActiveMode] = useState('none');
    const [showSetup, setShowSetup] = useState(false);

    const { toast, showSuccess, hideToast } = useToast();

    useEffect(() => {
        async function loadInitialMode() {
            const savedMode = await getStealthMode();
            setActiveMode(savedMode);
        }
        loadInitialMode();
    }, []);

    const handleModeChange = async (mode) => {
        if (mode === 'calculator') {
            const existingCode = await getCalcCode();
            // If no code is set, force the user to set one first
            if (!existingCode) {
                setShowSetup(true);
                return;
            }
        }

        setActiveMode(mode);
        await setStealthMode(mode);
    };

    const handleSetupComplete = async (newCode) => {
        await setCalcCode(newCode);
        await setStealthMode('calculator');
        setActiveMode('calculator');
        setShowSetup(false);

        showSuccess('Stealth Mode Active', `Unlock code set to: ${newCode}`);
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
            <Header
                type='subpage'
                title="Stealth Mode"
                onBack={() => navigation.goBack()}
            />

            <ScrollView contentContainerStyle={styles.scroll}>
                <InfoBox
                    variant="elevated"
                    message="Stealth mode disguises SpicaVault as a different app or uses a decoy entry to hide your real vault."
                />

                <SectionHeader title="Entry Method" />
                <SettingsCard>
                    <SettingsRow
                        icon="apps-outline"
                        label="None"
                        subtitle="Standard PIN lock screen"
                        rightElement={activeMode === 'none' ? <View style={styles.radioActive} /> : <View style={styles.radio} />}
                        onPress={() => handleModeChange('none')}
                    />
                    <SettingsRow
                        icon="calculator-outline"
                        label="Calculator"
                        subtitle="Disguise as a working calculator"
                        rightElement={activeMode === 'calculator' ? <View style={styles.radioActive} /> : <View style={styles.radio} />}
                        onPress={() => handleModeChange('calculator')}
                    />

                    {/* Option to change code if already in calculator mode */}
                    {activeMode === 'calculator' && (
                        <SettingsRow
                            icon="key-outline"
                            label="Change Calculator Code"
                            onPress={() => setShowSetup(true)}
                        />
                    )}

                    <SettingsRow
                        icon="keypad-outline"
                        label="Decoy PIN"
                        subtitle="Show secondary vault with fake data"
                        isLast={true}
                        rightElement={activeMode === 'decoy' ? <View style={styles.radioActive} /> : <View style={styles.radio} />}
                        onPress={() => handleModeChange('decoy')}
                    />
                </SettingsCard>

                {activeMode === 'calculator' && (
                    <InfoBox
                        message="Entrance: Enter your secret code and press '=' to unlock."
                    />
                )}
            </ScrollView>

            {/* SETUP MODAL */}
            <Modal visible={showSetup} animationType="slide" presentationStyle="fullScreen">
                <View style={{ flex: 1, backgroundColor: theme.background }}>
                    <SafeAreaView style={{ flex: 1 }}>
                        <View style={styles.setupHeader}>
                            <Text style={styles.setupTitle}>Set Unlock Equation</Text>
                            <Text style={styles.setupSub}>Perform a calculation or enter a sequence, then press '=' to set it as your key.</Text>
                        </View>

                        <CalculatorDecoy
                            isSetupMode={true}
                            onUnlock={handleSetupComplete}
                        />

                        <TouchableOpacity
                            style={styles.cancelButton}
                            onPress={() => setShowSetup(false)}
                        >
                            <Text style={styles.cancelText}>Cancel</Text>
                        </TouchableOpacity>
                    </SafeAreaView>
                </View>
            </Modal>

            {toast && (
                <Toast
                    {...toast}
                    onHide={hideToast}
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    scroll: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.xl },
    radio: {
        width: 20,
        height: 20,
        borderRadius: Radius.full,
        borderWidth: 2,
        borderColor: theme.border
    },
    radioActive: {
        width: 20,
        height: 20,
        borderRadius: Radius.full,
        backgroundColor: Brand.primary,
        borderWidth: 4,
        borderColor: '#fff'
    },
    setupHeader: {
        padding: Spacing.xl,
        alignItems: 'center',
    },
    setupTitle: {
        color: theme.text,
        fontSize: FontSize.xl,
        fontWeight: FontWeight.bold,
        marginBottom: Spacing.sm,
    },
    setupSub: {
        color: theme.textSecondary,
        fontSize: FontSize.sm,
        textAlign: 'center',
        paddingHorizontal: Spacing.lg,
    },
    cancelButton: {
        padding: Spacing.lg,
        alignItems: 'center',
    },
    cancelText: {
        color: Brand.danger,
        fontWeight: FontWeight.medium,
    }
});