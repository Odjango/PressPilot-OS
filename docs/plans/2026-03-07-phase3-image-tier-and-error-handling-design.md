# Phase 3 Design: Image Tier & Error Handling

> **Date:** 2026-03-07
> **Status:** Approved
> **Scope:** SSWG Phase 3 Tasks 3.3 (Image Tier Integration) + 3.4 (Error Handling & Retry Flow)
> **Prerequisite:** Phase 2.7 verified (5/5 verticals pass). All CodeRabbit findings resolved.

---

## Business Model

PressPilot uses one-time pricing, not subscriptions.

- **Single Theme ($29.99):** One WordPress FSE theme with AI-generated images via DALL-E. This is the default path for all users.
- **Agency Bundle ($149.99):** Six themes with Unsplash stock images. Purchased from the pricing page. Agencies replace images with their client's photos after download.

No free tier. Users can generate and preview for free. Payment is required to download.

---

## User Flow (End-to-End)

```
Homepage → "Create Your Theme Now" → Studio (no login required)

Step 1 (Context):       Business info, logo, brief            [anonymous]
Step 2 (Direction):     Hero layout selection                  [anonymous]
Step 3 (Refine):        Colors, fonts, headline, live preview  [anonymous]
Step 4 (Hero Preview):  DALL-E hero + layout carousel          [anonymous, ~$0.04-0.08 cost]
Step 5 (Download Gate): Sign up + pay $29.99 → download        [login + payment required]
```

Agency users purchase the Agency Bundle from `/pricing` first, then enter Studio with bundle credits active. Their flow skips DALL-E entirely — Unsplash images throughout.

---

## Task 3.3: Image Tier Architecture

### The Hybrid Approach

Every generation starts with Unsplash for speed. One DALL-E hero image is generated at Step 4 as the "prove-it" moment. The remaining images upgrade to DALL-E after payment.

### Pipeline by Step

**Steps 1–3 (Generation):**
All IMAGE_* tokens resolved via UnsplashProvider (existing behavior, no changes).

**Step 4 (Hero Preview):**
Before rendering the hero layout carousel, the backend generates one DALL-E image for IMAGE_HERO. The prompt is auto-composed from AIPlanner output: business name, category, color palette, style mood. This replaces the Unsplash hero in the preview. The user sees a unique, AI-generated hero section.

If DALL-E fails, the system silently falls back to the Unsplash hero. No error shown to the user.

The DALL-E hero cost on unpaid sessions (~$0.04-0.08 per user reaching Step 4) is customer acquisition cost.

**Step 5 (Payment Gate):**

*Individual path (default):*
1. User signs up and pays $29.99 via LemonSqueezy
2. Payment confirmed → `UpgradeThemeImagesJob` dispatched
3. Job downloads ZIP from Supabase, generates DALL-E images for remaining IMAGE_* tokens, patches ZIP, re-uploads
4. User sees: "Personalizing your theme images..." (~30-60s wait)
5. Download link appears with fully AI-imaged theme

*Agency path:*
1. User already purchased Agency Bundle from `/pricing`
2. Account has bundle credits
3. Direct download with Unsplash images, no upgrade job
4. Note shown: "Stock images included — replace with your client's photos in the Site Editor"

### Tier Determination

The `tier` is stored on the `Project` model:
- `individual` (default) — all users who enter Studio directly
- `agency` — users whose account has an active Agency Bundle purchase

The pipeline checks `project.tier` only at two points:
1. Step 4: whether to generate DALL-E hero (individual=yes, agency=no)
2. Step 5: whether to run UpgradeThemeImagesJob (individual=yes, agency=no)

### New Backend Components

| Component | Purpose |
|-----------|---------|
| `DalleProvider` | Implements `ImageProviderInterface`. Calls OpenAI Images API (DALL-E 3). |
| `DallePromptBuilder` | Composes image prompts from AIPlanner context (business name, category, colors, mood). |
| `UpgradeThemeImagesJob` | Downloads ZIP → generates DALL-E images for remaining tokens → patches ZIP → re-uploads to Supabase. |
| `OPENAI_API_KEY` env var | Added to Coolify for both laravel-app and laravel-horizon containers. |

### No Changes To

