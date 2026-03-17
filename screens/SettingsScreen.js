import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import BottomSheet from '../components/BottomSheet';
import Toast, { useToast } from '../components/Toast';
import { Brand, Colors, FontSize, FontWeight, Radius, Spacing } from '../constants/theme';

const theme = Colors.dark;

function SettingsRow({ icon, iconColor, label, subtitle, onPress, destructive, rightElement }) {
    return (
        <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.7}>
            <View style={[styles.rowIcon, { backgroundColor: (iconColor || Brand.primary) + '15' }]}>
                <Ionicons name={icon} size={18} color={iconColor || Brand.primary} />
            </View>
            <View style={styles.rowContent}>
                <Text style={[styles.rowLabel, { color: destructive ? '#EF4444' : theme.text }]}>
                    {label}
                </Text>
                {subtitle && <Text style={styles.rowSubtitle}>{subtitle}</Text>}
            </View>
            {rightElement || <Ionicons name="chevron-forward" size={16} color={theme.textSecondary} />}
        </TouchableOpacity>
    );
}

function SectionHeader({ title }) {
    return <Text style={styles.sectionHeader}>{title}</Text>;
}

export default function SettingsScreen({ navigation }) {
    const { toast, showInfo, showWarning, hideToast } = useToast();
    const [showClearSheet, setShowClearSheet] = useState(false);

    const comingSoon = (feature) => showInfo('Coming Soon', `${feature} will be available soon.`);

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
            <StatusBar barStyle="light-content" backgroundColor={theme.background} />

            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={[styles.backBtn, { backgroundColor: theme.elevated }]}
                    activeOpacity={0.7}
                >
                    <Ionicons name="chevron-back" size={20} color={theme.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Settings</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

                <SectionHeader title="SECURITY" />
                <View style={[styles.card, { backgroundColor: theme.elevated }]}>
                    <SettingsRow
                        icon="keypad-outline"
                        iconColor={Brand.primary}
                        label="Change PIN"
                        subtitle="Update your vault PIN"
                        onPress={() => navigation.navigate('ChangePIN')}
                    />
                    <View style={styles.divider} />
                    <SettingsRow
                        icon="finger-print-outline"
                        iconColor="#22C55E"
                        label="Biometric Unlock"
                        subtitle="Use fingerprint to open vault"
                        onPress={() => navigation.navigate('Biometric')}
                    />
                    <View style={styles.divider} />
                    <SettingsRow
                        icon="eye-off-outline"
                        iconColor="#3B82F6"
                        label="Stealth Mode"
                        subtitle="Hide app from recent apps"
                        onPress={() => navigation.navigate('StealthMode')}
                    />
                </View>

                <SectionHeader title="STORAGE" />
                <View style={[styles.card, { backgroundColor: theme.elevated }]}>
                    <SettingsRow
                        icon="pie-chart-outline"
                        iconColor="#A855F7"
                        label="Vault Analysis"
                        subtitle="Manage and view storage usage"
                        onPress={() => navigation.navigate('StorageAnalysis')}
                    />
                    <View style={styles.divider} />
                    <SettingsRow
                        icon="folder-outline"
                        iconColor={Brand.accent}
                        label="Vault Location"
                        subtitle="Private app storage"
                        onPress={() => comingSoon('Vault location settings')}
                        rightElement={<Text style={styles.valueText}>Internal</Text>}
                    />
                    <View style={styles.divider} />
                    <SettingsRow
                        icon="trash-outline"
                        iconColor="#EF4444"
                        label="Clear Vault"
                        subtitle="Delete all files permanently"
                        destructive
                        onPress={() => setShowClearSheet(true)}
                    />
                </View>

                <SectionHeader title="ABOUT" />
                <View style={[styles.card, { backgroundColor: theme.elevated }]}>
                    <SettingsRow
                        icon="shield-checkmark-outline"
                        iconColor={Brand.primary}
                        label="Privacy Policy"
                        onPress={() => comingSoon('Privacy Policy')}
                    />
                    <View style={styles.divider} />
                    <SettingsRow
                        icon="document-text-outline"
                        iconColor={theme.textSecondary}
                        label="Terms of Service"
                        onPress={() => comingSoon('Terms of Service')}
                    />
                    <View style={styles.divider} />
                    <SettingsRow
                        icon="information-circle-outline"
                        iconColor={theme.textSecondary}
                        label="Version"
                        onPress={() => { }}
                        rightElement={<Text style={styles.valueText}>1.0.0</Text>}
                    />
                </View>

                <Text style={styles.footer}>Made with 🔒 by Spica Labs</Text>
                <View style={{ height: 40 }} />
            </ScrollView>

            {/* Clear Vault bottom sheet */}
            <BottomSheet
                visible={showClearSheet}
                onClose={() => setShowClearSheet(false)}
                title="Clear Vault"
                snapPoint={0.42}
            >
                <View style={styles.sheetBody}>
                    <View style={[styles.sheetIcon, { backgroundColor: '#EF444415' }]}>
                        <Ionicons name="trash-outline" size={32} color="#EF4444" />
                    </View>
                    <Text style={styles.sheetTitle}>Delete all files?</Text>
                    <Text style={styles.sheetMessage}>
                        This will permanently delete all photos, videos and documents from your vault. This cannot be undone.
                    </Text>
                    <TouchableOpacity
                        style={[styles.sheetBtn, { backgroundColor: '#EF4444' }]}
                        onPress={() => {
                            setShowClearSheet(false);
                            // TODO: wire real delete after dev build
                            showWarning('Cleared', 'All vault files have been deleted.');
                        }}
                        activeOpacity={0.8}
                    >
                        <Text style={[styles.sheetBtnText, { color: '#fff' }]}>Delete All Files</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.sheetBtn, { backgroundColor: theme.overlay }]}
                        onPress={() => setShowClearSheet(false)}
                        activeOpacity={0.7}
                    >
                        <Text style={[styles.sheetBtnText, { color: theme.textSecondary }]}>Cancel</Text>
                    </TouchableOpacity>
                </View>
            </BottomSheet>

            {toast && <Toast {...toast} onHide={hideToast} />}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    scroll: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.sm },
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
        fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: '#fff',
    },
    sectionHeader: {
        fontSize: FontSize.xs, fontWeight: FontWeight.bold,
        color: theme.textSecondary, letterSpacing: 1.5,
        marginBottom: Spacing.sm, marginTop: Spacing.lg, marginLeft: 4,
    },
    card: { borderRadius: Radius.lg, overflow: 'hidden' },
    row: {
        flexDirection: 'row', alignItems: 'center',
        padding: Spacing.lg, gap: Spacing.md,
    },
    rowIcon: {
        width: 36, height: 36, borderRadius: Radius.md,
        alignItems: 'center', justifyContent: 'center',
    },
    rowContent: { flex: 1 },
    rowLabel: { fontSize: FontSize.md, fontWeight: FontWeight.medium },
    rowSubtitle: { fontSize: FontSize.xs, color: theme.textSecondary, marginTop: 2 },
    divider: { height: 0.5, backgroundColor: Colors.dark.border, marginLeft: 64 },
    valueText: { fontSize: FontSize.sm, color: theme.textSecondary, fontWeight: FontWeight.medium },
    footer: { textAlign: 'center', color: theme.textSecondary, fontSize: FontSize.xs, marginTop: Spacing.xl },

    // Sheet
    sheetBody: { alignItems: 'center', gap: Spacing.md },
    sheetIcon: {
        width: 64, height: 64, borderRadius: 999,
        alignItems: 'center', justifyContent: 'center',
    },
    sheetTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: '#fff' },
    sheetMessage: {
        fontSize: FontSize.sm, color: theme.textSecondary,
        textAlign: 'center', lineHeight: 20,
    },
    sheetBtn: {
        width: '100%', paddingVertical: Spacing.md,
        borderRadius: Radius.full, alignItems: 'center',
    },
    sheetBtnText: { fontSize: FontSize.md, fontWeight: FontWeight.semibold },
});