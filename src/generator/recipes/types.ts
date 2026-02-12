/**
 * Recipe System Types - Generator 2.0 Phase 2 + Phase 3
 *
 * Declarative recipe definitions for section-based page composition.
 * Recipes are pure data - no business logic.
 *
 * Phase 3 additions:
 * - RenderContext: Context for recipe rendering
 * - SectionContext: Full context passed to section renderers with tokens
 *
 * NOTE: This LayoutRecipe is different from the one in ../types.ts.
 * - ../types.ts LayoutRecipe: pattern file paths (legacy)
 * - This LayoutRecipe: section-based composition (Generator 2.0)
 */

import type { BrandMode, Vertical, DesignSystemTokens } from '../design-system';
import type { PageContent, HeroLayout, BrandStyle } from '../types';

// =============================================================================
// Section Types
// =============================================================================

/**
 * Section types that can be composed into a recipe.
 * Each type maps to a specific section renderer function.
 */
export type SectionType =
    // Restaurant sections
    | 'hero'
    | 'story'
    | 'chef-highlight'
    | 'gallery-grid'
    | 'menu-preview'
    | 'hours-location'
    | 'location-map'
    | 'awards-press'
    | 'reservation-form'
    | 'promo-band'
    | 'testimonials'
    | 'final-cta'
    | 'footer'
    // SaaS sections (Phase 5)
    | 'saas-hero'
    | 'saas-features-grid'
    | 'saas-pricing-table'
    | 'saas-testimonials'
    | 'saas-how-it-works'
    | 'saas-cta-banner'
    | 'saas-faq'
    | 'saas-logos'
    // Ecommerce sections (Phase 4)
    | 'ecommerce-hero'
    | 'category-grid'
    | 'featured-products'
    | 'trust-badges'
    | 'newsletter';

/**
 * Semantic background color slots.
 * Maps to TT4 semantic tokens in theme.json.
 */
export type BackgroundSlot =
    | 'base'       // Primary light background
    | 'base-2'     // Secondary light background
    | 'accent'     // Brand accent background
    | 'accent-2'   // Secondary brand background
    | 'contrast'   // Dark/high-contrast background
    | 'promo';     // Promotional band (alias for contrast)

// =============================================================================
// Section Definition
// =============================================================================

/**
 * A single section within a recipe.
 */
export interface SectionDefinition {
    /** Section type - maps to renderer function */
    type: SectionType;

    /** Unique identifier within the recipe */
    id: string;

    /**
     * Semantic background color slot.
     * If omitted, the section renderer uses its default.
     */
    backgroundColor?: BackgroundSlot;

    /**
     * Section-specific configuration.
     * Passed to the renderer for customization.
     */
    config?: Record<string, unknown>;
}

// =============================================================================
// Recipe Definition
// =============================================================================

/**
 * Conditions for recipe matching.
 */
export interface RecipeConditions {
    /** Brand modes this recipe applies to (empty = all modes) */
    brandModes?: BrandMode[];

    /** Business types this recipe applies to (e.g., 'fine-dining', 'cafe') */
    businessTypes?: string[];

    /** Priority for selection (0-100, higher wins) */
    priority?: number;
}

/**
 * A complete layout recipe defining page composition.
 *
 * NOTE: This is distinct from LayoutRecipe in ../types.ts which uses
 * pattern file paths. This uses section-based composition.
 */
export interface LayoutRecipe {
    /** Unique recipe identifier */
    id: string;

    /** Human-readable recipe name */
    name: string;

    /** Target vertical (restaurant, ecommerce, etc.) */
    vertical: Vertical;

    /** Matching conditions for recipe selection */
    conditions: RecipeConditions;

    /** Ordered list of sections to render */
    sections: SectionDefinition[];
}

// =============================================================================
// Context Types
// =============================================================================

/**
 * Context passed to the recipe selector for matching.
 */
export interface RecipeContext {
    vertical: Vertical;
    brandMode?: BrandMode;
    businessType?: string;
}

// =============================================================================
// Render Context Types (Phase 3)
// =============================================================================

/**
 * Context passed to recipe rendering.
 * Contains the original inputs needed for section pattern generation.
 */
export interface RenderContext {
    content?: PageContent;
    heroLayout?: HeroLayout;
    industry?: string;
    brandStyle?: BrandStyle;
    brandMode?: BrandMode;
    businessType?: string;
}

/**
 * Full context provided to section renderers.
 * Phase 3: Carries design tokens and recipe info for consistent styling.
 *
 * Benefits:
 * - Sections don't need to fetch tokens internally
 * - Enables recipe-level token overrides (future)
 * - Better testability
 */
export interface SectionContext {
    /** Design system tokens for styling */
    tokens: DesignSystemTokens;

    /** Original render context (content, heroLayout, etc.) */
    render: RenderContext;

    /** Section definition from recipe */
    section: SectionDefinition;

    /** Recipe metadata */
    recipe: {
        id: string;
        name: string;
        vertical: Vertical;
    };
}
