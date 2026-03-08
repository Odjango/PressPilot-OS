/**
 * PlaygroundValidator Unit Tests
 *
 * Run with: npx tsx tests/unit/playground-validator.test.ts
 */

import path from 'path';
import { PlaygroundValidator } from '../../src/generator/validators/PlaygroundValidator';

let passed = 0;
let failed = 0;

function test(name: string, fn: () => Promise<void> | void) {
    Promise.resolve()
        .then(fn)
        .then(() => {
            console.log(`  ✅ ${name}`);
            passed++;
        })
        .catch(error => {
            console.log(`  ❌ ${name}`);
            console.log(`     Error: ${error instanceof Error ? error.message : error}`);
            failed++;
        });
}

function expect(actual: any) {
    return {
        toBe(expected: any) {
            if (actual !== expected) {
                throw new Error(`Expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
            }
        },
        toBeGreaterThanOrEqual(expected: number) {
            if (actual < expected) {
                throw new Error(`Expected ${actual} to be >= ${expected}`);
            }
        },
        toContain(expected: any) {
            if (!actual.includes(expected)) {
                throw new Error(`Expected ${actual} to contain ${expected}`);
            }
        },
    };
}

(async () => {
    console.log('\n📋 PlaygroundValidator Unit Tests\n');

    const goldStandardPath = path.resolve(
        __dirname,
        '../../themes/gold-standard-restaurant'
    );

    test('gold standard theme passes playground validation', async () => {
        const result = await PlaygroundValidator.validate({
            themeDir: goldStandardPath,
            timeout: 30000,
        });
        expect(result.valid).toBe(true);
    });

    test('timeout returns warning without failing', async () => {
        const result = await PlaygroundValidator.validate({
            themeDir: goldStandardPath,
            timeout: 1,
        });
        expect(result.valid).toBe(true);
        expect(result.warnings.length).toBeGreaterThanOrEqual(1);
        expect(result.warnings.map(w => w.type)).toContain('PLAYGROUND_TIMEOUT');
    });

    test('missing theme directory returns error', async () => {
        const result = await PlaygroundValidator.validate({
            themeDir: path.resolve(__dirname, '../../themes/does-not-exist'),
        });
        expect(result.valid).toBe(false);
        expect(result.errors.length).toBeGreaterThanOrEqual(1);
    });

    // Allow async tests to finish
    await new Promise(resolve => setTimeout(resolve, 35000));

    console.log('\n' + '='.repeat(50));
    console.log(`Results: ${passed} passed, ${failed} failed`);

    if (failed > 0) {
        process.exit(1);
    } else {
        console.log('\n✅ All PlaygroundValidator tests passed!\n');
        process.exit(0);
    }
})();
