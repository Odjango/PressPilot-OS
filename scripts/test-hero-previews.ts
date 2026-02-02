#!/usr/bin/env npx ts-node

/**
 * Multi-Industry Hero Preview Test Script
 *
 * Tests the Real Hero Preview system across different industry categories.
 * Generates theme previews for 5-6 industries and verifies:
 * 1. All 4 hero layouts are captured
 * 2. Screenshots are created at expected paths
 * 3. Different industries produce different hero content
 *
 * Prerequisites:
 *   - WordPress running at localhost:8089
 *   - npm run dev NOT required (uses generator directly)
 *
 * Usage:
 *   npx ts-node scripts/test-hero-previews.ts
 *   npx ts-node scripts/test-hero-previews.ts --industry=restaurant
 */

import * as fs from 'fs-extra';
import * as path from 'path';
import { generateTheme } from '../src/generator';
import { HeroPreviewRunner, generatePreviewSessionId, PreviewResult } from '../src/preview/HeroPreviewRunner';
import { createSessionDir, cleanupOldPreviews } from '../src/preview/previewCleanup';
import { GeneratorData } from '../src/generator/types';

// Test industry configurations
const TEST_INDUSTRIES = [
    {
        id: 'restaurant',
        name: "Kooko's Kitchen",
        tagline: 'Authentic Thai Cuisine',
        description: 'Family-owned Thai restaurant serving authentic dishes in downtown.',
        industry: 'restaurant',
        menus: [
            {
                title: 'Appetizers',
                items: [
                    { name: 'Spring Rolls', price: '$8', description: 'Crispy vegetable spring rolls' },
                    { name: 'Satay', price: '$10', description: 'Grilled chicken skewers with peanut sauce' }
                ]
            },
            {
                title: 'Main Courses',
                items: [
                    { name: 'Pad Thai', price: '$14', description: 'Classic stir-fried rice noodles' },
                    { name: 'Green Curry', price: '$16', description: 'Aromatic coconut curry with vegetables' }
                ]
            }
        ]
    },
    {
        id: 'saas',
        name: 'CloudSync Pro',
        tagline: 'Sync Your World',
        description: 'Enterprise file synchronization and collaboration platform for modern teams.',
        industry: 'startup'
    },
    {
        id: 'ecommerce',
        name: 'Urban Threads',
        tagline: 'Style Redefined',
        description: 'Contemporary fashion boutique featuring sustainable and ethically sourced clothing.',
        industry: 'ecommerce'
    },
    {
        id: 'local-biz',
        name: 'Smith & Sons Plumbing',
        tagline: '24/7 Emergency Service',
        description: 'Family-owned plumbing company serving the greater metro area since 1985.',
        industry: 'local'
    },
    {
        id: 'portfolio',
        name: 'Sarah Chen Design',
        tagline: 'Creative Solutions',
        description: 'Award-winning graphic designer specializing in brand identity and web design.',
        industry: 'creative'
    },
    {
        id: 'corporate',
        name: 'Nexus Consulting',
        tagline: 'Transform Your Business',
        description: 'Strategic consulting firm helping Fortune 500 companies navigate digital transformation.',
        industry: 'corporate'
    }
];

interface TestResult {
    industryId: string;
    industryName: string;
    success: boolean;
    sessionId?: string;
    previews?: PreviewResult[];
    error?: string;
    timing?: {
        themeGeneration: number;
        screenshotCapture: number;
        total: number;
    };
}

async function runSingleIndustryTest(industry: typeof TEST_INDUSTRIES[0]): Promise<TestResult> {
    const startTime = Date.now();
    let themeGenTime = 0;
    let captureTime = 0;

    console.log(`\n${'='.repeat(60)}`);
    console.log(`Testing: ${industry.name} (${industry.id})`);
    console.log(`${'='.repeat(60)}`);

    try {
        // 1. Generate theme
        console.log('Generating theme...');
        const genStart = Date.now();

        const generatorData: GeneratorData = {
            name: industry.name,
            hero_headline: industry.tagline,
            hero_subheadline: industry.description,
            industry: industry.industry,
            menus: industry.menus
        };

        const sessionId = generatePreviewSessionId();
        const themeResult = await generateTheme({
            data: generatorData,
            slug: `preview-test-${industry.id}-${sessionId}`
        });

        themeGenTime = Date.now() - genStart;
        console.log(`Theme generated in ${themeGenTime}ms`);
        console.log(`  - ZIP: ${themeResult.downloadPath}`);
        console.log(`  - Dir: ${themeResult.themeDir}`);

        // 2. Create session directory for screenshots
        const outputDir = await createSessionDir(sessionId);
        console.log(`Screenshot dir: ${outputDir}`);

        // 3. Run hero preview capture
        console.log('Capturing hero screenshots...');
        const captureStart = Date.now();

        const runner = new HeroPreviewRunner({
            themeDir: themeResult.themeDir,
            themeSlug: path.basename(themeResult.themeDir),
            zipPath: themeResult.downloadPath,
            outputDir: outputDir,
            sessionId: sessionId,
            pageContent: {
                hero_title: generatorData.hero_headline || 'Welcome',
                hero_sub: generatorData.hero_subheadline || 'We enable businesses to grow.'
            }
        });

        const previews = await runner.runAll();
        captureTime = Date.now() - captureStart;

        console.log(`Captured ${previews.length} screenshots in ${captureTime}ms`);

        // 4. Verify screenshots exist
        for (const preview of previews) {
            const exists = await fs.pathExists(preview.screenshotPath);
            console.log(`  - ${preview.layout}: ${exists ? '✓' : '✗'} ${preview.screenshotPath}`);
        }

        return {
            industryId: industry.id,
            industryName: industry.name,
            success: previews.length === 4,
            sessionId,
            previews,
            timing: {
                themeGeneration: themeGenTime,
                screenshotCapture: captureTime,
                total: Date.now() - startTime
            }
        };

    } catch (error) {
        console.error(`Error testing ${industry.id}:`, error);
        return {
            industryId: industry.id,
            industryName: industry.name,
            success: false,
            error: error instanceof Error ? error.message : String(error),
            timing: {
                themeGeneration: themeGenTime,
                screenshotCapture: captureTime,
                total: Date.now() - startTime
            }
        };
    }
}

