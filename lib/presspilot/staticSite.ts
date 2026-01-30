import path from 'node:path';
import { promises as fs } from 'node:fs';
import AdmZip from 'adm-zip';
import { PressPilotNormalizedContext, PressPilotVariationManifest } from '@/types/presspilot';
import { resolveBusinessCopy, PressPilotBusinessCopy } from '@/lib/presspilot/kit';
import { KitSummary, writeKitSummaryFile } from '@/lib/presspilot/kitSummary';
import { buildWpImportXmlFromKit } from '@/lib/presspilot/wpImport';
import { getBusinessCategoryById } from '@/app/mvp-demo/businessCategories';
import {
  renderHeroBasic,
  renderFeaturesGrid,
  renderPricingColumns,
  renderBlogTeasers,
  renderCtaContact
} from '@/lib/staticSite/blocks';

export interface StaticBuildResult {
  staticDir: string;
  staticZipPath: string;
}

const BUILD_ROOT = path.join('/tmp', 'presspilot-build');
const STATIC_ROOT = path.join(BUILD_ROOT, 'static');

export async function buildStaticSite(
  context: PressPilotNormalizedContext,
  variation: PressPilotVariationManifest,
  options?: { businessTypeId?: string | null; kitSummary?: KitSummary | null }
): Promise<StaticBuildResult> {
  await fs.mkdir(BUILD_ROOT, { recursive: true });
  await fs.mkdir(STATIC_ROOT, { recursive: true });

  const siteDir = path.join(STATIC_ROOT, context.brand.slug);
  await fs.rm(siteDir, { recursive: true, force: true });
  await fs.mkdir(siteDir, { recursive: true });

  const assetsDir = path.join(siteDir, 'assets');
  await fs.mkdir(assetsDir, { recursive: true });

  const copy = await resolveBusinessCopy(context, variation, options?.businessTypeId ?? null);

  await fs.writeFile(path.join(assetsDir, 'styles.css'), buildStyles(variation), 'utf8');

  // Handle Logo Extraction
  if (context.visual.logo_url && context.visual.logo_url.startsWith('data:image')) {
    const imagesDir = path.join(assetsDir, 'images');
    await fs.mkdir(imagesDir, { recursive: true });

    const logoBase64 = context.visual.logo_url.split(';base64,').pop();
    if (logoBase64) {
      await fs.writeFile(path.join(imagesDir, 'logo.png'), Buffer.from(logoBase64, 'base64'));
    }
  }

  const html = buildHtml(context, copy, options);
  await fs.writeFile(path.join(siteDir, 'index.html'), html, 'utf8');

  const summaryWithTagline = options?.kitSummary
    ? { ...options.kitSummary, tagline: copy.hero.subtitle }
    : null;
  await writeKitSummaryFile(siteDir, summaryWithTagline);
  if (summaryWithTagline) {
    const importerXml = await buildWpImportXmlFromKit({ kit: summaryWithTagline, copy });
    const importerPath = path.join(siteDir, 'presspilot-demo-content.xml');
    await fs.writeFile(importerPath, importerXml, 'utf8');
    console.log('[WPImport] wrote static demo XML:', importerPath);
  }

  const staticZipPath = path.join(STATIC_ROOT, `${context.brand.slug}.zip`);
  const zip = new AdmZip();
  zip.addLocalFolder(siteDir);
  zip.writeZip(staticZipPath);
  console.log('[staticSite] wrote static zip:', staticZipPath);

  return { staticDir: siteDir, staticZipPath };
}

import { getPaletteById } from '@/lib/theme/palettes';

