import fs from 'fs-extra';
import path from 'path';
import archiver from 'archiver';
import { BaseTheme, GeneratorData, GeneratorMode, BrandMode } from './types';
import { PATTERN_REGISTRY } from './config/PatternRegistry';
import { ChassisLoader } from './engine/ChassisLoader';
import { StyleEngine } from './engine/StyleEngine';
import { PatternInjector } from './engine/PatternInjector';
import { ContentEngine } from './engine/ContentEngine';
import { AssetCleaner } from './cleanup/AssetCleaner';
import { normalizeBlockGrammar } from './engine/BlockGrammarNormalizer';
import { PhpEscaper } from './utils/PhpEscaper';
import { ThemeSelector } from './modules/ThemeSelector';
import { ContentBuilder } from './modules/ContentBuilder';
import { StyleBuilder } from './modules/StyleBuilder';
import { VariationBuilder } from './modules/VariationBuilder';
import { prefetchImages } from './utils/ImageProvider';
import { sanitizePath, sanitizeUserInput } from './utils/sanitize';

/**
 * Feature Flags
 *
 * FORCE_HEAVY_FOR_RESTAURANTS: When true, restaurant verticals always use
 * Heavy Mode regardless of options.mode. This ensures hero layout
 * differentiation and proper menu injection for the restaurant vertical.
 *
 * FORCE_HEAVY_FOR_ECOMMERCE: When true, ecommerce verticals always use
 * Heavy Mode to enable recipe-driven content generation from Phase 4.
 *
 * Set to false only for debugging or testing standard mode.
 */
const FORCE_HEAVY_FOR_RESTAURANTS = true;
const FORCE_HEAVY_FOR_ECOMMERCE = true;
const FORCE_HEAVY_FOR_SAAS = true;
const FORCE_HEAVY_FOR_PORTFOLIO = true;
const FORCE_HEAVY_FOR_LOCAL_SERVICE = true;

/**
 * PressPilot Generator Orchestrator
 * Refactored: 2026-01-25 (Functional Repair & Asset Cleanup)
 */
export interface GeneratorOptions {
    base?: BaseTheme;
    mode?: GeneratorMode;
    brandMode?: BrandMode;
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
    const userData: GeneratorData = sanitizeUserInput<GeneratorData>(options.data || {});
    if (options.brandMode && !userData.brandMode) {
        userData.brandMode = options.brandMode;
    }
    if (!userData.brandStyle && (userData.brandMode === 'playful' || userData.brandMode === 'modern')) {
        userData.brandStyle = userData.brandMode;
    }

    // A. SELECT THEME
    const selection = await selector.selectTheme(userData);
    let baseName = options.base || selection.baseTheme;
    const coreId = options.base ? `manual/${options.base}` : selection.coreThemeId;

    userData.baseName = baseName; // Propagate for downstream engines
    console.log(`[Orchestrator] Selected Core: ${coreId} (Base: ${baseName})`);
    console.log(`[Orchestrator] Reasoning: ${selection.reasoning}`);

    // Pre-fetch Unsplash images for this industry (populates cache for ContentBuilder)
    await prefetchImages(userData.industry || 'general');
    console.log(`[Orchestrator] Pre-fetched images for industry: ${userData.industry || 'general'}`);

    // B. BUILD CONTENT & STYLE JSON
    const contentJson = contentBuilder.invoke(baseName, userData);
    const styleJson = styleBuilder.invoke(baseName, userData);

    // C. SETUP DIRECTORIES
    // Force heavy mode for restaurants to ensure hero layout differentiation
    const industry = userData.industry || 'general';
    const isRestaurant = ['restaurant', 'cafe', 'restaurant_cafe'].includes(industry);
    const isSaas = ['saas', 'software', 'startup'].includes(industry);
    const isPortfolio = ['portfolio', 'talent', 'creative', 'agency'].includes(industry);
    const isLocalService = ['local-service', 'service', 'home-service', 'professional-service', 'wellness-service', 'salon', 'spa', 'gym', 'dentist', 'lawyer', 'plumber', 'cleaner'].includes(industry);
    let mode: GeneratorMode = options.mode || 'standard';
    if (FORCE_HEAVY_FOR_RESTAURANTS && isRestaurant) {
        mode = 'heavy';
        // Restaurants always use Heavy Mode to guarantee hero layout differentiation
        // and proper menu injection, even if options.mode requested standard mode.
        console.log('[Phase14] Restaurant vertical -> forcing Heavy Mode for hero differentiation');
    }
    if (FORCE_HEAVY_FOR_SAAS && isSaas) {
        mode = 'heavy';
        console.log('[Phase5] SaaS vertical -> forcing Heavy Mode for recipe-driven sections');
    }
    if (FORCE_HEAVY_FOR_PORTFOLIO && isPortfolio) {
        mode = 'heavy';
        console.log('[Phase6] Portfolio/Talent vertical -> forcing Heavy Mode for recipe-driven sections');
    }
    if (FORCE_HEAVY_FOR_LOCAL_SERVICE && isLocalService) {
        mode = 'heavy';
        console.log('[Phase7] Local Service vertical -> forcing Heavy Mode for recipe-driven sections');
    }
    const themeName = styleJson.metadata.themeName;
    const rawName = options.slug || themeName.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const safeName = sanitizePath(rawName);

