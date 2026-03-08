# Session Continuation Hook — 2026-03-08

> Paste this at the start of a new session to restore full context.

---

## Project: PressPilot OS
**What it is:** A SaaS that generates production-ready WordPress FSE themes from business data (name, logo, tagline, description, category).

**Architecture:** Next.js frontend (Studio form) → Laravel backend (AI content generation + deterministic theme assembly) → WordPress Playground (validation) → Supabase (storage). Deployed via Coolify on VPS.

**Working Agreement:** Omar is the product owner — NOT a coder. Claude does ALL coding/debugging. Only escalate to Omar for: git push, Coolify UI clicks, env var changes. When Omar needs to act, give EXACT commands.

---

## Current State (as of 2026-03-08 ~2:00 AM)

### Latest Deploy: Commit `5314618` — DEPLOYED, AWAITING VERIFICATION TEST

Three bug fix rounds were deployed today. The latest commit (`5314618`) includes:

1. **Nav pollution fix** — Generated `functions.php` now deletes ALL existing WordPress posts/pages via `get_posts()` before creating PressPilot pages. Previous approach targeted "Hello world!" by title, but WordPress Playground uses "Hello from WordPress Playground!" instead.

2. **Word-boundary token truncation** — `AIPlanner::validateTokens()` now breaks at the last word boundary (space) instead of hard `mb_substr()` at maxLength. Prevents mid-word cuts like "smok", "thre", "kit". Has a 70% floor to avoid losing too much content.

3. **Logo architecture overhaul** — Complete redesign:
   - `ThemeAssembler::saveLogoAsset()` decodes base64 data URI (or downloads URL) and saves as `assets/logo.{ext}` in the theme directory
   - Generated `functions.php` sideloads the logo file into WP media library via `media_handle_sideload()` and sets it as `custom_logo` theme mod
   - Header and footer use `<!-- wp:site-logo {"width":40,"shouldSyncIcon":true} /-->` (self-closing block, no inner HTML) instead of `wp:image` with base64 data URI
   - This eliminates "Attempt Recovery" errors in the block editor caused by the massive base64 string breaking the block parser

### Files Modified (commit `5314618`)
- `backend/app/Services/ThemeAssembler.php` — saveLogoAsset(), wp:site-logo blocks, bulk WP content deletion
- `backend/app/Services/AIPlanner.php` — word-boundary truncation in validateTokens()

### Previous Commits Today
- `e6606c6` — logo data URI validation, targeted WP default deletion, page ordering, truncation logging
- `06493f1` — footer nav fix (wp:navigation), Attempt Recovery template fix, nested group wrapper
- `c65f96c` — 5 quality fixes (K-means colors, menu columns, content loader, logo, pattern slugs)

---

## What Needs Testing (FIRST PRIORITY)

Omar needs to generate a test theme (e.g., Luigi Pizza / restaurant vertical) with logo upload and verify:

1. **Navigation** — No "Hello from WordPress Playground!" in header nav or footer Quick Links. Only PressPilot pages: Home, About, Services, Contact, Menu.
2. **Content** — No mid-word truncation. Text should end at complete words.
3. **Logo** — Appears in header and footer on the frontend.
4. **Block Editor** — Open ANY template in Site Editor (especially Index) — NO "Attempt Recovery" errors on logo blocks.
5. **Page order** — Nav shows: Home → About → Services → Contact → Menu (in that order).

### If Tests Pass
- Set `APP_DEBUG=false` in Coolify env vars
- Move to next priority items (see below)

### If Tests Fail
- Check Horizon logs for: `ThemeAssembler: Logo saved as assets/`, `ThemeAssembler::buildHeader logo check`, `AIPlanner: Token truncated`
- If logo doesn't appear: the `media_handle_sideload` may be failing in Playground — check if `wp-admin/includes/media.php` is available
- If nav still polluted: the `get_posts()` call may need `'fields' => 'ids'` optimization or the init hook timing may be off

---

## Key Files Reference

| File | Purpose |
|------|---------|
| `backend/app/Services/ThemeAssembler.php` | Core theme assembly — builds all theme files, header, footer, functions.php |
| `backend/app/Services/AIPlanner.php` | AI content generation — prompts Claude, validates tokens, enforces schema |
| `backend/app/Services/PatternSelector.php` | Deterministic skeleton selection based on vertical recipes |
| `backend/app/Services/TokenInjector.php` | Injects AI tokens into skeleton patterns |
| `backend/app/Services/ImageHandler.php` | Unsplash image fetching |
| `backend/app/Jobs/GenerateThemeJob.php` | Pipeline orchestrator (7-step: plan → select → inject → images → assemble → validate → upload) |
| `backend/config/presspilot.php` | Config (AI model, max_tokens=4096, endpoints) |
| `pattern-library/token-schema.json` | Token definitions with maxLength constraints |
| `pattern-library/vertical-recipes.json` | Page layouts per vertical |
| `pattern-library/skeletons/` | HTML skeleton patterns |
| `_memory/main.md` | Master project memory |
| `docs/PROJECT_ROADMAP.md` | Development roadmap |

## Pipeline Data Flow (Logo)

```
Studio (LogoUploader.tsx)
  → FileReader.readAsDataURL → "data:image/png;base64,..."
  → POST /api/generate { input: { logoBase64: "data:..." } }
  → route.ts → proxyJsonToBackend
  → GenerationController.resolvePayload() → visualAssets.logo_file_url
  → DataTransformer → flat "logo" key
  → Project.data JSON column (Supabase)
  → GenerateThemeJob reads $projectData['logo']
  → ThemeAssembler.saveLogoAsset() → decodes base64 → saves assets/logo.png
  → functions.php → media_handle_sideload() → set_theme_mod('custom_logo')
  → wp:site-logo block in header.html + footer.html
```

---

## Remaining Backlog (Post-Verification)

| Priority | Item | Notes |
|----------|------|-------|
| HIGH | LemonSqueezy payment integration | Currently placeholder in payment gate UI |
| HIGH | User guides (install ZIP, Site Editor) | Needed for launch |
| HIGH | API documentation | `POST /api/generate` endpoint docs |
| MEDIUM | "Preview generation failed" in Studio UI | Hero preview feature was archived with old Node.js generator |
| MEDIUM | Multi-vertical smoke test | Only restaurant tested recently, need SaaS/Portfolio/Ecommerce/LocalService |
| MEDIUM | Performance: base64 logo in Project.data | Logo stored as full data URI in Supabase JSON — consider separate storage |
| LOW | APP_DEBUG=false | Set after verification |
| LOW | Brand mode support | Post-launch via Ollie style variations |
| LOW | WooCommerce patterns | Ecommerce vertical enhancement |

---

## Architecture Decisions (Key Ones for Context)

1. **wp:site-logo > wp:image for logos** — `wp:image` with base64 breaks the block editor parser. `wp:site-logo` is self-closing, no inner HTML to validate.
2. **Bulk WP content deletion > targeted title matching** — WordPress environments have different default content titles. Delete everything, then create fresh.
3. **File-based logo > inline base64** — Decode data URI at assembly time, save as real image file in theme ZIP, sideload into media library on first theme activation.
4. **Word-boundary truncation** — `mb_substr` at maxLength cuts mid-word. Find last space before boundary, break there. 70% floor prevents excessive loss.
5. **SSWG pattern-assembly architecture** — AI generates content JSON (tokens), deterministic engine selects pre-validated skeleton patterns, injects tokens, assembles theme. No AI-generated block markup.
