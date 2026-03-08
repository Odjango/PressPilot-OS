/**
 * Ecommerce Recipe Exports - Generator 2.0 Phase 4
 *
 * Centralizes all ecommerce recipes and defines the default.
 */

export { PRODUCT_SHOWCASE_RECIPE } from './product-showcase';
export { MINIMAL_STORE_RECIPE } from './minimal-store';
export { BOUTIQUE_STORE_RECIPE } from './boutique-store';
export { ARTISAN_SHOP_RECIPE } from './artisan-shop';

import { PRODUCT_SHOWCASE_RECIPE } from './product-showcase';
import { MINIMAL_STORE_RECIPE } from './minimal-store';
import { BOUTIQUE_STORE_RECIPE } from './boutique-store';
import { ARTISAN_SHOP_RECIPE } from './artisan-shop';
import type { LayoutRecipe } from '../types';

/**
 * All registered ecommerce recipes.
 * Order matters for fallback selection.
 */
export const ECOMMERCE_RECIPES: LayoutRecipe[] = [
    BOUTIQUE_STORE_RECIPE,
    PRODUCT_SHOWCASE_RECIPE,
    ARTISAN_SHOP_RECIPE,
    MINIMAL_STORE_RECIPE
];

/**
 * Default recipe for ecommerce vertical.
 * Used when no other recipe matches the context.
 */
export const DEFAULT_ECOMMERCE_RECIPE = BOUTIQUE_STORE_RECIPE;