    const requestedBuildDir = options.outDir
        ? path.resolve(options.outDir)
        : path.join(rootDir, 'output', safeName);
    const safeBuildDirName = sanitizePath(path.basename(requestedBuildDir));
    const buildDir = path.join(path.dirname(requestedBuildDir), safeBuildDirName);
    const zipPath = path.join(path.dirname(buildDir), sanitizePath(`${safeName}.zip`));
    const themeDir = path.join(buildDir, sanitizePath(safeName));

    console.log(`[Orchestrator] Starting assembly for: ${themeName}`);

    try {
        // 3. ASSEMBLY (Side Effects)
        console.log(`[Orchestrator] Cleaning build directory: ${themeDir}`);
        await fs.emptyDir(themeDir);

        // Load Chassis (Using baseName for binary files)
        await chassis.load(baseName, themeDir);

        // Normalize block grammar (fixes legacy chassis patterns)
        await normalizeBlockGrammar(themeDir);

        // Clean base theme patterns from demo/marketing content
        await patternInjector.cleanAllPatterns(themeDir, userData);

        // Clean default assets
        await assetCleaner.clean(themeDir);

        // Apply Styles
        await styleEngine.applyStyles(themeDir, styleJson);
        await styleEngine.updateMetadata(
            themeDir,
            themeName,
            baseName,
            mode,
            styleJson.metadata.brandMode
        );

        // Generate Style Variations (all 4 moods ship with theme for Site Editor switching)
        const variations = VariationBuilder.generateVariations();
        await VariationBuilder.writeVariations(themeDir, variations);

        // Handle Logo
        if (userData.logo && userData.logo.startsWith('data:image')) {
            console.log('[Orchestrator] Extracting logo from base64...');
            const logoBase64 = userData.logo.split(';base64,').pop();
            const logoPath = path.join(themeDir, 'assets', 'images', 'logo.png');
            await fs.ensureDir(path.dirname(logoPath));
            await fs.writeFile(logoPath, Buffer.from(logoBase64!, 'base64'));
            // Logo file saved, base64 preserved in userData.logo for HTML templates
        }

        // Force heavy mode for ecommerce to use recipe-driven content (Phase 4)
        const isEcommerce = ['ecommerce', 'retail', 'shop', 'online_store'].includes(industry);
        if (FORCE_HEAVY_FOR_ECOMMERCE && isEcommerce) {
            mode = 'heavy';
            console.log('[Phase4] Ecommerce vertical -> forcing Heavy Mode for recipe-driven content');
        }

        // Apply Content
        const personality = PATTERN_REGISTRY[baseName];

        if (mode === 'heavy') {
            await patternInjector.injectHeavyMode(themeDir, personality, userData, safeName, contentJson);
            await contentEngine.generatePages(themeDir, contentJson);
            await contentEngine.injectContentLoader(themeDir, contentJson);

            // Menu injection for restaurants in heavy mode
            if (userData.menus && userData.menus.length > 0) {
                await patternInjector.injectMenus(themeDir, userData, safeName);
            }

            // WooCommerce templates for ecommerce in heavy mode
            if (isEcommerce) {
                await patternInjector.injectWooCommerce(themeDir, safeName);
            }
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
                // TODO: Gallery pattern not implemented yet
                // await patternInjector.injectGallery(themeDir, safeName);
            } else if (industry === 'fitness' || industry === 'gym') {
                await patternInjector.injectFitnessSchedule(themeDir, userData, safeName);
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
        const brandModeArg = args.find(arg => arg.startsWith('--brandMode='));
        const slugArg = args.find(arg => arg.startsWith('--slug='));

        let base: BaseTheme | undefined = undefined;
        if (baseArg) base = baseArg.split('=')[1].toLowerCase() as BaseTheme;

        let mode: GeneratorMode = 'standard';
        if (modeArg) mode = modeArg.split('=')[1].toLowerCase() as GeneratorMode;
        let brandMode: BrandMode | undefined = undefined;
        if (brandModeArg) brandMode = brandModeArg.split('=')[1].toLowerCase() as BrandMode;

        let data: GeneratorData = {};
        if (dataArg) {
            try {
                data = JSON.parse(dataArg.substring(7));
            } catch (e) {
                console.error("Error parsing JSON data:", e);
                process.exit(1);
            }
        }

        const slug = slugArg ? slugArg.split('=')[1] : undefined;

        try {
            const result = await generateTheme({ base, mode, brandMode, data, slug });
            console.log(JSON.stringify(result));
        } catch (e) {
            process.exit(1);
        }
    })();
}
