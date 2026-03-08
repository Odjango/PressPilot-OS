# PressPilot API Documentation

> **Base URL:** `https://presspilotapp.com/api`
> **Version:** 1.0
> **Last Updated:** 2026-03-08

## Overview

The PressPilot API enables programmatic generation of WordPress FSE themes. All endpoints return JSON responses.

---

## Authentication

Currently, the API is open for public use. Rate limiting applies (see below).

---

## Endpoints

### 1. Generate Theme

Start a new theme generation job.

```
POST /generate
Content-Type: application/json
```

#### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | Business name (1-100 chars) |
| `tagline` | string | No | Business tagline |
| `description` | string | No | Business description (used for content generation) |
| `category` | string | Yes | Business vertical: `restaurant`, `ecommerce`, `saas`, `portfolio`, `local_service` |
| `heroLayout` | string | No | Hero style: `fullBleed`, `split`, `centered`. Default: `fullBleed` |
| `colorPrimary` | string | No | Primary brand color (hex, e.g., `#1e3a5f`) |
| `colorSecondary` | string | No | Secondary brand color (hex) |
| `fontProfile` | string | No | Typography preset: `modern`, `classic`, `bold`, `elegant`, `playful`. Default: `modern` |
| `logo` | string | No | Logo image URL or base64 data URI |

#### Example Request

```json
{
  "name": "Luigi Pizza",
  "tagline": "Authentic Italian cuisine since 1985",
  "description": "Family-owned pizzeria in downtown Brooklyn serving wood-fired pizza and homemade pasta.",
  "category": "restaurant",
  "heroLayout": "fullBleed",
  "colorPrimary": "#8B0000",
  "colorSecondary": "#FFD700",
  "fontProfile": "classic"
}
```

#### Response

```json
{
  "success": true,
  "jobId": "job_abc123xyz",
  "message": "Theme generation started"
}
```

#### Status Codes

| Code | Description |
|------|-------------|
| 200 | Job created successfully |
| 400 | Invalid request body |
| 429 | Rate limit exceeded |
| 500 | Server error |

---

### 2. Check Generation Status

Poll for job completion status.

```
GET /status?id={jobId}
```

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | The job ID returned from `/generate` |

#### Response (In Progress)

```json
{
  "status": "processing",
  "progress": 45,
  "stage": "Generating page content..."
}
```

#### Response (Completed)

```json
{
  "status": "completed",
  "themeUrl": "https://presspilotapp.com/downloads/luigi-pizza.zip",
  "staticUrl": "https://presspilotapp.com/preview/luigi-pizza",
  "images_upgraded": false
}
```

#### Response (Failed)

```json
{
  "status": "failed",
  "error": "Content generation failed: OpenAI API timeout"
}
```

#### Status Values

| Status | Description |
|--------|-------------|
| `queued` | Job is waiting in queue |
| `processing` | Generation in progress |
| `completed` | Theme ready for download |
| `failed` | Generation failed (see `error` field) |

---

### 3. Upgrade Images

Trigger DALL-E image generation to replace stock photos with custom AI images.

```
POST /upgrade-images
Content-Type: application/json
```

#### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `jobId` | string | Yes | The job ID from a completed generation |

#### Example Request

```json
{
  "jobId": "job_abc123xyz"
}
```

#### Response

```json
{
  "success": true,
  "message": "Image upgrade started",
  "estimatedTime": 60
}
```

#### Notes

- Image upgrade is a paid feature
- Takes 30-90 seconds to complete
- Poll `/status` to check when `images_upgraded` becomes `true`

---

### 4. Payment Webhook (Internal)

LemonSqueezy payment webhook receiver. Not for public use.

```
POST /webhooks/lemonsqueezy
```

---

## Rate Limits

| Endpoint | Limit |
|----------|-------|
| `/generate` | 10 requests per hour per IP |
| `/status` | 60 requests per minute per IP |
| `/upgrade-images` | 5 requests per hour per IP |

Rate limit headers are included in responses:

```
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 7
X-RateLimit-Reset: 1709913600
```

---

## Error Responses

All errors follow this format:

```json
{
  "success": false,
  "error": "Human-readable error message",
  "code": "ERROR_CODE"
}
```

### Common Error Codes

| Code | Description |
|------|-------------|
| `INVALID_REQUEST` | Missing or invalid request parameters |
| `JOB_NOT_FOUND` | The specified job ID does not exist |
| `RATE_LIMIT_EXCEEDED` | Too many requests |
| `GENERATION_FAILED` | Theme generation encountered an error |
| `PAYMENT_REQUIRED` | Feature requires payment |

---

## Webhooks (Coming Soon)

Subscribe to receive webhook notifications when theme generation completes.

---

## Support

- **Documentation:** https://presspilotapp.com/docs
- **Email:** support@presspilotapp.com
- **Status:** https://status.presspilotapp.com
