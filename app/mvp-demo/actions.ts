'use server';

import {
  DownloadLinks,
  PressPilotNormalizedContext,
  PressPilotSaaSInput,
  PressPilotVariationManifest,
  PressPilotVariationSet
} from '@/types/presspilot';
import { getSiteNavForCategory } from '@/lib/presspilot/site-architecture';

const demoPayload: PressPilotSaaSInput = {
  brand: {
    business_name: 'Placeholder Co.',
    business_tagline: 'Future kits made easy',
    business_category: 'service',
    region_or_country: 'Remote'
  },
  language: {
    primary_language: 'en',
    secondary_languages: [],
    rtl_required: false
  },
  narrative: {
    description_long: 'Placeholder long-form description used during Stage 02 scaffolding.',
    audience_notes: 'Operators and DIY founders',
    niche_tags: ['minimal', 'studio'],
    goals: 'Gather leads'
  },
  visualAssets: {
    has_logo: false,
    image_source_preference: 'mixed'
  },
  visualControls: {
    palette_id: 'pp-palette-01',
    font_pair_id: 'pp-fontpair-01',
    layout_density: 'balanced',
    corner_style: 'rounded'
  },
  modes: {
    business_category: 'service',
    restaurant: null,
    ecommerce: null
  }
};

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'presspilot-kit';

function toNormalizedContext(payload: PressPilotSaaSInput): PressPilotNormalizedContext {
  const slug = slugify(payload.brand.business_name);
  const isRestaurant = payload.modes.business_category === 'restaurant_cafe';
  const isEcommerce = payload.modes.business_category === 'ecommerce';
  const needsMenu = isRestaurant && Boolean(payload.modes.restaurant?.menu_sections?.length);
  const needsShop = isEcommerce;
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
      primary: payload.language.primary_language,
      secondary: payload.language.secondary_languages ?? [],
      rtl_required: payload.language.rtl_required
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
      font_pair_id: payload.visualControls.font_pair_id,
      layout_density: payload.visualControls.layout_density,
      corner_style: payload.visualControls.corner_style,
      primary_ctas: payload.visualControls.primary_ctas
    },
    modes: {
      business_category: payload.modes.business_category,
      restaurant_enabled: isRestaurant,
      ecommerce_enabled: isEcommerce,
      needs_menu_nav_item: needsMenu,
      needs_shop_nav_item: needsShop
    },
    siteArchetype: archetype,
    navShell
  };
}

function buildVariation(
  id: PressPilotVariationManifest['id'],
  context: PressPilotNormalizedContext,
  overrides: Partial<PressPilotVariationManifest['tokens']>,
  description: string
): PressPilotVariationManifest {
  return {
    id,
    tokens: {
      palette_id: overrides.palette_id ?? context.visual.palette_id,
      font_pair_id: overrides.font_pair_id ?? context.visual.font_pair_id,
      layout_density: overrides.layout_density ?? context.visual.layout_density,
      corner_style: overrides.corner_style ?? context.visual.corner_style
    },
    nav: {
      has_menu_nav_item: context.modes.needs_menu_nav_item,
      has_shop_nav_item: context.modes.needs_shop_nav_item
    },
    preview: {
      id,
      label: id === 'variation_a' ? 'Variation A' : id === 'variation_b' ? 'Variation B' : 'Variation C',
      description,
      thumbnail_url: undefined
    },
    pattern_set_id: `pattern_set_${id}`
  };
}

function createVariationSet(context: PressPilotNormalizedContext): PressPilotVariationSet {
  const variations: PressPilotVariationManifest[] = [
    buildVariation(
      'variation_a',
      context,
      {},
      `Balanced layout tuned for ${context.brand.category}.`
    ),
    buildVariation(
      'variation_b',
      context,
      {
        palette_id: `${context.visual.palette_id}-alt`,
        font_pair_id: `${context.visual.font_pair_id}-alt`,
        layout_density: 'cozy',
        corner_style: 'mixed'
      },
      'High-energy look with tighter spacing and accent palette.'
    ),
    buildVariation(
      'variation_c',
      context,
      {
        layout_density: 'spacious',
        corner_style: 'sharp'
      },
      'Airy option for premium services and corporate teams.'
    )
  ];

  return { context, variations };
}

export async function generateVariations(
  payload: PressPilotSaaSInput = demoPayload
): Promise<PressPilotVariationSet> {
  const context = toNormalizedContext(payload);
  return createVariationSet(context);
}

export async function generateDownloads(selectedVariationId: string): Promise<DownloadLinks> {
  const slug = selectedVariationId?.trim() || 'presspilot-demo-kit';
  return {
    themeZipUrl: `/build/themes/${slug}.zip`,
    staticSiteZipUrl: `/build/static/${slug}.zip`
  };
}

export { demoPayload };
