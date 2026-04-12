/**
 * StorageCleanupScreen.js
 *
 * Modes (via route.params.filterType):
 *   'photo'      — all photos, sortable by size / date
 *   'video'      — all videos, sortable by size / date
 *   'large'      — files > 10MB, largest first
 *   'duplicates' — files with identical original_name, grouped
 */

import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import {
    Dimensions, FlatList, Image,
    StyleSheet, Text, TouchableOpacity, View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, FontSize, FontWeight, Radius, Spacing } from '../constants/theme';
import { useVaultStorage } from '../context/VaultContext';

const { width } = Dimensions.get('window');
const COLUMN_COUNT = 3;
const GAP = 2;
const ITEM_SIZE = (width - GAP * (COLUMN_COUNT + 1)) / COLUMN_COUNT;
const LARGE_THRESHOLD = 10 * 1024 * 1024; // 10 MB
const theme = Colors.dark;

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatSize(bytes) {
    if (!bytes || bytes === 0) return '—';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function totalSize(items) {
    return items.reduce((acc, i) => acc + (i.sizeBytes ?? 0), 0);
}

// ─── Grid tile ────────────────────────────────────────────────────────────────
function CleanupTile({ item, onPress }) {
    return (
        <TouchableOpacity style={styles.tile} onPress={() => onPress(item)} activeOpacity={0.8}>
            <Image source={{ uri: item.uri }} style={styles.image} resizeMode="cover" />

            {/* Size badge bottom-right */}
            <View style={styles.sizeBadge}>
                <Text style={styles.sizeText}>{formatSize(item.sizeBytes)}</Text>
            </View>

            {/* Video indicator */}
            {item.type === 'video' && (
                <View style={styles.videoIcon}>
                    <Ionicons name="play" size={11} color="#fff" />
                </View>
            )}
        </TouchableOpacity>
    );
}

// ─── Duplicate group row ──────────────────────────────────────────────────────
function DuplicateGroup({ group, onPress }) {
    const [expanded, setExpanded] = useState(false);
    const shown = expanded ? group : group.slice(0, 3);

    return (
        <View style={styles.dupGroup}>
            <TouchableOpacity style={styles.dupHeader} onPress={() => setExpanded(e => !e)} activeOpacity={0.7}>
                <Image source={{ uri: group[0].uri }} style={styles.dupThumb} resizeMode="cover" />
                <View style={styles.dupInfo}>
                    <Text style={styles.dupName} numberOfLines={1}>
                        {group[0].originalName ?? group[0].filename}
                    </Text>
                    <Text style={styles.dupSub}>
                        {group.length} copies · {formatSize(totalSize(group))}
                    </Text>
                </View>
                <Ionicons
                    name={expanded ? 'chevron-up' : 'chevron-down'}
                    size={16} color={theme.textSecondary}
                />
            </TouchableOpacity>

            {expanded && (
                <View style={styles.dupGrid}>
                    {group.map(item => (
                        <CleanupTile key={item.filename} item={item} onPress={onPress} />
                    ))}
                </View>
            )}
        </View>
    );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function StorageCleanupScreen({ route, navigation }) {
    const { filterType, title } = route.params || {};
    const { vaultItems = [] } = useVaultStorage();
    const [sortBySize, setSortBySize] = useState(true);

    const handleTilePress = (item) => {
        navigation.navigate('MediaViewer', { item, items: vaultItems });
    };

    // ── Filter + sort for photo/video/large modes ──────────────────────────
    const displayItems = useMemo(() => {
        let items;

        if (filterType === 'large') {
            items = vaultItems.filter(i => (i.sizeBytes ?? 0) >= LARGE_THRESHOLD);
        } else {
            items = vaultItems.filter(i => i.type === filterType);
        }

        if (sortBySize) {
            return [...items].sort((a, b) => (b.sizeBytes ?? 0) - (a.sizeBytes ?? 0));
        }
        return [...items].sort((a, b) => (b.importedAt ?? 0) - (a.importedAt ?? 0));
    }, [vaultItems, filterType, sortBySize]);

    // ── Duplicate detection ────────────────────────────────────────────────
    // Groups files by original_name — same name = potential duplicate
    const duplicateGroups = useMemo(() => {
        if (filterType !== 'duplicates') return [];
        const map = {};
        for (const item of vaultItems) {
            const key = item.originalName ?? item.filename;
            if (!map[key]) map[key] = [];
            map[key].push(item);
        }
        // Only return groups with more than 1 file
        return Object.values(map)
            .filter(g => g.length > 1)
            .sort((a, b) => b.length - a.length); // most duplicates first
    }, [vaultItems, filterType]);

    const totalDupSize = useMemo(() =>
        duplicateGroups.reduce((acc, g) => acc + totalSize(g.slice(1)), 0),
        [duplicateGroups]
    );

    // ── Duplicates mode ────────────────────────────────────────────────────
    if (filterType === 'duplicates') {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <Ionicons name="chevron-back" size={24} color="#fff" />
                    </TouchableOpacity>
                    <View style={styles.headerText}>
                        <Text style={styles.headerTitle}>Duplicates</Text>
                        <Text style={styles.headerSub}>
                            {duplicateGroups.length} groups · {formatSize(totalDupSize)} reclaimable
                        </Text>
                    </View>
                </View>

                {duplicateGroups.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Ionicons name="checkmark-circle-outline" size={52} color={theme.textSecondary} />
                        <Text style={styles.emptyTitle}>No duplicates found</Text>
                        <Text style={styles.emptySub}>All files in your vault have unique names.</Text>
                    </View>
                ) : (
                    <FlatList
                        data={duplicateGroups}
                        keyExtractor={(g) => g[0].originalName ?? g[0].filename}
                        contentContainerStyle={{ paddingBottom: 40 }}
                        ItemSeparatorComponent={() => <View style={styles.separator} />}
                        renderItem={({ item: group }) => (
                            <DuplicateGroup group={group} onPress={handleTilePress} />
                        )}
                    />
                )}
            </SafeAreaView>
        );
    }

    // ── Photo / Video / Large modes ────────────────────────────────────────
    const totalBytes = totalSize(displayItems);

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="chevron-back" size={24} color="#fff" />
                </TouchableOpacity>
                <View style={styles.headerText}>
                    <Text style={styles.headerTitle}>{title ?? 'Files'}</Text>
                    <Text style={styles.headerSub}>
                        {displayItems.length} items · {formatSize(totalBytes)}
                    </Text>
                </View>
                <TouchableOpacity
                    onPress={() => setSortBySize(s => !s)}
                    style={[styles.sortBtn, sortBySize && styles.sortBtnActive]}
                    activeOpacity={0.7}
                >
                    <Ionicons
                        name="swap-vertical"
                        size={18}
                        color={sortBySize ? '#fff' : theme.textSecondary}
                    />
                </TouchableOpacity>
            </View>

            {/* Sort label */}
            <View style={styles.sortLabelRow}>
                <Text style={styles.sortLabel}>
                    Sorted by {sortBySize ? 'size (largest first)' : 'date (newest first)'}
                </Text>
            </View>

            {displayItems.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Ionicons name="file-tray-outline" size={52} color={theme.textSecondary} />
                    <Text style={styles.emptyTitle}>Nothing here</Text>
                    <Text style={styles.emptySub}>
                        {filterType === 'large'
                            ? 'No files larger than 10 MB in your vault.'
                            : `No ${filterType}s in your vault yet.`}
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={displayItems}
                    keyExtractor={(item) => item.filename}
                    numColumns={COLUMN_COUNT}
                    contentContainerStyle={styles.grid}
                    columnWrapperStyle={styles.gridRow}
                    showsVerticalScrollIndicator={false}
                    renderItem={({ item }) => (
                        <CleanupTile item={item} onPress={handleTilePress} />
                    )}
                />
            )}
        </SafeAreaView>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    container: { flex: 1 },

    header: {
        flexDirection: 'row', alignItems: 'center',
        paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, gap: Spacing.md,
    },
    headerText: { flex: 1 },
    headerTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: '#fff' },
    headerSub: { fontSize: FontSize.xs, color: theme.textSecondary, marginTop: 2 },
    backBtn: { width: 32, height: 32, justifyContent: 'center' },
    sortBtn: {
        width: 36, height: 36, borderRadius: Radius.full,
        backgroundColor: 'rgba(255,255,255,0.05)',
        alignItems: 'center', justifyContent: 'center',
    },
    sortBtnActive: { backgroundColor: 'rgba(255,255,255,0.15)' },

    sortLabelRow: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.sm },
    sortLabel: { fontSize: FontSize.xs, color: theme.textSecondary },

    // Grid
    grid: { padding: GAP, paddingBottom: 40 },
    gridRow: { gap: GAP, marginBottom: GAP },
    tile: {
        width: ITEM_SIZE, height: ITEM_SIZE,
        backgroundColor: theme.elevated,
        borderRadius: Radius.xs, overflow: 'hidden',
    },
    image: { width: '100%', height: '100%' },
    sizeBadge: {
        position: 'absolute', bottom: 4, right: 4,
        backgroundColor: 'rgba(0,0,0,0.65)',
        paddingHorizontal: 5, paddingVertical: 2, borderRadius: 4,
    },
    sizeText: { color: '#fff', fontSize: 9, fontWeight: '700' },
    videoIcon: {
        position: 'absolute', top: 4, left: 4,
        backgroundColor: 'rgba(0,0,0,0.5)',
        width: 20, height: 20, borderRadius: 10,
        alignItems: 'center', justifyContent: 'center',
    },

    // Duplicates
    dupGroup: { paddingHorizontal: Spacing.lg },
    dupHeader: {
        flexDirection: 'row', alignItems: 'center',
        paddingVertical: Spacing.md, gap: Spacing.md,
    },
    dupThumb: { width: 48, height: 48, borderRadius: Radius.sm },
    dupInfo: { flex: 1 },
    dupName: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: '#fff' },
    dupSub: { fontSize: FontSize.xs, color: theme.textSecondary, marginTop: 2 },
    dupGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: GAP, paddingBottom: Spacing.md },
    separator: { height: StyleSheet.hairlineWidth, backgroundColor: theme.border, marginHorizontal: Spacing.lg },

    // Empty
    emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.md, paddingHorizontal: 40 },
    emptyTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: '#fff' },
    emptySub: { fontSize: FontSize.sm, color: theme.textSecondary, textAlign: 'center', lineHeight: 20 },
});