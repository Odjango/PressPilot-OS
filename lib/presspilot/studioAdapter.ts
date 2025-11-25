import {
  BusinessCategory,
  PressPilotSaaSInput,
  PressPilotSaaSInputV2,
  SupportedLanguageCode
} from '@/types/presspilot';

export interface StudioFormInput {
  businessName?: string;
  businessDescription?: string;
  primaryLanguage?: string;
  businessCategory?: string;
  slug?: string;
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

export function buildSaaSInputFromStudioInput(input?: StudioFormInput): PressPilotSaaSInput {
  const businessName = input?.businessName?.trim() || 'PressPilot Demo Co.';
  const description = input?.businessDescription?.trim() || 'A modern business generated via PressPilot.';
  const primaryLanguage = resolveLanguage(input?.primaryLanguage);
  const businessCategory = resolveBusinessCategory(input?.businessCategory);
  const rtlRequired = primaryLanguage === 'ar';

  const base: PressPilotSaaSInput = {
    brand: {
      business_name: businessName,
      business_tagline: 'Powered by PressPilot OS',
      business_category: businessCategory,
      region_or_country: 'Global',
      slug: input?.slug
    },
    language: {
      primary_language: primaryLanguage,
      secondary_languages: [],
      rtl_required: rtlRequired
    },
    narrative: {
      description_long: description,
      audience_notes: 'Studio playground submission',
      niche_tags: ['studio', 'presspilot'],
      goals: 'Generate a polished kit for demo purposes'
    },
    visualAssets: {
      has_logo: false,
      image_source_preference: 'mixed',
      image_keywords: ['brand', 'web design']
    },
    visualControls: {
      palette_id: 'pp-default',
      font_pair_id: 'pp-fontpair-01',
      layout_density: 'balanced',
      corner_style: 'rounded',
      primary_ctas: [
        { label: 'Book a call', url: '#contact' },
        { label: 'View work', url: '#portfolio' }
      ]
    },
    modes: {
      business_category: businessCategory,
      restaurant: businessCategory === 'restaurant_cafe' ? { enabled: true } : null,
      ecommerce: businessCategory === 'ecommerce' ? { enabled: true, store_type: 'both', currency: 'USD' } : null
    },
    system: {
      plan_tier: 'free',
      ai_model_tier: 'default',
      image_tier: 'stock'
    }
  };

  return base;
}

export function resolveStudioPayload(payload: StudioRequestPayload): PressPilotSaaSInput {
  if (payload.payload) {
    return payload.payload as PressPilotSaaSInputV2;
  }
  return buildSaaSInputFromStudioInput(payload.input);
}

