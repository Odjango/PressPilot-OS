export { STARTUP_LANDING_RECIPE } from './startup-landing';
export { ENTERPRISE_PRODUCT_RECIPE } from './enterprise-product';

import { STARTUP_LANDING_RECIPE } from './startup-landing';
import { ENTERPRISE_PRODUCT_RECIPE } from './enterprise-product';
import type { LayoutRecipe } from '../types';

export const SAAS_RECIPES: LayoutRecipe[] = [
    STARTUP_LANDING_RECIPE,
    ENTERPRISE_PRODUCT_RECIPE
];

export const DEFAULT_SAAS_RECIPE = STARTUP_LANDING_RECIPE;
