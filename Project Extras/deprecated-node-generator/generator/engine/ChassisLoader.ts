import fs from 'fs-extra';
import path from 'path';
import { BaseTheme } from '../types';

export class ChassisLoader {
    constructor(private rootDir: string) { }

    async load(baseName: BaseTheme, targetDir: string): Promise<void> {
        // PRIORITY 1: Check 'proven-cores/prepared' (The High-Performance Vault)
        let sourcePath = path.join(this.rootDir, 'proven-cores', 'prepared', baseName);

        if (!fs.existsSync(sourcePath)) {
            // PRIORITY 2: Check 'proven-cores' (The Standard Vault)
            sourcePath = path.join(this.rootDir, 'proven-cores', baseName);

            if (!fs.existsSync(sourcePath)) {
                // PRIORITY 3: Fallback to 'bases' (Legacy/Default)
                sourcePath = path.join(this.rootDir, 'bases', baseName);

                if (!fs.existsSync(sourcePath)) {
                    if (baseName === 'spectra') {
                        console.error(`Spectra base not found at ${sourcePath}.`);
                        process.exit(1);
                    }
                    throw new Error(`Base theme not found for '${baseName}' (checked proven-cores/prepared/, proven-cores/ and bases/)`);
                }
            }
        }

        console.log(`[Chassis] Loading base '${baseName}' from ${sourcePath}...`);
        await fs.ensureDir(targetDir);
        await fs.copy(sourcePath, targetDir);
        console.log(`[Chassis] Base loaded.`);
    }
}
