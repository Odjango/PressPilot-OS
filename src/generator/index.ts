import fs from 'fs-extra';
import path from 'path';
import archiver from 'archiver';
import { BaseTheme, GeneratorData, GeneratorMode } from './types';
import { PATTERN_REGISTRY } from './config/PatternRegistry';
import { ChassisLoader } from './engine/ChassisLoader';
import { StyleEngine } from './engine/StyleEngine';
import { PatternInjector } from './engine/PatternInjector';
import { ContentEngine } from './engine/ContentEngine';

/**
 * PressPilot Generator Orchestrator
 * Refactored: 2026-01-04 (Hassan's Rule 1: Modularization)
 */
async function generateTheme() {
    // 1. SETUP & PARSE ARGS
    const args = process.argv.slice(2);
    const dataArg = args.find(arg => arg.startsWith('--data='));
    const baseArg = args.find(arg => arg.startsWith('--base='));
    const modeArg = args.find(arg => arg.startsWith('--mode='));

    let baseName: BaseTheme = 'ollie';
    if (baseArg) baseName = baseArg.split('=')[1].toLowerCase() as BaseTheme;

    let mode: GeneratorMode = 'standard';
    if (modeArg) mode = modeArg.split('=')[1].toLowerCase() as GeneratorMode;

    const personality = PATTERN_REGISTRY[baseName];
    if (!personality) {
        console.error(`Error: Unknown base theme '${baseName}'.`);
        process.exit(1);
    }

    let userData: GeneratorData = {};
    if (dataArg) {
        try {
            userData = JSON.parse(dataArg.substring(7));
        } catch (e) {
            console.error("Error parsing JSON data:", e);
            process.exit(1);
        }
    }

    const themeName = userData.name || `PressPilot ${baseName} ${mode}`;
    const safeName = themeName.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const timestamp = Date.now();

    const rootDir = process.cwd();
    const buildDir = path.join(rootDir, 'output', `${safeName}-${timestamp}`);
    const zipPath = path.join(rootDir, 'output', `${safeName}-${timestamp}.zip`);
    const themeDir = path.join(buildDir, safeName);

    console.log(`[Orchestrator] Starting generation for: ${themeName}`);

    try {
        // 2. INITIALIZE ENGINES
        const chassis = new ChassisLoader(rootDir);
        const styleEngine = new StyleEngine();
        const patternInjector = new PatternInjector(rootDir);
        const contentEngine = new ContentEngine();

        // 3. EXECUTE PIPELINE
        await chassis.load(baseName, themeDir);

        await styleEngine.applyColors(themeDir, userData, personality);
        await styleEngine.updateMetadata(themeDir, themeName, baseName, mode);

        if (mode === 'heavy') {
            await patternInjector.injectHeavyMode(themeDir, personality, userData, safeName);
            await contentEngine.generatePages(themeDir, userData);
            await contentEngine.injectContentLoader(themeDir, userData);
        } else {
            // STANDARD / NATIVE MODE (The "Smart Selection" Logic)
            // 1. Use Native Patterns (Ollie, Frost, etc.)
            if (personality.patterns.hero && userData.hero_headline) {
                const heroPath = path.join(themeDir, personality.patterns.hero);
                if (await fs.pathExists(heroPath)) {
                    let heroContent = await fs.readFile(heroPath, 'utf8');
                    heroContent = heroContent.replace(personality.patterns.hero_search_headline, userData.hero_headline);
                    if (userData.hero_subheadline && personality.patterns.hero_search_sub) {
                        heroContent = heroContent.replace(personality.patterns.hero_search_sub, userData.hero_subheadline);
                    }
                    await fs.writeFile(heroPath, heroContent);
                    console.log(`[Pattern] Injected content into Native Hero: ${personality.patterns.hero}`);
                }
            }

            // 2. Generate Pages (Restored Feature)
            await contentEngine.generatePages(themeDir, userData);

            // 3. Inject Nuclear Loader (Required for "Test Pizza" Fix)
            await contentEngine.injectContentLoader(themeDir, userData);
        }

        // 4. FINALIZE (ZIP)
        const output = fs.createWriteStream(zipPath);
        const archive = archiver('zip', { zlib: { level: 9 } });

        output.on('close', function () {
            console.log(JSON.stringify({
                status: "success",
                themeName: themeName,
                downloadPath: zipPath,
                filename: `${safeName}-${timestamp}.zip`
            }));
        });
        archive.on('error', (err: any) => { throw err; });
        archive.pipe(output);
        archive.directory(themeDir, safeName);
        await archive.finalize();

    } catch (err) {
        console.error('[Orchestrator] Error:', err);
        process.exit(1);
    }
}

generateTheme();

