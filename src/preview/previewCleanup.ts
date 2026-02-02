/**
 * Preview Cleanup Utility
 *
 * Handles cleanup of old preview screenshots to prevent
 * disk space accumulation from repeated preview generations.
 */

import * as fs from 'fs-extra';
import * as path from 'path';

/** Default max age for preview sessions (30 minutes) */
const DEFAULT_MAX_AGE_MINUTES = 30;

/** Preview directory under public folder */
const PREVIEW_DIR_NAME = 'tmp/previews';

/**
 * Get the absolute path to the previews directory
 */
export function getPreviewsDir(): string {
    return path.join(process.cwd(), 'public', PREVIEW_DIR_NAME);
}

/**
 * Clean up preview sessions older than the specified age
 * @param maxAgeMinutes Maximum age in minutes before cleanup (default: 30)
 * @returns Number of sessions deleted
 */
export async function cleanupOldPreviews(maxAgeMinutes: number = DEFAULT_MAX_AGE_MINUTES): Promise<number> {
    const previewsDir = getPreviewsDir();

    // Ensure directory exists
    if (!await fs.pathExists(previewsDir)) {
        console.log('[previewCleanup] Previews directory does not exist, nothing to clean');
        return 0;
    }

    const now = Date.now();
    const maxAgeMs = maxAgeMinutes * 60 * 1000;
    let deletedCount = 0;

    try {
        const sessions = await fs.readdir(previewsDir);

        for (const sessionId of sessions) {
            const sessionPath = path.join(previewsDir, sessionId);
            const stat = await fs.stat(sessionPath);

            // Only process directories
            if (!stat.isDirectory()) {
                continue;
            }

            // Check if session is older than max age
            const age = now - stat.mtimeMs;
            if (age > maxAgeMs) {
                await fs.remove(sessionPath);
                deletedCount++;
                console.log(`[previewCleanup] Deleted old session: ${sessionId} (age: ${Math.round(age / 60000)}min)`);
            }
        }

        if (deletedCount > 0) {
            console.log(`[previewCleanup] Cleaned up ${deletedCount} old preview sessions`);
        }

        return deletedCount;

    } catch (error) {
        console.error('[previewCleanup] Error during cleanup:', error);
        return deletedCount;
    }
}

/**
 * Delete a specific preview session by ID
 * @param sessionId The session ID to delete
 * @returns True if deleted, false if not found
 */
export async function deletePreviewSession(sessionId: string): Promise<boolean> {
    const sessionPath = path.join(getPreviewsDir(), sessionId);

    if (!await fs.pathExists(sessionPath)) {
        return false;
    }

    try {
        await fs.remove(sessionPath);
        console.log(`[previewCleanup] Deleted session: ${sessionId}`);
        return true;
    } catch (error) {
        console.error(`[previewCleanup] Failed to delete session ${sessionId}:`, error);
        return false;
    }
}

/**
 * Create a new session directory and return its path
 * @param sessionId Unique session identifier
 * @returns Path to the new session directory
 */
export async function createSessionDir(sessionId: string): Promise<string> {
    const sessionPath = path.join(getPreviewsDir(), sessionId);
    await fs.ensureDir(sessionPath);
    return sessionPath;
}

/**
 * Get info about all active preview sessions
 */
export async function getActiveSessions(): Promise<Array<{
    sessionId: string;
    createdAt: Date;
    ageMinutes: number;
    screenshotCount: number;
}>> {
    const previewsDir = getPreviewsDir();

    if (!await fs.pathExists(previewsDir)) {
        return [];
    }

    const sessions = await fs.readdir(previewsDir);
    const now = Date.now();
    const results = [];

    for (const sessionId of sessions) {
        const sessionPath = path.join(previewsDir, sessionId);
        const stat = await fs.stat(sessionPath);

        if (!stat.isDirectory()) {
            continue;
        }

        // Count PNG files in session
        const files = await fs.readdir(sessionPath);
        const screenshotCount = files.filter(f => f.endsWith('.png')).length;

        results.push({
            sessionId,
            createdAt: stat.birthtime,
            ageMinutes: Math.round((now - stat.mtimeMs) / 60000),
            screenshotCount
        });
    }

    return results;
}

/**
 * Run cleanup automatically when module is imported in development
 * This is a no-op in production to avoid side effects
 */
export async function schedulePeriodicCleanup(intervalMinutes: number = 15): Promise<NodeJS.Timeout | null> {
    if (process.env.NODE_ENV === 'production') {
        // In production, run cleanup once at startup
        await cleanupOldPreviews();
        return null;
    }

    // In development, schedule periodic cleanup
    const intervalMs = intervalMinutes * 60 * 1000;
    const timer = setInterval(async () => {
        await cleanupOldPreviews();
    }, intervalMs);

    // Run immediately on startup
    await cleanupOldPreviews();

    console.log(`[previewCleanup] Scheduled cleanup every ${intervalMinutes} minutes`);
    return timer;
}
