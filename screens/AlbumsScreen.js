import { Ionicons } from '@expo/vector-icons';
import { memo, useRef, useState } from 'react';
import {
    Dimensions,
    FlatList,
    ScrollView, StatusBar, StyleSheet,
    Text, TextInput, TouchableOpacity, View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import BottomSheet from '../components/BottomSheet';
import Toast, { useToast } from '../components/Toast';
import VaultModal from '../components/VaultModal';
import { Brand, Colors, FontWeight, Radius, Spacing } from '../constants/theme';
import { useVaultStorage } from '../context/VaultContext';

const theme = Colors.dark;
const { width } = Dimensions.get('window');
const COLUMN_WIDTH = (width - (Spacing.lg * 2) - (Spacing.sm * 2)) / 3;

const ALBUM_COLORS = [
    '#F59E0B', '#3B82F6', '#8B5CF6', '#22C55E',
    '#EF4444', '#EC4899', '#06B6D4', '#F97316',
];

const ALBUM_ICONS = [
    'folder-outline', 'image-outline', 'videocam-outline',
    'person-outline', 'briefcase-outline', 'heart-outline',
    'airplane-outline', 'home-outline', 'camera-outline', 'star-outline',
];

// --- SEPARATE FORM COMPONENT (Fixes Keyboard Disappearing) ---
const AlbumForm = ({ initialName = '', initialColor, initialIcon, onSubmit, submitLabel }) => {
    const [name, setName] = useState(initialName);
    const [color, setColor] = useState(initialColor || ALBUM_COLORS[0]);
    const [icon, setIcon] = useState(initialIcon || ALBUM_ICONS[0]);
    const inputRef = useRef(null);

    return (
        <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ paddingBottom: 40 }}
        >
            <Text style={styles.fieldLabel}>ALBUM NAME</Text>
            <View style={[styles.inputWrap, { backgroundColor: theme.overlay }]}>
                <TextInput
                    ref={inputRef}
                    style={[styles.input, { color: '#fff' }]}
                    placeholder="e.g. Private, Travel..."
                    placeholderTextColor={theme.textSecondary}
                    value={name}
                    onChangeText={setName}
                    maxLength={20}
                    returnKeyType="done"
                />
            </View>

            <Text style={[styles.fieldLabel, { marginTop: Spacing.lg }]}>COLOR</Text>
            <View style={styles.colorRow}>
                {ALBUM_COLORS.map(c => (
                    <TouchableOpacity
                        key={c}
                        style={[styles.colorDot, { backgroundColor: c }, color === c && styles.colorDotSelected]}
                        onPress={() => setColor(c)}
                    />
                ))}
            </View>

            <Text style={[styles.fieldLabel, { marginTop: Spacing.lg }]}>ICON</Text>
            <View style={styles.iconRow}>
                {ALBUM_ICONS.map(i => (
                    <TouchableOpacity
                        key={i}
                        style={[styles.iconOption, {
                            backgroundColor: icon === i ? color + '25' : theme.overlay,
                            borderColor: icon === i ? color : 'transparent',
                        }]}
                        onPress={() => setIcon(i)}
                    >
                        <Ionicons name={i} size={22} color={icon === i ? color : theme.textSecondary} />
                    </TouchableOpacity>
                ))}
            </View>

            <TouchableOpacity
                style={[styles.createBtn, { backgroundColor: name.trim() ? Brand.primary : theme.overlay }]}
                onPress={() => onSubmit({ name, icon, color })}
                disabled={!name.trim()}
            >
                <Text style={[styles.createBtnText, { color: name.trim() ? '#000' : theme.textSecondary }]}>
                    {submitLabel}
                </Text>
            </TouchableOpacity>
        </ScrollView>
    );
};

// --- GRID CARD COMPONENT ---
const AlbumCard = memo(({ item, onPress, onLongPress }) => (
    <TouchableOpacity
        style={[styles.card, { backgroundColor: theme.elevated }]}
        onPress={onPress}
        onLongPress={onLongPress}
        activeOpacity={0.7}
    >
        <View style={[styles.cardIcon, { backgroundColor: item.color + '20' }]}>
            <Ionicons name={item.icon} size={26} color={item.color} />
        </View>
        <Text style={styles.cardName} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.cardCount}>{item.fileNames.length} files</Text>
    </TouchableOpacity>
));

