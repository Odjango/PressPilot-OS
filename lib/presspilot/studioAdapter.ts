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
  heroTitle?: string;
  paletteId?: string;
  fontPairId?: string;
  logoBase64?: string;
  palette?: {
    primary?: string;
    secondary?: string;
    accent?: string;
  };
}

// ... (omitted lines)

export function buildSaaSInputFromStudioInput(input?: StudioFormInput): PressPilotSaaSInput {
  const businessName = input?.businessName?.trim() || 'PressPilot Demo Co.';
  const description = input?.businessDescription?.trim() || 'A modern business generated via PressPilot.';
  // ...

  const base: PressPilotSaaSInput = {
    // ...
    visualAssets: {
      has_logo: !!input?.logoBase64,
      // Note: Actual logo data handling would need to be passed to context or stored, 
      // but for now we signal intent.
      image_source_preference: 'mixed',
      image_keywords: ['brand', 'web design']
    },
    // ...
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

