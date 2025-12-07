import { NextRequest, NextResponse } from "next/server";
import { getTranscript } from "@/lib/yt/transcript";
import { extractYouTubeVideoId } from "@/lib/yt/validation";
import { summarizeTranscript, SummarizeOptions, YTQuality } from "@/lib/yt/summarize";
import { getVideoMetadata } from "@/lib/yt/metadata";
import { getCachedSummary, setCachedSummary } from "@/lib/yt/cache";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const url = (body?.url ?? "").toString();
    const manualTranscript = body?.manualTranscript;
    const optionsBody = body?.options || {};

    const quality: YTQuality = optionsBody.quality === "premium" ? "premium" : "standard";
    const includeArticle = !!optionsBody.includeArticle;
    const language = optionsBody.language || "en";

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

    // 1. Check Cache
    const cached = await getCachedSummary(videoId, quality);
    if (cached) {
      console.log(`[API] Cache hit for ${videoId} (${quality})`);
      return NextResponse.json({ success: true, data: cached });
    }

    // 2. Fetch Metadata
    const metadataResult = await getVideoMetadata(videoId);
    if (!metadataResult.ok) {
      // If metadata fails (e.g. video private), we probably can't summarize it well anyway unless manual transcript.
      // But if manual transcript is provided, we might want to proceed with minimal metadata.
      // For now, let's fail if metadata fails, unless manual transcript is present.
      if (!manualTranscript) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: metadataResult.errorCode,
              message: metadataResult.message,
            },
          },
          { status: 400 }
        );
      }
    }

    // Use fetched metadata or fallback if manual transcript allows proceeding
    const videoMetadata = metadataResult.ok ? metadataResult.metadata : {
      videoId,
      title: "Unknown Video",
      channelTitle: "Unknown Channel",
      description: "",
      publishedAt: new Date().toISOString(),
      durationISO8601: "PT0M0S",
    };

    // 3. Get Transcript
    let transcriptText = "";
    if (manualTranscript && typeof manualTranscript === 'string' && manualTranscript.trim().length > 0) {
      console.log(`[API] Using manual transcript for ${videoId}`);
      transcriptText = manualTranscript;
    } else {
      const transcriptResult = await getTranscript(videoId);
      if (!transcriptResult.ok) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: transcriptResult.errorCode,
              message: transcriptResult.message,
            },
          },
          { status: 400 }
        );
      }
      transcriptText = transcriptResult.transcriptText;
    }

    // 4. Summarize
    const summaryResult = await summarizeTranscript(
      {
        video: videoMetadata,
        transcript: transcriptText,
      },
      {
        quality,
        includeArticle,
        language,
      }
    );

    // 5. Save to Cache
    await setCachedSummary(videoId, quality, summaryResult);

    return NextResponse.json({ success: true, data: summaryResult });

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
