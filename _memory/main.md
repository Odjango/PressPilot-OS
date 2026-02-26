# PressPilot OS — Master Roadmap & Project Memory

Last updated: 2026-02-23

---

## Current Repo State
- Branch: `main`
- Latest commit: `ccc01be` (2026-02-21) — `fix: remove accidental onecontext-ai dependency breaking frontend build`
- Session work (2026-02-23, not yet committed): Block Config Validation system — see "Block Config Validation" section below

## Tech Stack
- Frontend: Next.js 16 (App Router) + React 19 + TypeScript
- Styling/UI: Tailwind CSS 4, Framer Motion, Lucide React
- Generator engine: Node.js + TypeScript (`bin/generate.ts`, `src/generator/`)
- WordPress tooling: `@wordpress/blocks`, `@wordpress/block-library`, block serialization parser
- Image/theme packaging: Jimp, ColorThief, Archiver, AdmZip, JSZip
- Backend/infra: Laravel 12 + Horizon + Redis + Supabase storage
- Testing: Playwright (`tests/visual`, `tests/wordpress`) + unit tests in `tests/unit`
- Deployment: Docker/Coolify on DigitalOcean (8GB / 4 vCPU / $48 mo)

## Runtime Architecture
- Studio UI → data transform → Laravel job queue → Horizon worker
- Horizon worker invokes Node generator via subprocess (`npx tsx /app/generator/bin/generate.ts`)
- Generator output (theme ZIP + preview artifacts) uploads to Supabase storage
- User receives signed URL for download

---

## Milestone Status

| Milestone | Status |
|-----------|--------|
| M0 — Laravel backend migration | Complete |
| M1 — Production deployment | Complete |
| M2+ — Quality/polish, broader cutover | In progress |

## Generator 2.0
- Design token system: complete
- Recipe system: complete
- Multi-brand support (`modern`, `playful`, `bold`, `minimal`): complete
- Security hardening + malicious-input tests: added
- Slot system for content injection: complete and verified (see Architecture Note below)
- Hard-gate and editor-recovery fixes: complete (P1/P2/P3 all resolved and verified)

## Block Config Validation (2026-02-23)

Two new validation checkpoints ensure every block has a **complete configuration** before the ZIP ships.

### New Files
| File | Purpose |
|------|---------|
| `src/generator/validators/blocks/BlockAttributeSchema.ts` | Required/recommended attribute spec per block type |
| `src/generator/validators/BlockConfigValidator.ts` | Static validator: parses block JSON, checks completeness |

### Blocks Covered
| Block | Required Attrs | Notes |
|-------|---------------|-------|
| `core/cover` | `dimRatio` | Missing → wrong overlay class → "Attempt Recovery" |
| `core/template-part` | `slug` | Missing → WP can't find the part |
| `core/social-link` | `service`, `url` | `service` must be a valid provider name |
| `core/query` | `queryId`, `query` | Both required — JS error without them |
| `core/heading` | `level` | Required for semantic correctness |
| `core/embed` | `url` | Without URL it renders nothing |

### Two Checkpoints
1. **Pre-file-write** (`PatternInjector.validateAndWrite()`) — logs CRITICAL/ERROR/WARN before each `.html` write; does NOT block the write (for early diagnosis)
2. **Pre-ZIP gate** (`bin/generate.ts` Step 2C) — scans ALL `.html` files in themeDir; throws error + exits(1) if critical issues found — **ZIP is never created** for a broken theme

### Content Manifest
After ZIP is created, `bin/generate.ts` writes `{slug}-manifest.json` alongside the ZIP:
```json
{ "generated_at": "ISO", "theme": "name", "slots": { "HERO_TITLE": "value", ... } }
```
Documents what business data drove each dynamic block. Enables future re-spin without full re-generation.

### Architecture: `src/generator/index.ts` now returns `slots`
Return value now includes `slots: contentJson.slots` so the manifest writer in `bin/generate.ts` can access the full slot map.

---

## Architecture Note: `{{Slot}}` System

**The `{{...}}` tokens in section files are an INTENTIONAL slot system, NOT bugs.**

