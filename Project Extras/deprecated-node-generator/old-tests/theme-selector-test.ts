import { selectTheme } from '../../src/generator/modules/ThemeSelector';
import { GeneratorData } from '../../types/generator-legacy';

async function runThemeSelectorTests() {
    console.log('='.repeat(80));
    console.log('THEME SELECTOR 5-THEME TEST TABLE');
    console.log('='.repeat(80));

    const testCases: Array<{
        name: string;
        input: GeneratorData;
        expectedCore: string;
        description: string;
    }> = [
            {
                name: 'Fine Dining Restaurant',
                input: {
                    name: 'The Gilded Fork',
                    industry: 'restaurant',
                    businessType: 'fine-dining',
                    description: 'An upscale fine dining experience with an elegant lounge'
                },
                expectedCore: 'ollie/restaurant-hero-dark',
                description: 'Fine dining should prefer ollie/restaurant-hero-dark'
            },
            {
                name: 'Fashion Brand Store',
                input: {
                    name: 'Velvet & Vine',
                    industry: 'ecommerce',
                    businessType: 'fashion',
                    description: 'Contemporary fashion apparel brand'
                },
                expectedCore: 'spectra-one/store-showcase',
                description: 'Fashion/brand stores should favor spectra-one/store-showcase'
            },
            {
                name: 'Minimal Small Catalog Store',
                input: {
                    name: 'Zen Home',
                    industry: 'ecommerce',
                    businessType: 'minimal',
                    description: 'Curated home goods with a small catalog'
                },
                expectedCore: 'spectra-one/store-minimal',
                description: 'Small catalog/minimal stores should favor spectra-one/store-minimal'
            },
            {
                name: 'Generic Multi-Category Store',
                input: {
                    name: 'General Goods Co',
                    industry: 'ecommerce',
                    businessType: 'multi-category',
                    description: 'Online shop with varied products across categories'
                },
                expectedCore: 'blockbase/store-starter',
                description: 'Generic multi-category stores should favor blockbase/store-starter'
            },
            {
                name: 'Content-Led Magazine Store',
                input: {
                    name: 'Lifestyle Journal',
                    industry: 'ecommerce',
                    businessType: 'magazine',
                    description: 'A brand magazine with shoppable content'
                },
                expectedCore: 'twentytwentyfour/store-magazine',
                description: 'Content-led (magazine/blog) stores should favor twentytwentyfour/store-magazine'
            }
        ];

    let passed = 0;
    let failed = 0;

    console.log('\n| # | Test Case | Expected Core | Actual Core | Status |');
    console.log('|---|-----------|---------------|-------------|--------|');

    for (let i = 0; i < testCases.length; i++) {
        const test = testCases[i];
        const result = await selectTheme(test.input, process.cwd());
        const isPass = result.coreThemeId === test.expectedCore;

        if (isPass) {
            passed++;
        } else {
            failed++;
        }

        const status = isPass ? '✅ PASS' : '❌ FAIL';
        console.log(`| ${i + 1} | ${test.name} | ${test.expectedCore} | ${result.coreThemeId} | ${status} |`);
        console.log(`|   | ${test.description} | | | |`);
        console.log(`|   | Reasoning: ${result.reasoning} | | | |`);
        console.log('|---|-----------|---------------|-------------|--------|');
    }

    console.log('\n' + '='.repeat(80));
    console.log(`RESULTS: ${passed} passed, ${failed} failed out of ${testCases.length} tests`);
    console.log('='.repeat(80));

    if (failed > 0) {
        process.exit(1);
    }
}

runThemeSelectorTests().catch(console.error);
