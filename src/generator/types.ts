
export interface ThemeColors {
    brand: string;
    brand_alt: string;
    accent: string;
}

export interface ThemePatterns {
    hero: string;
    hero_search_headline: string;
    hero_search_pretitle?: string;
    hero_search_sub: string;
}

export interface ThemePersonality {
    colors: ThemeColors;
    patterns: ThemePatterns;
    home_template: string;
    recipes?: Record<string, LayoutRecipe[]>; // Key: Industry (e.g. 'saas'), Value: List of recipes
}
export type UniversalPageTemplate =
    | 'universal-home'
    | 'universal-about'
    | 'universal-services'
    | 'universal-contact'
    | 'universal-menu'         // Restaurant
    | 'universal-reservation'  // Restaurant
    | 'universal-portfolio'    // Agency
    | 'universal-shop';        // E-commerce

export interface PatternSlot {
    patternId: string; // e.g., 'universal-hero'
    data?: any; // Overrides for this specific slot
}

export interface SiteRecipe {
    industry: string;
    description: string;
    pages: PageData[]; // The default pages structure for this vertical
}


export interface PageContent {
    hero_title?: string;
    hero_sub?: string;
    hero_image?: string;
    features?: Array<{ title: string; desc: string }>;
    team?: Array<{ name: string; role: string }>;
    menus?: RestaurantMenu[];
}


export interface PageData {
    title: string;
    slug: string;
    template: UniversalPageTemplate;
    content?: PageContent;
}

export interface RestaurantMenuItem {
    name: string;
    price: string;
    description?: string;
    image?: string;
}

export interface RestaurantMenu {
    title: string; // e.g., "Dinner", "Drinks"
    items: RestaurantMenuItem[];
}

export interface GeneratorData {
    name?: string;
    primary?: string;
    secondary?: string;
    accent?: string;
    hero_headline?: string;
    hero_subheadline?: string;
    logo?: string; // Path to local logo file
    images?: string[]; // Array of local image paths from CLI
    pages?: PageData[];
    menus?: RestaurantMenu[];
    industry?: string; // e.g., 'saas', 'restaurant', 'agency'
    baseName?: string; // Base theme name for color mapping (e.g., 'ollie', 'tove')
    businessType?: string; // Business type for theme matching (e.g., 'fashion', 'minimal', 'fine-dining')
    description?: string; // Business description for theme matching
    [key: string]: unknown; // Allow additional properties
}

export type BaseTheme = 'ollie' | 'frost' | 'twentytwentyfour' | 'spectra' | 'spectra-one' | 'tove' | 'blockbase';
export type GeneratorMode = 'standard' | 'heavy';

export type PatternReference = string; // Path to pattern file relative to theme root

export interface LayoutRecipe {
    name: string;
    description: string;
    patterns: PatternReference[]; // Sequence of patterns to assemble
}
