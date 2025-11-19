import {
  PressPilotNormalizedContext,
  PressPilotVariationManifest,
  PressPilotVariationSet,
  VariationId
} from '@/types/presspilot';

const FALLBACK_VARIATIONS: Array<{
  id: VariationId;
  label: string;
  description: string;
  palette: string;
  fontPair: string;
  layout: PressPilotVariationManifest['tokens']['layout_density'];
  corners: PressPilotVariationManifest['tokens']['corner_style'];
}> = [
  {
    id: 'variation_a',
    label: 'Modern SaaS',
    description: 'Bright accent blocks, modular hero, CTA focus.',
    palette: 'pp-saas-bright',
    fontPair: 'pp-inter',
    layout: 'balanced',
    corners: 'rounded'
  },
  {
    id: 'variation_b',
    label: 'Editorial Studio',
    description: 'Dark hero band, serif headlines, grid showcase.',
    palette: 'pp-dark-pro',
    fontPair: 'pp-plex',
    layout: 'spacious',
    corners: 'mixed'
  },
  {
    id: 'variation_c',
    label: 'Commerce Launch',
    description: 'Product-forward hero, promo strips, tiered pricing.',
    palette: 'pp-ecom-bold',
    fontPair: 'pp-sans',
    layout: 'cozy',
    corners: 'sharp'
  }
];

export function buildFallbackVariationSet(context: PressPilotNormalizedContext): PressPilotVariationSet {
  const variations = FALLBACK_VARIATIONS.map((preset) => ({
    id: preset.id,
    tokens: {
      palette_id: preset.palette,
      font_pair_id: preset.fontPair,
      layout_density: preset.layout,
      corner_style: preset.corners
    },
    nav: {
      has_menu_nav_item: context.modes.needs_menu_nav_item,
      has_shop_nav_item: context.modes.needs_shop_nav_item
    },
    preview: {
      id: preset.id,
      label: preset.label,
      description: preset.description
    },
    pattern_set_id: `fallback_${preset.id}`
  }));

  return { context, variations };
}

