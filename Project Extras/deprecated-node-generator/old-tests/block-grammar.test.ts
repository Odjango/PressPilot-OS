/**
 * Block Grammar Regression Tests
 *
 * Prevents regressions of the four root causes (RC1-RC4) that caused
 * WordPress "Attempt Recovery" / "Block contains unexpected content" errors
 * in the Site Editor.
 *
 * RC1: dimRatio JSON/HTML mismatch (e.g. dimRatio:75 but has-background-dim-70)
 * RC2: has-background class on wp:cover div (only valid for wp:group)
 * RC3: Cover element order — WP 6.5+ expects <span> before <img>
 * RC4: (REVERSED) style="object-fit:cover" must NOT be on cover <img> — WP uses CSS not inline
 * RC5: Missing has-custom-content-position when contentPosition is set
 * RC6: Cover img must NOT have style="object-fit:cover" (only data-object-fit="cover")
 * RC7: dimRatio class must be rounded to nearest 10 (Math.round(dimRatio/10)*10)
 *
 * Run with: npx tsx tests/unit/block-grammar.test.ts
 */

import { BlockGrammarNormalizer } from '../../src/generator/engine/BlockGrammarNormalizer';
import { ThemeValidator } from '../../src/generator/validator/ThemeValidator';
import { getFullBleedHero } from '../../src/generator/patterns/hero-variants';
import { getUniversalAboutContent } from '../../src/generator/patterns/universal-about';
import { getUniversalContactContent } from '../../src/generator/patterns/universal-contact';
import { getUniversalServicesContent } from '../../src/generator/patterns/universal-services';
import fs from 'fs-extra';
import path from 'path';
import os from 'os';

let passed = 0;
let failed = 0;

function test(name: string, fn: () => Promise<void> | void) {
    const run = async () => {
        try {
            await fn();
            console.log(`  ✅ ${name}`);
            passed++;
        } catch (error) {
            console.log(`  ❌ ${name}`);
            console.log(`     Error: ${error instanceof Error ? error.message : error}`);
            failed++;
        }
    };
    return run();
}

