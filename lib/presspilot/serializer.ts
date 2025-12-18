
/**
 * Agent 3: Canonical Serializer
 * 
 * The Single Source of Truth for WordPress Block HTML generation.
 * STRICTLY enforces:
 * 1. Canonical Block Comments <!-- wp:block ... -->
 * 2. Required HTML Wrappers (e.g. <div class="wp-block-group">)
 * 3. No unauthorized HTML injections.
 */

export interface BlockNode {
    name: string;
    attributes?: Record<string, any>;
    innerBlocks?: BlockNode[];
    textContent?: string; // For blocks like paragraph, heading
    innerHTML?: string; // CAREFUL: Only for leaf blocks that require raw HTML
}

// Map of blocks that REQUIRE an HTML wrapper
const BLOCK_WRAPPERS: Record<string, { tag: string; class: string }> = {
    'core/group': { tag: 'div', class: 'wp-block-group' },
    'core/columns': { tag: 'div', class: 'wp-block-columns' },
    'core/column': { tag: 'div', class: 'wp-block-column' },
    'core/cover': { tag: 'div', class: 'wp-block-cover' },
    'core/buttons': { tag: 'div', class: 'wp-block-buttons' },
    'core/button': { tag: 'div', class: 'wp-block-button' },
    'core/navigation': { tag: 'nav', class: 'wp-block-navigation' },
    'core/social-links': { tag: 'ul', class: 'wp-block-social-links' },
    'core/social-link': { tag: 'li', class: 'wp-block-social-link' },
    'core/list': { tag: 'ul', class: '' }, // Standard list wrapper
};

/**
 * Serialize a full AST into a valid HTML string.
 */
export function serialize(nodes: BlockNode[]): string {
    return nodes.map(serializeBlock).join('\n\n');
}

/**
 * Serialize a single block node.
 */
export function serializeBlock(node: BlockNode): string {
    const { name, attributes = {}, innerBlocks = [], textContent, innerHTML } = node;

    // 1. Serialize Attributes
    const attrString = Object.keys(attributes).length > 0
        ? ' ' + JSON.stringify(attributes)
        : '';

    // 2. Determine Wrapper
    const wrapper = BLOCK_WRAPPERS[name];

    // Special handling for Group tagName attribute (e.g. <main>, <header>, <footer>)
    let tagName = wrapper?.tag;
    if (name === 'core/group' && attributes.tagName) {
        tagName = attributes.tagName;
    }
    // Handle ordered lists
    if (name === 'core/list' && attributes.ordered) {
        tagName = 'ol';
    }

    // 3. Construct Opening Comment (Strip 'core/' for cleaner WP style)
    const commentName = name.startsWith('core/') ? name.replace('core/', '') : name;
    const openComment = `<!-- wp:${commentName}${attrString} -->`;
    const closeComment = `<!-- /wp:${commentName} -->`;

    // 4. Construct Content
    let content = '';

    // Handle Inner Blocks
    if (innerBlocks.length > 0) {
        content = innerBlocks.map(serializeBlock).join('\n');
    }
    // Handle Text Content (Leaf Blocks)
    else if (textContent) {
        content = serializeLeafContent(name, attributes, textContent);
    }
    // Handle Raw HTML
    else if (innerHTML) {
        // Safety wrap for paragraphs bypassing textContent
        if (name === 'core/paragraph' && !innerHTML.trim().startsWith('<p')) {
            const cls = attributes.align ? ` class="has-text-align-${attributes.align}"` : '';
            content = `<p${cls}>${innerHTML}</p>`;
        } else {
            content = innerHTML;
        }
    }
    // Handle Navigation Link (Special Case: Attributes -> Content)
    else if (name === 'core/navigation-link') {
        const { label, url } = attributes;
        // Strict markup for Nav Link
        content = `<li class="wp-block-navigation-item wp-block-navigation-link"><a class="wp-block-navigation-item__content" href="${url}"><span class="wp-block-navigation-item__label">${label}</span></a></li>`;
    }

    // 5. Wrap Content if Required
    if (wrapper && tagName) {
        // Merge attributes into classes/styles
        const className = getClassName(wrapper.class, attributes);
        const styleString = getStyleString(attributes);

        const classAttr = className ? ` class="${className}"` : '';
        const openTag = `<${tagName}${classAttr}${styleString}>`;
        const closeTag = `</${tagName}>`;

        // Ensure newlines around content inside wrapper for clean nesting
        const innerContent = content ? `\n${content}\n` : '';

        return `${openComment}\n${openTag}${innerContent}${closeTag}\n${closeComment}`;
    }

    // Leaf block without external wrapper (like paragraph, heading)
    if (textContent) {
        return `${openComment}\n${content}\n${closeComment}`;
    }

    // Fallback for container without forced wrapper 
    if (!content && !wrapper) {
        return `<!-- wp:${commentName}${attrString} /-->`;
    }

    return `${openComment}\n${content}\n${closeComment}`;
}

