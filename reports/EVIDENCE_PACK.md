# Evidence Pack for Final Fix

## Agent A: HTML Writer (Serializer)
**File**: `lib/presspilot/serializer.ts`

### `serializeBlock` (Handles Wrappers)
```typescript
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
        // Join with newlines for readability and strictness
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

    // 5. Wrap Content if Required (The "Attempt Recovery" Fix)
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
        // e.g. <!-- wp:heading -->\n<h2>Text</h2>\n<!-- /wp:heading -->
        return `${openComment}\n${content}\n${closeComment}`;
    }

    // Fallback for container without forced wrapper (should be rare in strict mode)
    // or self-closing if empty?
    if (!content && !wrapper) {
        return `<!-- wp:${commentName}${attrString} /-->`;
    }

    return `${openComment}\n${content}\n${closeComment}`;
}
```

### `serializeLeafContent` (Handles Leaf Tags)
```typescript
function serializeLeafContent(name: string, attrs: Record<string, any>, text: string): string {
    if (name === 'core/heading') {
        const level = attrs.level || 2;
        const cls = attrs.textAlign ? ` class="has-text-align-${attrs.textAlign}"` : '';
        return `<h${level}${cls}>${text}</h${level}>`;
    }
    if (name === 'core/paragraph') {
        const cls = attrs.align ? ` class="has-text-align-${attrs.align}"` : '';
        return `<p${cls}>${text}</p>`;
    }
    if (name === 'core/list-item') {
        return `<li>${text}</li>`;
    }
    if (name === 'core/button') {
        // core/button usually has a wrapper, and then the <a> tag inside.
        // Our BLOCK_WRAPPERS handles the outer div. We return the inner <a> here.
        return `<a class="wp-block-button__link wp-element-button">${text}</a>`;
    }

    return text; // Default fallback
}
```

## Agent B: Relevant Compiler Code
**File**: `lib/presspilot/compiler.ts`

### `compilePricing` (Generates List/Items)
```typescript
function compilePricing(section: Section & { type: 'pricing' }): BlockNode {
    // Similar to Features but 3 cols
    return {
        name: 'core/group',
        attributes: { align: 'full', layout: { type: 'constrained' }, style: { spacing: { padding: { top: 'var(--wp--preset--spacing--60)', bottom: 'var(--wp--preset--spacing--60)' } } } },
        innerBlocks: [
            { name: 'core/heading', attributes: { level: 2, textAlign: 'center' }, textContent: section.heading },
            { name: 'core/paragraph', attributes: { align: 'center' }, textContent: section.subheading },
            {
                name: 'core/columns',
                attributes: { align: 'wide' },
                innerBlocks: section.tiers.map(tier => ({
                    name: 'core/column',
                    attributes: { style: { border: { width: '1px' } } }, // Simplification
                    innerBlocks: [
                        { name: 'core/heading', attributes: { level: 3 }, textContent: tier.name },
                        { name: 'core/heading', attributes: { level: 2 }, textContent: tier.price },
                        { name: 'core/list', innerBlocks: tier.features.map(f => ({ name: 'core/list-item', textContent: f })) },
                        { name: 'core/button', attributes: { width: '100%' }, textContent: tier.cta }
                    ]
                }))
            }
        ]
    };
}
```

### `compileFooter` (Generates Footer Links)
```typescript
    // Col 2: Links
    const linksCol: BlockNode = {
        name: 'core/column',
        attributes: { width: '30%' },
        innerBlocks: layout.footer.columns.flatMap(col => [
            { name: 'core/heading', attributes: { level: 4 }, textContent: col.heading },
            ...col.links.map(link => ({
                name: 'core/paragraph',
                innerHTML: `<p><a href="${link.url}">${link.label}</a></p>`
            }))
        ])
    };
```

## Agent C: Validator Checks
**File**: `validator/presspilot-validator.js`

```javascript
        // Strict Wrapper Enforcement (Agent A Logic)
        const STRICT_CONTAINERS = ['group', 'columns', 'column', 'cover', 'buttons', 'navigation', 'social-links', 'list'];
        const LEAF_WRAPPERS = { // Map block name to expected tag
             'list-item': 'li',
             'paragraph': 'p'
        };
```

## Verification of Output (V2.1 - Current)

### 1. Pricing Bullets (templates/front-page.html)
```html
<!-- wp:list -->
<ul>
<!-- wp:list-item -->
<li>1 brand setup</li>
```
*Status: FIXED (ul and li present)*

### 2. Footer Links (parts/footer.html)
```html
<!-- wp:paragraph -->
<p><a href="/about">About</a></p>
<!-- /wp:paragraph -->
```
*Status: FIXED (p wrapper present)*
