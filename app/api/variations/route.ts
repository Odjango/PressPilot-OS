import { NextResponse } from "next/server";
import { buildSaaSInputFromStudioInput } from "@/lib/presspilot/studioAdapter";
import { applyBusinessInputs } from "@/lib/presspilot/context";
import { buildFallbackVariationSet } from "@/lib/presspilot/fallbackVariations";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { input } = body;

        if (!input) {
            return NextResponse.json({ error: "Missing input" }, { status: 400 });
        }

        // 1. Normalize Input
        const saasInput = buildSaaSInputFromStudioInput(input);
        const context = applyBusinessInputs(saasInput);

        // 2. Generate Variations
        // In a production environment, this would call an AI service.
        // For the OS version, we provide a robust set of fallback variations.
        const variationSet = buildFallbackVariationSet(context);

        // 3. Return results
        return NextResponse.json({
            variationSet,
            businessTypeId: input.businessCategory,
            styleVariation: "standard-v1",
        });
    } catch (error) {
        console.error("[API/Variations] Error:", error);
        return NextResponse.json(
            { error: "Failed to generate variations" },
            { status: 500 }
        );
    }
}
