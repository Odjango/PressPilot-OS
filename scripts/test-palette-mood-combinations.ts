/**
 * Test script to verify palette + mood output differences
 * Generates 4 restaurant themes with different palette/mood combinations
 * Automatically captures screenshots of color comparisons
 *
 * Run with: npx tsx scripts/test-palette-mood-combinations.ts
 */

import { generateTheme } from '../src/generator/index';
import * as fs from 'fs';
import * as path from 'path';
import puppeteer from 'puppeteer';
import { execSync } from 'child_process';

const VISUAL_OUTPUT_DIR = path.join(process.cwd(), 'output', 'visual-tests');
const OUTPUT_DIR = path.join(process.cwd(), 'output');

const BASE_RESTAURANT_DATA = {
    name: 'Bella Cafe',
    industry: 'restaurant',
    businessType: 'restaurant',
    hero_headline: 'Authentic Italian Cuisine',
    hero_subheadline: 'Family recipes passed down for generations',
    description: 'A cozy Italian restaurant serving homemade pasta and wood-fired pizzas.',
    primary: '#C83C23',
    secondary: '#F5E6D3',
    accent: '#2D5016',
    pages: [
        { title: 'Home', slug: 'home', template: 'universal-home' as any },
        { title: 'About', slug: 'about', template: 'universal-about' as any },
        { title: 'Services', slug: 'services', template: 'universal-services' as any },
        { title: 'Contact', slug: 'contact', template: 'universal-contact' as any },
    ],
    menus: [
        {
            title: 'Main Course',
            items: [
                { name: 'Spaghetti Carbonara', price: '$18.99', description: 'Classic Roman pasta' },
                { name: 'Margherita Pizza', price: '$16.99', description: 'Fresh tomatoes and mozzarella' },
            ]
        }
    ]
};

interface TestCase {
    id: string;
    palette: 'restaurant-soft' | 'saas-bright' | 'ecommerce-bold';
    mood: 'warm' | 'fresh' | 'minimal' | 'dark';
    description: string;
}

const TEST_CASES: TestCase[] = [
    { id: 'test-a', palette: 'restaurant-soft', mood: 'warm', description: 'Restaurant Soft + Warm Mood' },
    { id: 'test-b', palette: 'restaurant-soft', mood: 'fresh', description: 'Restaurant Soft + Fresh Mood' },
    { id: 'test-c', palette: 'saas-bright', mood: 'minimal', description: 'SaaS Bright + Minimal Mood' },
    { id: 'test-d', palette: 'ecommerce-bold', mood: 'dark', description: 'E-Commerce Bold + Dark Mood' },
];

/**
 * Generate HTML visual report with color swatches
 */
