/**
 * VaultContext.js — Phase 2: SQLite backed
 *
 * Upgrades from Phase 1:
 *  - All metadata in SQLite via VaultDatabase (no more readVaultDir)
 *  - expo-crypto for cryptographically secure random filenames
 *  - Albums in SQLite (no more albums.json)
 *  - Favourites in SQLite (no more favourites.json)
 *  - importToVault stores original name, size, type in DB
 *  - restoreToGallery reads vault_path from DB
 *  - deleteFromVault removes disk + DB atomically
 *  - getVaultFilenames() for import screen dedup by original name
 *
 *  API surface identical to Phase 1 — no screen changes needed.
 */

import * as Crypto from 'expo-crypto';
import * as FileSystem from 'expo-file-system/legacy';
import * as MediaLibrary from 'expo-media-library';
import {
    createContext, useCallback,
    useContext, useEffect, useRef, useState,
} from 'react';
import { getDB } from '../db/VaultDatabase';
import {
    deleteGalleryAssets,
    deleteVaultFile,
    ensureVaultDir,
    VAULT_DIR,
} from '../utils/FileHelpers';
import { getAutoDelete } from '../utils/SecureSettings';

const VaultContext = createContext(null);

export function VaultProvider({ children }) {
    const [vaultItems, setVaultItems] = useState([]);
    const [albums, setAlbums] = useState([]);
    const [favouriteFilenames, setFavouriteFilenames] = useState([]);
    const [isReady, setIsReady] = useState(false);
    const initDone = useRef(false);

    useEffect(() => {
        if (initDone.current) return;
        initDone.current = true;
        initVault();
    }, []);

    // ── Init ────────────────────────────────────────────────────────────────
    async function initVault() {
        try {
            await ensureVaultDir();
            const db = await getDB();
            await Promise.all([
                loadVaultItems(db),
                loadAlbums(db),
                loadFavourites(db),
            ]);
        } catch (e) {
            console.error('[VaultContext] initVault:', e);
        } finally {
            setIsReady(true);
        }
    }

    // ── Loaders ─────────────────────────────────────────────────────────────
    const loadVaultItems = useCallback(async (dbInstance) => {
        try {
            const db = dbInstance ?? await getDB();
            const items = await db.getAllItems();
            setVaultItems(items);
        } catch (e) {
            console.error('[VaultContext] loadVaultItems:', e);
        }
    }, []);

    const loadAlbums = useCallback(async (dbInstance) => {
        try {
            const db = dbInstance ?? await getDB();
            const rows = await db.getAllAlbums();
            setAlbums(rows);
        } catch (e) {
            console.error('[VaultContext] loadAlbums:', e);
        }
    }, []);

    const loadFavourites = useCallback(async (dbInstance) => {
        try {
            const db = dbInstance ?? await getDB();
            const favs = await db.getFavourites();
            setFavouriteFilenames(favs);
        } catch (e) {
            console.error('[VaultContext] loadFavourites:', e);
        }
    }, []);

    const refreshVault = useCallback(async () => {
        const db = await getDB();
        await Promise.all([
            loadVaultItems(db),
            loadAlbums(db),
            loadFavourites(db),
        ]);
    }, [loadVaultItems, loadAlbums, loadFavourites]);

    // ── Secure random filename ───────────────────────────────────────────────
    async function secureFilename(originalUri) {
        const ext = originalUri.split('.').pop()?.toLowerCase() ?? 'jpg';
        const safeExt = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'mp4', 'mov', 'avi', 'm4v']
            .includes(ext) ? ext : 'jpg';
        const bytes = await Crypto.getRandomBytesAsync(16);
        const hex = Array.from(bytes)
            .map(b => b.toString(16).padStart(2, '0'))
            .join('');
        return `${hex}.${safeExt}`;
    }

    // ── Import ───────────────────────────────────────────────────────────────
    async function importToVault(assets) {
        const db = await getDB();
        let success = 0;
        let failed = 0;
        const successfulAssetIds = [];

        for (const asset of assets) {
            try {
                // 1. Crypto-secure random filename
                const filename = await secureFilename(asset.uri);
                const dest = `${VAULT_DIR}${filename}`;

                // 2. Copy to private vault dir
                await FileSystem.copyAsync({ from: asset.uri, to: dest });

                // 3. Verify + get size
                const info = await FileSystem.getInfoAsync(dest, { size: true });
                if (!info.exists) throw new Error('File missing after copy');

                const isVideo = ['mp4', 'mov', 'avi', 'm4v']
                    .some(e => filename.toLowerCase().endsWith(e));

                // 4. Persist to SQLite
                await db.insertItem({
                    filename,
                    originalName: asset.filename ?? filename,
                    vaultPath: dest,
                    type: isVideo ? 'video' : 'photo',
                    mimeType: asset.mediaType ?? null,
                    sizeBytes: info.size ?? 0,
                    importedAt: Date.now(),
                });

                success++;
                if (asset.id) successfulAssetIds.push(asset.id);
            } catch (e) {
                console.error('[VaultContext] import failed:', asset.uri, e);
                failed++;
            }
        }

        // 5. Auto-delete originals — one system dialog for all
        if (success > 0) {
            const autoDelete = await getAutoDelete();
            if (autoDelete && successfulAssetIds.length > 0) {
                await deleteGalleryAssets(successfulAssetIds);
            }
        }

        await loadVaultItems(db);
        return { success, failed };
    }

    // ── Restore ──────────────────────────────────────────────────────────────
    async function restoreToGallery(item) {
        try {
            const db = await getDB();

            // Copy back to system gallery
            await MediaLibrary.createAssetAsync(item.uri);

            // Delete from disk
            await deleteVaultFile(item.filename);

            // Delete from SQLite — cascades album_files + favourites
            await db.deleteItem(item.filename);

            await loadVaultItems(db);
            await loadAlbums(db);
            await loadFavourites(db);
            return true;
        } catch (e) {
            console.error('[VaultContext] restoreToGallery:', e);
            return false;
        }
    }

    // ── Delete ───────────────────────────────────────────────────────────────
    async function deleteFromVault(filename) {
        try {
            const db = await getDB();

            // Disk first — avoid orphaned DB rows
            await deleteVaultFile(filename);

            // DB — cascade cleans album_files + favourites
            await db.deleteItem(filename);

            await loadVaultItems(db);
            await loadAlbums(db);
            await loadFavourites(db);
        } catch (e) {
            console.error('[VaultContext] deleteFromVault:', e);
        }
    }

    // ── Favourites ───────────────────────────────────────────────────────────
    const toggleFavourite = async (filename) => {
        try {
            const db = await getDB();
            const isFav = favouriteFilenames.includes(filename);
            if (isFav) {
                await db.removeFavourite(filename);
            } else {
                await db.addFavourite(filename);
            }
            await loadFavourites(db);
        } catch (e) {
            console.error('[VaultContext] toggleFavourite:', e);
        }
    };

    const isFavourite = (filename) => favouriteFilenames.includes(filename);

    const favouriteItems = vaultItems.filter(i =>
        favouriteFilenames.includes(i.filename)
    );

    // ── Albums ───────────────────────────────────────────────────────────────
    async function createAlbum(name, icon = 'folder-outline', color = '#F59E0B') {
        const db = await getDB();
        const newAlbum = {
            id: `album_${Date.now()}`,
            name, icon, color,
            createdAt: Date.now(),
        };
        await db.insertAlbum(newAlbum);
        await loadAlbums(db);
        return newAlbum;
    }

    async function updateAlbum(albumId, updates) {
        const db = await getDB();
        await db.updateAlbum(albumId, updates);
        await loadAlbums(db);
    }

    async function deleteAlbum(albumId) {
        const db = await getDB();
        await db.deleteAlbum(albumId);
        await loadAlbums(db);
    }

    async function addFileToAlbum(albumId, filename) {
        const db = await getDB();
        await db.addFileToAlbum(albumId, filename);
        await loadAlbums(db);
    }

    async function removeFileFromAlbum(albumId, filename) {
        const db = await getDB();
        await db.removeFileFromAlbum(albumId, filename);
        await loadAlbums(db);
    }

    function getAlbumItems(albumId) {
        const album = albums.find(a => a.id === albumId);
        if (!album) return [];
        return vaultItems.filter(i => album.fileNames.includes(i.filename));
    }

    // Returns Set of original_name — used by ImportMediaScreen to filter dupes
    async function getVaultFilenames() {
        const db = await getDB();
        return db.getAllFilenames();
    }

    // ── Context value ────────────────────────────────────────────────────────
    return (
        <VaultContext.Provider value={{
            vaultItems,
            albums,
            favouriteItems,
            isReady,

            importToVault,
            restoreToGallery,
            deleteFromVault,
            refreshVault,
            getVaultFilenames,

            toggleFavourite,
            isFavourite,

            createAlbum,
            updateAlbum,
            deleteAlbum,
            addFileToAlbum,
            removeFileFromAlbum,
            getAlbumItems,
        }}>
            {children}
        </VaultContext.Provider>
    );
}

export function useVaultStorage() {
    const ctx = useContext(VaultContext);
    if (!ctx) throw new Error('useVaultStorage must be used within VaultProvider');
    return ctx;
}