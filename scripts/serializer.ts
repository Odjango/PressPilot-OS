// scripts/serializer.ts

/**
 * STRICT WORDPRESS SERIALIZER (Local Override)
 * Enforces "Core Standard" matching between JSON Brain and HTML Body.
 */

// Map of block names to their HTML tags
const TAG_MAP: Record<string, string> = {
    'core/group': 'div',
    'core/columns': 'div',
    'core/column': 'div',
    'core/cover': 'div',
    'core/image': 'figure',
    'core/heading': 'h2',
    'core/paragraph': 'p',
    'core/list': 'ul',
    'core/list-item': 'li',
    'core/quote': 'blockquote',
    'core/site-title': 'h1',
    'core/site-logo': 'div',
    'core/navigation': 'nav',
    'core/template-part': '!--' // Special case
};

export async function serialize(ast: any): Promise<string> {
    if (!ast) return "";
    
    // Handle array of blocks
    if (Array.isArray(ast)) {
        const results = await Promise.all(ast.map(block => serializeBlock(block)));
        return results.join('\n');
    }
    
    return serializeBlock(ast);
}

async function serializeBlock(block: any): Promise<string> {
    const name = block.blockName || block.name; // Handle potential naming diffs
    if (!name) return "";

    // 1. Sanitize Attributes (The "Brain")
    const attrs = { ...block.attributes };
    
    // REMOVE forbidden classes from JSON to satisfy Validator
    if (attrs.className) {
        attrs.className = attrs.className
            .replace(/is-layout-[\w-]+/g, '')
            .replace(/wp-block-[\w-]+/g, '')
            .trim();
        if (!attrs.className) delete attrs.className;
    }

    // 2. Calculate HTML Classes (The "Body")
    const slug = name.replace('core/', '');
    let htmlClasses = [`wp-block-${slug}`]; // Always add Base Class
    
    // Add Alignment
    if (attrs.align) {
        htmlClasses.push(`align${attrs.align}`);
    }
    
    // Add User Classes
    if (attrs.className) {
        htmlClasses.push(attrs.className);
    }

    // INJECT LAYOUT CLASSES (The "Attempt Recovery" Fix)
    // We manually hydrate these so the Editor recognizes the layout immediately.
    if (attrs.layout) {
        const { type, justifyContent, orientation, flexWrap } = attrs.layout;
        
        if (type === 'flex') htmlClasses.push('is-layout-flex');
        if (type === 'constrained') htmlClasses.push('is-layout-constrained');
        if (type === 'flow') htmlClasses.push('is-layout-flow');
        
        if (justifyContent === 'space-between') htmlClasses.push('is-content-justification-space-between');
        if (justifyContent === 'center') htmlClasses.push('is-content-justification-center');
        if (justifyContent === 'right') htmlClasses.push('is-content-justification-right');
        
        if (orientation === 'vertical') htmlClasses.push('is-vertical');
        if (flexWrap === 'nowrap') htmlClasses.push('is-nowrap');
    }

    const classString = htmlClasses.join(' ');

    // 3. Serialize Inner Blocks (Recursion)
    let innerContent = "";
    if (block.innerBlocks && block.innerBlocks.length > 0) {
        innerContent = await serialize(block.innerBlocks);
    }

    // 4. Construct Final Output
    const jsonString = JSON.stringify(attrs);
    
    // Void Blocks (Self-closing)
    const voidBlocks = ['core/site-title', 'core/site-logo', 'core/template-part', 'core/image'];
    if (voidBlocks.includes(name) && !innerContent) {
        return ``;
    }

    // Container Blocks
    const tagName = TAG_MAP[name] || 'div';
    
    return `<${tagName} class="${classString}">
${innerContent}
</${tagName}>
`;
}