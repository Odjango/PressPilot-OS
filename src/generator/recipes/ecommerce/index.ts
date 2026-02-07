/**
 * Ecommerce Recipe Exports - Generator 2.0 Phase 4
 *
 * Centralizes all ecommerce recipes and defines the default.
 */

export { PRODUCT_SHOWCASE_RECIPE } from './product-showcase';
export { MINIMAL_STORE_RECIPE } from './minimal-store';

import { PRODUCT_SHOWCASE_RECIPE } from './product-showcase';
import { MINIMAL_STORE_RECIPE } from './minimal-store';
import type { LayoutRecipe } from '../types';

/**
 * All registered ecommerce recipes.
 * Order matters for fallback selection.
 */
export const ECOMMERCE_RECIPES: LayoutRecipe[] = [
    PRODUCT_SHOWCASE_RECIPE,
    MINIMAL_STORE_RECIPE
];

/**
 * Default recipe for ecommerce vertical.
 * Used when no other recipe matches the context.
 */
export const DEFAULT_ECOMMERCE_RECIPE = PRODUCT_SHOWCASE_RECIPE;
