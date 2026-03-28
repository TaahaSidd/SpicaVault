import { Ionicons } from '@expo/vector-icons';
import { Dimensions, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Brand, Colors, FontSize, FontWeight, Radius, Spacing } from '../constants/theme';

const { width } = Dimensions.get('window');
const theme = Colors.dark;

// Shared Sub-Components
const SelectionCircle = ({ isSelected }) => (
    <View style={[styles.selectionCircle, isSelected && { backgroundColor: Brand.primary, borderColor: Brand.primary }]}>
        {isSelected && <Ionicons name="checkmark" size={13} color="#000" />}
    </View>
);

const VideoBadge = ({ visible }) => {
    if (!visible) return null;
    return (
        <View style={styles.videoBadge}>
            <Ionicons name="videocam" size={11} color="#fff" />
        </View>
    );
};

// 1. The Grid Variant (3x3)
export const GridTile = ({ item, isSelected, isSelecting, onPress, onLongPress }) => (
    <TouchableOpacity
        style={[styles.tile, isSelected && styles.tileSelected]}
        onPress={() => onPress(item)}
        onLongPress={() => onLongPress(item)}
    >
        <Image source={{ uri: item.uri }} style={styles.tileImage} />
        <VideoBadge visible={item.type === 'video' && !isSelected} />
        {isSelecting && (
            <View style={[styles.selectionOverlay, isSelected && { backgroundColor: 'rgba(0,0,0,0.35)' }]}>
                <SelectionCircle isSelected={isSelected} />
            </View>
        )}
    </TouchableOpacity>
);

// 2. The List Variant (Row)
export const ListTile = ({ item, isSelected, isSelecting, onPress, onLongPress }) => (
    <TouchableOpacity
        style={[styles.listTile, isSelected && { backgroundColor: theme.overlay }]}
        onPress={() => onPress(item)}
        onLongPress={() => onLongPress(item)}
    >
        <Image source={{ uri: item.uri }} style={styles.listImage} />
        <View style={styles.listInfo}>
            <Text style={styles.listName} numberOfLines={1}>{item.filename}</Text>
            <Text style={styles.listSub}>{item.type.toUpperCase()}</Text>
        </View>
        {isSelecting && <SelectionCircle isSelected={isSelected} />}
    </TouchableOpacity>
);

// 3. The Card Variant (Large)
export const CardTile = ({ item, isSelected, isSelecting, onPress, onLongPress }) => (
    <TouchableOpacity
        style={styles.cardTile}
        onPress={() => onPress(item)}
        onLongPress={() => onLongPress(item)}
    >
        <Image source={{ uri: item.uri }} style={styles.cardImage} />
        <View style={styles.cardOverlay}>
            <Text style={styles.cardName} numberOfLines={1}>{item.filename}</Text>
            <VideoBadge visible={item.type === 'video'} />
        </View>
        {isSelecting && (
            <View style={styles.cardSelectionPos}>
                <SelectionCircle isSelected={isSelected} />
            </View>
        )}
    </TouchableOpacity>
);

const GAP = 3;
const GRID_ITEM_SIZE = (width - GAP * 2) / 3;

const styles = StyleSheet.create({
    tile: { width: GRID_ITEM_SIZE, height: GRID_ITEM_SIZE, overflow: 'hidden', backgroundColor: theme.elevated },
    tileSelected: { opacity: 0.7 },
    tileImage: { width: '100%', height: '100%' },
    listTile: {
        flexDirection: 'row', alignItems: 'center', padding: Spacing.md,
        borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: theme.border
    },
    listImage: { width: 50, height: 50, borderRadius: Radius.sm },
    listInfo: { flex: 1, marginLeft: Spacing.md },
    listName: { color: theme.text, fontSize: FontSize.md, fontWeight: FontWeight.medium },
    listSub: { color: theme.textSecondary, fontSize: FontSize.xs },
    cardTile: { height: 220, marginHorizontal: Spacing.lg, marginBottom: Spacing.md, borderRadius: Radius.lg, overflow: 'hidden' },
    cardImage: { width: '100%', height: '100%' },
    cardOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: Spacing.md, backgroundColor: 'rgba(0,0,0,0.5)', flexDirection: 'row', justifyContent: 'space-between' },
    cardName: { color: '#fff', fontSize: FontSize.sm, fontWeight: FontWeight.semibold },
    cardSelectionPos: { position: 'absolute', top: 12, right: 12 },
    selectionCircle: { width: 22, height: 22, borderRadius: 11, borderWidth: 1.5, borderColor: '#fff', alignItems: 'center', justifyContent: 'center' },
    videoBadge: { position: 'absolute', top: 6, right: 6, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 4, padding: 2 },
    selectionOverlay: { ...StyleSheet.absoluteFillObject, alignItems: 'flex-end', padding: 6 }
});