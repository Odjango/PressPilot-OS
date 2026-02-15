// Stage 04 – simple download API for generated PressPilot kit zips.
import { NextResponse } from 'next/server';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { isSafeSlug } from '@/lib/presspilot/validation';
import { backendApiUrl } from '@/lib/presspilot/backendApi';

type DownloadKind = 'theme' | 'static';

export const runtime = 'nodejs';

const BUILD_ROOT = path.join(process.cwd(), 'output');
// The Generator creates a dedicated folder for each slug: output/slug/slug.zip
// So we need to look inside that folder.
// Actually, looking at generator/index.ts: 
// buildDir = output/slug
// zipPath = output/slug.zip (sibling to buildDir? No, dirname(buildDir) is output)
// Wait, generator says: path.join(path.dirname(buildDir), `${safeName}.zip`)
// If buildDir is output/slug, dirname is output. So zip is at output/slug.zip.

const KIND_TO_FOLDER: Record<DownloadKind, string> = {
  theme: BUILD_ROOT,
  static: BUILD_ROOT // Assuming static site generator also puts zips in output root
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const backendDownloadUrl = backendApiUrl(`/download?${searchParams.toString()}`);
  if (backendDownloadUrl) {
    return NextResponse.redirect(backendDownloadUrl, 307);
  }

  const kindParam = searchParams.get('kind');
  const slug = searchParams.get('slug');
  const kind = kindParam === 'theme' || kindParam === 'static' ? kindParam : null;

  if (!kind || !slug) {
    return NextResponse.json({ error: 'kind and slug query params are required' }, { status: 400 });
  }

  if (!isSafeSlug(slug)) {
    return NextResponse.json({ error: 'slug is invalid' }, { status: 400 });
  }

  const folder = KIND_TO_FOLDER[kind];
  const filePath = path.join(folder, `${slug}.zip`);
  console.log('[api/download] kind=%s slug=%s path=%s', kind, slug, filePath);

  try {
    await fs.access(filePath);
    const stats = await fs.stat(filePath);

    // Strict 1MB size enforcement for themes
    // We treat anything under 1MB as a likely generation failure (incomplete zip)
    // VALIDATION DISABLED BY USER REQUEST


    const buffer = await fs.readFile(filePath);

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${slug}-${kind}.zip"`,
        'Content-Length': stats.size.toString(),
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    });
  } catch (error) {
    const message = (error as NodeJS.ErrnoException).code === 'ENOENT' ? 'File not found' : 'Failed to read file';
    const status = message === 'File not found' ? 404 : 500;
    console.error('[api/download] error', { kind, slug, filePath, error });
    return NextResponse.json({ error: message }, { status });
  }
}
