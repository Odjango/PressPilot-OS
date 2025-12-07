/**
 * Extract a YouTube video ID from a URL or return null if invalid.
 * Supports:
 * - https://www.youtube.com/watch?v=ID
 * - https://youtu.be/ID
 * - https://www.youtube.com/live/ID
 * - https://www.youtube.com/shorts/ID
 * - https://www.youtube.com/embed/ID
 * - https://youtube.com/v/ID
 * - Protocol-less variants
 */
export function extractYouTubeVideoId(rawUrl: string): string | null {
    if (!rawUrl) return null;

    const input = rawUrl.trim();

    try {
        // Ensure we have a protocol so new URL() works
        const url = input.startsWith('http://') || input.startsWith('https://')
            ? new URL(input)
            : new URL(`https://${input}`);

        const hostname = url.hostname.replace(/^www\./, '');

        // Only accept YouTube hosts
        if (hostname !== 'youtube.com' && hostname !== 'youtu.be') {
            return null;
        }

        // Case 1: youtu.be/<ID>
        if (hostname === 'youtu.be') {
            const id = url.pathname.split('/').filter(Boolean)[0];
            return id && id.length >= 11 ? id : null;
        }

        // From here: youtube.com/...
        const path = url.pathname;

        // Case 2: youtube.com/watch?v=<ID>
        if (path === '/watch') {
            const v = url.searchParams.get('v');
            return v && v.length >= 11 ? v : null;
        }

        // Case 3–6: /live/<ID>, /shorts/<ID>, /embed/<ID>, /v/<ID>
        const prefixes = ['/live/', '/shorts/', '/embed/', '/v/'];

        for (const prefix of prefixes) {
            if (path.startsWith(prefix)) {
                const id = path.slice(prefix.length).split('/')[0];
                return id && id.length >= 11 ? id : null;
            }
        }

        // Otherwise: unsupported pattern
        return null;
    } catch {
        // new URL() failed (bad URL)
        return null;
    }
}

/**
 * Check if a string is a valid YouTube URL.
 */
export function isValidYouTubeUrl(rawUrl: string): boolean {
    return extractYouTubeVideoId(rawUrl) !== null;
}
