import { Ionicons } from '@expo/vector-icons';
import { Dimensions, FlatList, Image, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import NoFavSVG from '../assets/Svg/NoFavSVG.svg';
import BottomNavBar from '../components/BottomNavBar';
import Header from '../components/Header'; // Import the new component
import { Colors, FontSize, FontWeight, Radius, Spacing } from '../constants/theme';
import { useVaultStorage } from '../context/VaultContext';

const { width } = Dimensions.get('window');
const GAP = 3;
const COLUMN_COUNT = 3;
const ITEM_SIZE = (width - GAP * (COLUMN_COUNT + 1)) / COLUMN_COUNT;
const theme = Colors.dark;

export default function FavouritesScreen({ navigation }) {
    const { favouriteItems } = useVaultStorage();

    return (
        <View style={[styles.screen, { backgroundColor: theme.background }]}>
            <SafeAreaView style={{ flex: 1 }} edges={['top']}>
                <StatusBar barStyle="light-content" backgroundColor={theme.background} />

                {/* --- NEW HEADER IMPLEMENTATION --- */}
                <Header
                    type="brand"
                    title="Favourites"
                    subtitle={favouriteItems.length > 0 ? `${favouriteItems.length} files` : null}
                />

                {favouriteItems.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <NoFavSVG width={100} height={120} />
                        <Text style={styles.emptyTitle}>No favourites yet</Text>
                        <Text style={styles.emptySub}>
                            Tap the heart icon on any file to add it to favourites.
                        </Text>
                    </View>
                ) : (
                    <FlatList
                        data={favouriteItems}
                        keyExtractor={(item) => item.filename}
                        numColumns={COLUMN_COUNT}
                        contentContainerStyle={styles.grid}
                        columnWrapperStyle={styles.row}
                        showsVerticalScrollIndicator={false}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={styles.tile}
                                onPress={() => navigation.navigate('MediaViewer', {
                                    item, items: favouriteItems,
                                })}
                                activeOpacity={0.85}
                            >
                                <Image source={{ uri: item.uri }} style={styles.tileImage} resizeMode="cover" />
                                <View style={styles.heartBadge}>
                                    <Ionicons name="heart" size={12} color="#EC4899" />
                                </View>
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

            <BottomNavBar
                active="Favourites"
                onNavigate={(screen) => navigation.navigate(screen)}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    screen: { flex: 1 },
    grid: { paddingHorizontal: GAP, paddingBottom: 120 },
    row: { gap: GAP, marginBottom: GAP },
    tile: {
        width: ITEM_SIZE, height: ITEM_SIZE,
        borderRadius: Radius.md, overflow: 'hidden', backgroundColor: '#1E1E2E',
    },
    tileImage: { width: '100%', height: '100%' },
    heartBadge: {
        position: 'absolute', top: 6, right: 6,
        backgroundColor: 'rgba(0,0,0,0.55)', borderRadius: Radius.sm, padding: 4,
    },
    videoBadge: {
        position: 'absolute', bottom: 6, left: 6,
        backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: Radius.sm, padding: 4,
    },
    emptyContainer: {
        flex: 1, alignItems: 'center', justifyContent: 'center',
        paddingHorizontal: 40, gap: Spacing.md, marginTop: -60,
    },
    emptyTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: '#fff', marginTop: Spacing.sm },
    emptySub: { fontSize: FontSize.sm, color: '#9BA1B4', textAlign: 'center', lineHeight: 20 },
});