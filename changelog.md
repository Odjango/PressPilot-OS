# PressPilot OS – Changelog

> Log only **meaningful, stable changes** here (new workflows, major decisions, architecture shifts).
> For decision rationale, see `DECISIONS.md`. For full project state, see `_memory/main.md`.

## Entries

## [2026-03-07] — Generator Validation Hardening — Plan Written

### Added
- **Implementation plan** at `docs/plans/2026-03-07-generator-validation-hardening.md` — 8-task plan to eliminate "Attempt Recovery" errors
- **3 WordPress MCP servers** installed in Claude Code CLI: `wp-rest-api` (@wpgaurav/wp-mcp), `wp-official` (@automattic/mcp-wordpress-remote), `wp-devdocs` (wp-devdocs-mcp)
- **MCP installation guide** in `docs/plans/MCP-Install-Commands.md` with verified env variable names

### Analyzed (root causes of recurring "Attempt Recovery" errors)
1. **TokenInjector image URL escaping corrupts block JSON** — `str_replace(['\\', '"'], ['\\\\', '\\"'])` double-escapes; IMAGE_HERO tokens appear inside block comment JSON (`"url":"{{IMAGE_HERO}}"`) where `htmlspecialchars` would break JSON
2. **Regex-based JSON validation fails on nested braces** — regex `[^}]*` in `validateBlockGrammar()` can't match cover blocks with `{"style":{"spacing":{"margin":{"top":"0"}}}}`
3. **PlaygroundValidator returns `valid: true` on timeout/CLI failure** — broken themes that crash Playground get green-lit
4. **Validation errors don't halt pipeline** — `processSkeletons()` logs warnings but continues, invalid HTML flows through to ZIP
5. **No Site Editor block grammar check** — PlaygroundValidator only tests theme activation and frontend HTTP status, never opens Site Editor where "Attempt Recovery" appears

### Plan Summary (8 tasks)
1. Fix TokenInjector with context-aware injection (block JSON vs HTML content)
2. Replace regex JSON validation with brace-counting parser
3. Make validation failures throw `BlockGrammarException` (halt pipeline)
4. Harden PlaygroundValidator — timeout/failure = invalid, add block grammar check
5. Rewrite existing tests to use inline HTML fixtures (not old Ollie paths)
6. Add integration test across all 5 verticals
7. Improve GenerateThemeJob error metrics
8. Fix legacy `inject()` method to delegate to new `injectTokens()`

### Next
- Execute plan (8 tasks, sequential) — user has all night available
- Deploy + run 5-vertical integration test
- Then proceed to Phase 3 (frontend integration)

---

## [2026-03-06b] — SSWG Phase 2.7 Complete — Skeleton-Based Pipeline Rewrite

### Added
- **20 HTML skeleton patterns** in `pattern-library/skeletons/` — pure WordPress block markup with `{{TOKEN}}` placeholders for ALL visible text. Zero hardcoded content.
- **skeleton-registry.json** — maps each skeleton to file path, category, required tokens, vertical affinity
- **vertical-recipes.json** — deterministic page layouts for 5 verticals (restaurant, ecommerce, saas, portfolio, local_service), each with home/about/services/contact page definitions
- **normalizeCategory()** in GenerateThemeJob — maps 18+ business category aliases to 5 supported verticals
- **extractImageTokens()** in GenerateThemeJob — collects IMAGE_* tokens from skeleton selections for ImageHandler
- **Block grammar validation** in TokenInjector — validates JSON in block comments, checks opening/closing block balance post-injection

### Changed
- **token-schema.json** expanded from 81 → 196 tokens with vertical-specific definitions (restaurant: 32, ecommerce: 27, saas: 27, local_service: 6, general: 104)
- **AIPlanner.php** rewritten — loads vertical recipes, generates only tokens needed per vertical, fills missing tokens with smart defaults instead of empty strings
- **PatternSelector.php** rewritten — deterministic recipe-based skeleton lookup replaces scoring-based pattern selection
- **TokenInjector.php** updated — new `loadSkeleton()`, `injectTokens()`, `processSkeletons()` methods for skeleton-based pipeline
- **ThemeAssembler.php** rewritten — PressPilot 3-column footer (site title+tagline, Quick Links nav, Get In Touch + social icons, copyright), inner page templates (about, services, contact), `customTemplates` in theme.json
- **GenerateThemeJob.php** simplified — linear 7-step pipeline replaces offset-based retry with scoring

