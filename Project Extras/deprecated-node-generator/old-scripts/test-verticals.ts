import { generateTheme } from '../src/generator/index';

const testCases = [
    {
        name: "Tony's Pizza Palace",
        industry: "restaurant",
        hero_headline: "Best Pizza in Town",
        hero_subheadline: "Fresh ingredients, authentic recipes",
        primary: "#e63946",
        accent: "#f4a261"
    },
    {
        name: "Le Petit Bistro",
        industry: "restaurant",
        hero_headline: "Fine Dining Experience",
        hero_subheadline: "French cuisine in an intimate setting",
        primary: "#2d3436",
        accent: "#d63031"
    },
    {
        name: "Cozy Corner Shop",
        industry: "ecommerce",
        hero_headline: "Handmade Goods",
        hero_subheadline: "Curated items for your home",
        primary: "#6b705c",
        accent: "#a5a58d"
    },
    {
        name: "Urban Apparel Co",
        industry: "ecommerce",
        hero_headline: "Streetwear Redefined",
        hero_subheadline: "Bold designs for bold people",
        primary: "#1a1a2e",
        accent: "#e94560"
    },
    {
        name: "Creative Agency",
        industry: "general",
        hero_headline: "We Design Experiences",
        hero_subheadline: "Digital agency specializing in web design",
        primary: "#0077b6",
        accent: "#00b4d8"
    }
];

async function runTests() {
    console.log('='.repeat(60));
    console.log('VERTICAL THEME SELECTION TEST');
    console.log('='.repeat(60));
    
    const results: any[] = [];
    
    for (const testCase of testCases) {
        console.log(`\n[TEST] Generating: ${testCase.name} (${testCase.industry})`);
        console.log('-'.repeat(40));
        
        try {
            const result = await generateTheme({
                data: testCase as any,
                outDir: './output/test-verticals',
                slug: `${testCase.industry}-${testCase.name.toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 20)}`
            });
            
            results.push({
                name: testCase.name,
                industry: testCase.industry,
                coreThemeId: 'captured-from-logs',
                reasoning: 'captured-from-logs',
                zipPath: result.downloadPath
            });
            
            console.log(`[SUCCESS] Theme generated: ${result.themeName}`);
            console.log(`          ZIP: ${result.downloadPath}`);
        } catch (error) {
            console.error(`[ERROR] Failed: ${error}`);
            results.push({
                name: testCase.name,
                industry: testCase.industry,
                error: String(error)
            });
        }
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('TEST SUMMARY');
    console.log('='.repeat(60));
    console.log(JSON.stringify(results, null, 2));
}

runTests();
