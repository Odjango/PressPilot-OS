
import ColorThief from 'colorthief';
import path from 'path';
import fs from 'fs-extra';

export async function extractBrandColors(imagePath: string): Promise<{ primary: string; secondary: string } | null> {
    try {
        console.log(`[ColorExtractor] Analyzing logo: ${imagePath}`);

        // Ensure file exists
        if (!await fs.pathExists(imagePath)) {
            console.warn(`[ColorExtractor] Logo file not found at ${imagePath}`);
            return null;
        }

        // ColorThief.getColor(image) returns [r, g, b]
        const dominantRGB = await ColorThief.getColor(imagePath);
        const paletteRGB = await ColorThief.getPalette(imagePath, 5); // Get top 5 colors

        const rgbToHex = (r: number, g: number, b: number) =>
            '#' + [r, g, b].map(x => {
                const hex = x.toString(16);
                return hex.length === 1 ? '0' + hex : hex;
            }).join('');

        const primary = rgbToHex(dominantRGB[0], dominantRGB[1], dominantRGB[2]);

        let secondary = '#333333'; // Default dark
        let accent = '#ffffff'; // Default light/white

        if (paletteRGB && paletteRGB.length >= 2) {
            const secRGB = paletteRGB[1];
            secondary = rgbToHex(secRGB[0], secRGB[1], secRGB[2]);
        }

        if (paletteRGB && paletteRGB.length >= 3) {
            const accRGB = paletteRGB[2];
            accent = rgbToHex(accRGB[0], accRGB[1], accRGB[2]);
        } else {
            // Fallback accent if palette is small: Complimentary? Or just distinct.
            // For now, keep it simple.
        }

        console.log(`[ColorExtractor] Extracted Brand Colors: Primary=${primary}, Secondary=${secondary}, Accent=${accent}`);
        return { primary, secondary, accent };

    } catch (error) {
        console.error(`[ColorExtractor] Failed to extract colors:`, error);
        return null; // Fallback to presets
    }
}
