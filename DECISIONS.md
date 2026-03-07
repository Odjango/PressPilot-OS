# PressPilot — DECISIONS.md
> This file contains LOCKED decisions. Do not reopen, re-debate, or suggest alternatives to anything marked FINAL.
> Last updated: 2026-03-05

---

## ARCHITECTURE — FINAL

**Decision: Pattern Assembly Architecture (NOT raw block generation)**
- Status: FINAL. DO NOT SUGGEST ALTERNATIVES.
- AI outputs structured JSON content only. AI NEVER generates WordPress block markup directly.
- A deterministic Laravel engine (SSWG) selects pre-validated block patterns and injects content via `{{TOKEN}}` replacement.
- This mirrors how ZipWP and QuickWP operate in production.
- Reason: Raw AI-generated block markup caused persistent "Attempt Recovery" errors in the WordPress Site Editor. This approach was abandoned after months of debugging.

**Decision: Laravel SSWG Pipeline replaces Node.js Generator**
- Status: FINAL. DO NOT SUGGEST REVERTING TO NODE.JS.
- The old Node.js/TypeScript generator in `src/generator/` is LEGACY and deprecated.
- Laravel services (AIPlanner, PatternSelector, TokenInjector, ThemeAssembler) handle all generation.
- The pipeline is NOT a WordPress plugin — it runs entirely inside Laravel/Horizon.
- Reason: Architectural shift to pattern assembly required a server-side deterministic solution. PHP/Laravel was chosen because the backend already runs Laravel.
- Changed: 2026-03-04 — Updated from "PHP Pattern Assembler (WordPress plugin)" to "Laravel SSWG Pipeline." The generator was never a WordPress plugin; it is a set of Laravel services running in Horizon.

**Decision: Pre-validated "Proven Cores" as base themes**
- Status: FINAL.
- Only use themes from the `proven-cores/` vault (ollie, frost, tove, spectra-one, twentytwentyfour, blockbase).
- Primary core: Ollie (99 patterns, best token system, 7 color vars). Tove for restaurant, Frost for minimal.
- Never generate a theme from scratch or use unvalidated base themes.

---

## TECH STACK — FINAL

| Layer | Technology | Status | Notes |
|---|---|---|---|
| Frontend | Next.js 16 (App Router) + React 19 | FINAL | |
| Backend API | Laravel 12 + Horizon + Redis | FINAL | |
| Queue Worker | Horizon (separate container) | FINAL | |
| AI Model (content) | Anthropic Claude (claude-haiku-4-5) | FINAL | Changed from OpenAI — see Change Log |
| n8n | Email delivery ONLY (Brevo) | FINAL | Changed from "Workflow Orchestration" — see Change Log |
| Database | Supabase (PostgreSQL) | FINAL | |
| Object Storage | Supabase Storage (S3-compatible) | FINAL | Theme ZIPs + signed download URLs |
| Cache | Redis 7.4 | FINAL | |
| Deployment | Coolify on DigitalOcean VPS | FINAL | 8GB / 4 vCPU / $48 mo |
| Theme Generator | Laravel SSWG services | FINAL | Changed from "WordPress plugin" — see Change Log |
| Image Source (Standard) | AI-generated or placehold.co fallback | FINAL | Changed from "Unsplash API" — see Change Log |
| Image Source (Agency) | Unsplash API | FINAL | Agency/bulk tier only |
| Error Monitoring | Sentry | FINAL | |

**DO NOT suggest:** Node.js for generation, Python backend, classic PHP themes, non-FSE themes, or self-hosted AI models.

---

## PRODUCT CONSTRAINTS — FINAL

- Only free and open-source WordPress theme dependencies. FINAL.
- FSE-compliant themes exclusively. Classic PHP themes are REJECTED. FINAL.
- PressPilot-branded footer replaces all original theme footers. FINAL.
- Brand colors extracted from uploaded logo and injected into theme.json. FINAL.
- User receives: WordPress Theme ZIP with signed download URL. FINAL.
  - Changed: 2026-03-05 — Removed "Static HTML site" as second output. The SSWG pipeline produces only the WordPress theme ZIP. Static HTML generation was part of the old Node.js pipeline and is deprecated.

---

