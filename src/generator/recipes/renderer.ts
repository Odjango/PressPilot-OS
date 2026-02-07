/**
 * SectionRenderer - Generator 2.0 Phase 2 + Phase 3
 *
 * Maps section types to their rendering functions.
 * This is the bridge between declarative recipes and
 * imperative section pattern generators.
 *
 * Phase 3 additions:
 * - V2 renderers that use SectionContext for token-driven styling
 * - renderSectionsWithRecipe() method for recipe-aware rendering
 * - ContextBuilder integration for SectionContext creation
 *
 * IMPORTANT: This maintains exact compatibility with current output.
 * Any changes must be validated with E2E screenshot comparison.
 */

import type {
    SectionDefinition,
    SectionType,
    SectionContext,
    RenderContext,
    LayoutRecipe
} from './types';
import { ContextBuilder } from './context-builder';

// Import all section renderers (Phase 2 legacy)
import { getHeroByLayout } from '../patterns/hero-variants';
import {
    getRestaurantStorySection,
    getRestaurantMenuPreviewSection,
    getRestaurantPromoBandSection,
    getSocialProofSection,
    getFinalCTASection,
    // Phase 3 WithContext variants
    getRestaurantStorySectionWithContext,
    getRestaurantMenuPreviewSectionWithContext,
    getRestaurantPromoBandSectionWithContext,
    getSocialProofSectionWithContext,
    getFinalCTASectionWithContext,
    // Phase 4 Ecommerce sections
    getEcommerceHeroSectionWithContext,
    getEcommerceCategoryGridSectionWithContext,
    getEcommerceFeaturedProductsSectionWithContext,
    getEcommerceTrustBadgesSectionWithContext,
    getEcommerceNewsletterSectionWithContext
} from '../patterns/sections';

// =============================================================================
// Phase 2 Section Renderer Mapping (Legacy)
// =============================================================================

/**
 * Section renderer function signature (Phase 2).
 */
type SectionRendererFn = (
    section: SectionDefinition,
    context: RenderContext
) => string;

/**
 * Registry of section type to renderer function.
 *
 * Each renderer receives the section definition and context,
 * then calls the appropriate pattern function with the right parameters.
 *
 * NOTE: Phase 2 implementations ignore section.backgroundColor as
 * the patterns hardcode their own backgrounds.
 */
const SECTION_RENDERERS: Record<SectionType, SectionRendererFn> = {
    // Restaurant sections
    'hero': (_section, ctx) => {
        return getHeroByLayout(ctx.heroLayout, ctx.content);
    },

    'story': (_section, ctx) => {
        return getRestaurantStorySection(ctx.content, ctx.brandStyle);
    },

    'menu-preview': (_section, ctx) => {
        return getRestaurantMenuPreviewSection(ctx.content, ctx.brandStyle);
    },

    'promo-band': (_section, ctx) => {
        return getRestaurantPromoBandSection(ctx.content, ctx.brandStyle);
    },

    'testimonials': (_section, ctx) => {
        return getSocialProofSection(ctx.content, ctx.industry);
    },

    'final-cta': (_section, ctx) => {
        return getFinalCTASection(ctx.content, ctx.industry);
    },

    'footer': (_section, _ctx) => {
        // Footer is handled separately by template-part injection
        // See PatternInjector.injectGlobalParts()
        return '';
    },

    // Ecommerce sections - Phase 2 legacy stubs (use V2 renderers via renderSectionsWithRecipe)
    'ecommerce-hero': () => '',
    'category-grid': () => '',
    'featured-products': () => '',
    'trust-badges': () => '',
    'newsletter': () => ''
};

// =============================================================================
// Phase 3 Section Renderer Mapping (Token-Aware)
// =============================================================================

/**
 * Section renderer function signature (Phase 3).
 * Uses SectionContext for token-driven styling.
 */
type SectionRendererFnV2 = (context: SectionContext) => string;

/**
 * V2 Registry - uses SectionContext for token-driven styling.
 *
 * Phase 3: These renderers receive full context with design tokens,
 * enabling consistent styling across brand modes without hardcoded values.
 */
