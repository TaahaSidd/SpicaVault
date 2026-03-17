import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system/legacy';
import { useEffect, useRef, useState } from 'react';
import {
    Image, Keyboard, ScrollView, StatusBar,
    StyleSheet, Text, TextInput, TouchableOpacity, View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast, { useToast } from '../components/Toast';
import VaultModal from '../components/VaultModal';
import { Brand, Colors, FontSize, FontWeight, Radius, Spacing } from '../constants/theme';
import { VAULT_DIR } from '../context/VaultContext';

const theme = Colors.dark;

function InfoRow({ icon, label, value }) {
    return (
        <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
                <Ionicons name={icon} size={18} color={Brand.primary} />
            </View>
            <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>{label}</Text>
                <Text style={styles.infoValue}>{value || '—'}</Text>
            </View>
        </View>
    );
}

export default function MediaInfoScreen({ route, navigation }) {
    const { item } = route.params || {};
    const { toast, showSuccess, showError, hideToast } = useToast();

    const [fileInfo, setFileInfo] = useState(null);
    const [name, setName] = useState('');
    const [showRenameModal, setShowRenameModal] = useState(false);
    const [newName, setNewName] = useState('');
    const inputRef = useRef(null);

    useEffect(() => {
        loadFileInfo();
        const baseName = item?.filename?.replace(/\.[^/.]+$/, '') ?? '';
        setName(baseName);
    }, []);

    async function loadFileInfo() {
        try {
            const info = await FileSystem.getInfoAsync(item.uri, { size: true });
            setFileInfo(info);
        } catch (e) {
            console.error('Could not load file info:', e);
        }
    }

    function formatSize(bytes) {
        if (!bytes) return '—';
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    }

    function formatDate(timestamp) {
        if (!timestamp) return '—';
        return new Date(timestamp * 1000).toLocaleString();
    }

    const ext = item?.filename?.split('.').pop() ?? '';
    const fullNewName = `${newName.trim()}.${ext}`;

    async function handleRename() {
        if (!newName.trim()) return;
        try {
            const oldPath = `${VAULT_DIR}${item.filename}`;
            const newPath = `${VAULT_DIR}${fullNewName}`;
            await FileSystem.moveAsync({ from: oldPath, to: newPath });
            setName(newName.trim());
            setShowRenameModal(false);
            showSuccess('Renamed', `File renamed to ${fullNewName}`);
        } catch (e) {
            showError('Error', 'Could not rename file.');
        }
    }

    return (
        <View style={[styles.screen, { backgroundColor: theme.background }]}>
            <SafeAreaView style={{ flex: 1 }} edges={['top']}>
                <StatusBar barStyle="light-content" backgroundColor={theme.background} />

                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
                        <Ionicons name="chevron-back" size={24} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>File Info</Text>
                    <View style={{ width: 40 }} />
                </View>

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
                    {/* Preview */}
                    <View style={styles.previewWrap}>
                        {item?.type === 'video' ? (
                            <View style={[styles.preview, { backgroundColor: theme.elevated, justifyContent: 'center', alignItems: 'center' }]}>
                                <Ionicons name="videocam" size={48} color={Brand.primary} />
                            </View>
                        ) : (
                            <Image source={{ uri: item?.uri }} style={styles.preview} resizeMode="cover" />
                        )}
                    </View>

                    {/* Name + rename */}
                    <View style={styles.nameRow}>
                        <View style={styles.nameTextWrap}>
                            <Text style={styles.fileName} numberOfLines={2}>{name}.{ext}</Text>
                        </View>
                        <TouchableOpacity
                            style={[styles.renameBtn, { backgroundColor: Brand.primary + '15' }]}
                            onPress={() => { setNewName(name); setShowRenameModal(true); }}
                            activeOpacity={0.7}
                        >
                            <Ionicons name="pencil" size={16} color={Brand.primary} />
                            <Text style={[styles.renameBtnText, { color: Brand.primary }]}>Rename</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Info rows */}
                    <View style={[styles.infoCard, { backgroundColor: theme.elevated }]}>
                        <InfoRow icon="document-outline" label="Type" value={item?.type === 'video' ? 'Video' : 'Photo'} />
                        <View style={styles.divider} />
                        <InfoRow icon="resize-outline" label="File size" value={formatSize(fileInfo?.size)} />
                        <View style={styles.divider} />
                        <InfoRow icon="calendar-outline" label="Added to vault" value={formatDate(item?.createdAt)} />
                        <View style={styles.divider} />
                        <InfoRow icon="time-outline" label="Modified" value={formatDate(fileInfo?.modificationTime)} />
                        <View style={styles.divider} />
                        <InfoRow icon="folder-outline" label="Location" value="Private vault storage" />
                    </View>

                    {/* Security note */}
                    <View style={[styles.securityNote, { backgroundColor: Brand.primary + '10', borderColor: Brand.primary + '30' }]}>
                        <Ionicons name="shield-checkmark-outline" size={18} color={Brand.primary} />
                        <Text style={[styles.securityText, { color: Brand.primary }]}>
                            Stored in private app storage — not accessible from gallery or file manager.
                        </Text>
                    </View>
                </ScrollView>
            </SafeAreaView>

            {/* Rename modal */}
            <VaultModal
                visible={showRenameModal}
                icon="edit"
                title="Rename File"
                message={null}
                primaryText="Rename"
                secondaryText="Cancel"
                onPrimary={handleRename}
                onSecondary={() => setShowRenameModal(false)}
                onClose={() => setShowRenameModal(false)}
                customContent={
                    <View style={[styles.renameInput, { backgroundColor: theme.overlay }]}>
                        <TextInput
                            ref={inputRef}
                            style={[styles.renameTextInput, { color: '#fff' }]}
                            value={newName}
                            onChangeText={setNewName}
                            placeholder="File name"
                            placeholderTextColor={theme.textSecondary}
                            autoFocus
                            returnKeyType="done"
                            onSubmitEditing={Keyboard.dismiss}
                        />
                        <Text style={styles.extLabel}>.{ext}</Text>
                    </View>
                }
            />

            {toast && <Toast {...toast} onHide={hideToast} />}
        </View>
    );
}

