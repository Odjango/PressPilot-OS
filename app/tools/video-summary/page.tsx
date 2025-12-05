"use client";

// app/tools/video-summary/page.tsx
// Minimal client UI for the YouTube Video Summary tool.

import { useState } from "react";

type ApiError = {
  code: string;
  message: string;
};

type YTSummaryResult = {
  video: {
    id: string;
    url: string;
    title?: string;
    channelName?: string;
    durationSeconds?: number | null;
  };
  summary: {
    executiveSummary: string;
    coreInsights: string[];
    actionableInsights: string[];
    risks?: string[];
    narrative: string;
    snapshotConclusion: string;

    // Legacy/Internal fields
    keyTakeaways?: string[];
    outline?: { timestamp?: string; heading: string; details?: string }[];
    articleVersion?: string;
    language: string;
  };
  extras?: {
    arabicSummary?: string;
    quality?: "standard" | "premium";
  };
};

export default function VideoSummaryPage() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [result, setResult] = useState<YTSummaryResult | null>(null);
  const [quality, setQuality] = useState<"standard" | "premium">("standard");

  const [manualTranscript, setManualTranscript] = useState("");
  const [manualLoading, setManualLoading] = useState(false);
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    setManualTranscript(""); // Reset manual transcript on new URL

    try {
      const res = await fetch("/api/yt/summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url,
          options: {
            quality,
            includeArticle: true,
            includeArabic: false,
          },
        }),
      });

      const json = await res.json();
      if (!json.success) {
        setError(json.error ?? { code: "UNKNOWN", message: "Unknown error." });
      } else {
        setResult(json.data as YTSummaryResult);
      }
    } catch (err) {
      console.error(err);
      setError({
        code: "NETWORK_ERROR",
        message: "Network error while calling the summary API.",
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleManualSubmit() {
    if (!manualTranscript.trim()) return;
    setManualLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/yt/summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url,
          manualTranscript,
          options: {
            quality,
            includeArticle: true,
            includeArabic: false,
          },
        }),
      });

      const json = await res.json();
      if (!json.success) {
        setError(json.error ?? { code: "UNKNOWN", message: "Unknown error." });
      } else {
        setResult(json.data as YTSummaryResult);
      }
    } catch (err) {
      console.error(err);
      setError({
        code: "NETWORK_ERROR",
        message: "Network error while calling the summary API.",
      });
    } finally {
      setManualLoading(false);
    }
  }

  const handleCopy = async () => {
    if (!result) return;

    const s = result.summary;
    const lines: string[] = [];

    lines.push("EXECUTIVE SUMMARY");
    lines.push("-----------------");
    lines.push(s.executiveSummary);
    lines.push("");

    if (s.coreInsights && s.coreInsights.length > 0) {
      lines.push("CORE INSIGHTS");
      lines.push("-------------");
      s.coreInsights.forEach(i => lines.push(`- ${i}`));
      lines.push("");
    }

    if (s.actionableInsights && s.actionableInsights.length > 0) {
      lines.push("ACTIONABLES");
      lines.push("-----------");
      s.actionableInsights.forEach(i => lines.push(`- ${i}`));
      lines.push("");
    }

    if (s.risks && s.risks.length > 0) {
      lines.push("RISKS / GOTCHAS");
      lines.push("---------------");
      s.risks.forEach(i => lines.push(`- ${i}`));
      lines.push("");
    }

    if (s.narrative) {
      lines.push("NARRATIVE");
      lines.push("---------");
      lines.push(s.narrative);
      lines.push("");
    }

    if (s.snapshotConclusion) {
      lines.push("SNAPSHOT CONCLUSION");
      lines.push("-------------------");
      lines.push(s.snapshotConclusion);
      lines.push("");
    }

    const text = lines.join("\n");

    try {
      await navigator.clipboard.writeText(text);
      setCopyStatus("copied");
      setTimeout(() => setCopyStatus("idle"), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <main className="min-h-screen bg-neutral-950 text-gray-100 py-10 px-4">
      <div className="max-w-3xl mx-auto space-y-8">
        <section className="space-y-2">
          <h1 className="text-2xl font-semibold text-gray-100">YouTube Video Summary</h1>
          <p className="text-sm text-gray-400">
            Paste a YouTube URL and get an AI-generated executive summary, key takeaways, and more.
          </p>
        </section>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label htmlFor="url" className="block text-sm font-medium text-gray-300">
              YouTube URL
            </label>
            <input
              id="url"
              type="url"
              required
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              className="w-full border border-neutral-700 rounded-md px-3 py-2 text-sm bg-neutral-900 text-gray-100 placeholder:text-neutral-500 focus:ring-1 focus:ring-neutral-500 focus:border-neutral-500 outline-none transition-colors"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-300">Quality</label>
            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="quality"
                  value="standard"
                  checked={quality === "standard"}
                  onChange={() => setQuality("standard")}
                  className="text-neutral-500 focus:ring-neutral-500 bg-neutral-900 border-neutral-700"
                />
                <span className="text-sm text-gray-300">Standard (Fast, Cheaper)</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="quality"
                  value="premium"
                  checked={quality === "premium"}
                  onChange={() => setQuality("premium")}
                  className="text-neutral-500 focus:ring-neutral-500 bg-neutral-900 border-neutral-700"
                />
                <span className="text-sm text-gray-300">Premium (Deep Analysis)</span>
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || manualLoading}
            className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-md border border-neutral-700 bg-neutral-800 text-white hover:bg-neutral-700 disabled:opacity-60 transition-colors"
          >
            {loading ? "Summarizing…" : "Summarize Video"}
          </button>
        </form>

        {error && (
          <div className="space-y-4">
            <div className="border border-red-500/50 bg-red-900/20 text-red-200 text-sm px-3 py-2 rounded-md">
              <strong>{error.code}:</strong> {error.message}
            </div>

            {error.code === "NO_TRANSCRIPT_AVAILABLE" && (
              <div className="border border-neutral-800 rounded-md p-4 space-y-2 bg-neutral-900">
                <p className="text-sm text-yellow-400">
                  This video has no accessible captions. Please try another video or paste the transcript manually below.
                </p>
              </div>
            )}

            {(error.code === "TRANSCRIPT_SERVICE_ERROR" || error.code === "NO_TRANSCRIPT_AVAILABLE") && (
              <div className="border border-neutral-800 rounded-md p-4 space-y-3 bg-neutral-900">
                <h3 className="text-sm font-semibold text-gray-200">Manual Transcript Fallback</h3>
                <p className="text-sm text-gray-400">
                  If you have the transcript text, paste it here to generate the summary.
                </p>
                <textarea
                  className="w-full border border-neutral-700 rounded-md px-3 py-2 text-sm h-48 font-mono bg-neutral-950 text-gray-100 placeholder:text-neutral-600 focus:ring-1 focus:ring-neutral-500 focus:border-neutral-500 outline-none transition-colors"
                  placeholder="Paste transcript text here..."
                  value={manualTranscript}
                  onChange={(e) => setManualTranscript(e.target.value)}
                />
                <button
                  type="button"
                  onClick={handleManualSubmit}
                  disabled={manualLoading || !manualTranscript.trim()}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-md border border-neutral-700 bg-neutral-800 text-white hover:bg-neutral-700 disabled:opacity-60 transition-colors"
                >
                  {manualLoading ? "Processing..." : "Summarize Pasted Transcript"}
                </button>
              </div>
            )}
          </div>
        )}

        {result && (
          <section className="space-y-6">
            {/* Executive Summary */}
            <div className="border border-neutral-800 rounded-md p-4 space-y-2 bg-neutral-900">
              <div className="flex justify-between items-start">
                <h2 className="text-lg font-semibold text-gray-100">Executive Summary</h2>
                {result.extras?.quality && (
                  <span className="text-xs px-2 py-1 rounded-full bg-neutral-800 text-neutral-400 uppercase tracking-wider">
                    {result.extras.quality}
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-300 whitespace-pre-line leading-relaxed">{result.summary.executiveSummary}</p>
            </div>

            {/* Core Insights & Actionables */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="border border-neutral-800 rounded-md p-4 space-y-2 bg-neutral-900">
                <h3 className="text-md font-semibold text-gray-100">Core Insights</h3>
                <ul className="text-sm text-gray-300 list-disc pl-4 space-y-1">
                  {(result.summary.coreInsights || result.summary.keyTakeaways)?.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
              <div className="border border-neutral-800 rounded-md p-4 space-y-2 bg-neutral-900">
                <h3 className="text-md font-semibold text-gray-100">Actionables</h3>
                <ul className="text-sm text-gray-300 list-disc pl-4 space-y-1">
                  {result.summary.actionableInsights?.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Risks (Optional) */}
            {result.summary.risks && result.summary.risks.length > 0 && (
              <div className="border border-neutral-800 rounded-md p-4 space-y-2 bg-neutral-900">
                <h3 className="text-md font-semibold text-gray-100">Risks / Gotchas</h3>
                <ul className="text-sm text-gray-300 list-disc pl-4 space-y-1">
                  {result.summary.risks.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Narrative */}
            {result.summary.narrative && (
              <div className="border border-neutral-800 rounded-md p-4 space-y-2 bg-neutral-900">
                <h3 className="text-md font-semibold text-gray-100">Narrative</h3>
                <p className="text-sm text-gray-300 whitespace-pre-line leading-relaxed">{result.summary.narrative}</p>
              </div>
            )}

            {/* Snapshot Conclusion */}
            {result.summary.snapshotConclusion && (
              <div className="border border-neutral-800 rounded-md p-4 space-y-2 bg-neutral-900">
                <h3 className="text-md font-semibold text-gray-100">Snapshot Conclusion</h3>
                <p className="text-sm text-gray-300 italic">{result.summary.snapshotConclusion}</p>
              </div>
            )}

            {/* Copy Button */}
            <div className="flex justify-end pt-2">
              <button
                onClick={handleCopy}
                className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-md border border-neutral-700 bg-neutral-800 text-white hover:bg-neutral-700 transition-colors"
              >
                {copyStatus === "copied" ? "Copied!" : "Copy Summary"}
              </button>
            </div>

          </section>
        )}
      </div>
    </main>
  );
}
