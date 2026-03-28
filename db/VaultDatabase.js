/**
 * db/VaultDatabase.js
 *
 * Tables:
 *   vault_items   — one row per imported file
 *   albums        — album metadata
 *   album_files   — many-to-many: album ↔ vault_items
 *   favourites    — favourite filenames
 */

import * as SQLite from 'expo-sqlite';

// ─── Singleton ────────────────────────────────────────────────────────────────
let _db = null;

export async function getDB() {
    if (_db) return _db;
    const raw = await SQLite.openDatabaseAsync('spicavault.db');
    await migrate(raw);
    _db = wrapDB(raw);
    return _db;
}

// ─── Migrations ───────────────────────────────────────────────────────────────
async function migrate(db) {
    await db.execAsync(`PRAGMA journal_mode = WAL;`);
    await db.execAsync(`PRAGMA foreign_keys = ON;`);

    await db.execAsync(`
        CREATE TABLE IF NOT EXISTS vault_items (
            id            INTEGER PRIMARY KEY AUTOINCREMENT,
            filename      TEXT    NOT NULL UNIQUE,
            original_name TEXT    NOT NULL,
            vault_path    TEXT    NOT NULL,
            type          TEXT    NOT NULL CHECK(type IN ('photo','video')),
            mime_type     TEXT,
            size_bytes    INTEGER NOT NULL DEFAULT 0,
            imported_at   INTEGER NOT NULL,
            width         INTEGER,
            height        INTEGER,
            duration_ms   INTEGER
        );

        CREATE TABLE IF NOT EXISTS albums (
            id         TEXT    PRIMARY KEY,
            name       TEXT    NOT NULL,
            icon       TEXT    NOT NULL DEFAULT 'folder-outline',
            color      TEXT    NOT NULL DEFAULT '#F59E0B',
            created_at INTEGER NOT NULL
        );

        CREATE TABLE IF NOT EXISTS album_files (
            album_id TEXT    NOT NULL REFERENCES albums(id)           ON DELETE CASCADE,
            filename TEXT    NOT NULL REFERENCES vault_items(filename) ON DELETE CASCADE,
            added_at INTEGER NOT NULL DEFAULT (strftime('%s','now') * 1000),
            PRIMARY KEY (album_id, filename)
        );

        CREATE TABLE IF NOT EXISTS favourites (
            filename   TEXT    NOT NULL REFERENCES vault_items(filename) ON DELETE CASCADE,
            added_at   INTEGER NOT NULL DEFAULT (strftime('%s','now') * 1000),
            PRIMARY KEY (filename)
        );
    `);
}

// ─── Row mappers ──────────────────────────────────────────────────────────────
function rowToItem(row) {
    return {
        id: row.id,
        filename: row.filename,
        originalName: row.original_name,
        uri: row.vault_path,
        type: row.type,
        mimeType: row.mime_type,
        sizeBytes: row.size_bytes,
        importedAt: row.imported_at,
        width: row.width,
        height: row.height,
        durationMs: row.duration_ms,
    };
}

function rowToAlbum(row) {
    return {
        id: row.id,
        name: row.name,
        icon: row.icon,
        color: row.color,
        createdAt: row.created_at,
        fileNames: [],
    };
}

