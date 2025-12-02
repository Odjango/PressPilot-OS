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
    keyTakeaways: string[];
    actionableInsights: string[];
    outline?: { timestamp?: string; heading: string; details?: string }[];
    articleVersion?: string;
    language: string;
  };
  extras?: {
    arabicSummary?: string;
  };
};

export default function VideoSummaryPage() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [result, setResult] = useState<YTSummaryResult | null>(null);

  const [manualTranscript, setManualTranscript] = useState("");
  const [manualLoading, setManualLoading] = useState(false);

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

            {error.code === "TRANSCRIPT_SERVICE_ERROR" && (
              <div className="border border-neutral-800 rounded-md p-4 space-y-3 bg-neutral-900">
                <h3 className="text-sm font-semibold text-gray-200">Manual Transcript Fallback</h3>
                <p className="text-sm text-gray-400">
                  Captions appear to exist, but automatic transcript fetch failed. You can paste the transcript manually below and still get a full summary.
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
            <div className="border border-neutral-800 rounded-md p-4 space-y-2 bg-neutral-900">
              <h2 className="text-lg font-semibold text-gray-100">Executive Summary</h2>
              <p className="text-sm text-gray-300 whitespace-pre-line">{result.summary.executiveSummary}</p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="border border-neutral-800 rounded-md p-4 space-y-2 bg-neutral-900">
                <h3 className="text-md font-semibold text-gray-100">Key Takeaways</h3>
                <ul className="text-sm text-gray-300 list-disc pl-4 space-y-1">
                  {result.summary.keyTakeaways?.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
              <div className="border border-neutral-800 rounded-md p-4 space-y-2 bg-neutral-900">
                <h3 className="text-md font-semibold text-gray-100">Actionable Insights</h3>
                <ul className="text-sm text-gray-300 list-disc pl-4 space-y-1">
                  {result.summary.actionableInsights?.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>

            {result.summary.outline && result.summary.outline.length > 0 && (
              <div className="border border-neutral-800 rounded-md p-4 space-y-2 bg-neutral-900">
                <h3 className="text-md font-semibold text-gray-100">Outline</h3>
                <ul className="text-sm text-gray-300 space-y-1">
                  {result.summary.outline.map((item, i) => (
                    <li key={i}>
                      {item.timestamp && <span className="font-mono mr-2 text-neutral-500">{item.timestamp}</span>}
                      <strong className="text-gray-200">{item.heading}</strong>
                      {item.details && <span className="text-gray-400">{": "}{item.details}</span>}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {result.summary.articleVersion && result.summary.articleVersion.trim().length > 0 && (
              <div className="border border-neutral-800 rounded-md p-4 space-y-2 bg-neutral-900">
                <h3 className="text-md font-semibold text-gray-100">Article Version</h3>
                <p className="text-sm text-gray-300 whitespace-pre-line">{result.summary.articleVersion}</p>
              </div>
            )}

            {result.extras?.arabicSummary && (
              <div className="border border-neutral-800 rounded-md p-4 space-y-2 bg-neutral-900">
                <h3 className="text-md font-semibold text-gray-100">Arabic Summary</h3>
                <p className="text-sm text-gray-300 whitespace-pre-line">{result.extras.arabicSummary}</p>
              </div>
            )}
          </section>
        )}
      </div>
    </main>
  );
}
