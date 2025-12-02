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
    keyTakeaways: string[];
    actionableInsights: string[];
    outline?: { timestamp?: string; heading: string; details?: string }[];
    articleVersion?: string;
    language: "en" | "ar" | string;
  };
  extras?: {
    arabicSummary?: string;
  };
};