- `GenerateThemeJob` — always uses Unsplash. DALL-E is additive.
- `ImageHandler` — already supports primary + fallback provider pattern.
- `UnsplashProvider` / `PlaceholderProvider` — unchanged.

---

## Task 3.4: Error Handling & Retry Flow

### 3.4a: Status Polling Hardening

Current: polls every 3 seconds indefinitely with no timeout or feedback.

Proposed adaptive polling:

| Time Window | Interval | User Feedback |
|-------------|----------|---------------|
| 0–60s | 3 seconds | "Building your theme..." (standard spinner) |
| 60–90s | 3 seconds | (no change, normal variance) |
| 90–180s | 5 seconds | "Taking a bit longer than usual..." (reassurance) |
| 180–300s | 5 seconds | "Still working on your theme..." (progress indicator) |
| 300s+ | 5 seconds | "This is taking longer than expected." + Retry button |
| 600s (max) | — | Failure state. "Generation didn't complete." + Retry button |

Backend job timeout is 600s, so frontend gives it full room before declaring failure.

### 3.4b: Error States by Type

| Error | User Sees | Behavior |
|-------|-----------|----------|
| AI content generation fails (429/529) | Nothing — backend retries automatically (5 attempts with exponential backoff, already built) | Frontend keeps polling normally |
| AI generation exhausts all retries | "Content generation didn't complete. This is rare." | Inline error + "Try Again" button → calls `POST /api/regenerate` |
| Image download fails | Nothing — `PlaceholderProvider` fallback activates silently | Theme downloads with some placeholder images + note in footer |
| ZIP assembly fails | "Something went wrong during assembly." | Inline error + "Try Again" button |
| Supabase upload fails | "Download link couldn't be created." | Inline error + "Try Again" button |
| Network error during polling | "Connection lost. Checking again..." | Auto-retry polling with exponential backoff |
| Payment fails (LemonSqueezy) | "Payment didn't go through." | LemonSqueezy handles its own error UI + "Try Again" option |
| DALL-E hero fails (Step 4) | Nothing — falls back to Unsplash hero silently | User sees Unsplash hero in preview (still good quality) |
| DALL-E upgrade fails (Step 5) | "Custom image generation had an issue. Your theme is ready with stock photos." | Download with Unsplash images + "Retry AI Images" button |
| DALL-E partial failure | Same as above — only failed images fall back to Unsplash | Mixed result, still downloadable |
| OpenAI rate limit | Backend queues and retries with backoff | User sees "Personalizing images..." slightly longer |

### 3.4c: Retry Architecture

- "Try Again" at Step 5 calls `POST /api/regenerate` (already exists). Creates new job for same project. User re-enters polling loop without re-filling the form.
- "Retry AI Images" calls new `POST /api/upgrade-images` endpoint. Only re-runs the image upgrade job, no full regeneration.

### 3.4d: Error Display Strategy

- **Transient issues** (network hiccup, auto-retry): Toast notification, disappears after 5 seconds
- **Blocking issues** (generation failed, payment failed): Inline error with action button, persists until resolved
- **Success**: Toast + visual confirmation when download is ready

---

## Generation History

### What Gets Stored

The `generated_themes` table (already exists) stores metadata for every generation: job_id, file_path, status, created_at, expires_at. This metadata is permanent — kept forever at negligible cost.

### ZIP Retention

Theme ZIP files on Supabase expire after **7 days**. A scheduled cleanup job deletes expired files. During the 7-day window, users can re-download anytime.

After expiration, the history row shows the generation record (business name, date, category) but download is no longer available. Users can regenerate if needed.

### User Dashboard

Logged-in users see a list of their past generations under `/projects`:
- Business name, date, category, status
- "Download" button (if ZIP still available, within 7-day window)
- "Expired" badge (if past 7 days)
- "Regenerate" button (creates new generation from same project data)

---

## Agency Tier on Homepage

A brief mention of the Agency Bundle at the bottom of the homepage, before the footer CTA section. Something like: "Building for clients? Check out our Agency Bundle — 6 themes at a discount." Links to `/pricing`.

---

## Out of Scope (Post-Launch)

- Separate agency dashboard (`/studio/agency`)
- Unsplash image picker for agency users (manual image selection)
- AI image style customization (photorealistic vs illustration)
- White-label/rebrand options for agency themes
- Bulk generation queue for agency users
