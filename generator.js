/**
 * PressPilot Factory Worker
 * Location: /root/presspilot/generator.js
 */

const fs = require('fs-extra');
const path = require('path');
const archiver = require('archiver');

// --- THEME PERSONALITIES ---
const THEME_PERSONALITIES = {
    'ollie': {
        colors: {
            brand: 'primary',
            brand_alt: 'main',
            accent: 'secondary'
        },
        patterns: {
            hero: 'patterns/hero-light.php',
            hero_search_headline: 'Build your site with clicks, not code.',
            hero_search_sub: 'Easily create beautiful, fully-customizable websites with the new WordPress Site Editor and the Ollie block theme. No coding skills required.'
        },
        home_template: 'templates/home.html'
    },
    'frost': {
        colors: {
            brand: 'primary',
            brand_alt: 'contrast',
            accent: 'secondary'
        },
        patterns: {
            hero: 'patterns/hero-one-column.php',
            hero_search_headline: 'Welcome to Frost',
            // Note: Frost splits headline/subheadline into separate blocks or just text.
            // Our regex replacement in 'pattern' (below) needs to be robust. 
            // For now, we use the known string.
            hero_search_sub: 'With its clean, minimal design and powerful feature set, Frost enables agencies to build stylish and sophisticated WordPress websites.'
        },
        home_template: 'templates/home.html' // Frost uses home.html
    },
    'twentytwentyfour': {
        colors: {
            brand: 'accent', // TT4 generally has an 'accent' or we use 'base'/'contrast' logic
            brand_alt: 'contrast',
            accent: 'base'
        },
        patterns: {
            hero: 'patterns/hero.php', // Standard TT4 hero
            hero_search_headline: 'Et magna binilla', // We might need to sniff this or just rely on Heavy Mode injection
            hero_search_sub: 'Lorem ipsum dolor sit amet'
        },
        home_template: 'templates/home.html'
    }
};

