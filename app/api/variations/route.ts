import { NextResponse } from 'next/server';
import { PressPilotSaaSInput } from '@/types/presspilot';
import { applyBusinessInputs } from '@/lib/presspilot/context';
import { generatePressPilotVariations } from '@/lib/presspilot/variations';
import { validateSaaSInput } from '@/lib/presspilot/validation';
import { resolveBusinessTypeStyle } from '@/lib/presspilot/kit';
import { buildSaaSInputFromStudioInput, StudioFormInput } from '@/lib/presspilot/studioAdapter';
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
      variationSet = await generatePressPilotVariations(context);
    } catch (err) {
      console.error('[api/variations] falling back to stub variations', err);
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
