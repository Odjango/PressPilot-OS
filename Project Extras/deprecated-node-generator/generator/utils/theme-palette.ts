import * as fs from 'fs-extra';
import * as path from 'path';

/**
 * Read palette from theme.json in a theme directory
 */
export async function getThemePalette(themeDir: string): Promise<Array<{ slug: string; color: string }>> {
    try {
        const themeJsonPath = path.join(themeDir, 'theme.json');
        if (await fs.pathExists(themeJsonPath)) {
            const themeJson = await fs.readJson(themeJsonPath);
            return themeJson?.settings?.color?.palette || [];
        }
    } catch (e) {
        console.warn('[ThemePalette] Could not read theme.json palette:', e);
    }
    return [];
}

/**
 * Read palette from a base theme in proven-cores
 */
export async function getBasePalette(baseName: string, rootDir: string): Promise<Array<{ slug: string; color: string }>> {
    const basePath = path.join(rootDir, 'proven-cores', 'prepared', baseName, 'theme.json');
    try {
        if (await fs.pathExists(basePath)) {
            const themeJson = await fs.readJson(basePath);
            return themeJson?.settings?.color?.palette || [];
        }
    } catch (e) {
        console.warn('[ThemePalette] Could not read base palette:', e);
    }
    return [];
}
