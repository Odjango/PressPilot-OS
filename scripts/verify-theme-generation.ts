
import fs from 'node:fs/promises';
import path from 'node:path';
import { buildWordPressTheme } from '../lib/presspilot/themeKit';
import { buildStaticSite } from '../lib/presspilot/staticSite';
import { PressPilotNormalizedContext, PressPilotVariationManifest } from '../types/presspilot';
import { KitSummary } from '../lib/presspilot/kitSummary';

// Mock Data
const mockContext: PressPilotNormalizedContext = {
    brand: {
        name: 'Test Brand',
        category: 'corporate',
        slug: 'test-brand-verify'
    },
    language: {
        primary: 'en',
        secondary: [],
        rtl_required: false
    },
    narrative: {
        description_long: 'A test brand for verification.',
    },
    visual: {
        has_logo: false,
        image_source_preference: 'stock-only',
        palette_id: 'saas-bright',
        font_pair_id: 'system-sans',
        layout_density: 'balanced',
        corner_style: 'rounded'
    },
    modes: {
        business_category: 'corporate',
        restaurant_enabled: false,
        ecommerce_enabled: false,
        needs_menu_nav_item: false,
        needs_shop_nav_item: false
    },
    siteArchetype: 'service',
    navShell: []
};

const mockVariation: PressPilotVariationManifest = {
    id: 'variation_a',
    tokens: {
        palette_id: 'saas-bright',
        font_pair_id: 'system-sans',
        layout_density: 'balanced',
        corner_style: 'rounded'
    },
    nav: {
        has_menu_nav_item: false,
        has_shop_nav_item: false
    },
    preview: {
        id: 'variation_a',
        label: 'Test Variation',
        description: 'Test Description'
    },
    pattern_set_id: 'pattern_set_a'
};

const mockKitSummary: KitSummary = {
    slug: 'test-brand-verify',
    brandName: 'Test Brand',
    businessTypeId: 'corporate',
    styleVariation: 'saas-bright',
    createdAt: new Date().toISOString(),
    plan: { pages: [] },
    wpImport: {
        front_page_slug: 'home',
        pages: [
            { slug: 'home', title: 'Home' },
            { slug: 'about', title: 'About' }
        ],
        menu: {
            location: 'primary',
            name: 'Main Menu',
            items: ['home', 'about']
        }
    }
};

async function verify() {
    console.log('Starting verification...');

    try {
        // 1. Build Theme
        console.log('Building WordPress Theme...');
        const themeResult = await buildWordPressTheme(mockContext, mockVariation, {
            businessTypeId: 'corporate',
            styleVariation: 'saas-bright',
            kitSummary: mockKitSummary
        });
        console.log('Theme built at:', themeResult.themeDir);

        // 2. Verify theme.json (Fluid Typography)
        const themeJsonPath = path.join(themeResult.themeDir, 'theme.json');
        const themeJsonContent = await fs.readFile(themeJsonPath, 'utf8');
        const themeJson = JSON.parse(themeJsonContent);

        const fontSizes = themeJson.settings.typography.fontSizes;
        const hasClamp = fontSizes.every((fs: any) => fs.size.includes('clamp('));

        if (hasClamp) {
            console.log('✅ PASS: theme.json uses fluid typography (clamp)');
        } else {
            console.error('❌ FAIL: theme.json does NOT use fluid typography');
            console.log('Font Sizes:', fontSizes);
        }

        // 3. Verify XML (Menu)
        const xmlPath = path.join(themeResult.themeDir, 'presspilot-demo-content.xml');
        const xmlContent = await fs.readFile(xmlPath, 'utf8');

        if (xmlContent.includes('<wp:term_taxonomy>nav_menu</wp:term_taxonomy>') &&
            xmlContent.includes('<wp:post_type>nav_menu_item</wp:post_type>')) {
            console.log('✅ PASS: presspilot-demo-content.xml contains menu definitions');
        } else {
            console.error('❌ FAIL: presspilot-demo-content.xml missing menu definitions');
        }

        console.log('Verification complete.');

    } catch (error) {
        console.error('Verification failed with error:', error);
        process.exit(1);
    }
}

verify();