## THEME OUTPUT — FINAL

**Decision: Style Variations**
- Original Style ships with theme. High Contrast and Inverted are backlog items.
- Changed: 2026-03-05 — Reduced from "3 mandatory variations" to "1 + backlog." MVP focus is on one bulletproof pipeline first, per SSWG Protocol.

**Decision: Business Verticals supported**
- Restaurant, SaaS, Portfolio, Local Service, Ecommerce
- FINAL for MVP. Do not add new verticals without explicit approval.

**Decision: Brand Modes**
- DROPPED for SSWG MVP. Will add post-launch using Ollie's style variation system.
- Changed: 2026-03-04 — Was "Modern, Playful, Bold, Minimal — FINAL for MVP." SSWG Protocol explicitly drops brand modes for MVP to focus on one bulletproof pipeline. See `agent-os/sswg/PROTOCOL.md` Resolved Decisions table.

---

## INFRASTRUCTURE — FINAL

**Coolify bind mounts are NOT supported**
- Use COPY commands in Dockerfiles instead of bind mounts. FINAL.
- Reason: Coolify's container orchestration is incompatible with bind mounts.

**Docker path resolution for Laravel**
- `base_path('../')` in Laravel resolves to `/app/../` = `/` in Docker.
- Pattern-library and proven-cores must be COPYd to root (`/pattern-library/`, `/proven-cores/`) as siblings of `/app/`.
- Added: 2026-03-04 — Discovered during Phase 2.5 pipeline activation debugging.

**Horizon container needs ALL env vars independently**
- Env vars set on `laravel-app` do NOT propagate to `laravel-horizon` (separate container).
- Both containers must have identical env var definitions in docker-compose.
- Added: 2026-03-04 — Discovered during Phase 2.5 pipeline activation debugging.

**Redis requires ACL authentication**
- Redis in Coolify environment requires explicit ACL config. Do not assume unauthenticated Redis access.

**n8n role is EMAIL ONLY**
- n8n sends the welcome email via Brevo webhook after generation completes.
- n8n is NOT in the critical generation path. It receives a webhook AFTER the theme is uploaded.
- Changed: 2026-03-04 — Was listed as "Workflow Orchestration." SSWG Protocol explicitly limits n8n to email delivery only. All generation logic lives in Laravel.

---

## KNOWN DEAD ENDS — DO NOT REVISIT

- Raw AI block markup generation → causes "Attempt Recovery" errors. ABANDONED.
- Node.js subprocess for theme generation → replaced by Laravel SSWG services. ABANDONED.
- n8n for generation orchestration → n8n is email-only now. All generation logic is in Laravel. ABANDONED.
- n8n calling Next.js endpoint instead of WordPress factory plugin → was a month-long bug. FIXED.
- Exporting theme as ZIP of base Ollie theme without generated content → content lived in WP database, not serialized into patterns. FIXED.
- wp:column blocks with invalid attributes → fixed. Never add non-core attributes to wp:column.
- Cover blocks with improperly structured inner blocks → fixed. Follow proven pattern structure exactly.
- OpenAI for content generation → switched to Anthropic Claude for better JSON output quality. ABANDONED.
- `@wp-playground/node` package → does not exist. Use `@wp-playground/cli` instead. ABANDONED.
- `@wp-playground/client` for browser-based live preview → renders themes without theme.json styling, Google Fonts, or images. Result is unstyled bare-bones markup far worse than HeroPreviewRunner screenshot preview. ABANDONED (2026-03-05).
- WordPress Playground screenshot automation (base64 ZIP in blueprint URL) → Blueprint URLs exceed browser URL length limits when embedding full theme ZIPs. All screenshots show "Blueprint could not be loaded" error. ABANDONED (2026-03-06).
- Agent-prompt files at repo root → caused confusion between old Generator Fix Plan phases and SSWG phases. Archived to `Project Extras/archived-agent-prompts/`. RESOLVED.

---

## CHANGE LOG

> Format: Date | What Changed | Old Value → New Value | Reason

