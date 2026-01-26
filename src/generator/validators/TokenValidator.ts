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

            // 2. Check for Raw Pixel Values (Strict, except 0-2px)
            const pxRegex = /[:"']\s*(-?\d+)px\b/g;
            let match;
            while ((match = pxRegex.exec(line)) !== null) {
                const val = parseInt(match[1]);
                if (Math.abs(val) <= 2) continue; // Allow 0px, 1px, 2px

                return {
                    valid: false,
                    error: `[TokenValidator] Raw pixel value detected in ${filename} (Line ${i + 1}): '${match[0]}'. Use theme.json spacing/typography tokens.`
                };
            }
        }

        return { valid: true };
    }
}
