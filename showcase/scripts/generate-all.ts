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

function imageSet(seed: number, topic: string, count = 20): string[] {
  return Array.from({ length: count }, (_, i) =>
    `https://source.unsplash.com/800x600/?${encodeURIComponent(topic)}&sig=${seed * 100 + i}`
  );
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

function businessTypeFor(theme: CatalogTheme): string {
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
  return byRecipe[theme.recipe] || theme.recipe;
}

function topicFor(vertical: CatalogTheme['vertical']): string {
  switch (vertical) {
    case 'restaurant': return 'restaurant food interior';
    case 'saas': return 'saas software dashboard';
    case 'portfolio': return 'creative portfolio design';
    case 'local-service': return 'local service business team';
    case 'ecommerce': return 'ecommerce product lifestyle';
  }
}

function seedData(theme: CatalogTheme): GeneratorData {
  const numericId = Number.parseInt(theme.id, 10);
  const images = imageSet(numericId, topicFor(theme.vertical), 22);
  const pages = pagesFor(theme.vertical);

  const base: GeneratorData = {
    name: theme.name,
    industry: theme.vertical,
    businessType: businessTypeFor(theme),
    brandMode: theme.brandMode,
    hero_headline: theme.name,
    hero_subheadline: theme.tagline,
    description: `${theme.name} is a production showcase theme for the ${theme.vertical} vertical. Built for ${theme.brandMode} brand personality and ${theme.recipe} composition, it demonstrates polished layout structure, practical content flow, and conversion-ready sections.`,
    pages,
    images,
    email: `hello@${theme.slug}.example`,
    phone: '(555) 010-1000',
    address: '100 Market Street',
    city: 'San Francisco',
    state: 'CA',
    zip: '94105',
    country: 'USA',
    socialLinks: {
      facebook: `https://facebook.com/${theme.slug}`,
      instagram: `https://instagram.com/${theme.slug}`,
      twitter: `https://x.com/${theme.slug}`,
      linkedin: `https://linkedin.com/company/${theme.slug}`,
    },
    openingHours: {
      Monday: '9:00 AM - 6:00 PM',
      Tuesday: '9:00 AM - 6:00 PM',
      Wednesday: '9:00 AM - 6:00 PM',
      Thursday: '9:00 AM - 6:00 PM',
      Friday: '9:00 AM - 6:00 PM',
      Saturday: '10:00 AM - 4:00 PM',
      Sunday: 'Closed',
    }
  };

  if (theme.vertical === 'restaurant') {
    base.menus = [
      { title: 'Appetizers', items: [
        { name: 'Seasonal Bruschetta', price: '$14', description: 'Tomato confit, basil, sourdough.' },
        { name: 'Crispy Calamari', price: '$16', description: 'Lemon aioli, herbs.' },
        { name: 'Burrata Plate', price: '$18', description: 'Heirloom tomatoes, olive oil.' },
        { name: 'Roasted Carrots', price: '$13', description: 'Whipped feta, pistachio.' },
      ]},
      { title: 'Mains', items: [
        { name: 'Braised Short Rib', price: '$34', description: 'Parsnip puree, jus.' },
        { name: 'Pan-Seared Salmon', price: '$29', description: 'Lemon butter, greens.' },
        { name: 'Truffle Pasta', price: '$27', description: 'Fresh tagliatelle, parmigiano.' },
        { name: 'Woodfired Chicken', price: '$26', description: 'Herbs, roasted potatoes.' },
      ]},
      { title: 'Desserts', items: [
        { name: 'Tiramisu', price: '$12', description: 'Espresso mascarpone layers.' },
        { name: 'Panna Cotta', price: '$11', description: 'Vanilla bean, berries.' },
        { name: 'Chocolate Tart', price: '$13', description: 'Sea salt, cream.' },
        { name: 'Gelato Trio', price: '$10', description: 'Chef selection.' },
      ]}
    ];
  }

  if (theme.vertical === 'ecommerce') {
    for (let i = 1; i <= 16; i++) {
      (base as any)[`product_${i}_title`] = `Product ${i}`;
      (base as any)[`product_${i}_price`] = `$${(20 + i * 3).toFixed(2)}`;
      (base as any)[`product_${i}_description`] = `Premium product ${i} with crafted materials and reliable quality.`;
      (base as any)[`product_${i}_image`] = images[(i - 1) % images.length];
    }
    for (let i = 1; i <= 4; i++) {
      (base as any)[`category_${i}_name`] = ['Tops', 'Bottoms', 'Accessories', 'Footwear'][i - 1];
      (base as any)[`category_${i}_image`] = images[(i + 4) % images.length];
    }
  }

  return base;
}

async function main(): Promise<void> {
  const { from, to } = resolveRange();
  const catalog = await fs.readJson(CATALOG_PATH) as Catalog;

  await fs.ensureDir(THEMES_DIR);
  await fs.ensureDir(ZIPS_DIR);

  const selected = catalog.themes.filter((t) => {
    const num = Number.parseInt(t.id, 10);
    return num >= from && num <= to;
  });

  if (selected.length === 0) {
    throw new Error(`No catalog entries in range ${from}-${to}`);
  }

  const report: Array<Record<string, string>> = [];

  for (const theme of selected) {
    const folderName = `${theme.id}-${theme.slug}`;
    const outDir = path.join(THEMES_DIR, folderName);
    const slug = folderName;

    const result = await generateTheme({
      mode: 'standard',
      brandMode: theme.brandMode,
      slug,
      outDir: THEMES_DIR,
      data: seedData(theme),
    });

    if (result.status !== 'success') {
      throw new Error(`Generation failed: ${theme.id} ${theme.name}`);
    }

    const zipPath = path.join(ZIPS_DIR, `${folderName}.zip`);
    await fs.copy(result.downloadPath, zipPath, { overwrite: true });

    const frontPage = path.join(outDir, 'templates', 'front-page.html');
    if (!(await fs.pathExists(frontPage))) {
      throw new Error(`Missing front-page template: ${frontPage}`);
    }

    report.push({
      id: theme.id,
      name: theme.name,
      vertical: theme.vertical,
      mode: theme.brandMode,
      recipe: theme.recipe,
      output: path.relative(ROOT, outDir),
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
