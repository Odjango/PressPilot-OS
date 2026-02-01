import { PressPilotSaaSInput } from '../../types/presspilot';
import { GeneratorData } from '../../src/generator/types';

/**
 * Transforms PressPilotSaaSInput (API format) to GeneratorData (internal format)
 */
export function transformSaaSInputToGeneratorData(input: PressPilotSaaSInput): GeneratorData {
    const businessName = input.brand?.business_name || 'Untitled Project';
    const tagline = input.brand?.business_tagline || '';
    const description = input.narrative?.description_long || '';
    const category = input.brand?.business_category || 'service';

    // Map category to industry
    const industryMap: Record<string, string> = {
        'restaurant_cafe': 'restaurant',
        'ecommerce': 'ecommerce',
        'saas_product': 'startup',
        'local_store': 'local',
        'service': 'corporate',
        'other': 'general'
    };

    const industry = industryMap[category] || 'general';

    const generatorData: GeneratorData = {
        name: businessName,
        hero_headline: tagline || businessName,
        hero_subheadline: description,
        industry: industry,
        logo: input.visualAssets?.logo_external_url || input.visualAssets?.logo_file_url,
    };

    const pages: import('../../src/generator/types').PageData[] = [
        {
            title: 'About',
            slug: 'about',
            template: 'universal-about',
            content: {
                hero_title: `About ${businessName}`,
                hero_sub: description
            }
        },
        {
            title: 'Services',
            slug: 'services',
            template: 'universal-services',
            content: {
                hero_title: 'Our Services',
                hero_sub: `Discover what ${businessName} has to offer.`
            }
        },
        {
            title: 'Contact',
            slug: 'contact',
            template: 'universal-contact',
            content: {
                hero_title: 'Get in Touch',
                hero_sub: `Contact ${businessName} today.`
            }
        }
    ];

    if (input.modes?.restaurant?.enabled) {
        pages.push({
            title: 'Menu',
            slug: 'menu',
            template: 'universal-menu',
            content: {
                hero_title: 'Our Menu',
                hero_sub: `Fresh ingredients, expertly prepared.`
            }
        });
    }

    generatorData.pages = pages;

    // Add restaurant-specific data
    if (input.modes?.restaurant?.enabled) {
        // Use provided menus if available, otherwise fallback to sections
        if (input.modes.restaurant.menus && input.modes.restaurant.menus.length > 0) {
            generatorData.menus = input.modes.restaurant.menus.map(m => ({
                title: m.title || m.name || 'Menu',
                items: (m.items || []).map((item: any) => ({
                    name: item.name || 'Unnamed Item',
                    price: item.price || '',
                    description: item.description
                }))
            }));
        } else if (input.modes.restaurant.menu_sections && input.modes.restaurant.menu_sections.length > 0) {
            generatorData.menus = input.modes.restaurant.menu_sections.map(s => ({
                title: s.name,
                items: (s.items || []).map((item: any) => ({
                    name: item.name || 'Unnamed Item',
                    price: item.price || '',
                    description: item.description
                }))
            }));
        } else {
            // Last fallback
            generatorData.menus = [{
                title: 'Main Menu',
                items: [
                    { name: 'Appetizers', price: '$8-12', description: 'Fresh starters' },
                    { name: 'Main Courses', price: '$18-28', description: 'Signature dishes' },
                    { name: 'Desserts', price: '$6-10', description: 'Sweet endings' }
                ]
            }];
        }
    }

    // Add custom colors if provided
    if (input.visualControls?.custom_colors) {
        generatorData.primary = input.visualControls.custom_colors.primary;
        generatorData.secondary = input.visualControls.custom_colors.secondary;
        generatorData.accent = input.visualControls.custom_colors.accent;
    }

    // Add logo path if provided
    if (input.visualAssets?.logo_file_url) {
        generatorData.logo = input.visualAssets.logo_file_url;
    }

    // ========================================================================
    // TT4-Aligned Design System Inputs
    // ========================================================================

    // Pass selectedPaletteId (brand-kit, saas-bright, local-biz-soft, restaurant-soft, ecommerce-bold)
    if (input.visualControls?.selectedPaletteId) {
        generatorData.selectedPaletteId = input.visualControls.selectedPaletteId as any;
    }

    // Pass userEditedBrandKit (array of {slot, hex} overrides)
    if (input.visualControls?.userEditedBrandKit) {
        generatorData.userEditedBrandKit = input.visualControls.userEditedBrandKit as any;
    }

    // Pass fontProfile (elegant, modern, bold, friendly)
    if (input.visualControls?.fontProfile) {
        generatorData.fontProfile = input.visualControls.fontProfile as any;
    }

    // Pass mood (warm, fresh, minimal, dark)
    if (input.visualControls?.mood) {
        generatorData.mood = input.visualControls.mood as any;
    }

    return generatorData;
}
