import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system/legacy';
import { useEffect, useRef, useState } from 'react';
import {
    Image,
    ScrollView, StatusBar,
    StyleSheet, Text, TextInput, TouchableOpacity, View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast, { useToast } from '../components/Toast';
import VaultModal from '../components/VaultModal';
import { Colors, FontSize, FontWeight, Radius, Spacing } from '../constants/theme';
import { VAULT_DIR } from '../context/VaultContext';

const theme = Colors.dark;

// Refactored for a cleaner, monochrome look
function InfoRow({ icon, label, value, isLast }) {
    return (
        <>
            <View style={styles.infoRow}>
                <View style={styles.infoIcon}>
                    <Ionicons name={icon} size={18} color={theme.text} />
                </View>
                <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>{label}</Text>
                    <Text style={styles.infoValue}>{value || '—'}</Text>
                </View>
            </View>
            {!isLast && <View style={styles.divider} />}
        </>
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

    const formatSize = (bytes) => {
        if (!bytes) return '—';
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    const formatDate = (timestamp) => {
        if (!timestamp) return '—';
        return new Date(timestamp * 1000).toLocaleDateString([], {
            month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    };

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
            showSuccess('Renamed', 'File updated successfully');
        } catch (e) {
            showError('Error', 'Could not rename file.');
        }
    }

    return (
        <View style={[styles.screen, { backgroundColor: theme.background }]}>
            <SafeAreaView style={{ flex: 1 }} edges={['top']}>
                <StatusBar barStyle="light-content" />

                {/* Simplified Header */}
                <View style={styles.header}>
                    <TouchableOpacity
                        style={[styles.backBtn, { backgroundColor: theme.elevated }]}
                        onPress={() => navigation.goBack()}
                    >
                        <Ionicons name="chevron-back" size={20} color={theme.text} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>File Details</Text>
                    <View style={{ width: 40 }} />
                </View>

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
                    {/* Preview Section - Modern Rounded */}
                    <View style={[styles.previewWrap, { backgroundColor: theme.elevated }]}>
                        {item?.type === 'video' ? (
                            <View style={styles.videoPlaceholder}>
                                <Ionicons name="play-circle-outline" size={48} color={theme.textSecondary} />
                            </View>
                        ) : (
                            <Image source={{ uri: item?.uri }} style={styles.preview} resizeMode="cover" />
                        )}
                    </View>

                    {/* Metadata Header */}
                    <View style={styles.nameSection}>
                        <View style={styles.nameTextWrap}>
                            <Text style={styles.fileName} numberOfLines={2}>{name}.{ext}</Text>
                            <Text style={styles.fileTypeBadge}>{item?.type?.toUpperCase()}</Text>
                        </View>
                        <TouchableOpacity
                            style={[styles.actionBtn, { backgroundColor: theme.elevated }]}
                            onPress={() => { setNewName(name); setShowRenameModal(true); }}
                        >
                            <Ionicons name="pencil" size={14} color={theme.text} />
                            <Text style={styles.actionBtnText}>Rename</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Info List Section */}
                    <View style={[styles.infoCard, { backgroundColor: theme.elevated }]}>
                        <InfoRow icon="resize-outline" label="Size" value={formatSize(fileInfo?.size)} />
                        <InfoRow icon="calendar-outline" label="Created" value={formatDate(item?.createdAt)} />
                        <InfoRow icon="time-outline" label="Modified" value={formatDate(fileInfo?.modificationTime)} />
                        <InfoRow icon="folder-open-outline" label="Path" value="Encrypted Vault" isLast />
                    </View>

                    {/* Security Footnote - Monochrome */}
                    {/* <View style={[styles.securityNote, { borderColor: theme.border }]}>
                        <Ionicons name="lock-closed-outline" size={14} color={theme.textSecondary} />
                        <Text style={styles.securityText}>
                            This file is isolated from the system gallery and remains encrypted within your private directory.
                        </Text>
                    </View> */}
                </ScrollView>
            </SafeAreaView>

            {/* Rename Modal refitted for monochrome */}
            <VaultModal
                visible={showRenameModal}
                icon="edit"
                title="Rename File"
                primaryText="Save"
                secondaryText="Cancel"
                onPrimary={handleRename}
                onSecondary={() => setShowRenameModal(false)}
                onClose={() => setShowRenameModal(false)}
                customContent={
                    <View style={[styles.renameInput, { backgroundColor: theme.overlay, borderWidth: 1, borderColor: theme.border }]}>
                        <TextInput
                            ref={inputRef}
                            style={[styles.renameTextInput, { color: '#fff' }]}
                            value={newName}
                            onChangeText={setNewName}
                            placeholder="New name..."
                            placeholderTextColor={theme.textSecondary}
                            autoFocus
                            returnKeyType="done"
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
        paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md,
    },
    backBtn: { width: 36, height: 36, borderRadius: Radius.full, justifyContent: 'center', alignItems: 'center' },
    headerTitle: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: '#fff' },
    content: { paddingHorizontal: Spacing.lg, paddingBottom: 40 },

    previewWrap: { borderRadius: Radius.xl, overflow: 'hidden', marginBottom: Spacing.xl, height: 240 },
    preview: { width: '100%', height: '100%' },
    videoPlaceholder: { flex: 1, justifyContent: 'center', alignItems: 'center' },

    nameSection: {
        flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between',
        marginBottom: Spacing.xl, gap: Spacing.md
    },
    nameTextWrap: { flex: 1 },
    fileName: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: '#fff', marginBottom: 4 },
    fileTypeBadge: { fontSize: 10, color: theme.textSecondary, letterSpacing: 1, fontWeight: FontWeight.bold },

    actionBtn: {
        flexDirection: 'row', alignItems: 'center', gap: 6,
        paddingHorizontal: 12, paddingVertical: 8, borderRadius: Radius.lg,
    },
    actionBtnText: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold, color: '#fff' },

    infoCard: { borderRadius: Radius.lg, overflow: 'hidden', marginBottom: Spacing.lg },
    infoRow: { flexDirection: 'row', alignItems: 'center', padding: Spacing.lg, gap: Spacing.md },
    infoIcon: { width: 32, height: 32, borderRadius: Radius.md, backgroundColor: 'rgba(255,255,255,0.05)', alignItems: 'center', justifyContent: 'center' },
    infoContent: { flex: 1 },
    infoLabel: { fontSize: 10, color: theme.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 },
    infoValue: { fontSize: FontSize.sm, fontWeight: FontWeight.medium, color: '#fff' },
    divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.03)', marginLeft: 60 },

    securityNote: {
        flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
        padding: Spacing.md, borderRadius: Radius.md, borderStyle: 'dashed', borderWidth: 1,
    },
    securityText: { flex: 1, fontSize: 11, color: theme.textSecondary, lineHeight: 16 },

    renameInput: {
        flexDirection: 'row', alignItems: 'center', borderRadius: Radius.md,
        paddingHorizontal: Spacing.md, paddingVertical: 12, marginTop: Spacing.sm,
    },
    renameTextInput: { flex: 1, fontSize: FontSize.md, fontWeight: FontWeight.medium },
    extLabel: { color: theme.textSecondary, fontSize: FontSize.md },
});