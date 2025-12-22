// Stage 04 – simple download API for generated PressPilot kit zips.
import { NextResponse } from 'next/server';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { isSafeSlug } from '@/lib/presspilot/validation';

type DownloadKind = 'theme' | 'static';

export const runtime = 'nodejs';

const BUILD_ROOT = path.join('/tmp', 'presspilot-build');
const KIND_TO_FOLDER: Record<DownloadKind, string> = {
  theme: path.join(BUILD_ROOT, 'themes'),
  static: path.join(BUILD_ROOT, 'static')
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
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
    if (kind === 'theme' && stats.size < 1_000_000) {
      console.error('[api/download] File too small, rejecting', { slug, size: stats.size });
      return NextResponse.json({
        error: 'Generated file is invalid (too small)',
        size: stats.size
      }, { status: 500 });
    }

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
