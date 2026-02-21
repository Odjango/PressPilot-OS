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
    getRestaurantChefHighlightSectionWithContext,
    getRestaurantGalleryGridSectionWithContext,
    getRestaurantHoursLocationSectionWithContext,
    getRestaurantLocationMapSectionWithContext,
    getRestaurantAwardsPressSectionWithContext,
    getRestaurantReservationFormSectionWithContext,
    // Phase 3 WithContext variants
    getRestaurantStorySectionWithContext,
    getRestaurantMenuPreviewSectionWithContext,
    getRestaurantPromoBandSectionWithContext,
    getSocialProofSectionWithContext,
    getFinalCTASectionWithContext,
    getSaasHeroSectionWithContext,
    getSaasFeaturesGridSectionWithContext,
    getSaasPricingTableSectionWithContext,
    getSaasTestimonialsSectionWithContext,
    getSaasHowItWorksSectionWithContext,
    getSaasCTABannerSectionWithContext,
    getSaasFAQSectionWithContext,
    getSaasLogosSectionWithContext,
    getPortfolioHeroSectionWithContext,
    getPortfolioAboutSectionWithContext,
    getPortfolioGallerySectionWithContext,
    getPortfolioProjectCardSectionWithContext,
    getPortfolioSkillsSectionWithContext,
    getPortfolioExperienceSectionWithContext,
    getPortfolioTestimonialsSectionWithContext,
    getPortfolioContactSectionWithContext,
    getPortfolioCTASectionWithContext,
    getLocalHeroSectionWithContext,
    getLocalServicesGridSectionWithContext,
    getLocalAboutSectionWithContext,
    getLocalTeamSectionWithContext,
    getLocalTestimonialsSectionWithContext,
    getLocalLocationSectionWithContext,
    getLocalHoursSectionWithContext,
    getLocalBookingCTASectionWithContext,
    getLocalFAQSectionWithContext,
    getLocalTrustBadgesSectionWithContext,
    // Phase 4 Ecommerce sections
    getEcommerceHeroSectionWithContext,
    getEcommerceCategoriesSectionWithContext,
    getEcommerceCategoryGridSectionWithContext,
    getEcommerceFeaturedProductsSectionWithContext,
    getEcommerceProductGridSectionWithContext,
    getEcommerceAboutBrandSectionWithContext,
    getEcommerceTestimonialsSectionWithContext,
    getEcommerceTrustBadgesSectionWithContext,
    getEcommerceNewsletterSectionWithContext,
    getEcommerceInstagramSectionWithContext,
    getEcommerceBannerSaleSectionWithContext
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
        return getHeroByLayout(ctx.heroLayout, ctx.content, ctx.businessName, ctx.pages, ctx.hasLogo);
    },

    'story': (_section, ctx) => {
        return getRestaurantStorySection(ctx.content, ctx.brandStyle);
    },
    'chef-highlight': (_section, _ctx) => '',
    'gallery-grid': (_section, _ctx) => '',

    'menu-preview': (_section, ctx) => {
        return getRestaurantMenuPreviewSection(ctx.content, ctx.brandStyle);
    },
    'hours-location': (_section, _ctx) => '',
    'location-map': (_section, _ctx) => '',
    'awards-press': (_section, _ctx) => '',
    'reservation-form': (_section, _ctx) => '',

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
    // SaaS sections
    'saas-hero': () => '',
    'saas-features-grid': () => '',
    'saas-pricing-table': () => '',
    'saas-testimonials': () => '',
    'saas-how-it-works': () => '',
    'saas-cta-banner': () => '',
    'saas-faq': () => '',
    'saas-logos': () => '',
    // Portfolio sections
    'portfolio-hero': () => '',
    'portfolio-about': () => '',
    'portfolio-gallery': () => '',
    'portfolio-project-card': () => '',
    'portfolio-skills': () => '',
    'portfolio-experience': () => '',
    'portfolio-testimonials': () => '',
    'portfolio-contact': () => '',
    'portfolio-cta': () => '',
    // Local service sections
    'local-hero': () => '',
    'local-services-grid': () => '',
    'local-about': () => '',
    'local-team': () => '',
    'local-testimonials': () => '',
    'local-location': () => '',
    'local-hours': () => '',
    'local-booking-cta': () => '',
    'local-faq': () => '',
    'local-trust-badges': () => '',

    // Ecommerce sections - Phase 2 legacy stubs (use V2 renderers via renderSectionsWithRecipe)
    'ecommerce-hero': () => '',
    'ecommerce-categories': () => '',
    'category-grid': () => '',
    'ecommerce-featured-products': () => '',
    'featured-products': () => '',
    'ecommerce-product-grid': () => '',
    'ecommerce-about-brand': () => '',
    'ecommerce-testimonials': () => '',
    'ecommerce-instagram': () => '',
    'ecommerce-banner-sale': () => '',
    'ecommerce-trust-badges': () => '',
    'trust-badges': () => '',
    'ecommerce-newsletter': () => '',
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
        return getHeroByLayout(
            ctx.render.heroLayout,
            ctx.render.content,
            ctx.render.businessName,
            ctx.render.pages,
            ctx.render.hasLogo
        );
    },

    'story': (ctx) => {
        return getRestaurantStorySectionWithContext(ctx);
    },
    'chef-highlight': (ctx) => {
        return getRestaurantChefHighlightSectionWithContext(ctx);
    },
    'gallery-grid': (ctx) => {
        return getRestaurantGalleryGridSectionWithContext(ctx);
    },

    'menu-preview': (ctx) => {
        return getRestaurantMenuPreviewSectionWithContext(ctx);
    },
    'hours-location': (ctx) => {
        return getRestaurantHoursLocationSectionWithContext(ctx);
    },
    'location-map': (ctx) => {
        return getRestaurantLocationMapSectionWithContext(ctx);
    },
    'awards-press': (ctx) => {
        return getRestaurantAwardsPressSectionWithContext(ctx);
    },
    'reservation-form': (ctx) => {
        return getRestaurantReservationFormSectionWithContext(ctx);
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
    // SaaS sections (Phase 5)
    'saas-hero': (ctx) => {
        return getSaasHeroSectionWithContext(ctx);
    },
    'saas-features-grid': (ctx) => {
        return getSaasFeaturesGridSectionWithContext(ctx);
    },
    'saas-pricing-table': (ctx) => {
        return getSaasPricingTableSectionWithContext(ctx);
    },
    'saas-testimonials': (ctx) => {
        return getSaasTestimonialsSectionWithContext(ctx);
    },
    'saas-how-it-works': (ctx) => {
        return getSaasHowItWorksSectionWithContext(ctx);
    },
    'saas-cta-banner': (ctx) => {
        return getSaasCTABannerSectionWithContext(ctx);
    },
    'saas-faq': (ctx) => {
        return getSaasFAQSectionWithContext(ctx);
    },
    'saas-logos': (ctx) => {
        return getSaasLogosSectionWithContext(ctx);
    },
    // Portfolio sections
    'portfolio-hero': (ctx) => {
        return getPortfolioHeroSectionWithContext(ctx);
    },
    'portfolio-about': (ctx) => {
        return getPortfolioAboutSectionWithContext(ctx);
    },
    'portfolio-gallery': (ctx) => {
        return getPortfolioGallerySectionWithContext(ctx);
    },
    'portfolio-project-card': (ctx) => {
        return getPortfolioProjectCardSectionWithContext(ctx);
    },
    'portfolio-skills': (ctx) => {
        return getPortfolioSkillsSectionWithContext(ctx);
    },
    'portfolio-experience': (ctx) => {
        return getPortfolioExperienceSectionWithContext(ctx);
    },
    'portfolio-testimonials': (ctx) => {
        return getPortfolioTestimonialsSectionWithContext(ctx);
    },
    'portfolio-contact': (ctx) => {
        return getPortfolioContactSectionWithContext(ctx);
    },
    'portfolio-cta': (ctx) => {
        return getPortfolioCTASectionWithContext(ctx);
    },
    // Local service sections
    'local-hero': (ctx) => {
        return getLocalHeroSectionWithContext(ctx);
    },
    'local-services-grid': (ctx) => {
        return getLocalServicesGridSectionWithContext(ctx);
    },
    'local-about': (ctx) => {
        return getLocalAboutSectionWithContext(ctx);
    },
    'local-team': (ctx) => {
        return getLocalTeamSectionWithContext(ctx);
    },
    'local-testimonials': (ctx) => {
        return getLocalTestimonialsSectionWithContext(ctx);
    },
    'local-location': (ctx) => {
        return getLocalLocationSectionWithContext(ctx);
    },
    'local-hours': (ctx) => {
        return getLocalHoursSectionWithContext(ctx);
    },
    'local-booking-cta': (ctx) => {
        return getLocalBookingCTASectionWithContext(ctx);
    },
    'local-faq': (ctx) => {
        return getLocalFAQSectionWithContext(ctx);
    },
    'local-trust-badges': (ctx) => {
        return getLocalTrustBadgesSectionWithContext(ctx);
    },

    // Ecommerce sections (Phase 4)
    'ecommerce-hero': (ctx) => {
        return getEcommerceHeroSectionWithContext(ctx);
    },
    'ecommerce-categories': (ctx) => {
        return getEcommerceCategoriesSectionWithContext(ctx);
    },

    'category-grid': (ctx) => {
        return getEcommerceCategoryGridSectionWithContext(ctx);
    },
    'ecommerce-featured-products': (ctx) => {
        return getEcommerceFeaturedProductsSectionWithContext(ctx);
    },

    'featured-products': (ctx) => {
        return getEcommerceFeaturedProductsSectionWithContext(ctx);
    },
    'ecommerce-product-grid': (ctx) => {
        return getEcommerceProductGridSectionWithContext(ctx);
    },
    'ecommerce-about-brand': (ctx) => {
        return getEcommerceAboutBrandSectionWithContext(ctx);
    },
    'ecommerce-testimonials': (ctx) => {
        return getEcommerceTestimonialsSectionWithContext(ctx);
    },
    'ecommerce-instagram': (ctx) => {
        return getEcommerceInstagramSectionWithContext(ctx);
    },
    'ecommerce-banner-sale': (ctx) => {
        return getEcommerceBannerSaleSectionWithContext(ctx);
    },
    'ecommerce-trust-badges': (ctx) => {
        return getEcommerceTrustBadgesSectionWithContext(ctx);
    },

    'trust-badges': (ctx) => {
        return getEcommerceTrustBadgesSectionWithContext(ctx);
    },
    'ecommerce-newsletter': (ctx) => {
        return getEcommerceNewsletterSectionWithContext(ctx);
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
