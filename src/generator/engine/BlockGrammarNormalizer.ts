import fs from 'fs-extra';
import path from 'path';

export interface NormalizationStats {
    filesScanned: number;
    filesModified: number;
    coverOrderFixes: number;
    spacingFixes: number;
    deprecatedAttrFixes: number;
    contentPositionFixes: number;
    coverImgStyleFixes: number;
    dimRatioRoundingFixes: number;
    shorthandPaddingFixes: number;
}

/**
 * BlockGrammarNormalizer
 *
 * Safety-net normalizer that runs after chassis.load() to fix block grammar
 * issues in base theme patterns. WordPress 6.x expects specific element
 * ordering and attribute formats that older chassis themes may not follow.
 *
 * Fixes:
 * 1. Cover block element order — <img> must come before <span> overlay
 * 2. Spacing format in HTML style attrs — var:preset|spacing|XX → var(--wp--preset--spacing--XX)
 * 3. Deprecated cover attributes — string dimRatio to number, etc.
 */
export class BlockGrammarNormalizer {

    async normalizeAll(themeDir: string): Promise<NormalizationStats> {
        const stats: NormalizationStats = {
            filesScanned: 0,
            filesModified: 0,
            coverOrderFixes: 0,
            spacingFixes: 0,
            deprecatedAttrFixes: 0,
            contentPositionFixes: 0,
            coverImgStyleFixes: 0,
            dimRatioRoundingFixes: 0,
            shorthandPaddingFixes: 0,
        };

        const dirs = ['patterns', 'parts', 'templates'];
        const extensions = ['.php', '.html'];

        for (const dir of dirs) {
            const dirPath = path.join(themeDir, dir);
            if (!await fs.pathExists(dirPath)) continue;

            const files = await fs.readdir(dirPath);
            for (const file of files) {
                if (!extensions.includes(path.extname(file))) continue;

                const filePath = path.join(dirPath, file);
                stats.filesScanned++;

                let content = await fs.readFile(filePath, 'utf8');
                const original = content;

                // Fix 1: Cover block element order (img before span)
                const coverResult = this.fixCoverBlockElementOrder(content);
                content = coverResult.content;
                stats.coverOrderFixes += coverResult.fixes;

                // Fix 2: Spacing format in HTML style attributes
                const spacingResult = this.normalizeSpacingInStyles(content);
                content = spacingResult.content;
                stats.spacingFixes += spacingResult.fixes;

                // Fix 3: Deprecated cover attributes in block comments
                const attrResult = this.fixDeprecatedCoverAttributes(content);
                content = attrResult.content;
                stats.deprecatedAttrFixes += attrResult.fixes;

                // Fix 4: Missing has-custom-content-position on cover blocks
                const posResult = this.fixCoverContentPositionClass(content);
                content = posResult.content;
                stats.contentPositionFixes += posResult.fixes;

                // Fix 5: Remove style="object-fit:cover" from cover block img tags
                const imgStyleResult = this.fixCoverImgObjectFitStyle(content);
                content = imgStyleResult.content;
                stats.coverImgStyleFixes += imgStyleResult.fixes;

                // Fix 6: Fix dimRatio class rounding (WP rounds to nearest 10)
                const dimResult = this.fixDimRatioClassRounding(content);
                content = dimResult.content;
                stats.dimRatioRoundingFixes += dimResult.fixes;

                // Fix 7: Expand shorthand padding to individual properties
                const padResult = this.expandShorthandPadding(content);
                content = padResult.content;
                stats.shorthandPaddingFixes += padResult.fixes;

                // Only write if content changed
                if (content !== original) {
                    await fs.writeFile(filePath, content, 'utf8');
                    stats.filesModified++;
                }
            }
        }

        if (stats.filesModified > 0) {
            console.log(`[BlockGrammarNormalizer] Normalized ${stats.filesModified}/${stats.filesScanned} files ` +
                `(cover-order: ${stats.coverOrderFixes}, spacing: ${stats.spacingFixes}, deprecated: ${stats.deprecatedAttrFixes}, ` +
                `content-pos: ${stats.contentPositionFixes}, img-style: ${stats.coverImgStyleFixes}, dim-round: ${stats.dimRatioRoundingFixes}, pad-expand: ${stats.shorthandPaddingFixes})`);
        }

        return stats;
    }

