/**
 * ImportMediaScreen.js
 *
 * Changes from previous version:
 *  - Reads autoDelete from SecureStore on mount (via secureSettings util)
 *  - Shows the auto-remove badge in the header when enabled
 *  - handleImport now delegates delete logic entirely to VaultContext.importToVault()
 *  - Removed dead handleRemoveOriginals / showRemoveModal flow
 *    (the context handles delete automatically based on the setting)
 */

import { Ionicons } from '@expo/vector-icons';
import * as MediaLibrary from 'expo-media-library';
import { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator, Dimensions, FlatList, Image,
    StatusBar, StyleSheet, Text, TouchableOpacity, View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast, { useToast } from '../components/Toast';
import { Brand, Colors, FontSize, FontWeight, Radius } from '../constants/theme';
import { useVaultStorage } from '../context/VaultContext';
import { getAutoDelete } from '../utils/SecureSettings';

const { width } = Dimensions.get('window');
const TILE = (width - 4) / 3;

export default function ImportMediaScreen({ navigation }) {
    const [assets, setAssets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [importing, setImporting] = useState(false);
    const [hasPermission, setHasPermission] = useState(false);
    const [autoDelete, setAutoDelete] = useState(false);   // ← new

    const { importToVault, getVaultFilenames } = useVaultStorage();
    const { toast, showSuccess, showError, hideToast } = useToast();
    const theme = Colors.dark;

    const selectedCount = assets.filter(a => a.selected).length;

    useEffect(() => {
        requestAndLoad();
        loadAutoDeleteSetting();        // ← new: read setting for badge display
    }, []);

    async function loadAutoDeleteSetting() {
        const val = await getAutoDelete();
        setAutoDelete(val);
    }

    async function requestAndLoad() {
        const { status } = await MediaLibrary.requestPermissionsAsync();
        if (status !== 'granted') {
            setHasPermission(false);
            setLoading(false);
            return;
        }
        setHasPermission(true);
        await loadGallery();
    }

    async function loadGallery() {
        setLoading(true);
        try {
            let allAssets = [];
            let hasNextPage = true;
            let after;

            while (hasNextPage) {
                const result = await MediaLibrary.getAssetsAsync({
                    first: 300,
                    after,
                    mediaType: ['photo', 'video'],
                    sortBy: [MediaLibrary.SortBy.creationTime],
                });
                allAssets = [...allAssets, ...result.assets];
                hasNextPage = result.hasNextPage;
                after = result.endCursor;
            }

            // ✅ Compare by original_name from SQLite — not hashed vault filename
            const vaultedNames = await getVaultFilenames();
            const filtered = allAssets.filter(a => !vaultedNames.has(a.filename));

            setAssets(filtered.map(a => ({
                uri: a.uri, id: a.id,
                mediaType: a.mediaType,
                filename: a.filename,
                selected: false,
            })));
        } catch (e) {
            showError('Error', 'Could not load gallery.');
        } finally {
            setLoading(false);
        }
    }

    const toggleSelect = useCallback((id) => {
        setAssets(prev => prev.map(a => a.id === id ? { ...a, selected: !a.selected } : a));
    }, []);

    async function handleImport() {
        const selected = assets.filter(a => a.selected);
        if (selected.length === 0) return;
        setImporting(true);

        try {
            const { success, failed } = await importToVault(
                selected.map(a => ({
                    uri: a.uri,
                    filename: a.filename,
                    mediaType: a.mediaType,
                    id: a.id,
                }))
            );

            setImporting(false);

            if (failed > 0) {
                showError('Partial Import', `${success} added, ${failed} failed.`);
            } else {
                const msg = autoDelete
                    ? `${success} file${success > 1 ? 's' : ''} secured. Originals removed.`
                    : `${success} file${success > 1 ? 's' : ''} secured. Originals kept in gallery.`;
                showSuccess('Done!', msg);
            }

            // Short delay so user sees the toast, then go back
            setTimeout(() => navigation.goBack(), 1400);
        } catch (e) {
            showError('Import Failed', 'Please try again.');
            setImporting(false);
        }
    }

    const selectAll = () => setAssets(prev => prev.map(a => ({ ...a, selected: true })));
    const clearSelect = () => setAssets(prev => prev.map(a => ({ ...a, selected: false })));

    const renderItem = useCallback(({ item }) => (
        <TouchableOpacity
            style={[styles.tile, item.selected && styles.tileSelected]}
            onPress={() => toggleSelect(item.id)}
            activeOpacity={0.8}
        >
            <Image source={{ uri: item.uri }} style={styles.tileImage} />
            {item.mediaType === 'video' && (
                <View style={styles.videoTag}>
                    <Ionicons name="videocam" size={10} color="#fff" />
                </View>
            )}
            <View style={[styles.circle, item.selected && { backgroundColor: Brand.primary, borderColor: Brand.primary }]}>
                {item.selected && <Ionicons name="checkmark" size={12} color="#000" />}
            </View>
            {item.selected && <View style={styles.selectedOverlay} />}
        </TouchableOpacity>
    ), [toggleSelect]);

    if (!loading && !hasPermission) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
                <Header
                    navigation={navigation}
                    selectedCount={0}
                    onImport={handleImport}
                    importing={false}
                    theme={theme}
                    autoDelete={false}
                />
                <View style={styles.center}>
                    <View style={[styles.emptyIcon, { backgroundColor: theme.elevated }]}>
                        <Ionicons name="images-outline" size={36} color={theme.textSecondary} />
                    </View>
                    <Text style={[styles.permTitle, { color: theme.text }]}>Gallery Access Needed</Text>
                    <Text style={[styles.permSub, { color: theme.textSecondary }]}>
                        Go to Settings → SpicaVault → allow Photos access.
                    </Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
            <StatusBar barStyle="light-content" backgroundColor={theme.background} />

            <Header
                navigation={navigation}
                selectedCount={selectedCount}
                onImport={handleImport}
                importing={importing}
                theme={theme}
                autoDelete={autoDelete}          // ← passed through now
            />

            {assets.length > 0 && (
                <View style={[styles.actionRow, { backgroundColor: theme.surface }]}>
                    <TouchableOpacity onPress={selectAll} activeOpacity={0.7}>
                        <Text style={[styles.actionBtnText, { color: Brand.primary }]}>Select All</Text>
                    </TouchableOpacity>
                    <Text style={[styles.countLabel, { color: theme.textSecondary }]}>
                        {selectedCount > 0 ? `${selectedCount} selected` : `${assets.length} items`}
                    </Text>
                    <TouchableOpacity onPress={clearSelect} activeOpacity={0.7}>
                        <Text style={[styles.actionBtnText, { color: theme.textSecondary }]}>Clear</Text>
                    </TouchableOpacity>
                </View>
            )}

            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={Brand.primary} />
                    <Text style={[styles.loadingText, { color: theme.textSecondary }]}>Loading gallery…</Text>
                </View>
            ) : (
                <FlatList
                    data={assets}
                    keyExtractor={item => item.id}
                    renderItem={renderItem}
                    numColumns={3}
                    columnWrapperStyle={styles.row}
                    contentContainerStyle={styles.grid}
                    initialNumToRender={30}
                    maxToRenderPerBatch={30}
                    windowSize={5}
                />
            )}

            {importing && (
                <View style={styles.importOverlay}>
                    <ActivityIndicator size="large" color="#fff" />
                    <Text style={styles.importingText}>Importing to vault…</Text>
                </View>
            )}

            {toast && <Toast {...toast} onHide={hideToast} />}
        </SafeAreaView>
    );
}