### Removed
- Old pattern selection: `buildPatternSelection()`, `patternsForPage()`, `selectForPageWithOffset()`
- Old pattern injection: `injectPatterns()`, `loadRegistry()` (old registry.json loading)
- Old assembly retry: `attemptAssembly()` with offset-based retry
- Old footer: `pressPilotCredit()`, `fallbackFooter()` (Ollie-based footer)
- Old image handling: `copyImages()` method (images now URL-based tokens)

### Quality Issues Addressed (all 6 from prior session)
1. ✅ Block markup validity — skeletons use proven block grammar, validated post-injection
2. ✅ Hero images — IMAGE_* tokens in both block comment JSON and img src
3. ✅ Inner pages — about, services, contact pages generated from vertical recipes
4. ✅ PressPilot footer — custom 3-column design replaces Ollie's footer
5. ✅ Ollie content leakage — ALL skeleton text is tokenized
6. ✅ Footer site name — uses wp:site-title block + BUSINESS_NAME token

### Deployed
- ✅ Pushed to GitHub (`70a0c1c` code + `b8cf373` docs)
- ✅ Backend redeployed via Coolify (manual redeploy — frontend auto-deploys but backend requires manual trigger)
- **Note:** Coolify auto-deploy only covers the frontend (Next.js). Backend (Laravel + Horizon) is a separate Coolify resource requiring manual redeploy.

### Next
- Generate 5 test themes (one per vertical) to verify end-to-end pipeline in production

---

## [2026-03-06] — SSWG Multi-Vertical Pipeline Test — Mechanically Passes, Quality Fails

### Tested
- **5 automated pipeline tests** dispatched to production (`POST /api/generate`):
  - Bella Trattoria (restaurant, 1.3 MB), Nexus Digital (ecommerce, 740 KB), Summit Plumbing (local_service, 1.4 MB), CloudMetrics (saas, 993 KB), Sarah Chen Studio (portfolio, 1.1 MB)
- **9-point structural validation** — all 5 themes pass all checks (but this gives false confidence — see below)
- **Real WordPress rendering** — all 5 themes installed on Local WP (WordPress 6.9.1), all activate

### ⚠️ Quality Assessment (owner manual review)
Output quality is NOT production-viable. Generator logic needs fundamental work.

### Issues Found (6 — revised from initial 3 after owner review)
1. **"Attempt Recovery" in Site Editor** (CRITICAL) — Block markup is structurally invalid. Bella Trattoria confirmed showing "Block contains unexpected or invalid content" in Site Editor. The 9-point structural validation did NOT catch this.
2. **Cover block hero images not rendering** (HIGH) — Unsplash URLs present in ZIPs but hero backgrounds show empty/white.
3. **Only front-page.html has content** (HIGH) — All inner pages (About, Services, Contact, Blog) are header+footer shells only. No page body content.
4. **Footer is Ollie's, not PressPilot's** (HIGH) — ThemeAssembler copies Ollie's footer and appends PressPilot credit. Expected: clean 3-column PressPilot footer (logo+tagline, Quick Links, Get In Touch + social, copyright).
5. **Ollie content leakage is EXTENSIVE** (HIGH — upgraded from medium) — "View Ollie Patterns" buttons, Ollie testimonial placeholder names, Ollie feature descriptions, broken brand logo placeholders throughout. Majority of page content below the hero is un-tokenized Ollie text.
6. **Site name mismatch in footer** (MEDIUM) — Footer hardcodes wrong business names.

### Root Cause
Tokenization coverage is fundamentally insufficient. 81 tokens cover headlines and a few descriptions, but body text, testimonials, feature cards, CTAs, brand logos are all hardcoded Ollie content. The generated themes look like Ollie with a few business headlines swapped in — not custom business themes.

### Decision
- **Phase 3 tasks (Image Tier, Error Handling) BLOCKED** until pipeline output quality is fixed
- **WordPress Playground screenshot automation** added to KNOWN DEAD ENDS
- **Automated structural validation needs enhancement** — 9/9 pass ≠ quality pass

---

## [2026-03-05b] — SSWG Phase 3 — Task 3.1 Confirmed + Task 3.2 Attempted & Reverted

### Confirmed
- **Task 3.1 (Studio→Laravel wiring)** — already complete from prior M1 work. `BACKEND_URL` was already set in Coolify, proxy logic in `proxyJsonToBackend()` already active, Studio already generating themes through Laravel pipeline.

### Added
- `PlaygroundThemePreview.tsx` — WordPress Playground browser-based preview component (commit `de0edcb`)
- Skip-preview fallback button at Step 3 when local WordPress unavailable (commit `de0edcb`)

