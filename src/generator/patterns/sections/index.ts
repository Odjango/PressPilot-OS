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
export { getRestaurantChefHighlightSectionWithContext } from './restaurant-chef-highlight';
export { getRestaurantChefTeamSectionWithContext } from './restaurant-chef-team';
export { getRestaurantGalleryGridSectionWithContext } from './restaurant-gallery-grid';
export { getRestaurantGallerySectionWithContext } from './restaurant-gallery';
export { getRestaurantHoursLocationSectionWithContext } from './restaurant-hours-location';
export { getRestaurantLocationMapSectionWithContext } from './restaurant-location-map';
export { getRestaurantLocationSectionWithContext } from './restaurant-location';
export { getRestaurantAwardsPressSectionWithContext } from './restaurant-awards-press';
export { getRestaurantMenuCategoriesSectionWithContext } from './restaurant-menu-categories';
export { getRestaurantReservationFormSectionWithContext } from './restaurant-reservation-form';

// SaaS sections (Phase 5)
export { getSaasHeroSectionWithContext } from './saas-hero';
export { getSaasFeaturesGridSectionWithContext } from './saas-features-grid';
export { getSaasPricingTableSectionWithContext } from './saas-pricing-table';
export { getSaasTestimonialsSectionWithContext } from './saas-testimonials';
export { getSaasHowItWorksSectionWithContext } from './saas-how-it-works';
export { getSaasCTABannerSectionWithContext } from './saas-cta-banner';
export { getSaasFAQSectionWithContext } from './saas-faq';
export { getSaasLogosSectionWithContext } from './saas-logos';

// Portfolio/Talent sections
export { getPortfolioHeroSectionWithContext } from './portfolio-hero';
export { getPortfolioAboutSectionWithContext } from './portfolio-about';
export { getPortfolioGallerySectionWithContext } from './portfolio-gallery';
export { getPortfolioProjectCardSectionWithContext } from './portfolio-project-card';
export { getPortfolioSkillsSectionWithContext } from './portfolio-skills';
export { getPortfolioExperienceSectionWithContext } from './portfolio-experience';
export { getPortfolioTestimonialsSectionWithContext } from './portfolio-testimonials';
export { getPortfolioContactSectionWithContext } from './portfolio-contact';
export { getPortfolioCTASectionWithContext } from './portfolio-cta';

// Restaurant style tokens (for playful vs modern differentiation)
export { getRestaurantStyleTokens, RESTAURANT_STYLE_TOKENS } from './restaurantThemeTokens';
export type { RestaurantStyle, RestaurantStyleTokens } from './restaurantThemeTokens';

// Ecommerce sections (Phase 4)
export { getEcommerceHeroSectionWithContext } from './ecommerce-hero';
export { getEcommerceCategoryGridSectionWithContext } from './ecommerce-category-grid';
export { getEcommerceFeaturedProductsSectionWithContext } from './ecommerce-featured-products';
export { getEcommerceTrustBadgesSectionWithContext } from './ecommerce-trust-badges';
export { getEcommerceNewsletterSectionWithContext } from './ecommerce-newsletter';
