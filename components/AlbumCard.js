import { Ionicons } from '@expo/vector-icons';
import { memo } from 'react';
import { Dimensions, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors, Radius, Spacing } from '../constants/theme';
import { useVaultStorage } from '../context/VaultContext';

const theme = Colors.dark;
const { width } = Dimensions.get('window');
const COLUMN_WIDTH = (width - (Spacing.lg * 2) - (Spacing.md * 2)) / 3;

const AlbumCard = memo(({ item, onPress, onLongPress }) => {
    const { vaultItems } = useVaultStorage();

    // Find the cover image from the vault items
    const coverFile = vaultItems.find(f => f.filename === (item.thumbnail || item.fileNames[0]));
    const thumbnailUri = coverFile?.uri;

    return (
        <TouchableOpacity
            style={styles.card}
            onPress={onPress}
            onLongPress={onLongPress}
            activeOpacity={0.7}
        >
            <View style={[styles.cardThumbnail, { backgroundColor: theme.elevated }]}>
                {thumbnailUri ? (
                    <Image
                        source={{ uri: thumbnailUri }}
                        style={styles.thumbnailImage}
                        resizeMode="cover"
                    />
                ) : (
                    <Ionicons name="folder" size={32} color={theme.textSecondary + '40'} />
                )}
            </View>
            <View style={styles.cardInfo}>
                <Text style={styles.cardName} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.cardCount}>{item.fileNames.length}</Text>
            </View>
        </TouchableOpacity>
    );
});

const styles = StyleSheet.create({
    card: {
        width: COLUMN_WIDTH,
        marginBottom: Spacing.sm
    },
    cardThumbnail: {
        width: COLUMN_WIDTH,
        height: COLUMN_WIDTH,
        borderRadius: Radius.lg,
        overflow: 'hidden',
        alignItems: 'center',
        justifyContent: 'center',
    },
    thumbnailImage: {
        width: '100%',
        height: '100%'
    },
    cardInfo: {
        marginTop: 6,
        paddingHorizontal: 2
    },
    cardName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#fff'
    },
    cardCount: {
        fontSize: 12,
        color: theme.textSecondary,
        marginTop: 1
    },
});

export default AlbumCard;