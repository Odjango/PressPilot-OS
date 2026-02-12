import fs from 'fs-extra';
import path from 'node:path';
import { chromium } from '@playwright/test';
import { serveThemeFromZip } from '../../tests/visual/setup/serve-theme';

interface CatalogTheme {
  id: string;
  slug: string;
  name: string;
}

interface Catalog {
  themes: CatalogTheme[];
}

const ROOT = process.cwd();
const SHOWCASE_ROOT = path.join(ROOT, 'showcase');
const CATALOG_PATH = path.join(SHOWCASE_ROOT, 'catalog.json');
const ZIPS_DIR = path.join(SHOWCASE_ROOT, 'zips');
const SCREENSHOTS_DIR = path.join(SHOWCASE_ROOT, 'screenshots');

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

async function main(): Promise<void> {
  const { from, to } = resolveRange();
  const catalog = await fs.readJson(CATALOG_PATH) as Catalog;
  const selected = catalog.themes.filter((t) => {
    const num = Number.parseInt(t.id, 10);
    return num >= from && num <= to;
  });

  await fs.ensureDir(SCREENSHOTS_DIR);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();

  const report: Array<Record<string, string>> = [];

  try {
    for (const theme of selected) {
      const folderName = `${theme.id}-${theme.slug}`;
      const zipPath = path.join(ZIPS_DIR, `${folderName}.zip`);

      if (!(await fs.pathExists(zipPath))) {
        throw new Error(`ZIP not found for ${theme.id}: ${path.relative(ROOT, zipPath)}`);
      }

      const served = await serveThemeFromZip(zipPath);
      try {
        await page.goto(served.resolvePageUrl('home'), { waitUntil: 'domcontentloaded', timeout: 60_000 });
        await page.waitForTimeout(1000);

        const screenshotPath = path.join(SCREENSHOTS_DIR, `${folderName}-homepage.png`);
        await page.screenshot({ path: screenshotPath, fullPage: false });

        report.push({
          id: theme.id,
          name: theme.name,
          screenshot: path.relative(ROOT, screenshotPath),
        });
      } finally {
        await served.close();
      }
    }
  } finally {
    await context.close();
    await browser.close();
  }

  console.table(report);
  console.log(`Captured ${report.length} screenshots (${from}-${to}) at 1280x800.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
