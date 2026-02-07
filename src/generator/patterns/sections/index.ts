/**
 * Section Pattern Exports
 *
 * Reusable homepage sections for universal-home.ts and other templates.
 *
 * Phase 3 adds WithContext variants that receive SectionContext for
 * token-driven styling. Original functions maintained for backward compatibility.
 */

export { getValuePropositionSection } from './value-proposition';
export { getServicesGridSection } from './services-grid';
export { getSocialProofSection, getSocialProofSectionWithContext } from './social-proof';
export { getFAQSection } from './faq-section';
export { getFinalCTASection, getFinalCTASectionWithContext } from './final-cta';

// Restaurant-specific sections (Recipe v1 + Phase 3 WithContext)
export {
    getRestaurantStorySection,
    getRestaurantStorySectionWithContext
} from './restaurant-story';
export {
    getRestaurantMenuPreviewSection,
    getRestaurantMenuPreviewSectionWithContext
} from './restaurant-menu-preview';
export {
    getRestaurantPromoBandSection,
    getRestaurantPromoBandSectionWithContext
} from './restaurant-promo-band';

// Restaurant style tokens (for playful vs modern differentiation)
export { getRestaurantStyleTokens, RESTAURANT_STYLE_TOKENS } from './restaurantThemeTokens';
export type { RestaurantStyle, RestaurantStyleTokens } from './restaurantThemeTokens';

// Ecommerce sections (Phase 4)
export { getEcommerceHeroSectionWithContext } from './ecommerce-hero';
export { getEcommerceCategoryGridSectionWithContext } from './ecommerce-category-grid';
export { getEcommerceFeaturedProductsSectionWithContext } from './ecommerce-featured-products';
export { getEcommerceTrustBadgesSectionWithContext } from './ecommerce-trust-badges';
export { getEcommerceNewsletterSectionWithContext } from './ecommerce-newsletter';
