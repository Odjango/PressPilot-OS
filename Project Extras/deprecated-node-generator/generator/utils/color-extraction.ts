
import { Jimp } from 'jimp';

export interface ExtractedColors {
    primary: string;
    secondary: string;
    accent?: string;
}

const DEFAULT_COLORS: ExtractedColors = {
    primary: '#000000',
    secondary: '#333333',
    accent: '#666666',
};

function rgbToHex(r: number, g: number, b: number): string {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

interface RGB { r: number; g: number; b: number }

/**
 * Color distance (Euclidean in RGB space).
 * Good enough for palette clustering without perceptual weighting.
 */
function colorDistance(a: RGB, b: RGB): number {
    return Math.sqrt((a.r - b.r) ** 2 + (a.g - b.g) ** 2 + (a.b - b.b) ** 2);
}

/**
 * Check if a color is near-white, near-black, or near-gray (low saturation).
 * These are typically background/chrome colors in logos, not brand colors.
 */
function isNeutral(c: RGB, threshold = 30): boolean {
    // Near white
    if (c.r > 225 && c.g > 225 && c.b > 225) return true;
    // Near black
    if (c.r < 30 && c.g < 30 && c.b < 30) return true;
    // Near gray (low saturation)
    const max = Math.max(c.r, c.g, c.b);
    const min = Math.min(c.r, c.g, c.b);
    if (max - min < threshold) return true;
    return false;
}

/**
 * Simple K-means clustering to extract the top N dominant colors.
 * Filters out neutrals (white/black/gray) to find actual brand colors.
 */
function extractTopColors(image: any, k = 5): RGB[] {
    const width = image.bitmap.width;
    const height = image.bitmap.height;

    // Collect sampled non-neutral pixels
    const pixels: RGB[] = [];
    // @ts-ignore - Jimp scan callback
    image.scan(0, 0, width, height, function (x: number, y: number, idx: number) {
        if (x % 3 === 0 && y % 3 === 0) {
            // @ts-ignore
            const r = this.bitmap.data[idx + 0];
            // @ts-ignore
            const g = this.bitmap.data[idx + 1];
            // @ts-ignore
            const b = this.bitmap.data[idx + 2];
            // @ts-ignore
            const a = this.bitmap.data[idx + 3];
            // Skip transparent and neutral pixels
            if (a > 128 && !isNeutral({ r, g, b })) {
                pixels.push({ r, g, b });
            }
        }
    });

    if (pixels.length === 0) return [{ r: 0, g: 0, b: 0 }];
    if (pixels.length < k) return pixels;

    // Initialize centroids by picking evenly spaced pixels
    const step = Math.floor(pixels.length / k);
    let centroids: RGB[] = Array.from({ length: k }, (_, i) => ({ ...pixels[i * step] }));

    // Run K-means for 10 iterations
    for (let iter = 0; iter < 10; iter++) {
        const clusters: RGB[][] = centroids.map(() => []);

        // Assign pixels to nearest centroid
        for (const px of pixels) {
            let minDist = Infinity;
            let nearest = 0;
            for (let c = 0; c < centroids.length; c++) {
                const d = colorDistance(px, centroids[c]);
                if (d < minDist) { minDist = d; nearest = c; }
            }
            clusters[nearest].push(px);
        }

        // Recompute centroids
        for (let c = 0; c < centroids.length; c++) {
            const cl = clusters[c];
            if (cl.length === 0) continue;
            centroids[c] = {
                r: Math.round(cl.reduce((s, p) => s + p.r, 0) / cl.length),
                g: Math.round(cl.reduce((s, p) => s + p.g, 0) / cl.length),
                b: Math.round(cl.reduce((s, p) => s + p.b, 0) / cl.length),
            };
        }
    }

    // Sort by cluster size (largest first) — dominant colors come first
    const clusterSizes: { centroid: RGB; count: number }[] = centroids.map((centroid) => {
        let count = 0;
        for (const px of pixels) {
            if (colorDistance(px, centroid) < 60) count++;
        }
        return { centroid, count };
    });
    clusterSizes.sort((a, b) => b.count - a.count);

    // Deduplicate close colors (within distance 50)
    const unique: RGB[] = [];
    for (const { centroid } of clusterSizes) {
        if (!unique.some(u => colorDistance(u, centroid) < 50)) {
            unique.push(centroid);
        }
    }

    return unique.slice(0, 3);
}

export async function extractBrandColors(base64Image: string): Promise<ExtractedColors> {
    try {
        if (!base64Image) return DEFAULT_COLORS;

        const base64Data = base64Image.replace(/^data:image\/[a-z]+;base64,/, "");
        const buffer = Buffer.from(base64Data, 'base64');

        const image = await Jimp.read(buffer);
        const topColors = extractTopColors(image, 5);

        const primary = topColors[0] ? rgbToHex(topColors[0].r, topColors[0].g, topColors[0].b) : DEFAULT_COLORS.primary;
        const secondary = topColors[1] ? rgbToHex(topColors[1].r, topColors[1].g, topColors[1].b) : rgbToHex(
            Math.max(0, (topColors[0]?.r ?? 0) - 40),
            Math.max(0, (topColors[0]?.g ?? 0) - 40),
            Math.max(0, (topColors[0]?.b ?? 0) - 40)
        );
        const accent = topColors[2] ? rgbToHex(topColors[2].r, topColors[2].g, topColors[2].b) : undefined;

        console.log(`[ColorExtraction] Extracted: primary=${primary}, secondary=${secondary}, accent=${accent ?? 'none'}`);

        return { primary, secondary, accent };

    } catch (e) {
        console.warn("[ColorExtraction] Failed to extract colors, using defaults.", e);
        return DEFAULT_COLORS;
    }
}
