// lib/yt/summarize.ts
// TODO: Antigravity/Gemini: implement LLM call using the prompt in docs/yt-summary/yt-summary.en.prompt.txt

import fs from "fs";
import path from "path";
import OpenAI from "openai";
import type { YTSummaryResult } from "@/types/yt-summary";

type SummarizeOptions = {
  includeArticle?: boolean;
  includeArabic?: boolean;
};

export async function summarizeTranscript(params: {
  video: {
    id: string;
    url: string;
    title?: string;
    channelName?: string;
    durationSeconds?: number | null;
  };
  transcript: string;
  options?: SummarizeOptions;
}): Promise<YTSummaryResult> {
  const { video, transcript, options } = params;

  const apiKey = process.env.LLM_API_KEY;
  const provider = process.env.LLM_PROVIDER || "openai"; // default to openai
  const model = process.env.LLM_MODEL_YT_SUMMARY || "gpt-4o"; // default model

  if (!apiKey) {
    throw new Error("Missing LLM_API_KEY environment variable.");
  }

  const openai = new OpenAI({
    apiKey: apiKey,
    baseURL: provider === "openai" ? undefined : process.env.LLM_BASE_URL, // Optional support for other providers via OpenAI SDK
  });

  // Read the system prompt
  // We assume the app is running in a place where it can read from the docs folder.
  // In Vercel, this might need process.cwd() + path.
  const promptPath = path.join(process.cwd(), "docs/yt-summary/yt-summary.en.prompt.txt");
  let systemPrompt = "";
  try {
    systemPrompt = fs.readFileSync(promptPath, "utf-8");
  } catch (e) {
    console.error("Failed to read prompt file, using fallback.", e);
    systemPrompt = `You are an AI that summarizes YouTube videos from their transcripts.
You MUST respond with valid JSON only.
... (fallback minimal prompt) ...`;
  }

  // Construct the input payload for the LLM
  const inputPayload = {
    video,
    transcript: transcript.slice(0, 100000), // Truncate if too long to avoid token limits (rudimentary)
    options,
  };

  try {
    const completion = await openai.chat.completions.create({
      model: model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: JSON.stringify(inputPayload) },
      ],
      temperature: 0.7,
      response_format: { type: "json_object" }, // Force JSON mode if supported
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error("LLM returned empty response.");
    }

    let parsed: any;
    try {
      parsed = JSON.parse(content);
    } catch (e) {
      // Simple repair: try to find JSON block
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("Failed to parse JSON from LLM response.");
      }
    }

    // Basic validation/patching
    const result: YTSummaryResult = {
      video: parsed.video || video, // Use returned video meta or original
      summary: {
        executiveSummary: parsed.summary?.executiveSummary || "No summary generated.",
        keyTakeaways: parsed.summary?.keyTakeaways || [],
        actionableInsights: parsed.summary?.actionableInsights || [],
        outline: parsed.summary?.outline || [],
        articleVersion: parsed.summary?.articleVersion || "",
        language: parsed.summary?.language || "en",
      },
      extras: parsed.extras || {},
    };

    return result;

  } catch (error: any) {
    console.error("LLM Summarization error:", error);
    // Instead of throwing, we can return a partial result or a specific error structure if the caller expects it.
    // However, the caller (route.ts) expects a YTSummaryResult or throws.
    // Let's throw a structured error that the route can catch and format.
    throw new Error("Failed to generate summary: " + error.message);
  }
}
