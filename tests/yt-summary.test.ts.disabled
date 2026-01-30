import { extractYouTubeVideoId } from "../lib/yt/validation";
import assert from "assert";

async function runTests() {
    console.log("Running YT Summary Tests...");

    // Test extractYouTubeVideoId
    console.log("Testing extractYouTubeVideoId...");

    const cases = [
        { url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", expected: "dQw4w9WgXcQ" },
        { url: "https://youtu.be/dQw4w9WgXcQ", expected: "dQw4w9WgXcQ" },
        { url: "https://www.youtube.com/live/dcEcpmCn88I?si=Bqmj7f123", expected: "dcEcpmCn88I" },
        { url: "https://www.youtube.com/shorts/dQw4w9WgXcQ?si=abc", expected: "dQw4w9WgXcQ" },
        { url: "https://www.youtube.com/embed/dQw4w9WgXcQ", expected: "dQw4w9WgXcQ" },
        { url: "https://youtube.com/v/dQw4w9WgXcQ", expected: "dQw4w9WgXcQ" },
        { url: "youtube.com/watch?v=dQw4w9WgXcQ", expected: "dQw4w9WgXcQ" }, // No protocol
        { url: "youtu.be/dQw4w9WgXcQ", expected: "dQw4w9WgXcQ" }, // No protocol
        { url: "https://google.com", expected: null },
        { url: "hello", expected: null },
        { url: "https://vimeo.com/12345", expected: null },
        { url: "", expected: null },
    ];

    for (const c of cases) {
        const actual = extractYouTubeVideoId(c.url);
        assert.strictEqual(actual, c.expected, `Failed for ${c.url}: expected ${c.expected}, got ${actual}`);
    }

    console.log("PASS: extractYouTubeVideoId");

    // Test isValidYouTubeUrl
    console.log("Testing isValidYouTubeUrl...");
    const { isValidYouTubeUrl } = require("../lib/yt/validation");
    assert.strictEqual(isValidYouTubeUrl("https://www.youtube.com/live/dcEcpmCn88I"), true);
    assert.strictEqual(isValidYouTubeUrl("invalid"), false);
    console.log("PASS: isValidYouTubeUrl");

    console.log("To test summarizeTranscript, please configure .env and run the app manually.");
}

runTests().catch((e) => {
    console.error("Tests failed:", e);
    process.exit(1);
});
