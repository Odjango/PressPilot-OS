# PressPilot OS — Development Roadmap

> **Last updated: 2026-03-07** — Phase 2.8 (Validation Hardening) plan written. 5 root causes identified, 8-task fix plan ready for execution. Phase 3 BLOCKED until validation hardening deployed + verified.
> **Canonical SSWG specs:** `agent-os/sswg/PROTOCOL.md` + `agent-os/sswg/PHASE-{0-4}.md`
> **Decisions:** `DECISIONS.md` (change log included)
> **Current state:** `_memory/main.md`

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

### SSWG Phase 2.8: Validation Hardening — IN PROGRESS (2026-03-07)
**Goal:** Eliminate recurring "Attempt Recovery" errors by making validation strict enough to catch and block invalid block markup before ZIP creation.
**Plan:** `docs/plans/2026-03-07-generator-validation-hardening.md`

**Root causes identified (5):**
1. Token injection escaping corrupts block comment JSON
2. Regex-based validation can't parse nested braces
3. PlaygroundValidator returns valid on timeout/failure
4. Validation errors don't halt pipeline (log-only)
5. No Site Editor block grammar check

**Tasks (8, sequential):**
- [ ] Task 1: Context-aware token injection (block JSON vs HTML content)
- [ ] Task 2: Brace-counting JSON parser replaces regex
- [ ] Task 3: BlockGrammarException halts pipeline
- [ ] Task 4: Harden PlaygroundValidator (no false positives + block grammar check)
- [ ] Task 5: Rewrite tests with inline HTML fixtures
- [ ] Task 6: Integration test across all 5 verticals
- [ ] Task 7: Structured error metrics in GenerateThemeJob
- [ ] Task 8: Legacy inject() delegates to new injectTokens()

**Checkpoint:** Run 5-vertical integration test. All pass with valid block JSON. Deploy + manual Site Editor verification on Local WP.

### SSWG Phase 3: Frontend Integration — BLOCKED (pending Phase 2.8 validation hardening)
**Goal:** Connect Next.js frontend to new engine. Full user flow from form to download.
**Spec:** `agent-os/sswg/PHASE-3.md`

- [x] **Task 3.1:** Studio form → Laravel `/api/generate` wiring. ✅ Already complete.
- [x] **Task 3.2:** ~~Playground Preview~~ — ❌ REVERTED. See DECISIONS.md KNOWN DEAD ENDS.
- [ ] **Task 3.3:** Image Tier integration — ready after Phase 2.7 verified
- [ ] **Task 3.4:** Error handling & retry flow — ready after Phase 2.7 verified

**Checkpoint:** Complete user journey: visit site → fill form → generate → preview → download. Works for 3+ business types.

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
| Node worker shutdown | NEEDED | After Phase 3 confirms Laravel handles all generation |
| `pp_projects` → `projects` unification | NEEDED | Migration DDL still pending |
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
| User guides (install ZIP, Site Editor) | HIGH | Needed for launch |
| API documentation (`POST /api/generate`) | HIGH | Needed for launch |
| Marketing assets (flagship screenshots) | MEDIUM | After pipeline produces polished themes |
| Landing page update | MEDIUM | "Generated in 17s" value prop |
| Playground preview validation | MEDIUM | Phase 3 Task 3.2 |
| Image generation integration | MEDIUM | Replace placehold.co with AI-generated images |
| Brand mode support | LOW | Post-launch via Ollie style variations |
| Style variations (High Contrast, Dark) | LOW | Post-launch |
| WooCommerce patterns | LOW | Ecommerce vertical enhancement |
| Multi-language / RTL | LOW | |
| CI/CD pipeline (GitHub Actions) | LOW | Visual tests, security gate |

---

## Patch Notes

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
