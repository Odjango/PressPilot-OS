import { config } from 'dotenv';
config({ path: '.env.local' });
import fs from 'fs-extra';
import path from 'node:path';
import { generateTheme } from '../../src/generator';
import type { BrandMode, GeneratorData, PageData } from '../../src/generator/types';

interface CatalogTheme {
  id: string;
  slug: string;
  name: string;
  vertical: 'restaurant' | 'saas' | 'portfolio' | 'local-service' | 'ecommerce';
  brandMode: BrandMode;
  recipe: string;
  tagline: string;
  tags: string[];
  colors: { primary: string; accent: string };
  content?: GeneratorData;
}

interface Catalog {
  version: string;
  generated: string;
  themes: CatalogTheme[];
}

const ROOT = process.cwd();
const SHOWCASE_ROOT = path.join(ROOT, 'showcase');
const CATALOG_PATH = path.join(SHOWCASE_ROOT, 'catalog.json');
const THEMES_DIR = path.join(SHOWCASE_ROOT, 'themes');
const ZIPS_DIR = path.join(SHOWCASE_ROOT, 'zips');

function argValue(name: string): string | undefined {
  const hit = process.argv.find((arg) => arg.startsWith(`--${name}=`));
  return hit ? hit.split('=')[1] : undefined;
}

function resolveRange(): { from: number; to: number } {
  const from = Number.parseInt(argValue('from') || process.env.SHOWCASE_FROM || '1', 10);
  const to = Number.parseInt(argValue('to') || process.env.SHOWCASE_TO || '10', 10);
  return {
    from: Number.isFinite(from) ? Math.max(1, from) : 1,
    to: Number.isFinite(to) ? Math.max(from, to) : 10,
  };
}

function pagesFor(vertical: CatalogTheme['vertical']): PageData[] {
  if (vertical === 'restaurant') {
    return [
      { title: 'Home', slug: 'home', template: 'universal-home' },
      { title: 'Menu', slug: 'menu', template: 'universal-menu' },
      { title: 'About', slug: 'about', template: 'universal-about' },
      { title: 'Reservations', slug: 'reservations', template: 'universal-reservation' },
      { title: 'Contact', slug: 'contact', template: 'universal-contact' },
    ];
  }
  if (vertical === 'saas') {
    return [
      { title: 'Home', slug: 'home', template: 'universal-home' },
      { title: 'Features', slug: 'features', template: 'universal-services' },
      { title: 'Pricing', slug: 'pricing', template: 'universal-services' },
      { title: 'About', slug: 'about', template: 'universal-about' },
      { title: 'Contact', slug: 'contact', template: 'universal-contact' },
    ];
  }
  if (vertical === 'portfolio') {
    return [
      { title: 'Home', slug: 'home', template: 'universal-home' },
      { title: 'Gallery', slug: 'gallery', template: 'universal-portfolio' },
      { title: 'About', slug: 'about', template: 'universal-about' },
      { title: 'Contact', slug: 'contact', template: 'universal-contact' },
    ];
  }
  if (vertical === 'local-service') {
    return [
      { title: 'Home', slug: 'home', template: 'universal-home' },
      { title: 'Services', slug: 'services', template: 'universal-services' },
      { title: 'About', slug: 'about', template: 'universal-about' },
      { title: 'FAQ', slug: 'faq', template: 'universal-services' },
      { title: 'Contact', slug: 'contact', template: 'universal-contact' },
    ];
  }
  return [
    { title: 'Home', slug: 'home', template: 'universal-home' },
    { title: 'Shop', slug: 'shop', template: 'universal-shop' },
    { title: 'About', slug: 'about', template: 'universal-about' },
    { title: 'FAQ', slug: 'faq', template: 'universal-services' },
    { title: 'Contact', slug: 'contact', template: 'universal-contact' },
  ];
}

function businessTypeFor(recipe: string): string {
  const byRecipe: Record<string, string> = {
    'classic-bistro': 'casual',
    'modern-dining': 'fine-dining',
    'startup-landing': 'startup',
    'enterprise-product': 'enterprise',
    'creative-professional': 'creative-professional',
    'freelancer': 'freelancer',
    'talent-agency': 'talent-agency',
    'home-services': 'home-services',
    'professional-services': 'professional-services',
    'wellness-services': 'wellness-services',
    'boutique-store': 'boutique-store',
    'product-showcase': 'product-showcase',
    'artisan-shop': 'artisan-shop',
  };
  return byRecipe[recipe] || recipe;
}

function buildData(theme: CatalogTheme): GeneratorData {
  const content = (theme.content || {}) as GeneratorData & {
    businessName?: string;
    headline?: string;
    tagline?: string;
  };
  const pages = content.pages || pagesFor(theme.vertical);
  const normalizedName = content.name || content.businessName || theme.name;
  const normalizedHeadline = content.hero_headline || content.headline || theme.name;
  const normalizedSubheadline = content.hero_subheadline || content.tagline || theme.tagline;

  return {
    ...content,
    name: normalizedName,
    industry: content.industry || theme.vertical,
    businessType: content.businessType || businessTypeFor(theme.recipe),
    brandMode: content.brandMode || theme.brandMode,
    hero_headline: normalizedHeadline,
    hero_subheadline: normalizedSubheadline,
    description: content.description || `${theme.name} showcase theme for ${theme.vertical}.`,
    pages,
  };
}

async function verifyThemeOutput(themeDir: string): Promise<void> {
  const templatesDir = path.join(themeDir, 'templates');
  const frontPage = path.join(templatesDir, 'front-page.html');
  if (!(await fs.pathExists(frontPage))) {
    throw new Error(`Missing front-page template: ${frontPage}`);
  }

  const pageTemplates = (await fs.readdir(templatesDir)).filter((f) => f.startsWith('page-') && f.endsWith('.html'));
  if (pageTemplates.length < 4) {
    throw new Error(`Expected at least 4 page templates in ${templatesDir}, found ${pageTemplates.length}`);
  }
}

async function main(): Promise<void> {
  const { from, to } = resolveRange();
  const catalog = (await fs.readJson(CATALOG_PATH)) as Catalog;

  await fs.ensureDir(THEMES_DIR);
  await fs.ensureDir(ZIPS_DIR);

  const selected = catalog.themes.filter((t) => {
    const num = Number.parseInt(t.id, 10);
    return num >= from && num <= to;
  });

  if (selected.length === 0) {
    throw new Error(`No catalog entries in range ${from}-${to}`);
  }

  const report: Array<Record<string, string | number>> = [];

  for (const theme of selected) {
    const folderName = `${theme.id}-${theme.slug}`;
    const data = buildData(theme);

    const result = await generateTheme({
      mode: 'standard',
      brandMode: theme.brandMode,
      slug: folderName,
      outDir: THEMES_DIR,
      data,
    });

    if (result.status !== 'success') {
      throw new Error(`Generation failed: ${theme.id} ${theme.name}`);
    }

    const outThemeDir = path.join(THEMES_DIR, folderName);
    await verifyThemeOutput(outThemeDir);

    const zipPath = path.join(ZIPS_DIR, `${folderName}.zip`);
    await fs.copy(result.downloadPath, zipPath, { overwrite: true });

    report.push({
      id: theme.id,
      name: theme.name,
      vertical: theme.vertical,
      mode: theme.brandMode,
      recipe: theme.recipe,
      pages: (data.pages || []).length,
      output: path.relative(ROOT, outThemeDir),
      zip: path.relative(ROOT, zipPath),
    });
  }

  console.table(report);
  console.log(`Generated ${report.length} themes from catalog range ${from}-${to}.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
