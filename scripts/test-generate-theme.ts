
import { generateTheme } from '../src/generator/index';
import path from 'path';
import fs from 'fs-extra';
import { execSync } from 'child_process';

async function testGeneration() {
    console.log('[Test] Starting Test Generation...');

    const testSlug = 'e2e-test-theme';
    const outputDir = path.join(process.cwd(), 'output', testSlug);

    // Clean up previous runs
    if (fs.existsSync(outputDir)) {
        fs.removeSync(outputDir);
    }

    try {
        const result = await generateTheme({
            base: 'ollie',
            mode: 'standard',
            slug: testSlug,
            data: {
                name: "E2E Test Site",
                hero_headline: "Safe Loader Verification",
                hero_subheadline: "This theme should not crash.",
                pages: [
                    { title: "Home", slug: "home" },
                    { title: "About Us", slug: "about" },
                    { title: "Contact", slug: "contact" },
                ],
                menus: [
                    {
                        name: "Main Menu",
                        items: [
                            { label: "Home", url: "/" },
                            { label: "About", url: "/about" },
                        ]
                    }
                ]
            }
        });

        console.log('[Test] Generation Result:', result);

        if (result.status !== 'success') {
            throw new Error('Generation failed');
        }

        const themeDir = result.themeDir;
        const functionsPath = path.join(themeDir, 'functions.php');

        if (!fs.existsSync(functionsPath)) {
            throw new Error('functions.php not found!');
        }

        const functionsContent = fs.readFileSync(functionsPath, 'utf8');

        // Check for Safe Loader
        if (functionsContent.includes('presspilot_safe_setup_')) {
            console.log('[Test] PASS: Safe Loader function detected.');
        } else {
            console.error('[Test] FAIL: Safe Loader NOT detected.');
            process.exit(1);
        }

        // Check for Hook
        if (functionsContent.includes("add_action('after_switch_theme'")) {
            console.log('[Test] PASS: correctly hooked to after_switch_theme.');
        } else {
            console.error('[Test] FAIL: after_switch_theme hook missing.');
            process.exit(1);
        }

        // PHP Lint Check
        console.log('[Test] Running PHP Syntax Check...');
        try {
            execSync(`php -l "${functionsPath}"`, { stdio: 'inherit' });
            console.log('[Test] PASS: functions.php has valid syntax.');
        } catch (e) {
            console.error('[Test] FAIL: PHP Syntax Error detected.');
            process.exit(1);
        }

        console.log('[Test] ALL CHECKS PASSED. Theme is safe.');

    } catch (err) {
        console.error('[Test] Error:', err);
        process.exit(1);
    }
}

testGeneration();
