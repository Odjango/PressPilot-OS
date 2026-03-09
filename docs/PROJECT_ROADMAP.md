# PressPilot OS — Development Roadmap

> **Last updated: 2026-03-09 (Session F)** — Phase A2 smoke tests COMPLETE (all 5 verticals passed). Site_type defaults fix deployed. Production-ready for A3 (disable debug) and launch. B1 LemonSqueezy on hold (bank account pending) but can launch with free downloads first.
> **Canonical SSWG specs:** `agent-os/sswg/PROTOCOL.md` + `agent-os/sswg/PHASE-{0-4}.md`
> **Decisions:** `DECISIONS.md` (change log included)
> **Current state:** `_memory/main.md` | **Test results:** `docs/plans/phase-a-results.md`

---

## ACTIVE WORK STREAM: SSWG (Solid Smart WordPress Generator)

> **Decision (2026-03-03):** The old Node.js generator pipeline is DEPRECATED. SSWG replaces it entirely.
> SSWG is a pattern-assembly engine: AI generates content JSON → deterministic engine selects pre-validated patterns → injects content via `{{TOKEN}}` replacement → assembles theme.zip → validates → uploads.

### SSWG Phase 0: Foundation — COMPLETE
- Playground CLI installed and validated
- Gold-standard restaurant theme verified
- Protocol and phase specs established
- Proven-cores vault audited (7 themes, 338 patterns)

### SSWG Phase 1: Pattern Tokenization — COMPLETE
- 115 tokenized patterns across 5 cores (ollie, frost, tove, spectra-one, tt4)
- Token vocabulary: 81 tokens (71 text + 10 IMAGE_*)
- Registry: `pattern-library/registry.json` with full metadata
- Token spec: `pattern-library/token-schema.json`
- Exceeds 80-100 target from spec

### SSWG Phase 2: Assembly Engine — COMPLETE (2026-03-04)
- 6 Laravel services: AIPlanner, PatternSelector, TokenInjector, ImageHandler, ThemeAssembler, PlaygroundValidator
- GenerateThemeJob orchestrates full pipeline with retry + offset-based pattern diversification
- Code review cleanup: exception extraction, temp dir fix, Http facade, unit tests
- Deployed to production via Coolify

### SSWG Phase 2.5: Pipeline Activation — COMPLETE (2026-03-05)
- First successful end-to-end run — Luigi Pizza restaurant theme generated in 17 seconds
- 6 bugs fixed during activation (see `_memory/main.md` "Phase 2.5 Bug Fix Chain")

### SSWG Phase 2.7: Quality Fix (Skeleton Pipeline) — COMPLETE (2026-03-06)
**Complete pipeline rewrite replacing Ollie-dependent patterns with skeleton-based theme generation.**

- [x] 20 HTML skeleton patterns — pure block markup, ALL text = `{{TOKEN}}`, zero hardcoded content
- [x] skeleton-registry.json + vertical-recipes.json — deterministic page layouts for 5 verticals
- [x] token-schema.json expanded: 81 → 196 vertical-specific tokens
- [x] AIPlanner.php — vertical-aware token generation
- [x] PatternSelector.php — deterministic recipe-based skeleton lookup
- [x] TokenInjector.php — skeleton loading + block grammar validation
- [x] ThemeAssembler.php — PressPilot 3-column footer + inner page templates
- [x] GenerateThemeJob.php — linear 7-step pipeline
- [x] Static verification passed — all cross-references valid, PHP syntax clean

**All 6 quality issues addressed:**
- [x] Block markup validity — proven block grammar in skeletons, validated post-injection
- [x] Hero images — IMAGE_* tokens in block comment JSON + img src
- [x] Inner pages — about, services, contact from vertical recipes
- [x] PressPilot footer — custom 3-column design
- [x] Ollie content leakage — eliminated (100% tokenized)
- [x] Footer site name — wp:site-title + BUSINESS_NAME token

**✅ DEPLOYED (2026-03-06):** Pushed to GitHub, backend redeployed via Coolify (manual). Needs end-to-end 5-vertical test.

