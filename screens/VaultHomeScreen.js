import { Ionicons } from '@expo/vector-icons';
import { useRef, useState } from 'react';
import {
    Dimensions, FlatList, Image, Share, StatusBar,
    StyleSheet, Text, TouchableOpacity, View,
} from 'react-native';
import PagerView from 'react-native-pager-view';
import { SafeAreaView } from 'react-native-safe-area-context';
import EmptyStateSVG from '../assets/Svg/EmptyStateSVG.svg';
import BannerAd from '../components/BannerAd';
import BottomNavBar from '../components/BottomNavBar';
import BottomSheet from '../components/BottomSheet';
import Toast, { useToast } from '../components/Toast';
import VaultModal from '../components/VaultModal';
import { Brand, Colors, FontSize, FontWeight, Radius, Spacing } from '../constants/theme';
import { useVaultStorage } from '../context/VaultContext';

const { width } = Dimensions.get('window');
const GAP = 3;
const COLUMN_COUNT = 3;
const ITEM_SIZE = (width - GAP * (COLUMN_COUNT - 1)) / COLUMN_COUNT;
const TABS = ['All Items', 'Photos', 'Videos'];

function MediaGrid({ items, isReady, onPress, onLongPress, selectedItems, isSelecting }) {
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

    return (
        <FlatList
            data={items}
            keyExtractor={(item) => item.filename}
            numColumns={COLUMN_COUNT}
            contentContainerStyle={styles.grid}
            showsVerticalScrollIndicator={false}
            columnWrapperStyle={styles.row}
            extraData={selectedItems}
            renderItem={({ item }) => {
                const isSelected = selectedItems.includes(item.filename);
                return (
                    <TouchableOpacity
                        style={[styles.tile, isSelected && styles.tileSelected]}
                        onPress={() => onPress(item)}
                        onLongPress={() => onLongPress(item)}
                        activeOpacity={0.85}
                        delayLongPress={300}
                    >
                        <Image source={{ uri: item.uri }} style={styles.tileImage} resizeMode="cover" />
                        {item.type === 'video' && !isSelected && (
                            <View style={styles.videoBadge}>
                                <Ionicons name="videocam" size={12} color="#fff" />
                            </View>
                        )}
                        {isSelecting && (
                            <View style={[styles.selectionOverlay, isSelected && { backgroundColor: 'rgba(0,0,0,0.35)' }]}>
                                <View style={[styles.selectionCircle, isSelected && { backgroundColor: Brand.primary, borderColor: Brand.primary }]}>
                                    {isSelected && <Ionicons name="checkmark" size={14} color="#000" />}
                                </View>
                            </View>
                        )}
                    </TouchableOpacity>
                );
            }}
        />
    );
}