| Date | Decision Changed | Old → New | Reason |
|------|-----------------|-----------|--------|
| 2026-03-05 | AI Model | OpenAI via n8n → Anthropic Claude (claude-haiku-4-5) | Claude produces better structured JSON for token generation. Direct API call from Laravel, not routed through n8n. |
| 2026-03-05 | n8n Role | "Workflow Orchestration" → "Email delivery ONLY (Brevo)" | SSWG Protocol decision: all generation logic in Laravel. n8n only fires post-generation welcome email via webhook. |
| 2026-03-05 | Theme Generator | "PHP Pattern Assembler (WordPress plugin)" → "Laravel SSWG services" | Generator was never a WordPress plugin. It is 6 Laravel services (AIPlanner, PatternSelector, TokenInjector, ImageHandler, ThemeAssembler, PlaygroundValidator) running in Horizon. |
| 2026-03-05 | Image Source (Standard) | "Unsplash API" → "AI-generated or placehold.co fallback" | Standard tier uses AI images (future) with placehold.co fallback. Unsplash reserved for Agency tier only. |
| 2026-03-05 | User Output | "WordPress Theme ZIP + Static HTML site" → "WordPress Theme ZIP only" | Static HTML generation was part of old Node.js pipeline. SSWG produces only WordPress theme ZIP with signed download URL. |
| 2026-03-05 | Style Variations | "3 mandatory (Original, High Contrast, Inverted)" → "1 + backlog" | SSWG MVP focuses on one bulletproof pipeline. Variations are post-launch using Ollie's style variation system. |
| 2026-03-05 | Brand Modes | "Modern, Playful, Bold, Minimal — FINAL for MVP" → "DROPPED for MVP" | SSWG Protocol explicitly drops brand modes for MVP. Will add post-launch. |
| 2026-03-05 | Agent Prompt Files | At repo root → Archived to `Project Extras/archived-agent-prompts/` | Old Generator Fix Plan phase files and completed SSWG phase prompts were confusing agents. Canonical SSWG specs live in `agent-os/sswg/PHASE-{0-4}.md`. |
| 2026-03-04 | Docker Path Fix | Pattern files inside `/app/` → COPYd to root `/pattern-library/`, `/proven-cores/` | `base_path('../')` resolves to `/` in Docker. Files must be root siblings of `/app/`. |
| 2026-03-04 | Horizon Env Vars | Assumed shared with laravel-app → Explicit per-container | Separate Docker containers do not share env vars. Both need independent definitions. |

---

## SESSION LOG

| Date | What was decided or fixed | Result |
|------|--------------------------|--------|
| 2026-03-06 | Multi-vertical pipeline test: 5/5 generate mechanically but OUTPUT QUALITY FAILS owner review. 6 issues found (upgraded from initial 2). Phase 3 BLOCKED. | Attempt Recovery in Site Editor, broken hero images, empty inner pages, Ollie footer (not PressPilot), extensive Ollie content leakage, site name mismatch. Root cause: tokenization coverage insufficient — 81 tokens cover headlines only. Generator logic needs fundamental work before Phase 3 can proceed. |
| 2026-03-05b | Phase 3: Task 3.1 confirmed done, Task 3.2 (Playground Preview) attempted & reverted | Task 3.1 already complete from M1. Playground strips styling — added to KNOWN DEAD ENDS. HeroPreviewRunner is the correct preview approach. Next: Task 3.3 or 3.4. |
| 2026-03-05 | SSWG Phase 2.5 Pipeline Activation complete | First successful end-to-end theme generation (Luigi Pizza, 17s, 1.12 MB ZIP). 6 bugs fixed. |
| 2026-03-05 | DECISIONS.md audit and correction | 7 outdated entries corrected. Change log added. Agent prompt files archived. |
| 2026-03-05 | PROJECT_ROADMAP.md updated to reflect SSWG as primary work stream | Old Gen 2.0 phases marked historical. SSWG Phase 3 (Frontend Integration) is NEXT. |
| 2026-03-04 | SSWG Phase 2 deployed to production | All 6 assembly engine services running in Coolify. Horizon healthy. |
| 2026-03-03 | P5 generation stall DEPRIORITIZED | Decision: SSWG replaces entire old pipeline. P5 fix no longer needed. |
| 2026-03-03 | Hero layout rework (fullBleed nav overlay) | Intentionally reversed Feb 21 header separation. Visual quality > sticky positioning. |
