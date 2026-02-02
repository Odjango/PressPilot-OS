
import { generateTheme } from '../src/generator/index';
import path from 'path';
import fs from 'fs-extra';

// Sample base64 logo for testing logo handling (red circle icon)
const SAMPLE_LOGO_BASE64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAACXBIWXMAAAsTAAALEwEAmpwYAAABhElEQVR4nO2ZsU7DMBCGvwpYGFhYWJAYeAJGBt6AhYGBgYWFhSdgZOANWBgYGFhYWBgYWFhYGBhY+gRUiEJpGsc+O3b/T7Jkxfb9d3aciw2BQCAQCNQRXArUA0ABHAKngE9gGzgCFoFH4BN4A26BK+AG+KkT4DuwBXwBs0A3MF8C94F3qk8UcZoB7gCngAdgHjisUALdALp4P9ALdONPATp5t6uZAR6AbeAIWKE+WZC3YnkNuADeA1/AHrBLPbIgb8XyFjiucNxfgb8k8AQ8BY6BVeoZWDi2wCEwAhwDx8AqtQt8D8T2gAPgCFilvoE/s2gKOARGgWNglXoHtoENYAo4BlaoJSAsO3EIDALHwAq1B4RlLQ6AI2AcOAaWqUNgWH5mEjgGpoFV6gMQliMxCIwCU8Ay9QEIy9EYBoaBQ2CYOgEEZW8MAwfACDAILFIfgKCciSFgEBgChqgvQFBuyhBwAJxS0b+TQUhPyj0wCPQBfVTsnwWBQCAQCATqjl+ZbcxmFOQQWQAAAABJRU5ErkJggg==';

async function testBeboPizza() {
    console.log('[Test] Starting Bebo Pizza Generation...');

    const testSlug = 'bebo-pizza';
    const outputDir = path.join(process.cwd(), 'output', testSlug);

    if (fs.existsSync(outputDir)) {
        fs.removeSync(outputDir);
    }

    try {
        const result = await generateTheme({
            base: 'twentytwentyfour',
            mode: 'standard',
            slug: testSlug,
            data: {
                name: "Bebo Pizza",
                industry: "restaurant",
                logo: SAMPLE_LOGO_BASE64,
                hero_headline: "Authentic Italian Pizza",
                hero_subheadline: "Fresh ingredients, traditional recipes, unforgettable taste.",
                description: "Family-owned pizzeria serving the community since 2005.",
                pages: [
                    { title: "Home", slug: "home", template: 'universal-home' },
                    { title: "Menu", slug: "menu", template: 'universal-menu' }
                ],
                menus: [
                    {
                        title: "Signature Pizzas",
                        items: [
                            { name: "Quattro Formaggi", price: "$16.99", description: "Four cheese blend with truffle oil" },
                            { name: "Diavola", price: "$15.99", description: "Spicy salami, chili flakes, fresh mozzarella" },
                            { name: "Margherita DOP", price: "$14.99", description: "San Marzano tomatoes, buffalo mozzarella, basil" }
                        ]
                    },
                    {
                        title: "Appetizers",
                        items: [
                            { name: "Garlic Knots", price: "$6.99", description: "Fresh baked with garlic butter" },
                            { name: "Bruschetta", price: "$8.99", description: "Grilled bread with tomato and basil" }
                        ]
                    }
                ]
            }
        });

        console.log('[Test] Generation Result:', result.status);

        if (result.status !== 'success') {
            throw new Error('Generation failed');
        }

        const themeDir = result.themeDir;

        // Check header for logo
        const headerPath = path.join(themeDir, 'parts', 'header.html');
        if (fs.existsSync(headerPath)) {
            const headerContent = fs.readFileSync(headerPath, 'utf8');
            if (headerContent.includes('wp:image') && headerContent.includes('assets/images/logo')) {
                console.log('[Test] PASS: Header uses wp:image block with direct logo URL');
            } else {
                console.error('[Test] FAIL: Header does not use wp:image block for logo');
            }
        }

        // Check footer for logo
        const footerPath = path.join(themeDir, 'parts', 'footer.html');
        if (fs.existsSync(footerPath)) {
            const footerContent = fs.readFileSync(footerPath, 'utf8');
            if (footerContent.includes('wp:image') && footerContent.includes('assets/images/logo')) {
                console.log('[Test] PASS: Footer uses wp:image block with direct logo URL');
            } else {
                console.error('[Test] FAIL: Footer does not use wp:image block for logo');
            }
        }

        // Check menu page for correct colors
        const menuPagePath = path.join(themeDir, 'templates', 'page-menu.html');
        if (fs.existsSync(menuPagePath)) {
            const menuContent = fs.readFileSync(menuPagePath, 'utf8');
            if (menuContent.includes('backgroundColor":"contrast"') && menuContent.includes('textColor":"base"')) {
                console.log('[Test] PASS: Menu page uses contrast/base colors for hero section');
            } else {
                console.error('[Test] FAIL: Menu page does not use correct contrast colors');
            }
        }

        // Check logo file exists
        const logoPath = path.join(themeDir, 'assets', 'images', 'logo.png');
        if (fs.existsSync(logoPath)) {
            console.log('[Test] PASS: Logo file saved to assets/images/logo.png');
        } else {
            console.error('[Test] FAIL: Logo file not found');
        }

        console.log('\n[Test] Bebo Pizza theme generated at:', themeDir);
        console.log('[Test] You can now test it in WordPress Playground!');

    } catch (err: any) {
        console.error('[Test] Error:', err.message);
        process.exit(1);
    }
}

testBeboPizza();
