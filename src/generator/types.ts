
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

// ============================================================================
// Studio UI Input Types
// ============================================================================

/**
 * Palette ID options for color scheme selection
 */
export type PaletteId =
    | 'brand-kit'          // User's custom colors (derived from primary/secondary/accent)
    | 'saas-bright'        // Professional purple-gray (Ollie-inspired)
    | 'local-biz-soft'     // Neutral beige tones (TT4-inspired)
    | 'restaurant-soft'    // Warm pastels (Tove-inspired)
    | 'ecommerce-bold';    // Dark green + neon lime (Agency-inspired)

/**
 * Font profile options for typography personality
 */
export type FontProfile = 'elegant' | 'modern' | 'bold' | 'friendly';

/**
 * Mood options for style variation default
 */
export type Mood = 'warm' | 'fresh' | 'minimal' | 'dark';

/**
 * Hero layout options for homepage hero section
 */
export type HeroLayout = 'fullBleed' | 'fullWidth' | 'split' | 'minimal';

/**
 * Brand style options for restaurant vertical
 * 'playful' → Tove-based (warm, colorful)
 * 'modern' → Frost-based (clean, photo-driven)
 */
export type BrandStyle = 'playful' | 'modern';

/**
 * User slot names for brand kit editing
 */
export type BrandKitSlot =
    | 'primary'
    | 'accent'
    | 'background'
    | 'surface'
    | 'text'
    | 'heading'
    | 'muted'
    | 'border'
    | 'cta-bg'
    | 'cta-text';

/**
 * Brand kit override entry
 */
export interface BrandKitEdit {
    slot: BrandKitSlot;
    hex: string;
}

// ============================================================================
// Generator Data Interface
// ============================================================================

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

    // ========================================================================
    // Studio UI Inputs (TT4-aligned design system)
    // ========================================================================

    /**
     * Selected palette preset ID
     * Maps to predefined TT4-style color palettes
     * Default: 'brand-kit' (uses primary/secondary/accent colors)
     */
    selectedPaletteId?: PaletteId;

    /**
     * User-edited brand kit overrides
     * Allows fine-tuning specific color slots after palette selection
     * Only values change, slugs remain TT4-standard
     */
    userEditedBrandKit?: BrandKitEdit[];

    /**
     * Font profile selection
     * Controls the typography personality (font families)
     * Default: determined by industry
     */
    fontProfile?: FontProfile;

    /**
     * Mood selection
     * Sets which style variation is active by default
     * All 4 variations are always shipped; this sets initial
     */
    mood?: Mood;

    /**
     * Hero layout selection
     * Controls the homepage hero section structure
     * Options: 'fullBleed' | 'fullWidth' | 'split' | 'minimal'
     * Default: 'fullBleed'
     */
    heroLayout?: HeroLayout;

    /**
     * Brand style selection (restaurant vertical only)
     * Controls base theme selection for restaurant sites
     * 'playful' → Tove-based (warm, colorful)
     * 'modern' → Frost-based (clean, photo-driven)
     * Default: 'playful'
     */
    brandStyle?: BrandStyle;

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
