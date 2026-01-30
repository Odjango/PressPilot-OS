/**
 * Advanced Color Extraction Utility
 * Uses k-means clustering and perceptual color analysis
 * to extract accurate brand colors from logos
 */

interface ColorResult {
    primary: string;
    secondary: string;
    accent: string;
}

interface RGB {
    r: number;
    g: number;
    b: number;
}

/**
 * Extract dominant colors from an image data URL using k-means clustering
 */
export async function extractColorsFromImage(dataUrl: string): Promise<ColorResult> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'Anonymous';

        img.onload = () => {
            try {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');

                if (!ctx) {
                    throw new Error('Could not get canvas context');
                }

                // Use larger size for better color sampling, especially for low-res logos
                const maxSize = 300;
                const scale = Math.min(maxSize / img.width, maxSize / img.height);
                canvas.width = img.width * scale;
                canvas.height = img.height * scale;

                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const pixels = imageData.data;

                // Extract all valid colors with position weighting
                const colors: RGB[] = [];
                const centerX = canvas.width / 2;
                const centerY = canvas.height / 2;

                for (let y = 0; y < canvas.height; y++) {
                    for (let x = 0; x < canvas.width; x++) {
                        const i = (y * canvas.width + x) * 4;
                        const r = pixels[i];
                        const g = pixels[i + 1];
                        const b = pixels[i + 2];
                        const a = pixels[i + 3];

                        // Skip transparent pixels
                        if (a < 200) continue;

                        // Calculate distance from center (for logo focus)
                        const dx = x - centerX;
                        const dy = y - centerY;
                        const distFromCenter = Math.sqrt(dx * dx + dy * dy);
                        const maxDist = Math.sqrt(centerX * centerX + centerY * centerY);
                        const centerWeight = 1 - (distFromCenter / maxDist) * 0.5; // Center pixels weighted more

                        // Skip near-white (very bright, low saturation)
                        const brightness = (r + g + b) / 3;
                        if (brightness > 240) continue;

                        // Skip near-black (very dark)
                        if (r < 25 && g < 25 && b < 25) continue;

                        // Calculate saturation
                        const max = Math.max(r, g, b);
                        const min = Math.min(r, g, b);
                        const saturation = max === 0 ? 0 : (max - min) / max;

                        // For logos, prioritize saturated colors (brand colors)
                        // But also keep some low-saturation colors if they're not gray
                        const isGray = Math.abs(r - g) < 15 && Math.abs(g - b) < 15 && Math.abs(r - b) < 15;

                        // Skip gray colors unless they're very dark or very light
                        if (isGray && brightness > 40 && brightness < 215) continue;

                        // Skip low saturation colors in the middle brightness range
                        if (saturation < 0.25 && brightness > 60 && brightness < 200) continue;

                        // Add color multiple times based on center weight (focus on logo center)
                        const weight = Math.max(1, Math.round(centerWeight * 3));
                        for (let w = 0; w < weight; w++) {
                            colors.push({ r, g, b });
                        }
                    }
                }

                if (colors.length === 0) {
                    resolve({
                        primary: '#1a1a1a',
                        secondary: '#666666',
                        accent: '#999999'
                    });
                    return;
                }

                console.log(`[ColorExtractor] Analyzing ${colors.length} color samples`);

                // Use more clusters for logos with multiple brand colors
                const clusters = kMeansClustering(colors, 8, 15);

                // Sort clusters by size (most pixels)
                clusters.sort((a, b) => b.pixels.length - a.pixels.length);

                // Filter out clusters that are too similar to white/black/gray
                const validClusters = clusters.filter(cluster => {
                    const { r, g, b } = cluster.center;
                    const max = Math.max(r, g, b);
                    const min = Math.min(r, g, b);
                    const saturation = max === 0 ? 0 : (max - min) / max;
                    const brightness = (r + g + b) / 3;

                    // Check if it's gray
                    const isGray = Math.abs(r - g) < 20 && Math.abs(g - b) < 20 && Math.abs(r - b) < 20;

                    // Keep saturated colors (brand colors like red, green, blue)
                    if (saturation > 0.3) return true;

                    // Keep very dark colors (like black text/borders) if they're not gray
                    if (brightness < 50 && !isGray) return true;

                    // Skip everything else (grays, low saturation)
                    return false;
                });

                console.log(`[ColorExtractor] Found ${validClusters.length} valid color clusters`);

                if (validClusters.length === 0) {
                    // Fallback to largest cluster
                    const primary = rgbToHex(clusters[0].center.r, clusters[0].center.g, clusters[0].center.b);
                    const secondary = generateComplementary(clusters[0].center);
                    const accent = generateAccent(clusters[0].center);
                    resolve({ primary, secondary, accent });
                    return;
                }

                // Primary: largest valid cluster (usually the most prominent brand color)
                const primaryRGB = validClusters[0].center;
                const primary = rgbToHex(primaryRGB.r, primaryRGB.g, primaryRGB.b);

                // Secondary: find most contrasting color
                let secondaryRGB: RGB | null = null;
                let maxDistance = 0;

                for (let i = 1; i < validClusters.length; i++) {
                    const distance = perceptualColorDistance(primaryRGB, validClusters[i].center);

                    if (distance > maxDistance) {
                        maxDistance = distance;
                        secondaryRGB = validClusters[i].center;
                    }
                }

                // If no good secondary found, generate one
                let secondary: string;
                if (!secondaryRGB || maxDistance < 60) {
                    secondary = generateComplementary(primaryRGB);
                    secondaryRGB = hexToRGB(secondary);
                } else {
                    secondary = rgbToHex(secondaryRGB.r, secondaryRGB.g, secondaryRGB.b);
                }

                // Accent: find third most contrasting color (different from both primary and secondary)
                let accentRGB: RGB | null = null;
                let maxAccentDistance = 0;

                for (let i = 1; i < validClusters.length; i++) {
                    const cluster = validClusters[i].center;

                    // Skip if this is the secondary color
                    if (secondaryRGB &&
                        Math.abs(cluster.r - secondaryRGB.r) < 20 &&
                        Math.abs(cluster.g - secondaryRGB.g) < 20 &&
                        Math.abs(cluster.b - secondaryRGB.b) < 20) {
                        continue;
                    }

                    // Calculate combined distance from both primary and secondary
                    const distFromPrimary = perceptualColorDistance(primaryRGB, cluster);
                    const distFromSecondary = secondaryRGB ? perceptualColorDistance(secondaryRGB, cluster) : Infinity;
                    const combinedDistance = Math.min(distFromPrimary, distFromSecondary);

                    if (combinedDistance > maxAccentDistance) {
                        maxAccentDistance = combinedDistance;
                        accentRGB = cluster;
                    }
                }

                // If no good accent found, generate one
                let accent: string;
                if (!accentRGB || maxAccentDistance < 50) {
                    accent = generateAccent(primaryRGB, secondaryRGB);
                } else {
                    accent = rgbToHex(accentRGB.r, accentRGB.g, accentRGB.b);
                }

                console.log(`[ColorExtractor] Primary: ${primary}, Secondary: ${secondary}, Accent: ${accent}`);
                resolve({ primary, secondary, accent });

            } catch (error) {
                reject(error);
            }
        };

        img.onerror = () => {
            reject(new Error('Failed to load image'));
        };

        img.src = dataUrl;
    });
}

