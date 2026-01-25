import { NextResponse } from 'next/server';
import {
  PressPilotSaaSInput,
  PressPilotVariationManifest,
  VariationId,
} from '@/types/presspilot';

// import { callPressPilotJson } from '@/lib/openai';
import { applyBusinessInputs } from '@/lib/presspilot/context';
import {
  buildVariationSetFromAI,
  VARIATION_IDS,
  type RawVariationResponse,
} from '@/lib/presspilot/variations';
import { buildWordPressTheme } from '@/lib/presspilot/themeKit';
import { buildStaticSite } from '@/lib/presspilot/staticSite';
import {
  validateSaaSInput,
  validateSelectedVariationId,
} from '@/lib/presspilot/validation';
import { resolveBusinessTypeStyle, resolveBusinessCopy } from '@/lib/presspilot/kit';
import {
  buildSaaSInputFromStudioInput,
  type StudioFormInput,
} from '@/lib/presspilot/studioAdapter';
import { buildFallbackVariationSet } from '@/lib/presspilot/fallbackVariations';
import type { KitSummary } from '@/lib/presspilot/kitSummary';
import { getBusinessCategoryById, type BusinessCategoryId } from '@/app/mvp-demo/businessCategories';

interface GenerateRequestBody {
  payload?: PressPilotSaaSInput;
  variationId?: VariationId;
  businessTypeId?: string | null;
  businessCategoryId?: string | null;
  wpImportPreset?: {
    menu: string[];
    pages: { slug: string; title: string }[];
    frontPageSlug: string;
  } | null;
  input?: StudioFormInput;
  styleVariation?: string | null;
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as GenerateRequestBody;

  let payload: PressPilotSaaSInput;
  let variationId: VariationId;
  const businessTypeId = body.businessTypeId ?? null;
  let validatedBusinessTypeId: string | null = null;
  // Declare context in outer scope for finally block access
  let context: ReturnType<typeof applyBusinessInputs>;
  let kitPlan: KitPlan | null = null;

