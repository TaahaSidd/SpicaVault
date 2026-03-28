import { Ionicons } from '@expo/vector-icons';
import { FlatList, Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Brand, Spacing } from '../constants/theme';

// Samsung-style: Taller and narrower (approx 2:3 ratio)
const THUMB_WIDTH = 42;
const THUMB_HEIGHT = 64;
const THUMB_GAP = 6;

export default function ThumbnailStrip({ items, currentIndex, onSelect }) {
    return (
        <FlatList
            data={items}
            horizontal
            keyExtractor={(item, index) => item.uri + index}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.stripContent}
            style={styles.strip}
            renderItem={({ item, index }) => {
                const isActive = index === currentIndex;
                return (
                    <TouchableOpacity
                        onPress={() => onSelect(index)}
                        activeOpacity={0.8}
                        style={[
                            styles.thumb,
                            isActive && styles.thumbActive
                        ]}
                    >
                        <Image
                            source={{ uri: item.uri }}
                            style={styles.thumbImage}
                            resizeMode="cover"
                        />

                        {item.type === 'video' && (
                            <View style={styles.thumbVideoIcon}>
                                <Ionicons name="play" size={8} color="#fff" />
                            </View>
                        )}

                        {/* Samsung style accent border */}
                        {isActive && <View style={styles.thumbBorder} />}
                    </TouchableOpacity>
                );
            }}
        />
    );
}

const styles = StyleSheet.create({
    strip: {
        height: THUMB_HEIGHT + 20,
    },
    stripContent: {
        paddingHorizontal: Spacing.md,
        alignItems: 'center',
        gap: THUMB_GAP,
    },
    thumb: {
        width: THUMB_WIDTH,
        height: THUMB_HEIGHT,
        borderRadius: 10, // Samsung uses very rounded corners
        overflow: 'hidden',
        backgroundColor: '#1a1a1a',
        opacity: 0.6,
    },
    thumbActive: {
        opacity: 1,
        // Optional: Samsung often slightly scales up the active thumb
        // transform: [{ scale: 1.05 }] 
    },
    thumbImage: {
        width: '100%',
        height: '100%',
    },
    thumbVideoIcon: {
        position: 'absolute',
        top: 4,
        right: 4,
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderRadius: 4,
        padding: 2,
    },
    thumbBorder: {
        ...StyleSheet.absoluteFillObject,
        borderWidth: 2,
        borderColor: Brand.primary, // Using your accent color
        borderRadius: 10,
        backgroundColor: 'rgba(255,255,255,0.05)', // Very slight inner glow
    },
});