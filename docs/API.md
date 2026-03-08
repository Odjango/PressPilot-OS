# PressPilot OS — API Documentation

**Base URL:** `https://presspilotapp.com/api`

**Version:** 1.0.0

**Last Updated:** 2026-03-08

## Overview

The PressPilot API allows you to programmatically generate production-ready WordPress Full Site Editing (FSE) themes using AI. All endpoints return JSON responses and require proper authentication.

## Authentication

Currently, the API is accessed through the Studio UI. Future versions will support API keys for programmatic access.

---

## Endpoints

### 1. Generate Theme

Start a new theme generation job.

**Endpoint:** `POST /api/generate`

**Request Body:**

\`\`\`json
{
  "name": "Luigi's Pizza",
  "logo": "data:image/png;base64,...",
  "tagline": "Authentic Italian Pizza",
  "description": "Family-owned pizzeria serving authentic Neapolitan-style pizza with fresh ingredients",
  "category": "restaurant",
  "heroLayout": "fullBleed",
  "colorPrimary": "#C8102E",
  "colorSecondary": "#FFD700",
  "fontProfile": "modern"
}
\`\`\`

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| \`name\` | string | Yes | Business name (max 60 chars) |
| \`logo\` | string | No | Base64-encoded image or URL |
| \`tagline\` | string | No | Business tagline (max 100 chars) |
| \`description\` | string | Yes | Business description (min 20 chars) |
| \`category\` | string | Yes | One of: \`restaurant\`, \`ecommerce\`, \`saas\`, \`portfolio\`, \`local_service\` |
| \`heroLayout\` | string | Yes | One of: \`fullBleed\`, \`fullWidth\`, \`split\`, \`minimal\` |
| \`colorPrimary\` | string | No | Hex color code (e.g., \`#C8102E\`) |
| \`colorSecondary\` | string | No | Hex color code |
| \`fontProfile\` | string | Yes | One of: \`modern\`, \`classic\`, \`playful\`, \`elegant\` |

**Response (200 OK):**

\`\`\`json
{
  "success": true,
  "jobId": "abc123xyz789",
  "status": "pending",
  "message": "Theme generation started"
}
\`\`\`

**Response (400 Bad Request):**

\`\`\`json
{
  "success": false,
  "error": "Invalid category. Must be one of: restaurant, ecommerce, saas, portfolio, local_service"
}
\`\`\`

**Response (500 Internal Server Error):**

\`\`\`json
{
  "success": false,
  "error": "Failed to start theme generation job"
}
\`\`\`

---

### 2. Check Generation Status

Poll the status of a theme generation job.

**Endpoint:** \`GET /api/status?id={jobId}\`

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| \`id\` | string | Yes | Job ID returned from \`/api/generate\` |

**Response (200 OK - In Progress):**

\`\`\`json
{
  "status": "processing",
  "progress": 45,
  "message": "Generating content patterns..."
}
\`\`\`

**Response (200 OK - Completed):**

\`\`\`json
{
  "status": "completed",
  "themeUrl": "https://supabase.co/storage/v1/object/signed/...",
  "staticUrl": "https://supabase.co/storage/v1/object/signed/...",
  "images_upgraded": false,
  "expires_at": "2026-03-15T12:00:00Z"
}
\`\`\`

**Response (200 OK - Failed):**

\`\`\`json
{
  "status": "failed",
  "error": "AI content generation timed out. Please try again."
}
\`\`\`

**Response (404 Not Found):**

\`\`\`json
{
  "error": "Job not found"
}
\`\`\`

---

### 3. Upgrade Theme Images

Trigger DALL-E image upgrade for a completed theme (post-payment).

**Endpoint:** \`POST /api/upgrade-images\`

**Request Body:**

\`\`\`json
{
  "jobId": "abc123xyz789"
}
\`\`\`

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| \`jobId\` | string | Yes | Job ID of completed theme |

**Response (200 OK):**

\`\`\`json
{
  "success": true,
  "status": "upgrading",
  "message": "DALL-E image upgrade started. Check status with /api/status"
}
\`\`\`

**Response (400 Bad Request):**

\`\`\`json
{
  "success": false,
  "error": "Theme generation not completed yet"
}
\`\`\`

**Response (402 Payment Required):**

\`\`\`json
{
  "success": false,
  "error": "Payment required to upgrade images"
}
\`\`\`

---

### 4. Payment Webhook (Internal)

**Endpoint:** \`POST /api/webhooks/lemonsqueezy\`

**Description:** LemonSqueezy webhook receiver for payment events. This endpoint is called by LemonSqueezy when a payment is completed.

**Authentication:** Webhook signature verification using \`LEMONSQUEEZY_WEBHOOK_SECRET\`

**Payload Example:**

\`\`\`json
{
  "meta": {
    "event_name": "order_created"
  },
  "data": {
    "attributes": {
      "identifier": "abc123",
      "custom_data": {
        "job_id": "abc123xyz789"
      }
    }
  }
}
\`\`\`

**Response (200 OK):**

\`\`\`json
{
  "received": true
}
\`\`\`

---

## Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 400 | Bad Request (invalid parameters) |
| 402 | Payment Required |
| 404 | Resource Not Found |
| 429 | Too Many Requests (rate limit exceeded) |
| 500 | Internal Server Error |

---

## Rate Limits

| Endpoint | Limit | Window |
|----------|-------|--------|
| \`POST /api/generate\` | 5 requests | 1 hour |
| \`GET /api/status\` | 100 requests | 1 minute |
| \`POST /api/upgrade-images\` | 3 requests | 1 hour |

Rate limit headers are included in responses:

\`\`\`
X-RateLimit-Limit: 5
X-RateLimit-Remaining: 3
X-RateLimit-Reset: 1678901234
\`\`\`

---

## Error Codes

| Code | Description |
|------|-------------|
| \`INVALID_CATEGORY\` | Business category must be one of the supported types |
| \`INVALID_HERO_LAYOUT\` | Hero layout must be one of: fullBleed, fullWidth, split, minimal |
| \`INVALID_FONT_PROFILE\` | Font profile must be one of: modern, classic, playful, elegant |
| \`MISSING_REQUIRED_FIELD\` | Required field is missing (name, description, category) |
| \`DESCRIPTION_TOO_SHORT\` | Business description must be at least 20 characters |
| \`JOB_NOT_FOUND\` | No generation job found with the provided ID |
| \`JOB_FAILED\` | Theme generation failed (check job logs for details) |
| \`GENERATION_TIMEOUT\` | AI content generation exceeded maximum time (600s) |
| \`PAYMENT_REQUIRED\` | Payment required to access premium features |
| \`RATE_LIMIT_EXCEEDED\` | Too many requests (see rate limits above) |

---

## Example: Complete Generation Flow

### Step 1: Start Generation

\`\`\`bash
curl -X POST https://presspilotapp.com/api/generate \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "Luigi Pizza",
    "description": "Family-owned pizzeria serving authentic Neapolitan-style pizza",
    "category": "restaurant",
    "heroLayout": "fullBleed",
    "fontProfile": "modern"
  }'
\`\`\`

**Response:**

\`\`\`json
{
  "success": true,
  "jobId": "abc123xyz789",
  "status": "pending"
}
\`\`\`

### Step 2: Poll Status

\`\`\`bash
curl https://presspilotapp.com/api/status?id=abc123xyz789
\`\`\`

**Response (In Progress):**

\`\`\`json
{
  "status": "processing",
  "progress": 65,
  "message": "Assembling theme files..."
}
\`\`\`

**Response (Completed):**

\`\`\`json
{
  "status": "completed",
  "themeUrl": "https://supabase.co/storage/v1/object/signed/themes/abc123.zip",
  "images_upgraded": false
}
\`\`\`

### Step 3: Download Theme

\`\`\`bash
curl -O "https://supabase.co/storage/v1/object/signed/themes/abc123.zip"
\`\`\`

---

## Support

For API support, please contact:

- **Email:** support@presspilotapp.com
- **Docs:** https://docs.presspilotapp.com
- **GitHub Issues:** https://github.com/Odjango/PressPilot-OS/issues

---

## Changelog

### 1.0.0 (2026-03-08)

- Initial API release
- Theme generation endpoint
- Status polling endpoint
- Image upgrade endpoint
- LemonSqueezy webhook integration