  try {
    const payloadCandidate = body.payload ?? buildSaaSInputFromStudioInput(body.input);
    payload = validateSaaSInput(payloadCandidate);
    const requestedVariationId = body.variationId ?? 'variation_a';
    variationId = validateSelectedVariationId(requestedVariationId);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'INVALID_INPUT' }, { status: 400 });
  }

  try {
    const { kit, styleVariation } = await resolveBusinessTypeStyle(businessTypeId);
    const requestedStyleVariation =
      typeof body.styleVariation === 'string' && body.styleVariation.trim()
        ? body.styleVariation.trim()
        : null;
    const appliedStyleVariation = requestedStyleVariation ?? styleVariation ?? null;

    if (businessTypeId) {
      if (!styleVariation) {
        return NextResponse.json({ error: 'Invalid businessTypeId' }, { status: 400 });
      }
      validatedBusinessTypeId = businessTypeId;
    }

    context = applyBusinessInputs(payload);

    // 3-VARIATION PARALLEL GENERATION
    // We force generate A, B, and C regardless of input to fill the UI cards
    const targetVariations: VariationId[] = ['variation_a', 'variation_b', 'variation_c'];

    // Resolve fallback set once to get base data
    const variationSet = buildFallbackVariationSet(context);
    const slug = context.brand.slug;

    // RESTORED: Required Logic for kitSummary
    const variation = variationSet.variations[0]; // Use primary for summary
    kitPlan = await generateKitPlan(context, variation);
    const copy = await resolveBusinessCopy(context, variation, validatedBusinessTypeId);

    // Build wpImport from business category or fallback
    let wpImport = null;
    const businessCategoryId = body.businessCategoryId ?? null;
    const category = businessCategoryId ? getBusinessCategoryById(businessCategoryId as BusinessCategoryId) : null;

    if (category && category.defaultPages && category.defaultPages.length > 0) {
      const menuSlugs = category.defaultMenu.map(label => label.toLowerCase().replace(/\s+/g, '-'));
      wpImport = {
        front_page_slug: 'home',
        pages: category.defaultPages.map(p => ({ slug: p.slug, title: p.title })),
        menu: { location: 'primary', name: 'Main Menu', items: menuSlugs },
      };
    } else {
      wpImport = {
        front_page_slug: 'home',
        pages: [
          { slug: 'home', title: 'Home' },
          { slug: 'about', title: 'About' },
          { slug: 'services', title: 'Services' },
          { slug: 'blog', title: 'Blog' },
          { slug: 'contact', title: 'Contact' },
        ],
        menu: {
          location: 'primary',
          name: 'Main Menu',
          items: ['home', 'about', 'services', 'blog', 'contact'],
        },
      };
    }

    const kitSummary: KitSummary = {
      slug,
      brandName: context.brand.name,
      businessTypeId: validatedBusinessTypeId,
      styleVariation: appliedStyleVariation,
      createdAt: new Date().toISOString(),
      plan: kitPlan,
      tagline: copy.hero.subtitle,
      businessCategoryId: body.businessCategoryId ?? null,
      business: { name: context.brand.name, category_id: body.businessCategoryId ?? null },
      wpImport,
    };

    // Parallel Build
    const results = await Promise.all(targetVariations.map(async (vid) => {
      const variation = variationSet.variations.find(v => v.id === vid) ?? variationSet.variations[0];
      // Unique slug for this variation file: "my-gym-a.zip"
      const variationSlug = `${slug}-${vid.replace('variation_', '')}`;

      try {
        const buildRes = await buildWordPressTheme(context, variation, {
          businessTypeId: validatedBusinessTypeId,
          styleVariation: appliedStyleVariation,
          kitSummary,
          baseTheme: selectedBaseTheme,
          outputSlug: variationSlug // Force filename
        });
        return {
          id: vid,
          success: true,
          url: `/api/download?kind=theme&slug=${variationSlug}`,
          zipPath: buildRes.themeZipPath
        };
      } catch (e) {
        console.error(`Failed to build ${vid}`, e);
        return { id: vid, success: false, url: null, zipPath: null };
      }
    }));

    // Generate Static Site (Just once for the primary request, or skip for speed?)
    // For now, let's just do it for Variation A (Original)
    const staticResult = await buildStaticSite(context, variationSet.variations[0], {
      businessTypeId: validatedBusinessTypeId, kitSummary
    }).catch(e => ({ staticZipPath: null }));

    const getUrl = (vid: string) => results.find(r => r.id === vid)?.url || '';

    // Verify at least one success
    if (!results.some(r => r.success)) {
      throw new Error("All variations failed to generate.");
    }

    return NextResponse.json({

      themeUrl_a: getUrl('variation_a'),
      themeUrl_b: getUrl('variation_b'),
      themeUrl_c: getUrl('variation_c'),
      // Fallback for older frontend logic if needed (points to A)



      businessTypeId: validatedBusinessTypeId,
      styleVariation: appliedStyleVariation,
      kitVersion: kit.version,
      siteArchetype: context.siteArchetype,
      navShell: context.navShell
    });
  } catch (error) {
    console.error('[api/generate] FATAL ERROR:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error during generation';
    return NextResponse.json({
      error: 'Failed to generate exports',
      details: errorMessage
    }, { status: 500 });
  } finally {
    // ---------------------------------------------------------
    // "THE NUCLEAR HYDRATION" (DEPRECATED - REMOVED IN REFACTOR)
    // Legacy generic preview mechanism removed in favor of Node.js engine stability.
    // ---------------------------------------------------------
    /*
    try {
      if (validatedBusinessTypeId && context) {
        const wpBakeUrl = 'https://factory.presspilotapp.com/wp-json/presspilot/v1/bake';
        // ... (Legacy code removed)
      }
    } catch (cleanupError) {
      console.error('[api/generate] Failed to trigger Nuclear Hydration:', cleanupError);
    }
    */
  }
}

type KitPlanSection = {
  id: string;
  kind: string;
  heading?: string;
  subheading?: string;
  body?: string;
  notes?: string;
};

type KitPlanPage = {
  slug: string;
  title: string;
  sections: KitPlanSection[];
};

type KitPlan = {
  pages: KitPlanPage[];
};

async function generateKitPlan(
  context: ReturnType<typeof applyBusinessInputs>,
  variation: PressPilotVariationManifest,
): Promise<KitPlan> {
  // OpenAI Logic Removed - Return Default Plan
  return {
    pages: [
      {
        slug: 'home',
        title: 'Home',
        sections: [
          {
            id: 'hero',
            kind: 'hero',
            heading: variation.preview.label,
            subheading: context.narrative.description_long.slice(0, 140),
          }
        ]
      },
      {
        slug: 'about',
        title: 'About',
        sections: []
      },
      {
        slug: 'contact',
        title: 'Contact',
        sections: []
      }
    ]
  };
}

