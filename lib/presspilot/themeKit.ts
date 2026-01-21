import path from 'node:path';
import { PressPilotNormalizedContext, PressPilotVariationManifest } from '@/types/presspilot';
import { resolveBusinessCopy } from '@/lib/presspilot/kit';
import { generateTheme, GeneratorOptions } from '@/src/generator/index';
import { BaseTheme, GeneratorData } from '@/src/generator/types';

export interface ThemeBuildResult {
  themeDir: string;
  themeZipPath: string;
}

export async function buildWordPressTheme(
  context: PressPilotNormalizedContext,
  variation: PressPilotVariationManifest,
  options?: { businessTypeId?: string | null; styleVariation?: string | null; kitSummary?: any | null; baseTheme?: string | null }
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
  }

  // 2. Prepare Generator Data
  const copy = await resolveBusinessCopy(context, variation, businessTypeId ?? null);

  const generatorData: GeneratorData = {
    name: context.brand.name,
    primary: context.visual.custom_colors?.primary,
    secondary: context.visual.custom_colors?.secondary,
    hero_headline: variation.preview.label, // Or copy.hero.title
    hero_subheadline: copy.hero.subtitle,
    industry: industry,
    // Pass other data if needed
  };

  // 3. Call The Generator Engine
  console.log(`[themeKit] invoking Generator for ${context.brand.name} (Base: ${baseTheme}, Industry: ${industry})`);

  const result = await generateTheme({
    base: baseTheme,
    mode: 'standard', // Always standard for now
    data: generatorData,
    // We can let the generator handle output paths, or override if needed. 
    // The generator returns the path.
  });

  return {
    themeDir: result.themeDir,
    themeZipPath: result.downloadPath
  };
}
