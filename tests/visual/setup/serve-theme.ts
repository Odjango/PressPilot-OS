import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import AdmZip from 'adm-zip';

export interface ServedTheme {
  url: string;
  rootDir: string;
  resolvePageUrl: (slug?: string) => string;
  close: () => Promise<void>;
}

async function exists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function readTemplatePart(themeRoot: string, slug: string): Promise<string> {
  const partPath = path.join(themeRoot, 'parts', `${slug}.html`);
  return (await exists(partPath)) ? fs.readFile(partPath, 'utf8') : '';
}

async function renderTemplate(themeRoot: string, templateFile: string): Promise<string> {
  const templatePath = path.join(themeRoot, 'templates', templateFile);
  if (!(await exists(templatePath))) {
    return '<html><body><h1>Template not found</h1></body></html>';
  }

  let content = await fs.readFile(templatePath, 'utf8');
  const header = await readTemplatePart(themeRoot, 'header');
  const footer = await readTemplatePart(themeRoot, 'footer');

  content = content.replace(/<!--\s*wp:template-part\s*\{[^}]*"slug":"header"[^}]*\}\s*\/-->/g, header);
  content = content.replace(/<!--\s*wp:template-part\s*\{[^}]*"slug":"footer"[^}]*\}\s*\/-->/g, footer);

  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>PressPilot Visual Theme</title>
  <link rel="stylesheet" href="/style.css" />
</head>
<body>
${content}
</body>
</html>`;
}

function inferTemplateForSlug(slug?: string): string {
  if (!slug || slug === 'home') return 'front-page.html';
  return `page-${slug}.html`;
}

export async function serveThemeFromZip(themeZipPath: string): Promise<ServedTheme> {
  const tempRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'pp-visual-theme-'));
  const zip = new AdmZip(themeZipPath);
  zip.extractAllTo(tempRoot, true);

  const entries = await fs.readdir(tempRoot, { withFileTypes: true });
  const topDir = entries.find((e) => e.isDirectory())?.name;
  const themeRoot = topDir ? path.join(tempRoot, topDir) : tempRoot;

  const server = http.createServer(async (req, res) => {
    try {
      const reqUrl = new URL(req.url || '/', 'http://localhost');
      const pathname = decodeURIComponent(reqUrl.pathname);

      if (pathname.endsWith('.css') || pathname.endsWith('.woff2') || pathname.startsWith('/assets/')) {
        const filePath = path.join(themeRoot, pathname.replace(/^\//, ''));
        if (await exists(filePath)) {
          const data = await fs.readFile(filePath);
          if (pathname.endsWith('.css')) res.setHeader('Content-Type', 'text/css; charset=utf-8');
          if (pathname.endsWith('.woff2')) res.setHeader('Content-Type', 'font/woff2');
          res.writeHead(200);
          res.end(data);
          return;
        }
      }

      let slug = pathname.replace(/^\//, '').replace(/\/$/, '');
      if (slug.includes('/')) slug = slug.split('/')[0];
      const templateFile = inferTemplateForSlug(slug || 'home');
      const html = await renderTemplate(themeRoot, templateFile);
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(html);
    } catch (error) {
      res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end(`Server error: ${(error as Error).message}`);
    }
  });

  await new Promise<void>((resolve) => {
    server.listen(0, '127.0.0.1', () => resolve());
  });

  const address = server.address();
  if (!address || typeof address === 'string') {
    throw new Error('Could not resolve local server address');
  }

  const baseUrl = `http://127.0.0.1:${address.port}`;

  return {
    url: baseUrl,
    rootDir: themeRoot,
    resolvePageUrl: (slug?: string) => (slug && slug !== 'home' ? `${baseUrl}/${slug}` : `${baseUrl}/`),
    close: async () => {
      await new Promise<void>((resolve, reject) => {
        server.close((err) => (err ? reject(err) : resolve()));
      });
      await fs.rm(tempRoot, { recursive: true, force: true });
    }
  };
}