Resolution pipeline (5 layers, in order):
1. `ContentBuilder.ts` — creates 100+ named slots from user data
2. Generic field mapping — any user data key auto-maps to `{{key}}`
3. `PatternInjector.applySlotReplacements()` — global find-replace across all content
4. `replaceRemainingPlaceholders()` — safety-net fallback with smart defaults
5. `ThemeValidator` — fails the build if any `{{...}}` survives (never happens)

**DO NOT convert `{{slot}}` tokens to inline `getText()` calls** unless there is a specific block-markup reason. The slot system resolves them before output. Codex converted the 4 testimonial files to inline resolution (Feb 21) — this works but is a different pattern than the rest of the codebase. Not harmful, but not necessary to replicate across other section files.

## Vertical Status

| Vertical | Testimonials | Slot System | Block Markup | WP Smoke Test | Overall |
|----------|-------------|-------------|-------------|--------------|---------|
| Restaurant / Cafe | FIXED | Working | Verified | PASSED | **Production-ready** |
| SaaS | FIXED (Codex) | Working | Verified | PASSED | **Production-ready** |
| Portfolio | FIXED (Codex) | Working | Verified | PASSED | **Production-ready** |
| Ecommerce | FIXED (Codex) | Working | Verified | PASSED | **Production-ready** |
| Local Service | FIXED (Codex) | Working | Verified | PASSED | **Production-ready** |

> **All 5 verticals passed WP smoke tests (Feb 21, Codex run).** Zero "Attempt Recovery" errors in Site Editor across all verticals. Test suite: `theme-activation.spec.ts` (expanded from 3 to 5 verticals).
>
> **Note:** Earlier analysis (Feb 21, AM) incorrectly flagged 94 `{{...}}` placeholders across 26 section files as "dangerous." Deep pipeline investigation confirmed these are intentional slot tokens resolved by `ContentBuilder` + `PatternInjector` before output. The real P2 risk was always block markup validity (wrong inline styles, missing layout classes, duplicate dimensions), not placeholder leakage.

---

## Known Issues (Verified 2026-02-21)

### P1 — Hero preview captures wrong section
- **Status: VERIFIED RESOLVED (Feb 21)**
- Fix: Commit `6b35765` (Feb 19) added `.pp-hero-preview` marker class to all 4 hero variants
- Playwright selector in `src/preview/HeroPreviewRunner.ts` now prioritizes `.pp-hero-preview` first
- **Verification (Codex, Feb 21):** `test-hero-previews.ts --industry=restaurant` ran all 4 layouts (fullBleed, fullWidth, split, minimal). All captured successfully using `.pp-hero-preview` selector. Screenshots at `public/tmp/previews/mlx026o6-xhqx46/`
- `docs/KNOWN_ISSUES.md` is stale — should be updated to reflect resolution

### P2 — Site Editor "Attempt Recovery" on testimonials
- **Status: FULLY RESOLVED AND VERIFIED (Feb 21)**
- Root cause: Block markup issues in testimonial sections — wrong inline styles, missing layout classes, duplicate width/height dimensions. NOT placeholder leakage.
- Universal `social-proof.ts`: FIXED via 6 commits (Feb 19–21). Additional fix by Codex during smoke run: removed residual raw `48px` inline/style JSON from avatar block (TokenValidator hard gate).
- Industry-specific testimonials: FIXED by Codex (Feb 21) using inline `getText()` + `sanitizeForPHP()` pattern
- **Verification (Codex, Feb 21):** All 5 verticals passed WP smoke test — zero "Attempt Recovery" errors in Site Editor. Block markup is valid across all sections.

### P3 — Apostrophe encoding (`&#39;`)
- **Status: FULLY RESOLVED**
- Fix: Commit `300992c` (Feb 20) removed apostrophe HTML-entity encoding from `src/generator/utils/sanitize.ts`
- Root cause: Double encoding (`'` → `&#39;` → `&amp;#39;`) through sanitize + PHP escaping stages
- Tests validate: `tests/unit/data-flow.test.ts` covers `O'Reilly's Pub & Grill`
- PHP escaping via `PhpEscaper.ts` remains the single source of quote safety

