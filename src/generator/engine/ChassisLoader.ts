import fs from 'fs-extra';
import path from 'path';
import { BaseTheme } from '../types';

export class ChassisLoader {
    constructor(private rootDir: string) { }

    async load(baseName: BaseTheme, targetDir: string): Promise<void> {
        const BASE_THEME_PATH = path.join(this.rootDir, 'bases', baseName);

        if (!fs.existsSync(BASE_THEME_PATH)) {
            if (baseName === 'spectra') {
                console.error(`Spectra base not found at ${BASE_THEME_PATH}. Please ensure it is installed.`);
                process.exit(1);
            }
            throw new Error(`Base theme not found at ${BASE_THEME_PATH}`);
        }

        console.log(`[Chassis] Loading base '${baseName}' from ${BASE_THEME_PATH}...`);
        await fs.ensureDir(targetDir);
        await fs.copy(BASE_THEME_PATH, targetDir);
        console.log(`[Chassis] Base loaded.`);
    }
}
