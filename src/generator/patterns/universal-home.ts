import { PageContent, HeroLayout, BrandStyle } from '../types';
import { getHeroByLayout } from './hero-variants';
import {
    getValuePropositionSection,
    getServicesGridSection,
    getSocialProofSection,
    getFAQSection,
    getFinalCTASection
} from './sections';

// Recipe System imports (Generator 2.0 Phase 2)
import {
    RecipeSelector,
    SectionRenderer,
    type RecipeContext,
    type RenderContext
} from '../recipes';
import type { BrandMode } from '../design-system';

/**
 * Universal Home Pattern - TT4-Aligned (Phase 15.5 + Phase 2/3 Recipes)
 *
 * Industry-specific homepage assembly.
 * Uses TT4 semantic color tokens for visual differentiation between palettes.
 *
 * GENERATOR 2.0 PHASE 2+3: Recipe-Driven Assembly with Token-Aware Rendering
 * Restaurants now use the Recipe System for section composition.
 * Recipes define section order and backgrounds declaratively.
 * Phase 3: SectionRenderer.renderSectionsWithRecipe() uses SectionContext
 * for token-driven styling without hardcoded values.
 *
 * RESTAURANT RECIPE V1 (Classic Bistro):
 * 1. Hero - Dynamic layout based on heroLayout selection
 * 2. Story/About - Image + text (base bg)
 * 3. Menu Preview - 6 circular/rectangular food images (base-2 bg)
 * 4. Promo Band - Dark promotional section (contrast bg)
 * 5. Testimonials - Customer quotes (accent-2 bg)
 * 6. Final CTA - Reservation call-to-action (accent bg)
 *
 * RESTAURANT VISUAL MODES (brandStyle -> brandMode):
 * - 'playful' (Tove): Circular images, pill buttons (100px), generous spacing
 * - 'modern' (Frost): Rectangular images (8px radius), square buttons (4px), tighter spacing
 *
 * GENERIC RECIPE (all other industries):
 * 1. Hero - Dynamic layout
 * 2. Value Proposition - 3 benefit cards (base bg)
 * 3. Services Grid - 4 service cards (base-2 bg)
 * 4. Social Proof - 3 testimonials (accent-2 bg)
 * 5. FAQ - 4 questions (base bg)
 * 6. Final CTA - Strong call-to-action (accent bg)
 */
export const getUniversalHomeContent = (
    content?: PageContent,
    heroLayout?: HeroLayout,
    industry?: string,
    brandStyle?: BrandStyle,
    brandMode?: BrandMode,
    businessType?: string
) => {
    const normalizedBusinessType = businessType?.toLowerCase().trim();
    // Restaurant Recipe - uses Phase 2+3 Recipe System
    const isRestaurant = industry === 'restaurant' ||
                         industry === 'cafe' ||
                         industry === 'restaurant_cafe';

    // Ecommerce Recipe - uses Phase 4 Recipe System
    const isEcommerce = industry === 'ecommerce' ||
                        industry === 'retail' ||
                        industry === 'shop' ||
                        industry === 'online_store';
    const isSaas = industry === 'saas' ||
                   industry === 'software' ||
                   industry === 'startup';

    if (isEcommerce) {
        // === RECIPE-DRIVEN FLOW (Generator 2.0 Phase 4) ===

        // Build recipe selection context
        const recipeContext: RecipeContext = {
            vertical: 'ecommerce',
            brandMode: (brandMode || brandStyle || 'modern') as BrandMode,  // Default to modern for ecommerce
            businessType: normalizedBusinessType
        };

        // Select best matching recipe
        const recipe = RecipeSelector.selectRecipe(recipeContext);

        // Build render context for section rendering
        const renderContext: RenderContext = {
            content,
            heroLayout,
            industry,
            brandStyle,
            brandMode,
            businessType: normalizedBusinessType
        };

        // Phase 4: Use recipe-aware rendering with SectionContext for token-driven styling
        return SectionRenderer.renderSectionsWithRecipe(recipe, renderContext);
    }

    if (isRestaurant) {
        // === RECIPE-DRIVEN FLOW (Generator 2.0 Phase 2+3) ===

        // Build recipe selection context
        const recipeContext: RecipeContext = {
            vertical: 'restaurant',
            brandMode: (brandMode || brandStyle || 'modern') as BrandMode,
            businessType: normalizedBusinessType
        };

        // Select best matching recipe
        const recipe = RecipeSelector.selectRecipe(recipeContext);

        // Build render context for section rendering
        const renderContext: RenderContext = {
            content,
            heroLayout,
            industry,
            brandStyle,
            brandMode,
            businessType: normalizedBusinessType
        };

        // Phase 3: Use recipe-aware rendering with SectionContext for token-driven styling
        return SectionRenderer.renderSectionsWithRecipe(recipe, renderContext);
    }

    if (isSaas) {
        const recipeContext: RecipeContext = {
            vertical: 'saas',
            brandMode: (brandMode || brandStyle || 'modern') as BrandMode,
            businessType: normalizedBusinessType
        };

        const recipe = RecipeSelector.selectRecipe(recipeContext);
        const renderContext: RenderContext = {
            content,
            heroLayout,
            industry,
            brandStyle,
            brandMode,
            businessType: normalizedBusinessType
        };

        return SectionRenderer.renderSectionsWithRecipe(recipe, renderContext);
    }

    // Generic homepage for all other industries (not yet using recipes)
    const heroSection = getHeroByLayout(heroLayout, content);

    return `${heroSection}

${getValuePropositionSection(content, industry)}

${getServicesGridSection(content, industry)}

${getSocialProofSection(content, industry)}

${getFAQSection(content, industry)}

${getFinalCTASection(content, industry)}`;
};

