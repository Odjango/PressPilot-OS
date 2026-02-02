
import { generateTheme } from '../src/generator/index';
import path from 'path';
import fs from 'fs-extra';
import { execSync } from 'child_process';

// Sample base64 logo for testing logo handling (red circle icon)
const SAMPLE_LOGO_BASE64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAACXBIWXMAAAsTAAALEwEAmpwYAAABhElEQVR4nO2ZsU7DMBCGvwpYGFhYWJAYeAJGBt6AhYGBgYWFhSdgZOANWBgYGFhYWBgYWFhYGBhY+gRUiEJpGsc+O3b/T7Jkxfb9d3aciw2BQCAQCNQRXArUA0ABHAKngE9gGzgCFoFH4BN4A26BK+AG+KkT4DuwBXwBs0A3MF8C94F3qk8UcZoB7gCngAdgHjisUALdALp4P9ALdONPATp5t6uZAR6AbeAIWKE+WZC3YnkNuADeA1/AHrBLPbIgb8XyFjiucNxfgb8k8AQ8BY6BVeoZWDi2wCEwAhwDx8AqtQt8D8T2gAPgCFilvoE/s2gKOARGgWNglXoHtoENYAo4BlaoJSAsO3EIDALHwAq1B4RlLQ6AI2AcOAaWqUNgWH5mEjgGpoFV6gMQliMxCIwCU8Ay9QEIy9EYBoaBQ2CYOgEEZW8MAwfACDAILFIfgKCciSFgEBgChqgvQFBuyhBwAJxS0b+TQUhPyj0wCPQBfVTsnwWBQCAQCATqjl+ZbcxmFOQQWQAAAABJRU5ErkJggg==';

async function testKookoPizza() {
    console.log('[Test] Starting Kooko Pizza Generation (Using Prepared Core)...');

    // Note: ThemeSelector will pick twentytwentyfour for "Pizza" industry automatically
    // But we can also force it if needed. 

    const testSlug = 'kooko-pizza-prepared';
    const outputDir = path.join(process.cwd(), 'output', testSlug);

    if (fs.existsSync(outputDir)) {
        fs.removeSync(outputDir);
    }

    try {
        const result = await generateTheme({
            base: 'twentytwentyfour', // Force TT4 to test our prepared core
            mode: 'standard',
            slug: testSlug,
            data: {
                name: "Kooko Pizza",
                industry: "restaurant",
                logo: SAMPLE_LOGO_BASE64,
                hero_headline: "The Best Pizza in Town",
                hero_subheadline: "Try our fresh organic ingredients today.",
                description: "Hand-crafted pizzas with authentic Italian recipes since 1995.",
                pages: [
                    { title: "Home", slug: "home", template: 'universal-home' },
                    { title: "Menu", slug: "menu", template: 'universal-menu' }
                ],
                menus: [
                    {
                        title: "Pizzas",
                        items: [
                            { name: "Margherita", price: "$12.99", description: "Tomato, mozzarella, fresh basil" },
                            { name: "Pepperoni", price: "$14.99", description: "Classic pepperoni with spicy honey" }
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
        const bannerPath = path.join(themeDir, 'patterns', 'banner-hero.php');

        if (!fs.existsSync(bannerPath)) {
            throw new Error('banner-hero.php not found in output!');
        }

        const content = fs.readFileSync(bannerPath, 'utf8');

        console.log('[Test] Checking pattern content replacement...');

        if (content.includes('The Best Pizza in Town') && content.includes('Kooko Pizza')) {
            console.log('[Test] PASS: Content correctly replaced in banner-hero.php');
        } else {
            console.error('[Test] FAIL: Content NOT replaced correctly.');
            console.log('Snippet:', content.substring(0, 500));
            process.exit(1);
        }

        if (content.includes('{{HERO_TITLE}}') || content.includes('{{BUSINESS_NAME}}')) {
            console.error('[Test] FAIL: Standardized placeholders still present in output!');
            process.exit(1);
        } else {
            console.log('[Test] PASS: All placeholders were substituted in banner-hero.php.');
        }

        // Check pricing pattern
        const pricingPath = path.join(themeDir, 'patterns', 'cta-pricing.php');
        if (fs.existsSync(pricingPath)) {
            const pricingContent = fs.readFileSync(pricingPath, 'utf8');
            if (pricingContent.includes('Our Pricing') && pricingContent.includes('Starter')) {
                console.log('[Test] PASS: Pricing pattern replaced correctly.');
            } else {
                console.error('[Test] FAIL: Pricing pattern NOT replaced correctly.');
                process.exit(1);
            }
        }

        // Check FAQ pattern
        const faqPath = path.join(themeDir, 'patterns', 'text-faq.php');
        if (fs.existsSync(faqPath)) {
            const faqContent = fs.readFileSync(faqPath, 'utf8');
            if (faqContent.includes('Common Questions') && faqContent.includes('Frequently Asked Question 1?')) {
                console.log('[Test] PASS: FAQ pattern replaced correctly.');
            } else {
                console.error('[Test] FAIL: FAQ pattern NOT replaced correctly.');
                process.exit(1);
            }
        }

        console.log('[Test] Kooko Pizza Test PASSED.');

    } catch (err: any) {
        console.error('[Test] Error:', err.message);
        process.exit(1);
    }
}

testKookoPizza();
