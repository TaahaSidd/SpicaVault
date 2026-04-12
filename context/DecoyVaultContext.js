import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import { createContext, useContext, useEffect, useState } from 'react';

// ── Separate storage key — never touches main vault ───────────────────────────
const DECOY_VAULT_KEY = 'sv_decoy_vault_items';
const DECOY_DIR = FileSystem.documentDirectory + 'decoy_vault/';

async function ensureDir() {
    const info = await FileSystem.getInfoAsync(DECOY_DIR);
    if (!info.exists) await FileSystem.makeDirectoryAsync(DECOY_DIR, { intermediates: true });
}

const DecoyVaultContext = createContext(null);

export function DecoyVaultProvider({ children }) {
    const [vaultItems, setVaultItems] = useState([]);
    const [albums] = useState([]); // decoy vault has no albums for simplicity

    useEffect(() => { loadItems(); }, []);

    async function loadItems() {
        try {
            const raw = await AsyncStorage.getItem(DECOY_VAULT_KEY);
            setVaultItems(raw ? JSON.parse(raw) : []);
        } catch { setVaultItems([]); }
    }

    async function saveItems(items) {
        setVaultItems(items);
        await AsyncStorage.setItem(DECOY_VAULT_KEY, JSON.stringify(items));
    }

    // ── Import a file into decoy vault ────────────────────────────────────────
    async function importToDecoyVault(asset) {
        await ensureDir();
        const ext = asset.filename?.split('.').pop() ?? 'jpg';
        const dest = DECOY_DIR + asset.filename;
        await FileSystem.copyAsync({ from: asset.uri, to: dest });

        const newItem = {
            filename: asset.filename,
            uri: dest,
            type: asset.mediaType === 'video' ? 'video' : 'photo',
            originalName: asset.filename,
            importedAt: Date.now(),
        };

        const updated = [newItem, ...vaultItems.filter(i => i.filename !== newItem.filename)];
        await saveItems(updated);
        return newItem;
    }

    // ── Delete from decoy vault ───────────────────────────────────────────────
    async function deleteFromDecoyVault(filename) {
        const item = vaultItems.find(i => i.filename === filename);
        if (item) {
            try { await FileSystem.deleteAsync(item.uri, { idempotent: true }); } catch { }
        }
        await saveItems(vaultItems.filter(i => i.filename !== filename));
    }

    // ── Stub methods to match VaultContext shape ──────────────────────────────
    const toggleFavourite = async () => false;
    const isFavourite = () => false;
    const restoreToGallery = async () => false;
    const addFileToAlbum = async () => { };
    const removeFileFromAlbum = async () => { };
    const getAlbumItems = () => [];
    const createAlbum = async () => { };
    const deleteAlbum = async () => { };
    const updateAlbum = async () => { };

    return (
        <DecoyVaultContext.Provider value={{
            vaultItems,
            albums,
            importToDecoyVault,
            deleteFromVault: deleteFromDecoyVault,
            toggleFavourite,
            isFavourite,
            restoreToGallery,
            addFileToAlbum,
            removeFileFromAlbum,
            getAlbumItems,
            createAlbum,
            deleteAlbum,
            updateAlbum,
        }}>
            {children}
        </DecoyVaultContext.Provider>
    );
}

export function useDecoyVaultStorage() {
    return useContext(DecoyVaultContext);
}

// Re-export under same name as main vault hook so screens work without changes
export function useVaultStorage() {
    return useContext(DecoyVaultContext);
}