### P4 — Header embedded inside fullBleed hero Cover block
- **Status: FULLY RESOLVED AND VERIFIED (Feb 21)**
- **Root cause:** For `heroLayout === 'fullBleed'`, `PatternInjector.ts:444` excluded the header template part and instead `getFullBleedHero()` embedded an inline transparent header inside the Cover block's `inner-container`. This caused:
  1. `position: sticky` CSS had no effect (sticky doesn't work inside Cover inner container)
  2. Header was visually part of the hero, not at the page top
  3. Two divergent header code paths (solid vs transparent) created maintenance burden
- **Architecture decision:** Option A — Header is ALWAYS a separate template part above the hero, never nested inside Cover. Backed by `WORDPRESS_FSE_REFERENCE.md` Section 4 and Perplexity research.
- **Spec:** `output/HEADER_SEPARATION_SPEC.md` (precise line numbers, 3 files)
- **Codex implementation (Feb 21):**
  - `hero-variants.ts` — removed `getInlineTransparentHeader` import, simplified `getFullBleedHero()` to single `content` param, updated `getHeroByLayout()` calls
  - `universal-header.ts` — deleted `getInlineTransparentHeader()` function (lines 63-108), kept `getUniversalHeaderContent()` (lines 14-61)
  - `PatternInjector.ts` — removed fullBleed conditional, header template part now always included
- **Verification:** `npx tsc --noEmit` passed, all 5 verticals passed WP smoke test (`theme-activation.spec.ts`)

### P5 — Generation stall at "Building Your Assets" (Step 5 DELIVER)
- **Status: UNDIAGNOSED — needs Laravel/Horizon logs**
- **Observed (Feb 21):** E2E test via Studio UI — Steps 1-4 completed (including hero preview), but Step 5 (DELIVER) stalled indefinitely with "Building Your Assets" spinner
- **Console errors:** 404s on RSC prefetch for marketing pages (e.g., `/features`, `/pricing`) — these are unrelated Next.js preload failures, not generation errors
- **Key issue:** Laravel log not found at expected path (`/app/storage/logs/laravel.log` returned "No such file or directory" in container). Need to locate actual log path to diagnose.
- **Next steps:** 1) Find Laravel log location in Docker container, 2) Check Horizon dashboard for failed/pending jobs, 3) Check Supabase storage for upload errors

---

## Deployment: Laravel Backend Connectivity

**Status: RESOLVED (Feb 21) — Docker DNS working, IP landmine defused**

### Production value
- `BACKEND_URL=http://laravel-app:8080` (Docker Compose service name, stable across redeploys)

### Coolify DNS Discovery (live-tested Feb 21)
- Coolify v4.0.0-beta.460 **ignores** `container_name` from docker-compose
- Docker Compose **service names** resolve via the shared `coolify` external network
- Cross-app DNS **confirmed working**: `laravel-app` resolves from the frontend container (different Coolify app)
- Same pattern as Redis: `REDIS_HOST=pp-redis`

### Coolify v4 DNS rules (for future reference)
- `container_name` from docker-compose → **IGNORED** by Coolify
- Docker Compose service name → **RESOLVES** (both within same app and cross-app via shared network)
- Coolify-assigned container name (with random suffix) → does NOT resolve as DNS
- `curl`/`wget` not available in Node/Alpine frontend image — use `node -e` for connectivity tests

---

## Recent Fix Cycle (Feb 19–21, 2026)

| Commit | Fix |
|--------|-----|
| `6b35765` | P1: Added `pp-hero-preview` marker class for accurate hero capture |
| `300992c` | P2+P3: Resolved testimonials pattern conflict + apostrophe encoding |
| `34e8ea3` | P2: Added `is-layout-constrained` to testimonial card wrapper |
| `8938e6d` | P2: Moved testimonial card styles from `wp:column` to nested `wp:group` |
| `71fdf8d` | P2: Added WordPress layout classes to testimonial inner groups |
| `38a1133` | P2: Testimonials block validation and hero layout normalization |
| `2518de9` | P2: Removed duplicate image dimensions, added heroLayout bypass mapping |
| `ce24dd4` | P2+P1b: Testimonials validation + true fullbleed architecture |
| `df2e45d` | Header: Replaced raw `15px` with spacing token |
| `be5d3c0` | Hero: Only apply heroLayout to home page |
| `6e6038f` | P2: Consistent 48px avatar sizes in testimonials |