export default function AlbumsScreen({ navigation }) {
    const { albums, createAlbum, deleteAlbum, updateAlbum } = useVaultStorage();
    const { showSuccess, showError, hideToast, toast } = useToast();

    const [showCreateSheet, setShowCreateSheet] = useState(false);
    const [showOptionsSheet, setShowOptionsSheet] = useState(false);
    const [showEditSheet, setShowEditSheet] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedAlbum, setSelectedAlbum] = useState(null);

    const openOptions = (album) => {
        setSelectedAlbum(album);
        setShowOptionsSheet(true);
    };

    const handleCreate = async (data) => {
        try {
            await createAlbum(data.name.trim(), data.icon, data.color);
            setShowCreateSheet(false);
            showSuccess('Created!', `Album "${data.name}" created.`);
        } catch (e) {
            showError('Error', 'Could not create album.');
        }
    };

    const handleEdit = async (data) => {
        try {
            await updateAlbum(selectedAlbum.id, data);
            setShowEditSheet(false);
            showSuccess('Updated!', 'Album updated.');
        } catch (e) {
            showError('Error', 'Could not update album.');
        }
    };

    const handleDelete = async () => {
        try {
            await deleteAlbum(selectedAlbum.id);
            setShowDeleteModal(false);
            showSuccess('Deleted', 'Album removed.');
        } catch (e) {
            showError('Error', 'Could not delete.');
        }
    };

    return (
        <View style={[styles.screen, { backgroundColor: theme.background }]}>
            <SafeAreaView style={{ flex: 1 }} edges={['top']}>
                <StatusBar barStyle="light-content" />

                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Albums</Text>
                    <TouchableOpacity
                        style={[styles.iconBtn, { backgroundColor: theme.elevated }]}
                        onPress={() => setShowCreateSheet(true)}
                    >
                        <Ionicons name="add" size={24} color={Brand.primary} />
                    </TouchableOpacity>
                </View>

                <FlatList
                    data={albums}
                    keyExtractor={(item) => item.id}
                    numColumns={3}
                    columnWrapperStyle={styles.columnWrapper}
                    contentContainerStyle={styles.list}
                    showsVerticalScrollIndicator={false}
                    ListHeaderComponent={albums.length > 0 ? <Text style={styles.sectionLabel}>YOUR COLLECTION</Text> : null}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Ionicons name="folder-open-outline" size={48} color={theme.textSecondary} />
                            <Text style={styles.emptyTitle}>No albums</Text>
                        </View>
                    }
                    renderItem={({ item }) => (
                        <AlbumCard
                            item={item}
                            onPress={() => navigation.navigate('AlbumDetail', { albumId: item.id })}
                            onLongPress={() => openOptions(item)}
                        />
                    )}
                />
            </SafeAreaView>

            <BottomSheet visible={showCreateSheet} onClose={() => setShowCreateSheet(false)} title="New Album" snapPoint={0.8}>
                <AlbumForm onSubmit={handleCreate} submitLabel="Create Album" />
            </BottomSheet>

            <BottomSheet visible={showEditSheet} onClose={() => setShowEditSheet(false)} title="Edit Album" snapPoint={0.8}>
                <AlbumForm
                    initialName={selectedAlbum?.name}
                    initialColor={selectedAlbum?.color}
                    initialIcon={selectedAlbum?.icon}
                    onSubmit={handleEdit}
                    submitLabel="Save Changes"
                />
            </BottomSheet>

            <BottomSheet visible={showOptionsSheet} onClose={() => setShowOptionsSheet(false)} title={selectedAlbum?.name} snapPoint={0.3}>
                <TouchableOpacity style={styles.optionRow} onPress={() => { setShowOptionsSheet(false); setTimeout(() => setShowEditSheet(true), 400); }}>
                    <Ionicons name="pencil" size={20} color={Brand.primary} />
                    <Text style={styles.optionLabel}>Edit Album</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.optionRow} onPress={() => { setShowOptionsSheet(false); setTimeout(() => setShowDeleteModal(true), 400); }}>
                    <Ionicons name="trash" size={20} color="#EF4444" />
                    <Text style={[styles.optionLabel, { color: '#EF4444' }]}>Delete Album</Text>
                </TouchableOpacity>
            </BottomSheet>

            <VaultModal
                visible={showDeleteModal}
                title="Delete Album?"
                onPrimary={handleDelete}
                onSecondary={() => setShowDeleteModal(false)}
                primaryText="Delete"
                primaryDestructive
            />

            {toast && <Toast {...toast} onHide={hideToast} />}
        </View>
    );
}

const styles = StyleSheet.create({
    screen: { flex: 1 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: Spacing.lg },
    headerTitle: { fontSize: 28, fontWeight: FontWeight.bold, color: '#fff' },
    iconBtn: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
    sectionLabel: { fontSize: 10, fontWeight: 'bold', color: theme.textSecondary, letterSpacing: 1, marginBottom: 16 },
    list: { paddingHorizontal: Spacing.lg, paddingBottom: 100 },
    columnWrapper: { justifyContent: 'flex-start', gap: Spacing.sm },
    card: {
        width: COLUMN_WIDTH,
        aspectRatio: 0.9,
        borderRadius: Radius.lg,
        padding: Spacing.sm,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: Spacing.sm,
    },
    cardIcon: { width: 50, height: 50, borderRadius: 15, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
    cardName: { fontSize: 13, fontWeight: '600', color: '#fff', textAlign: 'center' },
    cardCount: { fontSize: 10, color: theme.textSecondary, marginTop: 2 },
    emptyContainer: { alignItems: 'center', marginTop: 100 },
    emptyTitle: { color: theme.textSecondary, marginTop: 10 },
    fieldLabel: { fontSize: 10, fontWeight: 'bold', color: theme.textSecondary, marginBottom: 8 },
    inputWrap: { borderRadius: Radius.md, padding: 12 },
    input: { fontSize: 16 },
    colorRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    colorDot: { width: 30, height: 30, borderRadius: 15 },
    colorDotSelected: { borderWidth: 2, borderColor: '#fff' },
    iconRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    iconOption: { width: 45, height: 45, borderRadius: 10, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
    createBtn: { borderRadius: 25, padding: 15, alignItems: 'center', marginTop: 20 },
    createBtnText: { fontWeight: 'bold' },
    optionRow: { flexDirection: 'row', alignItems: 'center', gap: 15, paddingVertical: 15 },
    optionLabel: { fontSize: 16, color: '#fff' },
});