### Reverted
- **Task 3.2 (Playground Preview)** — removed from Step 5 (commit `a0fe47a`). WordPress Playground renders themes without theme.json styling, Google Fonts, or images. The result is an unstyled bare-bones page — far worse than the existing HeroPreviewRunner screenshot-based preview at Step 4.

### Decision
- **WordPress Playground is NOT viable for live preview** — added to KNOWN DEAD ENDS in DECISIONS.md. The existing hero preview (real WordPress screenshot via HeroPreviewRunner) is the superior approach.

---

## [2026-03-05] — SSWG Phase 2.5 Complete + Documentation Overhaul

### Added
- **First successful end-to-end theme generation** — Luigi Pizza restaurant theme generated in 17 seconds via SSWG pipeline (AIPlanner → PatternSelector → TokenInjector → ThemeAssembler → ZIP → Supabase upload → signed URL)
- **DECISIONS.md Change Log** — every decision change now documented with date, old value, new value, and reason
- **Phase 2.5 Bug Fix Chain** in `_memory/main.md` — 6 bugs documented with root cause, fix, and commit

### Fixed
- AIPlanner `Array to string conversion` — DataTransformer nested pages handled via `array_map()` (commit `248f422`)
- Anthropic API 404 — invalid model name `claude-haiku-4` → `claude-haiku-4-5-20251001`
- AI response JSON extraction — Claude markdown-wrapped JSON parsed with 3-layer `extractJson()` method
- Token validation hard-fail — soft validation fills defaults for missing tokens, skips IMAGE_* tokens
- TokenInjector crash on unresolved tokens — sweeps remaining `{{TOKEN}}` with empty string + logs warnings
- ThemeAssembler missing proven-cores — 718 files from proven-cores subdirectories committed to git

### Changed
- **DECISIONS.md** — 7 outdated entries corrected (OpenAI → Claude, n8n role clarified, generator description fixed, image source updated, static HTML output removed, brand modes dropped for MVP, style variations reduced)
- **PROJECT_ROADMAP.md** — restructured with SSWG as primary work stream, old phases collapsed to historical section
- **BRAIN/MEMORY/project_state.md** — header updated to reflect SSWG Phase 2.5 complete, brand modes marked as dropped
- `docker-compose.m0-laravel.yml` — `PRESSPILOT_AI_MODEL` default changed to `claude-haiku-4-5-20251001`, `PRESSPILOT_AI_MAX_TOKENS` increased from 2048 to 4096

### Archived
- 10 stale files moved to `Project Extras/archived-agent-prompts/`:
  - `AGENT-PROMPT-PHASE{1,2-NOTE,3,3-LEAN,4}.md` (old Generator Fix Plan — all completed)
  - `AGENT-PROMPT-SSWG-PHASE{1,2}-LEAN.md` (completed SSWG phase prompts)
  - `GENERATOR-FIX-PLAN.md`, `PHASE-0-STATUS-HONEST.md`, `PHASE-0-COMPLETION-SUMMARY.md`

---

## [2026-03-04] — SSWG Phase 2 Deployed

### Added
- **6 Laravel SSWG services** deployed to production via Coolify:
  - `AIPlanner.php` — Claude API content generation with retry logic
  - `PatternSelector.php` — selects patterns by vertical/style with Ollie fallback
  - `TokenInjector.php` — `{{TOKEN}}` replacement with HTML escaping
  - `ThemeAssembler.php` — builds complete theme.zip from patterns + project data
  - `ImageHandler.php` — image sourcing with UnsplashProvider + PlaceholderProvider
  - `PlaygroundValidator.php` — WordPress Playground CLI validation via blueprint
- `GenerateThemeJob.php` refactored to use full SSWG pipeline with retry + offset-based pattern diversification
- SSWG env vars added to Horizon service in `docker-compose.m0-laravel.yml`
- Docker path fix: Horizon Dockerfile COPYs `pattern-library/` and `proven-cores/` to root

### Fixed
- `ContentGenerationException` and `MissingTokenException` extracted to `app/Exceptions/` (PSR-4 compliance)
- Hardcoded `/tmp/themes/` → `sys_get_temp_dir()."/pp-themes/"` in ThemeAssembler
- AIPlanner refactored from raw `file_get_contents` to Laravel `Http` facade

---

## [2026-03-03] — Generator Fix Plan + Hero Rework

### Added
- **PlaygroundValidator** — CLI-based WordPress Playground validation as build gate, Step 2D (commit `437d1cb`)
- **InputValidator** — validates JSON input as Step 0 in pipeline (commit `b13e836`)
- **AccessibilityValidator** — checks alt text, heading hierarchy, color contrast (commit `b13e836`)
- ContentBuilder smart truncation for business names and headlines

