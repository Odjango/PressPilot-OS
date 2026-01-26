import path from 'node:path';
import { PressPilotNormalizedContext, PressPilotVariationManifest } from '@/types/presspilot';
import { resolveBusinessCopy } from '@/lib/presspilot/kit';
import { generateTheme, GeneratorOptions } from '@/src/generator/index';
import { BaseTheme, GeneratorData } from '@/src/generator/types';
import { RecipeRegistry } from '@/src/generator/recipes/index';
import { getSmartCopy } from '@/src/generator/copy/defaults';

export interface ThemeBuildResult {
  themeDir: string;
  themeZipPath: string;
}

export async function buildWordPressTheme(
  context: PressPilotNormalizedContext,
  variation: PressPilotVariationManifest,
  options?: {
    businessTypeId?: string | null;
    styleVariation?: string | null;
    kitSummary?: any | null;
    baseTheme?: string | null;
    // Overrides for Variations
    heroPattern?: string;
    dataOverride?: Partial<GeneratorData>;
    outputSlug?: string; // FORCE filename
  }
): Promise<ThemeBuildResult> {
  // 1. Resolve Industry and Base Theme
  const businessTypeId = options?.businessTypeId;
  let industry = 'saas'; // Default
  let baseTheme: BaseTheme = (options?.baseTheme as BaseTheme) || 'ollie';

  if (businessTypeId) {
    if (businessTypeId === 'restaurant_cafe') {
      industry = 'restaurant';
    } else if (businessTypeId === 'saas_product') {
      industry = 'saas';
    } else if (businessTypeId === 'professional_services') {
      industry = 'agency';
      baseTheme = 'frost'; // Override to Frost for agencies as per rules
    } else if (businessTypeId === 'online_coach') {
      industry = 'general';
      baseTheme = 'twentytwentyfour';
    } else {
      industry = 'general';
    }
  } else {
    // SMART DETECTION: Infer industry from name if not provided
    const nameLower = (options?.dataOverride?.name || context.brand.name || '').toLowerCase();
    if (nameLower.includes('pizza') || nameLower.includes('restaurant') || nameLower.includes('cafe') || nameLower.includes('coffee') || nameLower.includes('grill') || nameLower.includes('bistro') || nameLower.includes('food') || nameLower.includes('bakery') || nameLower.includes('dining')) {
      console.log(`[themeKit] Auto-detected Industry 'restaurant' from name '${nameLower}'`);
      industry = 'restaurant';
    }
  }

  // 2. Prepare Generator Data
  const copy = await resolveBusinessCopy(context, variation, businessTypeId ?? null);

  // FACTORY UPGRADE: Get Smart Copy Defaults
  const smartCopy = getSmartCopy(industry);

  // FACTORY UPGRADE: Get Recipe
  // For Phase 1, we map 'restaurant' -> 'restaurant', others default to saas or empty
  const recipeKey = industry === 'restaurant' ? 'restaurant' : 'saas';
  const recipe = RecipeRegistry[recipeKey] || RecipeRegistry['saas']; // Fallback

  // Placeholder for extractedColors - assuming it would be populated by a previous step if available
  const extractedColors = null; // Or an object like { primary: '#...', secondary: '#...', accent: '#...' }

  // Decide final colors: Override > Extracted > Context > Default
  const finalPrimary = options?.dataOverride?.primary || extractedColors?.primary || context.visual.custom_colors?.primary;
  const finalSecondary = options?.dataOverride?.secondary || extractedColors?.secondary || context.visual.custom_colors?.secondary;
  const finalAccent = options?.dataOverride?.accent || extractedColors?.accent || context.visual.custom_colors?.accent;

  const generatorData: GeneratorData = {
    // Priority: Override > Context > Default
    name: options?.dataOverride?.name || context.brand.name,
    primary: finalPrimary,
    secondary: finalSecondary,
    accent: finalAccent,

    hero_headline: variation.preview.label, // Or copy.hero.title
    hero_subheadline: copy.hero.subtitle,
    industry: industry,

    // FACTORY UPGRADE: Build Pages from Recipe
    pages: recipe?.pages.map(page => {
      // Hydrate content with Smart Copy if available
      const pageCopy = smartCopy[page.slug] || {};
      return {
        ...page,
        content: {
          ...page.content,
          hero_title: pageCopy.title || page.title,
          hero_sub: pageCopy.sub || copy.hero.subtitle,
          // Add more hydration logic here
        }
      };
    }) || []
  };

  // 3. Call The Generator Engine
  console.log(`[themeKit] invoking Generator for ${generatorData.name} (Base: ${baseTheme}, Industry: ${industry})`);

  const result = await generateTheme({
    base: baseTheme,
    mode: 'standard', // Always standard for now
    data: generatorData,
    heroPattern: options?.heroPattern, // PASS OVERRIDE
    slug: options?.outputSlug // PASS SLUG
    // We can let the generator handle output paths, or override if needed. 
    // The generator returns the path.
  });

  return {
    themeDir: result.themeDir,
    themeZipPath: result.downloadPath
  };
}
