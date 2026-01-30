
import { PressPilotNormalizedContext, PressPilotVariationManifest } from '../../../types/presspilot';

export const MOCK_CONTEXT: PressPilotNormalizedContext = {
    brand: {
        name: 'Mock Brand',
        slug: 'mock-brand',
        category: 'restaurant_cafe',
        tagline: 'Mocking the world'
    },
    language: {
        primary: 'en',
        secondary: [],
        rtl_required: false
    },
    narrative: {
        description_long: 'We are a great mock brand serving mock customers.',
    },
    visual: {
        has_logo: false,
        image_source_preference: 'stock-only',
        palette_id: 'default',
        font_pair_id: 'default',
        layout_density: 'balanced',
        corner_style: 'rounded',
        primary_ctas: [
            { label: 'Get Started', url: '#start' },
            { label: 'Learn More', url: '#more' }
        ]
    },
    modes: {
        business_category: 'restaurant_cafe',
        restaurant_enabled: true,
        ecommerce_enabled: false,
        needs_menu_nav_item: true,
        needs_shop_nav_item: false
    },
    siteArchetype: 'restaurant_cafe',
    navShell: []
};

export const MOCK_VARIATION: PressPilotVariationManifest = {
    id: 'variation_a',
    tokens: {
        palette_id: 'default',
        font_pair_id: 'default',
        layout_density: 'balanced',
        corner_style: 'rounded'
    },
    nav: {
        has_menu_nav_item: true,
        has_shop_nav_item: false
    },
    preview: {
        id: 'variation_a',
        label: 'Mock Variation',
        description: 'A variation for testing.'
    },
    pattern_set_id: 'default'
};
// forcing type for MVP if strict check complains about missing props
