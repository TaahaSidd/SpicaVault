import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
    Alert, ScrollView, StatusBar, StyleSheet,
    Text, TextInput, TouchableOpacity, View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Brand, Colors, FontSize, FontWeight, Radius, Spacing } from '../constants/theme';

const theme = Colors.dark;

// Preset disguises — icon + name bundled
const PRESETS = [
    { id: 'calculator', icon: 'calculator-outline', name: 'Calculator', color: '#6366F1' },
    { id: 'notes', icon: 'document-text-outline', name: 'Notes', color: '#F59E0B' },
    { id: 'clock', icon: 'time-outline', name: 'Clock', color: '#22C55E' },
    { id: 'files', icon: 'folder-outline', name: 'File Manager', color: '#3B82F6' },
    { id: 'weather', icon: 'partly-sunny-outline', name: 'Weather', color: '#06B6D4' },
    { id: 'calendar', icon: 'calendar-outline', name: 'Calendar', color: '#EF4444' },
    { id: 'music', icon: 'musical-notes-outline', name: 'Music', color: '#EC4899' },
    { id: 'custom', icon: 'create-outline', name: 'Custom', color: theme.textSecondary },
];

export default function StealthModeScreen({ navigation }) {
    const [enabled, setEnabled] = useState(false);
    const [selectedPreset, setSelectedPreset] = useState(null);
    const [customName, setCustomName] = useState('');
    const [customIcon, setCustomIcon] = useState('apps-outline');

    const isCustom = selectedPreset === 'custom';
    const currentPreset = PRESETS.find(p => p.id === selectedPreset);

    const handleSave = () => {
        if (!selectedPreset) {
            Alert.alert('Select a disguise', 'Please choose a preset or custom disguise first.');
            return;
        }
        if (isCustom && !customName.trim()) {
            Alert.alert('Enter a name', 'Please enter a custom app name.');
            return;
        }
        // TODO: save to SecureStore + change launcher icon after dev build
        Alert.alert(
            'Stealth Mode Saved',
            `App will appear as "${isCustom ? customName : currentPreset?.name}" on your home screen.`,
            [{ text: 'OK' }]
        );
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
                <Text style={styles.headerTitle}>Stealth Mode</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

                {/* Toggle card */}
                <View style={[styles.toggleCard, { backgroundColor: theme.elevated }]}>
                    <View style={styles.toggleLeft}>
                        <View style={[styles.toggleIcon, { backgroundColor: '#3B82F615' }]}>
                            <Ionicons name="eye-off-outline" size={20} color="#3B82F6" />
                        </View>
                        <View>
                            <Text style={styles.toggleLabel}>Enable Stealth Mode</Text>
                            <Text style={styles.toggleSub}>Hide SpicaVault behind a fake app</Text>
                        </View>
                    </View>
                    <TouchableOpacity
                        style={[styles.toggle, { backgroundColor: enabled ? Brand.primary : theme.border }]}
                        onPress={() => setEnabled(!enabled)}
                        activeOpacity={0.8}
                    >
                        <View style={[styles.toggleThumb, { transform: [{ translateX: enabled ? 20 : 2 }] }]} />
                    </TouchableOpacity>
                </View>

                {/* Info */}
                <View style={[styles.infoCard, { backgroundColor: '#3B82F610', borderColor: '#3B82F630' }]}>
                    <Ionicons name="information-circle-outline" size={16} color="#3B82F6" />
                    <Text style={[styles.infoText, { color: '#3B82F6' }]}>
                        When enabled, your app icon and name will change on the home screen. Tapping it will open straight to the PIN screen.
                    </Text>
                </View>

                {/* Preset grid */}
                <Text style={styles.sectionLabel}>CHOOSE DISGUISE</Text>
                <View style={styles.presetGrid}>
                    {PRESETS.map((preset) => {
                        const isSelected = selectedPreset === preset.id;
                        return (
                            <TouchableOpacity
                                key={preset.id}
                                style={[
                                    styles.presetCard,
                                    { backgroundColor: theme.elevated },
                                    isSelected && { borderColor: preset.color, borderWidth: 2 }
                                ]}
                                onPress={() => setSelectedPreset(preset.id)}
                                activeOpacity={0.7}
                            >
                                <View style={[styles.presetIcon, { backgroundColor: preset.color + '20' }]}>
                                    <Ionicons name={preset.icon} size={26} color={preset.color} />
                                </View>
                                <Text style={[styles.presetName, { color: isSelected ? preset.color : theme.textSecondary }]}>
                                    {preset.name}
                                </Text>
                                {isSelected && (
                                    <View style={[styles.selectedBadge, { backgroundColor: preset.color }]}>
                                        <Ionicons name="checkmark" size={10} color="#fff" />
                                    </View>
                                )}
                            </TouchableOpacity>
                        );
                    })}
                </View>

                {/* Custom fields */}
                {isCustom && (
                    <View style={styles.customSection}>
                        <Text style={styles.sectionLabel}>CUSTOM NAME</Text>
                        <View style={[styles.inputWrap, { backgroundColor: theme.elevated }]}>
                            <Ionicons name="text-outline" size={18} color={theme.textSecondary} />
                            <TextInput
                                style={[styles.input, { color: '#fff' }]}
                                placeholder="e.g. My Notes"
                                placeholderTextColor={theme.textSecondary}
                                value={customName}
                                onChangeText={setCustomName}
                                maxLength={20}
                            />
                            <Text style={styles.charCount}>{customName.length}/20</Text>
                        </View>
                    </View>
                )}

                {/* Preview */}
                {selectedPreset && (
                    <View style={styles.previewSection}>
                        <Text style={styles.sectionLabel}>PREVIEW</Text>
                        <View style={[styles.previewCard, { backgroundColor: theme.elevated }]}>
                            <Text style={styles.previewLabel}>Your app will appear as:</Text>
                            <View style={styles.previewApp}>
                                <View style={[styles.previewIcon, {
                                    backgroundColor: (isCustom ? Brand.primary : currentPreset?.color) + '20'
                                }]}>
                                    <Ionicons
                                        name={isCustom ? 'apps-outline' : currentPreset?.icon}
                                        size={32}
                                        color={isCustom ? Brand.primary : currentPreset?.color}
                                    />
                                </View>
                                <Text style={styles.previewName}>
                                    {isCustom ? (customName || 'Custom App') : currentPreset?.name}
                                </Text>
                            </View>
                        </View>
                    </View>
                )}

                {/* Save button */}
                <TouchableOpacity
                    style={[styles.saveBtn, { backgroundColor: Brand.primary, opacity: selectedPreset ? 1 : 0.4 }]}
                    onPress={handleSave}
                    activeOpacity={0.8}
                    disabled={!selectedPreset}
                >
                    <Text style={styles.saveBtnText}>Save Stealth Mode</Text>
                </TouchableOpacity>

                <View style={{ height: 40 }} />
            </ScrollView>
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
        fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: '#fff',
    },
    scroll: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.sm },

    // Toggle
    toggleCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: Spacing.lg,
        borderRadius: Radius.lg,
        marginBottom: Spacing.md,
    },
    toggleLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, flex: 1 },
    toggleIcon: {
        width: 36, height: 36, borderRadius: Radius.md,
        alignItems: 'center', justifyContent: 'center',
    },
    toggleLabel: { fontSize: FontSize.md, fontWeight: FontWeight.medium, color: '#fff' },
    toggleSub: { fontSize: FontSize.xs, color: Colors.dark.textSecondary, marginTop: 2 },
    toggle: {
        width: 46, height: 26, borderRadius: 13,
        justifyContent: 'center',
    },
    toggleThumb: {
        width: 20, height: 20, borderRadius: 10,
        backgroundColor: '#fff',
    },

    // Info
    infoCard: {
        flexDirection: 'row',
        gap: Spacing.sm,
        padding: Spacing.md,
        borderRadius: Radius.md,
        borderWidth: 1,
        marginBottom: Spacing.lg,
        alignItems: 'flex-start',
    },
    infoText: { flex: 1, fontSize: FontSize.xs, lineHeight: 18 },

    // Section label
    sectionLabel: {
        fontSize: FontSize.xs, fontWeight: FontWeight.bold,
        color: Colors.dark.textSecondary, letterSpacing: 1.5,
        marginBottom: Spacing.sm, marginLeft: 4,
    },

    // Preset grid
    presetGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: Spacing.sm,
        marginBottom: Spacing.lg,
    },
    presetCard: {
        width: '22%',
        aspectRatio: 0.85,
        borderRadius: Radius.lg,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        borderWidth: 2,
        borderColor: 'transparent',
        position: 'relative',
    },
    presetIcon: {
        width: 48, height: 48, borderRadius: Radius.md,
        alignItems: 'center', justifyContent: 'center',
    },
    presetName: { fontSize: 10, fontWeight: FontWeight.medium, textAlign: 'center' },
    selectedBadge: {
        position: 'absolute',
        top: 6, right: 6,
        width: 16, height: 16,
        borderRadius: 8,
        alignItems: 'center', justifyContent: 'center',
    },

    // Custom
    customSection: { marginBottom: Spacing.lg },
    inputWrap: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: Spacing.md,
        borderRadius: Radius.lg,
        gap: Spacing.sm,
    },
    input: { flex: 1, fontSize: FontSize.md },
    charCount: { fontSize: FontSize.xs, color: Colors.dark.textSecondary },

    // Preview
    previewSection: { marginBottom: Spacing.lg },
    previewCard: {
        padding: Spacing.lg,
        borderRadius: Radius.lg,
        alignItems: 'center',
        gap: Spacing.md,
    },
    previewLabel: { fontSize: FontSize.xs, color: Colors.dark.textSecondary },
    previewApp: { alignItems: 'center', gap: Spacing.sm },
    previewIcon: {
        width: 64, height: 64, borderRadius: Radius.lg,
        alignItems: 'center', justifyContent: 'center',
    },
    previewName: { fontSize: FontSize.sm, fontWeight: FontWeight.medium, color: '#fff' },

    // Save
    saveBtn: {
        borderRadius: Radius.full,
        paddingVertical: Spacing.md + 2,
        alignItems: 'center',
        marginTop: Spacing.sm,
    },
    saveBtnText: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: '#000' },
});