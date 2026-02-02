/**
 * Visual Test Capture Helper Script
 *
 * Runs visual tests and captures screenshots for documentation.
 *
 * Usage:
 *   npx tsx scripts/capture-visual-tests.ts [--studio] [--wordpress] [--manual]
 *
 * Options:
 *   --studio     Capture Studio preview screenshots (requires npm run dev)
 *   --wordpress  Capture WordPress theme screenshots (requires WP at localhost:8089)
 *   --manual     Take a manual screenshot using macOS screencapture
 *   --all        Run all visual tests
 */

import { execSync, spawn } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

const OUTPUT_DIR = 'output/visual-tests';
const TIMESTAMP = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);

interface CaptureOptions {
    studio: boolean;
    wordpress: boolean;
    manual: boolean;
    all: boolean;
}

function parseArgs(): CaptureOptions {
    const args = process.argv.slice(2);
    return {
        studio: args.includes('--studio') || args.includes('--all'),
        wordpress: args.includes('--wordpress') || args.includes('--all'),
        manual: args.includes('--manual'),
        all: args.includes('--all'),
    };
}

async function ensureOutputDir(): Promise<void> {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    console.log(`Output directory: ${path.resolve(OUTPUT_DIR)}`);
}

async function captureManualScreenshot(): Promise<void> {
    console.log('\n--- Manual Screenshot ---');

    const outputPath = path.join(OUTPUT_DIR, `manual-${TIMESTAMP}.png`);

    try {
        // Use macOS screencapture
        console.log('Taking screenshot in 3 seconds...');
        console.log('Position your window now.');

        await sleep(3000);

        execSync(`screencapture -x "${outputPath}"`, { stdio: 'inherit' });
        console.log(`Saved: ${outputPath}`);
    } catch (error) {
        console.error('Failed to capture screenshot:', error);
        console.log('\nAlternative: Use Cmd+Shift+4 to manually capture');
    }
}

async function runStudioTests(): Promise<void> {
    console.log('\n--- Studio Preview Visual Tests ---');

    // Check if dev server is running
    const isDevRunning = await checkPort(3000);

    if (!isDevRunning) {
        console.log('Dev server not running. Starting...');
        console.log('(Run `npm run dev` in another terminal for better control)');

        // Start dev server in background
        const devProcess = spawn('npm', ['run', 'dev'], {
            detached: true,
            stdio: 'ignore',
        });
        devProcess.unref();

        // Wait for server to start
        console.log('Waiting for dev server to start...');
        await waitForPort(3000, 30000);
    }

    // Run Playwright tests
    try {
        execSync('npx playwright test tests/visual/studio-preview.spec.ts --reporter=html', {
            stdio: 'inherit',
            env: { ...process.env, PWTEST_SKIP_TEST_OUTPUT: '1' },
        });
    } catch (error) {
        console.log('Some tests may have failed. Check the report.');
    }

    console.log('\nView report: npx playwright show-report');
}

async function runWordPressTests(): Promise<void> {
    console.log('\n--- WordPress Theme Visual Tests ---');

    // Check if WordPress is running
    const isWpRunning = await checkPort(8089);

    if (!isWpRunning) {
        console.log('WordPress not detected at localhost:8089');
        console.log('Please start WordPress or use WordPress Playground');
        console.log('\nAlternatives:');
        console.log('  - Start local WordPress with Docker');
        console.log('  - Use wp-env: npx @wordpress/env start');
        console.log('  - Use WordPress Playground: https://playground.wordpress.net/');
        return;
    }

    // Run Playwright tests
    try {
        execSync('npx playwright test tests/visual/wordpress-theme.spec.ts --reporter=html', {
            stdio: 'inherit',
        });
    } catch (error) {
        console.log('Some tests may have failed. Check the report.');
    }
}

async function generateSummaryReport(): Promise<void> {
    console.log('\n--- Generating Summary Report ---');

    const screenshots = fs.readdirSync(OUTPUT_DIR).filter(f => f.endsWith('.png'));

    if (screenshots.length === 0) {
        console.log('No screenshots found.');
        return;
    }

    const reportPath = path.join(OUTPUT_DIR, 'summary.md');
    let report = `# Visual Test Screenshots\n\n`;
    report += `Generated: ${new Date().toISOString()}\n\n`;
    report += `## Screenshots\n\n`;

    for (const screenshot of screenshots) {
        report += `### ${screenshot}\n\n`;
        report += `![${screenshot}](./${screenshot})\n\n`;
    }

    fs.writeFileSync(reportPath, report);
    console.log(`Summary report: ${reportPath}`);
}

// Utility functions

function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function checkPort(port: number): Promise<boolean> {
    try {
        const response = await fetch(`http://localhost:${port}`, {
            method: 'HEAD',
            signal: AbortSignal.timeout(2000),
        });
        return true;
    } catch {
        return false;
    }
}

async function waitForPort(port: number, timeoutMs: number): Promise<void> {
    const startTime = Date.now();

    while (Date.now() - startTime < timeoutMs) {
        if (await checkPort(port)) {
            return;
        }
        await sleep(1000);
    }

    throw new Error(`Timeout waiting for port ${port}`);
}

// Main

async function main(): Promise<void> {
    const options = parseArgs();

    console.log('=====================================');
    console.log('Visual Test Capture');
    console.log('=====================================');

    await ensureOutputDir();

    if (!options.studio && !options.wordpress && !options.manual) {
        console.log('\nUsage: npx tsx scripts/capture-visual-tests.ts [options]');
        console.log('\nOptions:');
        console.log('  --studio     Capture Studio preview screenshots');
        console.log('  --wordpress  Capture WordPress theme screenshots');
        console.log('  --manual     Take a manual screenshot');
        console.log('  --all        Run all visual tests');
        console.log('\nExample:');
        console.log('  npx tsx scripts/capture-visual-tests.ts --studio');
        return;
    }

    if (options.manual) {
        await captureManualScreenshot();
    }

    if (options.studio) {
        await runStudioTests();
    }

    if (options.wordpress) {
        await runWordPressTests();
    }

    await generateSummaryReport();

    console.log('\n=====================================');
    console.log('Done!');
    console.log(`Screenshots saved to: ${path.resolve(OUTPUT_DIR)}`);
    console.log('=====================================');
}

main().catch(console.error);
