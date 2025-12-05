import OpenAI from "openai";
import type { YTSummaryResult } from "@/types/yt-summary";
import type { YTVideoMetadata } from "./metadata";

export type YTQuality = "standard" | "premium";

export interface SummarizeOptions {
  quality: YTQuality;
  language?: "en" | "ar";
  includeArticle?: boolean;
}

export async function summarizeTranscript(
  input: {
    video: YTVideoMetadata;
    transcript: string;
  },
  options: SummarizeOptions
): Promise<YTSummaryResult> {
  const { video, transcript } = input;
  const { quality, language = "en" } = options;

  const apiKey = process.env.LLM_API_KEY;
  const provider = process.env.LLM_PROVIDER || "openai";

  // Select model based on quality
  let model = process.env.LLM_MODEL_YT_SUMMARY_STANDARD || "gpt-4o-mini";
  if (quality === "premium") {
    model = process.env.LLM_MODEL_YT_SUMMARY_PREMIUM || "gpt-4o";
  }

  if (!apiKey) {
    throw new Error("Missing LLM_API_KEY environment variable.");
  }

  const openai = new OpenAI({
    apiKey: apiKey,
    baseURL: provider === "openai" ? undefined : process.env.LLM_BASE_URL,
  });

  // Pass 1: Structured Analysis & Behavior Enforcement
  const systemPromptPass1 = `You are a precise, no-fluff video analyst.
Your task is to analyze the provided YouTube video transcript and metadata.
Output ONLY valid JSON matching the structure below. Do not include markdown formatting.

BEHAVIOR RULES:
1. STRICT HIERARCHY: You must follow the 6 sections exactly. No reordering.
2. COMPRESSION: Target 70-85% compression. No padding.
3. DEDUPLICATION: If an idea appears in Core Insights, do NOT repeat it in Actionables.
4. TONE:
   - Executive Summary: Business-like, clear, calm.
   - Core Insights: Neutral, factual.
   - Actionables: Direct, imperative (start with verbs).
   - Narrative: Smooth, human, mini-article style.
   - Snapshot: Punchy, sharp.
5. RELEVANCE: Remove anything not essential for a founder/designer/dev.

JSON STRUCTURE:
{
  "executiveSummary": "Max 4 sentences. Start with core problem/theme. Explain solution. Highlight benefit.",
  "coreInsights": ["Max 5 bullets. Unique conceptual points. Factual & neutral."],
  "actionableInsights": ["3-5 bullets. Pure instructions. Start with a verb (e.g. Audit, Create)."],
  "risks": ["Optional. Only meaningful risks. Empty array if none."],
  "narrative": "5-7 sentences max. Smooth mini-article. No list repetition.",
  "snapshotConclusion": "One clean, punchy sentence answering 'Why does this matter?'"
}
`;

  const userPromptPass1 = `
Video Title: ${video.title}
Channel: ${video.channelTitle}
Duration: ${video.durationISO8601}

Transcript:
${transcript.slice(0, 100000)} // Truncate to avoid hard limits
`;

  try {
    console.log(`[summarize] Pass 1 (Structure) using ${model} (${quality})...`);
    const completion1 = await openai.chat.completions.create({
      model: model,
      messages: [
        { role: "system", content: systemPromptPass1 },
        { role: "user", content: userPromptPass1 },
      ],
      temperature: quality === "premium" ? 0.4 : 0.3, // Slightly more creative for premium
      response_format: { type: "json_object" },
    });

    const content1 = completion1.choices[0]?.message?.content;
    if (!content1) throw new Error("Pass 1 returned empty response.");

    let structuredData: any;
    try {
      structuredData = JSON.parse(content1);
    } catch (e) {
      throw new Error("Failed to parse JSON from Pass 1.");
    }

    // Pass 2: Quality Polish (Premium Only)
    // For Standard, we skip this to save costs/time, as Pass 1 is already quite strict.
    // For Premium, we do a quick polish to ensure "smarter" feel.

    let finalData = structuredData;

    if (quality === "premium") {
      const systemPromptPass2 = `You are an expert editor.
Your goal is to improve the clarity, flow, and impact of the provided video summary JSON.
Refine the text within the existing fields. Do NOT change the JSON structure.
Ensure the "executiveSummary" is punchy and standalone.
Ensure "narrative" flows like a high-quality blog post snippet.
Check for any remaining redundancy between Insights and Actionables.
`;

      console.log(`[summarize] Pass 2 (Polish) using ${model}...`);
      try {
        const completion2 = await openai.chat.completions.create({
          model: model,
          messages: [
            { role: "system", content: systemPromptPass2 },
            { role: "user", content: JSON.stringify(structuredData) },
          ],
          temperature: 0.5,
          response_format: { type: "json_object" },
        });

        const content2 = completion2.choices[0]?.message?.content;
        if (content2) {
          finalData = JSON.parse(content2);
        }
      } catch (e) {
        console.warn("Pass 2 failed, falling back to Pass 1 data.", e);
      }
    }

    // Construct final result
    const result: YTSummaryResult = {
      video: {
        id: video.videoId,
        url: `https://www.youtube.com/watch?v=${video.videoId}`,
        title: video.title,
        channelName: video.channelTitle,
        durationSeconds: 0,
      },
      summary: {
        executiveSummary: finalData.executiveSummary || "No summary generated.",
        coreInsights: finalData.coreInsights || [],
        actionableInsights: finalData.actionableInsights || [],
        risks: finalData.risks || [],
        narrative: finalData.narrative || "",
        snapshotConclusion: finalData.snapshotConclusion || "",

        // Map new fields to legacy ones for safety if UI uses them
        keyTakeaways: finalData.coreInsights || [],
        outline: [], // Not in new spec, empty
        articleVersion: finalData.narrative || "", // Map narrative to articleVersion for now
        language: language,
      },
      extras: {
        quality: quality,
      },
    };

    return result;

  } catch (error: any) {
    console.error("LLM Summarization error:", error);
    throw new Error("Failed to generate summary: " + error.message);
  }
}
