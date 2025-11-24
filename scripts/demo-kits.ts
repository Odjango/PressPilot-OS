import path from 'node:path';
import { promises as fs } from 'node:fs';
import { demoKitSpecs } from '../lib/presspilot/demo/specs';
import { validateSaaSInput } from '../lib/presspilot/validation';
import { applyBusinessInputs } from '../lib/presspilot/context';
import { resolveBusinessTypeStyle } from '../lib/presspilot/kit';
import {
  buildVariationSetFromAI,
  VARIATION_IDS,
  type RawVariationResponse,
} from '../lib/presspilot/variations';
import { buildFallbackVariationSet } from '../lib/presspilot/fallbackVariations';
import { buildWordPressTheme } from '../lib/presspilot/themeKit';
import { buildStaticSite } from '../lib/presspilot/staticSite';
import type { KitSummary } from '../lib/presspilot/kitSummary';
import { callPressPilotJson } from '../lib/openai';

const DEMO_ROOT = path.join(process.cwd(), 'build', 'demo');

interface DemoIndexEntry {
  slug: string;
  brandName: string;
  businessTypeId: string | null;
  styleVariation: string | null;
  themeZip: string;
  staticZip: string;
  kitSummary: string;
}

async function ensureDemoRoot() {
  await fs.rm(DEMO_ROOT, { recursive: true, force: true });
  await fs.mkdir(DEMO_ROOT, { recursive: true });
}

async function copyFile(source: string, destination: string) {
  await fs.mkdir(path.dirname(destination), { recursive: true });
  await fs.copyFile(source, destination);
}

async function run() {
  console.log('[demo-kits] Preparing demo bundles for PressPilot OS');
  await ensureDemoRoot();

  const indexEntries: DemoIndexEntry[] = [];

  for (const spec of demoKitSpecs) {
    const payload = validateSaaSInput(JSON.parse(JSON.stringify(spec.payload)));
    const context = applyBusinessInputs(payload);
    const resolvedSlug = context.brand.slug;

    const { styleVariation: resolvedStyleVariation } = await resolveBusinessTypeStyle(spec.businessTypeId);
    if (!resolvedStyleVariation) {
      throw new Error(`No style variation found for businessTypeId "${spec.businessTypeId}"`);
    }

    const appliedStyleVariation = spec.styleVariation ?? resolvedStyleVariation;

    let variationSet;
    try {
      const aiResponse = (await callPressPilotJson({
        system:
          'You are the PressPilot Studio design engine. ' +
          'Given normalized business inputs, respond ONLY with JSON { variations: Variation[] } ' +
          'matching the PressPilotVariationManifest schema. ' +
          'Use ids variation_a, variation_b, variation_c. Populate tokens, nav, preview, and pattern_set_id.',
        user: {
          requestedIds: VARIATION_IDS,
          brand: context.brand,
          narrative: context.narrative,
          visual: context.visual,
          modes: context.modes,
          request: {
            businessTypeId: spec.businessTypeId ?? null,
            styleVariation: appliedStyleVariation ?? null,
          },
        },
      })) as RawVariationResponse;
      variationSet = buildVariationSetFromAI(context, aiResponse);
    } catch (error) {
      console.warn('[demo-kits] Variation engine unavailable, using fallback for', resolvedSlug, error);
      variationSet = buildFallbackVariationSet(context);
    }

    const variation = variationSet.variations[0];
    const kitSummary: KitSummary = {
      slug: resolvedSlug,
      brandName: context.brand.name,
      businessTypeId: spec.businessTypeId,
      styleVariation: appliedStyleVariation,
      createdAt: new Date().toISOString()
    };

    console.log(`[demo-kits] Building kit for ${context.brand.name} (${spec.businessTypeId})`);

    const [themeResult, staticResult] = await Promise.all([
      buildWordPressTheme(context, variation, {
        businessTypeId: spec.businessTypeId,
        styleVariation: appliedStyleVariation,
        kitSummary
      }),
      buildStaticSite(context, variation, {
        businessTypeId: spec.businessTypeId,
        kitSummary
      })
    ]);

    const kitDir = path.join(DEMO_ROOT, resolvedSlug);
    await fs.mkdir(kitDir, { recursive: true });

    const themeZipTarget = path.join(kitDir, 'theme.zip');
    const staticZipTarget = path.join(kitDir, 'static.zip');
    const summaryTarget = path.join(kitDir, 'presspilot-kit.json');

    await copyFile(themeResult.themeZipPath, themeZipTarget);
    await copyFile(staticResult.staticZipPath, staticZipTarget);
    await fs.writeFile(summaryTarget, JSON.stringify(kitSummary, null, 2), 'utf8');

    indexEntries.push({
      slug: resolvedSlug,
      brandName: context.brand.name,
      businessTypeId: spec.businessTypeId,
      styleVariation: appliedStyleVariation,
      themeZip: path.relative(DEMO_ROOT, themeZipTarget),
      staticZip: path.relative(DEMO_ROOT, staticZipTarget),
      kitSummary: path.relative(DEMO_ROOT, summaryTarget)
    });
  }

  const indexPayload = {
    generatedAt: new Date().toISOString(),
    kits: indexEntries
  };

  await fs.writeFile(path.join(DEMO_ROOT, 'demo-index.json'), JSON.stringify(indexPayload, null, 2), 'utf8');
  await writeHtmlIndex(indexEntries);
  await writeReadme();
  console.log('[demo-kits] Demo bundle ready at build/demo');
}