function buildStyles(variation: PressPilotVariationManifest) {
  const borderRadius =
    variation.tokens.corner_style === 'sharp'
      ? '8px'
      : variation.tokens.corner_style === 'rounded'
        ? '28px'
        : '16px';

  const palette = getPaletteById(variation.tokens.palette_id);
  const getColor = (slug: string, fallback: string) =>
    palette?.colors.find(c => c.slug === slug)?.color || fallback;

  const bg = getColor('background', '#f5f5f7');
  const soft = getColor('soft-bg', '#ffffff');
  const foreground = getColor('foreground', '#111827');
  const muted = getColor('muted', '#6b7280');
  const border = getColor('border', '#e5e7eb');
  const primary = getColor('primary', '#2563eb');
  const accent = getColor('accent', '#14b8a6');

  let headingFont = '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif';
  let bodyFont = '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif';

  if (variation.tokens.font_pair_id === 'serif-display') {
    headingFont = '"Playfair Display", "Times New Roman", serif';
  } else if (variation.tokens.font_pair_id === 'system-mono') {
    headingFont = 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace';
  }

  // Sync with theme.json spacing
  const spacing = {
    20: '0.75rem',
    30: '1.25rem',
    40: '1.75rem',
    50: '2.5rem',
    60: '3.5rem'
  };

  // Sync with theme.json typography
  const fontSizes = {
    xs: 'clamp(0.75rem, 0.7rem + 0.25vw, 0.875rem)',
    sm: 'clamp(0.875rem, 0.8rem + 0.375vw, 1rem)',
    base: 'clamp(1rem, 0.95rem + 0.25vw, 1.125rem)',
    lg: 'clamp(1.25rem, 1.1rem + 0.75vw, 1.5rem)',
    xl: 'clamp(1.75rem, 1.5rem + 1.25vw, 2.25rem)',
    xxl: 'clamp(2.5rem, 2.1rem + 2vw, 3.5rem)'
  };

  return `:root {
  --wp--preset--color--base: ${bg};
  --wp--preset--color--soft-bg: ${soft};
  --wp--preset--color--contrast: ${foreground};
  --wp--preset--color--muted: ${muted};
  --wp--preset--color--border: ${border};
  --wp--preset--color--primary: ${primary};
  --wp--preset--color--accent: ${accent};
  --presspilot-radius: ${borderRadius};
  --presspilot-max-width: 1100px;
  --presspilot-font-heading: ${headingFont};
  --presspilot-font-body: ${bodyFont};

  /* Spacing */
  --wp--preset--spacing--20: ${spacing[20]};
  --wp--preset--spacing--30: ${spacing[30]};
  --wp--preset--spacing--40: ${spacing[40]};
  --wp--preset--spacing--50: ${spacing[50]};
  --wp--preset--spacing--60: ${spacing[60]};

  /* Typography */
  --wp--preset--font-size--small: ${fontSizes.sm};
  --wp--preset--font-size--medium: ${fontSizes.base};
  --wp--preset--font-size--large: ${fontSizes.lg};
  --wp--preset--font-size--x-large: ${fontSizes.xl};
  --wp--preset--font-size--xx-large: ${fontSizes.xxl};
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: var(--presspilot-font-body);
  background: var(--wp--preset--color--base);
  color: var(--wp--preset--color--contrast);
  font-size: var(--wp--preset--font-size--medium);
  line-height: 1.6;
}

h1, h2, h3, h4, h5, h6 {
  font-family: var(--presspilot-font-heading);
  font-weight: 700;
  line-height: 1.15;
  margin-bottom: 0.75em;
  color: var(--wp--preset--color--contrast);
}

a {
  color: inherit;
  text-decoration: none;
}

header {
  position: sticky;
  top: 0;
  background: var(--wp--preset--color--base);
  border-bottom: 1px solid var(--wp--preset--color--border);
  z-index: 10;
}

header nav {
  max-width: var(--presspilot-max-width);
  margin: 0 auto;
  padding: 1rem 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1.5rem;
}

header nav .nav-links {
  display: flex;
  gap: 1.5rem;
  align-items: center;
}

header nav a {
  font-size: 0.95rem;
  font-weight: 500;
  color: var(--wp--preset--color--muted);
}

header nav a:hover {
  color: var(--wp--preset--color--contrast);
}

main {
  margin: 0 auto 4rem;
}

.presspilot-section {
  max-width: var(--presspilot-max-width);
  margin: 0 auto;
  padding: var(--wp--preset--spacing--60) var(--wp--preset--spacing--40);
}

.presspilot-section + .presspilot-section {
  border-top: 1px solid var(--wp--preset--color--border);
}

.section-subhead {
  color: var(--wp--preset--color--muted);
  margin: 0 auto;
  max-width: 640px;
  text-align: center;
  line-height: 1.6;
  font-size: var(--wp--preset--font-size--small);
}

.hero-basic {
  text-align: center;
  padding-top: var(--wp--preset--spacing--60);
  padding-bottom: var(--wp--preset--spacing--60);
}

.hero-basic .hero-eyebrow {
  color: var(--wp--preset--color--muted);
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.2em;
  margin-bottom: 1rem;
}

.hero-basic .hero-title {
  font-size: var(--wp--preset--font-size--xx-large);
  margin: 0 0 1rem;
}

.hero-basic .hero-subtitle {
  margin: 0 auto 2rem;
  max-width: 720px;
  color: var(--wp--preset--color--muted);
  line-height: 1.6;
  font-size: var(--wp--preset--font-size--large);
}

.hero-basic .hero-ctas {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 1rem;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  font-weight: 600;
  padding: 0.7rem 1.4rem;
  border: 1px solid transparent;
  transition: box-shadow 0.2s ease, transform 0.2s ease;
  font-size: var(--font-base);
}

.btn.primary {
  background: var(--wp--preset--color--primary);
  color: var(--wp--preset--color--base);
  box-shadow: 0 10px 20px rgba(0,0,0,0.1);
}

.btn.secondary {
  border-color: rgba(17, 24, 39, 0.2);
  color: var(--presspilot-foreground);
  background: transparent;
}

.btn.ghost {
  border-color: var(--presspilot-soft);
  color: var(--presspilot-foreground);
  background: var(--presspilot-soft);
}

.features-grid .feature-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: var(--wp--preset--spacing--40);
  margin-top: var(--wp--preset--spacing--40);
}

.features-grid .feature-card {
  background: var(--wp--preset--color--soft-bg);
  border: 1px solid var(--wp--preset--color--border);
  border-radius: var(--presspilot-radius);
  padding: var(--wp--preset--spacing--30);
}

.features-grid .feature-card h3 {
  font-size: var(--wp--preset--font-size--large);
  margin-top: 0;
  margin-bottom: 0.5rem;
}

.features-grid .feature-card p {
  font-size: var(--wp--preset--font-size--small);
  margin: 0;
  color: var(--wp--preset--color--muted);
}

.pricing-columns .pricing-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: var(--wp--preset--spacing--40);
  margin-top: var(--wp--preset--spacing--40);
}

.pricing-card {
  border: 1px solid var(--wp--preset--color--border);
  border-radius: var(--presspilot-radius);
  padding: var(--wp--preset--spacing--40);
  background: var(--wp--preset--color--soft-bg);
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.pricing-card.highlight {
  border-color: var(--wp--preset--color--primary);
  box-shadow: 0 15px 30px rgba(0,0,0,0.05);
  border-width: 2px;
}

.pricing-card .price {
  font-size: var(--wp--preset--font-size--x-large);
  margin: 0;
  font-weight: 700;
}

.pricing-card ul {
  padding-left: 1.2rem;
  margin: 0;
  color: var(--wp--preset--color--muted);
  font-size: var(--wp--preset--font-size--small);
}

.blog-teasers .blog-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: var(--wp--preset--spacing--30);
  margin-top: var(--wp--preset--spacing--40);
}

.blog-card {
  border: 1px solid var(--wp--preset--color--border);
  border-radius: var(--presspilot-radius);
  padding: var(--wp--preset--spacing--30);
  background: var(--wp--preset--color--soft-bg);
}

.blog-card h3 {
  font-size: var(--wp--preset--font-size--large);
  margin-top: 0.5rem;
  margin-bottom: 0.5rem;
}

.blog-card p {
  font-size: var(--wp--preset--font-size--small);
  margin: 0;
  color: var(--wp--preset--color--muted);
}

.blog-card small {
  display: block;
  color: var(--wp--preset--color--muted);
  margin-bottom: 0.5rem;
  font-size: 0.8rem;
}

.cta-contact {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: var(--wp--preset--spacing--40);
  background: var(--wp--preset--color--soft-bg);
  border-radius: var(--presspilot-radius);
  border: 1px solid var(--wp--preset--color--border);
  padding: var(--wp--preset--spacing--60) var(--wp--preset--spacing--40);
}

.cta-contact__copy h2 {
  margin-top: 0;
  font-size: var(--wp--preset--font-size--x-large);
}

.cta-contact__copy p {
  font-size: var(--wp--preset--font-size--small);
}

.cta-contact__copy ul {
  list-style: none;
  padding: 0;
  margin: 1rem 0 0;
  font-size: var(--wp--preset--font-size--small);
}

.cta-contact__card {
  border: 1px dashed var(--wp--preset--color--border);
  border-radius: var(--presspilot-radius);
  padding: var(--wp--preset--spacing--40);
  background: var(--wp--preset--color--base);
}

footer {
  background: var(--wp--preset--color--contrast);
  color: var(--wp--preset--color--base);
  padding: 4rem 1.5rem;
  text-align: center;
  font-size: var(--wp--preset--font-size--small);
}
`;
}