/**
 * Legacy export for backward compatibility.
 * This was the original 4-section homepage.
 * @deprecated Use getUniversalHomeContent with industry parameter instead.
 */
export const getUniversalHomeContentLegacy = (content?: PageContent, heroLayout?: HeroLayout) => {
    // Get hero section based on layout selection (defaults to fullBleed)
    const heroSection = getHeroByLayout(heroLayout, content);

    return `${heroSection}

<!-- wp:group {"align":"full","style":{"spacing":{"padding":{"top":"var:preset|spacing|50","bottom":"var:preset|spacing|50"}}},"backgroundColor":"base-2","layout":{"type":"constrained"}} -->
<div class="wp-block-group alignfull has-base-2-background-color has-background" style="padding-top:var(--wp--preset--spacing--50);padding-bottom:var(--wp--preset--spacing--50)">
    <!-- wp:heading {"textAlign":"center","textColor":"contrast"} -->
    <h2 class="wp-block-heading has-text-align-center has-contrast-color has-text-color">Why Choose Us</h2>
    <!-- /wp:heading -->
    <!-- wp:paragraph {"align":"center","textColor":"contrast-2"} -->
    <p class="has-text-align-center has-contrast-2-color has-text-color">Discover what makes us different</p>
    <!-- /wp:paragraph -->
    <!-- wp:columns {"align":"wide","style":{"spacing":{"blockGap":{"left":"var:preset|spacing|40"},"margin":{"top":"var:preset|spacing|40"}}}} -->
    <div class="wp-block-columns alignwide" style="margin-top:var(--wp--preset--spacing--40)">
        <!-- wp:column -->
        <div class="wp-block-column">
            <!-- wp:heading {"level":3,"textColor":"accent"} -->
            <h3 class="wp-block-heading has-accent-color has-text-color">Quality Service</h3>
            <!-- /wp:heading -->
            <!-- wp:paragraph {"textColor":"contrast-2"} -->
            <p class="has-contrast-2-color has-text-color">We deliver exceptional results that exceed expectations every time.</p>
            <!-- /wp:paragraph -->
        </div>
        <!-- /wp:column -->
        <!-- wp:column -->
        <div class="wp-block-column">
            <!-- wp:heading {"level":3,"textColor":"accent"} -->
            <h3 class="wp-block-heading has-accent-color has-text-color">Expert Team</h3>
            <!-- /wp:heading -->
            <!-- wp:paragraph {"textColor":"contrast-2"} -->
            <p class="has-contrast-2-color has-text-color">Our professionals bring years of experience to every project.</p>
            <!-- /wp:paragraph -->
        </div>
        <!-- /wp:column -->
        <!-- wp:column -->
        <div class="wp-block-column">
            <!-- wp:heading {"level":3,"textColor":"accent"} -->
            <h3 class="wp-block-heading has-accent-color has-text-color">24/7 Support</h3>
            <!-- /wp:heading -->
            <!-- wp:paragraph {"textColor":"contrast-2"} -->
            <p class="has-contrast-2-color has-text-color">We're always here when you need us, day or night.</p>
            <!-- /wp:paragraph -->
        </div>
        <!-- /wp:column -->
    </div>
    <!-- /wp:columns -->
</div>
<!-- /wp:group -->

<!-- wp:group {"align":"full","style":{"spacing":{"padding":{"top":"var:preset|spacing|50","bottom":"var:preset|spacing|50"}}},"backgroundColor":"accent","layout":{"type":"constrained"}} -->
<div class="wp-block-group alignfull has-accent-background-color has-background" style="padding-top:var(--wp--preset--spacing--50);padding-bottom:var(--wp--preset--spacing--50)">
    <!-- wp:heading {"textAlign":"center","textColor":"base"} -->
    <h2 class="wp-block-heading has-text-align-center has-base-color has-text-color">Ready to Get Started?</h2>
    <!-- /wp:heading -->
    <!-- wp:paragraph {"align":"center","textColor":"base"} -->
    <p class="has-text-align-center has-base-color has-text-color">Join thousands of satisfied customers today.</p>
    <!-- /wp:paragraph -->
    <!-- wp:buttons {"layout":{"type":"flex","justifyContent":"center"},"style":{"spacing":{"margin":{"top":"var:preset|spacing|30"}}}} -->
    <div class="wp-block-buttons is-layout-flex is-content-justification-center" style="margin-top:var(--wp--preset--spacing--30)">
        <!-- wp:button {"backgroundColor":"base","textColor":"accent"} -->
        <div class="wp-block-button"><a class="wp-block-button__link has-accent-color has-base-background-color has-text-color has-background wp-element-button">Contact Us</a></div>
        <!-- /wp:button -->
    </div>
    <!-- /wp:buttons -->
</div>
<!-- /wp:group -->

<!-- wp:group {"align":"full","style":{"spacing":{"padding":{"top":"var:preset|spacing|50","bottom":"var:preset|spacing|50"}}},"backgroundColor":"accent-2","layout":{"type":"constrained"}} -->
<div class="wp-block-group alignfull has-accent-2-background-color has-background" style="padding-top:var(--wp--preset--spacing--50);padding-bottom:var(--wp--preset--spacing--50)">
    <!-- wp:heading {"textAlign":"center","textColor":"contrast"} -->
    <h2 class="wp-block-heading has-text-align-center has-contrast-color has-text-color">Our Values</h2>
    <!-- /wp:heading -->
    <!-- wp:columns {"align":"wide","style":{"spacing":{"margin":{"top":"var:preset|spacing|40"}}}} -->
    <div class="wp-block-columns alignwide" style="margin-top:var(--wp--preset--spacing--40)">
        <!-- wp:column {"style":{"spacing":{"padding":{"top":"var:preset|spacing|30","right":"var:preset|spacing|30","bottom":"var:preset|spacing|30","left":"var:preset|spacing|30"}}},"backgroundColor":"base"} -->
        <div class="wp-block-column has-base-background-color has-background" style="padding-top:var(--wp--preset--spacing--30);padding-right:var(--wp--preset--spacing--30);padding-bottom:var(--wp--preset--spacing--30);padding-left:var(--wp--preset--spacing--30)">
            <!-- wp:heading {"level":3,"textColor":"accent-3"} -->
            <h3 class="wp-block-heading has-accent-3-color has-text-color">Innovation</h3>
            <!-- /wp:heading -->
            <!-- wp:paragraph {"textColor":"contrast-2"} -->
            <p class="has-contrast-2-color has-text-color">We constantly push boundaries to deliver cutting-edge solutions.</p>
            <!-- /wp:paragraph -->
        </div>
        <!-- /wp:column -->
        <!-- wp:column {"style":{"spacing":{"padding":{"top":"var:preset|spacing|30","right":"var:preset|spacing|30","bottom":"var:preset|spacing|30","left":"var:preset|spacing|30"}}},"backgroundColor":"base"} -->
        <div class="wp-block-column has-base-background-color has-background" style="padding-top:var(--wp--preset--spacing--30);padding-right:var(--wp--preset--spacing--30);padding-bottom:var(--wp--preset--spacing--30);padding-left:var(--wp--preset--spacing--30)">
            <!-- wp:heading {"level":3,"textColor":"accent-3"} -->
            <h3 class="wp-block-heading has-accent-3-color has-text-color">Integrity</h3>
            <!-- /wp:heading -->
            <!-- wp:paragraph {"textColor":"contrast-2"} -->
            <p class="has-contrast-2-color has-text-color">Honesty and transparency guide every decision we make.</p>
            <!-- /wp:paragraph -->
        </div>
        <!-- /wp:column -->
        <!-- wp:column {"style":{"spacing":{"padding":{"top":"var:preset|spacing|30","right":"var:preset|spacing|30","bottom":"var:preset|spacing|30","left":"var:preset|spacing|30"}}},"backgroundColor":"base"} -->
        <div class="wp-block-column has-base-background-color has-background" style="padding-top:var(--wp--preset--spacing--30);padding-right:var(--wp--preset--spacing--30);padding-bottom:var(--wp--preset--spacing--30);padding-left:var(--wp--preset--spacing--30)">
            <!-- wp:heading {"level":3,"textColor":"accent-3"} -->
            <h3 class="wp-block-heading has-accent-3-color has-text-color">Excellence</h3>
            <!-- /wp:heading -->
            <!-- wp:paragraph {"textColor":"contrast-2"} -->
            <p class="has-contrast-2-color has-text-color">We strive for perfection in everything we do.</p>
            <!-- /wp:paragraph -->
        </div>
        <!-- /wp:column -->
    </div>
    <!-- /wp:columns -->
</div>
<!-- /wp:group -->`;
};
