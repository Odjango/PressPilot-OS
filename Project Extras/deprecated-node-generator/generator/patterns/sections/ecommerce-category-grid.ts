/**
 * Ecommerce Category Grid Section - Generator 2.0 Phase 4
 *
 * 4-column grid of category cards with images.
 * Each card links to a category page.
 *
 * Token mappings:
 * - Section padding: tokens.spacing.sectionPadding
 * - Card radius: tokens.radius.card
 * - Image radius: tokens.radius.image
 * - Column gap: tokens.spacing.columnGap
 */

import type { SectionContext } from '../../recipes/types';
import { getEcommerceCategoriesSectionWithContext } from './ecommerce-categories';

// Legacy alias for backward compatibility with older recipes.
export function getEcommerceCategoryGridSectionWithContext(ctx: SectionContext): string {
    return getEcommerceCategoriesSectionWithContext(ctx);
}