const styles = StyleSheet.create({
    screen: { flex: 1 },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: Spacing.md, paddingVertical: Spacing.md,
    },
    backBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
    headerTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: '#fff' },
    content: { paddingHorizontal: Spacing.lg, paddingBottom: 40, gap: Spacing.lg },
    previewWrap: { borderRadius: Radius.xl, overflow: 'hidden' },
    preview: { width: '100%', height: 220, borderRadius: Radius.xl },
    nameRow: {
        flexDirection: 'row', alignItems: 'center',
        justifyContent: 'space-between', gap: Spacing.md,
    },
    nameTextWrap: { flex: 1 },
    fileName: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: '#fff' },
    renameBtn: {
        flexDirection: 'row', alignItems: 'center', gap: 6,
        paddingHorizontal: Spacing.md, paddingVertical: 8,
        borderRadius: Radius.full,
    },
    renameBtnText: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold },
    infoCard: { borderRadius: Radius.xl, overflow: 'hidden' },
    infoRow: { flexDirection: 'row', alignItems: 'center', padding: Spacing.lg, gap: Spacing.md },
    infoIcon: { width: 36, height: 36, borderRadius: Radius.md, backgroundColor: Brand.primary + '15', alignItems: 'center', justifyContent: 'center' },
    infoContent: { flex: 1 },
    infoLabel: { fontSize: FontSize.xs, color: Colors.dark.textSecondary, marginBottom: 2 },
    infoValue: { fontSize: FontSize.sm, fontWeight: FontWeight.medium, color: '#fff' },
    divider: { height: 0.5, backgroundColor: Colors.dark.border, marginLeft: Spacing.lg + 36 + Spacing.md },
    securityNote: {
        flexDirection: 'row', alignItems: 'flex-start',
        gap: Spacing.sm, padding: Spacing.md,
        borderRadius: Radius.lg, borderWidth: 1,
    },
    securityText: { flex: 1, fontSize: FontSize.xs, lineHeight: 18 },
    renameInput: {
        flexDirection: 'row', alignItems: 'center',
        borderRadius: Radius.lg, paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm, marginTop: Spacing.sm,
    },
    renameTextInput: { flex: 1, fontSize: FontSize.md },
    extLabel: { color: Colors.dark.textSecondary, fontSize: FontSize.md },
});