/**
 * Helper to generate class string from defaults + attributes
 */
function getClassName(baseClass: string, attrs: Record<string, any>): string {
    const classes = baseClass ? [baseClass] : [];

    // Force default layout classes for known flex containers if not explicit
    if (baseClass === 'wp-block-columns' || baseClass === 'wp-block-buttons' || baseClass === 'wp-block-social-links') {
        if (!attrs.layout) {
            classes.push('is-layout-flex');
        }
    }

    if (attrs.align) {
        // Warning: For text blocks, this might need to be intercepted, but for wrappers it's usually alignwide/full
        classes.push(`align${attrs.align}`);
    }
    if (attrs.className) {
        classes.push(attrs.className);
    }
    if (attrs.backgroundColor) {
        classes.push(`has-${attrs.backgroundColor}-background-color`);
        classes.push('has-background');
    }
    if (attrs.textColor) {
        classes.push(`has-${attrs.textColor}-color`);
        classes.push('has-text-color');
    }
    if (attrs.fontSize) {
        classes.push(`has-${attrs.fontSize}-font-size`);
    }
    if (attrs.layout?.type === 'flex') {
        classes.push('is-layout-flex');
    }
    if (attrs.layout?.type === 'constrained') {
        classes.push('is-layout-constrained');
    }
    if (attrs.verticalAlignment) {
        classes.push(`is-vertically-aligned-${attrs.verticalAlignment}`);
    }

    return classes.join(' ');
}

/**
 * Helper to generate inline styles
 */
function getStyleString(attrs: Record<string, any>): string {
    const styles: string[] = [];

    // Core Column Width
    if (attrs.width) {
        styles.push(`flex-basis:${attrs.width}`);
    }

    // Spacing
    if (attrs.style?.spacing?.padding) {
        const p = attrs.style.spacing.padding;
        if (p.top) styles.push(`padding-top:${resolveVar(p.top)}`);
        if (p.bottom) styles.push(`padding-bottom:${resolveVar(p.bottom)}`);
        if (p.left) styles.push(`padding-left:${resolveVar(p.left)}`);
        if (p.right) styles.push(`padding-right:${resolveVar(p.right)}`);
    }

    if (attrs.style?.spacing?.blockGap) {
        styles.push(`gap:${resolveVar(attrs.style.spacing.blockGap)}`);
    }

    if (styles.length === 0) return '';
    return ` style="${styles.join(';')}"`;
}

/**
 * Resolve "var:preset|..." syntax to CSS var()
 * Format: var:preset|{category}|{slug} -> var(--wp--preset--{category}--{slug})
 */
function resolveVar(val: string): string {
    if (val.startsWith('var:preset|')) {
        const parts = val.split('|');
        if (parts.length >= 3) {
            // parts[0] is 'var:preset', parts[1] is category, parts[2] is slug
            const category = parts[1];
            const slug = parts[2];
            return `var(--wp--preset--${category}--${slug})`;
        }
    }
    return val;
}

/**
 * Serialize simple leaf blocks that don't need external wrappers but produce their own tags.
 */
function serializeLeafContent(name: string, attrs: Record<string, any>, text: string): string {
    if (name === 'core/heading') {
        const level = attrs.level || 2;
        // Headings use textAlign attribute, not align
        const textAlign = attrs.textAlign;

        // Use getClassName but filter out 'align' if present to avoid pollution?
        const baseClass = getClassName('wp-block-heading', attrs);
        let classes = baseClass.split(' ').filter(c => !c.startsWith('align'));

        if (textAlign) classes.push(`has-text-align-${textAlign}`);

        const styleString = getStyleString(attrs);
        const clsAttr = classes.length > 0 ? ` class="${classes.join(' ').trim()}"` : '';
        return `<h${level}${clsAttr}${styleString}>${text}</h${level}>`;
    }
    if (name === 'core/paragraph') {
        // Paragraph uses 'align' attribute for text alignment
        const baseClass = getClassName('', attrs);
        let classes = baseClass.split(' ').filter(c => !c.startsWith('align'));

        if (attrs.align) {
            classes.push(`has-text-align-${attrs.align}`);
        }

        const styleString = getStyleString(attrs);
        const clsAttr = classes.length > 0 ? ` class="${classes.join(' ').trim()}"` : '';
        return `<p${clsAttr}${styleString}>${text}</p>`;
    }
    if (name === 'core/list-item') {
        const className = getClassName('', attrs);
        const styleString = getStyleString(attrs);
        const clsAttr = className ? ` class="${className}"` : '';
        return `<li${clsAttr}${styleString}>${text}</li>`;
    }
    if (name === 'core/button') {
        // core/button wrapper is handled by BLOCK_WRAPPERS.
        return `<a class="wp-block-button__link wp-element-button">${text}</a>`;
    }

    return text; // Default fallback
}
