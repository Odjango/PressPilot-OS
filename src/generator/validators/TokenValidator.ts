export class TokenValidator {
    /**
     * Scans content for raw hex codes or pixel values in style attributes or block attributes.
     * 
     * @param content HTML or JSON string
     * @param filename Context for error message
     */
    static validate(content: string, filename: string): { valid: boolean; error?: string } {
        const lines = content.split('\n');

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];

            // Ignore CSS media queries (standard breakpoints often use px)
            if (line.trim().startsWith('@media')) continue;

            // 1. Check for Raw Hex Colors
            const hexRegex = /["':]\s*(#[0-9a-fA-F]{3}|#[0-9a-fA-F]{6})\b/g;
            const hexMatch = hexRegex.exec(line);
            if (hexMatch) {
                // REF: WORDPRESS_FSE_REFERENCE.md - Section 15 & 5
                return {
                    valid: false,
                    error: `[TokenValidator] Raw hex color detected in ${filename} (Line ${i + 1}): '${hexMatch[1]}'. Use theme.json palette tokens instead.`
                };
            }

            // 2. Check for Raw Pixel Values (Strict, except allowed cases)
            const pxRegex = /[:"']\s*(-?\d+)px\b/g;
            let match;
            while ((match = pxRegex.exec(line)) !== null) {
                const val = parseInt(match[1]);
                
                // Allow small values (0px, 1px, 2px)
                if (Math.abs(val) <= 2) continue;
                
                // Allow WordPress layout sizes (contentSize, wideSize) - typically 600px-1400px
                // These are valid FSE layout constraints, not style tokens
                if (line.includes('contentSize') || line.includes('wideSize')) continue;
                
                // Allow common layout breakpoints and max-widths (400px - 1600px range)
                if (val >= 400 && val <= 1600 && (
                    line.includes('layout') || 
                    line.includes('width') ||
                    line.includes('Size')
                )) continue;

                return {
                    valid: false,
                    error: `[TokenValidator] Raw pixel value detected in ${filename} (Line ${i + 1}): '${match[0]}'. Use theme.json spacing/typography tokens.`
                };
            }
        }

        return { valid: true };
    }
}
