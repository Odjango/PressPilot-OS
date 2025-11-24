import {
  PressPilotNormalizedContext,
  PressPilotVariationManifest,
  PressPilotVariationSet,
  VariationId,
} from '@/types/presspilot';

export type RawVariationResponse = {
  variations?: Array<Partial<PressPilotVariationManifest>>;
};

export const VARIATION_IDS: VariationId[] = [
  'variation_a',
  'variation_b',
  'variation_c',
];

const LAYOUT_OPTIONS = new Set(['cozy', 'balanced', 'spacious']);
const CORNER_OPTIONS = new Set(['rounded', 'mixed', 'sharp']);

export function buildVariationSetFromAI(
  context: PressPilotNormalizedContext,
  raw?: RawVariationResponse,
): PressPilotVariationSet {
  const normalizedVariations = VARIATION_IDS.map((id, index) =>
    normalizeVariation(raw?.variations?.[index], id, context),
  );

  return {
    context,
    variations: normalizedVariations,
  };
}

function normalizeVariation(
  raw: Partial<PressPilotVariationManifest> | undefined,
  id: VariationId,
  context: PressPilotNormalizedContext,
): PressPilotVariationManifest {
  const tokens: Partial<PressPilotVariationManifest['tokens']> = raw?.tokens ?? {};
  const preview: Partial<PressPilotVariationManifest['preview']> = raw?.preview ?? {};
  const nav: Partial<PressPilotVariationManifest['nav']> = raw?.nav ?? {};

  const paletteId = typeof tokens.palette_id === 'string' && tokens.palette_id.trim()
    ? tokens.palette_id
    : context.visual.palette_id;
  const fontPairId = typeof tokens.font_pair_id === 'string' && tokens.font_pair_id.trim()
    ? tokens.font_pair_id
    : context.visual.font_pair_id;

  const layoutDensity = LAYOUT_OPTIONS.has(tokens.layout_density as string)
    ? (tokens.layout_density as PressPilotVariationManifest['tokens']['layout_density'])
    : context.visual.layout_density;

  const cornerStyle = CORNER_OPTIONS.has(tokens.corner_style as string)
    ? (tokens.corner_style as PressPilotVariationManifest['tokens']['corner_style'])
    : context.visual.corner_style;

  return {
    id,
    tokens: {
      palette_id: paletteId,
      font_pair_id: fontPairId,
      layout_density: layoutDensity,
      corner_style: cornerStyle
    },
    nav: {
      has_menu_nav_item: typeof nav.has_menu_nav_item === 'boolean' ? nav.has_menu_nav_item : context.modes.needs_menu_nav_item,
      has_shop_nav_item: typeof nav.has_shop_nav_item === 'boolean' ? nav.has_shop_nav_item : context.modes.needs_shop_nav_item
    },
    preview: {
      id,
      label: preview.label ?? `Variation ${id.split('_')[1]?.toUpperCase() ?? ''}`,
      description:
        preview.description ?? `A direction that keeps ${context.brand.name} on-brand for ${context.brand.category}.`
    },
    pattern_set_id: raw?.pattern_set_id ?? `pattern_set_${id}`
  };
}
