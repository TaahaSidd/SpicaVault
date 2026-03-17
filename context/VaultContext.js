// context/VaultContext.js
import * as FileSystem from 'expo-file-system/legacy';
import * as MediaLibrary from 'expo-media-library';
import { createContext, useContext, useEffect, useState } from 'react';

export const VAULT_DIR = `${FileSystem.documentDirectory}vault/`;
const NOMEDIA_PATH = `${VAULT_DIR}.nomedia`;
const ALBUMS_PATH = `${FileSystem.documentDirectory}albums.json`;

const VaultContext = createContext(null);

export function VaultProvider({ children }) {
    const [vaultItems, setVaultItems] = useState([]);
    const [albums, setAlbums] = useState([]); // [{ id, name, icon, color, fileNames: [] }]
    const [isReady, setIsReady] = useState(false);

    useEffect(() => { initVault(); }, []);

    async function initVault() {
        const dirInfo = await FileSystem.getInfoAsync(VAULT_DIR);
        if (!dirInfo.exists) {
            await FileSystem.makeDirectoryAsync(VAULT_DIR, { intermediates: true });
        }
        const nomediaInfo = await FileSystem.getInfoAsync(NOMEDIA_PATH);
        if (!nomediaInfo.exists) {
            await FileSystem.writeAsStringAsync(NOMEDIA_PATH, '');
        }
        await Promise.all([loadVaultItems(), loadAlbums()]);
        setIsReady(true);
    }

    // ── Vault Items ───────────────────────────────────────────────────────────
    async function loadVaultItems() {
        try {
            const files = await FileSystem.readDirectoryAsync(VAULT_DIR);
            const items = await Promise.all(
                files
                    .filter((f) => f !== '.nomedia')
                    .map(async (filename) => {
                        const uri = `${VAULT_DIR}${filename}`;
                        const info = await FileSystem.getInfoAsync(uri);
                        const isVideo =
                            filename.endsWith('.mp4') ||
                            filename.endsWith('.mov') ||
                            filename.endsWith('.avi');
                        return {
                            uri, filename,
                            type: isVideo ? 'video' : 'photo',
                            createdAt: info.modificationTime ?? Date.now(),
                        };
                    })
            );
            items.sort((a, b) => b.createdAt - a.createdAt);
            setVaultItems(items);
        } catch (e) {
            console.error('Failed to load vault items:', e);
        }
    }

    async function importToVault(assets) {
        let success = 0, failed = 0;
        for (const asset of assets) {
            try {
                const ext = asset.uri.split('.').pop() ?? 'jpg';
                const filename = asset.filename ??
                    `vault_${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
                const dest = `${VAULT_DIR}${filename}`;

                // Copy to private vault directory
                await FileSystem.copyAsync({ from: asset.uri, to: dest });

                // Delete original from gallery
                // asset.id is the MediaLibrary asset ID passed from ImportMediaScreen
                if (asset.id) {
                    try {
                        await MediaLibrary.deleteAssetsAsync([asset.id]);
                    } catch (deleteErr) {
                        // Delete failed but file is in vault — still count as success
                        console.warn('Could not delete original:', deleteErr);
                    }
                }

                success++;
            } catch (e) {
                console.error('Failed to import asset:', asset.uri, e);
                failed++;
            }
        }
        await loadVaultItems();
        return { success, failed };
    }

    async function deleteFromVault(filename) {
        try {
            await FileSystem.deleteAsync(`${VAULT_DIR}${filename}`, { idempotent: true });
            // Remove from all albums too
            const updated = albums.map(a => ({
                ...a,
                fileNames: a.fileNames.filter(f => f !== filename),
            }));
            await saveAlbums(updated);
            await loadVaultItems();
        } catch (e) {
            console.error('Failed to delete vault item:', e);
        }
    }

    // ── Albums ────────────────────────────────────────────────────────────────
    async function loadAlbums() {
        try {
            const info = await FileSystem.getInfoAsync(ALBUMS_PATH);
            if (!info.exists) {
                setAlbums([]);
                return;
            }
            const raw = await FileSystem.readAsStringAsync(ALBUMS_PATH);
            setAlbums(JSON.parse(raw));
        } catch (e) {
            console.error('Failed to load albums:', e);
            setAlbums([]);
        }
    }

    async function saveAlbums(updated) {
        try {
            await FileSystem.writeAsStringAsync(ALBUMS_PATH, JSON.stringify(updated));
            setAlbums(updated);
        } catch (e) {
            console.error('Failed to save albums:', e);
        }
    }

    async function createAlbum(name, icon = 'folder-outline', color = '#F59E0B') {
        const newAlbum = {
            id: `album_${Date.now()}`,
            name,
            icon,
            color,
            fileNames: [],
            createdAt: Date.now(),
        };
        await saveAlbums([...albums, newAlbum]);
        return newAlbum;
    }

    async function updateAlbum(albumId, updates) {
        const updated = albums.map(a =>
            a.id === albumId ? { ...a, ...updates } : a
        );
        await saveAlbums(updated);
    }

    async function deleteAlbum(albumId) {
        const updated = albums.filter(a => a.id !== albumId);
        await saveAlbums(updated);
    }

    async function addFileToAlbum(albumId, filename) {
        const updated = albums.map(a => {
            if (a.id !== albumId) return a;
            if (a.fileNames.includes(filename)) return a;
            return { ...a, fileNames: [...a.fileNames, filename] };
        });
        await saveAlbums(updated);
    }

    async function removeFileFromAlbum(albumId, filename) {
        const updated = albums.map(a => {
            if (a.id !== albumId) return a;
            return { ...a, fileNames: a.fileNames.filter(f => f !== filename) };
        });
        await saveAlbums(updated);
    }

    function getAlbumItems(albumId) {
        const album = albums.find(a => a.id === albumId);
        if (!album) return [];
        return vaultItems.filter(item => album.fileNames.includes(item.filename));
    }

    return (
        <VaultContext.Provider value={{
            vaultItems,
            albums,
            isReady,
            importToVault,
            deleteFromVault,
            refreshVault: loadVaultItems,
            // albums
            createAlbum,
            deleteAlbum,
            updateAlbum,
            addFileToAlbum,
            removeFileFromAlbum,
            getAlbumItems,
            // favourites placeholder
            favouriteItems: [],
            toggleFavourite: () => {},
            isFavourite: () => false,
        }}>
            {children}
        </VaultContext.Provider>
    );
}

export function useVaultStorage() {
    const context = useContext(VaultContext);
    if (!context) throw new Error('useVaultStorage must be used within VaultProvider');
    return context;
}