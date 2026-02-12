/**
 * Recipe System - Generator 2.0 Phase 2 + Phase 3
 *
 * Two types of recipes:
 * 1. SiteRecipe (RecipeRegistry) - Page-level structure (which pages exist)
 * 2. LayoutRecipe (Phase 2) - Section-level structure (how a page is composed)
 *
 * Phase 3 additions:
 * - SectionContext for token-driven styling
 * - ContextBuilder for creating SectionContext
 * - renderSectionsWithRecipe() for recipe-aware rendering
 *
 * Usage for Layout Recipes (Phase 3):
 *   import {
 *     RecipeSelector,
 *     SectionRenderer,
 *     type RecipeContext,
 *     type RenderContext
 *   } from '../recipes';
 *
 *   const recipe = RecipeSelector.selectRecipe({
 *     vertical: 'restaurant',
 *     brandMode: 'playful'
 *   });
 *
 *   const html = SectionRenderer.renderSectionsWithRecipe(recipe, renderContext);
 */

import { SiteRecipe } from '../types';

// =============================================================================
// Site Recipe Registry (Page Structure)
// =============================================================================

export const RecipeRegistry: Record<string, SiteRecipe> = {
    restaurant: {
        industry: 'restaurant',
        description: 'Full service restaurant with menu and reservations',
        pages: [
            {
                title: 'Home',
                slug: 'home',
                template: 'universal-home',
                content: {} // Populated by CopyEngine
            },
            {
                title: 'Menu',
                slug: 'menu',
                template: 'universal-menu',
                content: {}
            },
            {
                title: 'Reservations',
                slug: 'reservations',
                template: 'universal-reservation',
                content: {}
            },
            {
                title: 'About',
                slug: 'about',
                template: 'universal-about',
                content: {}
            },
            {
                title: 'Contact',
                slug: 'contact',
                template: 'universal-contact',
                content: {}
            }
        ]
    },
    // Placeholders for other verticals
    agency: {
        industry: 'agency',
        description: 'Creative agency portfolio',
        pages: []
    },
    saas: {
        industry: 'saas',
        description: 'Tech startup landing',
        pages: []
    },
    portfolio: {
        industry: 'portfolio',
        description: 'Portfolio/talent site with gallery page',
        pages: [
            {
                title: 'Home',
                slug: 'home',
                template: 'universal-home',
                content: {}
            },
            {
                title: 'Gallery',
                slug: 'gallery',
                template: 'universal-portfolio',
                content: {}
            },
            {
                title: 'Contact',
                slug: 'contact',
                template: 'universal-contact',
                content: {}
            }
        ]
    },
    'local-service': {
        industry: 'local-service',
        description: 'Local service business with booking and trust patterns',
        pages: [
            {
                title: 'Home',
                slug: 'home',
                template: 'universal-home',
                content: {}
            },
            {
                title: 'Services',
                slug: 'services',
                template: 'universal-services',
                content: {}
            },
            {
                title: 'Contact',
                slug: 'contact',
                template: 'universal-contact',
                content: {}
            }
        ]
    }
};

// =============================================================================
// Layout Recipe System (Section Structure) - Phase 2 + Phase 3
// =============================================================================

// Type exports
export type {
    LayoutRecipe,
    SectionDefinition,
    SectionType,
    BackgroundSlot,
    RecipeConditions,
    RecipeContext,
    // Phase 3 additions
    RenderContext,
    SectionContext
} from './types';

// Class exports
export { RecipeSelector } from './selector';
export { SectionRenderer } from './renderer';
export { ContextBuilder } from './context-builder';

// Restaurant recipe exports
export {
    RESTAURANT_RECIPES,
    DEFAULT_RESTAURANT_RECIPE,
    CLASSIC_BISTRO_RECIPE,
    MODERN_DINING_RECIPE
} from './restaurant';

// Ecommerce recipe exports (Phase 4)
export {
    ECOMMERCE_RECIPES,
    DEFAULT_ECOMMERCE_RECIPE,
    PRODUCT_SHOWCASE_RECIPE,
    MINIMAL_STORE_RECIPE
} from './ecommerce';

// SaaS recipe exports (Phase 5)
export {
    SAAS_RECIPES,
    DEFAULT_SAAS_RECIPE,
    STARTUP_LANDING_RECIPE,
    ENTERPRISE_PRODUCT_RECIPE
} from './saas';

// Portfolio recipe exports
export {
    PORTFOLIO_RECIPES,
    DEFAULT_PORTFOLIO_RECIPE,
    CREATIVE_PROFESSIONAL_RECIPE,
    FREELANCER_RECIPE,
    TALENT_AGENCY_RECIPE
} from './portfolio';

// Local Service recipe exports
export {
    LOCAL_SERVICE_RECIPES,
    DEFAULT_LOCAL_SERVICE_RECIPE,
    HOME_SERVICES_RECIPE,
    PROFESSIONAL_SERVICES_RECIPE,
    WELLNESS_SERVICES_RECIPE
} from './local-service';