const SECTION_RENDERERS_V2: Record<SectionType, SectionRendererFnV2> = {
    // Restaurant sections
    'hero': (ctx) => {
        // Hero still uses legacy function (complex, multiple layouts)
        return getHeroByLayout(ctx.render.heroLayout, ctx.render.content);
    },

    'story': (ctx) => {
        return getRestaurantStorySectionWithContext(ctx);
    },

    'menu-preview': (ctx) => {
        return getRestaurantMenuPreviewSectionWithContext(ctx);
    },

    'promo-band': (ctx) => {
        return getRestaurantPromoBandSectionWithContext(ctx);
    },

    'testimonials': (ctx) => {
        return getSocialProofSectionWithContext(ctx);
    },

    'final-cta': (ctx) => {
        return getFinalCTASectionWithContext(ctx);
    },

    'footer': (_ctx) => {
        // Footer is handled separately by template-part injection
        return '';
    },

    // Ecommerce sections (Phase 4)
    'ecommerce-hero': (ctx) => {
        return getEcommerceHeroSectionWithContext(ctx);
    },

    'category-grid': (ctx) => {
        return getEcommerceCategoryGridSectionWithContext(ctx);
    },

    'featured-products': (ctx) => {
        return getEcommerceFeaturedProductsSectionWithContext(ctx);
    },

    'trust-badges': (ctx) => {
        return getEcommerceTrustBadgesSectionWithContext(ctx);
    },

    'newsletter': (ctx) => {
        return getEcommerceNewsletterSectionWithContext(ctx);
    }
};

// =============================================================================
// SectionRenderer Class
// =============================================================================

export class SectionRenderer {
    // =========================================================================
    // Phase 3 Methods (Token-Aware)
    // =========================================================================

    /**
     * Phase 3: Render sections with full recipe context.
     *
     * This method builds SectionContext for each section, enabling
     * token-driven styling. Preferred for recipe-driven rendering.
     *
     * @param recipe - The recipe being rendered
     * @param renderContext - Original render context with content and style info
     * @returns Concatenated HTML string of all sections
     */
    static renderSectionsWithRecipe(
        recipe: LayoutRecipe,
        renderContext: RenderContext
    ): string {
        return recipe.sections
            .map(section => {
                const ctx = ContextBuilder.buildContext(section, renderContext, recipe);
                return this.renderSectionV2(ctx);
            })
            .filter(html => html.length > 0)
            .join('\n\n');
    }

    /**
     * Phase 3: Render a single section with SectionContext.
     *
     * @param context - Full SectionContext with tokens and recipe info
     * @returns HTML string for the section
     */
    static renderSectionV2(context: SectionContext): string {
        const renderer = SECTION_RENDERERS_V2[context.section.type];

        if (!renderer) {
            console.warn(`[SectionRenderer] Unknown section type: ${context.section.type}`);
            return '';
        }

        try {
            return renderer(context);
        } catch (error) {
            console.error(
                `[SectionRenderer] Error rendering section ${context.section.id}:`,
                error
            );
            return '';
        }
    }

    // =========================================================================
    // Phase 2 Methods (Backward Compatible)
    // =========================================================================

    /**
     * Render all sections from a recipe.
     *
     * NOTE: This is the Phase 2 method. Use renderSectionsWithRecipe()
     * for Phase 3 token-aware rendering.
     *
     * @param sections - Section definitions from recipe
     * @param context - Render context with content and style info
     * @returns Concatenated HTML string of all sections
     */
    static renderSections(
        sections: SectionDefinition[],
        context: RenderContext
    ): string {
        return sections
            .map(section => this.renderSection(section, context))
            .filter(html => html.length > 0)  // Remove empty sections
            .join('\n\n');
    }

    /**
     * Render a single section.
     *
     * NOTE: This is the Phase 2 method. Use renderSectionV2()
     * for Phase 3 token-aware rendering.
     *
     * @param section - Section definition
     * @param context - Render context
     * @returns HTML string for the section
     */
    static renderSection(
        section: SectionDefinition,
        context: RenderContext
    ): string {
        const renderer = SECTION_RENDERERS[section.type];

        if (!renderer) {
            console.warn(`[SectionRenderer] Unknown section type: ${section.type}`);
            return '';
        }

        try {
            return renderer(section, context);
        } catch (error) {
            console.error(
                `[SectionRenderer] Error rendering section ${section.id}:`,
                error
            );
            return '';
        }
    }

    // =========================================================================
    // Utility Methods
    // =========================================================================

    /**
     * Check if a section type is registered.
     */
    static hasRenderer(type: SectionType): boolean {
        return type in SECTION_RENDERERS;
    }

    /**
     * Get list of all registered section types.
     * Useful for debugging and validation.
     */
    static getRegisteredTypes(): SectionType[] {
        return Object.keys(SECTION_RENDERERS) as SectionType[];
    }
}
