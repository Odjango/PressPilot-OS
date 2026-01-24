
import Jimp from 'jimp';

export interface ExtractedColors {
    primary: string;
    secondary: string;
}

const DEFAULT_COLORS = {
    primary: '#000000',
    secondary: '#333333'
};

function rgbToHex(r: number, g: number, b: number): string {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

// Simple quantization / dominance finder
function getDominantColor(image: Jimp): { r: number, g: number, b: number } {
    const width = image.bitmap.width;
    const height = image.bitmap.height;

    // Sample pixels
    let r = 0, g = 0, b = 0, count = 0;

    // Scan 10% of pixels for speed
    image.scan(0, 0, width, height, function (x, y, idx) {
        if (x % 5 === 0 && y % 5 === 0) { // sparse sampling
            r += this.bitmap.data[idx + 0];
            g += this.bitmap.data[idx + 1];
            b += this.bitmap.data[idx + 2];
            count++;
        }
    });

    if (count === 0) return { r: 0, g: 0, b: 0 };
    return {
        r: Math.round(r / count),
        g: Math.round(g / count),
        b: Math.round(b / count)
    };
}

export async function extractBrandColors(base64Image: string): Promise<ExtractedColors> {
    try {
        if (!base64Image) return DEFAULT_COLORS;

        const base64Data = base64Image.replace(/^data:image\/[a-z]+;base64,/, "");
        const buffer = Buffer.from(base64Data, 'base64');

        const image = await Jimp.read(buffer);
        const dominant = getDominantColor(image);

        const primary = rgbToHex(dominant.r, dominant.g, dominant.b);

        // Naive secondary: just darken/lighten or simple variation
        // For now, let's just make a complementary or shade
        const secondary = rgbToHex(
            Math.max(0, dominant.r - 40),
            Math.max(0, dominant.g - 40),
            Math.max(0, dominant.b - 40)
        );

        console.log(`[ColorExtraction] Extracted: ${primary}, ${secondary}`);

        return { primary, secondary };

    } catch (e) {
        console.warn("[ColorExtraction] Failed to extract colors, using defaults.", e);
        return DEFAULT_COLORS;
    }
}
