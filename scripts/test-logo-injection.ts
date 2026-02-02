
import { generateTheme } from '../src/generator/index';
import path from 'path';
import fs from 'fs-extra';

async function testLogoInjection() {
    console.log('[Test] Starting Logo Injection Validation...');

    const testSlug = 'test-logo-theme';
    const outputDir = path.join(process.cwd(), 'output', testSlug);

    if (fs.existsSync(outputDir)) {
        fs.removeSync(outputDir);
    }

    // A small red square base64 PNG
    const base64Logo = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";

    try {
        const result = await generateTheme({
            base: 'twentytwentyfour',
            mode: 'standard',
            slug: testSlug,
            data: {
                name: "Logo Test Business",
                industry: "lifestyle",
                logo: base64Logo,
                hero_headline: "Testing Logo Injection",
                hero_subheadline: "Ensuring FSE compliance and auto-setup",
                pages: [
                    { title: "Home", slug: "home", template: 'universal-home' }
                ]
            }
        });

        console.log('[Test] Generation Result:', result.status);

        if (result.status !== 'success') {
            throw new Error('Generation failed');
        }

        const themeDir = result.themeDir;

        // 1. Verify logo file exists
        const logoFile = path.join(themeDir, 'assets', 'images', 'logo.png');
        if (fs.existsSync(logoFile)) {
            console.log('[Test] PASS: Logo file created at assets/images/logo.png');
        } else {
            throw new Error('Logo file NOT created!');
        }

        // 2. Verify functions.php contains auto-setup code
        const functionsPhp = path.join(themeDir, 'functions.php');
        const funcContent = fs.readFileSync(functionsPhp, 'utf8');
        if (funcContent.includes('setup_logo') && funcContent.includes('custom_logo') && funcContent.includes('wp_upload_bits')) {
            console.log('[Test] PASS: functions.php contains logo auto-setup code.');
        } else {
            console.error('[Test] FAIL: functions.php missing auto-setup code.');
            console.log('Snippet:', funcContent.substring(funcContent.length - 1000));
            process.exit(1);
        }

        // 3. Verify header.html uses wp:site-logo
        const headerHtml = path.join(themeDir, 'parts', 'header.html');
        const headerContent = fs.readFileSync(headerHtml, 'utf8');
        if (headerContent.includes('<!-- wp:site-logo')) {
            console.log('[Test] PASS: header.html uses wp:site-logo block.');
        } else {
            throw new Error('header.html NOT using wp:site-logo block!');
        }

        console.log('[Test] Logo Injection Validation PASSED.');

    } catch (err: any) {
        console.error('[Test] Error:', err.message);
        process.exit(1);
    }
}

testLogoInjection();