### Changed
- **Hero layout rework** (commit `a15c076`):
  - fullBleed: re-embedded transparent nav inside Cover block (100vh, nav overlay)
  - fullWidth: converted from solid color `wp:group` to `wp:cover` with background image + 70% overlay
  - PatternInjector conditionally skips header template-part for fullBleed
- Hero preview mirror (`heroPreviewInjector.ts`) synced to match both layout changes
- **Decision: P5 generation stall DEPRIORITIZED** — SSWG replaces old pipeline entirely

### Fixed
- Gold standard ZIP rebuilt, dead code removed (commit `f7d5069`)

---

## [2026-03-02] — SSWG Phase 1 Complete

### Added
- **115 tokenized patterns** across 5 proven-core themes (ollie, frost, tove, spectra-one, twentytwentyfour)
- **Token vocabulary**: 81 tokens (71 text + 10 IMAGE_*) defined in `pattern-library/token-schema.json`
- **Pattern registry**: `pattern-library/registry.json` with full metadata (core, category, tags, tokens)
- **Batch manifest**: `pattern-library/batch-manifest.json` for organized pattern loading
- Exceeds 80-100 pattern target from SSWG spec

---

## [2026-02-26] — Project Cleanup & Memory Consolidation

### Changed
- Memory systems consolidated: 4 systems → 1 canonical (`BRAIN/MEMORY/`)
- Instruction files cleaned: stale/wrong-project files archived
- **2,211 files** organized into `Project Extras/` (9 subfolders) — nothing deleted
- `tsconfig.json` excludes `Project Extras/` from TypeScript compilation

---

## [2026-02-23] — Block Config Validation

### Added
- **BlockConfigValidator** — static validator checking required block attributes
- **BlockAttributeSchema** — per-block attribute specs (cover, template-part, social-link, query, heading, embed)
- Two-checkpoint validation: pre-file-write (log) + pre-ZIP gate (hard fail)
- Content manifest (`{slug}-manifest.json`) written alongside every ZIP

---

## [2026-02-21] — 5-Vertical Smoke Test Pass

### Fixed
- All 5 verticals (Restaurant, SaaS, Portfolio, Ecommerce, Local Service) pass WP smoke tests
- Zero "Attempt Recovery" errors in Site Editor across all verticals
- P1 (Hero preview capture), P2 (Testimonials), P3 (Apostrophe encoding) all resolved and verified

---

## [2026-02-08] — M0 Laravel Foundation

### Added
- Laravel 12 scaffold in `backend/` with Sanctum, Horizon, Redis
- Docker Compose stack: `laravel-app` (PHP-FPM + nginx), `laravel-horizon` (PHP-CLI + Node 20), `redis`
- Eloquent models mapping to Supabase tables
- `GenerateThemeJob` with Node subprocess invocation
- Supabase S3 filesystem driver
- 8 structured-log metrics for observability
- Integration tests: `GenerateThemeSmokeTest` (7 tests) + `m0-smoke-test.sh`

---

## [2026-02-06] — Generator 2.0 Ecommerce Vertical

### Added
- Ecommerce design tokens, recipes (Product Showcase + Minimal Store), 5 section patterns
- Heavy Mode forcing for ecommerce verticals
- WCAG AA contrast fix for hero overlays and newsletter sections
- Brand style expansion: `bold` and `minimal` added to `TT4BrandStyle`

---

## [2026-02-05] — Generator 2.0 Design System + Recipes

### Added
- Centralized design token API: `getDesignTokens(brandMode, vertical)`
- 4 brand modes: playful, modern, minimal, bold
- Data-driven recipe system: `RecipeSelector` + `SectionRenderer`
- Restaurant recipes: Classic Bistro + Modern Dining

---

## [2026-02-04] — Restaurant Homepage v1

### Added
- Restaurant section patterns: story, menu preview, promo band
- Restaurant visual mode differentiation: playful (Tove) vs modern (Frost)
- Style token system (`restaurantThemeTokens.ts`)

---

## [2026-02-02] — Generator Best Practices + Restaurant Fixes

### Added
- Hero layout differentiation: fullBleed, fullWidth, split, minimal
- Restaurant brandStyle routing: playful → Tove, modern → Frost
- Content validation with forbidden demo string detection
- Frost/Tove restaurant-specific fixes

---

## [2025-11-13] — Initial OS Skeleton
- Created core OS files: master-prompt.md, memory.md, workflows.json, modules.json
- Added supporting structure: changelog.md, tasks.md, stages/