function buildHtml(
  context: PressPilotNormalizedContext,
  copy: PressPilotBusinessCopy,
  options?: { businessTypeId?: string | null; kitSummary?: KitSummary | null }
) {
  const isEcommerce = options?.businessTypeId === 'ecommerce_store' ||
    options?.businessTypeId?.toLowerCase().includes('ecom') ||
    options?.businessTypeId?.toLowerCase().includes('store');
  const isRestaurant = options?.businessTypeId === 'restaurant_cafe' ||
    options?.businessTypeId?.toLowerCase().includes('restaurant') ||
    options?.businessTypeId?.toLowerCase().includes('cafe');

  // Get business category and use its defaultMenu for nav items
  // Note: BusinessCategory from types/presspilot.ts may not match BusinessCategoryId from businessCategories.ts
  // We cast it and handle the case where it doesn't exist
  const businessCategory = getBusinessCategoryById(context.brand.category as any);

  // Use kitSummary menu items if available (source of truth), otherwise fallback to business category defaults
  let menuItems: string[] = [];
  if (options?.kitSummary?.wpImport?.menu?.items) {
    menuItems = [...options.kitSummary.wpImport.menu.items];
    // Capitalize items for display
    menuItems = menuItems.map(item => item.charAt(0).toUpperCase() + item.slice(1));
  } else {
    menuItems = [...(businessCategory?.defaultMenu || ['Home', 'About', 'Blog', 'Contact'])];

    // Ensure 'Shop' is in nav if it's ecommerce
    if (isEcommerce && !menuItems.some(item => item.toLowerCase() === 'shop')) {
      menuItems.push('Shop');
    }

    // Ensure 'Menu' is in the nav if it's a restaurant (only for fallback path)
    if (isRestaurant && !menuItems.some(item => item.toLowerCase() === 'menu')) {
      const homeIndex = menuItems.findIndex(item => item.toLowerCase() === 'home');
      if (homeIndex !== -1) {
        menuItems.splice(homeIndex + 1, 0, 'Menu');
      } else {
        menuItems.push('Menu');
      }
    }
  }

  // Map menu labels to section IDs (lowercase slugs)
  const navLinks = menuItems
    .map((label) => {
      const id = label.toLowerCase().replace(/\s+/g, '-');
      return { id, label };
    })
    .map((item) => `<a href="#${item.id}">${item.label}</a>`)
    .join('');

  // Build sections array, conditionally including menu section for restaurants
  const sections = [
    renderHeroBasic(copy.hero),
    renderFeaturesGrid(copy.featuresHeading, copy.features),
  ];

  // Add menu section for restaurants (before pricing)
  if (isRestaurant) {
    sections.push(`  <section id="menu" class="presspilot-section menu-section">
    <div style="max-width: 1100px; margin: 0 auto;">
      <h2 style="text-align: center; font-size: 2.5rem; font-weight: 800; margin-bottom: 0.5rem;">The Menu</h2>
      <p style="text-align: center; color: var(--wp--preset--color--muted); margin-bottom: 3.5rem;">Handcrafted for your delight.</p>
      
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); gap: 3rem;">
        <div>
          <h3 style="padding-bottom: 0.5rem; border-bottom: 2px solid var(--wp--preset--color--border); margin-bottom: 1.5rem;">Main Dishes</h3>
          <div style="display: flex; justify-content: space-between; margin-bottom: 1rem;">
             <div>
                <strong style="display: block;">Classic Margherita</strong>
                <small style="color: var(--wp--preset--color--muted);">Tomato, basil, fresh mozzarella</small>
             </div>
             <strong>$14</strong>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 1rem;">
             <div>
                <strong style="display: block;">Artisan Pepperoni</strong>
                <small style="color: var(--wp--preset--color--muted);">Spicy honey, aged pepperoni</small>
             </div>
             <strong>$17</strong>
          </div>
        </div>
        
        <div>
           <h3 style="padding-bottom: 0.5rem; border-bottom: 2px solid var(--wp--preset--color--border); margin-bottom: 1.5rem;">Desserts</h3>
           <div style="display: flex; justify-content: space-between; margin-bottom: 1rem;">
             <div>
                <strong style="display: block;">House Tiramisu</strong>
                <small style="color: var(--wp--preset--color--muted);">Espresso-soaked ladyfingers</small>
             </div>
             <strong>$9</strong>
          </div>
        </div>
      </div>
    </div>
  </section>`);
  }

  // Add E-commerce section (Shop Grid)
  if (isEcommerce) {
    sections.push(`  <section id="shop" class="presspilot-section shop-section">
    <div style="max-width: 1100px; margin: 0 auto;">
      <h2 style="text-align: center; font-size: 2.5rem; font-weight: 800; margin-bottom: 3.5rem;">Latest Collections</h2>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 2.5rem;">
        <div style="text-align: center;">
          <div style="background: var(--wp--preset--color--soft-bg); aspect-ratio: 1; border-radius: var(--presspilot-radius); margin-bottom: 1rem; display: flex; align-items: center; justify-content: center; font-size: 3rem;">👕</div>
          <h3 style="font-size: 1.1rem; margin-bottom: 0.25rem;">Classic Essentials</h3>
          <p style="color: var(--wp--preset--color--muted); font-weight: 600;">$45.00</p>
        </div>
        <div style="text-align: center;">
          <div style="background: var(--wp--preset--color--soft-bg); aspect-ratio: 1; border-radius: var(--presspilot-radius); margin-bottom: 1rem; display: flex; align-items: center; justify-content: center; font-size: 3rem;">🧢</div>
          <h3 style="font-size: 1.1rem; margin-bottom: 0.25rem;">Urban Cap</h3>
          <p style="color: var(--wp--preset--color--muted); font-weight: 600;">$25.00</p>
        </div>
        <div style="text-align: center;">
          <div style="background: var(--wp--preset--color--soft-bg); aspect-ratio: 1; border-radius: var(--presspilot-radius); margin-bottom: 1rem; display: flex; align-items: center; justify-content: center; font-size: 3rem;">👟</div>
          <h3 style="font-size: 1.1rem; margin-bottom: 0.25rem;">Active Trainers</h3>
          <p style="color: var(--wp--preset--color--muted); font-weight: 600;">$89.00</p>
        </div>
      </div>
    </div>
  </section>`);
  }

  sections.push(
    renderPricingColumns(context),
    renderBlogTeasers(context),
    renderCtaContact(copy.contact)
  );

  return `<!DOCTYPE html>
<html lang="${context.language.primary}">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${context.brand.name} – PressPilot Kit</title>
    <link rel="stylesheet" href="./assets/styles.css" />
  </head>
  <body>
    <!-- Generated by PressPilot · archetype: ${context.siteArchetype} -->
    <header>
      <nav>
        ${context.visual.has_logo
      ? `<img src="./assets/images/logo.png" alt="${context.brand.name}" style="height: 40px; width: auto; display: block;" />`
      : `<strong style="font-size: 1.25rem; letter-spacing: -0.02em;">${context.brand.name}</strong>`
    }
        <div class="nav-links">
          ${navLinks}
        </div>
      </nav>
    </header>
    <main>
      ${sections}
    </main>
    <footer>
      © ${new Date().getFullYear()} ${context.brand.name}. All rights reserved.
    </footer>
  </body>
</html>`;
}
