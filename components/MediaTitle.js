import { Ionicons } from '@expo/vector-icons';
import { Dimensions, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Brand, Colors, FontSize, FontWeight, Radius, Spacing } from '../constants/theme';

const { width } = Dimensions.get('window');
const theme = Colors.dark;

// ── Shared Sub-Components ─────────────────────────────────────────────────────

const SelectionCircle = ({ isSelected }) => (
    <View style={[
        styles.selectionCircle,
        isSelected && { backgroundColor: Brand.primary, borderColor: Brand.primary }
    ]}>
        {isSelected && <Ionicons name="checkmark" size={13} color="#000" />}
    </View>
);

const VideoBadge = ({ visible, positionStyle }) => {
    if (!visible) return null;
    return (
        <View style={[styles.videoBadge, positionStyle]}>
            <Ionicons name="videocam" size={11} color="#fff" />
        </View>
    );
};

// ── 1. The Grid Variant (3x3) ────────────────────────────────────────────────
export const GridTile = ({ item, isSelected, isSelecting, onPress, onLongPress }) => (
    <TouchableOpacity
        style={styles.tile}
        onPress={() => onPress(item)}
        onLongPress={() => onLongPress(item)}
        activeOpacity={0.8}
    >
        <Image source={{ uri: item.uri }} style={styles.tileImage} />

        {/* Video: Bottom-Left */}
        <VideoBadge
            visible={item.type === 'video'}
            positionStyle={{ bottom: 6, left: 6 }}
        />

        {isSelecting && (
            <View style={[
                styles.selectionOverlay,
                isSelected && { backgroundColor: 'rgba(0,0,0,0.3)' } // Subtle dim when selected
            ]}>
                <SelectionCircle isSelected={isSelected} />
            </View>
        )}
    </TouchableOpacity>
);

// ── 2. The List Variant (Row) ────────────────────────────────────────────────
export const ListTile = ({ item, isSelected, isSelecting, onPress, onLongPress }) => (
    <TouchableOpacity
        style={[styles.listTile, isSelected && { backgroundColor: theme.overlay }]}
        onPress={() => onPress(item)}
        onLongPress={() => onLongPress(item)}
    >
        <View>
            <Image source={{ uri: item.uri }} style={styles.listImage} />
            <VideoBadge
                visible={item.type === 'video'}
                positionStyle={{ bottom: 4, left: 4 }}
            />
        </View>

        <View style={styles.listInfo}>
            <Text style={styles.listName} numberOfLines={1}>{item.filename}</Text>
            <Text style={styles.listSub}>{item.type.toUpperCase()}</Text>
        </View>

        {isSelecting && <SelectionCircle isSelected={isSelected} />}
    </TouchableOpacity>
);

// ── 3. The Card Variant (Large) ──────────────────────────────────────────────
export const CardTile = ({ item, isSelected, isSelecting, onPress, onLongPress, progress = 0.4 }) => (
    <TouchableOpacity
        style={styles.cardTile}
        onPress={() => onPress(item)}
        onLongPress={() => onLongPress(item)}
        activeOpacity={0.9}
    >
        <Image source={{ uri: item.uri }} style={styles.cardImage} resizeMode="cover" />

        <View style={styles.cardOverlay}>
            <View style={styles.cardHeader}>
                <Text style={styles.cardName} numberOfLines={1}>{item.filename}</Text>
                {item.type === 'video' && (
                    <View style={styles.cardVideoIcon}>
                        <Ionicons name="play" size={12} color="#fff" />
                    </View>
                )}
            </View>

            {item.type === 'video' && (
                <View style={styles.progressContainer}>
                    <View style={styles.progressBarBackground}>
                        <View style={[styles.progressBarFill, { width: `${progress * 100}%` }]} />
                    </View>
                </View>
            )}
        </View>

        {isSelecting && (
            <View style={styles.cardSelectionPos}>
                <SelectionCircle isSelected={isSelected} />
            </View>
        )}
    </TouchableOpacity>
);

// ── Styles ───────────────────────────────────────────────────────────────────

const GAP = 3;
const GRID_ITEM_SIZE = (width - GAP * 2) / 3;

const styles = StyleSheet.create({
    // Grid Styles
    tile: { width: GRID_ITEM_SIZE, height: GRID_ITEM_SIZE, overflow: 'hidden', backgroundColor: theme.elevated },
    tileImage: { width: '100%', height: '100%' },

    // List Styles
    listTile: {
        flexDirection: 'row', alignItems: 'center', padding: Spacing.md,
        borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: theme.border
    },
    listImage: { width: 52, height: 52, borderRadius: Radius.sm },
    listInfo: { flex: 1, marginLeft: Spacing.md },
    listName: { color: theme.text, fontSize: FontSize.md, fontWeight: FontWeight.medium },
    listSub: { color: theme.textSecondary, fontSize: FontSize.xs },

    // Card Styles
    cardTile: {
        height: 240, marginHorizontal: Spacing.lg, marginBottom: Spacing.md,
        borderRadius: Radius.lg, overflow: 'hidden', backgroundColor: theme.elevated,
        elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2, shadowRadius: 4
    },
    cardImage: { width: '100%', height: '100%' },
    cardOverlay: {
        position: 'absolute', bottom: 0, left: 0, right: 0,
        backgroundColor: 'rgba(0,0,0,0.65)', paddingTop: Spacing.md
    },
    cardHeader: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        paddingHorizontal: Spacing.md, paddingBottom: Spacing.md
    },
    cardName: { color: '#fff', fontSize: FontSize.sm, fontWeight: FontWeight.semibold, flex: 1 },
    cardVideoIcon: { backgroundColor: 'rgba(255,255,255,0.2)', padding: 4, borderRadius: 6, marginLeft: 8 },

    // Progress Bar
    progressContainer: { width: '100%', height: 4 },
    progressBarBackground: { flex: 1, backgroundColor: 'rgba(255,255,255,0.15)' },
    progressBarFill: { height: '100%', backgroundColor: Brand.primary },

    // Global Elements
    cardSelectionPos: { position: 'absolute', top: 16, right: 16, zIndex: 10 },
    selectionCircle: {
        width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: '#fff',
        alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.3)'
    },
    videoBadge: { position: 'absolute', backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 4, padding: 3 },
    selectionOverlay: { ...StyleSheet.absoluteFillObject, alignItems: 'flex-end', padding: 6 }
});