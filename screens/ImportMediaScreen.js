import { Ionicons } from '@expo/vector-icons';
import * as MediaLibrary from 'expo-media-library';
import { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    FlatList,
    Image,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast, { useToast } from '../components/Toast';
import { Brand, Colors, FontSize, FontWeight, Radius, Spacing } from '../constants/theme';
import { useVaultStorage } from '../context/VaultContext';

const { width } = Dimensions.get('window');
const TILE = (width - 4) / 3;

export default function ImportMediaScreen({ navigation }) {
    const [assets, setAssets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [importing, setImporting] = useState(false);
    const [hasPermission, setHasPermission] = useState(false);
    const { importToVault, refreshVault } = useVaultStorage();
    const { toast, showSuccess, showError, hideToast } = useToast();
    const theme = Colors.dark;

    const selectedCount = assets.filter((a) => a.selected).length;

    useEffect(() => { requestAndLoad(); }, []);

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
            const result = await MediaLibrary.getAssetsAsync({
                first: 120,
                mediaType: ['photo', 'video'],
                sortBy: [MediaLibrary.SortBy.creationTime],
            });
            setAssets(result.assets.map((a) => ({
                uri: a.uri, id: a.id,
                mediaType: a.mediaType, filename: a.filename, selected: false,
            })));
        } catch (e) {
            showError('Error', 'Could not load gallery.');
        } finally {
            setLoading(false);
        }
    }

    const toggleSelect = useCallback((id) => {
        setAssets((prev) => prev.map((a) => (a.id === id ? { ...a, selected: !a.selected } : a)));
    }, []);

    async function handleImport() {
        const selected = assets.filter((a) => a.selected);
        if (selected.length === 0) return;
        setImporting(true);
        try {
            const assetInfos = await Promise.all(
                selected.map((a) => MediaLibrary.getAssetInfoAsync(a.id))
            );
            const toImport = assetInfos.map((info, i) => ({
                uri: info.localUri ?? selected[i].uri,
                filename: selected[i].filename,
                mediaType: selected[i].mediaType,
                id: selected[i].id, // ← needed to delete original from gallery
            }));

            const { success, failed } = await importToVault(toImport);

            // Refresh vault so home screen shows new files immediately
            await refreshVault();

            if (failed > 0) {
                showError('Partial Import', `${success} added, ${failed} failed.`);
            } else {
                showSuccess('Done!', `${success} file${success !== 1 ? 's' : ''} added to vault.`);
            }

            setTimeout(() => navigation.goBack(), 1500);
        } catch (e) {
            showError('Import Failed', 'Please try again.');
        } finally {
            setImporting(false);
        }
    }

    const selectAll = () => setAssets((prev) => prev.map((a) => ({ ...a, selected: true })));
    const clearSelection = () => setAssets((prev) => prev.map((a) => ({ ...a, selected: false })));

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
                <Header navigation={navigation} selectedCount={0} onImport={handleImport} importing={false} theme={theme} />
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
            <Header navigation={navigation} selectedCount={selectedCount} onImport={handleImport} importing={importing} theme={theme} />

            {assets.length > 0 && (
                <View style={[styles.actionRow, { backgroundColor: theme.surface }]}>
                    <TouchableOpacity onPress={selectAll} activeOpacity={0.7}>
                        <Text style={[styles.actionBtnText, { color: Brand.primary }]}>Select All</Text>
                    </TouchableOpacity>
                    <Text style={[styles.countLabel, { color: theme.textSecondary }]}>
                        {selectedCount > 0 ? `${selectedCount} selected` : `${assets.length} items`}
                    </Text>
                    <TouchableOpacity onPress={clearSelection} activeOpacity={0.7}>
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
                    keyExtractor={(item) => item.id}
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

function Header({ navigation, selectedCount, onImport, importing, theme }) {
    return (
        <View style={[styles.header, { borderBottomColor: theme.border }]}>
            <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.7} style={styles.backBtn}>
                <Ionicons name="chevron-back" size={20} color={Brand.primary} />
                <Text style={[styles.backText, { color: Brand.primary }]}>Back</Text>
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { color: theme.text }]}>Import Media</Text>
            <TouchableOpacity
                onPress={onImport}
                disabled={selectedCount === 0 || importing}
                style={[styles.importBtn, { backgroundColor: selectedCount > 0 ? Brand.primary : theme.elevated }]}
                activeOpacity={0.8}
            >
                <Text style={[styles.importBtnText, { color: selectedCount > 0 ? '#000' : theme.textSecondary }]}>
                    {importing ? '…' : `Add${selectedCount > 0 ? ` (${selectedCount})` : ''}`}
                </Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, borderBottomWidth: 0.5,
    },
    backBtn: { flexDirection: 'row', alignItems: 'center', gap: 2, minWidth: 60 },
    backText: { fontSize: FontSize.md, fontWeight: FontWeight.medium },
    headerTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.semibold },
    importBtn: {
        paddingHorizontal: Spacing.md, paddingVertical: 7,
        borderRadius: Radius.full, minWidth: 64, alignItems: 'center',
    },
    importBtnText: { fontWeight: FontWeight.bold, fontSize: FontSize.sm },
    actionRow: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm + 2,
    },
    actionBtnText: { fontSize: FontSize.sm, fontWeight: FontWeight.medium },
    countLabel: { fontSize: FontSize.sm },
    grid: { paddingBottom: 40 },
    row: { gap: 2 },
    tile: { width: TILE, height: TILE, marginBottom: 2, position: 'relative' },
    tileSelected: { opacity: 0.8 },
    tileImage: { width: '100%', height: '100%', backgroundColor: '#1a1a1a' },
    selectedOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: Brand.primary + '30' },
    circle: {
        position: 'absolute', top: 6, right: 6,
        width: 22, height: 22, borderRadius: 11,
        borderWidth: 2, borderColor: '#fff', backgroundColor: 'transparent',
        alignItems: 'center', justifyContent: 'center',
    },
    videoTag: {
        position: 'absolute', bottom: 6, left: 6,
        backgroundColor: 'rgba(0,0,0,0.6)',
        borderRadius: Radius.sm, paddingHorizontal: 5, paddingVertical: 3,
    },
    emptyIcon: { width: 80, height: 80, borderRadius: Radius.xl, alignItems: 'center', justifyContent: 'center' },
    permTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold },
    permSub: { fontSize: FontSize.sm, textAlign: 'center', paddingHorizontal: 40, lineHeight: 20 },
    loadingText: { fontSize: FontSize.sm, marginTop: 10 },
    importOverlay: {
        ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.75)',
        alignItems: 'center', justifyContent: 'center', gap: 16,
    },
    importingText: { color: '#fff', fontSize: FontSize.lg, fontWeight: FontWeight.medium },
});