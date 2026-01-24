import { NextResponse } from 'next/server';
import {
  PressPilotSaaSInput,
  PressPilotVariationManifest,
  VariationId,
} from '@/types/presspilot';

import { callPressPilotJson } from '@/lib/openai';
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
            businessTypeId: businessTypeId ?? null,
            styleVariation: appliedStyleVariation ?? null,
          },
        },
      })) as RawVariationResponse;
      variationSet = buildVariationSetFromAI(context, aiResponse);
    } catch (variationError) {
      console.error('[api/generate] variation engine unavailable', variationError);
      throw variationError;
    }
    const variation =
      variationSet.variations.find((candidate) => candidate.id === variationId) ?? variationSet.variations[0];

    const slug = context.brand.slug;
    kitPlan = await generateKitPlan(context, variation);

    // Resolve business copy to get tagline
    const copy = await resolveBusinessCopy(context, variation, validatedBusinessTypeId);

    // Build wpImport from business category or fallback
    let wpImport = null;
    const businessCategoryId = body.businessCategoryId ?? null;
    const category = businessCategoryId ? getBusinessCategoryById(businessCategoryId as BusinessCategoryId) : null;

    if (category && category.defaultPages && category.defaultPages.length > 0) {
      // Convert menu labels to slugs: lowercase, replace spaces with hyphens
      const menuSlugs = category.defaultMenu.map(label => {
        const slug = label.toLowerCase().replace(/\s+/g, '-');
        // Special cases: Menu -> menu, Shop -> shop (already handled by lowercase)
        return slug;
      });

      wpImport = {
        front_page_slug: 'home',
        pages: category.defaultPages.map(p => ({
          slug: p.slug,
          title: p.title,
        })),
        menu: {
          location: 'primary',
          name: 'Main Menu',
          items: menuSlugs,
        },
      };
    } else {
      // Fallback to generic pages
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
      business: {
        name: context.brand.name,
        category_id: body.businessCategoryId ?? null,
      },
      wpImport,
    };
    const resolveBaseTheme = (typeId: string | null): string => {
      // "Smarter" Selection Logic (Restoring Plugin Logic)
      if (typeId === 'restaurant_cafe') return 'ollie';
      if (typeId === 'saas_product' || typeId === 'professional_services') return 'frost';
      if (typeId === 'ecommerce_store') return 'ollie';
      if (typeId === 'local_service') return 'ollie';
      if (typeId === 'health_fitness' || typeId === 'beauty_salon') return 'frost'; // Clean look
      if (typeId === 'online_coach') return 'twentytwentyfour';
      return 'ollie'; // Default upgrade from 'universal'
    };

    const selectedBaseTheme = resolveBaseTheme(validatedBusinessTypeId);

    const [themeResult, staticResult] = await Promise.all([
      buildWordPressTheme(context, variation, {
        businessTypeId: validatedBusinessTypeId,
        styleVariation: appliedStyleVariation,
        kitSummary,
        baseTheme: selectedBaseTheme
      }).catch(err => {
        console.error('[api/generate] buildWordPressTheme failed', err);
        throw new Error(`Theme generation failed: ${err.message}`);
      }),
      buildStaticSite(context, variation, { businessTypeId: validatedBusinessTypeId, kitSummary })
        .catch((err: Error) => {
          console.error('[api/generate] buildStaticSite failed. Stack:', err.stack);
          console.error('[api/generate] buildStaticSite message:', err.message);
          throw new Error(`Static site generation failed: ${err.message}`);
        })
    ]);

    console.log(
      'PressPilot generate: businessTypeId =',
      validatedBusinessTypeId,
      'styleVariation =',
      appliedStyleVariation
    );

    const themeUrl = `/api/download?kind=theme&slug=${slug}`;

    // VERIFY FILES EXIST (Force Backend Verification)
    if (!themeUrl || themeUrl.length < 5 || !themeResult.themeZipPath) {
      console.error("CRITICAL: Generator finished but no URL produced.");
      throw new Error("Generator failed to produce a valid URL.");
    }

    return NextResponse.json({
      slug,
      themeZipPath: themeResult.themeZipPath,
      staticZipPath: staticResult.staticZipPath,
      themeUrl: `/api/download?kind=theme&slug=${slug}`,
      staticUrl: `/api/download?kind=static&slug=${slug}`,
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
  try {
    const rawPlan = await callPressPilotJson({
      system:
        'You are the PressPilot Kit Architect. Respond ONLY with JSON { pages: Page[] }. ' +
        'Page = { slug: string; title: string; sections: Section[] }. ' +
        'Section = { id: string; kind: string; heading?: string; subheading?: string; body?: string; notes?: string }. ' +
        'Use concise text and keep strings under 140 characters when possible.',
      user: {
        brand: context.brand,
        narrative: context.narrative,
        variation,
      },
    });

    if (Array.isArray(rawPlan?.pages)) {
      const pages: KitPlanPage[] = rawPlan.pages
        .filter((page: any) => typeof page?.slug === 'string' && Array.isArray(page?.sections))
        .map((page: any) => ({
          slug: page.slug,
          title: page.title ?? page.slug,
          sections: (Array.isArray(page.sections) ? page.sections : []).map((section: any, index: number) => ({
            id: section?.id ?? `section-${index + 1}`,
            kind: section?.kind ?? 'content',
            heading: section?.heading,
            subheading: section?.subheading,
            body: section?.body,
            notes: section?.notes,
          })),
        }));

      if (pages.length > 0) {
        return { pages };
      }
    }
  } catch (error) {
    console.error('[api/generate] kit plan AI failed', error);
  }

  return {
    pages: [
      {
        slug: 'home',
        title: context.brand.name,
        sections: [
          {
            id: 'hero',
            kind: 'hero',
            heading: variation.preview.label,
            subheading: context.narrative.description_long.slice(0, 140),
          },
        ],
      },
    ],
  };
}

