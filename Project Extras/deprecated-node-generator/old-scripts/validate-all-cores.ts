#!/usr/bin/env tsx
import path from 'path';
import fs from 'fs-extra';
import { PlaygroundValidator } from '../../src/generator/validators/PlaygroundValidator';

interface CoreEntry {
    slug: string;
    name?: string;
    patterns?: number;
}

interface CoreResult {
    core: string;
    patterns: number;
    validation: 'PASS' | 'FAIL' | 'SKIP';
    errors: string;
    errorCount: number;
    warnings: string[];
}

async function validateAllCores(): Promise<CoreResult[]> {
    const coresPath = path.resolve(__dirname, '../../proven-cores/cores.json');
    const provenCoresPath = path.resolve(__dirname, '../../proven-cores');
    const themesPath = path.resolve(__dirname, '../../themes');

    const data = await fs.readJson(coresPath);
    const cores = (data.cores as CoreEntry[]) || [];

    const results: CoreResult[] = [];

    for (const core of cores) {
        const slug = core.slug;
        const displayName = core.name ?? slug;
        console.log(`\n${'='.repeat(60)}`);
        console.log(`Validating: ${displayName.toUpperCase()}`);
        console.log('='.repeat(60));

        const candidatePaths = [
            path.join(themesPath, slug),
            path.join(provenCoresPath, slug),
        ];

        const themePath = candidatePaths.find(p => fs.existsSync(p));

        if (!themePath) {
            console.error(`❌ Theme not found for core: ${slug}`);
            results.push({
                core: slug,
                patterns: core.patterns ?? 0,
                validation: 'SKIP',
                errors: 'Theme directory not found',
                errorCount: 1,
                warnings: [],
            });
            continue;
        }

        const patternsPath = path.join(themePath, 'patterns');
        let patternCount = 0;
        if (await fs.pathExists(patternsPath)) {
            const patternFiles = await fs.readdir(patternsPath);
            patternCount = patternFiles.filter(f => f.endsWith('.php')).length;
        }

        console.log(`📊 Pattern count: ${patternCount}`);

        const result = await PlaygroundValidator.validate({ themeDir: themePath, timeout: 30000 });

        results.push({
            core: slug,
            patterns: patternCount,
            validation: result.valid ? 'PASS' : 'FAIL',
            errors: result.errors.map(e => e.message).join('; ') || '0',
            errorCount: result.errors.length,
            warnings: result.warnings.map(w => `${w.type}: ${w.message}`),
        });

        console.log(`\n✅ Result: ${result.valid ? 'PASS' : 'FAIL'}`);
        if (result.errors.length > 0) {
            console.log(`   Errors: ${result.errors.map(e => e.message).join(', ')}`);
        }
        if (result.warnings.length > 0) {
            console.log(`   Warnings: ${result.warnings.map(w => w.message).join(', ')}`);
        }
    }

    await generateHealthMatrix(results);

    console.log('\n' + '='.repeat(60));
    console.log('✅ VALIDATION COMPLETE');
    console.log('='.repeat(60));
    console.log(`\n📄 Health matrix saved to: proven-cores/HEALTH_MATRIX.md`);

    return results;
}

async function generateHealthMatrix(results: CoreResult[]) {
    const matrixPath = path.resolve(__dirname, '../../proven-cores/HEALTH_MATRIX.md');

    let markdown = '# Proven Cores Health Matrix\n\n';
    markdown += '> Generated: ' + new Date().toISOString() + '\n\n';
    markdown += '| Core | Patterns | Validation | Errors | Status |\n';
    markdown += '|------|----------|-----------|--------|--------|\n';

    for (const result of results) {
        const statusIcon = result.validation === 'PASS' ? '✅' : result.validation === 'SKIP' ? '⚠️' : '❌';
        const errors = result.errors === '0' ? '-' : result.errors;
        markdown += `| ${result.core} | ${result.patterns} | ${result.validation} | ${errors} | ${statusIcon} |\n`;
    }

    markdown += '\n## Summary\n\n';
    const passing = results.filter(r => r.validation === 'PASS').length;
    const failing = results.filter(r => r.validation === 'FAIL').length;
    const skipped = results.filter(r => r.validation === 'SKIP').length;

    markdown += `- **Passing:** ${passing}/${results.length}\n`;
    markdown += `- **Failing:** ${failing}/${results.length}\n`;
    markdown += `- **Skipped:** ${skipped}/${results.length}\n`;
    markdown += `- **Total Patterns:** ${results.reduce((sum, r) => sum + r.patterns, 0)}\n`;

    const issues = results.filter(r => r.validation !== 'PASS');
    if (issues.length > 0) {
        markdown += '\n## Issues\n\n';
        for (const result of issues) {
            markdown += `### ${result.core}\n`;
            markdown += `- Status: ${result.validation}\n`;
            markdown += `- Errors: ${result.errors}\n`;
            if (result.warnings.length > 0) {
                markdown += `- Warnings: ${result.warnings.join('; ')}\n`;
            }
            markdown += '\n';
        }
    }

    await fs.writeFile(matrixPath, markdown);
    console.log(`\n📄 Health matrix created: ${matrixPath}`);
}

async function main() {
    await validateAllCores();
}

if (require.main === module) {
    main()
        .then(() => process.exit(0))
        .catch(error => {
            console.error('\n❌ Error:', error);
            process.exit(1);
        });
}

export { validateAllCores };
