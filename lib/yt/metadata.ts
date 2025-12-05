import { extractYouTubeVideoId } from "./transcript";

export interface YTVideoMetadata {
    videoId: string;
    title: string;
    channelTitle: string;
    description: string;
    publishedAt: string;
    durationISO8601: string;
    viewCount?: number;
    likeCount?: number;
    commentCount?: number;
    languageCode?: string | null;
}

export type MetadataResult =
    | { ok: true; metadata: YTVideoMetadata }
    | { ok: false; errorCode: string; message: string };

export async function getVideoMetadata(videoId: string): Promise<MetadataResult> {
    const apiKey = process.env.YOUTUBE_API_KEY;

    if (!apiKey) {
        console.warn("[getVideoMetadata] Missing YOUTUBE_API_KEY, returning minimal metadata.");
        return {
            ok: true,
            metadata: {
                videoId,
                title: `Video ${videoId}`,
                channelTitle: "Unknown Channel",
                description: "",
                publishedAt: new Date().toISOString(),
                durationISO8601: "PT0M0S",
            },
        };
    }

    try {
        const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,statistics&id=${videoId}&key=${apiKey}`;
        const res = await fetch(url);

        if (!res.ok) {
            return {
                ok: false,
                errorCode: "METADATA_ERROR",
                message: `YouTube API failed: ${res.status} ${res.statusText}`,
            };
        }

        const data = await res.json();
        if (!data.items || data.items.length === 0) {
            return {
                ok: false,
                errorCode: "VIDEO_NOT_FOUND",
                message: "Video not found or is private.",
            };
        }

        const item = data.items[0];
        const snippet = item.snippet;
        const contentDetails = item.contentDetails;
        const statistics = item.statistics;

        const metadata: YTVideoMetadata = {
            videoId,
            title: snippet.title,
            channelTitle: snippet.channelTitle,
            description: snippet.description,
            publishedAt: snippet.publishedAt,
            durationISO8601: contentDetails.duration,
            viewCount: statistics.viewCount ? parseInt(statistics.viewCount, 10) : undefined,
            likeCount: statistics.likeCount ? parseInt(statistics.likeCount, 10) : undefined,
            commentCount: statistics.commentCount ? parseInt(statistics.commentCount, 10) : undefined,
            languageCode: snippet.defaultAudioLanguage || snippet.defaultLanguage || null,
        };

        return { ok: true, metadata };
    } catch (error: any) {
        console.error("[getVideoMetadata] Error:", error);
        return {
            ok: false,
            errorCode: "METADATA_ERROR",
            message: error.message || "Unknown error fetching metadata",
        };
    }
}
