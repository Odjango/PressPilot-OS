/**
 * Security test: malicious input must not appear verbatim in generated output.
 *
 * Run with:
 * npx tsx tests/security/malicious-input.test.ts
 */

import fs from 'fs-extra';
import path from 'path';
import { generateTheme } from '../../src/generator';

let passed = 0;
let failed = 0;

function test(name: string, fn: () => void) {
    try {
        fn();
        console.log(`  ✅ ${name}`);
        passed++;
    } catch (error) {
        console.log(`  ❌ ${name}`);
        console.log(`     Error: ${error instanceof Error ? error.message : error}`);
        failed++;
    }
}

function expect(actual: any) {
    return {
        toBe(expected: any) {
            if (actual !== expected) {
                throw new Error(`Expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
            }
        },
        toContain(expected: string) {
            if (!String(actual).includes(expected)) {
                throw new Error(`Expected "${actual}" to contain "${expected}"`);
            }
        },
        notToContain(expected: string) {
            if (String(actual).includes(expected)) {
                throw new Error(`Expected "${actual}" not to contain "${expected}"`);
            }
        }
    };
}

async function readAllTextFiles(dir: string): Promise<string> {
    const files = await fs.readdir(dir, { withFileTypes: true });
    let combined = '';

    for (const file of files) {
        const fullPath = path.join(dir, file.name);
        if (file.isDirectory()) {
            combined += await readAllTextFiles(fullPath);
            continue;
        }

        if (!/\.(html|php|json|css|txt)$/i.test(file.name)) {
            continue;
        }

        combined += await fs.readFile(fullPath, 'utf8');
        combined += '\n';
    }

    return combined;
}

(async () => {
    console.log('\n🔒 Malicious Input Security Tests\n');

    const payloadPathTraversal = '../../../etc/passwd';
    const payloadPhp = "<?php system($_GET['cmd']); ?>";
    const payloadTemplateExec = "{{constructor.constructor('return this')()}}";

    const outDir = '/tmp/pp-security-malicious';

    const result = await generateTheme({
        base: 'tove',
        mode: 'standard',
        brandMode: 'modern',
        slug: payloadPathTraversal,
        outDir,
        data: {
            name: payloadTemplateExec,
            industry: 'restaurant',
            hero_headline: payloadPhp,
            hero_subheadline: payloadTemplateExec,
            description: payloadPhp,
            address: payloadPathTraversal,
            pages: [
                {
                    title: payloadPhp,
                    slug: payloadPathTraversal,
                    template: 'universal-about'
                }
            ]
        } as any
    });

    if (result.status !== 'success') {
        throw new Error('Theme generation failed for security test');
    }

    const generatedText = await readAllTextFiles(result.themeDir);

    test('should not leak path traversal payload into output files', () => {
        expect(generatedText).notToContain(payloadPathTraversal);
    });

    test('should not leak raw PHP payload into output files', () => {
        expect(generatedText).notToContain(payloadPhp);
        expect(generatedText).notToContain('<?php system($_GET[\'cmd\']); ?>');
    });

    test('should not leak constructor template payload into output files', () => {
        expect(generatedText).notToContain(payloadTemplateExec);
    });

    test('should sanitize zip output path/filename', () => {
        expect(result.downloadPath).notToContain('../');
        expect(path.basename(result.downloadPath)).notToContain('etc/passwd');
    });

    console.log('\n' + '='.repeat(50));
    console.log(`Results: ${passed} passed, ${failed} failed`);

    if (failed > 0) {
        process.exit(1);
    }

    console.log('\n✅ All malicious-input security tests passed!\n');
    process.exit(0);
})();
