import { useEffect, useState } from 'react';
import {
    ActivityIndicator, ScrollView, StatusBar,
    StyleSheet, Switch, Text, TouchableOpacity, View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Header from '../components/Header';
import { SectionHeader, SettingsCard, SettingsRow } from '../components/SettingsItem';
import Toast, { useToast } from '../components/Toast';
import { Brand, Colors, FontSize, FontWeight, Radius, Spacing } from '../constants/theme';
import { DEFAULT_SETTINGS, getPlayerSettings, savePlayerSettings } from '../utils/VideoPlayerSettings';

const theme = Colors.dark;

const SKIP_OPTIONS = [5, 10, 15, 30];
const SPEED_OPTIONS = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0];

function ChipRow({ options, selected, onSelect, format }) {
    return (
        <View style={styles.chipRow}>
            {options.map(opt => {
                const isSelected = opt === selected;
                return (
                    <TouchableOpacity
                        key={opt}
                        style={[styles.chip, isSelected && styles.chipSelected]}
                        onPress={() => onSelect(opt)}
                        activeOpacity={0.7}
                    >
                        <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                            {format ? format(opt) : opt}
                        </Text>
                    </TouchableOpacity>
                );
            })}
        </View>
    );
}

function ToggleRow({ icon, label, subtitle, value, onToggle, isLast }) {
    return (
        <SettingsRow
            icon={icon}
            label={label}
            subtitle={subtitle}
            isLast={isLast}
            onPress={() => onToggle(!value)}
            rightElement={
                <Switch
                    value={value}
                    onValueChange={onToggle}
                    trackColor={{ false: 'rgba(255,255,255,0.15)', true: Brand.primary }}
                    thumbColor="#fff"
                />
            }
        />
    );
}

export default function VideoPlayerSettingsScreen({ navigation }) {
    const [settings, setSettings] = useState(null);
    const { toast, showSuccess, hideToast } = useToast();

    useEffect(() => { getPlayerSettings().then(setSettings); }, []);

    const update = async (key, value) => {
        const next = { ...settings, [key]: value };
        setSettings(next);
        await savePlayerSettings(next);
        showSuccess('Saved', 'Setting updated.');
    };

    if (!settings) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
                <Header type="subpage" title="Video Player" onBack={() => navigation.goBack()} />
                <ActivityIndicator style={{ marginTop: 40 }} color={Brand.primary} />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
            <StatusBar barStyle="light-content" backgroundColor={theme.background} />
            <Header type="subpage" title="Video Player" onBack={() => navigation.goBack()} />

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

                {/* ── Playback ── */}
                <SectionHeader title="Playback" />
                <SettingsCard>
                    <ToggleRow
                        icon="play-skip-forward-outline"
                        label="Autoplay Next"
                        subtitle="Automatically play the next video when done"
                        value={settings.autoplayNext}
                        onToggle={v => update('autoplayNext', v)}
                    />
                    {/* <ToggleRow
                        icon="time-outline"
                        label="Remember Position"
                        subtitle="Resume from where you left off"
                        value={settings.rememberPosition}
                        onToggle={v => update('rememberPosition', v)}
                        isLast
                    /> */}
                </SettingsCard>

                {/* ── Skip Duration ── */}
                <SectionHeader title="Skip Duration" />
                <SettingsCard>
                    <View style={styles.chipSection}>
                        <Text style={styles.chipLabel}>
                            How many seconds to skip when tapping the skip buttons
                        </Text>
                        <ChipRow
                            options={SKIP_OPTIONS}
                            selected={settings.skipDuration}
                            onSelect={v => update('skipDuration', v)}
                            format={v => `${v}s`}
                        />
                    </View>
                </SettingsCard>

                {/* ── Default Speed ── */}
                <SectionHeader title="Default Speed" />
                <SettingsCard>
                    <View style={styles.chipSection}>
                        <Text style={styles.chipLabel}>
                            Playback speed when opening a video
                        </Text>
                        <ChipRow
                            options={SPEED_OPTIONS}
                            selected={settings.defaultSpeed}
                            onSelect={v => update('defaultSpeed', v)}
                            format={v => `${v}×`}
                        />
                    </View>
                </SettingsCard>

                {/* ── Controls ── */}
                <SectionHeader title="Controls" />
                <SettingsCard>
                    <ToggleRow
                        icon="sunny-outline"
                        label="Brightness Control"
                        subtitle="Show brightness slider in the player"
                        value={settings.brightnessGesture}
                        onToggle={v => update('brightnessGesture', v)}
                    />
                    <ToggleRow
                        icon="volume-medium-outline"
                        label="Volume Control"
                        subtitle="Show volume slider in the player"
                        value={settings.volumeGesture}
                        onToggle={v => update('volumeGesture', v)}
                    />
                    {/* <ToggleRow
                        icon="hand-left-outline"
                        label="Double Tap to Seek"
                        subtitle="Double tap left/right to skip"
                        value={settings.doubleTapSeek}
                        onToggle={v => update('doubleTapSeek', v)}
                        isLast
                    /> */}
                </SettingsCard>

                {/* ── Display ── */}
                {/* <SectionHeader title="Display" />
                <SettingsCard>
                    <ToggleRow
                        icon="sunny-outline"
                        label="Keep Screen On"
                        subtitle="Prevent screen from sleeping during playback"
                        value={settings.keepScreenOn}
                        onToggle={v => update('keepScreenOn', v)}
                        isLast
                    />
                </SettingsCard> */}

                <TouchableOpacity
                    style={styles.resetBtn}
                    onPress={async () => {
                        setSettings(DEFAULT_SETTINGS);
                        await savePlayerSettings(DEFAULT_SETTINGS);
                        showSuccess('Reset', 'Settings restored to defaults.');
                    }}
                    activeOpacity={0.7}
                >
                    <Text style={styles.resetText}>Reset to Defaults</Text>
                </TouchableOpacity>

                <View style={{ height: 40 }} />
            </ScrollView>

            {toast && <Toast {...toast} onHide={hideToast} />}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    scroll: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.sm },
    chipSection: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.md, gap: 12 },
    chipLabel: { color: theme.textSecondary, fontSize: FontSize.sm },
    chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    chip: {
        paddingHorizontal: 16, paddingVertical: 8,
        borderRadius: Radius.full,
        backgroundColor: 'rgba(255,255,255,0.08)',
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)',
    },
    chipSelected: { backgroundColor: Brand.primary, borderColor: Brand.primary },
    chipText: { color: 'rgba(255,255,255,0.6)', fontSize: FontSize.sm, fontWeight: FontWeight.medium },
    chipTextSelected: { color: '#fff', fontWeight: FontWeight.bold },
    resetBtn: {
        marginTop: Spacing.xl, alignSelf: 'center',
        paddingHorizontal: 24, paddingVertical: 10,
        borderRadius: Radius.full, borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.15)',
    },
    resetText: { color: 'rgba(255,255,255,0.5)', fontSize: FontSize.sm },
});