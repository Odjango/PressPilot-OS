/**
 * PatternInjector Unit Tests - Phase 14 Acceptance
 *
 * Tests that cleanAllPatterns() removes legacy demo content from base themes
 * (Frost, Tove, TT4) while preserving user content.
 *
 * Run with: npx tsx tests/unit/pattern-injector.test.ts
 */

import { PatternInjector } from '../../src/generator/engine/PatternInjector';
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
                throw new Error(`Expected to contain "${expected}", got "${actual}"`);
            }
        },
        not: {
            toContain(expected: string) {
                if (typeof actual === 'string' && actual.includes(expected)) {
                    throw new Error(`Expected NOT to contain "${expected}", but found it in "${actual.substring(0, 100)}..."`);
                }
            }
        }
    };
}

(async () => {
    console.log('\n🧪 PatternInjector Unit Tests (Phase 14)\n');

    const rootDir = process.cwd();
    const injector = new PatternInjector(rootDir);
    const tmpDir = path.join(os.tmpdir(), `pp-test-${Date.now()}`);
    const patternsDir = path.join(tmpDir, 'patterns');

    // Setup test directory
    await fs.ensureDir(patternsDir);

    console.log('cleanAllPatterns():');

    // Test 1: Frost demo content removed
    await test('should remove "Build with Frost" from Frost patterns', async () => {
        const testFile = path.join(patternsDir, 'test-frost.php');
        await fs.writeFile(testFile, '<!-- wp:heading --><h2>Build with Frost</h2><!-- /wp:heading -->');

        await injector.cleanAllPatterns(tmpDir, { name: 'Test Restaurant' } as any);

        const result = await fs.readFile(testFile, 'utf8');
        expect(result).not.toContain('Build with Frost');
    });

    // Test 2: Frost testimonial names removed
    await test('should replace Frost testimonial names (Allison Taylor)', async () => {
        const testFile = path.join(patternsDir, 'test-testimonials.php');
        await fs.writeFile(testFile, '<p>Allison Taylor, Designer</p><p>Anthony Breck, Developer</p><p>Rebecca Jones, Coach</p>');

        await injector.cleanAllPatterns(tmpDir, { name: 'Test Biz' } as any);

        const result = await fs.readFile(testFile, 'utf8');
        expect(result).not.toContain('Allison Taylor');
        expect(result).not.toContain('Anthony Breck');
        expect(result).not.toContain('Rebecca Jones');
    });

    // Test 3: Tove demo content removed
    await test('should remove "Niofika Café" from Tove patterns', async () => {
        const testFile = path.join(patternsDir, 'test-tove.php');
        await fs.writeFile(testFile, '<!-- wp:heading --><h1>Welcome to Niofika Café</h1><!-- /wp:heading -->');

        await injector.cleanAllPatterns(tmpDir, { name: 'My Restaurant' } as any);

        const result = await fs.readFile(testFile, 'utf8');
        expect(result).not.toContain('Niofika');
    });

    // Test 4: TT4 demo content removed
    await test('should remove "Études" from TT4 patterns', async () => {
        const testFile = path.join(patternsDir, 'test-tt4.php');
        await fs.writeFile(testFile, '<!-- wp:heading --><h1>Études Architecture</h1><!-- /wp:heading -->');

        await injector.cleanAllPatterns(tmpDir, { name: 'My Business' } as any);

        const result = await fs.readFile(testFile, 'utf8');
        expect(result).not.toContain('Études');
    });

    // Test 5: User content preserved
    await test('should preserve non-demo user content', async () => {
        const testFile = path.join(patternsDir, 'test-user.php');
        await fs.writeFile(testFile, '<h1>Frosty Treats Ice Cream</h1><p>Best frozen desserts in town</p>');

        await injector.cleanAllPatterns(tmpDir, { name: 'Frosty Treats' } as any);

        const result = await fs.readFile(testFile, 'utf8');
        // "Frosty Treats" should be preserved (it's user content, not "Build with Frost")
        expect(result).toContain('Frosty Treats Ice Cream');
        expect(result).toContain('Best frozen desserts');
    });

    // Test 6: Non-pattern files ignored
    await test('should ignore non-.php/.html files', async () => {
        const testFile = path.join(patternsDir, 'test-readme.md');
        await fs.writeFile(testFile, '# Build with Frost\n\nThis is a readme file.');

        await injector.cleanAllPatterns(tmpDir, { name: 'Test' } as any);

        const result = await fs.readFile(testFile, 'utf8');
        // Markdown files should not be processed
        expect(result).toContain('Build with Frost');
    });

    // Cleanup
    await fs.remove(tmpDir);

    // Summary
    console.log('\n' + '='.repeat(50));
    console.log(`Results: ${passed} passed, ${failed} failed`);

    if (failed > 0) {
        process.exit(1);
    } else {
        console.log('\n✅ All PatternInjector tests passed!\n');
        process.exit(0);
    }
})();
