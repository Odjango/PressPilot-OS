import { summarizeTranscript } from "@/lib/yt/summarize";
import { YTVideoMetadata } from "@/lib/yt/metadata";

// Mock data
const mockVideo: YTVideoMetadata = {
    videoId: "test-video-id",
    title: "Test Video Title",
    channelTitle: "Test Channel",
    description: "Test Description",
    publishedAt: new Date().toISOString(),
    durationISO8601: "PT10M",
};

const mockTranscript = `
This is a test transcript. It should be long enough to generate some takeaways.
Point 1: The sky is blue because of Rayleigh scattering.
Point 2: Water is wet due to cohesive forces.
Point 3: Fire is hot because of exothermic reactions.
In conclusion, nature is fascinating.
Here is a timeline moment at 01:00 where we talk about the sky.
Here is another moment at 05:00 about water.
`;

async function runTests() {
    const hasKey = !!process.env.LLM_API_KEY;

    if (!hasKey) {
        console.warn("Skipping LLM tests due to missing LLM_API_KEY");
        return;
    }

    console.log("Running Standard Quality Test...");
    try {
        const resultStandard = await summarizeTranscript(
            { video: mockVideo, transcript: mockTranscript },
            { quality: "standard" }
        );
        console.log("Standard Result:", JSON.stringify(resultStandard, null, 2));

        if (!resultStandard.summary.executiveSummary) throw new Error("Missing executiveSummary");
        if (!resultStandard.summary.coreInsights || resultStandard.summary.coreInsights.length < 1) throw new Error("Missing coreInsights");
        if (!resultStandard.summary.actionableInsights) throw new Error("Missing actionableInsights");
        if (!resultStandard.summary.narrative) throw new Error("Missing narrative");
        if (!resultStandard.summary.snapshotConclusion) throw new Error("Missing snapshotConclusion");

        console.log("✅ Standard Test Passed");
    } catch (e) {
        console.error("❌ Standard Test Failed:", e);
    }

    console.log("\nRunning Premium Quality Test...");
    try {
        const resultPremium = await summarizeTranscript(
            { video: mockVideo, transcript: mockTranscript },
            { quality: "premium" }
        );
        console.log("Premium Result:", JSON.stringify(resultPremium, null, 2));

        if (!resultPremium.summary.executiveSummary) throw new Error("Missing executiveSummary");
        if (!resultPremium.summary.coreInsights || resultPremium.summary.coreInsights.length < 1) throw new Error("Missing coreInsights");
        if (!resultPremium.summary.narrative) throw new Error("Missing narrative");
        if (!resultPremium.summary.snapshotConclusion) throw new Error("Missing snapshotConclusion");

        console.log("✅ Premium Test Passed");
    } catch (e) {
        console.error("❌ Premium Test Failed:", e);
    }
}

runTests();
