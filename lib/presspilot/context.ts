import {
  BusinessCategory,
  PressPilotNormalizedContext,
  PressPilotSaaSInput,
  SupportedLanguageCode
} from '@/types/presspilot';
import { sanitizeSlug } from '@/lib/presspilot/validation';
import { getSiteNavForCategory } from '@/lib/presspilot/site-architecture';

const MENU_CATEGORIES: BusinessCategory[] = ['restaurant_cafe'];
const SHOP_CATEGORIES: BusinessCategory[] = ['ecommerce'];

export function slugifyBusinessName(name: string): string {
  return sanitizeSlug(name);
}

export function deriveModesFromCategory(category: BusinessCategory) {
  const restaurantEnabled = MENU_CATEGORIES.includes(category);
  const ecommerceEnabled = SHOP_CATEGORIES.includes(category);

  return {
    business_category: category,
    restaurant_enabled: restaurantEnabled,
    ecommerce_enabled: ecommerceEnabled,
    needs_menu_nav_item: restaurantEnabled,
    needs_shop_nav_item: ecommerceEnabled
  };
}

export function applyBusinessInputs(payload: PressPilotSaaSInput): PressPilotNormalizedContext {
  const slug = payload.brand.slug || sanitizeSlug(payload.brand.business_name);
  const modes = deriveModesFromCategory(payload.brand.business_category);
  const primaryLanguage: SupportedLanguageCode = payload.language.primary_language;
  const { archetype, navShell } = getSiteNavForCategory(payload.brand.business_category);

  return {
    brand: {
      name: payload.brand.business_name,
      tagline: payload.brand.business_tagline,
      category: payload.brand.business_category,
      region_or_country: payload.brand.region_or_country,
      slug
    },
    language: {
      primary: primaryLanguage,
      secondary: payload.language.secondary_languages ?? [],
      rtl_required: primaryLanguage === 'ar'
    },
    narrative: {
      description_long: payload.narrative.description_long,
      audience_notes: payload.narrative.audience_notes,
      niche_tags: payload.narrative.niche_tags,
      goals: payload.narrative.goals
    },
    visual: {
      has_logo: payload.visualAssets.has_logo,
      logo_url: payload.visualAssets.logo_file_url ?? payload.visualAssets.logo_external_url,
      reference_site_url: payload.visualAssets.reference_site_url,
      image_source_preference: payload.visualAssets.image_source_preference,
      image_keywords: payload.visualAssets.image_keywords,
      palette_id: payload.visualControls.palette_id,
      custom_colors: payload.visualControls.custom_colors,
      font_pair_id: payload.visualControls.font_pair_id,
      layout_density: payload.visualControls.layout_density,
      corner_style: payload.visualControls.corner_style,
      primary_ctas: payload.visualControls.primary_ctas
    },
    modes,
    siteArchetype: archetype,
    navShell
  };
}
