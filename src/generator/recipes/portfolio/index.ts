export { CREATIVE_PROFESSIONAL_RECIPE } from './creative-professional';
export { FREELANCER_RECIPE } from './freelancer';
export { TALENT_AGENCY_RECIPE } from './talent-agency';

import { CREATIVE_PROFESSIONAL_RECIPE } from './creative-professional';
import { FREELANCER_RECIPE } from './freelancer';
import { TALENT_AGENCY_RECIPE } from './talent-agency';
import type { LayoutRecipe } from '../types';

export const PORTFOLIO_RECIPES: LayoutRecipe[] = [
    CREATIVE_PROFESSIONAL_RECIPE,
    FREELANCER_RECIPE,
    TALENT_AGENCY_RECIPE
];

export const DEFAULT_PORTFOLIO_RECIPE = CREATIVE_PROFESSIONAL_RECIPE;
