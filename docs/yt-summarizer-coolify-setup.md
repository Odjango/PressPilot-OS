# YouTube Summarizer - Coolify Setup Guide

This guide explains how to deploy the **YouTube Summarizer** tool (part of PressPilot-OS) on **Coolify**.

## 1. Service Overview

-   **Service Name**: YouTube Summarizer (PressPilot-OS)
-   **Code Location**: Root of the `PressPilot-OS` repository.
-   **Tech Stack**: Next.js (Node.js).
-   **Dockerfile**: `Dockerfile.coolify` (created specifically for this deployment).

## 2. Coolify UI Steps

Follow these steps in your Coolify dashboard:

1.  **Create Resource**:
    *   Go to your Project / Environment.
    *   Click **+ New** -> **Application** -> **Public Repository** (or Private if using a token).
    *   Repository URL: `https://github.com/Odjango/PressPilot-OS` (or your repo URL).
    *   Branch: `main` (or your active branch).

2.  **Configuration**:
    *   **Build Pack**: Select **Dockerfile**.
    *   **Dockerfile Path**: `/Dockerfile.coolify`
        *   *Note: We use this specific file to ensure it uses `npm` and builds correctly.*
    *   **Base Directory**: `/` (Root).
    *   **Port**: `3000`.

3.  **Environment Variables**:
    *   Go to the **Environment Variables** tab.
    *   Add the variables listed in the table below.

4.  **Deploy**:
    *   Click **Deploy**.
    *   Watch the **Logs** tab. You should see the build process (installing dependencies, building Next.js) and finally:
        ```
        Ready in ...ms
        ```

## 3. Environment Variables

Copy these into Coolify.

| Variable Name | Required? | Purpose | Example Value |
| :--- | :--- | :--- | :--- |
| `OPENAI_API_KEY` | **Yes** | OpenAI key for generating summaries. | `sk-proj-...` |
| `LLM_API_KEY` | **Yes** | Same as above (used by some internal helpers). | `sk-proj-...` (Same as OPENAI_API_KEY) |
| `YOUTUBE_API_KEY` | **Yes** | YouTube Data API key for video metadata. | `AIzaSy...` |
| `NEXT_PUBLIC_SUPABASE_URL` | **Yes** | Supabase URL for caching summaries. | `https://xyz.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | **Yes** | Supabase Anon Key for caching. | `eyJhbG...` |
| `LLM_MODEL_YT_SUMMARY_STANDARD`| No | Model for Standard tier (defaults to gpt-4o-mini).| `gpt-4o-mini` |
| `LLM_MODEL_YT_SUMMARY_PREMIUM` | No | Model for Premium tier (defaults to gpt-4o). | `gpt-4o` |
| `NODE_ENV` | No | Set to production (Dockerfile handles this, but good to set). | `production` |

## 4. Quick Smoke Test

Once the deployment is green (Healthy):

1.  Open the **Public Domain** link provided by Coolify (e.g., `https://yt-summary.your-domain.com`).
2.  Navigate to `/tools/video-summary`.
3.  Paste a YouTube URL (e.g., `https://www.youtube.com/watch?v=jNQXAC9IVRw`).
4.  Click **Summarize Video**.
5.  **Success**: You should see the Executive Summary, Core Insights, and other sections appear.

## Troubleshooting

-   **Build Fails?** Check the Logs. If it complains about `pnpm`, ensure you are using `Dockerfile.coolify` which forces `npm`.
-   **500 Error?** Check if `OPENAI_API_KEY` or `YOUTUBE_API_KEY` are set correctly in Coolify.
