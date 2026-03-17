import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
    Dimensions, FlatList, Image, StatusBar,
    StyleSheet, Text, TextInput, TouchableOpacity, View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Brand, Colors, FontSize, FontWeight, Radius, Spacing } from '../constants/theme';
import { useVaultStorage } from '../context/VaultContext';

const { width } = Dimensions.get('window');
const GAP = 3;
const COLUMN_COUNT = 3;
const ITEM_SIZE = (width - GAP * (COLUMN_COUNT + 1)) / COLUMN_COUNT;
const theme = Colors.dark;

export default function SearchScreen({ navigation }) {
    const { vaultItems } = useVaultStorage();
    const [query, setQuery] = useState('');

    const filtered = query.trim().length === 0
        ? []
        : vaultItems.filter(i =>
            i.filename.toLowerCase().includes(query.toLowerCase())
        );

    return (
        <View style={[styles.screen, { backgroundColor: theme.background }]}>
            <SafeAreaView style={{ flex: 1 }} edges={['top']}>
                <StatusBar barStyle="light-content" backgroundColor={theme.background} />

                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Search</Text>
                </View>

                {/* Search Bar */}
                <View style={[styles.searchBar, { backgroundColor: theme.elevated }]}>
                    <Ionicons name="search-outline" size={18} color={theme.textSecondary} />
                    <TextInput
                        style={[styles.searchInput, { color: '#fff' }]}
                        placeholder="Search files..."
                        placeholderTextColor={theme.textSecondary}
                        value={query}
                        onChangeText={setQuery}
                        autoCapitalize="none"
                    />
                    {query.length > 0 && (
                        <TouchableOpacity onPress={() => setQuery('')} activeOpacity={0.7}>
                            <Ionicons name="close-circle" size={18} color={theme.textSecondary} />
                        </TouchableOpacity>
                    )}
                </View>

                {/* Results or Empty state */}
                {query.trim().length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <View style={[styles.emptyIconWrap, { backgroundColor: Brand.primary + '15' }]}>
                            <Ionicons name="search" size={36} color={Brand.primary} />
                        </View>
                        <Text style={styles.emptyTitle}>Search your vault</Text>
                        <Text style={styles.emptySub}>Type a filename to find your files.</Text>
                    </View>
                ) : filtered.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <View style={[styles.emptyIconWrap, { backgroundColor: theme.elevated }]}>
                            <Ionicons name="sad-outline" size={36} color={theme.textSecondary} />
                        </View>
                        <Text style={styles.emptyTitle}>No results</Text>
                        <Text style={styles.emptySub}>No files matched "{query}"</Text>
                    </View>
                ) : (
                    <FlatList
                        data={filtered}
                        keyExtractor={(item) => item.filename}
                        numColumns={COLUMN_COUNT}
                        contentContainerStyle={styles.grid}
                        columnWrapperStyle={styles.row}
                        showsVerticalScrollIndicator={false}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={styles.tile}
                                onPress={() => navigation.navigate('MediaViewer', { item, items: filtered })}
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
                )}
            </SafeAreaView>

        </View>
    );
}

const styles = StyleSheet.create({
    screen: { flex: 1 },
    header: {
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.md,
    },
    headerTitle: {
        fontSize: 26,
        fontWeight: FontWeight.bold,
        color: '#fff',
        letterSpacing: -0.3,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: Spacing.lg,
        marginBottom: Spacing.lg,
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm + 4,
        borderRadius: Radius.lg,
        gap: Spacing.sm,
    },
    searchInput: {
        flex: 1,
        fontSize: FontSize.md,
    },
    grid: {
        paddingHorizontal: GAP,
        paddingBottom: 120,
    },
    row: { gap: GAP, marginBottom: GAP },
    tile: {
        width: ITEM_SIZE, height: ITEM_SIZE,
        borderRadius: Radius.md,
        overflow: 'hidden',
        backgroundColor: '#1E1E2E',
    },
    tileImage: { width: '100%', height: '100%' },
    videoBadge: {
        position: 'absolute',
        top: 6, right: 6,
        backgroundColor: 'rgba(0,0,0,0.6)',
        borderRadius: Radius.sm,
        padding: 4,
    },
    emptyContainer: {
        flex: 1, alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 40, gap: Spacing.md,
    },
    emptyIconWrap: {
        width: 80, height: 80, borderRadius: 999,
        alignItems: 'center', justifyContent: 'center',
        marginBottom: Spacing.sm,
    },
    emptyTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: '#fff' },
    emptySub: { fontSize: FontSize.sm, color: '#9BA1B4', textAlign: 'center' },
});