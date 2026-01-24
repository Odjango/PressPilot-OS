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
export interface GeneratorOptions {
    base?: BaseTheme;
    mode?: GeneratorMode;
    data?: GeneratorData;
    outDir?: string;
    heroPattern?: string; // New: Override to force specific pattern
}

export async function generateTheme(options: GeneratorOptions = {}) {
    // 1. SETUP
    const baseName: BaseTheme = options.base || 'ollie';
    const mode: GeneratorMode = options.mode || 'standard';
    const userData: GeneratorData = options.data || {};

    const personality = PATTERN_REGISTRY[baseName];
    if (!personality) {
        throw new Error(`Error: Unknown base theme '${baseName}'.`);
    }

    const themeName = userData.name || `PressPilot ${baseName} ${mode}`;
    const safeName = themeName.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const timestamp = Date.now();

    const rootDir = process.cwd();
    // Use provided output dir or default
    const buildDir = options.outDir ? options.outDir : path.join(rootDir, 'output', `${safeName}-${timestamp}`);
    const zipPath = path.join(path.dirname(buildDir), `${safeName}-${timestamp}.zip`);
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
            // STANDARD / LIBRARY MODE (Recipe Assembly)

            // 1. Select Recipe
            let recipe = null;
            if (personality.recipes) {
                const industry = userData.industry || 'saas'; // Default to SaaS
                const availableRecipes = personality.recipes[industry] || personality.recipes['saas'];

                if (availableRecipes && availableRecipes.length > 0) {
                    // Pick random or first
                    recipe = availableRecipes[0];
                }
            }

            // PATTERN INJECTION (With Override Support)
            if (options.heroPattern) {
                // FORCE OVERRIDE
                console.log(`[Orchestrator] Forcing Hero Pattern: ${options.heroPattern}`);
                const heroPath = path.join(themeDir, personality.patterns.hero); // Target location

                // Check if it's a valid file path in our repo
                if (await fs.pathExists(options.heroPattern)) {
                    await fs.copy(options.heroPattern, heroPath);
                    console.log(`[Orchestrator] Overwrote Hero with: ${options.heroPattern}`);
                } else {
                    console.warn(`[Orchestrator] Requested hero pattern not found: ${options.heroPattern}`);
                }

                // Inject Content into the new Hero
                let heroContent = await fs.readFile(heroPath, 'utf8');
                heroContent = heroContent.replace(personality.patterns.hero_search_headline, userData.hero_headline || "Welcome");
                if (userData.hero_subheadline && personality.patterns.hero_search_sub) {
                    heroContent = heroContent.replace(personality.patterns.hero_search_sub, userData.hero_subheadline || "");
                }
                await fs.writeFile(heroPath, heroContent);

            } else if (recipe) {
                await patternInjector.injectRecipe(themeDir, recipe, userData, personality);
            } else {
                console.log('[Orchestrator] No recipe found, falling back to basic injection.');
                // Fallback: Just Hero Injection (Legacy)
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
            }

            // 2. Generate Pages (Restored Feature)
            await contentEngine.generatePages(themeDir, userData);

            // 3. Inject Nuclear Loader (Required for "Test Pizza" Fix)
            await contentEngine.injectContentLoader(themeDir, userData);

            // 4. Inject Menus
            if (userData.menus && userData.menus.length > 0) {
                await patternInjector.injectMenus(themeDir, userData, safeName);
            }

            // 5. Industry Specific Injection (Portfolio / Fitness)
            const industry = (userData.industry || '').toLowerCase();
            if (industry === 'portfolio' || industry === 'creative') {
                await patternInjector.injectGallery(themeDir, safeName);
            } else if (industry === 'fitness' || industry === 'gym') {
                await patternInjector.injectSchedule(themeDir, safeName);
            } else if (industry === 'ecommerce' || industry === 'shop') {
                await patternInjector.injectWooCommerce(themeDir, safeName);
            }
        }

        // 3.5. VALIDATION HARDENING (Phase 3)
        // Ensure "Trust but Verify" rule for FSE output
        console.log('[Orchestrator] Validating Theme Structure...');
        const { ThemeValidator } = require('./validator/ThemeValidator');
        const validator = new ThemeValidator();
        const report = await validator.validateTheme(themeDir);

        if (!report.isValid) {
            console.error('[Validator] CRITICAL FSE ERRORS FOUND:');
            report.errors.forEach((err: string) => console.error(`  - ${err}`));
            console.error('[Validator] Theme Generation Completed with ERRORS.');
        } else {
            console.log('[Validator] Theme Passed FSE Validation Check.');
        }

        if (report.warnings.length > 0) {
            console.log('[Validator] Warnings:');
            report.warnings.forEach((warn: string) => console.log(`  - ${warn}`));
        }

        // 4. FINALIZE (ZIP)
        const output = fs.createWriteStream(zipPath);
        const archive = archiver('zip', { zlib: { level: 9 } });

        await new Promise((resolve, reject) => {
            output.on('close', resolve);
            archive.on('error', reject);
            archive.pipe(output);
            archive.directory(themeDir, safeName);
            archive.finalize();
        });

        const result = {
            status: "success",
            themeName: themeName,
            downloadPath: zipPath,
            filename: `${safeName}-${timestamp}.zip`,
            themeDir: themeDir // useful for checking
        };

        return result;

    } catch (err) {
        console.error('[Orchestrator] Error:', err);
        throw err;
    }
}

// CLI ENTRY POINT
if (require.main === module) {
    (async () => {
        const args = process.argv.slice(2);
        const dataArg = args.find(arg => arg.startsWith('--data='));
        const baseArg = args.find(arg => arg.startsWith('--base='));
        const modeArg = args.find(arg => arg.startsWith('--mode='));

        let base: BaseTheme = 'ollie';
        if (baseArg) base = baseArg.split('=')[1].toLowerCase() as BaseTheme;

        let mode: GeneratorMode = 'standard';
        if (modeArg) mode = modeArg.split('=')[1].toLowerCase() as GeneratorMode;

        let data: GeneratorData = {};
        if (dataArg) {
            try {
                data = JSON.parse(dataArg.substring(7));
            } catch (e) {
                console.error("Error parsing JSON data:", e);
                process.exit(1);
            }
        }

        try {
            const result = await generateTheme({ base, mode, data });
            console.log(JSON.stringify(result));
        } catch (e) {
            process.exit(1);
        }
    })();
}
