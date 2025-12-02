# API Design — `/api/yt/summary`

**Method:** POST  
**Path:** `/api/yt/summary`  
**Body:**

```json
{
  "url": "https://www.youtube.com/watch?v=VIDEO_ID",
  "options": {
    "includeArticle": true,
    "includeArabic": false
  }
}
```

**Success (200):**

```json
{
  "success": true,
  "data": {
    "video": {
      "id": "VIDEO_ID",
      "url": "https://www.youtube.com/watch?v=VIDEO_ID",
      "title": "Video title",
      "channelName": "Channel",
      "durationSeconds": 734
    },
    "summary": {
      "executiveSummary": "Short paragraph...",
      "keyTakeaways": ["..."],
      "actionableInsights": ["..."],
      "outline": [
        { "timestamp": "00:00", "heading": "Intro", "details": "..." }
      ],
      "articleVersion": "Long-form article if requested.",
      "language": "en"
    },
    "extras": {
      "arabicSummary": "Optional Arabic short summary."
    }
  }
}
```

**Error:**

```json
{
  "success": false,
  "error": {
    "code": "INVALID_URL | NO_TRANSCRIPT_AVAILABLE | TRANSCRIPT_SERVICE_ERROR | LLM_UNAVAILABLE | INVALID_LLM_OUTPUT",
    "message": "Human-readable message here."
  }
}
```