function buildHtmlTemplate(kits: DemoIndexEntry[]): string {
  const cards = kits
    .map(
      (kit) => `
      <article class="kit-card">
        <h2>${kit.brandName}</h2>
        <p><strong>Slug:</strong> ${kit.slug}</p>
        <p><strong>Business type:</strong> ${kit.businessTypeId}</p>
        <p><strong>Style:</strong> ${kit.styleVariation ?? 'n/a'}</p>
        <div class="links">
          <a href="${kit.themeZip}">Download WordPress theme</a>
          <a href="${kit.staticZip}">Download static site</a>
          <a href="${kit.kitSummary}">View kit summary JSON</a>
        </div>
      </article>`
    )
    .join('\n');

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>PressPilot OS Demo Kits</title>
    <style>
      :root {
        font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        color: #111827;
        background: #f8fafc;
      }
      body {
        margin: 0;
        padding: 2.5rem 1.5rem 4rem;
      }
      .page {
        max-width: 1100px;
        margin: 0 auto;
      }
      h1 {
        font-size: clamp(2rem, 4vw, 2.8rem);
        margin-bottom: 0.5rem;
      }
      p.lede {
        color: #475569;
        line-height: 1.6;
        max-width: 760px;
      }
      .kit-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
        gap: 1.5rem;
        margin-top: 2rem;
      }
      .kit-card {
        background: #fff;
        border: 1px solid #e2e8f0;
        border-radius: 16px;
        padding: 1.5rem;
        box-shadow: 0 15px 35px rgba(15, 23, 42, 0.08);
      }
      .kit-card h2 {
        margin-top: 0;
        font-size: 1.25rem;
      }
      .kit-card p {
        margin: 0.35rem 0;
        color: #475569;
      }
      .kit-card .links {
        display: flex;
        flex-direction: column;
        gap: 0.35rem;
        margin-top: 1rem;
      }
      .kit-card a {
        color: #2563eb;
        text-decoration: none;
        font-weight: 500;
      }
      .kit-card a:hover {
        text-decoration: underline;
      }
    </style>
  </head>
  <body>
    <main class="page">
      <h1>PressPilot OS Demo Kits</h1>
      <p class="lede">
        These reference bundles were generated by PressPilot OS across SaaS, Local Biz, Restaurant/Café,
        and E-Commerce presets. Each kit includes a WordPress theme zip, a static HTML zip, and a summary JSON you can inspect or import later.
      </p>
      <section class="kit-grid">
        ${cards}
      </section>
    </main>
  </body>
</html>`;
}

async function writeHtmlIndex(kits: DemoIndexEntry[]) {
  const html = buildHtmlTemplate(kits);
  await fs.writeFile(path.join(DEMO_ROOT, 'demo-index.html'), html, 'utf8');
}

async function writeReadme() {
  const contents = `# PressPilot OS Demo Bundle

## What this is
This folder contains four reference kits generated by PressPilot OS covering SaaS, Local Business, Restaurant/Café, and E-Commerce presets. Each kit ships with:

- \`theme.zip\` — the WordPress block theme export.
- \`static.zip\` — a one-page HTML/CSS version of the site.
- \`presspilot-kit.json\` — a summary of the kit metadata (slug, brandName, businessTypeId, styleVariation, createdAt).

## How to use with WordPress
1. Go to Appearance → Themes → Add New → Upload Theme inside WordPress.
2. Upload the kit’s \`theme.zip\`.
3. Activate the theme and view the front page to explore the preset patterns.

## How to use the static site
Unzip \`static.zip\` and drop the contents onto any static host (S3, a simple web server, etc.). The bundle contains a single \`index.html\` plus supporting assets.

## What is presspilot-kit.json
The JSON file describes the kit (slug, brand name, business type, style variation, and creation timestamp). Future tools can read this to automate imports or auditing.`;

  await fs.writeFile(path.join(DEMO_ROOT, 'README-demobundle.md'), contents, 'utf8');
}

run().catch((error) => {
  console.error('[demo-kits] Failed to build demo kits:', error);
  process.exit(1);
});


