import { Ionicons } from '@expo/vector-icons';
import { useRef, useState } from 'react';
import {
    FlatList, Share,
    StatusBar,
    StyleSheet, Text, TouchableOpacity, View
} from 'react-native';
import PagerView from 'react-native-pager-view';
import { SafeAreaView } from 'react-native-safe-area-context';
import EmptyStateSVG from '../assets/Svg/EmptyStateSVG.svg';
import BannerAd from '../components/BannerAd';
import BottomNavBar from '../components/BottomNavBar';
import BottomSheet from '../components/BottomSheet';
import Header from '../components/Header';
import { CardTile, GridTile, ListTile } from '../components/MediaTitle';
import Toast, { useToast } from '../components/Toast';
import VaultModal from '../components/VaultModal';
import { Brand, Colors, FontSize, FontWeight, Radius, Spacing } from '../constants/theme';
import { useVaultStorage } from '../context/VaultContext';

const TABS = ['All Items', 'Photos', 'Videos'];
const theme = Colors.dark;
const LAYOUTS = { GRID: 'grid', LIST: 'list', CARD: 'card' };

// ─── Media Grid ───────────────────────────────────────────────────────────────
function MediaGrid({ items, onPress, onLongPress, selectedItems, isSelecting, layout }) {
    if (items.length === 0) {
        return (
            <View style={styles.emptyContainer}>
                <EmptyStateSVG width={100} height={100} />
                <Text style={styles.emptyTitle}>Your vault is empty</Text>
                <Text style={styles.emptySub}>
                    Tap <Text style={{ color: Brand.primary }}>Add Media</Text> to securely import photos and videos.
                </Text>
            </View>
        );
    }

    const numColumns = layout === LAYOUTS.GRID ? 3 : 1;

    return (
        <FlatList
            key={layout}
            data={items}
            keyExtractor={(item) => item.filename}
            numColumns={numColumns}
            contentContainerStyle={[styles.grid, layout !== LAYOUTS.GRID && { paddingHorizontal: 0 }]}
            showsVerticalScrollIndicator={false}
            columnWrapperStyle={layout === LAYOUTS.GRID ? styles.row : null}
            extraData={selectedItems}
            renderItem={({ item }) => {
                const isSelected = selectedItems.includes(item.filename);
                const commonProps = { item, isSelected, isSelecting, onPress, onLongPress };
                switch (layout) {
                    case LAYOUTS.LIST: return <ListTile {...commonProps} />;
                    case LAYOUTS.CARD: return <CardTile {...commonProps} />;
                    default: return <GridTile {...commonProps} />;
                }
            }}
        />
    );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function VaultHomeScreen({ navigation }) {
    const { vaultItems, albums, deleteFromVault, restoreToGallery, addFileToAlbum } = useVaultStorage();
    const { toast, showSuccess, showError, hideToast } = useToast();

    const [layout, setLayout] = useState(LAYOUTS.GRID);
    const [activeTab, setActiveTab] = useState(0);
    const pagerRef = useRef(null);
    const [isSelecting, setIsSelecting] = useState(false);
    const [selectedItems, setSelectedItems] = useState([]);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showRestoreModal, setShowRestoreModal] = useState(false);
    const [showMoveSheet, setShowMoveSheet] = useState(false);

    const photos = vaultItems.filter(i => i.type === 'photo');
    const videos = vaultItems.filter(i => i.type === 'video');
    const pages = [vaultItems, photos, videos];

    const toggleLayout = () => {
        if (layout === LAYOUTS.GRID) setLayout(LAYOUTS.LIST);
        else if (layout === LAYOUTS.LIST) setLayout(LAYOUTS.CARD);
        else setLayout(LAYOUTS.GRID);
    };
    const getLayoutIcon = () => {
        if (layout === LAYOUTS.GRID) return 'list';
        if (layout === LAYOUTS.LIST) return 'square-outline';
        return 'grid-outline';
    };

    const handleTabPress = (index) => { setActiveTab(index); pagerRef.current?.setPage(index); };

    const enterSelection = (item) => { setIsSelecting(true); setSelectedItems([item.filename]); };
    const exitSelection = () => { setIsSelecting(false); setSelectedItems([]); };

    const toggleSelect = (item) => {
        setSelectedItems(prev =>
            prev.includes(item.filename)
                ? prev.filter(f => f !== item.filename)
                : [...prev, item.filename]
        );
    };

    const selectAll = () => setSelectedItems(pages[activeTab].map(i => i.filename));

    const handlePress = (item) => {
        if (isSelecting) {
            const next = selectedItems.filter(f => f !== item.filename);
            if (selectedItems.includes(item.filename) && next.length === 0) { exitSelection(); return; }
            toggleSelect(item);
        } else {
            navigation.navigate('MediaViewer', { item, items: pages[activeTab] });
        }
    };

    const handleLongPress = (item) => {
        if (!isSelecting) enterSelection(item);
        else toggleSelect(item);
    };

    // ── Actions ────────────────────────────────────────────────────────────
    const handleBulkShare = async () => {
        try {
            const items = vaultItems.filter(i => selectedItems.includes(i.filename));
            if (items.length === 1) await Share.share({ url: items[0].uri, title: items[0].originalName ?? items[0].filename });
            else await Share.share({ urls: items.map(i => i.uri) });
        } catch { showError('Error', 'Could not share files.'); }
    };

    const handleMoveToAlbum = async (albumId) => {
        try {
            for (const filename of selectedItems) await addFileToAlbum(albumId, filename);
            showSuccess('Moved', `${selectedItems.length} file${selectedItems.length > 1 ? 's' : ''} added to album.`);
            exitSelection();
            setShowMoveSheet(false);
        } catch { showError('Error', 'Could not move files.'); }
    };

    const handleBulkRestore = async () => {
        setShowRestoreModal(false);
        let success = 0;
        try {
            const itemsToRestore = vaultItems.filter(i => selectedItems.includes(i.filename));
            for (const item of itemsToRestore) {
                const ok = await restoreToGallery(item);
                if (ok) success++;
            }
            showSuccess('Restored', `${success} file${success > 1 ? 's' : ''} returned to gallery.`);
            exitSelection();
        } catch { showError('Error', 'Restore failed.'); }
    };

    const handleBulkDelete = async () => {
        setShowDeleteModal(false);
        try {
            for (const filename of selectedItems) await deleteFromVault(filename);
            showSuccess('Deleted', `${selectedItems.length} file${selectedItems.length > 1 ? 's' : ''} permanently deleted.`);
            exitSelection();
        } catch { showError('Error', 'Delete failed.'); }
    };

    return (
        <View style={[styles.screen, { backgroundColor: theme.background }]}>
            <SafeAreaView style={{ flex: 1 }} edges={['top']}>
                <StatusBar barStyle="light-content" backgroundColor={theme.background} />

                <Header
                    type={isSelecting ? 'selection' : 'brand'}
                    title="SpicaVault"
                    selectionCount={selectedItems.length}
                    onBack={exitSelection}
                    onAction={isSelecting ? selectAll : toggleLayout}
                    actionText={isSelecting ? 'All' : null}
                    actionIcon={!isSelecting ? getLayoutIcon() : null}
                />

                {!isSelecting && (
                    <View style={[styles.tabRow, { borderBottomColor: theme.border }]}>
                        {TABS.map((tab, index) => {
                            const isActive = activeTab === index;
                            return (
                                <TouchableOpacity key={tab} onPress={() => handleTabPress(index)} style={styles.tab} activeOpacity={0.7}>
                                    <Text style={[styles.tabText, {
                                        color: isActive ? Brand.primary : theme.textSecondary,
                                        fontWeight: isActive ? FontWeight.semibold : FontWeight.regular,
                                    }]}>{tab}</Text>
                                    {isActive && <View style={[styles.tabUnderline, { backgroundColor: Brand.primary }]} />}
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                )}

                <PagerView
                    ref={pagerRef}
                    style={{ flex: 1 }}
                    initialPage={0}
                    scrollEnabled={!isSelecting}
                    onPageSelected={(e) => setActiveTab(e.nativeEvent.position)}
                >
                    {pages.map((pageItems, index) => (
                        <View key={index} style={{ flex: 1 }}>
                            <MediaGrid
                                items={pageItems}
                                layout={layout}
                                onPress={handlePress}
                                onLongPress={handleLongPress}
                                selectedItems={selectedItems}
                                isSelecting={isSelecting}
                            />
                        </View>
                    ))}
                </PagerView>

                {!isSelecting && (
                    <TouchableOpacity
                        style={styles.fab}
                        onPress={() => navigation.navigate('ImportMedia')}
                        activeOpacity={0.85}
                    >
                        <Ionicons name="add" size={20} color={theme.background} />
                        <Text style={styles.fabText}>Add Media</Text>
                    </TouchableOpacity>
                )}
            </SafeAreaView>

            <BannerAd />

            {!isSelecting && (
                <BottomNavBar active="Vault" onNavigate={(screen) => navigation.navigate(screen)} />
            )}

            {/* Restore modal */}
            <VaultModal
                visible={showRestoreModal}
                title={`Restore ${selectedItems.length} file${selectedItems.length > 1 ? 's' : ''}?`}
                message="Files will be moved back to your gallery and removed from the vault."
                primaryText="Restore"
                secondaryText="Cancel"
                onPrimary={handleBulkRestore}
                onSecondary={() => setShowRestoreModal(false)}
                onClose={() => setShowRestoreModal(false)}
            />

            {/* Delete modal */}
            <VaultModal
                visible={showDeleteModal}
                title={`Delete ${selectedItems.length} file${selectedItems.length > 1 ? 's' : ''}?`}
                message="Files will be permanently deleted. This cannot be undone."
                primaryText="Delete"
                primaryDestructive
                secondaryText="Cancel"
                onPrimary={handleBulkDelete}
                onSecondary={() => setShowDeleteModal(false)}
                onClose={() => setShowDeleteModal(false)}
            />

            {/* Move to album sheet */}
            <BottomSheet visible={showMoveSheet} onClose={() => setShowMoveSheet(false)} title="Move to Album" snapPoint={0.5}>
                {albums.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Text style={[styles.emptyTitle, { paddingTop: 20 }]}>No albums yet</Text>
                        <Text style={styles.emptySub}>Create an album in the Albums tab first.</Text>
                    </View>
                ) : (
                    albums.map(album => (
                        <TouchableOpacity
                            key={album.id}
                            style={[styles.albumRow, { borderBottomColor: theme.border }]}
                            onPress={() => handleMoveToAlbum(album.id)}
                            activeOpacity={0.7}
                        >
                            <View style={[styles.albumRowIcon, { backgroundColor: theme.overlay }]}>
                                <Ionicons name={album.icon} size={18} color={theme.text} />
                            </View>
                            <Text style={styles.albumRowName}>{album.name}</Text>
                            <Text style={[styles.albumRowCount, { color: theme.textSecondary }]}>
                                {album.fileNames.length} files
                            </Text>
                        </TouchableOpacity>
                    ))
                )}
            </BottomSheet>

            {toast && <Toast {...toast} onHide={hideToast} />}

            {/* Action sheet — 4 buttons */}
            {isSelecting && selectedItems.length > 0 && (
                <View style={styles.actionSheet}>
                    <View style={styles.actionSheetHandle} />
                    <View style={styles.actionSheetRow}>

                        <TouchableOpacity style={styles.actionItem} onPress={handleBulkShare} activeOpacity={0.7}>
                            <View style={styles.actionIconWrap}>
                                <Ionicons name="share-outline" size={20} color={theme.text} />
                            </View>
                            <Text style={styles.actionLabel}>Share</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.actionItem} onPress={() => setShowMoveSheet(true)} activeOpacity={0.7}>
                            <View style={styles.actionIconWrap}>
                                <Ionicons name="folder-outline" size={20} color={theme.text} />
                            </View>
                            <Text style={styles.actionLabel}>Move</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.actionItem} onPress={() => setShowRestoreModal(true)} activeOpacity={0.7}>
                            <View style={styles.actionIconWrap}>
                                <Ionicons name="arrow-undo-outline" size={20} color={theme.text} />
                            </View>
                            <Text style={[styles.actionLabel, { color: Brand.success }]}>Restore</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.actionItem} onPress={() => setShowDeleteModal(true)} activeOpacity={0.7}>
                            <View style={styles.actionIconWrap}>
                                <Ionicons name="trash-outline" size={20} color={theme.text} />
                            </View>
                            <Text style={[styles.actionLabel, { color: Brand.danger }]}>Delete</Text>
                        </TouchableOpacity>

                    </View>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    screen: { flex: 1 },
    tabRow: { flexDirection: 'row', paddingHorizontal: Spacing.lg, borderBottomWidth: StyleSheet.hairlineWidth },
    tab: { paddingVertical: Spacing.sm, marginRight: Spacing.lg, position: 'relative' },
    tabText: { fontSize: FontSize.md },
    tabUnderline: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 2, borderRadius: 1 },
    grid: { paddingTop: 3, paddingBottom: 120 },
    row: { gap: 3, marginBottom: 3 },
    fab: {
        position: 'absolute', bottom: 20, right: Spacing.lg,
        backgroundColor: theme.text, flexDirection: 'row', alignItems: 'center',
        paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md,
        borderRadius: Radius.full, elevation: 6, gap: Spacing.sm,
    },
    fabText: { color: theme.background, fontWeight: FontWeight.bold, fontSize: FontSize.md },
    emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40, gap: Spacing.md },
    emptyTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: theme.text },
    emptySub: { fontSize: FontSize.sm, color: theme.textSecondary, textAlign: 'center', lineHeight: 20 },
    actionSheet: {
        position: 'absolute', bottom: 0, left: 0, right: 0,
        backgroundColor: theme.elevated,
        borderTopLeftRadius: Radius.xl, borderTopRightRadius: Radius.xl,
        paddingTop: Spacing.sm, paddingBottom: Spacing.xl,
        paddingHorizontal: Spacing.lg, elevation: 20,
        shadowColor: '#000', shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.3, shadowRadius: 12,
    },
    actionSheetHandle: {
        width: 36, height: 4, borderRadius: 2,
        backgroundColor: theme.border, alignSelf: 'center', marginBottom: Spacing.md,
    },
    actionSheetRow: { flexDirection: 'row', justifyContent: 'space-around' },
    actionItem: { alignItems: 'center', gap: Spacing.sm, flex: 1 },
    actionIconWrap: {
        width: 48, height: 48, borderRadius: Radius.full,
        alignItems: 'center', justifyContent: 'center',
        backgroundColor: theme.overlay,
    },
    actionLabel: { fontSize: FontSize.xs, fontWeight: FontWeight.medium, color: theme.text },
    albumRow: {
        flexDirection: 'row', alignItems: 'center',
        paddingVertical: Spacing.md,
        borderBottomWidth: StyleSheet.hairlineWidth, gap: Spacing.md,
    },
    albumRowIcon: { width: 36, height: 36, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center' },
    albumRowName: { flex: 1, fontSize: FontSize.md, fontWeight: FontWeight.medium, color: theme.text },
    albumRowCount: { fontSize: FontSize.xs },
});