export type YTSummaryResult = {
  video: {
    id: string;
    url: string;
    title?: string;
    channelName?: string;
    durationSeconds?: number | null;
  };
  summary: {
    executiveSummary: string;
    coreInsights: string[]; // Renamed from keyTakeaways
    actionableInsights: string[];
    risks?: string[]; // New optional section
    narrative: string; // New section
    snapshotConclusion: string; // New section

    // Legacy/Internal fields
    keyTakeaways?: string[]; // Keep optional for backward compat if needed, or remove if we migrate fully
    outline?: { timestamp?: string; heading: string; details?: string }[]; // Keeping outline as it might be useful, though not in strict spec
    articleVersion?: string;
    language: "en" | "ar" | string;
  };
  extras?: {
    arabicSummary?: string;
    quality?: "standard" | "premium";
  };
};
