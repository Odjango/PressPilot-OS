import fs from 'fs/promises';
import path from 'path';
import { resolveBusinessTypeStyle } from '@/lib/presspilot/kit';
import { getVariationById } from '@/lib/presspilot/variationRegistry';

type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K];
};

function deepMerge(target: any, source: any): any {
  if (Array.isArray(target) || Array.isArray(source)) {
    return Array.isArray(source) ? source : target;
  }

  if (typeof target === 'object' && target !== null && typeof source === 'object' && source !== null) {
    const result: Record<string, JsonValue> = { ...target };
    for (const key of Object.keys(source)) {
      result[key] = deepMerge(result[key], source[key]);
    }
    return result;
  }

  return source === undefined ? target : source;
}

export async function applyStyleVariationToThemeJson(opts: {
  themeDir: string;
  businessTypeId: string | null | undefined;
  styleVariation?: string | null;
  kitVersion?: string | null;
  customColors?: { primary?: string; secondary?: string };
}) {
  const { themeDir, businessTypeId, styleVariation: overrideStyleVariation, kitVersion: overrideKitVersion, customColors } = opts;
  const { kit, styleVariation: resolvedStyleVariation, variation } = await resolveBusinessTypeStyle(businessTypeId);
  const styleVariation = overrideStyleVariation ?? resolvedStyleVariation;

  if (!styleVariation) {
    console.log('[PressPilot] No styleVariation resolved for businessTypeId:', businessTypeId);
    return;
  }

  const themeJsonPath = path.join(themeDir, 'theme.json');
  const variationConfig =
    styleVariation === variation?.id
      ? variation
      : getVariationById(styleVariation) ?? variation ?? null;
  const paletteRelativePath = variationConfig?.paletteFile ?? path.join('styles', `${styleVariation}.json`);
  const variationPath = path.isAbsolute(paletteRelativePath)
    ? paletteRelativePath
    : path.join(themeDir, paletteRelativePath);

  let themeJsonRaw: string;
  let variationRaw: string;

  try {
    themeJsonRaw = await fs.readFile(themeJsonPath, 'utf8');
  } catch (error) {
    console.warn('[PressPilot] theme.json not found at', themeJsonPath, error);
    return;
  }

  try {
    variationRaw = await fs.readFile(variationPath, 'utf8');
  } catch (error) {
    console.warn('[PressPilot] style variation not found at', variationPath, 'for', styleVariation, error);
    return;
  }

  let themeJson: Record<string, JsonValue>;
  let variationJson: { settings?: DeepPartial<JsonValue>; styles?: DeepPartial<JsonValue> };

  try {
    themeJson = JSON.parse(themeJsonRaw);
    variationJson = JSON.parse(variationRaw);
  } catch (error) {
    console.error('[PressPilot] Failed to parse theme/variation JSON', error);
    return;
  }

  const merged: Record<string, JsonValue> = { ...themeJson };

  if (variationJson.settings) {
    merged.settings = deepMerge(merged.settings || {}, variationJson.settings);
  }

  if (variationJson.styles) {
    merged.styles = deepMerge(merged.styles || {}, variationJson.styles);
  }

  const existingCustom = ((merged.custom ?? {}) as Record<string, JsonValue>) || {};
  const existingPresspilot =
    (typeof existingCustom.presspilot === 'object' && existingCustom.presspilot !== null
      ? (existingCustom.presspilot as Record<string, JsonValue>)
      : {}) || {};

  const kitVersion = overrideKitVersion ?? kit.version;

  merged.custom = {
    ...existingCustom,
    presspilot: {
      ...existingPresspilot,
      appliedStyleVariation: styleVariation,
      businessTypeId: businessTypeId ?? null,
      kitVersion
    }
  };

  // Enforce WP 6.4+ FSE Standards
  merged.version = 2;
  const existingSettings = (merged.settings as Record<string, JsonValue>) || {};

  // CUSTOM COLOR OVERRIDE
  if (customColors && existingSettings.color) {
    const colorSettings = existingSettings.color as Record<string, JsonValue>;
    if (Array.isArray(colorSettings.palette)) {
      colorSettings.palette = colorSettings.palette.map((swatch: any) => {
        if (customColors.primary && (swatch.slug === 'primary' || swatch.slug === 'brand')) {
          return { ...swatch, color: customColors.primary };
        }
        if (customColors.secondary && (swatch.slug === 'secondary' || swatch.slug === 'brand-alt')) {
          return { ...swatch, color: customColors.secondary };
        }
        return swatch;
      });
      console.log('[PressPilot] Injected Custom Brand Colors:', customColors);
    }
  }

  merged.settings = {
    ...existingSettings,
    appearanceTools: true,
    useRootPaddingAwareAlignments: true,
    layout: deepMerge(existingSettings.layout || {}, {
      contentSize: '620px',
      wideSize: '1280px'
    })
  };

  await fs.writeFile(themeJsonPath, JSON.stringify(merged, null, 2), 'utf8');

  console.log(
    '[PressPilot] Applied style variation',
    styleVariation,
    'for businessTypeId',
    businessTypeId,
    'to themeDir',
    themeDir
  );
}

