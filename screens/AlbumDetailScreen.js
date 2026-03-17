import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
    Dimensions, FlatList, Image, StatusBar,
    StyleSheet, Text, TouchableOpacity, View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import BottomSheet from '../components/BottomSheet';
import Toast, { useToast } from '../components/Toast';
import { Brand, Colors, FontSize, FontWeight, Radius, Spacing } from '../constants/theme';
import { useVaultStorage } from '../context/VaultContext';

const { width } = Dimensions.get('window');
const GAP = 3;
const COLUMN_COUNT = 3;
const ITEM_SIZE = Math.floor((width - GAP * (COLUMN_COUNT - 1)) / COLUMN_COUNT);
const SHEET_PADDING = Spacing.lg * 2; // BottomSheet has paddingHorizontal: Spacing.lg
const SHEET_ITEM_SIZE = Math.floor((width - SHEET_PADDING - GAP * (COLUMN_COUNT - 1)) / COLUMN_COUNT);
const theme = Colors.dark;

export default function AlbumDetailScreen({ route, navigation }) {
    const { albumId } = route.params;
    const { albums, vaultItems, getAlbumItems, addFileToAlbum, removeFileFromAlbum } = useVaultStorage();
    const { toast, showSuccess, hideToast } = useToast();
    const [showAddSheet, setShowAddSheet] = useState(false);

    // Always read live from context — never stale
    const album = albums.find(a => a.id === albumId);

    if (!album) {
        return (
            <View style={[styles.screen, { backgroundColor: theme.background, justifyContent: 'center', alignItems: 'center' }]}>
                <Text style={{ color: '#fff' }}>Album not found</Text>
            </View>
        );
    }

    const albumItems = getAlbumItems(albumId);
    const albumFileNames = albumItems.map(i => i.filename);
    const availableItems = vaultItems.filter(i => !albumFileNames.includes(i.filename));

    const handleAdd = async (filename) => {
        await addFileToAlbum(albumId, filename);
        showSuccess('Added', 'File added to album.');
    };

    const handleRemove = async (filename) => {
        await removeFileFromAlbum(albumId, filename);
        showSuccess('Removed', 'File removed from album.');
    };

    return (
        <View style={[styles.screen, { backgroundColor: theme.background }]}>
            <SafeAreaView style={{ flex: 1 }} edges={['top']}>
                <StatusBar barStyle="light-content" backgroundColor={theme.background} />

                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity
                        style={[styles.iconBtn, { backgroundColor: theme.elevated }]}
                        onPress={() => navigation.goBack()}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="chevron-back" size={20} color="#fff" />
                    </TouchableOpacity>
                    <View style={styles.headerCenter}>
                        <View style={[styles.albumIcon, { backgroundColor: album.color + '20' }]}>
                            <Ionicons name={album.icon} size={16} color={album.color} />
                        </View>
                        <Text style={styles.headerTitle}>{album.name}</Text>
                    </View>
                    <TouchableOpacity
                        style={[styles.iconBtn, { backgroundColor: theme.elevated }]}
                        onPress={() => setShowAddSheet(true)}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="add" size={22} color={Brand.primary} />
                    </TouchableOpacity>
                </View>

                {/* Files grid */}
                <FlatList
                    data={albumItems}
                    keyExtractor={(item) => item.filename}
                    numColumns={COLUMN_COUNT}
                    columnWrapperStyle={styles.row}
                    contentContainerStyle={styles.grid}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <View style={[styles.emptyIcon, { backgroundColor: album.color + '15' }]}>
                                <Ionicons name={album.icon} size={36} color={album.color} />
                            </View>
                            <Text style={styles.emptyTitle}>Album is empty</Text>
                            <Text style={styles.emptySub}>
                                Tap <Text style={{ color: Brand.primary }}>+</Text> to add files.
                            </Text>
                        </View>
                    }
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={styles.tile}
                            onPress={() => navigation.navigate('MediaViewer', { item, items: albumItems })}
                            onLongPress={() => handleRemove(item.filename)}
                            activeOpacity={0.85}
                        >
                            <Image source={{ uri: item.uri }} style={styles.tileImage} resizeMode="cover" />
                            {item.type === 'video' && (
                                <View style={styles.videoBadge}>
                                    <Ionicons name="videocam" size={12} color="#fff" />
                                </View>
                            )}
                        </TouchableOpacity>
                    )}
                />

                {albumItems.length > 0 && (
                    <Text style={styles.hint}>Long press a file to remove it from album</Text>
                )}
            </SafeAreaView>

            {/* Add files sheet */}
            <BottomSheet
                visible={showAddSheet}
                onClose={() => setShowAddSheet(false)}
                title="Add to Album"
                snapPoint={0.7}
            >
                {availableItems.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyTitle}>All files are in this album</Text>
                    </View>
                ) : (
                    <FlatList
                        data={availableItems}
                        keyExtractor={(item) => item.filename}
                        numColumns={COLUMN_COUNT}
                        columnWrapperStyle={styles.row}
                        contentContainerStyle={{ paddingBottom: 40 }}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={[styles.tile, { width: SHEET_ITEM_SIZE, height: SHEET_ITEM_SIZE }]}
                                onPress={() => handleAdd(item.filename)}
                                activeOpacity={0.85}
                            >
                                <Image source={{ uri: item.uri }} style={styles.tileImage} resizeMode="cover" />
                                {item.type === 'video' && (
                                    <View style={styles.videoBadge}>
                                        <Ionicons name="videocam" size={12} color="#fff" />
                                    </View>
                                )}
                                <View style={styles.addOverlay}>
                                    <Ionicons name="add-circle" size={28} color="#fff" />
                                </View>
                            </TouchableOpacity>
                        )}
                    />
                )}
            </BottomSheet>

            {toast && <Toast {...toast} onHide={hideToast} />}
        </View>
    );
}

const styles = StyleSheet.create({
    screen: { flex: 1 },
    header: {
        flexDirection: 'row', justifyContent: 'space-between',
        alignItems: 'center', paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md,
    },
    headerCenter: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
    albumIcon: { width: 28, height: 28, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
    headerTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: '#fff' },
    iconBtn: { width: 40, height: 40, borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
    grid: { paddingTop: GAP, paddingBottom: 100 },
    row: { gap: GAP, marginBottom: GAP },
    tile: { width: ITEM_SIZE, height: ITEM_SIZE, borderRadius: Radius.md, overflow: 'hidden', backgroundColor: '#1E1E2E' },
    tileImage: { width: '100%', height: '100%' },
    videoBadge: {
        position: 'absolute', bottom: 6, left: 6,
        backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: Radius.sm, padding: 4,
    },
    addOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.35)',
        alignItems: 'center', justifyContent: 'center',
    },
    emptyContainer: { alignItems: 'center', paddingTop: 60, gap: Spacing.md },
    emptyIcon: { width: 80, height: 80, borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
    emptyTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: '#fff' },
    emptySub: { fontSize: FontSize.sm, color: '#9BA1B4', textAlign: 'center' },
    hint: { textAlign: 'center', color: theme.textSecondary, fontSize: FontSize.xs, paddingBottom: Spacing.md },
});