export default function VaultHomeScreen({ navigation }) {
    const { vaultItems, isReady, deleteFromVault, albums, addFileToAlbum } = useVaultStorage();
    const { toast, showSuccess, showError, hideToast } = useToast();

    const [activeTab, setActiveTab] = useState(0);
    const pagerRef = useRef(null);
    const [isSelecting, setIsSelecting] = useState(false);
    const [selectedItems, setSelectedItems] = useState([]);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showMoveSheet, setShowMoveSheet] = useState(false);

    const photos = vaultItems.filter(i => i.type === 'photo');
    const videos = vaultItems.filter(i => i.type === 'video');
    const pages = [vaultItems, photos, videos, []];
    const theme = Colors.dark;

    const handleTabPress = (index) => {
        setActiveTab(index);
        pagerRef.current?.setPage(index);
    };

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
            const currentItems = pages[activeTab];
            navigation.navigate('MediaViewer', { item, items: currentItems.length > 0 ? currentItems : vaultItems });
        }
    };

    const handleLongPress = (item) => {
        if (!isSelecting) enterSelection(item);
        else toggleSelect(item);
    };

    const handleBulkDelete = async () => {
        try {
            for (const filename of selectedItems) await deleteFromVault(filename);
            showSuccess('Deleted', `${selectedItems.length} file${selectedItems.length > 1 ? 's' : ''} deleted.`);
            exitSelection();
            setShowDeleteModal(false);
        } catch (e) { showError('Error', 'Could not delete some files.'); }
    };

    const handleBulkShare = async () => {
        try {
            const items = vaultItems.filter(i => selectedItems.includes(i.filename));
            if (items.length === 1) await Share.share({ url: items[0].uri, title: items[0].filename });
            else await Share.share({ urls: items.map(i => i.uri) });
        } catch (e) { showError('Error', 'Could not share files.'); }
    };

    const handleMoveToAlbum = async (albumId) => {
        try {
            for (const filename of selectedItems) await addFileToAlbum(albumId, filename);
            showSuccess('Moved', `${selectedItems.length} file${selectedItems.length > 1 ? 's' : ''} added to album.`);
            exitSelection();
            setShowMoveSheet(false);
        } catch (e) { showError('Error', 'Could not move files.'); }
    };

    return (
        <View style={[styles.screen, { backgroundColor: theme.background }]}>
            <SafeAreaView style={{ flex: 1 }} edges={['top']}>
                <StatusBar barStyle="light-content" backgroundColor={theme.background} />

                {/* Header */}
                {isSelecting ? (
                    <View style={styles.selectionHeader}>
                        <TouchableOpacity onPress={exitSelection} style={styles.iconBtn} activeOpacity={0.7}>
                            <Ionicons name="close" size={24} color="#fff" />
                        </TouchableOpacity>
                        <Text style={styles.selectionCount}>{selectedItems.length} selected</Text>
                        <TouchableOpacity onPress={selectAll} activeOpacity={0.7}>
                            <Text style={[styles.selectAllBtn, { color: Brand.primary }]}>All</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View style={styles.header}>
                        <Text style={styles.headerTitle}>SpicaVault</Text>
                        {/* <TouchableOpacity
                            style={[styles.iconBtn, { backgroundColor: theme.elevated }]}
                            onPress={() => navigation.navigate('Settings')}
                            activeOpacity={0.7}
                        >
                            <Ionicons name="settings-outline" size={20} color={theme.icon} />
                        </TouchableOpacity> */}
                    </View>
                )}

                {/* Tabs */}
                {!isSelecting && (
                    <View style={[styles.tabRow, { borderBottomColor: theme.border }]}>
                        {TABS.map((tab, index) => {
                            const isActive = activeTab === index;
                            return (
                                <TouchableOpacity key={tab} onPress={() => handleTabPress(index)} style={styles.tab} activeOpacity={0.7}>
                                    <Text style={[styles.tabText, {
                                        color: isActive ? Brand.primary : theme.textSecondary,
                                        fontWeight: isActive ? FontWeight.bold : FontWeight.regular,
                                    }]}>{tab}</Text>
                                    {isActive && <View style={[styles.tabUnderline, { backgroundColor: Brand.primary }]} />}
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                )}

                {/* Pages */}
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
                                isReady={isReady}
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
                        <Ionicons name="add" size={22} color="#fff" />
                        <Text style={styles.fabText}>Add Media</Text>
                    </TouchableOpacity>
                )}
            </SafeAreaView>
            <BannerAd />


            {/* Bottom nav — inside screen so action sheet covers it */}
            {!isSelecting && (
                <BottomNavBar
                    active="Vault"
                    onNavigate={(screen) => navigation.navigate(screen)}
                />
            )}

            {/* Modals */}
            <VaultModal
                visible={showDeleteModal}
                //icon="delete"
                title={`Delete ${selectedItems.length} file${selectedItems.length > 1 ? 's' : ''}?`}
                message="This will permanently remove the selected files from your vault."
                primaryText="Delete"
                primaryDestructive
                secondaryText="Cancel"
                onPrimary={handleBulkDelete}
                onSecondary={() => setShowDeleteModal(false)}
                onClose={() => setShowDeleteModal(false)}
            />

            <BottomSheet
                visible={showMoveSheet}
                onClose={() => setShowMoveSheet(false)}
                title="Move to Album"
                snapPoint={0.5}
            >
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
                            <View style={[styles.albumRowIcon, { backgroundColor: album.color + '20' }]}>
                                <Ionicons name={album.icon} size={20} color={album.color} />
                            </View>
                            <Text style={styles.albumRowName}>{album.name}</Text>
                            <Text style={[styles.albumRowCount, { color: theme.textSecondary }]}>{album.fileNames.length} files</Text>
                        </TouchableOpacity>
                    ))
                )}
            </BottomSheet>

            {toast && <Toast {...toast} onHide={hideToast} />}

            {/* Action sheet — position absolute covers BottomNavBar since same tree */}
            {isSelecting && selectedItems.length > 0 && (
                <View style={styles.actionSheet}>
                    <View style={styles.actionSheetHandle} />
                    <View style={styles.actionSheetRow}>
                        <TouchableOpacity style={styles.actionItem} onPress={handleBulkShare} activeOpacity={0.7}>
                            <View style={[styles.actionIconWrap, { backgroundColor: '#3B82F615' }]}>
                                <Ionicons name="share-outline" size={22} color="#3B82F6" />
                            </View>
                            <Text style={styles.actionLabel}>Share</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.actionItem} onPress={() => setShowMoveSheet(true)} activeOpacity={0.7}>
                            <View style={[styles.actionIconWrap, { backgroundColor: Brand.primary + '15' }]}>
                                <Ionicons name="folder-outline" size={22} color={Brand.primary} />
                            </View>
                            <Text style={styles.actionLabel}>Move</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.actionItem} onPress={() => setShowDeleteModal(true)} activeOpacity={0.7}>
                            <View style={[styles.actionIconWrap, { backgroundColor: '#EF444415' }]}>
                                <Ionicons name="trash-outline" size={22} color="#EF4444" />
                            </View>
                            <Text style={[styles.actionLabel, { color: '#EF4444' }]}>Delete</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    screen: { flex: 1 },
    header: {
        flexDirection: 'row', justifyContent: 'space-between',
        alignItems: 'center', paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md,
    },
    headerTitle: { fontSize: 26, fontWeight: FontWeight.bold, color: Brand.primary, letterSpacing: -0.3 },
    iconBtn: { width: 40, height: 40, borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
    selectionHeader: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md,
        borderBottomWidth: 0.5, borderBottomColor: Colors.dark.border,
    },
    selectionCount: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: '#fff' },
    selectAllBtn: { fontSize: FontSize.md, fontWeight: FontWeight.semibold },
    tabRow: { flexDirection: 'row', paddingHorizontal: Spacing.lg, borderBottomWidth: 0.5 },
    tab: { paddingVertical: Spacing.sm, marginRight: Spacing.lg, position: 'relative' },
    tabText: { fontSize: FontSize.md },
    tabUnderline: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 2, borderRadius: 1 },
    grid: { paddingTop: GAP, paddingBottom: 120 },
    row: { gap: GAP, marginBottom: GAP },
    tile: { width: ITEM_SIZE, height: ITEM_SIZE, overflow: 'hidden', backgroundColor: '#1E1E2E' },
    tileSelected: { opacity: 0.75 },
    tileImage: { width: '100%', height: '100%' },
    videoBadge: {
        position: 'absolute', top: 6, right: 6,
        backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: Radius.sm, padding: 4,
    },
    selectionOverlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'flex-start', alignItems: 'flex-end', padding: 6,
    },
    selectionCircle: {
        width: 22, height: 22, borderRadius: 11,
        borderWidth: 2, borderColor: '#fff',
        backgroundColor: 'transparent',
        alignItems: 'center', justifyContent: 'center',
    },
    fab: {
        position: 'absolute', bottom: 20, right: Spacing.lg,
        backgroundColor: Brand.accent,
        flexDirection: 'row', alignItems: 'center',
        paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md + 2,
        borderRadius: 999, elevation: 8,
        shadowColor: Brand.accent,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4, shadowRadius: 10,
        gap: Spacing.sm,
    },
    fabText: { color: '#fff', fontWeight: FontWeight.bold, fontSize: FontSize.md },
    actionSheet: {
        position: 'absolute', bottom: 0, left: 0, right: 0,
        backgroundColor: Colors.dark.elevated,
        borderTopLeftRadius: 24, borderTopRightRadius: 24,
        paddingTop: Spacing.sm, paddingBottom: Spacing.xl,
        paddingHorizontal: Spacing.lg,
        elevation: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.3, shadowRadius: 12,
    },
    actionSheetHandle: {
        width: 36, height: 4, borderRadius: 2,
        backgroundColor: Colors.dark.border,
        alignSelf: 'center', marginBottom: Spacing.md,
    },
    actionSheetRow: { flexDirection: 'row', justifyContent: 'space-around' },
    actionItem: { alignItems: 'center', gap: Spacing.sm, flex: 1 },
    actionIconWrap: { width: 52, height: 52, borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
    actionLabel: { fontSize: FontSize.xs, fontWeight: FontWeight.medium, color: '#fff' },
    emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40, gap: Spacing.md },
    emptyTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: '#fff' },
    emptySub: { fontSize: FontSize.sm, color: '#9BA1B4', textAlign: 'center', lineHeight: 20 },
    albumRow: {
        flexDirection: 'row', alignItems: 'center',
        paddingVertical: Spacing.md, borderBottomWidth: 0.5, gap: Spacing.md,
    },
    albumRowIcon: { width: 36, height: 36, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center' },
    albumRowName: { flex: 1, fontSize: FontSize.md, fontWeight: FontWeight.medium, color: '#fff' },
    albumRowCount: { fontSize: FontSize.xs },
});