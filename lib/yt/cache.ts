import { createClient } from "@supabase/supabase-js";
import type { YTSummaryResult } from "@/types/yt-summary";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

function getClient() {
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
        console.warn("[yt-cache] Missing Supabase env vars, caching disabled.");
        return null;
    }
    return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: {
            persistSession: false,
        },
    });
}

export async function getCachedSummary(
    videoId: string,
    quality: "standard" | "premium"
): Promise<YTSummaryResult | null> {
    const supabase = getClient();
    if (!supabase) return null;

    try {
        const { data, error } = await supabase
            .from("yt_summaries")
            .select("summary_json")
            .eq("video_id", videoId)
            .eq("quality", quality)
            .order("created_at", { ascending: false })
            .limit(1)
            .single();

        if (error) {
            if (error.code !== "PGRST116") { // PGRST116 is "JSON object requested, multiple (or no) rows returned" - usually means no rows if .single() is used
                console.warn("[yt-cache] Error fetching cache:", error);
            }
            return null;
        }

        if (data && data.summary_json) {
            return data.summary_json as YTSummaryResult;
        }
    } catch (e) {
        console.warn("[yt-cache] Unexpected error reading cache:", e);
    }

    return null;
}

export async function setCachedSummary(
    videoId: string,
    quality: "standard" | "premium",
    summary: YTSummaryResult
): Promise<void> {
    const supabase = getClient();
    if (!supabase) return;

    try {
        const { error } = await supabase.from("yt_summaries").insert({
            video_id: videoId,
            quality,
            language: "en", // Default for now
            summary_json: summary,
        });

        if (error) {
            console.warn("[yt-cache] Failed to save to cache:", error);
        }
    } catch (e) {
        console.warn("[yt-cache] Unexpected error saving cache:", e);
    }
}