// ─── Wrapped API ──────────────────────────────────────────────────────────────
function wrapDB(db) {
    return {

        // ── Vault items ──────────────────────────────────────────────────────

        async insertItem({
            filename, originalName, vaultPath, type,
            mimeType, sizeBytes, importedAt,
            width, height, durationMs,
        }) {
            await db.runAsync(
                `INSERT OR REPLACE INTO vault_items
                    (filename, original_name, vault_path, type,
                     mime_type, size_bytes, imported_at,
                     width, height, duration_ms)
                 VALUES (?,?,?,?,?,?,?,?,?,?)`,
                [
                    filename, originalName, vaultPath, type,
                    mimeType ?? null,
                    sizeBytes ?? 0,
                    importedAt,
                    width ?? null,
                    height ?? null,
                    durationMs ?? null,
                ]
            );
        },

        async getAllItems() {
            const rows = await db.getAllAsync(
                `SELECT * FROM vault_items ORDER BY imported_at DESC`
            );
            return rows.map(rowToItem);
        },

        async getItem(filename) {
            const row = await db.getFirstAsync(
                `SELECT * FROM vault_items WHERE filename = ?`, [filename]
            );
            return row ? rowToItem(row) : null;
        },

        // Cascades to album_files + favourites
        async deleteItem(filename) {
            await db.runAsync(
                `DELETE FROM vault_items WHERE filename = ?`, [filename]
            );
        },

        // Stats for StorageAnalysisScreen
        async getStats() {
            const row = await db.getFirstAsync(`
                SELECT
                    COUNT(*)                                              AS total,
                    SUM(size_bytes)                                       AS total_bytes,
                    SUM(CASE WHEN type='photo' THEN 1    ELSE 0 END)     AS photos,
                    SUM(CASE WHEN type='video' THEN 1    ELSE 0 END)     AS videos,
                    SUM(CASE WHEN type='photo' THEN size_bytes ELSE 0 END) AS photo_bytes,
                    SUM(CASE WHEN type='video' THEN size_bytes ELSE 0 END) AS video_bytes
                FROM vault_items
            `);
            return {
                total: row?.total ?? 0,
                totalBytes: row?.total_bytes ?? 0,
                photos: row?.photos ?? 0,
                videos: row?.videos ?? 0,
                photoBytes: row?.photo_bytes ?? 0,
                videoBytes: row?.video_bytes ?? 0,
            };
        },

        // Returns Set<original_name> for import dedup
        async getAllFilenames() {
            const rows = await db.getAllAsync(
                `SELECT original_name FROM vault_items`
            );
            return new Set(rows.map(r => r.original_name));
        },

        // ── Albums ───────────────────────────────────────────────────────────

        async getAllAlbums() {
            const albums = await db.getAllAsync(
                `SELECT * FROM albums ORDER BY created_at DESC`
            );
            if (albums.length === 0) return [];

            const files = await db.getAllAsync(
                `SELECT album_id, filename FROM album_files ORDER BY added_at ASC`
            );

            const fileMap = {};
            for (const f of files) {
                if (!fileMap[f.album_id]) fileMap[f.album_id] = [];
                fileMap[f.album_id].push(f.filename);
            }

            return albums.map(row => ({
                ...rowToAlbum(row),
                fileNames: fileMap[row.id] ?? [],
            }));
        },

        async insertAlbum({ id, name, icon, color, createdAt }) {
            await db.runAsync(
                `INSERT INTO albums (id, name, icon, color, created_at) VALUES (?,?,?,?,?)`,
                [id, name, icon, color, createdAt]
            );
        },

        async updateAlbum(id, { name, icon, color }) {
            await db.runAsync(
                `UPDATE albums
                 SET name  = COALESCE(?, name),
                     icon  = COALESCE(?, icon),
                     color = COALESCE(?, color)
                 WHERE id = ?`,
                [name ?? null, icon ?? null, color ?? null, id]
            );
        },

        async deleteAlbum(id) {
            await db.runAsync(`DELETE FROM albums WHERE id = ?`, [id]);
        },

        // ── Album files ──────────────────────────────────────────────────────

        async addFileToAlbum(albumId, filename) {
            await db.runAsync(
                `INSERT OR IGNORE INTO album_files (album_id, filename, added_at)
                 VALUES (?,?,?)`,
                [albumId, filename, Date.now()]
            );
        },

        async removeFileFromAlbum(albumId, filename) {
            await db.runAsync(
                `DELETE FROM album_files WHERE album_id = ? AND filename = ?`,
                [albumId, filename]
            );
        },

        async getAlbumItems(albumId) {
            const rows = await db.getAllAsync(
                `SELECT v.* FROM vault_items v
                 INNER JOIN album_files af ON af.filename = v.filename
                 WHERE af.album_id = ?
                 ORDER BY af.added_at DESC`,
                [albumId]
            );
            return rows.map(rowToItem);
        },

        // ── Favourites ───────────────────────────────────────────────────────

        // Returns array of filename strings
        async getFavourites() {
            const rows = await db.getAllAsync(
                `SELECT filename FROM favourites ORDER BY added_at DESC`
            );
            return rows.map(r => r.filename);
        },

        async addFavourite(filename) {
            await db.runAsync(
                `INSERT OR IGNORE INTO favourites (filename, added_at) VALUES (?,?)`,
                [filename, Date.now()]
            );
        },

        async removeFavourite(filename) {
            await db.runAsync(
                `DELETE FROM favourites WHERE filename = ?`, [filename]
            );
        },

        // Raw db access for edge cases
        raw: db,
    };
}