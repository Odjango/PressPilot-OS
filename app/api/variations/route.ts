import { NextResponse } from 'next/server';
import { PressPilotSaaSInput } from '@/types/presspilot';

import { callPressPilotJson } from '@/lib/openai';
import { applyBusinessInputs } from '@/lib/presspilot/context';
import {
  buildVariationSetFromAI,
  VARIATION_IDS,
  type RawVariationResponse,
} from '@/lib/presspilot/variations';
import { validateSaaSInput } from '@/lib/presspilot/validation';
import { resolveBusinessTypeStyle } from '@/lib/presspilot/kit';
import {
  buildSaaSInputFromStudioInput,
  type StudioFormInput,
} from '@/lib/presspilot/studioAdapter';
import { buildFallbackVariationSet } from '@/lib/presspilot/fallbackVariations';

interface VariationRequestBody {
  payload?: PressPilotSaaSInput;
  input?: StudioFormInput;
  businessTypeId?: string | null;
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as VariationRequestBody;

  try {
    const payloadCandidate = body.payload ?? buildSaaSInputFromStudioInput(body.input);
    const payload = validateSaaSInput(payloadCandidate);

    const { kit, styleVariation } = await resolveBusinessTypeStyle(body.businessTypeId ?? null);
    if (body.businessTypeId && !styleVariation) {
      return NextResponse.json({ error: 'Invalid businessTypeId' }, { status: 400 });
    }

    const context = applyBusinessInputs(payload);
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
            businessTypeId: body.businessTypeId ?? null,
            styleVariation: styleVariation ?? null,
          },
        },
      })) as RawVariationResponse;
      variationSet = buildVariationSetFromAI(context, aiResponse);
    } catch (err) {
      console.error('[api/variations] AI engine unavailable, using fallback', err);
      variationSet = buildFallbackVariationSet(context);
    }

    return NextResponse.json({
      variationSet,
      businessTypeId: body.businessTypeId ?? null,
      styleVariation: styleVariation ?? null,
      kitVersion: kit.version
    });
  } catch (error) {
    console.error('[api/variations] generation failed', error);
    return NextResponse.json({ error: 'Failed to generate variations' }, { status: 500 });
  }
}