function expect(actual: any) {
    return {
        toBe(expected: any) {
            if (actual !== expected) {
                throw new Error(`Expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
            }
        },
        toContain(expected: string) {
            if (typeof actual !== 'string' || !actual.includes(expected)) {
                throw new Error(`Expected to contain "${expected}", got "${String(actual).substring(0, 200)}..."`);
            }
        },
        toMatch(pattern: RegExp) {
            if (typeof actual !== 'string' || !pattern.test(actual)) {
                throw new Error(`Expected to match ${pattern}, got "${String(actual).substring(0, 200)}..."`);
            }
        },
        not: {
            toContain(expected: string) {
                if (typeof actual === 'string' && actual.includes(expected)) {
                    throw new Error(`Expected NOT to contain "${expected}", but found it`);
                }
            },
            toMatch(pattern: RegExp) {
                if (typeof actual === 'string' && pattern.test(actual)) {
                    throw new Error(`Expected NOT to match ${pattern}, but it matched`);
                }
            }
        }
    };
}

(async () => {
    console.log('\n🧪 Block Grammar Regression Tests\n');

    const normalizer = new BlockGrammarNormalizer();

    // ─── A. BlockGrammarNormalizer Tests ───────────────────────────────

    console.log('BlockGrammarNormalizer:');

    // Test 1: Normalizer swaps img→span to span→img (WP 6.5+ canonical)
    await test('should swap img-before-span to span-before-img', async () => {
        const tmpDir = path.join(os.tmpdir(), `pp-grammar-test-1-${Date.now()}`);
        const templatesDir = path.join(tmpDir, 'templates');
        await fs.ensureDir(templatesDir);

        // Write a file with WRONG order: img before span
        const wrongOrder = `<!-- wp:cover {"dimRatio":70,"overlayColor":"accent"} -->
<div class="wp-block-cover">
    <img class="wp-block-cover__image-background" src="test.jpg" alt="" style="object-fit:cover"/>
    <span aria-hidden="true" class="wp-block-cover__background has-accent-background-color has-background-dim-70 has-background-dim"></span>
    <div class="wp-block-cover__inner-container"></div>
</div>
<!-- /wp:cover -->`;

        await fs.writeFile(path.join(templatesDir, 'test.html'), wrongOrder);
        const stats = await normalizer.normalizeAll(tmpDir);
        const result = await fs.readFile(path.join(templatesDir, 'test.html'), 'utf8');

        // Span must come before img after normalization
        const spanIdx = result.indexOf('wp-block-cover__background');
        const imgIdx = result.indexOf('wp-block-cover__image-background');
        if (spanIdx === -1 || imgIdx === -1) throw new Error('Missing cover elements');
        if (spanIdx >= imgIdx) throw new Error(`span (${spanIdx}) should be before img (${imgIdx})`);
        expect(stats.coverOrderFixes).toBe(1);

        await fs.remove(tmpDir);
    });

    // Test 2: Already-correct order should not be modified
    await test('should not modify content with correct span-before-img order', async () => {
        const tmpDir = path.join(os.tmpdir(), `pp-grammar-test-2-${Date.now()}`);
        const templatesDir = path.join(tmpDir, 'templates');
        await fs.ensureDir(templatesDir);

        const correctOrder = `<!-- wp:cover {"dimRatio":70} -->
<div class="wp-block-cover">
    <span aria-hidden="true" class="wp-block-cover__background has-background-dim-70 has-background-dim"></span>
    <img class="wp-block-cover__image-background" src="test.jpg" alt="" style="object-fit:cover"/>
    <div class="wp-block-cover__inner-container"></div>
</div>
<!-- /wp:cover -->`;

        await fs.writeFile(path.join(templatesDir, 'test.html'), correctOrder);
        const stats = await normalizer.normalizeAll(tmpDir);

        expect(stats.coverOrderFixes).toBe(0);
        await fs.remove(tmpDir);
    });

    // Test 3: dimRatio string to number fix
    await test('should convert string dimRatio to number', async () => {
        const tmpDir = path.join(os.tmpdir(), `pp-grammar-test-3-${Date.now()}`);
        const templatesDir = path.join(tmpDir, 'templates');
        await fs.ensureDir(templatesDir);

        const stringDim = `<!-- wp:cover {"dimRatio":"60","overlayColor":"accent"} -->
<div class="wp-block-cover"></div>
<!-- /wp:cover -->`;

        await fs.writeFile(path.join(templatesDir, 'test.html'), stringDim);
        await normalizer.normalizeAll(tmpDir);
        const result = await fs.readFile(path.join(templatesDir, 'test.html'), 'utf8');

        expect(result).toContain('"dimRatio":60');
        expect(result).not.toContain('"dimRatio":"60"');
        await fs.remove(tmpDir);
    });

    // Test 4: Spacing format normalization in style attributes
    await test('should normalize var:preset|spacing to var(--wp--preset--spacing--) in style attrs', async () => {
        const tmpDir = path.join(os.tmpdir(), `pp-grammar-test-4-${Date.now()}`);
        const templatesDir = path.join(tmpDir, 'templates');
        await fs.ensureDir(templatesDir);

        const wrongSpacing = `<!-- wp:group {"style":{"spacing":{"padding":{"top":"var:preset|spacing|40"}}}} -->
<div class="wp-block-group" style="padding-top:var:preset|spacing|40"></div>
<!-- /wp:group -->`;

        await fs.writeFile(path.join(templatesDir, 'test.html'), wrongSpacing);
        await normalizer.normalizeAll(tmpDir);
        const result = await fs.readFile(path.join(templatesDir, 'test.html'), 'utf8');

        // Style attr should be fixed
        expect(result).toContain('var(--wp--preset--spacing--40)');
        // JSON block comment should be preserved as-is
        expect(result).toContain('"var:preset|spacing|40"');
        await fs.remove(tmpDir);
    });

    // ─── B. ThemeValidator Tests ──────────────────────────────────────

    console.log('\nThemeValidator:');

    const validator = new ThemeValidator();

    // Test 5: dimRatio mismatch detected (RULE 2b)
    await test('should detect dimRatio mismatch (RC1 regression guard)', async () => {
        const tmpDir = path.join(os.tmpdir(), `pp-grammar-test-5-${Date.now()}`);
        await fs.ensureDir(tmpDir);

        const mismatch = `<!-- wp:cover {"dimRatio":75,"overlayColor":"accent-3"} -->
<div class="wp-block-cover">
    <span aria-hidden="true" class="wp-block-cover__background has-accent-3-background-color has-background-dim-70 has-background-dim"></span>
</div>
<!-- /wp:cover -->`;

        await fs.writeFile(path.join(tmpDir, 'test.html'), mismatch);
        const report = await validator.validateTheme(tmpDir);

        expect(report.isValid).toBe(false);
        const dimError = report.errors.find(e => e.includes('dimRatio mismatch'));
        if (!dimError) throw new Error('Expected dimRatio mismatch error');
        expect(dimError).toContain('rounds to 80');
        expect(dimError).toContain('HTML class says 70');
        await fs.remove(tmpDir);
    });

    // Test 6: dimRatio match passes
    await test('should pass when dimRatio matches HTML class', async () => {
        const tmpDir = path.join(os.tmpdir(), `pp-grammar-test-6-${Date.now()}`);
        await fs.ensureDir(tmpDir);

        const match = `<!-- wp:cover {"dimRatio":70,"overlayColor":"accent-3"} -->
<div class="wp-block-cover">
    <span aria-hidden="true" class="wp-block-cover__background has-accent-3-background-color has-background-dim-70 has-background-dim"></span>
</div>
<!-- /wp:cover -->`;

        await fs.writeFile(path.join(tmpDir, 'test.html'), match);
        const report = await validator.validateTheme(tmpDir);

        const dimError = report.errors.find(e => e.includes('dimRatio mismatch'));
        if (dimError) throw new Error(`Unexpected dimRatio error: ${dimError}`);
        await fs.remove(tmpDir);
    });

    // Test 7: has-background on cover div detected (RULE 2c)
    await test('should detect has-background class on cover div (RC2 regression guard)', async () => {
        const tmpDir = path.join(os.tmpdir(), `pp-grammar-test-7-${Date.now()}`);
        await fs.ensureDir(tmpDir);

        const hasBg = `<!-- wp:cover {"dimRatio":70} -->
<div class="wp-block-cover alignfull has-background">
    <span aria-hidden="true" class="wp-block-cover__background has-background-dim-70 has-background-dim"></span>
</div>
<!-- /wp:cover -->`;

        await fs.writeFile(path.join(tmpDir, 'test.html'), hasBg);
        const report = await validator.validateTheme(tmpDir);

        expect(report.isValid).toBe(false);
        const bgError = report.errors.find(e => e.includes('has-background') && e.includes('invalid for wp:cover'));
        if (!bgError) throw new Error('Expected has-background error on cover div');
        await fs.remove(tmpDir);
    });

    // Test 8: has-background-dim on span should NOT be flagged (false positive guard)
    await test('should not flag has-background-dim on cover span as error', async () => {
        const tmpDir = path.join(os.tmpdir(), `pp-grammar-test-8-${Date.now()}`);
        await fs.ensureDir(tmpDir);

        const valid = `<!-- wp:cover {"dimRatio":70} -->
<div class="wp-block-cover alignfull">
    <span aria-hidden="true" class="wp-block-cover__background has-background-dim-70 has-background-dim"></span>
</div>
<!-- /wp:cover -->`;

        await fs.writeFile(path.join(tmpDir, 'test.html'), valid);
        const report = await validator.validateTheme(tmpDir);

        const bgError = report.errors.find(e => e.includes('has-background') && e.includes('invalid for wp:cover'));
        if (bgError) throw new Error(`False positive: ${bgError}`);
        await fs.remove(tmpDir);
    });

    // ─── C. Pattern Template Smoke Tests ──────────────────────────────

    console.log('\nPattern Templates (smoke tests):');

    // Test 9: hero-variants fullBleed
    await test('hero fullBleed: span before img, dimRatio-80 (rounded from 75), no object-fit style', () => {
        const html = getFullBleedHero();

        // RC7: dimRatio 75 rounds to 80 for the CSS class
        expect(html).toContain('"dimRatio":75');
        expect(html).toContain('has-background-dim-80');
        expect(html).not.toContain('has-background-dim-75');

        // RC2: no has-background on cover div
        const coverDivMatch = html.match(/<div class="wp-block-cover[^"]*"/);
        if (!coverDivMatch) throw new Error('No cover div found');
        if (/\bhas-background\b/.test(coverDivMatch[0]) && !/has-custom-content-position/.test(coverDivMatch[0])) {
            throw new Error('Cover div has invalid has-background class');
        }

        // RC5: has-custom-content-position when contentPosition is set
        expect(html).toContain('has-custom-content-position');

        // RC3: span before img
        const spanIdx = html.indexOf('wp-block-cover__background');
        const imgIdx = html.indexOf('wp-block-cover__image-background');
        if (spanIdx >= imgIdx) throw new Error('span must be before img in fullBleed hero');

        // RC6: NO style="object-fit:cover" on img (WP uses CSS, not inline)
        expect(html).toContain('data-object-fit="cover"');
        expect(html).not.toMatch(/wp-block-cover__image-background[^>]*style="object-fit:cover"/);
    });

    // Test 10: universal-about cover
    await test('universal-about: span before img, no object-fit style, has data-object-fit', () => {
        const html = getUniversalAboutContent();

        const spanIdx = html.indexOf('wp-block-cover__background');
        const imgIdx = html.indexOf('wp-block-cover__image-background');
        if (spanIdx === -1 || imgIdx === -1) throw new Error('Missing cover elements');
        if (spanIdx >= imgIdx) throw new Error('span must be before img in about cover');

        expect(html).toContain('data-object-fit="cover"');
        expect(html).not.toMatch(/wp-block-cover__image-background[^>]*style="object-fit:cover"/);
    });

    // Test 11: universal-contact cover
    await test('universal-contact: span before img, no object-fit style, has data-object-fit', () => {
        const html = getUniversalContactContent();

        const spanIdx = html.indexOf('wp-block-cover__background');
        const imgIdx = html.indexOf('wp-block-cover__image-background');
        if (spanIdx === -1 || imgIdx === -1) throw new Error('Missing cover elements');
        if (spanIdx >= imgIdx) throw new Error('span must be before img in contact cover');

        expect(html).toContain('data-object-fit="cover"');
        expect(html).not.toMatch(/wp-block-cover__image-background[^>]*style="object-fit:cover"/);
    });

    // Test 12: universal-services cover
    await test('universal-services: span before img, no object-fit style, has data-object-fit', () => {
        const html = getUniversalServicesContent();

        const spanIdx = html.indexOf('wp-block-cover__background');
        const imgIdx = html.indexOf('wp-block-cover__image-background');
        if (spanIdx === -1 || imgIdx === -1) throw new Error('Missing cover elements');
        if (spanIdx >= imgIdx) throw new Error('span must be before img in services cover');

        expect(html).toContain('data-object-fit="cover"');
        expect(html).not.toMatch(/wp-block-cover__image-background[^>]*style="object-fit:cover"/);
    });

    // ─── D. RC5: has-custom-content-position Tests ──────────────────

    console.log('\nRC5 (has-custom-content-position):');

    // Test 13: hero fullBleed has has-custom-content-position in output
    await test('hero fullBleed output includes has-custom-content-position', () => {
        const html = getFullBleedHero();
        expect(html).toContain('"contentPosition":"center left"');
        expect(html).toContain('has-custom-content-position');
        expect(html).toContain('is-position-center-left');
    });

    // Test 14: normalizer adds has-custom-content-position when missing
    await test('normalizer adds has-custom-content-position when missing', async () => {
        const tmpDir = path.join(os.tmpdir(), `pp-grammar-test-14-${Date.now()}`);
        const templatesDir = path.join(tmpDir, 'templates');
        await fs.ensureDir(templatesDir);

        // Cover block with contentPosition but MISSING has-custom-content-position
        const missingClass = `<!-- wp:cover {"dimRatio":70,"contentPosition":"center left"} -->
<div class="wp-block-cover alignfull is-position-center-left" style="min-height:80vh">
    <span aria-hidden="true" class="wp-block-cover__background has-background-dim-70 has-background-dim"></span>
    <div class="wp-block-cover__inner-container"></div>
</div>
<!-- /wp:cover -->`;

        await fs.writeFile(path.join(templatesDir, 'test.html'), missingClass);
        const stats = await normalizer.normalizeAll(tmpDir);
        const result = await fs.readFile(path.join(templatesDir, 'test.html'), 'utf8');

        expect(result).toContain('has-custom-content-position');
        expect(stats.contentPositionFixes).toBe(1);
        await fs.remove(tmpDir);
    });

    // Test 15: validator detects missing has-custom-content-position
    await test('validator detects missing has-custom-content-position (RC5 guard)', async () => {
        const tmpDir = path.join(os.tmpdir(), `pp-grammar-test-15-${Date.now()}`);
        await fs.ensureDir(tmpDir);

        const missing = `<!-- wp:cover {"dimRatio":70,"contentPosition":"center left"} -->
<div class="wp-block-cover alignfull is-position-center-left">
    <span aria-hidden="true" class="wp-block-cover__background has-background-dim-70 has-background-dim"></span>
</div>
<!-- /wp:cover -->`;

        await fs.writeFile(path.join(tmpDir, 'test.html'), missing);
        const report = await validator.validateTheme(tmpDir);

        expect(report.isValid).toBe(false);
        const posError = report.errors.find(e => e.includes('has-custom-content-position'));
        if (!posError) throw new Error('Expected missing has-custom-content-position error');
        await fs.remove(tmpDir);
    });

    // ─── E. RC6/RC7: object-fit and dimRatio rounding Tests ────────

    console.log('\nRC6/RC7 (object-fit removal, dimRatio rounding):');

    // Test 16: normalizer removes style="object-fit:cover" from cover img
    await test('normalizer removes style="object-fit:cover" from cover img', async () => {
        const tmpDir = path.join(os.tmpdir(), `pp-grammar-test-16-${Date.now()}`);
        const templatesDir = path.join(tmpDir, 'templates');
        await fs.ensureDir(templatesDir);

        const wrongStyle = `<!-- wp:cover {"dimRatio":70,"url":"test.jpg"} -->
<div class="wp-block-cover">
    <span aria-hidden="true" class="wp-block-cover__background has-background-dim-70 has-background-dim"></span>
    <img class="wp-block-cover__image-background" alt="" src="test.jpg" style="object-fit:cover" data-object-fit="cover"/>
    <div class="wp-block-cover__inner-container"></div>
</div>
<!-- /wp:cover -->`;

        await fs.writeFile(path.join(templatesDir, 'test.html'), wrongStyle);
        const stats = await normalizer.normalizeAll(tmpDir);
        const result = await fs.readFile(path.join(templatesDir, 'test.html'), 'utf8');

        expect(result).not.toContain('style="object-fit:cover"');
        expect(result).toContain('data-object-fit="cover"');
        expect(stats.coverImgStyleFixes).toBe(1);
        await fs.remove(tmpDir);
    });

    // Test 17: normalizer fixes dimRatio class rounding (75 → dim-80)
    await test('normalizer fixes dimRatio class rounding (75 → dim-80)', async () => {
        const tmpDir = path.join(os.tmpdir(), `pp-grammar-test-17-${Date.now()}`);
        const templatesDir = path.join(tmpDir, 'templates');
        await fs.ensureDir(templatesDir);

        const wrongDim = `<!-- wp:cover {"dimRatio":75,"overlayColor":"accent-3"} -->
<div class="wp-block-cover">
    <span aria-hidden="true" class="wp-block-cover__background has-accent-3-background-color has-background-dim-75 has-background-dim"></span>
    <div class="wp-block-cover__inner-container"></div>
</div>
<!-- /wp:cover -->`;

        await fs.writeFile(path.join(templatesDir, 'test.html'), wrongDim);
        const stats = await normalizer.normalizeAll(tmpDir);
        const result = await fs.readFile(path.join(templatesDir, 'test.html'), 'utf8');

        expect(result).toContain('has-background-dim-80');
        expect(result).not.toContain('has-background-dim-75');
        expect(stats.dimRatioRoundingFixes).toBe(1);
        await fs.remove(tmpDir);
    });

    // Test 18: validator detects style="object-fit:cover" on cover img (RC6 guard)
    await test('validator detects style="object-fit:cover" on cover img (RC6 guard)', async () => {
        const tmpDir = path.join(os.tmpdir(), `pp-grammar-test-18-${Date.now()}`);
        await fs.ensureDir(tmpDir);

        const badStyle = `<!-- wp:cover {"dimRatio":70,"url":"test.jpg"} -->
<div class="wp-block-cover">
    <span aria-hidden="true" class="wp-block-cover__background has-background-dim-70 has-background-dim"></span>
    <img class="wp-block-cover__image-background" alt="" src="test.jpg" style="object-fit:cover" data-object-fit="cover"/>
</div>
<!-- /wp:cover -->`;

        await fs.writeFile(path.join(tmpDir, 'test.html'), badStyle);
        const report = await validator.validateTheme(tmpDir);

        expect(report.isValid).toBe(false);
        const styleError = report.errors.find(e => e.includes('object-fit:cover') && e.includes('WP does not produce'));
        if (!styleError) throw new Error('Expected object-fit:cover validation error');
        await fs.remove(tmpDir);
    });

    // ─── Summary ──────────────────────────────────────────────────────

    console.log('\n' + '='.repeat(50));
    console.log(`Results: ${passed} passed, ${failed} failed`);

    if (failed > 0) {
        process.exit(1);
    } else {
        console.log('\n✅ All Block Grammar regression tests passed!\n');
        process.exit(0);
    }
})();