    /**
     * Fix 1: Cover block element order
     *
     * WordPress 6.5+ canonical save order:
     *   <span ... class="wp-block-cover__background" ...></span>
     *   <img class="wp-block-cover__image-background" .../>
     *
     * Older patterns may have img before span. This swaps to canonical order.
     */
    private fixCoverBlockElementOrder(content: string): { content: string; fixes: number } {
        let fixes = 0;

        // Match: <img...wp-block-cover__image-background.../> followed by <span...wp-block-cover__background...></span>
        // The img and span may be on multiple lines with whitespace between them
        const pattern = /(<img[^>]*class="wp-block-cover__image-background[^"]*"[^>]*\/>\s*)(<span[^>]*class="wp-block-cover__background[^"]*"[^>]*><\/span>)/g;

        content = content.replace(pattern, (_match, imgPart: string, spanPart: string) => {
            fixes++;
            return spanPart.trim() + '\n    ' + imgPart.trim();
        });

        // Also handle multi-line span (aria-hidden on separate line)
        const multiLinePattern = /(<img\s+class="wp-block-cover__image-background[^"]*"[^>]*\/>\s*)(<span\s+aria-hidden="true"\s*\n?\s*class="wp-block-cover__background[^"]*"[^>]*><\/span>)/g;

        content = content.replace(multiLinePattern, (_match, imgPart: string, spanPart: string) => {
            fixes++;
            return spanPart.trim() + '\n    ' + imgPart.trim();
        });

        return { content, fixes };
    }