### SSWG Phase 2.8: Theme Quality Fix Pass — COMPLETE (2026-03-07)
**Goal:** Fix all 10 user-reported quality issues from smoke test of generated restaurant theme.
**Plan:** `docs/plans/2026-03-07-phase28-quality-fixes.md`

All 10 issues resolved (10 commits via Subagent-Driven Development):

| # | Issue | Root Cause | Fix |
|---|-------|-----------|-----|
| 1 | Theme only 19KB | Images not bundled (see #6) | Fixed by #6 |
| 2 | Pages not in Admin | Expected FSE behavior | Documented (NOT A BUG) |
| 3 | Only Homepage renders | No actual Page posts created | Starter content in functions.php |
| 4 | Generic site title | WP default, no override | Starter content sets blogname |
| 5 | White-on-white CTA | No explicit button bg color | Added backgroundColor/textColor attrs |
| 6 | No images at all | ImageHandler returned local paths, not URLs | Return Unsplash URLs directly |
| 7 | Full Bleed → Full Width | heroLayout ignored by PatternSelector | New hero-fullbleed skeleton + wired user choice |
| 8 | Brand colors not used | Flat vs nested key mismatch | Color mapping in GenerateThemeJob |
| 9 | No logo in header/footer | Logo URL available but unused | wp:image block + wp:navigation |
| 10 | Attempt Recovery + no Menu page | Block markup errors + missing page | Fixed menu-2col.html + added restaurant Menu page |

**Key lesson:** Pipeline rewrites need a feature parity checklist. Data flow gaps (colors, heroLayout, logo, fonts) are invisible until you trace the full path from frontend form to theme ZIP.

### SSWG Phase 3: Frontend Integration — ✅ COMPLETE (2026-03-07)
**Goal:** Connect Next.js frontend to new engine. Full user flow from form to download.
**Spec:** `agent-os/sswg/PHASE-3.md`

- [x] **Task 3.1:** Studio form → Laravel `/api/generate` wiring. ✅ Complete.
- [x] **Task 3.2:** ~~Playground Preview~~ — ❌ REVERTED. See DECISIONS.md KNOWN DEAD ENDS.
- [x] **Task 3.3:** Image Tier integration — Hybrid Unsplash→DALL-E pipeline ✅ Complete.
- [x] **Task 3.4:** Error handling & retry flow — Adaptive polling + payment gate + cleanup ✅ Complete.

**Implementation (9 commits, 2026-03-07):**
- DalleProvider (DALL-E 3 via OpenAI API) with primary/fallback pattern
- Project tier column (individual/agency) for future billing differentiation
- Image token manifest stored in job result for post-payment DALL-E upgrade
- UpgradeThemeImagesJob — downloads ZIP, swaps images with DALL-E, re-uploads
- POST /api/upgrade-images endpoint + upgrade status in /api/status response
- Frontend proxy + adaptive polling (3s→5s intervals, 600s timeout)
- Payment gate UI (Single Theme $29.99) with DALL-E upgrade flow
- Daily cleanup command for expired theme ZIPs (7-day retention)

**Post-Phase-3 Tasks (Next-Phase Plan executed 2026-03-08):**
- [x] B2: Dead preview button removed ✅ commit `9755819`
- [x] B3: Inline installation guide ✅ commit `7c04ac9`
- [x] B4: REST API documentation ✅ commit `d5308fc`
- [x] C1: Node.js worker shutdown ✅ commit `1109182`
- [x] C2: Projects table unification ✅ migration `2026_03_08_220000` (4 fix iterations for PgBouncer)
- [x] C3: Marketing screenshots ✅ commit `315789c`
- [x] C4: Landing page update ✅ commit `315789c`

### Phase A: Production Verification & Launch Readiness — ✅ A1-A2 COMPLETE, A3 PENDING

**Phase A1:** Verification tools created
- Created `scripts/verify-session-d-fixes.js` — automated ZIP analysis for Session D fixes
- Created `docs/TASK-A1-INSTRUCTIONS.md` — manual verification instructions
- ✅ commit `0ce99c0`

**Phase A2:** Multi-vertical smoke test — ✅ COMPLETE (2026-03-09)
- Dispatched 5 parallel subagent tasks to test production API
- All 5 verticals PASSED: restaurant (22s), SaaS (42s), portfolio (26s), ecommerce (26s), local_service (18s)
- Average generation time: 27.2 seconds
- 100% success rate — all themes verified with proper structure and PressPilot branding
- Full results: `docs/plans/phase-a-results.md`
- ✅ commit `5d45393`

**Phase A3:** Disable debug mode — ⏳ PENDING
- Set `APP_DEBUG=false` in Coolify environment variables
- Redeploy backend
- Verify error pages show user-friendly messages (not stack traces)

**Production bug fix (2026-03-09):**
- Site_type NOT NULL constraint violation when Studio wizard creates project
- Two-layer fix: API defaults + database DEFAULT values
- Migration `2026_03_09_010000_add_defaults_to_projects_columns.php` created
- ✅ commit `8ab5331`

**Checkpoint:** Production API verified with all 5 verticals. Ready for public launch after A3 (disable debug).

### SSWG Phase 4: WPaify Integration — QUEUED
**Goal:** HTML-to-WordPress theme conversion for WPaify product.
**Spec:** `agent-os/sswg/PHASE-4.md`
**Prerequisite:** Phase 3 merged and working.

---

## M0-M3: Laravel Migration Roadmap

> Strategy: Incrementally move backend from Next.js to Laravel. SSWG accelerated this — many M1 items are now resolved or superseded.

### M0: Foundation — COMPLETE (2026-02-08)
*   [x] Laravel 12 scaffold, Docker Compose, Eloquent models, Horizon, Redis
*   [x] Coolify deployment, integration tests, Supabase S3 driver
*   See `_memory/main.md` Section 19 for full details

### M1: Jobs Migration — PARTIALLY SUPERSEDED BY SSWG
*Some items resolved by SSWG, some still needed:*

| Item | Status | Notes |
|------|--------|-------|
| PHP data transformer | DONE (SSWG) | `DataTransformer.php` handles payload transformation |
| Public API endpoints | DONE (SSWG) | `POST /api/generate`, `GET /api/status` exist |
| `BACKEND_URL` feature flag | DONE | Already set in Coolify production. `proxyJsonToBackend()` active. Confirmed 2026-03-05. |
| Node worker shutdown | DONE | Commit `1109182` — removed deprecated Node.js generator scripts |
| `pp_projects` → `projects` unification | DONE | Migration `2026_03_08_220000` ran successfully on production. Orphan table + compat view created. 4 fix iterations for PgBouncer compatibility. |
| BrandStyle 4→2 mapping | SUPERSEDED | Brand modes dropped for SSWG MVP (see DECISIONS.md) |
| Logo download pipeline | NEEDED | ColorThief integration for brand color extraction |

### M2: Auth + Billing — DEFERRED
*   Sanctum auth, LemonSqueezy webhooks, RLS simplification
*   Blocked on M1 completion + Phase 3

### M3: Cutover — DEFERRED
*   Next.js API route removal, table retirement, full Laravel API
*   Blocked on M2

---

## HISTORICAL: Previous Work Streams (All Complete)

> These sections document completed work from the old Node.js generator era (pre-SSWG).
> The old generator in `src/generator/` is LEGACY and deprecated. Do not modify it.
> All future generation work goes through SSWG Laravel services.

<details>
<summary>Click to expand historical phases</summary>

### Phase 1: Stabilization & Core Refactor — COMPLETE
*   [x] Refactor Generator Core, Color Harmonization, Stable Navigation, FSE Compliance, Smoke Tests

### Phase 2: Vertical Expansion (Restaurant) — COMPLETE
*   [x] Menu Upload Flow, Page Templates, Menu Injection, Testing

### Phase 3: SaaS Studio UI Polish — PARTIALLY COMPLETE
*   [x] Global Layout (dark AppShell)
*   [ ] Step Navigation, Preview Accuracy, Mobile Responsiveness — SUPERSEDED by SSWG Phase 3

### Phase 13: Generator Best Practices — COMPLETE
*   [x] Contact Data Flow, Hero Layout Differentiation, brandStyle Routing, Content Validation

### Phase 14: Restaurant Theme Fixes — COMPLETE
*   [x] Frost/Tove fixes, Heavy Mode forcing, Pattern Cleaning

### Phase 15: Documentation & Marketing Prep — PARTIAL
*   [x] UI Shell Unification
*   [ ] User Guides, Developer Docs, Marketing Assets, Landing Page — BACKLOG (post-SSWG Phase 3)

### Generator 2.0: Design System & Recipe Engine — COMPLETE (LEGACY)
*   Gen 2.0 Phases 1-5 all complete (design tokens, recipes, restaurant/ecommerce/SaaS verticals)
*   This system is part of the old Node.js generator and is NOT used by SSWG
*   SSWG uses its own pattern selection via `PatternSelector.php` + `registry.json`

### Generator Fix Plan (Mar 2026) — COMPLETE
*   Phase 0/1: Gold standard rebuild, dead code removal (commit `f7d5069`)
*   Phase 3: PlaygroundValidator via `@wp-playground/cli` (commit `437d1cb`)
*   Phase 4: InputValidator, AccessibilityValidator, ContentBuilder truncation (commit `b13e836`)
*   Phase 2 (P5 diagnosis): DEPRIORITIZED — superseded by SSWG

</details>

---

## Ongoing Maintenance

- **Hard Gates:** BlockConfigValidator enforces required block attributes (pre-write + pre-ZIP)
- **FSE Compliance:** Rules in `WORDPRESS_FSE_REFERENCE.md` and `.claude/rules/WP_FSE_SKILL.md`
- **Security:** Input sanitization, path traversal protection, attack payload tests

---

## Backlog (Post-SSWG Phase 3)

| Item | Priority | Notes |
|------|----------|-------|
| Multi-vertical end-to-end test | HIGH | ✅ DONE (2026-03-06) — 5/5 verticals pass mechanically. Phase 2.7 addresses all 6 quality issues. Needs post-deploy re-test. |
| User guides (install ZIP, Site Editor) | ~~HIGH~~ | ✅ DONE (2026-03-08) — Inline guide in Studio Step 5 UI (commit `7c04ac9`) |
| API documentation (`POST /api/generate`) | ~~HIGH~~ | ✅ DONE (2026-03-08) — `docs/API.md` (commit `d5308fc`) |
| Marketing assets (flagship screenshots) | ~~MEDIUM~~ | ✅ DONE (2026-03-08) — Placeholder PNGs in `public/marketing/` (commit `315789c`) |
| Landing page update | ~~MEDIUM~~ | ✅ DONE (2026-03-08) — Real examples + pricing section (commit `315789c`) |
| Playground preview validation | MEDIUM | Phase 3 Task 3.2 |
| Image generation integration | ~~MEDIUM~~ | ✅ DONE (2026-03-07) — DALL-E 3 integration via DalleProvider + UpgradeThemeImagesJob |
| Brand mode support | LOW | Post-launch via Ollie style variations |
| Style variations (High Contrast, Dark) | LOW | Post-launch |
| WooCommerce patterns | LOW | Ecommerce vertical enhancement |
| Multi-language / RTL | LOW | |
| CI/CD pipeline (GitHub Actions) | LOW | Visual tests, security gate |

---

## Patch Notes

### 2026-03-08
- [x] **Session E:** Next-Phase Implementation Plan execution (commits `9755819` → `63d753f`)
  - Phase B: B2 (dead preview button removed), B3 (install guide), B4 (API docs) — all complete
  - Phase C: C1 (Node shutdown), C2 (table unification), C3 (marketing screenshots), C4 (landing page) — all complete
  - Projects unification migration: 4 fix iterations for PgBouncer/Supabase compatibility, then successful run
  - **Key lesson:** Supabase PgBouncer transaction pooling blocks multi-statement prepared statements. Each SQL command must be a separate `DB::statement()` call. Anonymous migrations don't have `$this->command`.
- [x] **Session D:** UX/UI quality fixes — transparent header, footer composition, person images, inner page CTAs (commit `ec67554`)
- [x] **Session A:** 5 quality fixes (K-means colors, menu col widths, content loader, logo, pattern slugs) — commit `c65f96c`
- [x] **Session B:** Post-deploy fix round 1 — footer nav, Attempt Recovery, logo data URI validation, WP default deletion, page ordering, AI truncation logging — commits `06493f1`, `e6606c6`
- [x] **Session C:** Post-deploy fix round 2 — bulk WP content deletion (fixes "Hello from WordPress Playground!"), word-boundary token truncation, logo saved as file + wp:site-logo block + media_handle_sideload — commit `5314618`
- [x] All commits pushed and deployed to Coolify
- [ ] **NEEDS:** Final verification test of commit `5314618` (nav clean, no truncated words, no Attempt Recovery in editor)
- [ ] **NEEDS:** Set APP_DEBUG=false once testing confirms all fixes

### 2026-03-07
- [x] **Phase 2.8 Quality Fixes complete** — All 10 user-reported theme issues fixed
  - 10 commits implementing 10-task plan via Subagent-Driven Development
  - Image pipeline (Unsplash URLs), brand colors, hero layout, logo+nav, menu page, starter content, fonts
  - Plan: `docs/plans/2026-03-07-phase28-quality-fixes.md`
- [x] **Phase 3 Tasks 3.3 + 3.4 complete** — Image tier integration + error handling/retry flow
  - 9 commits implementing 12-task plan via Subagent-Driven Development
  - DalleProvider, UpgradeThemeImagesJob, adaptive polling, payment gate UI, cleanup command
  - Design doc: `docs/plans/2026-03-07-phase3-image-tier-and-error-handling-design.md`
  - Implementation plan: `docs/plans/2026-03-07-phase3-implementation-plan.md`

### 2026-03-06
- [x] Multi-vertical pipeline test (AM) — 5/5 themes generated mechanically, 6 quality issues found
- [x] **Phase 2.7 complete (PM)** — skeleton-based pipeline rewrite addressing all 6 quality issues
  - 20 HTML skeleton patterns, 196 tokens, 5 vertical recipes
  - All services rewritten: AIPlanner, PatternSelector, TokenInjector, ThemeAssembler, GenerateThemeJob
  - Commit `70a0c1c` — 39 files changed, +5,086 / -732 lines
- [x] **DEPLOYED (2026-03-06)** — pushed to GitHub, backend redeployed via Coolify manually
- [ ] **NEEDS** end-to-end 5-vertical verification test

### 2026-03-05
- [x] SSWG Phase 2.5 complete — first successful end-to-end theme generation (17s, 1.12 MB)
- [x] 6 pipeline bugs fixed (see `_memory/main.md` "Phase 2.5 Bug Fix Chain")
- [x] DECISIONS.md audit — 7 outdated entries corrected, change log added
- [x] PROJECT_ROADMAP.md restructured — SSWG is now primary work stream, old phases marked historical
- [x] Agent prompt files archived to `Project Extras/archived-agent-prompts/`

### 2026-03-04
- [x] SSWG Phase 2 deployed — all 6 assembly engine services running in Coolify
- [x] Phase 2 cleanup — exception extraction, temp dir fix, Http facade, unit tests

### 2026-03-03
- [x] Generator Fix Plan Phases 0/1/3/4 complete
- [x] Hero layout rework — fullBleed transparent nav overlay, fullWidth cover with image
- [x] P5 generation stall DEPRIORITIZED — SSWG replaces old pipeline

### 2026-02-23
- [x] Block Config Validation — BlockConfigValidator with two checkpoints (pre-write + pre-ZIP gate)

### 2026-02-21
- [x] Testimonials hardening, bypass flow hero-layout fix
