import { generateTheme } from '../src/generator/index';
import path from 'path';
import fs from 'fs-extra';

async function testOllie() {
    console.log('[Test] Starting Ollie Prepared Test...');
    const testSlug = 'ollie-prepared-test';
    
    try {
        const result = await generateTheme({
            base: 'ollie',
            mode: 'standard',
            slug: testSlug,
            data: {
                name: "Ollie Verified",
                hero_headline: "Ollie Pipeline Success",
                hero_subheadline: "Placeholders are working."
            }
        });

        if (result.status !== 'success') throw new Error('Generation failed');

        const heroPath = path.join(result.themeDir, 'patterns', 'hero-light.php');
        const content = fs.readFileSync(heroPath, 'utf8');

        if (content.includes('Ollie Pipeline Success') && !content.includes('{{HERO_TITLE}}')) {
            console.log('[Test] PASS: Ollie prepared core correctly substituted content.');
        } else {
            console.error('[Test] FAIL: Content replacement failed.');
            process.exit(1);
        }
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
testOllie();
