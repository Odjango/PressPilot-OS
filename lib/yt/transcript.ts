// lib/yt/transcript.ts
// TODO: Antigravity/Gemini: wire this to a real transcript provider (YouTube API or external).

export type TranscriptResult =
  | {
    ok: true;
    transcriptText: string;
    languageCode: string;
    meta?: any; // Keep for backward compatibility if needed internally
  }
  | {
    ok: false;
    errorCode: "NO_TRANSCRIPT_AVAILABLE" | "TRANSCRIPT_SERVICE_ERROR";
    message: string;
  };

// function moved to ./validation.ts

/**
 * Placeholder implementation.
 * For now, returns a "not implemented" error so the API returns a friendly message.
 * Antigravity: replace with real transcript fetching logic.
 */
export async function getTranscript(videoId: string): Promise<TranscriptResult> {
  try {
    // 1. Try custom provider if configured
    if (process.env.YT_TRANSCRIPT_PROVIDER_URL) {
      try {
        const res = await fetch(`${process.env.YT_TRANSCRIPT_PROVIDER_URL}?videoId=${videoId}`);
        if (res.ok) {
          const data = await res.json();
          if (data.transcript) {
            return {
              ok: true,
              transcriptText: data.transcript,
              languageCode: data.language || "en",
              meta: data.meta,
            };
          }
        }
      } catch (e) {
        console.warn("Custom transcript provider failed, falling back to local scraper", e);
      }
    }

    // 2. Custom implementation: Fetch watch page and parse captions
    console.log(`[getTranscript] Fetching watch page for videoId: ${videoId}`);
    const watchUrl = `https://www.youtube.com/watch?v=${videoId}`;
    const watchPageRes = await fetch(watchUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9",
      },
    });

    if (!watchPageRes.ok) {
      return {
        ok: false,
        errorCode: "TRANSCRIPT_SERVICE_ERROR",
        message: `Failed to fetch watch page: ${watchPageRes.status} ${watchPageRes.statusText}`,
      };
    }

    const html = await watchPageRes.text();

    // Extract ytInitialPlayerResponse
    const playerResponseMatch = html.match(/ytInitialPlayerResponse\s*=\s*({.+?});/);
    if (!playerResponseMatch) {
      return {
        ok: false,
        errorCode: "TRANSCRIPT_SERVICE_ERROR",
        message: "Failed to parse player response from YouTube page.",
      };
    }

    let playerResponse: any;
    try {
      playerResponse = JSON.parse(playerResponseMatch[1]);
    } catch (e) {
      return {
        ok: false,
        errorCode: "TRANSCRIPT_SERVICE_ERROR",
        message: "Failed to parse JSON player response.",
      };
    }

    // 3. InnerTube API approach (modern UI method)
    // Extract ytInitialData
    const initialDataMatch = html.match(/ytInitialData\s*=\s*({.+?});/);
    if (!initialDataMatch) {
      console.warn("[getTranscript] ytInitialData not found.");
    } else {
      try {
        const initialData = JSON.parse(initialDataMatch[1]);

        // Find transcript params by deep search
        let transcriptParams: string | null = null;

        const findParams = (obj: any) => {
          if (!obj) return;
          if (transcriptParams) return; // Found it

          if (obj.getTranscriptEndpoint) {
            transcriptParams = obj.getTranscriptEndpoint.params;
            return;
          }

          if (typeof obj === 'object') {
            for (const key in obj) {
              findParams(obj[key]);
            }
          }
        };

        findParams(initialData);
        if (transcriptParams) {
          console.log(`[getTranscript] Found InnerTube transcript params: ${transcriptParams}`);

          // Extract API Key
          const apiKeyMatch = html.match(/"INNERTUBE_API_KEY":"(.+?)"/);
          const apiKey = apiKeyMatch ? apiKeyMatch[1] : null;

          // Extract Client Version
          const clientVersionMatch = html.match(/"clientVersion":"(.+?)"/);
          const clientVersion = clientVersionMatch ? clientVersionMatch[1] : "2.20240101.01.00";

          if (apiKey) {
            console.log(`[getTranscript] Fetching transcript via InnerTube API...`);
            const innerTubeUrl = `https://www.youtube.com/youtubei/v1/get_transcript?key=${apiKey}`;

            const innerTubeRes = await fetch(innerTubeUrl, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
              },
              body: JSON.stringify({
                context: {
                  client: {
                    hl: "en",
                    gl: "US",
                    clientName: "WEB",
                    clientVersion: clientVersion,
                  }
                },
                params: transcriptParams,
              }),
            });

            if (innerTubeRes.ok) {
              const innerTubeData = await innerTubeRes.json();
              // Parse InnerTube response
              const actions = innerTubeData?.actions;
              if (actions) {
                let segments: any[] = [];
                // Deep search for initialSegments
                const findSegments = (obj: any) => {
                  if (!obj) return;
                  if (obj.initialSegments) {
                    segments = obj.initialSegments;
                    return;
                  }
                  if (typeof obj === 'object') {
                    for (const key in obj) {
                      findSegments(obj[key]);
                    }
                  }
                };
                findSegments(actions);

                if (segments.length > 0) {
                  const fullText = segments.map((s: any) => s.transcriptSegmentRenderer?.snippet?.runs?.map((r: any) => r.text).join("")).join(" ").replace(/\s+/g, " ").trim();
                  console.log(`[getTranscript] Successfully parsed InnerTube transcript. Length: ${fullText.length}`);
                  return {
                    ok: true,
                    transcriptText: fullText,
                    languageCode: "en", // InnerTube usually returns what we asked for (en)
                    meta: {
                      title: playerResponse?.videoDetails?.title,
                      channelName: playerResponse?.videoDetails?.author,
                      durationSeconds: parseInt(playerResponse?.videoDetails?.lengthSeconds || "0", 10),
                    },
                  };
                }
              }
            } else {
              console.warn(`[getTranscript] InnerTube API failed: ${innerTubeRes.status}`);
            }
          }
        }
      } catch (e) {
        console.warn("[getTranscript] Error parsing ytInitialData or fetching InnerTube transcript:", e);
      }
    }

    // Fallback to captionTracks if InnerTube failed or params not found
    const captions = playerResponse?.captions?.playerCaptionsTracklistRenderer?.captionTracks;

    if (!captions || !Array.isArray(captions) || captions.length === 0) {
      return {
        ok: false,
        errorCode: "NO_TRANSCRIPT_AVAILABLE",
        message: "No captionTracks found in player response.",
      };
    }

    // Sort tracks: prefer 'en' manual, then 'en' auto, then others
    const sortedTracks = captions.sort((a: any, b: any) => {
      const aLang = a.languageCode === 'en';
      const bLang = b.languageCode === 'en';
      const aAuto = a.kind === 'asr';
      const bAuto = b.kind === 'asr';

      if (aLang && !bLang) return -1;
      if (!aLang && bLang) return 1;
      if (aLang && bLang) {
        if (!aAuto && bAuto) return -1; // Prefer manual over auto
        if (aAuto && !bAuto) return 1;
      }
      return 0;
    });

    let finalTranscript: string | null = null;
    let usedTrack: any = null;

    // Extract cookies from watch page response
    const cookies = watchPageRes.headers.get("set-cookie");

    for (const track of sortedTracks) {
      let trackUrl = track.baseUrl;
      if (!trackUrl.includes("fmt=json3")) {
        trackUrl += "&fmt=json3";
      }

      try {
        const trackRes = await fetch(trackUrl, {
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Cookie": cookies || "",
            "Referer": watchUrl,
          },
        });

        if (!trackRes.ok) continue;

        const trackText = await trackRes.text();
        if (!trackText || trackText.trim().length === 0) continue;

        let trackJson: any;
        try {
          trackJson = JSON.parse(trackText);
        } catch (e) {
          continue;
        }

        if (!trackJson.events) continue;

        const segments: string[] = [];
        for (const event of trackJson.events) {
          if (event.segs) {
            for (const seg of event.segs) {
              if (seg.utf8 && seg.utf8 !== "\n") {
                segments.push(seg.utf8);
              }
            }
          }
        }

        finalTranscript = segments.join(" ").replace(/\s+/g, " ").trim();
        usedTrack = track;
        break; // Success!

      } catch (e) {
        // Ignore errors for individual tracks
      }
    }

    if (!finalTranscript) {
      return {
        ok: false,
        errorCode: "TRANSCRIPT_SERVICE_ERROR",
        message: "Failed to fetch any valid transcript track.",
      };
    }

    console.log(`[getTranscript] Successfully parsed transcript from ${usedTrack.languageCode}. Length: ${finalTranscript.length}`);

    return {
      ok: true,
      transcriptText: finalTranscript,
      languageCode: usedTrack.languageCode || "en",
      meta: {
        title: playerResponse?.videoDetails?.title,
        channelName: playerResponse?.videoDetails?.author,
        durationSeconds: parseInt(playerResponse?.videoDetails?.lengthSeconds || "0", 10),
      },
    };

  } catch (error: any) {
    console.error("Transcript fetch error:", error);
    return {
      ok: false,
      errorCode: "TRANSCRIPT_SERVICE_ERROR",
      message: "Unexpected error: " + (error.message || ""),
    };
  }
}