---

## Planned Work (Priority Order)

### Completed (Feb 21)
- ~~Verify P1~~ — all 4 hero layouts verified, `.pp-hero-preview` selector working
- ~~WP smoke test all verticals~~ — 5/5 passed, zero recovery errors
- ~~Verify Codex testimonial changes~~ — included in smoke test pass

### Infrastructure
- ~~Stabilize Laravel internal IP~~ — Docker DNS pattern deployed and verified (Feb 21). `BACKEND_URL=http://laravel-app:8080`
1. Update `docs/KNOWN_ISSUES.md` to reflect P1/P2/P3 all resolved

### Quality (Active)
2. ~~**P4: Verify header separation fix**~~ — Codex implemented, `tsc` + all 5 verticals WP smoke test passed (Feb 21)
3. **P5: Diagnose generation stall** — Find Laravel logs in Docker container, check Horizon dashboard, identify why DELIVER step hangs
4. ~~**Block Config Validation**~~ — BlockConfigValidator + pre-file-write hook + pre-ZIP gate implemented (Feb 23)

### Features
4. Generate 52 theme combinations for Magazine Gallery
5. Build Magazine Gallery UI (visual theme browser)
6. Dark Mode toggle for generated themes
7. Extra Large header font size option

---

## Architecture Note: Header Template Part

**The header must ALWAYS be a separate template part, NEVER nested inside a Cover block.**

- WP FSE best practice: header is `<!-- wp:template-part {"slug":"header"} /-->` at the top of every template
- `position: sticky` only works when the header is a top-level element, not inside a Cover's inner container
- Reference: `WORDPRESS_FSE_REFERENCE.md` Section 4 (Header Consistency & Fullbleed vs Fullwidth)
- For fullBleed heroes: hero Cover block sits below the header template part. The "overlay" effect comes from the Cover's own full-viewport height, not from embedding the header inside it.

## Lessons Learned (Feb 21 audit)
- `{{...}}` tokens in section files are slots, not bugs — always trace the full pipeline before flagging
- The real "Attempt Recovery" risk is block markup validity (styles, classes, attributes), not content injection
- `docs/KNOWN_ISSUES.md` can go stale — always verify against code before trusting docs
- Two content resolution patterns now coexist: slot system (majority) and inline `getText()` (4 testimonial files). Both work, but be aware of the inconsistency.
- Header must never be nested inside hero Cover block — breaks sticky positioning and creates two divergent code paths

## Lessons Learned (Feb 23 — Block Config Validation)
- `core/cover` without `dimRatio` is the single most common silent crash — it renders but the dim class is wrong
- `core/social-link` without `service` produces a broken icon with no accessible fallback
- `core/template-part` without `slug` causes WP to silently skip the part — header/footer disappears
- Two-checkpoint strategy (pre-write log + pre-ZIP gate) gives early visibility without blocking iterative development
- The `validateAndWrite()` helper pattern is safe to apply universally — the `.html` guard means non-HTML writes are unaffected

---

## Working Commands
- Type check: `npx tsc --noEmit`
- Generator CLI: `npx tsx bin/generate.ts`
- Security tests: `npm run security:test`
- Build: `npm run build`
- WordPress smoke: `npm run test:wp:smoke`

## Key Directories
- Generator core: `src/generator/`
- Patterns/sections: `src/generator/patterns/sections/`
- Recipes: `src/generator/recipes/`
- Preview system: `src/preview/`
- Backend (Laravel): `backend/`
- Specs/rules: `specs/001-generator-2-baseline/`
- Security tests: `tests/security/`
- Validators: `src/generator/validators/` — BlockConfigValidator (NEW), BlockValidator, TokenValidator, StructureValidator
- Content pipeline: `src/generator/engine/ContentBuilder.ts`, `PatternInjector.ts`

## Reference Documents
- `WORDPRESS_FSE_REFERENCE.md` — comprehensive WP FSE knowledge base (24 sections), covers header best practices, fullBleed vs fullWidth, block grammar, theme.json schema
- `output/HEADER_SEPARATION_SPEC.md` — Codex spec for P4 header fix (3 files, precise line numbers)
