import fs from 'fs-extra';
import path from 'path';
import { generateTheme } from '../src/generator/index';
import { BaseTheme, GeneratorData } from '../src/generator/types';

// Define the Test Matrix
interface Scenario {
    name: string;
    industry: string;
    base: BaseTheme;
    expectedFile: string;
    dummyData: GeneratorData;
}

const SCENARIOS: Scenario[] = [
    {
        name: 'Scenario A: Fitness + Ollie',
        industry: 'fitness',
        base: 'ollie',
        expectedFile: 'templates/page-schedule.html',
        dummyData: {
            name: 'Iron Gym',
            industry: 'fitness',
            hero_headline: 'Get Strong',
            pages: ['Home', 'About', 'Contact']
        }
    },
    {
        name: 'Scenario B: Ecommerce + Frost',
        industry: 'ecommerce',
        base: 'frost',
        expectedFile: 'templates/archive-product.html',
        dummyData: {
            name: 'Frosty Shop',
            industry: 'ecommerce',
            hero_headline: 'Buy Stuff',
            pages: ['Home', 'Shop']
        }
    },
    {
        name: 'Scenario C: Restaurant + Spectra',
        industry: 'restaurant',
        base: 'spectra-one',
        expectedFile: 'templates/page-menu.html',
        dummyData: {
            name: 'Tasty Bites',
            industry: 'restaurant',
            hero_headline: 'Eat Well',
            menus: [{ title: 'Main Menu', items: [{ name: 'Burger', price: '$10', description: 'Yum' }] }]
        }
    },
    {
        name: 'Scenario D: Portfolio + TwentyTwentyFour',
        industry: 'portfolio',
        base: 'twentytwentyfour',
        expectedFile: 'templates/page-gallery.html',
        dummyData: {
            name: 'My Portfolio',
            industry: 'portfolio',
            hero_headline: 'Look at this',
            pages: ['Home', 'Work']
        }
    }
];

async function runTestMatrix() {
    console.log('🚀 Starting Feature Injection Test Matrix...\n');
    let passed = 0;
    let failed = 0;

    for (const scenario of SCENARIOS) {
        console.log(`----------------------------------------------------------------`);
        console.log(`🧪 Testing ${scenario.name}...`);

        const testOutDir = path.join(process.cwd(), 'output', 'test-matrix', scenario.name.replace(/[^a-z0-9]/gi, '-').toLowerCase());

        try {
            // Clean up previous test run
            await fs.remove(testOutDir);

            // Execute Generator
            // Note: We need to ensure we pass the correct structure expected by generateTheme
            // The generateTheme function creates a timestamped folder inside the outDir if strictly followed, 
            // OR if we pass outDir directly it might use that. 
            // Looking at index.ts:
            // const buildDir = options.outDir ? options.outDir : ...
            // So passing outDir is supported.

            const result = await generateTheme({
                base: scenario.base,
                mode: 'standard',
                data: scenario.dummyData,
                outDir: testOutDir
            });

            // Verify File Existence
            // The generator typically creates the theme folder INSIDE the buildDir. 
            // const themeDir = path.join(buildDir, safeName);
            // safeName is based on userData.name
            const safeName = scenario.dummyData.name!.toLowerCase().replace(/[^a-z0-9]/g, '-');
            const themePath = path.join(result.themeDir);
            const expectedPath = path.join(themePath, scenario.expectedFile);

            console.log(`   Checking for: ${scenario.expectedFile}`);

            if (fs.existsSync(expectedPath)) {
                console.log(`✅ PASS: File found at ${expectedPath}`);
                passed++;
            } else {
                console.error(`❌ FAIL: Expected file NOT found at ${expectedPath}`);
                failed++;
            }

        } catch (error) {
            console.error(`❌ FAIL: Generator crashed for ${scenario.name}`);
            console.error(error);
            failed++;
        }
    }

    console.log(`\n----------------------------------------------------------------`);
    console.log(`📊 Test Matrix Results: ${passed} Passed, ${failed} Failed`);
    console.log(`----------------------------------------------------------------`);

    if (failed > 0) process.exit(1);
    process.exit(0);
}

runTestMatrix();
