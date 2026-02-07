/**
 * RecipeSelector - Generator 2.0 Phase 2
 *
 * Selects the best matching recipe based on context.
 *
 * Selection Algorithm:
 * 1. Filter by vertical (required match)
 * 2. Filter by brandMode (if specified in recipe conditions)
 * 3. Filter by businessType (if specified in recipe conditions)
 * 4. Sort by priority (descending)
 * 5. Return highest priority match
 *
 * Falls back to default recipe with warning if no match.
 */

import type { LayoutRecipe, RecipeContext } from './types';
import type { Vertical } from '../design-system';
import {
    RESTAURANT_RECIPES,
    DEFAULT_RESTAURANT_RECIPE
} from './restaurant';
import {
    ECOMMERCE_RECIPES,
    DEFAULT_ECOMMERCE_RECIPE
} from './ecommerce';

// =============================================================================
// Recipe Registry
// =============================================================================

/**
 * Registry of all recipes by vertical.
 * Phase 2: Restaurant implemented.
 * Phase 4: Ecommerce implemented.
 * Phase 5+: Add saas, service.
 */
const RECIPE_REGISTRY: Record<Vertical, LayoutRecipe[]> = {
    restaurant: RESTAURANT_RECIPES,
    ecommerce: ECOMMERCE_RECIPES,  // Phase 4
    saas: [],       // Phase 5+
    service: []     // Phase 5+
};

// =============================================================================
// RecipeSelector Class
// =============================================================================

export class RecipeSelector {
    /**
     * Select the best matching recipe for the given context.
     *
     * @param context - Recipe selection context
     * @returns Best matching recipe, or default with warning
     */
    static selectRecipe(context: RecipeContext): LayoutRecipe {
        const { vertical, brandMode, businessType } = context;

        // Get recipes for this vertical
        const recipes = RECIPE_REGISTRY[vertical] || [];

        if (recipes.length === 0) {
            console.warn(
                `[RecipeSelector] No recipes registered for vertical "${vertical}". Using default.`
            );
            return this.getDefaultRecipe(vertical);
        }

        // Filter and score recipes
        const candidates = recipes
            .filter(recipe => this.matchesConditions(recipe, context))
            .sort((a, b) => (b.conditions.priority || 0) - (a.conditions.priority || 0));

        if (candidates.length === 0) {
            console.warn(
                `[RecipeSelector] No recipes match context ${JSON.stringify(context)}. ` +
                `Using default for "${vertical}".`
            );
            return this.getDefaultRecipe(vertical);
        }

        const selected = candidates[0];
        console.log(
            `[RecipeSelector] Selected recipe: ${selected.id} ` +
            `(priority: ${selected.conditions.priority || 0})`
        );

        return selected;
    }

    /**
     * Check if a recipe matches the given context.
     *
     * Matching logic:
     * - If recipe specifies brandModes, context MUST have a matching brandMode
     *   (recipes with brandModes are "specialized" and won't match generic queries)
     * - If recipe specifies businessTypes, context MUST have a matching businessType
     * - Empty/undefined conditions mean "match all" (universal recipe)
     *
     * This ensures that the most generic recipe (no conditions) is selected
     * when the context doesn't specify restrictive criteria.
     */
    private static matchesConditions(
        recipe: LayoutRecipe,
        context: RecipeContext
    ): boolean {
        const { brandModes, businessTypes } = recipe.conditions;

        // Check brand mode - if recipe requires specific modes, context must match
        if (brandModes && brandModes.length > 0) {
            // Recipe is specialized for specific brand modes
            if (!context.brandMode) {
                // Context doesn't specify brandMode - this recipe doesn't match
                return false;
            }
            if (!brandModes.includes(context.brandMode)) {
                return false;
            }
        }

        // Check business type - if recipe requires specific types, context must match
        if (businessTypes && businessTypes.length > 0) {
            // Recipe is specialized for specific business types
            if (!context.businessType) {
                // Context doesn't specify businessType - this recipe doesn't match
                return false;
            }
            if (!businessTypes.includes(context.businessType)) {
                return false;
            }
        }

        return true;
    }

    /**
     * Get the default recipe for a vertical.
     */
    private static getDefaultRecipe(vertical: Vertical): LayoutRecipe {
        switch (vertical) {
            case 'restaurant':
                return DEFAULT_RESTAURANT_RECIPE;

            case 'ecommerce':
                return DEFAULT_ECOMMERCE_RECIPE;

            default:
                // For unimplemented verticals, return a minimal stub
                console.warn(
                    `[RecipeSelector] No default recipe for "${vertical}". ` +
                    `Returning empty recipe.`
                );
                return {
                    id: `${vertical}-default`,
                    name: 'Default',
                    vertical,
                    conditions: { priority: 0 },
                    sections: []
                };
        }
    }

    /**
     * Get all registered recipes for a vertical.
     * Useful for debugging and recipe listing.
     */
    static getRecipesForVertical(vertical: Vertical): LayoutRecipe[] {
        return RECIPE_REGISTRY[vertical] || [];
    }
}
