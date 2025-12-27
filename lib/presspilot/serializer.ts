/**
 * Agent 3: Canonical Serializer (Official WordPress Implementation)
 * 
 * Uses @wordpress/blocks to generate strictly compliant block markup.
 * Requires JSDOM polyfill in Node.js environment.
 */

// Types only - safe for build time
import type { BlockInstance } from '@wordpress/blocks';

export interface BlockNode {
    name: string; // Full name e.g. 'core/group'
    attributes?: Record<string, any>;
    innerBlocks?: BlockNode[];
    textContent?: string;
    innerHTML?: string;
}

type WpDeps = {
    createBlock: any;
    validateBlock: any;
    wpSerialize: any;
    parse: any;
};

/**
 * Serialize a full AST into a valid HTML string using official WP serialization.
 * Async because it lazy-loads the heavy WordPress environment to avoid build-time React conflicts.
 */
export async function serialize(nodes: BlockNode[]): Promise<string> {
    // 1. Shim Browser Environment
    const { shim } = await import('./polyfill');
    shim();

    const wpData = await import('@wordpress/data');

    // 2. Load WP Dependencies (Dynamically)
    const { registerCoreBlocks } = await import('@wordpress/block-library');
    const { createBlock, serialize: wpSerialize, validateBlock } = await import('@wordpress/blocks');
    const { parse } = await import('@wordpress/block-serialization-default-parser');

    registerCoreBlocks();

    // Fix: Inject Settings (Dispatch attempt as last resort)
    if (wpData && wpData.dispatch) {
        try {
            const editorDispatch = wpData.dispatch('core/block-editor');
            if (editorDispatch) {
                editorDispatch.updateSettings({
                    alignWide: true,
                    supportsLayout: true,
                    imageEditing: true,
                    __experimentalFeatures: {
                        color: { text: true, background: true },
                        spacing: { padding: true, margin: true, blockGap: true }
                    }
                });
            }
        } catch (e) { /* ignore */ }
    }

    const deps: WpDeps = { createBlock, validateBlock, wpSerialize, parse };

    // 3. Create Blocks Recursive
    const blocks = nodes.map(node => createWpBlock(node, deps)).filter(Boolean) as BlockInstance[];

    // 4. Serialize with Fallback (Rescue Mission + Class Injection)
    const serialized = blocks.map(b => safeSerialize(b, deps)).join('\n\n');
    return sanitizeBlockHTML(serialized);
}

/**
 * Safe Serializer: 
 * 1. Ensures containers are never self-closing if they have children.
 * 2. Injects mandatory 'wp-block-{slug}' classes into HTML.
 * 3. Injects 'align{val}' classes into HTML (from hidden _internal_align).
 * 4. STRICTLY DOES NOT inject 'is-layout-*' classes (Core Standard).
 */
