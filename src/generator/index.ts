
import fs from 'fs-extra';
import path from 'path';
import archiver from 'archiver';
import { BaseTheme, GeneratorData, GeneratorMode } from './types';
import { PATTERN_REGISTRY } from './config/PatternRegistry';
import { ChassisLoader } from './engine/ChassisLoader';
import { StyleEngine } from './engine/StyleEngine';
import { PatternInjector } from './engine/PatternInjector';
import { ContentEngine } from './engine/ContentEngine';
import { AssetCleaner } from './cleanup/AssetCleaner';
import { PhpEscaper } from './utils/PhpEscaper';
import { ThemeSelector } from './modules/ThemeSelector';
import { ContentBuilder } from './modules/ContentBuilder';
import { StyleBuilder } from './modules/StyleBuilder';

/**
 * PressPilot Generator Orchestrator
 * Refactored: 2026-01-25 (Functional Repair & Asset Cleanup)
 */
export interface GeneratorOptions {
    base?: BaseTheme;
    mode?: GeneratorMode;
    data?: GeneratorData;
    outDir?: string;
    heroPattern?: string; // New: Override to force specific pattern
    slug?: string; // Force specific output filename (no timestamp)
}

export async function generateTheme(options: GeneratorOptions = {}) {
    const rootDir = process.cwd();

    // 1. INITIALIZE ENGINES & MODULES
    const selector = new ThemeSelector(rootDir);
    const contentBuilder = new ContentBuilder();
    const styleBuilder = new StyleBuilder();

    const chassis = new ChassisLoader(rootDir);
    const styleEngine = new StyleEngine();
    const patternInjector = new PatternInjector(rootDir);
    const contentEngine = new ContentEngine();
    const assetCleaner = new AssetCleaner();

    // 2. RUN PIPELINE MODULES (Contracts)
    const userData: GeneratorData = options.data || {};

    // A. SELECT THEME
    const selection = await selector.selectTheme(userData);
    let baseName = options.base || selection.baseTheme;
    const coreId = options.base ? `manual/${options.base}` : selection.coreThemeId;

    userData.baseName = baseName; // Propagate for downstream engines
    console.log(`[Orchestrator] Selected Core: ${coreId} (Base: ${baseName})`);
    console.log(`[Orchestrator] Reasoning: ${selection.reasoning}`);

    // B. BUILD CONTENT & STYLE JSON
    const contentJson = contentBuilder.invoke(baseName, userData);
    const styleJson = styleBuilder.invoke(baseName, userData);

    // C. SETUP DIRECTORIES
    const mode: GeneratorMode = options.mode || 'standard';
    const themeName = styleJson.metadata.themeName;
    const safeName = options.slug || themeName.toLowerCase().replace(/[^a-z0-9]/g, '-');

    const buildDir = options.outDir ? options.outDir : path.join(rootDir, 'output', safeName);
    const zipPath = path.join(path.dirname(buildDir), `${safeName}.zip`);
    const themeDir = path.join(buildDir, safeName);

    console.log(`[Orchestrator] Starting assembly for: ${themeName}`);

    try {
        // 3. ASSEMBLY (Side Effects)
        console.log(`[Orchestrator] Cleaning build directory: ${themeDir}`);
        await fs.emptyDir(themeDir);

        // Load Chassis (Using baseName for binary files)
        await chassis.load(baseName, themeDir);

        // Clean default assets
        await assetCleaner.clean(themeDir);

        // Apply Styles
        await styleEngine.applyStyles(themeDir, styleJson);
        await styleEngine.updateMetadata(themeDir, themeName, baseName, mode);

        // Handle Logo
        if (userData.logo && userData.logo.startsWith('data:image')) {
            console.log('[Orchestrator] Extracting logo from base64...');
            const logoBase64 = userData.logo.split(';base64,').pop();
            const logoPath = path.join(themeDir, 'assets', 'images', 'logo.png');
            await fs.ensureDir(path.dirname(logoPath));
            await fs.writeFile(logoPath, Buffer.from(logoBase64!, 'base64'));
            userData.logo = `assets/images/logo.png`;
        }

        // Apply Content
        const personality = PATTERN_REGISTRY[baseName];

        if (mode === 'heavy') {
            await patternInjector.injectHeavyMode(themeDir, personality, userData, safeName, contentJson);
            await contentEngine.generatePages(themeDir, contentJson);
            await contentEngine.injectContentLoader(themeDir, contentJson);
        } else {
            // STANDARD MODE (Using Recipe Assembly)
            let recipe = null;
            if (personality.recipes) {
                const industry = userData.industry || 'saas';
                const availableRecipes = personality.recipes[industry] || personality.recipes['saas'];
                if (availableRecipes && availableRecipes.length > 0) {
                    recipe = availableRecipes[0];
                }
            }

            if (options.heroPattern) {
                // OVERRIDE Logic preserved for now
                console.log(`[Orchestrator] Forcing Hero Pattern: ${options.heroPattern}`);
                const heroPath = path.join(themeDir, personality.patterns.hero);
                if (await fs.pathExists(options.heroPattern)) {
                    await fs.copy(options.heroPattern, heroPath);
                }
                // (Existing replacement logic simplified here to use slots from contentJson)
                let heroContent = await fs.readFile(heroPath, 'utf8');
                for (const [search, replace] of Object.entries(contentJson.slots)) {
                    heroContent = heroContent.replace(search, replace);
                }
                await fs.writeFile(heroPath, heroContent);
            } else if (recipe) {
                await patternInjector.injectRecipe(themeDir, recipe, contentJson, personality, safeName, userData);
            }

            await contentEngine.generatePages(themeDir, contentJson);
            await contentEngine.injectContentLoader(themeDir, contentJson);

            if (userData.menus && userData.menus.length > 0) {
                await patternInjector.injectMenus(themeDir, userData, safeName);
            }

            // Industry Specific logic preserved
            const industry = (userData.industry || '').toLowerCase();
            if (industry === 'portfolio' || industry === 'creative') {
                await patternInjector.injectGallery(themeDir, safeName);
            } else if (industry === 'fitness' || industry === 'gym') {
                await patternInjector.injectSchedule(themeDir, safeName);
            } else if (industry === 'ecommerce' || industry === 'shop') {
                await patternInjector.injectWooCommerce(themeDir, safeName);
            }
        }

        // VALIDATION
        console.log('[Orchestrator] Validating Theme Structure...');
        const { ThemeValidator } = require('./validator/ThemeValidator');
        const validator = new ThemeValidator();
        const report = await validator.validateTheme(themeDir);

        if (!report.isValid) {
            console.error('[Validator] CRITICAL FSE ERRORS FOUND');
        }

        // FINALIZE (ZIP)
        const output = fs.createWriteStream(zipPath);
        const archive = archiver('zip', { zlib: { level: 9 } });

        await new Promise((resolve, reject) => {
            output.on('close', resolve);
            archive.on('error', reject);
            archive.pipe(output);
            archive.directory(themeDir, safeName);
            archive.finalize();
        });

        return {
            status: "success",
            themeName: themeName,
            downloadPath: zipPath,
            filename: `${safeName}.zip`,
            themeDir: themeDir
        };

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
