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
  imageUrl: string;
}> = [
    {
      id: 'variation_a',
      label: 'Split Hero',
      description: 'Side-by-side balanced layout with high-impact visuals and clear primary call-to-action.',
      palette: 'saas-bright',
      fontPair: 'pp-inter',
      layout: 'balanced',
      corners: 'rounded',
      imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=1200&h=600'
    },
    {
      id: 'variation_b',
      label: 'Full Width Hero',
      description: 'Immersive edge-to-edge background design with centered brand authority and bold messaging.',
      palette: 'ecom-bold',
      fontPair: 'pp-plex',
      layout: 'spacious',
      corners: 'mixed',
      imageUrl: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&q=80&w=1200&h=600'
    },
    {
      id: 'variation_c',
      label: 'Minimal Hero',
      description: 'Elegant, typography-focused layout that prioritizes content clarity and sophisticated whitespace.',
      palette: 'local-biz-soft',
      fontPair: 'pp-sans',
      layout: 'cozy',
      corners: 'sharp',
      imageUrl: 'https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?auto=format&fit=crop&q=80&w=1200&h=600'
    }
  ];

export function buildFallbackVariationSet(context: PressPilotNormalizedContext): PressPilotVariationSet {
  const hasCustomColors = context.visual?.custom_colors?.primary;

  const variations = FALLBACK_VARIATIONS.map((preset, index) => {
    // If we have custom colors, let's make the FIRST variation highly branded
    const isBrandVariation = index === 0 && hasCustomColors;

    return {
      id: preset.id,
      tokens: {
        palette_id: isBrandVariation ? 'brand-custom' : preset.palette,
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
        label: isBrandVariation ? 'Brand Vision' : preset.label,
        description: isBrandVariation
          ? `Engineered using your brand's unique color DNA. This direction prioritizes professional harmonization with your logo.`
          : preset.description,
        imageUrl: preset.imageUrl
      },
      pattern_set_id: `fallback_${preset.id}`
    };
  });

  return { context, variations };
}

