
import { generateTheme } from '../src/generator/index';
import path from 'path';
import fs from 'fs-extra';

// Sample base64 logo for testing (shopping bag icon)
const SAMPLE_LOGO_BASE64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAACXBIWXMAAAsTAAALEwEAmpwYAAABhElEQVR4nO2ZsU7DMBCGvwpYGFhYWJAYeAJGBt6AhYGBgYWFhSdgZOANWBgYGFhYWBgYWFhYGBhY+gRUiEJpGsc+O3b/T7Jkxfb9d3aciw2BQCAQCNQRXArUA0ABHAKngE9gGzgCFoFH4BN4A26BK+AG+KkT4DuwBXwBs0A3MF8C94F3qk8UcZoB7gCngAdgHjisUALdALp4P9ALdONPATp5t6uZAR6AbeAIWKE+WZC3YnkNuADeA1/AHrBLPbIgb8XyFjiucNxfgb8k8AQ8BY6BVeoZWDi2wCEwAhwDx8AqtQt8D8T2gAPgCFilvoE/s2gKOARGgWNglXoHtoENYAo4BlaoJSAsO3EIDALHwAq1B4RlLQ6AI2AcOAaWqUNgWH5mEjgGpoFV6gMQliMxCIwCU8Ay9QEIy9EYBoaBQ2CYOgEEZW8MAwfACDAILFIfgKCciSFgEBgChqgvQFBuyhBwAJxS0b+TQUhPyj0wCPQBfVTsnwWBQCAQCATqjl+ZbcxmFOQQWQAAAABJRU5ErkJggg==';

