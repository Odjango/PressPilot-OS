
import { generateTheme } from '../src/generator/index';
import path from 'path';
import fs from 'fs-extra';

async function generatePremiumBistro() {
    console.log('[Task] Generating Premium Bistro Menu Page...');

    const slug = 'premium-bistro-theme';
    const outputDir = path.join(process.cwd(), 'output', slug);

    if (fs.existsSync(outputDir)) {
        fs.removeSync(outputDir);
    }

    try {
        const result = await generateTheme({
            base: 'frost',
            mode: 'standard',
            slug: slug,
            data: {
                name: "The Luminary Bistro",
                hero_headline: "Dining Reimagined",
                hero_subheadline: "A culinary journey through local landscapes and seasonal flavors.",
                pages: [
                    { title: "Home", slug: "home", template: 'universal-home' },
                    { title: "The Menu", slug: "menu", template: 'universal-menu' },
                ],
                menus: [
                    {
                        title: "Curated Starters",
                        items: [
                            { name: "Hand-Dived Scallops", price: "$24", description: "Parsnip purée, crispy pancetta, herbal oil" },
                            { name: "Wagyu Beef Carpaccio", price: "$28", description: "Truffle emulsion, caper berries, 36-month aged parmesan" },
                            { name: "Heirloom Beetroot", price: "$19", description: "Whipped goat cheese, honeycomb, toasted hazelnuts" }
                        ]
                    },
                    {
                        title: "Land & Sea",
                        items: [
                            { name: "Dry-Aged Ribeye", price: "$65", description: "Bone marrow jus, smoked salt, heritage carrots" },
                            { name: "Wild Atlantic Turbot", price: "$58", description: "Champagne velouté, samphire, brown shrimp" },
                            { name: "Risotto of Wild Fungi", price: "$32", description: "Foraged mushrooms, pine nuts, black truffle" }
                        ]
                    },
                    {
                        title: "Noble Finish",
                        items: [
                            { name: "Valrhona Soufflé", price: "$16", description: "Dark chocolate, salted caramel, Tahitian vanilla" },
                            { name: "Deconstructed Lemon Tart", price: "$14", description: "Yuzu curd, meringue, basil sorbet" }
                        ]
                    }
                ]
            }
        });

        console.log('[Task] Generation SUCCESS. Theme located at:', result.themeDir);
        process.exit(0);

    } catch (err) {
        console.error('[Task] Generation FAILED:', err);
        process.exit(1);
    }
}

generatePremiumBistro();
