import { extractYouTubeVideoId } from "../lib/yt/transcript";
import assert from "assert";

async function runTests() {
    console.log("Running YT Summary Tests...");

    // Test extractYouTubeVideoId
    console.log("Testing extractYouTubeVideoId...");

    const cases = [
        { url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", expected: "dQw4w9WgXcQ" },
        { url: "https://youtu.be/dQw4w9WgXcQ", expected: "dQw4w9WgXcQ" },
        { url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=1s", expected: "dQw4w9WgXcQ" },
        { url: "invalid", expected: null },
        { url: "", expected: null },
    ];

    for (const c of cases) {
        const actual = extractYouTubeVideoId(c.url);
        assert.strictEqual(actual, c.expected, `Failed for ${c.url}: expected ${c.expected}, got ${actual}`);
    }

    console.log("PASS: extractYouTubeVideoId");

    console.log("To test summarizeTranscript, please configure .env and run the app manually.");
}

runTests().catch((e) => {
    console.error("Tests failed:", e);
    process.exit(1);
});
