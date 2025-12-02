import { getTranscript, extractYouTubeVideoId } from "../lib/yt/transcript";

async function run() {
    const videoId = "gN07gbipMoY"; // TED video
    console.log(`Testing transcript fetch for video ID: ${videoId}`);

    // Test transcript fetch
    console.log("\nFetching transcript...");
    const result = await getTranscript(videoId);

    if (result.ok) {
        console.log("SUCCESS: Transcript fetched.");
        console.log("Length:", result.transcript.length);
        console.log("Snippet:", result.transcript.substring(0, 100));
        console.log("Meta:", JSON.stringify(result.meta, null, 2));
    } else {
        console.log("FAILURE:", JSON.stringify(result, null, 2));
    }
}

run();
