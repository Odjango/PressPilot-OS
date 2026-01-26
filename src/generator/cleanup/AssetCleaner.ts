
import fs from 'fs-extra';
import path from 'path';

export class AssetCleaner {
    /**
     * Removes default assets from the base theme to reduce file size.
     * We typically only want to keep structural assets (CSS/JS).
     * Heavy media (images/videos) should be purged and replaced by user assets.
     */
    async clean(themeDir: string): Promise<void> {
        console.log(`[Cleaner] pruning default assets from ${themeDir}...`);

        const assetsDir = path.join(themeDir, 'assets');
        const imagesDir = path.join(assetsDir, 'images');

        if (await fs.pathExists(imagesDir)) {
            // Delete the entire images directory
            // (Unless we want to keep specific icons? usually safe to delete all demo photos)
            await fs.remove(imagesDir);

            // Recreate empty to prevent 404s if code references it (optional)
            await fs.ensureDir(imagesDir);

            console.log('[Cleaner] Removed default images (Saving ~2MB)');
        }
    }
}
