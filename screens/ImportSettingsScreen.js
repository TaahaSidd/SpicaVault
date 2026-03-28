import { Ionicons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import { useEffect, useState } from 'react';
import {
    ScrollView, StatusBar, StyleSheet, Switch,
    Text,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../components/Header';
import Toast, { useToast } from '../components/Toast';
import { Brand, Colors, FontSize, FontWeight, Radius, Spacing } from '../constants/theme';

const theme = Colors.dark;
const AUTO_REMOVE_KEY = 'sv_auto_remove_originals';

export default function ImportSettingsScreen({ navigation }) {
    const [autoRemove, setAutoRemove] = useState(false);
    const { toast, showSuccess, hideToast } = useToast();

    useEffect(() => { loadSettings(); }, []);

    async function loadSettings() {
        try {
            const val = await SecureStore.getItemAsync(AUTO_REMOVE_KEY);
            setAutoRemove(val === 'true');
        } catch (e) {
            setAutoRemove(false);
        }
    }

    async function toggleAutoRemove(val) {
        setAutoRemove(val);
        await SecureStore.setItemAsync(AUTO_REMOVE_KEY, val ? 'true' : 'false');
        if (val) {
            showSuccess('Enabled', 'Originals will be removed after import.');
        } else {
            showSuccess('Disabled', 'Originals will stay in gallery.');
        }
    }

    return (
        <View style={[styles.screen, { backgroundColor: theme.background }]}>
            <SafeAreaView style={{ flex: 1 }} edges={['top']}>
                <StatusBar barStyle="light-content" backgroundColor={theme.background} />

                {/* Header */}

                <Header
                    type="subpage"
                    title="Import Settings"
                    onBack={() => navigation.goBack()}
                />
                
                {/* <View style={styles.header}>
                    <TouchableOpacity
                        style={[styles.backBtn, { backgroundColor: theme.elevated }]}
                        onPress={() => navigation.goBack()}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="chevron-back" size={20} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Import Settings</Text>
                    <View style={{ width: 40 }} />
                </View> */}

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>

                    <Text style={styles.sectionLabel}>AFTER IMPORT</Text>
                    <View style={[styles.card, { backgroundColor: theme.elevated }]}>
                        <View style={styles.toggleRow}>
                            <View style={styles.iconWrap}>
                                <Ionicons name="trash-outline" size={20} color={theme.text} />
                            </View>
                            <View style={styles.toggleContent}>
                                <Text style={styles.toggleLabel}>Auto-remove originals</Text>
                                <Text style={styles.toggleSub}>
                                    Automatically remove original files from gallery after importing to vault
                                </Text>
                            </View>
                            <Switch
                                value={autoRemove}
                                onValueChange={toggleAutoRemove}
                                // Interactive state uses Brand.primary (Amber)
                                trackColor={{ false: theme.border, true: Brand.primary + '40' }}
                                thumbColor={autoRemove ? Brand.primary : '#94A3B8'}
                            />
                        </View>
                    </View>

                    {/* Info card - Now monochrome elevated style */}
                    <View style={[styles.infoCard, { backgroundColor: theme.elevated, borderColor: theme.border }]}>
                        <Ionicons name="information-circle-outline" size={18} color={theme.textSecondary} />
                        <Text style={[styles.infoText, { color: theme.textSecondary }]}>
                            {autoRemove
                                ? 'Android will show a system confirmation to remove originals after each import. This is a security requirement.'
                                : 'Files are copied to your vault and originals stay in gallery. You can delete them manually anytime.'
                            }
                        </Text>
                    </View>

                    <Text style={styles.sectionLabel}>HOW IT WORKS</Text>
                    <View style={[styles.card, { backgroundColor: theme.elevated }]}>
                        <StepRow
                            num="1"
                            title="Select files"
                            desc="Pick photos or videos from your gallery"
                        />
                        <View style={styles.divider} />
                        <StepRow
                            num="2"
                            title="Copied to vault"
                            desc="Files are moved to private app storage"
                        />
                        <View style={styles.divider} />
                        <StepRow
                            num="3"
                            title={autoRemove ? 'Originals removed' : 'Originals stay'}
                            desc={autoRemove
                                ? 'System asks once to confirm removal'
                                : 'Original files remain in your gallery'
                            }
                        />
                    </View>

                    <View style={{ height: 40 }} />
                </ScrollView>
            </SafeAreaView>

            {toast && <Toast {...toast} onHide={hideToast} />}
        </View>
    );
}

function StepRow({ num, title, desc }) {
    return (
        <View style={styles.stepRow}>
            {/* Step numbers are now monochrome gray/white */}
            <View style={[styles.stepNum, { backgroundColor: theme.border }]}>
                <Text style={[styles.stepNumText, { color: theme.text }]}>{num}</Text>
            </View>
            <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>{title}</Text>
                <Text style={styles.stepDesc}>{desc}</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    screen: { flex: 1 },
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
    toggleRow: {
        flexDirection: 'row', alignItems: 'center',
        padding: Spacing.lg, gap: Spacing.md,
    },
    iconWrap: { width: 24, height: 24, alignItems: 'center', justifyContent: 'center' },
    toggleContent: { flex: 1 },
    toggleLabel: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: '#fff' },
    toggleSub: { fontSize: 12, color: theme.textSecondary, marginTop: 4, lineHeight: 18 },
    infoCard: {
        flexDirection: 'row', gap: Spacing.sm,
        padding: Spacing.md, borderRadius: Radius.lg,
        borderWidth: 1, marginTop: Spacing.md,
        alignItems: 'flex-start',
    },
    infoText: { flex: 1, fontSize: 12, lineHeight: 18 },
    divider: { height: 0.5, backgroundColor: theme.border, marginLeft: 64 },
    stepRow: {
        flexDirection: 'row', alignItems: 'center',
        padding: Spacing.lg, gap: Spacing.md,
    },
    stepNum: {
        width: 28, height: 28, borderRadius: 14,
        alignItems: 'center', justifyContent: 'center',
    },
    stepNumText: { fontSize: 12, fontWeight: FontWeight.bold },
    stepContent: { flex: 1 },
    stepTitle: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: '#fff' },
    stepDesc: { fontSize: 12, color: theme.textSecondary, marginTop: 2 },
});