    /**
     * Fix 2: Normalize spacing format in HTML style attributes
     *
     * In block comments (JSON), var:preset|spacing|XX is correct.
     * In HTML style="" attributes, it must be var(--wp--preset--spacing--XX).
     *
     * This only fixes occurrences inside style="..." attributes, not block comments.
     */
    private normalizeSpacingInStyles(content: string): { content: string; fixes: number } {
        let fixes = 0;

        // Match style="..." attributes and fix var:preset| tokens inside them
        content = content.replace(/style="([^"]*)"/g, (_match, styleValue: string) => {
            const fixed = styleValue.replace(
                /var:preset\|([a-z-]+)\|([a-z0-9-]+)/g,
                (_m: string, category: string, value: string) => {
                    fixes++;
                    return `var(--wp--preset--${category}--${value})`;
                }
            );
            return `style="${fixed}"`;
        });

        return { content, fixes };
    }

    /**
     * Fix 3: Deprecated cover block attributes
     *
     * Normalizes block comment JSON attributes:
     * - "min-height" → "minHeight" (camelCase)
     * - "dimRatio":"60" → "dimRatio":60 (string to number)
     * - "focalPoint":{"x":"0.5","y":"0.5"} → numeric values
     */
    private fixDeprecatedCoverAttributes(content: string): { content: string; fixes: number } {
        let fixes = 0;

        // Fix min-height → minHeight in block comment JSON (only inside wp:cover comments)
        content = content.replace(
            /(<!-- wp:cover \{[^}]*)"min-height"(\s*:\s*\d+)/g,
            (_match, before: string, after: string) => {
                fixes++;
                return `${before}"minHeight"${after}`;
            }
        );

        // Fix string dimRatio to number: "dimRatio":"60" → "dimRatio":60
        content = content.replace(
            /"dimRatio"\s*:\s*"(\d+)"/g,
            (_match, num: string) => {
                fixes++;
                return `"dimRatio":${num}`;
            }
        );

        // Fix string focalPoint values to numbers
        content = content.replace(
            /"focalPoint"\s*:\s*\{\s*"x"\s*:\s*"([0-9.]+)"\s*,\s*"y"\s*:\s*"([0-9.]+)"\s*\}/g,
            (_match, x: string, y: string) => {
                fixes++;
                return `"focalPoint":{"x":${x},"y":${y}}`;
            }
        );

        return { content, fixes };
    }

    /**
     * Fix 4: Missing has-custom-content-position class on cover blocks
     *
     * When a cover block has contentPosition set to anything other than
     * "center center" (the default), WordPress's save() function adds
     * both `is-position-{position}` AND `has-custom-content-position`.
     * Older chassis patterns may omit the latter.
     */
    private fixCoverContentPositionClass(content: string): { content: string; fixes: number } {
        let fixes = 0;

        // Find cover blocks with contentPosition in JSON
        const coverRegex = /<!--\s*wp:cover\s+\{[^}]*"contentPosition"\s*:\s*"([^"]+)"[^}]*\}\s*-->\s*\n\s*<div([^>]*)>/g;
        content = content.replace(coverRegex, (match, position: string, divAttrs: string) => {
            // "center center" is the default — no class needed
            if (position === 'center center') return match;

            // Check if has-custom-content-position is already present
            if (divAttrs.includes('has-custom-content-position')) return match;

            // Check if there's an is-position- class to insert before
            const posClassMatch = divAttrs.match(/(class="[^"]*)(is-position-)/);
            if (posClassMatch) {
                fixes++;
                const newAttrs = divAttrs.replace(
                    /(class="[^"]*)(is-position-)/,
                    '$1has-custom-content-position $2'
                );
                return match.replace(divAttrs, newAttrs);
            }

            return match;
        });

        return { content, fixes };
    }

    /**
     * Fix 5: Remove style="object-fit:cover" from cover block img tags
     *
     * WordPress's cover block save() does NOT produce `style="object-fit:cover"`
     * on the img element. The object-fit CSS is applied via WP's block stylesheet.
     * Only `data-object-fit="cover"` should remain on the img.
     */
    private fixCoverImgObjectFitStyle(content: string): { content: string; fixes: number } {
        let fixes = 0;

        // Match img tags with wp-block-cover__image-background class that have style="object-fit:cover"
        content = content.replace(
            /(<img[^>]*class="wp-block-cover__image-background[^"]*"[^>]*) style="object-fit:cover"([^>]*\/>)/g,
            (_match, before: string, after: string) => {
                fixes++;
                return `${before}${after}`;
            }
        );

        return { content, fixes };
    }

    /**
     * Fix 6: Fix dimRatio class rounding on cover block overlay spans
     *
     * WordPress rounds dimRatio to the nearest 10 for the CSS class:
     *   `has-background-dim-${Math.round(dimRatio / 10) * 10}`
     * e.g., dimRatio:75 → has-background-dim-80 (not 75)
     *
     * This checks cover blocks where JSON dimRatio doesn't match the rounded class.
     */
    private fixDimRatioClassRounding(content: string): { content: string; fixes: number } {
        let fixes = 0;

        // Find cover blocks with dimRatio in JSON, then check the span class
        const coverRegex = /<!--\s*wp:cover\s+\{[^}]*"dimRatio"\s*:\s*(\d+)[^}]*\}\s*-->[\s\S]*?<span[^>]*class="(wp-block-cover__background[^"]*)"[^>]*><\/span>/g;
        content = content.replace(coverRegex, (match, dimRatioStr: string) => {
            const dimRatio = parseInt(dimRatioStr);
            const rounded = Math.round(dimRatio / 10) * 10;
            if (dimRatio === rounded) return match; // Already correct

            const wrongClass = `has-background-dim-${dimRatio}`;
            const rightClass = `has-background-dim-${rounded}`;

            if (match.includes(wrongClass)) {
                fixes++;
                return match.replace(wrongClass, rightClass);
            }
            return match;
        });

        return { content, fixes };
    }
    /**
     * Fix 7: Expand CSS shorthand padding to individual properties
     *
     * WordPress block supports always generates individual padding properties:
     *   padding-top, padding-right, padding-bottom, padding-left
     * Never shorthand like `padding: X` or `padding: X Y`.
     * Using shorthand causes block validation mismatch → "Attempt Recovery".
     *
     * This expands `padding:VALUE` (single value) to four individual properties.
     */
    private expandShorthandPadding(content: string): { content: string; fixes: number } {
        let fixes = 0;

        // Match style="..." attributes containing shorthand padding
        // Only match `padding:VALUE` where VALUE is a single token (not already individual)
        // Avoid matching padding-top, padding-right, padding-bottom, padding-left
        content = content.replace(/style="([^"]*)"/g, (_match, styleValue: string) => {
            // Check if there's a shorthand padding (padding: followed by a single value, not padding-top/right/bottom/left)
            const shorthandMatch = styleValue.match(/(^|;)\s*padding\s*:\s*([^;]+?)(?=;|$)/);
            if (!shorthandMatch) return _match;

            const paddingValue = shorthandMatch[2].trim();

            // Skip if it looks like multi-value shorthand (e.g., "2rem 1.5rem")
            // Only handle single-value shorthand where all 4 sides are the same
            if (paddingValue.includes(' ')) return _match;

            // Skip if individual padding properties already exist
            if (styleValue.includes('padding-top:') || styleValue.includes('padding-bottom:')) {
                return _match;
            }

            fixes++;
            const expanded = `padding-top:${paddingValue};padding-right:${paddingValue};padding-bottom:${paddingValue};padding-left:${paddingValue}`;
            const fixed = styleValue.replace(/(^|;)\s*padding\s*:\s*[^;]+/, `$1${expanded}`);
            return `style="${fixed}"`;
        });

        return { content, fixes };
    }
}

/**
 * Convenience function for pipeline integration.
 */
export async function normalizeBlockGrammar(themeDir: string): Promise<NormalizationStats> {
    const normalizer = new BlockGrammarNormalizer();
    return normalizer.normalizeAll(themeDir);
}
