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
  --presspilot-bg: ${bg};
  --presspilot-soft: ${soft};
  --presspilot-foreground: ${foreground};
  --presspilot-muted: ${muted};
  --presspilot-border: ${border};
  --presspilot-primary: ${primary};
  --presspilot-accent: ${accent};
  --presspilot-radius: ${borderRadius};
  --presspilot-max-width: 1100px;
  --presspilot-font-heading: ${headingFont};
  --presspilot-font-body: ${bodyFont};

  /* Spacing */
  --spacing-20: ${spacing[20]};
  --spacing-30: ${spacing[30]};
  --spacing-40: ${spacing[40]};
  --spacing-50: ${spacing[50]};
  --spacing-60: ${spacing[60]};

  /* Typography */
  --font-xs: ${fontSizes.xs};
  --font-sm: ${fontSizes.sm};
  --font-base: ${fontSizes.base};
  --font-lg: ${fontSizes.lg};
  --font-xl: ${fontSizes.xl};
  --font-xxl: ${fontSizes.xxl};
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: var(--presspilot-font-body);
  background: var(--presspilot-bg);
  color: var(--presspilot-foreground);
  font-size: var(--font-base);
  line-height: 1.6;
}

h1, h2, h3, h4, h5, h6 {
  font-family: var(--presspilot-font-heading);
  font-weight: 700;
  line-height: 1.15;
  margin-bottom: 0.75em;
  color: var(--presspilot-foreground);
}

a {
  color: inherit;
  text-decoration: none;
}

header {
  position: sticky;
  top: 0;
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(6px);
  border-bottom: 1px solid rgba(17, 24, 39, 0.08);
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
  color: var(--presspilot-muted);
}

header nav a:hover {
  color: var(--presspilot-foreground);
}

main {
  margin: 0 auto 4rem;
}

.presspilot-section {
  max-width: var(--presspilot-max-width);
  margin: 0 auto;
  padding: var(--spacing-60) var(--spacing-40);
}

.presspilot-section + .presspilot-section {
  border-top: 1px solid rgba(17, 24, 39, 0.05);
}

.section-subhead {
  color: var(--presspilot-muted);
  margin: 0 auto;
  max-width: 640px;
  text-align: center;
  line-height: 1.6;
  font-size: var(--font-sm);
}

.hero-basic {
  text-align: center;
  padding-top: var(--spacing-60);
  padding-bottom: var(--spacing-60);
}

.hero-basic .hero-eyebrow {
  color: var(--presspilot-muted);
  font-size: var(--font-xs);
  text-transform: uppercase;
  letter-spacing: 0.2em;
  margin-bottom: 1rem;
}

.hero-basic .hero-title {
  font-size: var(--font-xxl);
  margin: 0 0 1rem;
}

.hero-basic .hero-subtitle {
  margin: 0 auto 2rem;
  max-width: 720px;
  color: var(--presspilot-muted);
  line-height: 1.6;
  font-size: var(--font-lg);
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
  background: var(--presspilot-primary);
  color: #fff;
  box-shadow: 0 20px 40px rgba(37, 99, 235, 0.25);
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
  gap: var(--spacing-40);
  margin-top: var(--spacing-40);
}

.features-grid .feature-card {
  background: var(--presspilot-soft);
  border: 1px solid var(--presspilot-border);
  border-radius: var(--presspilot-radius);
  padding: var(--spacing-30);
}

.features-grid .feature-card h3 {
  font-size: var(--font-lg);
  margin-top: 0;
  margin-bottom: 0.5rem;
}

.features-grid .feature-card p {
  font-size: var(--font-sm);
  margin: 0;
  color: var(--presspilot-muted);
}

.pricing-columns .pricing-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: var(--spacing-40);
  margin-top: var(--spacing-40);
}

.pricing-card {
  border: 1px solid var(--presspilot-border);
  border-radius: var(--presspilot-radius);
  padding: var(--spacing-40);
  background: var(--presspilot-soft);
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.pricing-card.highlight {
  border-color: var(--presspilot-primary);
  box-shadow: 0 25px 60px rgba(37, 99, 235, 0.15);
  border-width: 2px;
}

.pricing-card .price {
  font-size: var(--font-xl);
  margin: 0;
  font-weight: 700;
}

.pricing-card ul {
  padding-left: 1.2rem;
  margin: 0;
  color: var(--presspilot-muted);
  font-size: var(--font-sm);
}

.blog-teasers .blog-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: var(--spacing-30);
  margin-top: var(--spacing-40);
}

.blog-card {
  border: 1px solid var(--presspilot-border);
  border-radius: var(--presspilot-radius);
  padding: var(--spacing-30);
  background: var(--presspilot-soft);
}

.blog-card h3 {
  font-size: var(--font-lg);
  margin-top: 0.5rem;
  margin-bottom: 0.5rem;
}

.blog-card p {
  font-size: var(--font-sm);
  margin: 0;
  color: var(--presspilot-muted);
}

.blog-card small {
  display: block;
  color: var(--presspilot-muted);
  margin-bottom: 0.5rem;
  font-size: var(--font-xs);
}

.cta-contact {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: var(--spacing-40);
  background: var(--presspilot-soft);
  border-radius: var(--presspilot-radius);
  border: 1px solid var(--presspilot-border);
  padding: var(--spacing-60) var(--spacing-40);
}

.cta-contact__copy h2 {
  margin-top: 0;
  font-size: var(--font-xl);
}

.cta-contact__copy p {
  font-size: var(--font-sm);
}

.cta-contact__copy ul {
  list-style: none;
  padding: 0;
  margin: 1rem 0 0;
  font-size: var(--font-sm);
}

.cta-contact__card {
  border: 1px dashed var(--presspilot-border);
  border-radius: var(--presspilot-radius);
  padding: var(--spacing-40);
  background: var(--presspilot-bg);
}

footer {
  border-top: 1px solid rgba(17, 24, 39, 0.08);
  padding: 2rem 1.5rem;
  text-align: center;
  color: var(--presspilot-muted);
  font-size: var(--font-sm);
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
    <div style="max-width: 1100px; margin: 0 auto; padding: 4rem 1.5rem;">
      <h2 style="text-align: center; font-size: 2rem; margin-bottom: 1rem;">Menu</h2>
      <p style="text-align: center; color: var(--presspilot-muted); margin-bottom: 3rem;">Explore our delicious offerings.</p>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 2rem;">
        <div style="border: 1px solid var(--presspilot-border); border-radius: var(--presspilot-radius); padding: 2rem; background: var(--presspilot-soft);">
          <h3 style="font-size: 1.25rem; margin-bottom: 0.5rem;">Coffee & Beverages</h3>
          <p style="color: var(--presspilot-muted); font-size: 0.95rem;">Espresso, cappuccino, and specialty drinks.</p>
        </div>
        <div style="border: 1px solid var(--presspilot-border); border-radius: var(--presspilot-radius); padding: 2rem; background: var(--presspilot-soft);">
          <h3 style="font-size: 1.25rem; margin-bottom: 0.5rem;">Pastries & Treats</h3>
          <p style="color: var(--presspilot-muted); font-size: 0.95rem;">Fresh baked goods and sweet treats.</p>
        </div>
        <div style="border: 1px solid var(--presspilot-border); border-radius: var(--presspilot-radius); padding: 2rem; background: var(--presspilot-soft);">
          <h3 style="font-size: 1.25rem; margin-bottom: 0.5rem;">Light Meals</h3>
          <p style="color: var(--presspilot-muted); font-size: 0.95rem;">Sandwiches, salads, and daily specials.</p>
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
        <strong>${context.brand.name}</strong>
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
