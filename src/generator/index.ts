import fs from 'fs-extra';
import path from 'path';
import archiver from 'archiver';
import { THEME_PERSONALITIES } from './config';
import { BaseTheme, GeneratorData, GeneratorMode } from './types';
import {
    getUniversalBlogContent,
    getUniversalLandingContent,
    getUniversalHomeContent,
    getUniversalFooterContent,
    getUniversalHeaderContent,
    getArchiveContent,
    getSearchContent
} from './patterns';
import { buildPageTemplate } from './page-builder';

async function generateTheme() {
    // 1. SETUP
    const args = process.argv.slice(2);

    // Parse Arguments
    const dataArg = args.find(arg => arg.startsWith('--data='));
    const baseArg = args.find(arg => arg.startsWith('--base='));
    const modeArg = args.find(arg => arg.startsWith('--mode='));

    let baseName: BaseTheme = 'ollie';
    if (baseArg) baseName = baseArg.split('=')[1].toLowerCase() as BaseTheme;

    let mode: GeneratorMode = 'standard';
    if (modeArg) mode = modeArg.split('=')[1].toLowerCase() as GeneratorMode;

    const personality = THEME_PERSONALITIES[baseName];
    if (!personality) {
        console.error(`Error: Unknown base theme '${baseName}'.`);
        process.exit(1);
    }

    console.log(`Using Base Chassis: ${baseName.toUpperCase()}`);
    console.log(`Mode: ${mode.toUpperCase()}`);

    let userData: GeneratorData = {};
    if (dataArg) {
        try {
            const jsonString = dataArg.substring(7);
            userData = JSON.parse(jsonString);
        } catch (e) {
            console.error("Error parsing JSON data:", e);
            process.exit(1);
        }
    }

    const themeName = userData.name || `PressPilot ${baseName} ${mode}`;
    const safeName = themeName.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const timestamp = Date.now();

    // Adjust paths relative to root (assuming running from root via tsx)
    const rootDir = process.cwd();
    const buildDir = path.join(rootDir, 'output', `${safeName}-${timestamp}`);
    const zipPath = path.join(rootDir, 'output', `${safeName}-${timestamp}.zip`);
    const themeDir = path.join(buildDir, safeName);
    const BASE_THEME_PATH = path.join(rootDir, 'bases', baseName);

    console.log(`Starting generation for: ${themeName}`);

    try {
        await fs.ensureDir(themeDir);

        if (!fs.existsSync(BASE_THEME_PATH)) {
            if (baseName === 'spectra') {
                console.error(`Spectra base not found at ${BASE_THEME_PATH}. Please ensure it is installed.`);
                process.exit(1);
            }
            throw new Error(`Base theme not found at ${BASE_THEME_PATH}`);
        }
        await fs.copy(BASE_THEME_PATH, themeDir);

        // --- DATA INJECTION ---
        // 1. theme.json Colors
        const themeJsonPath = path.join(themeDir, 'theme.json');
        if (await fs.pathExists(themeJsonPath)) {
            const themeJson = await fs.readJson(themeJsonPath);
            const palette = themeJson.settings.color.palette;

            if (userData.primary) {
                const brandSlug = personality.colors.brand;
                const brandColor = palette.find((c: any) => c.slug === brandSlug);
                if (brandColor) brandColor.color = userData.primary;

                const altSlug = personality.colors.brand_alt;
                const altColor = palette.find((c: any) => c.slug === altSlug);
                if (altColor) altColor.color = userData.primary;
            }
            if (userData.secondary) {
                const accentSlug = personality.colors.accent;
                const accentColor = palette.find((c: any) => c.slug === accentSlug);
                if (accentColor) accentColor.color = userData.secondary;
            }
            await fs.writeJson(themeJsonPath, themeJson, { spaces: 4 });
        }

        // 2. Site Info & Style.css
        const siteInfo = { name: themeName, base: baseName, mode: mode };
        await fs.writeJson(path.join(themeDir, 'site-info.json'), siteInfo, { spaces: 4 });

        const styleCssPath = path.join(themeDir, 'style.css');
        if (await fs.pathExists(styleCssPath)) {
            let styleContent = await fs.readFile(styleCssPath, 'utf8');
            styleContent = styleContent.replace(/Theme Name:.*$/m, `Theme Name: ${themeName}`);
            await fs.writeFile(styleCssPath, styleContent);
        }

        // --- HEAVY MODE LOGIC ---
        if (mode === 'heavy') {
            const heavyPatternSrc = path.join(rootDir, 'assets', 'patterns', 'universal-heavy.php');
            const heavyPatternDest = path.join(themeDir, 'patterns', 'presspilot-heavy.php');

            // 1. Copy the Pattern
            await fs.copy(heavyPatternSrc, heavyPatternDest);
            console.log('Injected Universal Heavy Pattern.');

            // 2. FORCE FRONT PAGE (Dynamic Heavy Landing)
            if (personality.home_template) {
                const homeTemplatePath = path.join(themeDir, personality.home_template);

                // SMART IMAGE INJECTION for Home
                // Check if we have userData.images from the CLI
                let heroImage = undefined;
                // @ts-ignore
                if (userData.images && userData.images.length > 0) {
                    // Use the first image for Home Hero
                    // @ts-ignore
                    const localPath = userData.images[0];
                    const ext = path.extname(localPath);
                    const targetFilename = `hero-home${ext}`;
                    const targetPath = path.join(themeDir, 'assets', 'images', targetFilename);

                    await fs.ensureDir(path.dirname(targetPath));
                    await fs.copy(localPath, targetPath);

                    // Hardcoded Theme URL (Relies on folder name matching)
                    heroImage = `/wp-content/themes/${safeName}/assets/images/${targetFilename}`;
                    console.log(`Injected Home Hero Image: ${heroImage}`);
                }

                const homeContent = {
                    hero_title: userData.hero_headline,
                    hero_sub: userData.hero_subheadline,
                    hero_image: heroImage
                };

                await fs.writeFile(homeTemplatePath, getUniversalHomeContent(homeContent).trim());
                console.log(`Forced Home Template (${personality.home_template}) to use Dynamic Universal Home Pattern.`);
            }

            // 3. FORCE BLOG TEMPLATES (Universal Blog)
            const blogTemplates = ['home.html', 'index.html'];
            for (const tpl of blogTemplates) {
                const tplPath = path.join(themeDir, 'templates', tpl);
                await fs.writeFile(tplPath, getUniversalBlogContent().trim());
                console.log(`Forced ${tpl} to use Universal Blog Pattern (v6 Fixed).`);
            }

            // 4. UNIVERSAL FOOTER INJECTION
            const footerPath = path.join(themeDir, 'parts', 'footer.html');
            const footerName = userData.name || 'PressPilot Site';

            await fs.ensureDir(path.dirname(footerPath));
            await fs.writeFile(footerPath, getUniversalFooterContent(footerName).trim());
            console.log('Forced Universal Footer into parts/footer.html.');

            // 4b. UNIVERSAL HEADER INJECTION (Standard Site Logo)
            const headerPath = path.join(themeDir, 'parts', 'header.html');

            await fs.ensureDir(path.dirname(headerPath));
            await fs.writeFile(headerPath, getUniversalHeaderContent(userData.pages).trim());
            console.log('Forced Universal Header (Standard Site Logo) into parts/header.html.');

            // 5. Overwrite Archive & Search Templates
            const archivePath = path.join(themeDir, 'templates', 'archive.html');
            if (await fs.pathExists(archivePath)) {
                await fs.writeFile(archivePath, getArchiveContent().trim());
                console.log(`Forced archive.html to use Universal Pattern.`);
            }

            const searchPath = path.join(themeDir, 'templates', 'search.html');
            if (await fs.pathExists(searchPath)) {
                await fs.writeFile(searchPath, getSearchContent().trim());
                console.log(`Forced search.html to use Universal Pattern.`);
            }

            // 6. Multi-Page Generation (New Phase 2 Logic)
            if (userData.pages && userData.pages.length > 0) {
                console.log(`Processing ${userData.pages.length} custom pages...`);
                for (const page of userData.pages) {
                    await buildPageTemplate(themeDir, page);
                }

                // 7. Auto-Content Loader (PHP Injection)
                // We generate a PHP file that runs on theme activation to create the DB entries.
                const { generateContentLoader } = await import('./utils/content-loader-generator');
                const loaderPhp = generateContentLoader(userData.pages, userData.name || 'My Site', userData.hero_subheadline || '');
                const loaderPath = path.join(themeDir, 'inc', 'content-loader.php');
                await fs.ensureDir(path.dirname(loaderPath));
                await fs.writeFile(loaderPath, loaderPhp);

                // Hook into functions.php
                const functionsPath = path.join(themeDir, 'functions.php');
                if (await fs.pathExists(functionsPath)) {
                    let funcs = await fs.readFile(functionsPath, 'utf8');
                    if (!funcs.includes('content-loader.php')) {
                        funcs += `\n// PressPilot Auto-Loader\nrequire_once get_theme_file_path( 'inc/content-loader.php' );\n`;
                        await fs.writeFile(functionsPath, funcs);
                        console.log('Injected Auto-Content Loader into functions.php');
                    }
                }
            }
        } else {
            // Standard Linear logic (Hero Replacement)
            if (personality.patterns.hero && userData.hero_headline) {
                const heroPath = path.join(themeDir, personality.patterns.hero);
                if (await fs.pathExists(heroPath)) {
                    let heroContent = await fs.readFile(heroPath, 'utf8');
                    heroContent = heroContent.replace(personality.patterns.hero_search_headline, userData.hero_headline);
                    if (userData.hero_subheadline && personality.patterns.hero_search_sub) {
                        heroContent = heroContent.replace(personality.patterns.hero_search_sub, userData.hero_subheadline);
                    }
                    await fs.writeFile(heroPath, heroContent);
                }
            }
        }

        // G. Create ZIP
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
        console.error('Error:', err);
        process.exit(1);
    }
}

generateTheme();
