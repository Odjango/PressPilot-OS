/**
 * Unsplash Image Provider for PressPilot
 * Fetches contextually relevant high-quality images using Unsplash API.
 */

const CATEGORY_KEYWORDS: Record<string, string[]> = {
    restaurant: ['restaurant interior', 'food plating', 'chef cooking', 'cafe ambiance', 'dining table'],
    saas: ['software dashboard', 'team collaboration', 'modern office', 'laptop workspace', 'tech startup'],
    startup: ['startup team', 'brainstorming', 'modern workspace', 'innovation', 'pitch meeting'],
    ecommerce: ['online shopping', 'product photography', 'retail store', 'packaging', 'delivery'],
    fitness: ['gym equipment', 'yoga class', 'fitness training', 'healthy lifestyle', 'workout'],
    portfolio: ['creative workspace', 'design studio', 'architecture', 'art gallery', 'photography'],
    corporate: ['corporate office', 'business meeting', 'professional team', 'conference room', 'handshake'],
    general: ['modern office', 'nature landscape', 'city skyline', 'abstract', 'minimalist']
};

// Cache to avoid duplicate API calls
const imageCache: Map<string, string[]> = new Map();

/**
 * Fetch images from Unsplash API
 */
export async function fetchUnsplashImages(industry: string = 'general', count: number = 5): Promise<string[]> {
    const cacheKey = `${industry}-${count}`;
    if (imageCache.has(cacheKey)) {
        return imageCache.get(cacheKey)!;
    }

    const accessKey = process.env.UNSPLASH_ACCESS_KEY;
    if (!accessKey) {
        console.warn('[ImageProvider] No UNSPLASH_ACCESS_KEY found, using fallback images');
        return getFallbackImages(industry, count);
    }

    const keywords = CATEGORY_KEYWORDS[industry.toLowerCase()] || CATEGORY_KEYWORDS.general;
    const query = keywords[0];

    try {
        const response = await fetch(
            `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=${count}&orientation=landscape`,
            {
                headers: {
                    'Authorization': `Client-ID ${accessKey}`
                }
            }
        );

        if (!response.ok) {
            console.error('[ImageProvider] Unsplash API error:', response.status);
            return getFallbackImages(industry, count);
        }

        const data = await response.json();
        const urls = data.results.map((photo: any) => photo.urls.regular);
        
        imageCache.set(cacheKey, urls);
        console.log(`[ImageProvider] Fetched ${urls.length} Unsplash images for "${industry}"`);
        return urls;
    } catch (error) {
        console.error('[ImageProvider] Failed to fetch Unsplash images:', error);
        return getFallbackImages(industry, count);
    }
}

/**
 * Fallback to Lorem Picsum if Unsplash fails
 */
function getFallbackImages(industry: string, count: number): string[] {
    const images: string[] = [];
    const baseSeed = industry.length * 100;
    for (let i = 0; i < count; i++) {
        images.push(`https://picsum.photos/seed/${baseSeed + i}/1200/800`);
    }
    return images;
}

/**
 * Synchronous version using pre-fetched URLs or fallback
 * Used where async isn't possible
 */
export function getModernImageUrl(category: string, index: number = 0): string {
    const cacheKey = `${category}-5`;
    if (imageCache.has(cacheKey)) {
        const cached = imageCache.get(cacheKey)!;
        return cached[index % cached.length];
    }
    // Fallback to picsum with category-based seed
    const seed = category.length * 100 + index;
    return `https://picsum.photos/seed/${seed}/1200/800`;
}

/**
 * Pre-fetch images for a category (call this early in generation)
 */
export async function prefetchImages(industry: string): Promise<void> {
    await fetchUnsplashImages(industry, 10);
}
