// lib/wpBlockRenderer.ts
// Simple block tree model + renderer for valid Gutenberg block markup.

export type BlockNode = {
    /**
     * Block name, e.g. "core/group", "core/heading", "core/paragraph",
     * "core/buttons", "core/button", "core/navigation", "core/navigation-link"
     */
    name: string;
    /**
     * Attributes passed to the block. This will be JSON.stringified inside
     * the block comment.
     */
    attributes?: Record<string, any>;
    /**
     * Child blocks.
     */
    innerBlocks?: BlockNode[];
};

/**
 * Render a single block node (and its children) as WordPress block markup.
 *
 * Examples of output:
 *   <!-- wp:core/heading {"level":2} -->
 *   <h2>Title</h2>
 *   <!-- /wp:core/heading -->
 *
 *   <!-- wp:core/spacer {"height":"40px"} /-->
 */
export function renderWpBlock(node: BlockNode): string {
    const { name, attributes, innerBlocks } = node;

    if (!name) {
        throw new Error("BlockNode.name is required");
    }

    const attrs =
        attributes && Object.keys(attributes).length > 0
            ? " " + JSON.stringify(attributes)
            : "";

    // Self-closing block (no innerBlocks, no inner content)
    if (!innerBlocks || innerBlocks.length === 0) {
        return `<!-- wp:${name}${attrs} /-->`;
    }

    const children = innerBlocks.map(renderWpBlock).join("");

    return `<!-- wp:${name}${attrs} -->${children}<!-- /wp:${name} -->`;
}

/**
 * Convenience to render an array of blocks at once.
 */
export function renderWpBlocks(blocks: BlockNode[]): string {
    return blocks.map(renderWpBlock).join("");
}