/**
 * K-means clustering algorithm for color quantization
 */
function kMeansClustering(colors: RGB[], k: number, maxIterations: number = 10): Array<{ center: RGB; pixels: RGB[] }> {
    // Initialize centroids randomly
    const centroids: RGB[] = [];
    const step = Math.floor(colors.length / k);
    for (let i = 0; i < k; i++) {
        centroids.push({ ...colors[Math.min(i * step, colors.length - 1)] });
    }

    let clusters: Array<{ center: RGB; pixels: RGB[] }> = [];

    for (let iteration = 0; iteration < maxIterations; iteration++) {
        // Assign pixels to nearest centroid
        clusters = centroids.map(center => ({ center, pixels: [] }));

        for (const color of colors) {
            let minDist = Infinity;
            let closestCluster = 0;

            for (let i = 0; i < centroids.length; i++) {
                const dist = euclideanDistance(color, centroids[i]);
                if (dist < minDist) {
                    minDist = dist;
                    closestCluster = i;
                }
            }

            clusters[closestCluster].pixels.push(color);
        }

        // Update centroids
        for (let i = 0; i < clusters.length; i++) {
            if (clusters[i].pixels.length > 0) {
                const avg = averageColor(clusters[i].pixels);
                centroids[i] = avg;
                clusters[i].center = avg;
            }
        }
    }

    return clusters;
}

