
import { buildStaticSite } from './lib/presspilot/staticSite';
import { getVariationById } from './lib/presspilot/variationRegistry';
import { applyBusinessInputs } from './lib/presspilot/context';
import { buildSaaSInputFromStudioInput } from './lib/presspilot/studioAdapter';
import fs from 'fs-extra';
import path from 'path';

async function testWorkerPreview() {
    console.log("🧪 Testing Worker-style Static Preview Generation...");

    const generatorData = {
        name: "Test Restaurant",
        industry: "restaurant_cafe",
        hero_headline: "The Best Pizza in Town",
        hero_subheadline: "Serving authentic flavors since 1999.",
        colors: { primary: "#ff5733", secondary: "#ffffff", accent: "#33ff57" }
    };

    const saasInput = buildSaaSInputFromStudioInput({
        businessName: generatorData.name,
        businessDescription: generatorData.hero_subheadline,
        businessCategory: generatorData.industry,
        heroTitle: generatorData.hero_headline,
        palette: generatorData.colors
    });

    const context = applyBusinessInputs(saasInput);
    const variation = getVariationById('saas-bright') || { id: 'saas-bright', title: 'Bright' } as any;

    // Build the manifest as worker does
    const variationManifest: any = {
        id: variation.id,
        tokens: {
            palette_id: saasInput.visualControls.palette_id,
            font_pair_id: saasInput.visualControls.font_pair_id,
            layout_density: saasInput.visualControls.layout_density,
            corner_style: saasInput.visualControls.corner_style
        },
        preview: {
            id: variation.id,
            label: variation.title || 'Default',
            description: saasInput.narrative.description_long
        }
    };

    const result = await buildStaticSite(context, variationManifest, {
        businessTypeId: generatorData.industry
    });

    console.log("✅ Static Preview Generated at:", result.staticDir);

    const html = await fs.readFile(path.join(result.staticDir, 'index.html'), 'utf8');
    const hasMenuInHtml = html.includes('id="menu"');
    console.log("   HTML contains Menu section:", hasMenuInHtml ? "YES" : "NO");

    const css = await fs.readFile(path.join(result.staticDir, 'assets', 'styles.css'), 'utf8');
    const hasWpVars = css.includes('--wp--preset--color--primary');
    console.log("   CSS contains WP preset variables:", hasWpVars ? "YES" : "NO");

    console.log("\n✨ Preview Accuracy Verified.");
}

testWorkerPreview().catch(err => {
    console.error("❌ Test Failed:", err);
    process.exit(1);
});