async function generateTheme() {
    // 1. SETUP
    const args = process.argv.slice(2);

    // Parse Arguments
    const dataArg = args.find(arg => arg.startsWith('--data='));
    const baseArg = args.find(arg => arg.startsWith('--base='));
    const modeArg = args.find(arg => arg.startsWith('--mode='));

    let baseName = 'ollie';
    if (baseArg) baseName = baseArg.split('=')[1].toLowerCase();

    let mode = 'standard';
    if (modeArg) mode = modeArg.split('=')[1].toLowerCase();

    // Validation
    const personality = THEME_PERSONALITIES[baseName];
    if (!personality) {
        console.error(`Error: Unknown base theme '${baseName}'.`);
        process.exit(1);
    }

    console.log(`Using Base Chassis: ${baseName.toUpperCase()}`);
    console.log(`Mode: ${mode.toUpperCase()}`);

    let userData = {};
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
    const buildDir = path.join(__dirname, 'output', `${safeName}-${timestamp}`);
    const zipPath = path.join(__dirname, 'output', `${safeName}-${timestamp}.zip`);
    const themeDir = path.join(buildDir, safeName);
    const BASE_THEME_PATH = path.join(__dirname, 'bases', baseName);

    console.log(`Starting generation for: ${themeName}`);

    try {
        await fs.ensureDir(themeDir);

        if (!fs.existsSync(BASE_THEME_PATH)) {
            // Fallback for Spectra if not present, to avoid crashing if user hasn't downloaded it
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
                let brandColor = palette.find(c => c.slug === brandSlug);
                if (brandColor) brandColor.color = userData.primary;

                const altSlug = personality.colors.brand_alt;
                let altColor = palette.find(c => c.slug === altSlug);
                if (altColor) altColor.color = userData.primary;
            }
            if (userData.secondary) {
                const accentSlug = personality.colors.accent;
                let accentColor = palette.find(c => c.slug === accentSlug);
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
            const heavyPatternSrc = path.join(__dirname, 'assets', 'patterns', 'universal-heavy.php');
            const heavyPatternDest = path.join(themeDir, 'patterns', 'presspilot-heavy.php');

            // 1. Copy the Pattern
            if (await fs.pathExists(heavyPatternSrc)) {
                await fs.copy(heavyPatternSrc, heavyPatternDest);
                console.log('Injected Universal Heavy Pattern.');

                // 2. Overwrite Home Template to use it
                // We create a new home.html that wraps the pattern with Header/Footer
                if (personality.home_template) {
                    const homeTemplatePath = path.join(themeDir, personality.home_template);

                    // Universal FSE Structure
                    const homeContent = `
<!-- wp:template-part {"slug":"header","tagName":"header"} /-->
<!-- wp:group {"tagName":"main","layout":{"inherit":true}} -->
<main class="wp-block-group">
    <!-- wp:pattern {"slug":"presspilot/universal-heavy"} /-->
</main>
<!-- /wp:group -->
<!-- wp:template-part {"slug":"footer","tagName":"footer"} /-->
`;
                    await fs.writeFile(homeTemplatePath, homeContent.trim());
                    console.log(`Forced Home Template (${personality.home_template}) to use Heavy Pattern with Header/Footer.`);
                }



                // 3. FORCE BLOG TEMPLATES (Universal Blog)
                // Updated v6: Added correct <ul> wrapper for Post Template Grid to prevent "Attempt Recovery"
                const blogTemplates = ['home.html', 'index.html'];
                const blogContent = `
<!-- wp:template-part {"slug":"header","tagName":"header"} /-->
<!-- wp:group {"tagName":"main","layout":{"inherit":true}} -->
<main class="wp-block-group">
    <!-- wp:heading {"level":1,"align":"wide","style":{"spacing":{"padding":{"top":"4rem","bottom":"2rem"}}}} -->
    <h1 class="wp-block-heading alignwide" style="padding-top:4rem;padding-bottom:2rem">Latest Updates</h1>
    <!-- /wp:heading -->

    <!-- wp:query {"query":{"perPage":6,"pages":0,"offset":0,"postType":"post","order":"desc","orderBy":"date","author":"","search":"","exclude":[],"sticky":"","inherit":false},"align":"wide","layout":{"type":"constrained"}} -->
    <div class="wp-block-query alignwide">
        <!-- wp:post-template {"align":"wide","style":{"spacing":{"blockGap":"var:preset|spacing|30"}},"layout":{"type":"grid","columnCount":3}} -->
        <ul class="wp-block-post-template alignwide is-layout-grid wp-block-post-template-is-layout-grid" style="gap:var(--wp--preset--spacing--30)">
            <!-- wp:post-featured-image {"isLink":true,"aspectRatio":"3/2"} /-->
            <!-- wp:post-title {"isLink":true,"fontSize":"large"} /-->
            <!-- wp:post-excerpt /-->
            <!-- wp:post-date /-->
        </ul>
        <!-- /wp:post-template -->
        
        <!-- wp:query-pagination -->
            <!-- wp:query-pagination-previous /-->
            <!-- wp:query-pagination-numbers /-->
            <!-- wp:query-pagination-next /-->
        <!-- /wp:query-pagination -->
    </div>
    <!-- /wp:query -->
</main>
<!-- /wp:group -->
<!-- wp:template-part {"slug":"footer","tagName":"footer"} /-->
`;
                for (const tpl of blogTemplates) {
                    const tplPath = path.join(themeDir, 'templates', tpl);
                    await fs.writeFile(tplPath, blogContent.trim());
                    console.log(`Forced ${tpl} to use Universal Blog Pattern (v6 Fixed).`);
                }

                // 4. UNIVERSAL FOOTER INJECTION
                // Updated v6: Uses Dynamic Name + "Powered by PressPilot"
                const footerPath = path.join(themeDir, 'parts', 'footer.html');
                const footerName = userData.name || 'PressPilot Site';
                const universalFooter = `
<!-- wp:group {"align":"full","style":{"spacing":{"padding":{"top":"var:preset|spacing|50","bottom":"var:preset|spacing|50"}}},"layout":{"type":"constrained"}} -->
<div class="wp-block-group alignfull" style="padding-top:var(--wp--preset--spacing--50);padding-bottom:var(--wp--preset--spacing--50)">
    <!-- wp:group {"align":"wide","layout":{"type":"flex","justifyContent":"space-between"}} -->
    <div class="wp-block-group alignwide">
        <!-- wp:paragraph {"fontSize":"small"} -->
        <p class="has-small-font-size">© ${new Date().getFullYear()} ${footerName} · Powered by PressPilot</p>
        <!-- /wp:paragraph -->
        
        <!-- wp:paragraph {"fontSize":"small"} -->
        <p class="has-small-font-size"><a href="#">Facebook</a> · <a href="#">LinkedIn</a></p>
        <!-- /wp:paragraph -->
    </div>
    <!-- /wp:group -->
</div>
<!-- /wp:group -->
`;
                await fs.ensureDir(path.dirname(footerPath));
                await fs.writeFile(footerPath, universalFooter.trim());
                console.log('Forced Universal Footer into parts/footer.html.');

                // 5. Overwrite Archive & Search Templates to be universal
                // These often reference theme-specific patterns that fail. We replace them with standard FSE structures.
                const patternsToSafe = ['archive.html', 'search.html'];
                for (const tmpl of patternsToSafe) {
                    const tmplPath = path.join(themeDir, 'templates', tmpl);
                    if (await fs.pathExists(tmplPath)) {
                        const titleBlock = tmpl === 'search.html' ?
                            '<!-- wp:heading {"level":1,"align":"wide","style":{"spacing":{"padding":{"top":"4rem","bottom":"2rem"}}}} --><h1 class="wp-block-heading alignwide" style="padding-top:4rem;padding-bottom:2rem">Search Results</h1><!-- /wp:heading -->' :
                            '<!-- wp:query-title {"type":"archive","align":"wide","style":{"spacing":{"padding":{"top":"4rem","bottom":"2rem"}}}} /-->';

                        const safeContent = `
<!-- wp:template-part {"slug":"header","tagName":"header"} /-->
<!-- wp:group {"tagName":"main","layout":{"inherit":true}} -->
<main class="wp-block-group">
    ${titleBlock}
    <!-- wp:query {"query":{"perPage":6,"pages":0,"offset":0,"postType":"post","order":"desc","orderBy":"date","author":"","search":"","exclude":[],"sticky":"","inherit":true},"align":"wide","layout":{"type":"constrained"}} -->
    <div class="wp-block-query alignwide">
        <!-- wp:post-template {"align":"wide","layout":{"type":"grid","columnCount":3}} -->
            <!-- wp:post-featured-image {"isLink":true,"aspectRatio":"3/2"} /-->
            <!-- wp:post-title {"isLink":true,"fontSize":"large"} /-->
            <!-- wp:post-excerpt /-->
            <!-- wp:post-date /-->
        <!-- /wp:post-template -->
        <!-- wp:query-pagination -->
            <!-- wp:query-pagination-previous /-->
            <!-- wp:query-pagination-numbers /-->
            <!-- wp:query-pagination-next /-->
        <!-- /wp:query-pagination -->
    </div>
    <!-- /wp:query -->
</main>
<!-- /wp:group -->
<!-- wp:template-part {"slug":"footer","tagName":"footer"} /-->
`;
                        await fs.writeFile(tmplPath, safeContent.trim());
                        console.log(`Forced ${tmpl} to use Universal Pattern.`);
                    }
                }
            } else {
                console.error("Universal Heavy Pattern asset missing!");
            }
        }
        else {
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
        archive.on('error', err => { throw err; });
        archive.pipe(output);
        archive.directory(themeDir, safeName);
        await archive.finalize();

    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

generateTheme();
