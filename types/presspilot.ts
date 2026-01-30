export type SupportedLanguageCode = 'en' | 'es' | 'fr' | 'it' | 'ar';

export type BusinessCategory =
  | 'restaurant_cafe'
  | 'ecommerce'
  | 'service'
  | 'fitness'
  | 'health_fitness'
  | 'beauty_salon'
  | 'corporate'
  | 'professional_services'
  | 'online_coach'
  | 'saas_product'
  | 'local_store'
  | 'local_service'
  | 'portfolio'
  | 'other';

export interface CTAItem {
  label: string;
  url?: string;
}

export interface RestaurantMenuItem {
  name: string;
  description?: string;
  price?: string;
  currency?: string;
  dietary_tags?: string[];
}

export interface RestaurantMenuSection {
  name: string;
  description?: string;
  items: RestaurantMenuItem[];
}

export interface EcommerceProduct {
  name: string;
  description?: string;
  price?: number;
  image_prompt?: string;
}

export interface PressPilotSaaSInput {
  brand: {
    business_name: string;
    business_tagline?: string;
    business_category: BusinessCategory;
    region_or_country?: string;
    slug?: string;
  };
  language: {
    primary_language: SupportedLanguageCode;
    secondary_languages?: SupportedLanguageCode[];
    rtl_required: boolean;
  };
  narrative: {
    description_long: string;
    audience_notes?: string;
    niche_tags?: string[];
    goals?: string;
  };
  visualAssets: {
    has_logo: boolean;
    logo_file_url?: string;
    logo_external_url?: string;
    reference_site_url?: string;
    image_source_preference: 'stock-only' | 'ai-only' | 'mixed';
    image_keywords?: string[];
  };
  visualControls: {
    palette_id: string;
    custom_colors?: {
      primary?: string;
      secondary?: string;
      accent?: string;
    };
    font_pair_id: string;
    layout_density: 'cozy' | 'balanced' | 'spacious';
    corner_style: 'rounded' | 'mixed' | 'sharp';
    primary_ctas?: CTAItem[];
  };
  modes: {
    business_category: BusinessCategory;
    restaurant: {
      enabled: boolean;
      supports_dine_in?: boolean;
      supports_takeout?: boolean;
      supports_delivery?: boolean;
      menu_sections?: RestaurantMenuSection[];
      menus?: any[];
      menu_pdf_url?: string;
      reservation_link?: string;
      order_online_link?: string;
    } | null;
    ecommerce: {
      enabled: boolean;
      store_type?: 'physical' | 'digital' | 'both';
      currency?: string;
      product_categories?: string[];
      sample_products?: EcommerceProduct[];
      policies?: {
        shipping?: string;
        returns?: string;
        privacy?: string;
      };
    } | null;
  };
  system?: {
    plan_tier?: 'free' | 'pro' | 'enterprise';
    ai_model_tier?: 'default' | 'advanced';
    image_tier?: 'stock' | 'dalle' | 'mixed';
    external_ref_id?: string;
  };
}

export type PressPilotSaaSInputV2 = PressPilotSaaSInput;

import type { NavItemSpec, SiteArchetype } from '@/lib/presspilot/site-architecture';

export interface PressPilotNormalizedContext {
  brand: {
    name: string;
    tagline?: string;
    category: BusinessCategory;
    region_or_country?: string;
    slug: string;
  };
  language: {
    primary: SupportedLanguageCode;
    secondary: SupportedLanguageCode[];
    rtl_required: boolean;
  };
  narrative: {
    description_long: string;
    audience_notes?: string;
    niche_tags?: string[];
    goals?: string;
  };
  visual: {
    has_logo: boolean;
    logo_url?: string;
    reference_site_url?: string;
    image_source_preference: 'stock-only' | 'ai-only' | 'mixed';
    image_keywords?: string[];
    palette_id: string;
    // New: Allow direct hex overrides
    custom_colors?: {
      primary?: string;
      secondary?: string;
      accent?: string;
    };
    font_pair_id: string;
    layout_density: 'cozy' | 'balanced' | 'spacious';
    corner_style: 'rounded' | 'mixed' | 'sharp';
    primary_ctas?: CTAItem[];
  };
  modes: {
    business_category: BusinessCategory;
    restaurant_enabled: boolean;
    ecommerce_enabled: boolean;
    needs_menu_nav_item: boolean;
    needs_shop_nav_item: boolean;
  };
  siteArchetype: SiteArchetype;
  navShell: NavItemSpec[];
}

export type VariationId = 'variation_a' | 'variation_b' | 'variation_c';

export interface PressPilotVariationTokens {
  palette_id: string;
  font_pair_id: string;
  layout_density: 'cozy' | 'balanced' | 'spacious';
  corner_style: 'rounded' | 'mixed' | 'sharp';
}

export interface PressPilotVariationNavMeta {
  has_menu_nav_item: boolean;
  has_shop_nav_item: boolean;
}

export interface PressPilotVariationPreviewMeta {
  id: VariationId;
  label: string;
  description: string;
  thumbnail_url?: string;
  imageUrl?: string;
}

export interface PressPilotVariationManifest {
  id: VariationId;
  tokens: PressPilotVariationTokens;
  nav: PressPilotVariationNavMeta;
  preview: PressPilotVariationPreviewMeta;
  pattern_set_id: string;
}

export interface PressPilotVariationSet {
  context: PressPilotNormalizedContext;
  variations: PressPilotVariationManifest[];
}

export interface DownloadLinks {
  themeZipUrl: string;
  staticSiteZipUrl: string;
}

