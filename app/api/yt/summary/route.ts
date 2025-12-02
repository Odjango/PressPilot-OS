// app/api/yt/summary/route.ts
// Basic skeleton for the YouTube summary API.
// Antigravity: extend this to call a real transcript provider + LLM summarizer.

import { NextRequest, NextResponse } from "next/server";
import { extractYouTubeVideoId, getTranscript } from "@/lib/yt/transcript";
import { summarizeTranscript } from "@/lib/yt/summarize";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const url = (body?.url ?? "").toString();
    const options = body?.options ?? {};

    if (!url) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "MISSING_URL",
            message: "Please provide a YouTube URL.",
          },
        },
        { status: 400 }
      );
    }

    const videoId = extractYouTubeVideoId(url);
    if (!videoId) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_URL",
            message: "The provided URL is not a valid YouTube link.",
          },
        },
        { status: 400 }
      );
    }

    let transcriptResult: { ok: true; transcript: string; meta?: any } | { ok: false; errorCode: string; errorMessage: string };

    // Check for manual transcript override
    if (body.manualTranscript && typeof body.manualTranscript === 'string' && body.manualTranscript.trim().length > 0) {
      console.log(`[API] Using manual transcript for ${videoId}`);
      transcriptResult = {
        ok: true,
        transcript: body.manualTranscript,
        meta: {} // We don't have metadata from the fetcher, but that's fine
      };
    } else {
      transcriptResult = await getTranscript(videoId);
    }

    if (transcriptResult.ok === false) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: transcriptResult.errorCode,
            message: transcriptResult.errorMessage,
          },
        },
        { status: 400 }
      );
    }

    const videoMeta = {
      id: videoId,
      url,
      title: transcriptResult.meta?.title,
      channelName: transcriptResult.meta?.channelName,
      durationSeconds: transcriptResult.meta?.durationSeconds ?? null,
    };

    const summary = await summarizeTranscript({
      video: videoMeta,
      transcript: transcriptResult.transcript,
      options,
    });

    return NextResponse.json({ success: true, data: summary });
  } catch (error: any) {
    console.error("YT Summary API error", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: error.message || "Unexpected error while generating the summary.",
        },
      },
      { status: 500 }
    );
  }
}
