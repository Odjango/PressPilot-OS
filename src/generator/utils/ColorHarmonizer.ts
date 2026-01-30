import tinycolor from 'tinycolor2';

export interface HarmonizedPalette {
    primary: string;
    primary_light: string;
    primary_dark: string;
    primary_subtle: string;
    secondary: string;
    accent: string;
    main: string;
    base: string;
}

export class ColorHarmonizer {

    /**
     * Generate enterprise-grade color palette from user input
     */
    static generatePalette(primaryHex: string, secondaryHex?: string, accentHex?: string): HarmonizedPalette {
        const primary = tinycolor(primaryHex);

        // 1. Professionalize the primary color
        const hsv = primary.toHsv();
        if (hsv.s > 0.8) {
            hsv.s = 0.8;
            primary.setAlpha(hsv.a);
        }

        // Ensure it's not too light for a "Brand" color
        let contrastRatio = tinycolor.readability(primary.toHexString(), '#ffffff');
        let attempts = 0;
        while (contrastRatio < 4.5 && attempts < 10) {
            primary.darken(5);
            contrastRatio = tinycolor.readability(primary.toHexString(), '#ffffff');
            attempts++;
        }

        primary.setAlpha(hsv.a);

        // 2. Handle secondary and accent accurately
        // Use user-provided colors if available, otherwise generate professional pairings
        const secondary = secondaryHex
            ? tinycolor(secondaryHex).toHexString()
            : primary.clone().complement().toHexString();

        const accent = accentHex
            ? tinycolor(accentHex).toHexString()
            : primary.clone().isDark() ? primary.clone().lighten(25).toHexString() : primary.clone().darken(25).toHexString();

        // 3. Generate functional shades
        const primary_light = primary.clone().lighten(20).toHexString();
        const primary_dark = primary.clone().darken(15).toHexString();
        const primary_subtle = tinycolor(primary.toHexString()).lighten(45).desaturate(30).toHexString();

        return {
            primary: primary.toHexString(),
            primary_light,
            primary_dark,
            primary_subtle,
            secondary,
            accent, // New: Explicitly supporting the 3rd color slug
            main: '#1E1E26',
            base: '#ffffff'
        };
    }

    /**
     * Ensure text on primary is readable
     */
    static getContrastText(background: string): string {
        return tinycolor.readability(background, '#ffffff') > 3 ? '#ffffff' : '#1E1E26';
    }
}
