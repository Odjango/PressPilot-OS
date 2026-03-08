
import { generateTheme } from '../src/generator/index';
import path from 'path';
import fs from 'fs-extra';

// Sample base64 logo for testing (coffee cup icon)
const SAMPLE_LOGO_BASE64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAACXBIWXMAAAsTAAALEwEAmpwYAAABhElEQVR4nO2ZsU7DMBCGvwpYGFhYWJAYeAJGBt6AhYGBgYWFhSdgZOANWBgYGFhYWBgYWFhYGBhY+gRUiEJpGsc+O3b/T7Jkxfb9d3aciw2BQCAQCNQRXArUA0ABHAKngE9gGzgCFoFH4BN4A26BK+AG+KkT4DuwBXwBs0A3MF8C94F3qk8UcZoB7gCngAdgHjisUALdALp4P9ALdONPATp5t6uZAR6AbeAIWKE+WZC3YnkNuADeA1/AHrBLPbIgb8XyFjiucNxfgb8k8AQ8BY6BVeoZWDi2wCEwAhwDx8AqtQt8D8T2gAPgCFilvoE/s2gKOARGgWNglXoHtoENYAo4BlaoJSAsO3EIDALHwAq1B4RlLQ6AI2AcOAaWqUNgWH5mEjgGpoFV6gMQliMxCIwCU8Ay9QEIy9EYBoaBQ2CYOgEEZW8MAwfACDAILFIfgKCciSFgEBgChqgvQFBuyhBwAJxS0b+TQUhPyj0wCPQBfVTsnwWBQCAQCATqjl+ZbcxmFOQQWQAAAABJRU5ErkJggg==';

async function testRestaurantE2E() {
    console.log('========================================');
    console.log('[E2E Test] Restaurant/Cafe - Bella Café');
    console.log('========================================\n');

    const testSlug = 'bella-cafe-e2e';
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
                name: "Bella Café",
                industry: "restaurant",
                logo: SAMPLE_LOGO_BASE64,
                hero_headline: "Fresh Coffee, Warm Atmosphere",
                hero_subheadline: "Experience the finest artisan coffee and pastries in downtown.",
                description: "Bella Café has been serving the community with premium coffee and homemade pastries since 2010. Our cozy atmosphere and friendly baristas make every visit memorable.",
                pages: [
                    { title: "Home", slug: "home", template: 'universal-home' },
                    { title: "Menu", slug: "menu", template: 'universal-menu' },
                    { title: "About", slug: "about", template: 'universal-about' },
                    { title: "Contact", slug: "contact", template: 'universal-contact' }
                ],
                menus: [
                    {
                        title: "Coffee & Espresso",
                        items: [
                            { name: "House Blend", price: "$3.50", description: "Rich and smooth medium roast" },
                            { name: "Cappuccino", price: "$4.50", description: "Espresso with steamed milk foam" },
                            { name: "Latte", price: "$4.75", description: "Espresso with silky steamed milk" },
                            { name: "Cold Brew", price: "$4.25", description: "24-hour steeped for smooth flavor" }
                        ]
                    },
                    {
                        title: "Pastries & Treats",
                        items: [
                            { name: "Croissant", price: "$3.25", description: "Buttery, flaky French pastry" },
                            { name: "Blueberry Muffin", price: "$3.50", description: "Fresh berries, crumb topping" },
                            { name: "Chocolate Brownie", price: "$3.75", description: "Rich, fudgy homemade brownie" }
                        ]
                    }
                ],
                colors: {
                    primary: "#8B4513",
                    secondary: "#D2691E",
                    accent: "#F5DEB3"
                }
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
            JSON.parse(fs.readFileSync(themeJsonPath, 'utf8'));
            console.log('  ✓ theme.json is valid JSON');
        } catch (e) {
            throw new Error('theme.json is invalid JSON');
        }

        // Check front-page has content
        const frontPagePath = path.join(themeDir, 'templates', 'front-page.html');
        const frontPageContent = fs.readFileSync(frontPagePath, 'utf8');
        if (frontPageContent.includes('wp:template-part') && frontPageContent.includes('wp:pattern')) {
            console.log('  ✓ front-page.html has template parts and patterns');
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

        console.log('\n========================================');
        console.log('[E2E Test] Restaurant/Cafe: PASSED ✓');
        console.log('========================================');
        console.log(`Output: ${result.downloadPath}\n`);

        return { success: true, path: result.downloadPath };

    } catch (err: any) {
        console.error('\n========================================');
        console.error('[E2E Test] Restaurant/Cafe: FAILED ✗');
        console.error('========================================');
        console.error('Error:', err.message);
        return { success: false, error: err.message };
    }
}

testRestaurantE2E();
