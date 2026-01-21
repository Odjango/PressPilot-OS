
export interface ThemeColors {
    brand: string;
    brand_alt: string;
    accent: string;
}

export interface ThemePatterns {
    hero: string;
    hero_search_headline: string;
    hero_search_sub: string;
}

export interface ThemePersonality {
    colors: ThemeColors;
    patterns: ThemePatterns;
    home_template: string;
    recipes?: Record<string, LayoutRecipe[]>; // Key: Industry (e.g. 'saas'), Value: List of recipes
}

export type UniversalPageTemplate = 'universal-about' | 'universal-services' | 'universal-contact';

export interface PageContent {
    hero_title?: string;
    hero_sub?: string;
    features?: Array<{ title: string; desc: string }>;
    team?: Array<{ name: string; role: string }>;
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
    hero_headline?: string;
    hero_subheadline?: string;
    logo?: string; // Path to local logo file
    images?: string[]; // Array of local image paths from CLI
    pages?: PageData[];
    menus?: RestaurantMenu[];
    industry?: string; // e.g., 'saas', 'restaurant', 'agency'
}

export type BaseTheme = 'ollie' | 'frost' | 'twentytwentyfour' | 'spectra';
export type GeneratorMode = 'standard' | 'heavy';

export type PatternReference = string; // Path to pattern file relative to theme root

export interface LayoutRecipe {
    name: string;
    description: string;
    patterns: PatternReference[]; // Sequence of patterns to assemble
}
