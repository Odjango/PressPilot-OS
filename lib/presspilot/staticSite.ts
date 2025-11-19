import path from 'node:path';
import { promises as fs } from 'node:fs';
import AdmZip from 'adm-zip';
import { PressPilotNormalizedContext, PressPilotVariationManifest } from '@/types/presspilot';
import { resolveBusinessCopy, PressPilotBusinessCopy } from '@/lib/presspilot/kit';
import { KitSummary, writeKitSummaryFile } from '@/lib/presspilot/kitSummary';
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

const BUILD_ROOT = path.join(process.cwd(), 'build');
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

  const html = buildHtml(context, copy);
  await fs.writeFile(path.join(siteDir, 'index.html'), html, 'utf8');
  await writeKitSummaryFile(siteDir, options?.kitSummary ?? null);

  const staticZipPath = path.join(STATIC_ROOT, `${context.brand.slug}.zip`);
  const zip = new AdmZip();
  zip.addLocalFolder(siteDir);
  zip.writeZip(staticZipPath);
  console.log('[staticSite] wrote static zip:', staticZipPath);

  return { staticDir: siteDir, staticZipPath };
}

function buildStyles(variation: PressPilotVariationManifest) {
  const borderRadius =
    variation.tokens.corner_style === 'sharp'
      ? '8px'
      : variation.tokens.corner_style === 'rounded'
      ? '28px'
      : '16px';
  return `:root {
  --presspilot-bg: #f5f5f7;
  --presspilot-soft: #ffffff;
  --presspilot-foreground: #111827;
  --presspilot-muted: #6b7280;
  --presspilot-border: #e5e7eb;
  --presspilot-primary: #2563eb;
  --presspilot-accent: #14b8a6;
  --presspilot-radius: ${borderRadius};
  --presspilot-max-width: 1100px;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  background: var(--presspilot-bg);
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
  padding: 4rem 1.5rem;
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
}

.hero-basic {
  text-align: center;
}

.hero-basic .hero-eyebrow {
  color: var(--presspilot-muted);
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.2em;
  margin-bottom: 1rem;
}

.hero-basic .hero-title {
  font-size: clamp(2rem, 5vw, 3.5rem);
  margin: 0 0 1rem;
}

.hero-basic .hero-subtitle {
  margin: 0 auto 2rem;
  max-width: 720px;
  color: var(--presspilot-muted);
  line-height: 1.6;
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
  border-radius: var(--presspilot-radius);
  font-weight: 600;
  padding: 0.9rem 1.75rem;
  border: 1px solid transparent;
  transition: box-shadow 0.2s ease, transform 0.2s ease;
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
  gap: 1.5rem;
  margin-top: 2rem;
}

.features-grid .feature-card {
  background: var(--presspilot-soft);
  border: 1px solid var(--presspilot-border);
  border-radius: var(--presspilot-radius);
  padding: 1.5rem;
}

.pricing-columns .pricing-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 1.5rem;
  margin-top: 2.5rem;
}

.pricing-card {
  border: 1px solid var(--presspilot-border);
  border-radius: var(--presspilot-radius);
  padding: 2rem;
  background: var(--presspilot-soft);
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.pricing-card.highlight {
  border-color: var(--presspilot-primary);
  box-shadow: 0 25px 60px rgba(37, 99, 235, 0.15);
}

.pricing-card .price {
  font-size: 1.5rem;
  margin: 0;
}

.pricing-card ul {
  padding-left: 1.2rem;
  margin: 0;
  color: var(--presspilot-muted);
}

.blog-teasers .blog-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 1.25rem;
  margin-top: 2rem;
}

.blog-card {
  border: 1px solid var(--presspilot-border);
  border-radius: var(--presspilot-radius);
  padding: 1.5rem;
  background: var(--presspilot-soft);
}

.blog-card small {
  display: block;
  color: var(--presspilot-muted);
  margin-bottom: 0.5rem;
}

.cta-contact {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 2rem;
  background: var(--presspilot-soft);
  border-radius: var(--presspilot-radius);
  border: 1px solid var(--presspilot-border);
}

.cta-contact__copy h2 {
  margin-top: 0;
}

.cta-contact__copy ul {
  list-style: none;
  padding: 0;
  margin: 1rem 0 0;
}

.cta-contact__card {
  border: 1px dashed var(--presspilot-border);
  border-radius: var(--presspilot-radius);
  padding: 1.5rem;
  background: var(--presspilot-bg);
}

footer {
  border-top: 1px solid rgba(17, 24, 39, 0.08);
  padding: 2rem 1.5rem;
  text-align: center;
  color: var(--presspilot-muted);
}
`;
}

function buildHtml(context: PressPilotNormalizedContext, copy: PressPilotBusinessCopy) {
  const navLinks = [
    { id: 'home', label: 'Home' },
    { id: 'about', label: 'About' },
    { id: 'shop', label: 'Shop' },
    { id: 'blog', label: 'Blog' },
    { id: 'contact', label: 'Contact' }
  ]
    .map((item) => `<a href="#${item.id}">${item.label}</a>`)
    .join('');

  const sections = [
    renderHeroBasic(copy.hero),
    renderFeaturesGrid(copy.featuresHeading, copy.features),
    renderPricingColumns(context),
    renderBlogTeasers(context),
    renderCtaContact(copy.contact)
  ].join('\n');

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