async function testEcommerceE2E() {
    console.log('========================================');
    console.log('[E2E Test] E-commerce - Urban Style Co');
    console.log('========================================\n');

    const testSlug = 'urban-style-e2e';
    const outputDir = path.join(process.cwd(), 'output', testSlug);

    if (fs.existsSync(outputDir)) {
        fs.removeSync(outputDir);
    }

    try {
        const startTime = Date.now();

        const result = await generateTheme({
            base: 'twentytwentyfour',
            mode: 'standard',
            slug: testSlug,
            data: {
                name: "Urban Style Co",
                industry: "ecommerce",
                logo: SAMPLE_LOGO_BASE64,
                hero_headline: "Elevate Your Everyday Look",
                hero_subheadline: "Discover curated fashion essentials that blend comfort with contemporary style.",
                description: "Urban Style Co offers a carefully curated collection of modern fashion essentials. From casual streetwear to refined basics, we believe style should be effortless and accessible to everyone.",
                pages: [
                    { title: "Home", slug: "home", template: 'universal-home' },
                    { title: "Shop", slug: "shop", template: 'universal-services' },
                    { title: "About", slug: "about", template: 'universal-about' },
                    { title: "Contact", slug: "contact", template: 'universal-contact' }
                ],
                services: [
                    {
                        title: "Men's Collection",
                        description: "Contemporary essentials for the modern man. T-shirts, jackets, and accessories."
                    },
                    {
                        title: "Women's Collection",
                        description: "Effortless style for every occasion. Dresses, tops, and curated basics."
                    },
                    {
                        title: "Accessories",
                        description: "Complete your look with our selection of bags, hats, and jewelry."
                    },
                    {
                        title: "New Arrivals",
                        description: "Fresh styles dropping weekly. Be the first to shop the latest trends."
                    }
                ],
                colors: {
                    primary: "#1a1a2e",
                    secondary: "#16213e",
                    accent: "#e94560"
                },
                cta_primary: "Shop Now",
                cta_secondary: "View Collection"
            }
        });

        const duration = ((Date.now() - startTime) / 1000).toFixed(2);
        console.log(`[E2E Test] Generation completed in ${duration}s`);
        console.log(`[E2E Test] Status: ${result.status}`);

        if (result.status !== 'success') {
            throw new Error('Generation failed');
        }

        // Validation checks
        const themeDir = result.themeDir;
        console.log(`[E2E Test] Theme directory: ${themeDir}\n`);

        // Check critical files exist
        const criticalFiles = [
            'style.css',
            'theme.json',
            'functions.php',
            'templates/index.html',
            'templates/front-page.html',
            'parts/header.html',
            'parts/footer.html'
        ];

        console.log('[E2E Test] Checking critical files...');
        for (const file of criticalFiles) {
            const filePath = path.join(themeDir, file);
            if (fs.existsSync(filePath)) {
                console.log(`  ✓ ${file}`);
            } else {
                console.error(`  ✗ ${file} MISSING`);
                throw new Error(`Missing critical file: ${file}`);
            }
        }

        // Check functions.php for valid PHP (no syntax errors in function names)
        const functionsContent = fs.readFileSync(path.join(themeDir, 'functions.php'), 'utf8');
        if (functionsContent.includes('function pp_')) {
            console.log('  ✓ PHP function names have pp_ prefix');
        }

        // Check for logo setup
        if (functionsContent.includes('setup_logo') || functionsContent.includes('site_logo')) {
            console.log('  ✓ Logo setup function present');
        }

        // Check theme.json is valid JSON
        const themeJsonPath = path.join(themeDir, 'theme.json');
        try {
            const themeJson = JSON.parse(fs.readFileSync(themeJsonPath, 'utf8'));
            console.log('  ✓ theme.json is valid JSON');

            // Check color palette
            if (themeJson.settings?.color?.palette) {
                console.log(`  ✓ Color palette defined (${themeJson.settings.color.palette.length} colors)`);
            }
        } catch (e) {
            throw new Error('theme.json is invalid JSON');
        }

        // Check front-page has content
        const frontPagePath = path.join(themeDir, 'templates', 'front-page.html');
        const frontPageContent = fs.readFileSync(frontPagePath, 'utf8');
        if (frontPageContent.includes('wp:template-part') && frontPageContent.includes('wp:pattern')) {
            console.log('  ✓ front-page.html has template parts and patterns');
        }

        // Check header has site-logo
        const headerPath = path.join(themeDir, 'parts', 'header.html');
        const headerContent = fs.readFileSync(headerPath, 'utf8');
        if (headerContent.includes('wp:site-logo')) {
            console.log('  ✓ Header uses wp:site-logo block');
        }

        // Check footer has site-logo
        const footerPath = path.join(themeDir, 'parts', 'footer.html');
        const footerContent = fs.readFileSync(footerPath, 'utf8');
        if (footerContent.includes('wp:site-logo')) {
            console.log('  ✓ Footer uses wp:site-logo block');
        }
        if (footerContent.includes('PressPilot')) {
            console.log('  ✓ Footer has PressPilot credit');
        }

        // Check for no placeholder syntax
        const allFiles = [
            path.join(themeDir, 'templates', 'front-page.html'),
            path.join(themeDir, 'parts', 'header.html'),
            path.join(themeDir, 'parts', 'footer.html')
        ];

        let hasPlaceholders = false;
        for (const file of allFiles) {
            if (fs.existsSync(file)) {
                const content = fs.readFileSync(file, 'utf8');
                if (content.includes('{{') || content.includes('}}')) {
                    console.error(`  ✗ ${path.basename(file)} contains placeholder syntax`);
                    hasPlaceholders = true;
                }
            }
        }
        if (!hasPlaceholders) {
            console.log('  ✓ No placeholder syntax found in templates');
        }

        // Check style.css header
        const styleContent = fs.readFileSync(path.join(themeDir, 'style.css'), 'utf8');
        if (styleContent.includes('Theme Name:') && styleContent.includes('Urban Style')) {
            console.log('  ✓ style.css has valid theme header');
        }

        console.log('\n========================================');
        console.log('[E2E Test] E-commerce: PASSED ✓');
        console.log('========================================');
        console.log(`Output: ${result.downloadPath}\n`);

        return { success: true, path: result.downloadPath };

    } catch (err: any) {
        console.error('\n========================================');
        console.error('[E2E Test] E-commerce: FAILED ✗');
        console.error('========================================');
        console.error('Error:', err.message);
        return { success: false, error: err.message };
    }
}

testEcommerceE2E();
