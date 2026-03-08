/**
 * WordPress Block Helper Functions
 *
 * Use these helpers to generate valid WordPress block markup.
 * NEVER manually write wp:image or other complex blocks — use createImageBlock().
 */

// =============================================================================
// Token Conversion
// =============================================================================

/**
 * Convert WP block token format to CSS custom property.
 * "var:preset|spacing|70" → "var(--wp--preset--spacing--70)"
 *
 * Handles edge cases:
 * - null/undefined/empty input → warns and returns ''
 * - Already CSS format → returns as-is (idempotent)
 * - Plain values like "100px" → returns unchanged
 */
export function tokenToCSS(token: string): string {
    // Handle null/undefined/empty
    if (!token) {
        console.warn('[tokenToCSS] Received empty/null token');
        return '';
    }

    // Already CSS format? Return as-is (idempotent)
    if (token.startsWith('var(--wp--')) {
        return token;
    }

    // Convert token format to CSS
    if (token.startsWith('var:preset|')) {
        const parts = token.replace('var:preset|', '').split('|');
        return `var(--wp--preset--${parts.join('--')})`;
    }

    // Return unchanged if not a token (e.g., "100px", "8px")
    return token;
}

// =============================================================================
// Image Block Helper
// =============================================================================

export interface ImageBlockOptions {
    src: string;
    alt: string;
    sizeSlug?: 'thumbnail' | 'medium' | 'large' | 'full';
    align?: 'left' | 'center' | 'right' | 'wide' | 'full';
    className?: string;
    borderRadius?: string;
    aspectRatio?: string;
    objectFit?: 'cover' | 'contain' | 'fill';
    linkUrl?: string;
}

/**
 * Generate a valid wp:image block.
 *
 * WordPress block grammar rules enforced:
 * - <img> tag has NO class and NO border-radius/box-shadow style
 * - <figure> tag gets all classes and styles
 * - JSON attributes match HTML attributes exactly
 * - aspect-ratio and object-fit are allowed on <img> (WP 6.3+)
 */
export function createImageBlock(options: ImageBlockOptions): string {
    const {
        src,
        alt,
        sizeSlug = 'large',
        align,
        className,
        borderRadius,
        aspectRatio,
        objectFit,
        linkUrl
    } = options;

    // Build JSON attributes
    const jsonAttrs: Record<string, any> = { sizeSlug };

    if (align) jsonAttrs.align = align;
    if (className) jsonAttrs.className = className;
    if (borderRadius) {
        jsonAttrs.style = { border: { radius: borderRadius } };
    }
    if (aspectRatio) jsonAttrs.aspectRatio = aspectRatio;
    if (objectFit) jsonAttrs.scale = objectFit;

    // Build figure classes
    const figureClasses = ['wp-block-image', `size-${sizeSlug}`];
    if (align) figureClasses.push(`align${align}`);
    if (className) figureClasses.push(className);
    if (borderRadius) figureClasses.push('has-custom-border');

    // Build figure style
    const figureStyles: string[] = [];
    if (borderRadius) figureStyles.push(`border-radius:${tokenToCSS(borderRadius)}`);
    const figureStyle = figureStyles.length ? ` style="${figureStyles.join(';')}"` : '';

    // Build img style (ONLY aspect-ratio and object-fit allowed)
    const imgStyles: string[] = [];
    if (aspectRatio) imgStyles.push(`aspect-ratio:${aspectRatio}`);
    if (objectFit) imgStyles.push(`object-fit:${objectFit}`);
    const imgStyle = imgStyles.length ? ` style="${imgStyles.join(';')}"` : '';

    // Build img tag (NO class, NO border-radius/box-shadow)
    const imgTag = `<img src="${src}" alt="${alt}"${imgStyle}/>`;

    // Wrap in link if provided
    const content = linkUrl ? `<a href="${linkUrl}">${imgTag}</a>` : imgTag;

    return `<!-- wp:image ${JSON.stringify(jsonAttrs)} -->
<figure class="${figureClasses.join(' ')}"${figureStyle}>${content}</figure>
<!-- /wp:image -->`;
}
