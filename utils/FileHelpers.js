import * as FileSystem from 'expo-file-system/legacy';
import * as MediaLibrary from 'expo-media-library';

// ─── Vault directory ──────────────────────────────────────────────────────────
export const VAULT_DIR = `${FileSystem.documentDirectory}vault/`;
const NOMEDIA_PATH = `${VAULT_DIR}.nomedia`;

// ─── Ensure vault directory exists ───────────────────────────────────────────
export async function ensureVaultDir() {
    const info = await FileSystem.getInfoAsync(VAULT_DIR);
    if (!info.exists) {
        await FileSystem.makeDirectoryAsync(VAULT_DIR, { intermediates: true });
    }
    const nomedia = await FileSystem.getInfoAsync(NOMEDIA_PATH);
    if (!nomedia.exists) {
        // Prevents Android gallery from indexing vault files
        await FileSystem.writeAsStringAsync(NOMEDIA_PATH, '');
    }
}

// ─── Random filename ──────────────────────────────────────────────────────────
// Generates a random hex string filename to obscure original names.
// e.g. "a3f9b2c1d4e5.jpg"
export function randomFilename(originalUri) {
    const ext = originalUri.split('.').pop()?.toLowerCase() ?? 'jpg';
    const safeExt = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'mp4', 'mov', 'avi', 'm4v'].includes(ext)
        ? ext
        : 'jpg';

    // 12 random hex chars — enough entropy, not too long
    const hex = Array.from({ length: 12 }, () =>
        Math.floor(Math.random() * 16).toString(16)
    ).join('');

    return `${hex}.${safeExt}`;
}

// ─── Copy asset into vault ────────────────────────────────────────────────────
// Returns the new vault URI on success, throws on failure.
export async function copyToVault(asset) {
    await ensureVaultDir();

    const filename = randomFilename(asset.uri);
    const dest = `${VAULT_DIR}${filename}`;

    await FileSystem.copyAsync({ from: asset.uri, to: dest });

    const info = await FileSystem.getInfoAsync(dest);
    if (!info.exists) throw new Error(`Copy failed: ${dest} not found after copy`);

    const isVideo = ['mp4', 'mov', 'avi', 'm4v'].some(ext =>
        filename.toLowerCase().endsWith(ext)
    );

    return {
        filename,           // randomised vault name        e.g. "a3f9b2c1.jpg"
        originalName: asset.filename ?? filename, // original gallery name
        vaultUri: dest,     // full file:// path inside app sandbox
        type: isVideo ? 'video' : 'photo',
        importedAt: Date.now(),
    };
}

// ─── Delete from vault ────────────────────────────────────────────────────────
export async function deleteVaultFile(filename) {
    const path = `${VAULT_DIR}${filename}`;
    await FileSystem.deleteAsync(path, { idempotent: true });
}

// ─── Delete originals from system gallery (one system dialog) ────────────────
// Only called when the user has auto-delete enabled in settings.
// Accepts an array of MediaLibrary asset IDs.
export async function deleteGalleryAssets(assetIds) {
    if (!assetIds || assetIds.length === 0) return;
    try {
        await MediaLibrary.deleteAssetsAsync(assetIds);
    } catch (e) {
        // Android may throw if user denies the system dialog — that's OK.
        console.warn('[fileHelpers] deleteGalleryAssets:', e.message);
    }
}

// ─── Read vault directory ─────────────────────────────────────────────────────
// Fallback used before SQLite is wired up — reads files directly from disk.
export async function readVaultDir() {
    await ensureVaultDir();
    const files = await FileSystem.readDirectoryAsync(VAULT_DIR);
    const items = await Promise.all(
        files
            .filter(f => f !== '.nomedia')
            .map(async (filename) => {
                const uri = `${VAULT_DIR}${filename}`;
                const info = await FileSystem.getInfoAsync(uri);
                const isVideo = ['mp4', 'mov', 'avi', 'm4v'].some(ext =>
                    filename.toLowerCase().endsWith(ext)
                );
                return {
                    filename,
                    uri,
                    originalName: filename, // no metadata yet — SQLite will fix this
                    type: isVideo ? 'video' : 'photo',
                    importedAt: info.modificationTime
                        ? info.modificationTime * 1000
                        : Date.now(),
                };
            })
    );
    // Newest first
    return items.sort((a, b) => b.importedAt - a.importedAt);
}