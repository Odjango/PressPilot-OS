/**
 * Unsplash Image Provider for PressPilot
 * Fetches contextually relevant high-quality images using Unsplash API.
 *
 * Structured Logging:
 * - [ImageProvider] Cache hit/miss status
 * - [ImageProvider] API key presence (not value)
 * - [ImageProvider] Query, industry, count on each fetch
 * - [ImageProvider] Success with first URL preview
 * - [ImageProvider] Fallback reason when using Picsum
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

    // Check cache first
    if (imageCache.has(cacheKey)) {
        const cached = imageCache.get(cacheKey)!;
        console.log(`[ImageProvider] Cache HIT for "${cacheKey}" → ${cached.length} images`);
        return cached;
    }
    console.log(`[ImageProvider] Cache MISS for "${cacheKey}"`);

    // Check API key presence
    const accessKey = process.env.UNSPLASH_ACCESS_KEY;
    const hasApiKey = !!accessKey && accessKey.length > 10;
    console.log(`[ImageProvider] Unsplash API key: ${hasApiKey ? 'PRESENT' : 'MISSING'}`);

    if (!hasApiKey) {
        console.warn('[ImageProvider] Fallback reason: No UNSPLASH_ACCESS_KEY environment variable');
        return getFallbackImages(industry, count, 'no_api_key');
    }

    // Build query from category keywords
    const keywords = CATEGORY_KEYWORDS[industry.toLowerCase()] || CATEGORY_KEYWORDS.general;
    const query = keywords[0];
    console.log(`[ImageProvider] Fetching: industry="${industry}", query="${query}", count=${count}`);

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
            console.error(`[ImageProvider] Unsplash API error: HTTP ${response.status} ${response.statusText}`);
            console.warn(`[ImageProvider] Fallback reason: API returned error status ${response.status}`);
            return getFallbackImages(industry, count, `api_error_${response.status}`);
        }

        const data = await response.json();
        const urls = data.results.map((photo: any) => photo.urls.regular);

        // Cache the results
        imageCache.set(cacheKey, urls);

        // Log success with first URL preview
        const firstUrl = urls[0] ? urls[0].substring(0, 60) + '...' : 'none';
        console.log(`[ImageProvider] SUCCESS: ${urls.length} Unsplash images for "${industry}"`);
        console.log(`[ImageProvider] First image preview: ${firstUrl}`);

        return urls;
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error(`[ImageProvider] Fetch exception: ${errorMessage}`);
        console.warn(`[ImageProvider] Fallback reason: Network/fetch error`);
        return getFallbackImages(industry, count, 'network_error');
    }
}

/**
 * Fallback to Lorem Picsum if Unsplash fails
 * @param industry - Industry category for seed generation
 * @param count - Number of images needed
 * @param reason - Why fallback is being used (for logging)
 */
function getFallbackImages(industry: string, count: number, reason?: string): string[] {
    console.log(`[ImageProvider] Using Picsum fallback: ${count} images for "${industry}" (reason: ${reason || 'unspecified'})`);

    const images: string[] = [];
    const baseSeed = industry.length * 100;
    for (let i = 0; i < count; i++) {
        images.push(`https://picsum.photos/seed/${baseSeed + i}/1200/800`);
    }

    console.log(`[ImageProvider] Picsum URLs generated: ${images[0].substring(0, 50)}...`);
    return images;
}

/**
 * Synchronous version using pre-fetched URLs or fallback
 * Used where async isn't possible
 */
export function getModernImageUrl(category: string, index: number = 0): string {
    const cacheKey = `${category}-10`;
    if (imageCache.has(cacheKey)) {
        const cached = imageCache.get(cacheKey)!;
        const url = cached[index % cached.length];
        // Only log occasionally to avoid spam (first call per category)
        if (index === 0) {
            console.log(`[ImageProvider] getModernImageUrl: Cache HIT for "${category}"`);
        }
        return url;
    }

    // Fallback to picsum with category-based seed
    if (index === 0) {
        console.log(`[ImageProvider] getModernImageUrl: Cache MISS for "${category}", using Picsum fallback`);
    }
    const seed = category.length * 100 + index;
    return `https://picsum.photos/seed/${seed}/1200/800`;
}

/**
 * Pre-fetch images for a category (call this early in generation)
 */
export async function prefetchImages(industry: string): Promise<void> {
    console.log(`[ImageProvider] Prefetching 10 images for industry: "${industry}"`);
    const startTime = Date.now();
    await fetchUnsplashImages(industry, 10);
    console.log(`[ImageProvider] Prefetch complete in ${Date.now() - startTime}ms`);
}
