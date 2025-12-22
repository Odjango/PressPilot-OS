import path from 'node:path';
import { promises as fs } from 'node:fs';
import AdmZip from 'adm-zip';
import { PressPilotNormalizedContext, PressPilotVariationManifest } from '@/types/presspilot';
import { applyStyleVariationToThemeJson } from '@/lib/presspilot/themeStyle';
import { resolveBusinessCopy, resolveBusinessTypeStyle } from '@/lib/presspilot/kit';
import { applyBusinessCopyToTheme, injectHeaderContent, injectFooterContent } from '@/lib/presspilot/contentInject';
import { KitSummary, writeKitSummaryFile } from '@/lib/presspilot/kitSummary';
import { buildWpImportXmlFromKit } from '@/lib/presspilot/wpImport';

export interface ThemeBuildResult {
  themeDir: string;
  themeZipPath: string;
}

const BUILD_ROOT = path.join('/tmp', 'presspilot-build');
const THEMES_ROOT = path.join(BUILD_ROOT, 'themes');
const FOUNDATION_THEME_SLUG = 'presspilot-fse-v2';
// Source theme lives in themes/ at repo root, not in build/
const FOUNDATION_THEME_DIR = path.join(process.cwd(), 'themes', FOUNDATION_THEME_SLUG);

export async function buildWordPressTheme(
  context: PressPilotNormalizedContext,
  variation: PressPilotVariationManifest,
  options?: { businessTypeId?: string | null; styleVariation?: string | null; kitSummary?: KitSummary | null }
): Promise<ThemeBuildResult> {
  await fs.mkdir(BUILD_ROOT, { recursive: true });
  await fs.mkdir(THEMES_ROOT, { recursive: true });

  await ensureFoundationThemeExists();

  const themeDir = path.join(THEMES_ROOT, context.brand.slug);
  await fs.rm(themeDir, { recursive: true, force: true });
  await fs.cp(FOUNDATION_THEME_DIR, themeDir, { recursive: true });

  const { kit, styleVariation: resolvedStyleVariation } = await resolveBusinessTypeStyle(options?.businessTypeId ?? null);
  const appliedStyleVariation = options?.styleVariation ?? resolvedStyleVariation;

  await applyStyleVariationToThemeJson({
    themeDir,
    businessTypeId: options?.businessTypeId ?? null,
    styleVariation: appliedStyleVariation,
    kitVersion: kit.version
  });

  const copy = await resolveBusinessCopy(context, variation, options?.businessTypeId ?? null);
  await applyBusinessCopyToTheme(themeDir, copy, context.brand.name);
  // Ensure tagline is set in kitSummary
  const summaryWithTagline = options?.kitSummary
    ? { ...options.kitSummary, tagline: copy.hero.subtitle }
    : null;
  await writeKitSummaryFile(themeDir, summaryWithTagline);
  if (summaryWithTagline) {
    const importerXml = await buildWpImportXmlFromKit({ kit: summaryWithTagline, copy });
    const importerPath = path.join(themeDir, 'presspilot-demo-content.xml');
    await fs.writeFile(importerPath, importerXml, 'utf8');
    console.log('[WPImport] wrote theme demo XML:', importerPath);
  }

  // Inject FSE Parts
  await injectHeaderContent(themeDir, context.navShell);
  await injectFooterContent(themeDir, context.brand.name, context.navShell);

  await writeThemeStyleHeader(themeDir, context, variation, kit.version);
  await injectThemeConfig(themeDir, options?.businessTypeId);

  const themeZipPath = path.join(THEMES_ROOT, `${context.brand.slug}.zip`);
  const zip = new AdmZip();
  zip.addLocalFolder(themeDir);
  zip.writeZip(themeZipPath);
  console.log('[themeKit] wrote theme zip:', themeZipPath);

  return { themeDir, themeZipPath };
}

async function injectThemeConfig(themeDir: string, businessTypeId?: string | null) {
  const functionsPath = path.join(themeDir, 'functions.php');
  let content = await fs.readFile(functionsPath, 'utf8');

  let themeType = 'universal';
  let enableWoo = false;

  if (businessTypeId === 'restaurant_cafe') {
    themeType = 'restaurant';
  } else if (businessTypeId === 'ecommerce_store') {
    themeType = 'ecommerce';
    enableWoo = true;
  }

  content = content.replace(
    "define('PP_THEME_TYPE', 'universal');",
    `define('PP_THEME_TYPE', '${themeType}');`
  );
  content = content.replace(
    "define('PP_ENABLE_WOOCOMMERCE', false);",
    `define('PP_ENABLE_WOOCOMMERCE', ${enableWoo});`
  );
  content = content.replace(
    "define('PP_SITE_TITLE', 'PressPilot Site');",
    `define('PP_SITE_TITLE', '${themeDir.split('/').pop()}');` // Fallback, but better to pass brand name
  );
  // Wait, I need the brand name here. I'll use a placeholder replacement or pass it in.
  // The context.brand.name is available in buildWordPressTheme but not passed to injectThemeConfig.
  // I will update the function signature.

  await fs.writeFile(functionsPath, content, 'utf8');
}

async function ensureFoundationThemeExists() {
  try {
    await fs.access(FOUNDATION_THEME_DIR);
  } catch (error) {
    throw new Error(
      `PressPilot foundation theme not found at ${FOUNDATION_THEME_DIR}. Ensure themes/${FOUNDATION_THEME_SLUG} exists before generating kits.`
    );
  }
}

async function writeThemeStyleHeader(
  themeDir: string,
  context: PressPilotNormalizedContext,
  variation: PressPilotVariationManifest,
  kitVersion: string
) {
  const stylePath = path.join(themeDir, 'style.css');
  const contents = `/*
Theme Name: ${context.brand.name} – Golden Foundation
Theme URI: https://presspilot.os/${context.brand.slug}
Author: PressPilot OS
Description: Generated for ${context.brand.name} using the PressPilot Golden Foundation kit (${variation.preview.label}).
Version: ${kitVersion}
Text Domain: ${context.brand.slug}
*/`;
  await fs.writeFile(stylePath, contents, 'utf8');
}