/**
 * Calculate average color from array of RGB values
 */
function averageColor(colors: RGB[]): RGB {
    const sum = colors.reduce(
        (acc, color) => ({
            r: acc.r + color.r,
            g: acc.g + color.g,
            b: acc.b + color.b
        }),
        { r: 0, g: 0, b: 0 }
    );

    return {
        r: Math.round(sum.r / colors.length),
        g: Math.round(sum.g / colors.length),
        b: Math.round(sum.b / colors.length)
    };
}

/**
 * Euclidean distance in RGB space
 */
function euclideanDistance(c1: RGB, c2: RGB): number {
    return Math.sqrt(
        Math.pow(c2.r - c1.r, 2) +
        Math.pow(c2.g - c1.g, 2) +
        Math.pow(c2.b - c1.b, 2)
    );
}

/**
 * Perceptual color distance (weighted for human perception)
 */
function perceptualColorDistance(c1: RGB, c2: RGB): number {
    // Weighted Euclidean distance (human eye is more sensitive to green)
    const rDiff = c2.r - c1.r;
    const gDiff = c2.g - c1.g;
    const bDiff = c2.b - c1.b;

    return Math.sqrt(
        2 * rDiff * rDiff +
        4 * gDiff * gDiff +
        3 * bDiff * bDiff
    );
}

/**
 * Generate a complementary color
 */
function generateComplementary(color: RGB): string {
    const brightness = (color.r + color.g + color.b) / 3;

    if (brightness > 128) {
        // Primary is light, make secondary darker
        return rgbToHex(
            Math.max(0, Math.round(color.r * 0.4)),
            Math.max(0, Math.round(color.g * 0.4)),
            Math.max(0, Math.round(color.b * 0.4))
        );
    } else {
        // Primary is dark, make secondary lighter
        return rgbToHex(
            Math.min(255, Math.round(color.r * 1.8 + 80)),
            Math.min(255, Math.round(color.g * 1.8 + 80)),
            Math.min(255, Math.round(color.b * 1.8 + 80))
        );
    }
}

/**
 * Convert RGB to hex color
 */
function rgbToHex(r: number, g: number, b: number): string {
    const toHex = (n: number) => {
        const hex = Math.max(0, Math.min(255, Math.round(n))).toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    };
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/**
 * Convert hex color to RGB
 */
function hexToRGB(hex: string): RGB {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
}

/**
 * Generate an accent color that contrasts with both primary and secondary
 */
function generateAccent(primary: RGB, secondary?: RGB): string {
    if (!secondary) {
        // If no secondary, just generate a lighter/darker version of primary
        const brightness = (primary.r + primary.g + primary.b) / 3;
        if (brightness > 128) {
            return rgbToHex(
                Math.max(0, Math.round(primary.r * 0.6)),
                Math.max(0, Math.round(primary.g * 0.6)),
                Math.max(0, Math.round(primary.b * 0.6))
            );
        } else {
            return rgbToHex(
                Math.min(255, Math.round(primary.r * 1.5 + 60)),
                Math.min(255, Math.round(primary.g * 1.5 + 60)),
                Math.min(255, Math.round(primary.b * 1.5 + 60))
            );
        }
    }

    // Create an accent that's between primary and secondary, or a neutral
    const avgBrightness = ((primary.r + primary.g + primary.b) + (secondary.r + secondary.g + secondary.b)) / 6;

    if (avgBrightness > 128) {
        // Both are light, make accent dark
        return '#2c2c2c';
    } else if (avgBrightness < 80) {
        // Both are dark, make accent light
        return '#e8e8e8';
    } else {
        // Mix of light and dark, create a muted accent
        return rgbToHex(
            Math.round((primary.r + secondary.r) / 3),
            Math.round((primary.g + secondary.g) / 3),
            Math.round((primary.b + secondary.b) / 3)
        );
    }
}