async function runAllTests(): Promise<void> {
    console.log('\n🚀 Starting Multi-Industry Hero Preview Tests\n');

    // Clean up old previews first
    console.log('Cleaning up old preview sessions...');
    const cleaned = await cleanupOldPreviews(0); // Clean all
    console.log(`Removed ${cleaned} old sessions\n`);

    const results: TestResult[] = [];

    // Check for --industry flag
    const industryArg = process.argv.find(arg => arg.startsWith('--industry='));
    let industriesToTest = TEST_INDUSTRIES;

    if (industryArg) {
        const targetId = industryArg.split('=')[1];
        const found = TEST_INDUSTRIES.find(i => i.id === targetId);
        if (found) {
            industriesToTest = [found];
            console.log(`Running single industry test: ${targetId}\n`);
        } else {
            console.error(`Industry "${targetId}" not found. Available: ${TEST_INDUSTRIES.map(i => i.id).join(', ')}`);
            process.exit(1);
        }
    }

    // Run tests
    for (const industry of industriesToTest) {
        const result = await runSingleIndustryTest(industry);
        results.push(result);
    }

    // Print summary
    console.log('\n' + '='.repeat(60));
    console.log('TEST SUMMARY');
    console.log('='.repeat(60));

    const passed = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    console.log(`\nResults: ${passed} passed, ${failed} failed\n`);

    for (const result of results) {
        const status = result.success ? '✓' : '✗';
        const timing = result.timing
            ? `(${result.timing.total}ms total, ${result.timing.themeGeneration}ms gen, ${result.timing.screenshotCapture}ms capture)`
            : '';

        console.log(`${status} ${result.industryName} (${result.industryId}) ${timing}`);

        if (result.error) {
            console.log(`  Error: ${result.error}`);
        }

        if (result.previews) {
            for (const preview of result.previews) {
                console.log(`    - ${preview.layout}: ${preview.screenshotUrl}`);
            }
        }
    }

    // Generate HTML report
    const reportPath = path.join(process.cwd(), 'output', 'hero-preview-test-report.html');
    await generateHtmlReport(results, reportPath);
    console.log(`\nHTML Report: ${reportPath}`);

    // Exit with appropriate code
    if (failed > 0) {
        process.exit(1);
    }
}

async function generateHtmlReport(results: TestResult[], outputPath: string): Promise<void> {
    const html = `<!DOCTYPE html>
<html>
<head>
    <title>Hero Preview Test Report</title>
    <style>
        body { font-family: system-ui, sans-serif; padding: 2rem; max-width: 1400px; margin: 0 auto; }
        h1 { color: #111; }
        .summary { padding: 1rem; background: #f5f5f5; border-radius: 8px; margin: 1rem 0; }
        .industry { border: 1px solid #ddd; border-radius: 8px; margin: 1rem 0; overflow: hidden; }
        .industry-header { padding: 1rem; background: #f9f9f9; border-bottom: 1px solid #ddd; }
        .industry-header.success { background: #e6f4ea; }
        .industry-header.failure { background: #fce8e6; }
        .previews { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; padding: 1rem; }
        .preview { text-align: center; }
        .preview img { width: 100%; border: 1px solid #ddd; border-radius: 4px; }
        .preview-label { font-size: 0.875rem; margin-top: 0.5rem; }
        .timing { font-size: 0.75rem; color: #666; }
        .error { color: #c5221f; font-size: 0.875rem; padding: 0.5rem 1rem; }
    </style>
</head>
<body>
    <h1>Hero Preview Test Report</h1>
    <p>Generated: ${new Date().toISOString()}</p>

    <div class="summary">
        <strong>Results:</strong>
        ${results.filter(r => r.success).length} passed,
        ${results.filter(r => !r.success).length} failed
    </div>

    ${results.map(result => `
    <div class="industry">
        <div class="industry-header ${result.success ? 'success' : 'failure'}">
            <strong>${result.success ? '✓' : '✗'} ${result.industryName}</strong>
            (${result.industryId})
            ${result.timing ? `<span class="timing">Total: ${result.timing.total}ms</span>` : ''}
        </div>
        ${result.error ? `<div class="error">Error: ${result.error}</div>` : ''}
        ${result.previews ? `
        <div class="previews">
            ${result.previews.map(p => `
            <div class="preview">
                <img src="${p.screenshotUrl}" alt="${p.label}" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2220%22>No Image</text></svg>'"/>
                <div class="preview-label">${p.label}</div>
            </div>
            `).join('')}
        </div>
        ` : ''}
    </div>
    `).join('')}
</body>
</html>`;

    await fs.ensureDir(path.dirname(outputPath));
    await fs.writeFile(outputPath, html);
}

// Main execution
runAllTests().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
});
