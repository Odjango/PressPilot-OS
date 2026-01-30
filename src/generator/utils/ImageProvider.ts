
/**
 * Unsplash Image Provider for PressPilot
 * Provides contextually relevant high-quality images.
 */

const CATEGORY_KEYWORDS: Record<string, string[]> = {
    restaurant: ['food', 'dining', 'restaurant', 'chef', 'cafe'],
    saas: ['software', 'technology', 'dashboard', 'coding', 'office'],
    startup: ['innovation', 'team', 'startup', 'meeting', 'digital'],
    ecommerce: ['product', 'shopping', 'lifestyle', 'store'],
    fitness: ['gym', 'workout', 'fitness', 'yoga', 'athlete'],
    portfolio: ['design', 'architecture', 'photography', 'art'],
    corporate: ['business', 'office', 'skyscraper', 'professional'],
    general: ['nature', 'abstract', 'minimalist', 'cityscape']
};

export function getUnsplashUrl(industry: string = 'general', index: number = 0): string {
    const keywords = CATEGORY_KEYWORDS[industry.toLowerCase()] || CATEGORY_KEYWORDS.general;
    const keyword = keywords[index % keywords.length];

    // Use consistent seed based on index to keep images same within a theme run
    return `https://images.unsplash.com/photo-${1500000000000 + index}?auto=format&fit=crop&q=80&w=1200&h=800&keyword=${keyword}`;
}

/**
 * More robust version using Source API for better variety
 */
export function getContextualImageUrl(industry: string = 'general', width: number = 1200, height: number = 800, seed: string = 'presspilot'): string {
    const keywords = CATEGORY_KEYWORDS[industry.toLowerCase()] || CATEGORY_KEYWORDS.general;
    const keyword = keywords[0]; // Primary keyword

    // Unsplash Source API (Random image matching keyword)
    return `https://source.unsplash.com/featured/${width}x${height}?${keyword}&sig=${seed}`;
}

// NOTE: source.unsplash.com is deprecated. Using direct images.unsplash.com with queries or simple redirectors.
export function getModernImageUrl(category: string, index: number = 1): string {
    const keyword = (CATEGORY_KEYWORDS[category.toLowerCase()] || CATEGORY_KEYWORDS.general)[0];
    // This is a reliable way to get high quality placeholder images from Unsplash
    return `https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=1200&h=800&pp-cat=${keyword}&pp-idx=${index}`;
}
