import {
  BusinessCategory,
  PressPilotSaaSInput,
  PressPilotSaaSInputV2,
  SupportedLanguageCode
} from '@/types/presspilot';
import type { TT4PaletteId, TT4FontProfile, TT4HeroLayout, TT4BrandStyle } from '@/lib/theme/palettes';

/**
 * Brand Kit slot names for user color overrides
 * Maps to backend BrandKitSlot type
 */
export type BrandKitSlot =
  | 'primary'
  | 'accent'
  | 'background'
  | 'surface'
  | 'text'
  | 'heading'
  | 'muted'
  | 'border'
  | 'cta-bg'
  | 'cta-text';

export interface BrandKitEdit {
  slot: BrandKitSlot;
  hex: string;
}

export interface StudioFormInput {
  businessName?: string;
  businessDescription?: string;
  primaryLanguage?: string;
  businessCategory?: string;
  slug?: string;
  heroTitle?: string;
  paletteId?: string;
  fontPairId?: string;
  logoBase64?: string;
  logoPath?: string; // Local absolute path for OS usage
  menus?: any[]; // For restaurant usage
  palette?: {
    primary?: string;
    secondary?: string;
    accent?: string;
  };

  // ========================================================================
  // TT4-Aligned Studio UI Inputs
  // ========================================================================

  /**
   * Selected palette preset ID (TT4-aligned)
   * Options: 'brand-kit' | 'saas-bright' | 'local-biz-soft' | 'restaurant-soft' | 'ecommerce-bold'
   */
  selectedPaletteId?: TT4PaletteId;

  /**
   * User-edited brand kit overrides
   * Allows fine-tuning specific color slots after palette selection
   */
  userEditedBrandKit?: BrandKitEdit[];

  /**
   * Font profile selection (TT4-aligned)
   * Options: 'elegant' | 'modern' | 'bold' | 'friendly'
   */
  fontProfile?: TT4FontProfile;

  /**
   * Hero layout selection
   * Options: 'fullBleed' | 'fullWidth' | 'split' | 'minimal'
   */
  heroLayout?: TT4HeroLayout;

  /**
   * Brand style selection (restaurant vertical only)
   * Determines base theme: 'playful' (Tove) vs 'modern' (Frost)
   */
  brandStyle?: TT4BrandStyle;

  // ========================================================================
  // Contact Information (Phase 13 - Best Practices)
  // ========================================================================

  /**
   * Business contact email address
   * Used in contact page, footer, and patterns
   */
  contactEmail?: string;

  /**
   * Business phone number
   * Used in contact page, footer, and header (if applicable)
   */
  contactPhone?: string;

  /**
   * Street address line
   */
  contactAddress?: string;

  /**
   * City name
   */
  contactCity?: string;

  /**
   * State/Province/Region
   */
  contactState?: string;

  /**
   * ZIP/Postal code
   */
  contactZip?: string;

  /**
   * Country (optional)
   */
  contactCountry?: string;

  /**
   * Opening hours (key: day name, value: hours string)
   * Example: { "Monday": "9am - 5pm", "Saturday": "Closed" }
   */
  openingHours?: Record<string, string>;

  /**
   * Social media links
   */
  socialLinks?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    linkedin?: string;
    youtube?: string;
    tiktok?: string;
  };
}

export function buildSaaSInputFromStudioInput(input?: StudioFormInput): PressPilotSaaSInput {
  const businessName = input?.businessName?.trim();
  const description = input?.businessDescription?.trim();

  if (!businessName) throw new Error('Missing Business Name');
  if (!description) throw new Error('Missing Business Description');

  const category = resolveBusinessCategory(input?.businessCategory);

  const base: PressPilotSaaSInput = {
    brand: {
      business_name: businessName,
      business_category: category,
      business_tagline: input?.heroTitle || 'Welcome',
      slug: (input?.slug || businessName.toLowerCase().replace(/[^a-z0-9]+/g, '-')).slice(0, 60)
    },
    narrative: {
      description_long: description
    },
    language: {
      primary_language: resolveLanguage(input?.primaryLanguage),
      rtl_required: resolveLanguage(input?.primaryLanguage) === 'ar'
    },
    modes: {
      business_category: category,
      restaurant: {
        enabled: category === 'restaurant_cafe',
        menus: input?.menus
      },
      ecommerce: { enabled: category === 'ecommerce' }
    },
    visualControls: {
      palette_id: input?.paletteId || 'pp-slate',
      font_pair_id: input?.fontPairId || 'pp-inter',
      layout_density: 'balanced',
      corner_style: 'rounded',
      custom_colors: input?.palette ? {
        primary: input.palette.primary,
        secondary: input.palette.secondary,
        accent: input.palette.accent
      } : undefined,
      // TT4-aligned design system inputs
      selectedPaletteId: input?.selectedPaletteId,
      userEditedBrandKit: input?.userEditedBrandKit,
      fontProfile: input?.fontProfile,
      heroLayout: input?.heroLayout,
      brandStyle: input?.brandStyle
    },
    visualAssets: {
      has_logo: !!input?.logoBase64 || !!input?.logoPath,
      logo_file_url: input?.logoBase64 || input?.logoPath, // Map path for extraction
      image_source_preference: 'mixed',
      image_keywords: [category, 'business']
    },
    // Contact information (Phase 13 - Best Practices)
    contact: {
      email: input?.contactEmail,
      phone: input?.contactPhone,
      address: input?.contactAddress,
      city: input?.contactCity,
      state: input?.contactState,
      zip: input?.contactZip,
      country: input?.contactCountry,
      openingHours: input?.openingHours,
      socialLinks: input?.socialLinks
    }
  };

  return base;
}

export interface StudioRequestPayload {
  payload?: PressPilotSaaSInput;
  input?: StudioFormInput;
}

const LANGUAGE_MAP: Record<string, SupportedLanguageCode> = {
  en: 'en',
  en_us: 'en',
  en_gb: 'en',
  es: 'es',
  es_es: 'es',
  fr: 'fr',
  it: 'it',
  ar: 'ar',
  de: 'en'
};

const BUSINESS_CATEGORY_MAP: Record<string, BusinessCategory> = {
  service: 'service',
  product: 'ecommerce',
  ecommerce: 'ecommerce',
  restaurant: 'restaurant_cafe',
  restaurant_cafe: 'restaurant_cafe',
  'restaurant-cafe': 'restaurant_cafe',
  local: 'local_store',
  local_store: 'local_store',
  'local-store': 'local_store',
  'tech / saas': 'saas_product',
  'tech_startup': 'saas_product',
  'saas': 'saas_product',
  'saas_product': 'saas_product',
  nonprofit: 'other',
  other: 'other'
};

function resolveLanguage(code?: string): SupportedLanguageCode {
  const normalized = (code ?? 'en').toLowerCase().replace('-', '_') as keyof typeof LANGUAGE_MAP;
  return LANGUAGE_MAP[normalized] ?? 'en';
}

function resolveBusinessCategory(value?: string): BusinessCategory {
  if (!value) return 'service';
  const key = value.toLowerCase() as keyof typeof BUSINESS_CATEGORY_MAP;
  return BUSINESS_CATEGORY_MAP[key] ?? 'service';
}



export function resolveStudioPayload(payload: StudioRequestPayload): PressPilotSaaSInput {
  if (payload.payload) {
    return payload.payload as PressPilotSaaSInputV2;
  }
  return buildSaaSInputFromStudioInput(payload.input);
}

