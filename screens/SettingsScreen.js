import { useState } from 'react';
import { ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Local Components
import BottomNavBar from '../components/BottomNavBar';
import BottomSheet from '../components/BottomSheet';
import Button from '../components/Button';
import Header from '../components/Header';
import { SectionHeader, SettingsCard, SettingsRow } from '../components/SettingsItem';
import Toast, { useToast } from '../components/Toast';

// Theme
import { Colors, FontSize, FontWeight, Spacing } from '../constants/theme';

const theme = Colors.dark;

export default function SettingsScreen({ navigation }) {
    const { toast, showInfo, showWarning, hideToast } = useToast();
    const [showClearSheet, setShowClearSheet] = useState(false);

    const handleClearVault = () => {
        setShowClearSheet(false);
        setTimeout(() => {
            showWarning('Cleared', 'Vault has been wiped.');
        }, 300);
    };

    const comingSoon = (feature) => showInfo('Coming Soon', `${feature} will be available soon.`);

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
            <StatusBar barStyle="light-content" backgroundColor={theme.background} />

            <Header type="brand" title="Settings" />

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

                {/* Import Section */}
                <SectionHeader title="Import" />
                <SettingsCard>
                    <SettingsRow
                        icon="cloud-download-outline"
                        label="Import Settings"
                        subtitle="Auto-remove originals & preferences"
                        onPress={() => navigation.navigate('ImportSettings')}
                        isLast={true}
                    />
                </SettingsCard>

                {/* Security Section */}
                <SectionHeader title="Security" />
                <SettingsCard>
                    <SettingsRow
                        icon="shield-checkmark-outline"
                        label="Security"
                        subtitle="PIN, biometric & stealth mode"
                        onPress={() => navigation.navigate('Security')}
                        isLast={true}
                    />
                    <SettingsRow
                        icon="eye-off-outline"
                        label="Stealth Mode"
                        subtitle="Calculator or Decoy PIN"
                        onPress={() => navigation.navigate('StealthMode')}
                        isLast={true}
                    />
                </SettingsCard>

                {/* Storage Section */}
                <SectionHeader title="Storage" />
                <SettingsCard>
                    <SettingsRow
                        icon="pie-chart-outline"
                        label="Vault Analysis"
                        subtitle="Detailed storage breakdown"
                        onPress={() => navigation.navigate('StorageAnalysis')}
                    />
                    <SettingsRow
                        icon="folder-outline"
                        label="Vault Location"
                        subtitle="Private app storage"
                        onPress={() => comingSoon('Vault location')}
                        rightElement={<Text style={styles.valueText}>Internal</Text>}
                    />
                    <SettingsRow
                        icon="trash-outline"
                        label="Clear Vault"
                        subtitle="Delete all files permanently"
                        destructive={true}
                        onPress={() => setShowClearSheet(true)}
                        isLast={true}
                    />
                </SettingsCard>

                {/* About Section */}
                <SectionHeader title="About" />
                <SettingsCard>
                    <SettingsRow
                        icon="document-text-outline"
                        label="Privacy Policy"
                        onPress={() => comingSoon('Privacy Policy')}
                    />
                    <SettingsRow
                        icon="information-circle-outline"
                        label="Version"
                        onPress={() => { }}
                        rightElement={<Text style={styles.valueText}>1.0.0</Text>}
                        isLast={true}
                    />
                </SettingsCard>

                <Text style={styles.footer}>Made with 🔒 by Spica Labs</Text>
                <View style={{ height: 100 }} />
            </ScrollView>

            <BottomNavBar
                active="Settings"
                onNavigate={(screen) => navigation.navigate(screen)}
            />

            {/* Clear Vault Confirmation Sheet */}
            <BottomSheet
                visible={showClearSheet}
                onClose={() => setShowClearSheet(false)}
                title="Clear Vault"
                snapPoint={0.3}
            >
                <View style={styles.sheetBody}>
                    <Text style={styles.sheetTitle}>Delete all files?</Text>
                    <Text style={styles.sheetMessage}>
                        This will permanently delete everything in SpicaVault. This action cannot be reversed.
                    </Text>

                    <View style={styles.sheetActionRow}>
                        <Button
                            title="Cancel"
                            variant="secondary"
                            onPress={() => setShowClearSheet(false)}
                            style={{ flex: 1 }}
                        />
                        <Button
                            title="Clear"
                            variant="danger"
                            onPress={handleClearVault}
                            style={{ flex: 1 }}
                        />
                    </View>
                </View>
            </BottomSheet>

            {toast && <Toast {...toast} onHide={hideToast} />}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    scroll: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.sm },
    valueText: {
        fontSize: FontSize.sm,
        color: theme.textSecondary,
        fontWeight: FontWeight.medium
    },
    footer: {
        textAlign: 'center',
        color: theme.textSecondary,
        fontSize: 10,
        marginTop: Spacing.xl,
        opacity: 0.5
    },
    sheetBody: {
        alignItems: 'center',
        paddingTop: Spacing.sm,
        paddingHorizontal: Spacing.lg, // Added for button spacing
    },
    sheetTitle: {
        fontSize: FontSize.lg,
        fontWeight: FontWeight.bold,
        color: '#fff',
        marginBottom: 8
    },
    sheetMessage: {
        fontSize: FontSize.sm,
        color: theme.textSecondary,
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: 24
    },
    sheetActionRow: {
        flexDirection: 'row',
        width: '100%', // Fixed to fill width
        gap: Spacing.md,
    },
});