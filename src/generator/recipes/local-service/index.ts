export { HOME_SERVICES_RECIPE } from './home-services';
export { PROFESSIONAL_SERVICES_RECIPE } from './professional-services';
export { WELLNESS_SERVICES_RECIPE } from './wellness-services';

import { HOME_SERVICES_RECIPE } from './home-services';
import { PROFESSIONAL_SERVICES_RECIPE } from './professional-services';
import { WELLNESS_SERVICES_RECIPE } from './wellness-services';
import type { LayoutRecipe } from '../types';

export const LOCAL_SERVICE_RECIPES: LayoutRecipe[] = [
    HOME_SERVICES_RECIPE,
    PROFESSIONAL_SERVICES_RECIPE,
    WELLNESS_SERVICES_RECIPE
];

export const DEFAULT_LOCAL_SERVICE_RECIPE = HOME_SERVICES_RECIPE;