function safeSerialize(block: BlockInstance, deps: WpDeps): string {
    const { wpSerialize } = deps;
    let raw = wpSerialize([block]);

    // Check if it failed (Self-closing tag on a container that has children)
    const isSelfClosing = raw.trim().endsWith('/-->');
    const hasChildren = block.innerBlocks && block.innerBlocks.length > 0;

    // We only patch 'core/group', 'core/columns', 'core/column', 'core/cover' etc if they broke
    const patchable = ['core/group', 'core/columns', 'core/column', 'core/cover'].includes(block.name);

    // Calculate Base Class (e.g. wp-block-group)
    const slug = block.name.replace('core/', '');
    const baseClass = `wp-block-${slug}`;

    // Calculate Align Class (from internal prop)
    // We moved 'align' to '_internal_align' in createWpBlock
    let alignClass = '';
    if (block.attributes._internal_align) {
        alignClass = `align${block.attributes._internal_align}`;
    }

    // Combine classes to inject
    // NOTE: We deliberately EXCLUDE layout classes per user request ("Revert to Core Standard")
    const classesToInject = [baseClass, alignClass].filter(Boolean).join(' ');

    if (isSelfClosing && hasChildren && patchable) {
        // RESCUE MISSION: Manually reconstruct the wrapper
        // 1. Convert opening comment: <!-- wp:name {...} /--> to <!-- wp:name {...} -->
        const openingComment = raw.replace(' /-->', ' -->');

        // 2. Determine wrapper tag
        const tagName = block.attributes.tagName || 'div';

        // 3. Determine classes (Mix of injected classes + allowed attributes)
        let className = block.attributes.className || '';

        if (classesToInject) {
            className = `${classesToInject} ${className}`.trim();
        }

        // 4. Construct wrapper
        const openTag = className ? `<${tagName} class="${className}">` : `<${tagName}>`;
        const closeTag = `</${tagName}>`;

        // 5. Recursively serialize children
        const innerContent = block.innerBlocks.map(child => safeSerialize(child, deps)).join('');

        // 6. Assemble
        // Note: 'raw' used for comment might contain 'className'. We cleaned it in createWpBlock.
        // We do NOT want to put _internal_align in the JSON comment. 
        // createWpBlock put it in attributes, so wpSerialize *might* have put it in JSON if strict mode didn't strip it.
        // But wpSerialize for 'core/group' likely ignores unknown attrs or we might see it.
        // If we see `_internal_align` in JSON, we should strip it. 
        // regex replace `"_internal_align":"..."`?
        let finalComment = openingComment;
        if (finalComment.includes('_internal_align')) {
            finalComment = finalComment.replace(/,"_internal_align":"[^"]*"/, '').replace(/"_internal_align":"[^"]*",/, '');
        }

        return `${finalComment}\n${openTag}${innerContent}${closeTag}\n<!-- /wp:${block.name.replace('core/', '')} -->`;
    }

    // STANDARD PATH: HTML was generated by wpSerialize, but we must ensure base/align classes exist in HTML
    if (classesToInject && block.name.startsWith('core/')) {

        const commentEnd = raw.indexOf('-->');
        if (commentEnd !== -1) {
            let comment = raw.substring(0, commentEnd + 3);
            let content = raw.substring(commentEnd + 3);

            // Strip _internal_align from comment if present
            if (comment.includes('_internal_align')) {
                comment = comment.replace(/,"_internal_align":"[^"]*"/, '').replace(/"_internal_align":"[^"]*",/, '');
            }

            // Inject logic: Look for first tag's class attribute or create it
            if (/class=['"]/.test(content)) {
                // Prepend classes inside existing attribute
                content = content.replace(/class=(['"])/, `class=$1${classesToInject} `);
            } else {
                // Inject attribute into first tag
                const match = content.match(/<([a-z0-9]+)(\s|>)/i);
                if (match) {
                    const tag = match[1];
                    content = content.replace(`<${tag}`, `<${tag} class="${classesToInject}"`);
                }
            }
            return comment + content;
        }
    }

    return raw;
}

/**
 * Sanitizer Guardrail: Prevents "Attempt Recovery" errors.
 * Replaces whitespace between tags with empty string.
 */
function sanitizeBlockHTML(html: string): string {
    return html.replace(/>\s+</g, '><').trim();
}

/**
 * recursive factory to create WP Block Objects
 */
function createWpBlock(node: BlockNode, deps: WpDeps): BlockInstance | null {
    const { name, attributes = {}, innerBlocks = [], textContent, innerHTML } = node;
    const { createBlock } = deps;

    // 1. Prepare Attributes
    const finalAttributes = { ...attributes };

    // 2. Map 'textContent' to block-specific attributes
    if (textContent) {
        if (name === 'core/paragraph' || name === 'core/heading' || name === 'core/list-item') {
            finalAttributes.content = textContent;
        } else if (name === 'core/button') {
            finalAttributes.text = textContent;
        } else if (name === 'core/image') {
            finalAttributes.caption = textContent;
        } else {
            finalAttributes.content = textContent;
        }
    }

    // 3. Handle innerHTML
    if (innerHTML) {
        if (name === 'core/paragraph' || name === 'core/heading') {
            finalAttributes.content = innerHTML;
        }
    }

    // 4. Align Handling (Crash Prevention & Data Preservation)
    // We move 'align' to '_internal_align' so it doesn't crash the serializer 
    // but we can still access it in safeSerialize to inject the class.
    if (finalAttributes.align) {
        finalAttributes._internal_align = finalAttributes.align;
        delete finalAttributes.align;
    }

    // 5. Forbidden Class Filter (Clean JSON)
    // Remove system classes from attributes so they don't appear in JSON.
    if (finalAttributes.className) {
        const forbidden = [
            'wp-block-group', 'wp-block-columns', 'wp-block-column', 'wp-block-cover',
            'is-layout-flex', 'is-layout-constrained', 'is-layout-flow',
            'is-content-justification-center', 'is-content-justification-space-between',
            'is-content-justification-right', 'is-content-justification-left',
            'is-nowrap', 'is-vertical',
            'alignwide', 'alignfull'
        ];

        finalAttributes.className = finalAttributes.className
            .split(' ')
            .filter(c => !forbidden.some(f => c === f || c.startsWith('wp-block-')))
            .join(' ')
            .trim();

        if (!finalAttributes.className) delete finalAttributes.className;
    }

    // 6. Create Inner Blocks
    const childBlocks = innerBlocks.map(child => createWpBlock(child, deps)).filter(Boolean) as BlockInstance[];

    // 7. Create Block
    try {
        return createBlock(name, finalAttributes, childBlocks);
    } catch (e) {
        console.error(`Failed to create block ${name}:`, e);
        return null; // Skip invalid blocks
    }
}
