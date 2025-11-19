import {
  PressPilotNormalizedContext,
  PressPilotVariationManifest,
  PressPilotVariationSet,
  VariationId
} from '@/types/presspilot';
import { getModel, getOpenAI } from '../openaiClient';

const VARIATION_IDS: VariationId[] = ['variation_a', 'variation_b', 'variation_c'];
const LAYOUT_OPTIONS = new Set(['cozy', 'balanced', 'spacious']);
const CORNER_OPTIONS = new Set(['rounded', 'mixed', 'sharp']);

interface RawVariationResponse {
  variations: Array<Partial<PressPilotVariationManifest>>;
}

export async function generatePressPilotVariations(
  context: PressPilotNormalizedContext
): Promise<PressPilotVariationSet> {
  const client = getOpenAI();
  const model = getModel();

  const systemPrompt =
    'You are the PressPilot variation engine. Return three website directions as JSON. ' +
    'Do not include prose. Stick to the allowed tokens. Mention “Menu” or “Shop” nav only when requested.';

  const userPayload = {
    brand: context.brand,
    narrative: context.narrative,
    visual: context.visual,
    modes: context.modes
  };

  const completion = await client.chat.completions.create({
    model,
    response_format: { type: 'json_object' },
    temperature: 0.4,
    messages: [
      { role: 'system', content: systemPrompt },
      {
        role: 'user',
        content: `Return exactly three variations (variation_a, variation_b, variation_c) as JSON.
Each variation requires: id, tokens { palette_id, font_pair_id, layout_density, corner_style },
nav { has_menu_nav_item, has_shop_nav_item }, preview { id, label, description }, pattern_set_id.
Context: ${JSON.stringify(userPayload)}`
      }
    ]
  });

  const rawContent = completion.choices?.[0]?.message?.content;
  if (!rawContent) {
    throw new Error('OpenAI returned an empty response while creating variations.');
  }

  let parsed: RawVariationResponse;
  try {
    parsed = JSON.parse(rawContent) as RawVariationResponse;
  } catch (error) {
    throw new Error('Failed to parse variation JSON from OpenAI.');
  }

  const normalizedVariations = VARIATION_IDS.map((id, index) =>
    normalizeVariation(parsed.variations?.[index], id, context)
  );

  return {
    context,
    variations: normalizedVariations
  };
}

function normalizeVariation(
  raw: Partial<PressPilotVariationManifest> | undefined,
  id: VariationId,
  context: PressPilotNormalizedContext
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
