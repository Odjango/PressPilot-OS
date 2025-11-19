import { NextResponse } from 'next/server';
import { PressPilotSaaSInput, VariationId } from '@/types/presspilot';
import { applyBusinessInputs } from '@/lib/presspilot/context';
import { generatePressPilotVariations } from '@/lib/presspilot/variations';
import { buildWordPressTheme } from '@/lib/presspilot/themeKit';
import { buildStaticSite } from '@/lib/presspilot/staticSite';
import { validateSaaSInput, validateSelectedVariationId } from '@/lib/presspilot/validation';
import { resolveBusinessTypeStyle } from '@/lib/presspilot/kit';
import { buildSaaSInputFromStudioInput, StudioFormInput } from '@/lib/presspilot/studioAdapter';
import { buildFallbackVariationSet } from '@/lib/presspilot/fallbackVariations';

interface GenerateRequestBody {
  payload?: PressPilotSaaSInput;
  variationId?: VariationId;
  businessTypeId?: string | null;
  input?: StudioFormInput;
  styleVariation?: string | null;
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as GenerateRequestBody;

  let payload: PressPilotSaaSInput;
  let variationId: VariationId;
  const businessTypeId = body.businessTypeId ?? null;

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
    let validatedBusinessTypeId: string | null = null;
    if (businessTypeId) {
      if (!styleVariation) {
        return NextResponse.json({ error: 'Invalid businessTypeId' }, { status: 400 });
      }
      validatedBusinessTypeId = businessTypeId;
    }

    const context = applyBusinessInputs(payload);
    let variationSet;
    try {
      variationSet = await generatePressPilotVariations(context);
    } catch (variationError) {
      console.error('[api/generate] variation engine unavailable, falling back', variationError);
      variationSet = buildFallbackVariationSet(context);
    }
    const variation =
      variationSet.variations.find((candidate) => candidate.id === variationId) ?? variationSet.variations[0];

    const slug = context.brand.slug;
    const kitSummary = {
      slug,
      brandName: context.brand.name,
      businessTypeId: validatedBusinessTypeId,
      styleVariation: appliedStyleVariation,
      createdAt: new Date().toISOString()
    };
    const [themeResult, staticResult] = await Promise.all([
      buildWordPressTheme(context, variation, {
        businessTypeId: validatedBusinessTypeId,
        styleVariation: appliedStyleVariation,
        kitSummary
      }),
      buildStaticSite(context, variation, { businessTypeId: validatedBusinessTypeId, kitSummary })
    ]);

    console.log(
      'PressPilot generate: businessTypeId =',
      validatedBusinessTypeId,
      'styleVariation =',
      appliedStyleVariation
    );

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
    console.error('[api/generate] export failed', error);
    return NextResponse.json({ error: 'Failed to generate exports' }, { status: 500 });
  }
}