function generateVisualReport(results: Array<{
    id: string;
    description: string;
    path: string;
    accentColors: Record<string, string>;
}>): string {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>PressPilot - Palette/Mood Test Results</title>
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #f5f5f5;
            padding: 40px;
            color: #1a1a1a;
        }
        .container { max-width: 1200px; margin: 0 auto; }
        h1 {
            font-size: 28px;
            margin-bottom: 8px;
            color: #111;
        }
        .subtitle {
            color: #666;
            margin-bottom: 32px;
            font-size: 14px;
        }
        .grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 24px;
        }
        .card {
            background: white;
            border-radius: 16px;
            padding: 24px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.08);
        }
        .card-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 16px;
        }
        .card-title {
            font-size: 18px;
            font-weight: 700;
        }
        .card-badge {
            font-size: 12px;
            padding: 4px 12px;
            border-radius: 20px;
            background: #e5e5e5;
            color: #666;
        }
        .card-description {
            font-size: 13px;
            color: #888;
            margin-bottom: 20px;
        }
        .color-row {
            display: flex;
            gap: 12px;
            margin-bottom: 16px;
        }
        .color-swatch {
            flex: 1;
            text-align: center;
        }
        .swatch-box {
            width: 100%;
            height: 60px;
            border-radius: 12px;
            margin-bottom: 8px;
            border: 1px solid rgba(0,0,0,0.1);
        }
        .swatch-label {
            font-size: 11px;
            color: #888;
            margin-bottom: 2px;
        }
        .swatch-value {
            font-size: 12px;
            font-family: monospace;
            color: #333;
        }
        .hero-preview {
            margin-top: 20px;
            border-radius: 12px;
            overflow: hidden;
            height: 120px;
            position: relative;
        }
        .hero-preview-inner {
            width: 100%;
            height: 100%;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            padding: 16px;
        }
        .hero-text {
            font-size: 20px;
            font-weight: 700;
            margin-bottom: 8px;
        }
        .hero-button {
            padding: 8px 20px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
        }
        .footer {
            margin-top: 32px;
            text-align: center;
            color: #888;
            font-size: 12px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🎨 Palette + Mood Test Results</h1>
        <p class="subtitle">Generated: ${timestamp} • 4 themes with different palette/mood combinations</p>

        <div class="grid">
            ${results.map(result => {
                const colors = result.accentColors;
                const baseColor = colors.base || '#ffffff';
                const contrastColor = colors.contrast || '#1a1a1a';
                const accentColor = colors.accent || '#374151';
                const accent2Color = colors['accent-2'] || '#9CA3AF';
                const accent3Color = colors['accent-3'] || '#1F2937';

                return `
            <div class="card">
                <div class="card-header">
                    <span class="card-title">${result.id.toUpperCase()}</span>
                    <span class="card-badge">${result.description.split(' + ')[1]}</span>
                </div>
                <p class="card-description">${result.description}</p>

                <div class="color-row">
                    <div class="color-swatch">
                        <div class="swatch-box" style="background: ${accentColor}"></div>
                        <div class="swatch-label">accent</div>
                        <div class="swatch-value">${accentColor}</div>
                    </div>
                    <div class="color-swatch">
                        <div class="swatch-box" style="background: ${accent2Color}"></div>
                        <div class="swatch-label">accent-2</div>
                        <div class="swatch-value">${accent2Color}</div>
                    </div>
                    <div class="color-swatch">
                        <div class="swatch-box" style="background: ${accent3Color}"></div>
                        <div class="swatch-label">accent-3</div>
                        <div class="swatch-value">${accent3Color}</div>
                    </div>
                    <div class="color-swatch">
                        <div class="swatch-box" style="background: ${baseColor}"></div>
                        <div class="swatch-label">base</div>
                        <div class="swatch-value">${baseColor}</div>
                    </div>
                </div>

                <div class="hero-preview" style="background: ${accent3Color}">
                    <div class="hero-preview-inner">
                        <div class="hero-text" style="color: ${baseColor}">Bella Cafe</div>
                        <div class="hero-button" style="background: ${accentColor}; color: ${baseColor}">View Menu</div>
                    </div>
                </div>
            </div>`;
            }).join('')}
        </div>

        <div class="footer">
            Generated by PressPilot Test Suite • Phase 6 Verification
        </div>
    </div>
</body>
</html>`;
}

/**
 * Capture screenshot of HTML report using Puppeteer
 */
async function captureScreenshot(htmlContent: string, outputPath: string): Promise<void> {
    console.log('\n📸 Capturing visual report screenshot...');

    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    try {
        const page = await browser.newPage();

        // Set viewport for consistent screenshots
        await page.setViewport({
            width: 1400,
            height: 1000,
            deviceScaleFactor: 2 // Retina quality
        });

        // Load HTML content
        await page.setContent(htmlContent, {
            waitUntil: 'networkidle0'
        });

        // Wait for fonts to load
        await page.evaluateHandle('document.fonts.ready');

        // Small delay for rendering
        await new Promise(resolve => setTimeout(resolve, 500));

        // Capture screenshot
        await page.screenshot({
            path: outputPath,
            fullPage: true
        });

        console.log(`   ✅ Screenshot saved: ${outputPath}`);

    } finally {
        await browser.close();
    }
}

async function main() {
    console.log('=' .repeat(70));
    console.log('🧪 Palette + Mood Output Verification Test');
    console.log('=' .repeat(70));
    console.log('\nGenerating 4 restaurant themes with different palette/mood combinations...\n');

    const results: Array<{ id: string; description: string; path: string; accentColors: Record<string, string> }> = [];

    for (const testCase of TEST_CASES) {
        console.log(`\n📦 Generating ${testCase.id}: ${testCase.description}...`);

        const result = await generateTheme({
            base: 'ollie',
            mode: 'standard',
            slug: testCase.id,
            data: {
                ...BASE_RESTAURANT_DATA,
                selectedPaletteId: testCase.palette,
                mood: testCase.mood,
            }
        });

        // Extract ZIP and read theme.json for accent colors
        let accentColors: Record<string, string> = {};

        // Unzip the theme to extract directory
        const extractDir = path.join(OUTPUT_DIR, `${testCase.id}-extracted`);
        try {
            // Remove old extraction if exists
            if (fs.existsSync(extractDir)) {
                fs.rmSync(extractDir, { recursive: true });
            }

            // Unzip the theme
            execSync(`unzip -q "${result.downloadPath}" -d "${extractDir}"`, { stdio: 'pipe' });

            // Find theme.json in extracted files
            const extractedThemeDir = path.join(extractDir, testCase.id);
            const jsonPath = path.join(extractedThemeDir, 'theme.json');

            if (fs.existsSync(jsonPath)) {
                const themeJson = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
                const palette = themeJson?.settings?.color?.palette || [];

                for (const color of palette) {
                    if (color.slug?.includes('accent') || color.slug === 'base' || color.slug === 'contrast') {
                        accentColors[color.slug] = color.color;
                    }
                }
                console.log(`   ✅ Read theme.json: ${Object.keys(accentColors).length} colors extracted`);
            }
        } catch (e) {
            console.log(`   ⚠️ Could not extract colors: ${e}`);
        }

        results.push({
            id: testCase.id,
            description: testCase.description,
            path: result.downloadPath,
            accentColors,
        });

        console.log(`   ✅ Generated: ${result.downloadPath}`);
    }

    // Print comparison table
    console.log('\n' + '=' .repeat(70));
    console.log('📊 RESULTS COMPARISON');
    console.log('=' .repeat(70));

    console.log('\n| Test | Palette | Mood | accent | accent-2 | accent-3 | base |');
    console.log('|------|---------|------|--------|----------|----------|------|');

    for (const [i, result] of results.entries()) {
        const tc = TEST_CASES[i];
        const colors = result.accentColors;
        console.log(`| ${tc.id} | ${tc.palette} | ${tc.mood} | ${colors.accent || 'N/A'} | ${colors['accent-2'] || 'N/A'} | ${colors['accent-3'] || 'N/A'} | ${colors.base || 'N/A'} |`);
    }

    console.log('\n' + '=' .repeat(70));
    console.log('📁 OUTPUT LOCATIONS');
    console.log('=' .repeat(70));

    for (const result of results) {
        console.log(`\n${result.id} (${result.description}):`);
        console.log(`   Path: ${result.path}`);
        console.log(`   Colors: accent=${result.accentColors.accent || 'N/A'}, accent-3=${result.accentColors['accent-3'] || 'N/A'}`);
    }

    console.log('\n' + '=' .repeat(70));
    console.log('🔍 VERIFICATION CHECKLIST');
    console.log('=' .repeat(70));
    console.log('\n1. Check that each theme has DIFFERENT accent colors');
    console.log('2. Warm mood should have amber/orange tones (#D97706, #B45309)');
    console.log('3. Fresh mood should have green/teal tones (#059669, #047857)');
    console.log('4. Dark mood should have blue tones with dark base (#60A5FA, #0F172A)');
    console.log('5. Minimal mood should use palette colors or gray (#374151)');

    // Generate visual report and capture screenshot
    console.log('\n' + '=' .repeat(70));
    console.log('📸 GENERATING VISUAL REPORT');
    console.log('=' .repeat(70));

    // Ensure output directory exists
    fs.mkdirSync(VISUAL_OUTPUT_DIR, { recursive: true });

    // Generate HTML report
    const htmlReport = generateVisualReport(results);
    const htmlPath = path.join(VISUAL_OUTPUT_DIR, 'palette-mood-comparison.html');
    fs.writeFileSync(htmlPath, htmlReport);
    console.log(`\n   ✅ HTML report saved: ${htmlPath}`);

    // Capture screenshot of the report
    const screenshotPath = path.join(VISUAL_OUTPUT_DIR, 'palette-mood-comparison.png');
    await captureScreenshot(htmlReport, screenshotPath);

    console.log('\n' + '=' .repeat(70));
    console.log('✅ ALL DONE!');
    console.log('=' .repeat(70));
    console.log(`\n📁 Visual test outputs:`);
    console.log(`   • HTML Report: ${htmlPath}`);
    console.log(`   • Screenshot:  ${screenshotPath}`);
    console.log(`   • Open the PNG file to see color comparison visually\n`);
}

main().catch(console.error);
