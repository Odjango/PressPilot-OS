/**
 * ContextBuilder - Generator 2.0 Phase 3
 *
 * Builds SectionContext from RenderContext and recipe.
 * Centralizes token resolution and context assembly.
 *
 * The SectionContext provides:
 * - Design tokens resolved for the vertical and brand mode
 * - Original render context (content, heroLayout, etc.)
 * - Section definition from recipe
 * - Recipe metadata
 */

import { getDesignTokens, type BrandMode } from '../design-system';
import type { BrandStyle } from '../types';
import type {
    SectionContext,
    SectionDefinition,
    RenderContext,
    LayoutRecipe
} from './types';

export class ContextBuilder {
    /**
     * Build SectionContext for a section within a recipe.
     *
     * @param section - The section definition from the recipe
     * @param renderContext - Original render context with content and style info
     * @param recipe - The recipe being rendered
     * @returns Fully populated SectionContext
     */
    static buildContext(
        section: SectionDefinition,
        renderContext: RenderContext,
        recipe: LayoutRecipe
    ): SectionContext {
        // Resolve brand mode from render context, default to 'playful'
        const brandMode = (renderContext.brandStyle || 'playful') as BrandMode;

        // Get design tokens for this vertical and brand mode
        const tokens = getDesignTokens(brandMode, recipe.vertical);

        return {
            tokens,
            render: renderContext,
            section,
            recipe: {
                id: recipe.id,
                name: recipe.name,
                vertical: recipe.vertical
            }
        };
    }

    /**
     * Build SectionContext with a specific brand mode override.
     * Useful for testing or previewing different modes.
     *
     * NOTE: Only 'playful' and 'modern' are valid BrandStyle values.
     * Other BrandMode values ('minimal', 'bold') will be cast but may
     * not be recognized by all patterns.
     */
    static buildContextWithMode(
        section: SectionDefinition,
        renderContext: RenderContext,
        recipe: LayoutRecipe,
        brandModeOverride: BrandMode
    ): SectionContext {
        const tokens = getDesignTokens(brandModeOverride, recipe.vertical);

        // Cast BrandMode to BrandStyle for render context
        // Only 'playful' and 'modern' are valid BrandStyle values
        const brandStyle = brandModeOverride as unknown as BrandStyle;

        return {
            tokens,
            render: { ...renderContext, brandStyle },
            section,
            recipe: {
                id: recipe.id,
                name: recipe.name,
                vertical: recipe.vertical
            }
        };
    }
}