// ─── Header ───────────────────────────────────────────────────────────────────
function Header({ navigation, selectedCount, onImport, importing, theme, autoDelete }) {
    return (
        <View style={[styles.header, { borderBottomColor: theme.border }]}>
            <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.7} style={styles.backBtn}>
                <Ionicons name="chevron-back" size={20} color={Brand.primary} />
                <Text style={[styles.backText, { color: Brand.primary }]}>Back</Text>
            </TouchableOpacity>

            <View style={styles.headerCenter}>
                <Text style={[styles.headerTitle, { color: theme.text }]}>Import Media</Text>
                {autoDelete && (
                    <View style={styles.autoRemoveBadge}>
                        <Ionicons name="trash-outline" size={10} color="#EF4444" />
                        <Text style={styles.autoRemoveBadgeText}>Auto-remove on</Text>
                    </View>
                )}
            </View>

            <View style={styles.headerRight}>
                <TouchableOpacity
                    onPress={() => navigation.navigate('ImportSettings')}
                    style={styles.settingsBtn}
                    activeOpacity={0.7}
                >
                    <Ionicons name="settings-outline" size={18} color={theme.textSecondary} />
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={onImport}
                    disabled={selectedCount === 0 || importing}
                    style={[
                        styles.importBtn,
                        { backgroundColor: selectedCount > 0 ? Brand.primary : theme.elevated },
                    ]}
                    activeOpacity={0.8}
                >
                    <Text style={[
                        styles.importBtnText,
                        { color: selectedCount > 0 ? '#000' : theme.textSecondary },
                    ]}>
                        {importing ? '…' : `Add${selectedCount > 0 ? ` (${selectedCount})` : ''}`}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    container: { flex: 1 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
    header: {
        flexDirection: 'row', alignItems: 'center',
        paddingHorizontal: 16, paddingVertical: 12,
        borderBottomWidth: StyleSheet.hairlineWidth,
    },
    backBtn: { flexDirection: 'row', alignItems: 'center', gap: 2, minWidth: 60 },
    backText: { fontSize: FontSize.sm, fontWeight: FontWeight.medium },
    headerCenter: { flex: 1, alignItems: 'center', gap: 3 },
    headerTitle: { fontSize: FontSize.md, fontWeight: FontWeight.bold },
    autoRemoveBadge: {
        flexDirection: 'row', alignItems: 'center', gap: 3,
        backgroundColor: '#EF444415', paddingHorizontal: 6, paddingVertical: 2,
        borderRadius: 10,
    },
    autoRemoveBadgeText: { fontSize: 9, color: '#EF4444', fontWeight: FontWeight.medium },
    headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8, minWidth: 60, justifyContent: 'flex-end' },
    settingsBtn: { padding: 4 },
    importBtn: {
        paddingHorizontal: 14, paddingVertical: 7,
        borderRadius: Radius.md,
    },
    importBtnText: { fontSize: FontSize.sm, fontWeight: FontWeight.bold },
    actionRow: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 16, paddingVertical: 8,
    },
    actionBtnText: { fontSize: FontSize.sm, fontWeight: FontWeight.medium },
    countLabel: { fontSize: FontSize.sm },
    grid: { paddingBottom: 20 },
    row: { gap: 2, marginBottom: 2 },
    tile: { width: TILE, height: TILE },
    tileSelected: { opacity: 0.75 },
    tileImage: { width: '100%', height: '100%' },
    videoTag: {
        position: 'absolute', top: 4, left: 4,
        backgroundColor: 'rgba(0,0,0,0.55)', borderRadius: 4, padding: 2,
    },
    circle: {
        position: 'absolute', top: 5, right: 5,
        width: 20, height: 20, borderRadius: 10,
        borderWidth: 1.5, borderColor: '#fff',
        justifyContent: 'center', alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.2)',
    },
    selectedOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.25)',
    },
    importOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'center', alignItems: 'center', gap: 12,
    },
    importingText: { color: '#fff', fontSize: FontSize.md, fontWeight: FontWeight.medium },
    emptyIcon: { width: 72, height: 72, borderRadius: 36, justifyContent: 'center', alignItems: 'center' },
    permTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold },
    permSub: { fontSize: FontSize.sm, textAlign: 'center', paddingHorizontal: 32, lineHeight: 20 },
    loadingText: { fontSize: FontSize.sm, marginTop: 8 },
});