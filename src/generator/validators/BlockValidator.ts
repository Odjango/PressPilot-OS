import { JSDOM } from 'jsdom';
import { ALLOWED_BLOCKS, FORBIDDEN_BLOCKS } from './blocks/WordPressBlockRegistry';

/**
 * Block Validator using Official WordPress Core + WooCommerce Block Registry
 * Source: src/generator/validators/blocks/WordPressBlockRegistry.ts
 */

export class BlockValidator {

    /**
     * Scans an HTML string (template or pattern) for block comments.
     * Validates against official WordPress + WooCommerce block list.
     * Fails if:
     * 1. Block is not in ALLOWED_BLOCKS
     * 2. Block is in FORBIDDEN_BLOCKS (legacy/classic blocks)
     */
    static validate(htmlContent: string, filename: string): { valid: boolean; error?: string } {
        // Regex to capture <!-- wp:namespace/blockname ... -->
        // or <!-- wp:blockname ... --> (implicit core)
        const blockRegex = /<!--\s*wp:([a-z0-9-]+)\/?([a-z0-9-]+)?/g;

        let match;
        while ((match = blockRegex.exec(htmlContent)) !== null) {
            const fullMatch = match[0];
            const part1 = match[1]; // namespace OR blockname (if core implicit)
            const part2 = match[2]; // blockname (if namespace explicit)

            let namespace = 'core';
            let blockName = part1;

            if (part2) {
                namespace = part1;
                blockName = part2;
            }

            const fullBlockName = `${namespace}/${blockName}`;

            // Check if forbidden (legacy blocks)
            if (FORBIDDEN_BLOCKS.includes(fullBlockName)) {
                return {
                    valid: false,
                    error: `[BlockValidator] Forbidden legacy block detected in ${filename}: '${fullBlockName}'. FSE themes must not use classic/legacy blocks.`
                };
            }

            // Check if allowed
            if (!ALLOWED_BLOCKS.includes(fullBlockName)) {
                return {
                    valid: false,
                    error: `[BlockValidator] Unknown/unsupported block detected in ${filename}: '${fullBlockName}'. Only WordPress Core and WooCommerce blocks are allowed.`
                };
            }
        }

        return { valid: true };
    }
}
