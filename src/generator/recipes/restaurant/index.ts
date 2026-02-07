/**
 * Restaurant Recipe Exports - Generator 2.0 Phase 2
 *
 * Centralizes all restaurant recipes and defines the default.
 */

export { CLASSIC_BISTRO_RECIPE } from './classic-bistro';
export { MODERN_DINING_RECIPE } from './modern-dining';

import { CLASSIC_BISTRO_RECIPE } from './classic-bistro';
import { MODERN_DINING_RECIPE } from './modern-dining';
import type { LayoutRecipe } from '../types';

/**
 * All registered restaurant recipes.
 * Order matters for fallback selection.
 */
export const RESTAURANT_RECIPES: LayoutRecipe[] = [
    CLASSIC_BISTRO_RECIPE,
    MODERN_DINING_RECIPE
];

/**
 * Default recipe for restaurant vertical.
 * Used when no other recipe matches the context.
 */
export const DEFAULT_RESTAURANT_RECIPE = CLASSIC_BISTRO_RECIPE;
