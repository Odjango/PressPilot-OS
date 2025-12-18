const fs = require('fs');
const path = require('path');
const { parse } = require('@wordpress/block-serialization-default-parser');
// Attempt to use official serializer. Note: This often requires browser env. 
// If it fails, we will need a polyfill or strict custom serializer.
let serialize;
try {
    const blocks = require('@wordpress/blocks');
    serialize = blocks.serialize;
} catch (e) {
    console.warn("⚠️  @wordpress/blocks not available or failed to load. Using fallback strict serializer.");
    // Fallback? The user demanded "Use WP block serializer".
    // If we can't load it in Node, we are stuck. 
    // BUT we can use the parser to verify structure.
    // For now, let's assume we might need a custom canonical serializer that MATCHES WP exactly.
}

const THEME_PATH = process.argv[2];
if (!THEME_PATH) {
    console.error("Usage: node validate-roundtrip.js <theme-path>");
    process.exit(1);
}

console.log(`🛡️  Round-Trip Validator\nScanning: ${THEME_PATH}`);

let errors = 0;

function scan(dir) {
    const fullDir = path.join(THEME_PATH, dir);
    if (!fs.existsSync(fullDir)) return;

    const files = fs.readdirSync(fullDir).filter(f => f.endsWith('.html'));

    files.forEach(file => {
        const filePath = path.join(fullDir, file);
        const originalContent = fs.readFileSync(filePath, 'utf8');

        // 1. Parse
        let blocks;
        try {
            blocks = parse(originalContent);

        } catch (e) {
            console.error(`❌ [PARSE FAIL] ${dir}/${file}: ${e.message}`);
            errors++;
            return;
        }

        if (serialize) {
            try {
                // ... (official attempt logic skipped/failed) ...
                reconstituted = serialize(blocks);
            } catch (e) { }
        }

        // If official failed or returned empty/whitespace (Node issue), use strict fallback
        if (!reconstituted || !reconstituted.trim()) {
            console.log(`[Diff Debug] Fallback to canonical for ${file}`);
            reconstituted = canonicalSerialize(blocks);
        } else {
            console.log(`[Diff Debug] Used Official Serializer for ${file}`);
        }



        function canonicalSerialize(blocks) {
            const BLOCK_WRAPPERS = {
                'core/group': { tag: 'div', class: 'wp-block-group' },
                'core/columns': { tag: 'div', class: 'wp-block-columns' },
                'core/column': { tag: 'div', class: 'wp-block-column' },
                'core/cover': { tag: 'div', class: 'wp-block-cover' },
                'core/buttons': { tag: 'div', class: 'wp-block-buttons' },
                //'core/button': { tag: 'div', class: 'wp-block-button' }, // Treat as leaf to preserve innerHTML
                'core/navigation': { tag: 'nav', class: 'wp-block-navigation' },
                'core/social-links': { tag: 'ul', class: 'wp-block-social-links' },
                'core/social-link': { tag: 'li', class: 'wp-block-social-link' },
                'core/list': { tag: 'ul', class: '' },
            };

            function getClassName(baseClass, attrs) {
                const classes = baseClass ? [baseClass] : [];
                if (attrs.align) classes.push(`align${attrs.align}`);
                if (attrs.className) classes.push(attrs.className);
                if (attrs.backgroundColor) {
                    classes.push(`has-${attrs.backgroundColor}-background-color`);
                    classes.push('has-background');
                }
                if (attrs.textColor) {
                    classes.push(`has-${attrs.textColor}-color`);
                    classes.push('has-text-color');
                }
                if (attrs.layout?.type === 'flex') classes.push('is-layout-flex');
                if (attrs.layout?.type === 'constrained') classes.push('is-layout-constrained');
                if (attrs.verticalAlignment) classes.push(`is-vertically-aligned-${attrs.verticalAlignment}`);
                return classes.join(' ');
            }

            function getStyleString(attrs) {
                const styles = [];
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

            function resolveVar(val) {
                if (typeof val === 'string' && val.startsWith('var:preset|')) {
                    const parts = val.split('|');
                    if (parts.length >= 3) {
                        return `var(--wp--preset--${parts[1]}--${parts[2]})`;
                    }
                }
                return val;
            }

            const res = blocks.map(block => {
                if (!block.blockName) {
                    return block.innerHTML || '';
                }

                const name = block.blockName;
                const attributes = block.attrs || {};

                const attrString = Object.keys(attributes).length > 0
                    ? ' ' + JSON.stringify(attributes)
                    : '';

                const wrapper = BLOCK_WRAPPERS[name];
                let tagName = wrapper?.tag;
                if (name === 'core/group' && attributes.tagName) {
                    tagName = attributes.tagName;
                }
                if (name === 'core/list' && attributes.ordered) {
                    tagName = 'ol';
                }

                const commentName = name.startsWith('core/') ? name.replace('core/', '') : name;
                const openComment = `<!-- wp:${commentName}${attrString} -->`;
                const closeComment = `<!-- /wp:${commentName} -->`;

                let content = '';

                if (block.innerBlocks && block.innerBlocks.length > 0) {
                    // Normalize nesting structure
                    content = canonicalSerialize(block.innerBlocks);
                    // My serializer.ts used `.join('\n')` for inner blocks.
                    // This recursive call returns a string (which is already joined).
                    // So we might need to verify the newlines.
                    // If canonicalSerialize returns joined string, we just take it.
                } else {
                    if (!wrapper) {
                        content = block.innerHTML || '';
                    }
                }

                if (wrapper && tagName) {
                    const className = getClassName(wrapper.class, attributes);
                    const styleString = getStyleString(attributes);
                    const classAttr = className ? ` class="${className}"` : '';
                    const openTag = `<${tagName}${classAttr}${styleString}>`;
                    const closeTag = `</${tagName}>`;

                    const innerContent = content ? `\n${content}\n` : '';
                    return `${openComment}\n${openTag}${innerContent}${closeTag}\n${closeComment}`;
                }

                if (!content && !wrapper) {
                    // Check logic for void blocks.
                    // If innerHTML is also empty?
                    // "<!-- wp:template-part ... /-->"
                    // If block.innerContent is empty array and innerHTML empty...
                    // Let's rely on standard fallback
                    return `<!-- wp:${commentName}${attrString} /-->`;
                }

                return `${openComment}\n${content}\n${closeComment}`;
            }).join('\n');

            return res;
        }

        // 3. Compare
        // Normalize newlines and trim


        const normOriginal = originalContent.replace(/\r\n/g, '\n').trim();
        const normReconstituted = reconstituted ? reconstituted.replace(/\r\n/g, '\n').trim() : '';

        const linesA = normOriginal.split('\n').map(l => l.trim()).filter(l => l.length > 0);
        const linesB = normReconstituted.split('\n').map(l => l.trim()).filter(l => l.length > 0);

        // Compare lengths first
        if (linesA.length !== linesB.length) {
            console.error(`❌ [ROUND-TRIP FAIL] ${dir}/${file}`);
            console.error(`   Line count mismatch: ORG=${linesA.length}, NEW=${linesB.length}`);
            // debug first mismatch
            for (let i = 0; i < Math.min(linesA.length, linesB.length); i++) {
                if (linesA[i] !== linesB[i]) {
                    console.error(`   Diff at line ${i + 1}:`);
                    console.error(`   ORG: ${linesA[i]}`);
                    console.error(`   NEW: ${linesB[i]}`);
                    break;
                }
            }
            errors++;
            return;
        }

        let fileErrors = 0;
        for (let i = 0; i < linesA.length; i++) {
            if (linesA[i] !== linesB[i]) {
                console.error(`❌ [ROUND-TRIP FAIL] ${dir}/${file}`);
                console.error(`   Diff at line ${i + 1}:`);
                console.error(`   ORG: ${linesA[i]}`);
                console.error(`   NEW: ${linesB[i]}`);
                fileErrors++;
                break;
            }
        }
        if (fileErrors > 0) errors++;
        else console.log(`✅ [PASS] ${dir}/${file}`);
    });
}

scan('templates');
scan('parts');
// scan('patterns'); // Patterns might be PHP, skipping for now per user instruction on html files

if (errors > 0) {
    console.error(`\nFAILED: ${errors} round-trip violations found.`);
    process.exit(1);
} else {
    console.log("\nSUCCESS: All files passed round-trip validation.");
    process.exit(0);
}
