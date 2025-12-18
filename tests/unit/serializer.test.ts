
import { serialize, BlockNode } from '../../lib/presspilot/serializer';
import fs from 'node:fs';
import path from 'node:path';

// --- Test Fixture: AST ---
const exampleAST: BlockNode[] = [
    {
        name: 'core/group',
        attributes: {
            tagName: 'main',
            layout: { type: 'constrained' },
            style: { spacing: { padding: { top: 'var:preset|spacing|50', bottom: 'var:preset|spacing|50' } } }
        },
        innerBlocks: [
            {
                name: 'core/heading',
                attributes: { level: 1, textAlign: 'center' },
                textContent: 'Welcome to Roma Pizza'
            },
            {
                name: 'core/columns',
                attributes: { align: 'wide' },
                innerBlocks: [
                    {
                        name: 'core/column',
                        innerBlocks: [
                            {
                                name: 'core/paragraph',
                                textContent: 'We serve the best pizza in town.'
                            }
                        ]
                    },
                    {
                        name: 'core/column',
                        innerBlocks: [
                            {
                                name: 'core/button',
                                textContent: 'Order Now'
                            }
                        ]
                    }
                ]
            }
        ]
    }
];

// --- Expected Output (Golden) ---
const expectedHTML = `<!-- wp:group {"tagName":"main","layout":{"type":"constrained"},"style":{"spacing":{"padding":{"top":"var:preset|spacing|50","bottom":"var:preset|spacing|50"}}}} -->
<main class="wp-block-group is-layout-constrained" style="padding-top:var(--wp--preset--spacing--50);padding-bottom:var(--wp--preset--spacing--50)">
<!-- wp:heading {"level":1,"textAlign":"center"} -->
<h1 class="has-text-align-center">Welcome to Roma Pizza</h1>
<!-- /wp:heading -->
<!-- wp:columns {"align":"wide"} -->
<div class="wp-block-columns alignwide">
<!-- wp:column -->
<div class="wp-block-column">
<!-- wp:paragraph -->
<p>We serve the best pizza in town.</p>
<!-- /wp:paragraph -->
</div>
<!-- /wp:column -->
<!-- wp:column -->
<div class="wp-block-column">
<!-- wp:button -->
<div class="wp-block-button">
<a class="wp-block-button__link wp-element-button">Order Now</a>
</div>
<!-- /wp:button -->
</div>
<!-- /wp:column -->
</div>
<!-- /wp:columns -->
</main>
<!-- /wp:group -->`;

console.log("Running Serializer Unit Test...");

const actualHTML = serialize(exampleAST);

// Normalize whitespace for comparison (remove newlines for simpler check if strictly formatting differs slightly)
// strictly, our serializer adds \n.
// Let's print output.

if (actualHTML === expectedHTML) { // Requires exact match
    console.log("✅ Serializer Test Passed: Output matches Golden Spec.");
} else {
    console.error("❌ Serializer Test Failed.");
    console.log("--- ACTUAL ---");
    console.log(actualHTML);
    console.log("--- EXPECTED ---");
    console.log(expectedHTML);
    process.exit(1);
}
