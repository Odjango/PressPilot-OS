import { NextResponse } from 'next/server';
import { getAllKits } from '@/lib/presspilot/kitRegistry';

const THEME_SLUG = 'presspilot-golden-foundation';

export async function GET() {
  try {
    const kits = await getAllKits();
    const businessTypes = kits.map((kit) => ({
      id: kit.id,
      label: kit.label,
      description: kit.description,
      styleVariation: kit.styleVariationId ?? null
    }));

    return NextResponse.json({
      themeSlug: THEME_SLUG,
      businessTypes
    });
  } catch (error) {
    console.error('Error loading PressPilot kit:', error);
    return NextResponse.json(
      { error: 'Failed to load PressPilot kit configuration' },
      {
        status: 500
      }
    );
  }
}

