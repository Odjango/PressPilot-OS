# PressPilot OS — Development Roadmap

## Phase 1: Stabilization & Core Refactor (Current)
**Goal:** Reach 100% reliability for generated themes. Eliminate "Attempt Recovery" errors.
*   [x] **Refactor Generator Core:** Consolidate `PatternInjector`, `StructureValidator`, `ContentEngine` into `src/generator`.
*   [x] **Implement Color Harmonization:** `ColorHarmonizer` utility with WCAG checks and saturation caps.
*   [x] **Implement Stable Navigation:** Migrate `universal-header.ts` to use self-closing `wp:navigation` blocks.
*   [x] **Audit FSE Compliance:** Document full compliance rules in `WORDPRESS_FSE_REFERENCE.md`.
*   [x] **Final Smoke Test:** Verify `npm run dev` and `npm run build` pass consistently.

## Phase 2: Vertical Expansion (Restaurant & Café)
**Goal:** Deliver deep value for the Restaurant vertical with structured data features.
*   [x] **UI - Menu Upload Flow:** Create `src/app/studio/steps/MenuUploader.tsx`.
    *   Allow raw text paste or file upload.
    *   Parse into structured JSON (`RestaurantMenu` type).
*   [x] **Generator - Page Templates:** Create `src/generator/patterns/universal-menu.ts`.
    *   Implement "Menu Section" pattern (Tabs or List view).
    *   Implement "Dish Card" pattern (Image, Title, Price, Description).
*   [x] **Logic - Menu Injection:** Wire `ContentEngine` to populate menu patterns from parsed data.
*   [x] **Testing:** Verify menu page generation in standard and heavy content modes.


## Phase 3: SaaS Studio UI Polish
**Goal:** Make the "Hands" (SaaS App) feel as premium as the "Brain" (Generator).
*   [x] **Global Layout:** Unified dark AppShell with consistent header/footer across all pages (Phase 15.1).
*   [ ] **Step Navigation:** Implement smooth transitions between onboarding steps.
*   [ ] **Preview Accuracy:** Ensure `staticSite.ts` preview matches the final WordPress theme output 1:1.
*   [ ] **Mobile Responsiveness:** Verify Studio UI on mobile devices.

## Phase 13: Generator Best Practices Upgrade (Complete)
**Goal:** Improve data flow, hero differentiation, and content validation.
*   [x] **Contact Data Flow:** Wire Studio UI contact fields through full pipeline.
*   [x] **Hero Layout Differentiation:** Implement fullBleed, fullWidth, split, minimal hero variants.
*   [x] **Restaurant brandStyle Routing:** Map playful → Tove, modern → Frost.
*   [x] **Content Validation:** Add ContentValidator to catch forbidden demo strings.

## Phase 14: Restaurant Theme Fixes (Complete)
**Goal:** Fix critical issues in Frost and Tove restaurant theme generation.
*   [x] **Frost "Build with Frost" Removal:** Add restaurant recipe + legacy content replacements.
*   [x] **Frost Testimonial Names:** Replace demo names (Allison Taylor, etc.) with neutral guest names.
*   [x] **Split Hero Fix:** Force Heavy Mode for restaurants to ensure hero layout differentiation.
*   [x] **Tove Spacing Normalization:** Reduce page padding from spacing-70 to spacing-50.
*   [x] **Tove Menu Contrast:** Add explicit textColor="foreground" for readability.
*   [x] **Tove Opening Hours:** Replace narrow 3-column layout with horizontal table.
*   [x] **Pattern Cleaning:** Add cleanAllPatterns() to sanitize ALL base theme patterns post-chassis.

## Phase 15: Documentation & Marketing Prep
**Goal:** Prepare for public launch and user onboarding.
*   [x] **UI Shell Unification:** Dark theme AppShell with unified header/footer (Phase 15.1 complete).
*   [ ] **User Guides:** Create "Getting Started" docs for end-users (installing the ZIP, using Site Editor).
*   [ ] **Developer Docs:** Finalize API documentation for `POST /api/generate`.
*   [ ] **Marketing Assets:** Generate screenshots of "Flagship" themes (Restaurant, Agency, SaaS).
*   [ ] **Landing Page:** Update the main landing page with "Generated in 90s" value prop and live demo link.

**Next up for Phase 15:**
- Capture hero screenshots from 5 flagship themes (Bella Trattoria, Slate Wine Bar, Nexus Digital, The Cozy Cup, Ember & Oak)
- Refine landing copy with reliability-first positioning ("FSE themes without editor errors")
- Complete user guide with install walkthrough and Site Editor intro

---

## M0-M3: Laravel Migration Roadmap (Strangler Fig)

> Strategy: Incrementally move backend responsibilities from Next.js API routes + Node worker to Laravel, with zero production interruption at each phase boundary.

### M0: Foundation (COMPLETE — 2026-02-08)
*Laravel stands up alongside Next.js. No production traffic.*
*   [x] **Laravel 12 scaffold** in `backend/` with Sanctum, Horizon, Redis
*   [x] **Docker Compose stack** — `laravel-app` (PHP-FPM + nginx), `laravel-horizon` (PHP-CLI + Node 20), `redis`
*   [x] **Eloquent models** — `Project`, `GenerationJob`, `GeneratedTheme`, `User` mapping to existing Supabase tables
*   [x] **`bin/generate.ts`** — CLI wrapper accepting JSON stdin, producing JSON stdout (validates + builds static site)
*   [x] **`GenerateThemeJob`** — Laravel queue job invoking Node generator via subprocess
*   [x] **Supabase S3 filesystem driver** — uploads theme/preview ZIPs to `generated-themes` bucket
*   [x] **Internal endpoints** — `GET /health`, `POST /jobs/test-dispatch`, `GET /jobs/{id}`
*   [x] **Coolify deployment** — Docker stack deployed on VPS
*   [x] **Horizon packaging fix (2026-02-14)** — switched from bind-mount assumptions to Dockerfile `COPY` for generator payload in `backend/docker/horizon/Dockerfile`; removed `.:/app/generator:ro` from `docker-compose.m0-laravel.yml` for Coolify compatibility
*   [x] **Full integration test** — `GenerateThemeSmokeTest` (7 tests) + `m0-smoke-test.sh` (Docker E2E)
*   [ ] **Observability baseline (P8)** — 8 structured-log metrics emitting for 3+ days. Scheduler added to supervisord.conf. Deploy updated stack, then monitor `docker compose logs` for 3 days.

### M1: Jobs Migration (Next)
*Laravel takes over job creation and processing. Node polling worker retired.*
*   [ ] **PHP data transformer** — port `transformSaaSInputToGeneratorData()` from TypeScript to PHP
*   [ ] **Public API endpoints** — `POST /generate`, `POST /regenerate`, `GET /status`, `GET /download`
*   [ ] **`BACKEND_URL` feature flag** — Next.js routes requests to Laravel when set
*   [ ] **Node worker shutdown** — drain queue, stop worker, Horizon becomes sole processor
*   [ ] **`pp_projects` → `projects` unification** — migration DDL, backfill, single canonical table
*   [ ] **BrandStyle 4→2 mapping** — decide handling for `bold`/`minimal` before they reach generator
*   [ ] **Logo download pipeline** — download logos from Supabase Storage to temp file for ColorThief

### M2: Auth + Billing (Deferred)
*Real authentication and payment integration.*
*   [ ] **Sanctum auth** — register/login endpoints, token-based API auth
*   [ ] **LemonSqueezy webhooks** — payment status, subscription management
*   [ ] **`hero_previews` migration** — table schema typed, payment flow moved to Laravel
*   [ ] **RLS simplification** — application-layer auth replaces bypassed RLS

### M3: Cutover (Deferred)
*Next.js API routes retired. Laravel is sole backend.*
*   [ ] **Next.js API route removal** — all `app/api/*/route.ts` deleted or proxied
*   [ ] **`pp_projects` table retirement** — legacy table dropped after data migration verified
*   [ ] **`SUPABASE_SERVICE_ROLE_KEY` removal** — no longer needed by any runtime
*   [ ] **Full Laravel API** — all endpoints behind Sanctum auth, rate limiting, Sentry integration

---

## Generator 2.0: Design System & Recipe Engine (Current)
**Goal:** Replace hardcoded homepage assembly with data-driven token → recipe → section rendering.

### Gen 2.0 Phase 1: Design System Foundation (Complete)
*   [x] **Centralized Token API:** `getDesignTokens(brandMode, vertical)` resolver
*   [x] **4 Brand Modes:** playful, modern, minimal, bold — each with distinct radii, spacing, typography
*   [x] **Restaurant Vertical Tokens:** Backward-compatible bridge from legacy `restaurantThemeTokens.ts`
*   [x] **23 Unit Tests:** Full coverage for token resolution and brand mode differentiation

### Gen 2.0 Phase 2: Recipe System (Complete)
*   [x] **LayoutRecipe Interface:** Data-driven section definitions with background slots and config
*   [x] **RecipeSelector:** Picks best recipe based on vertical + brandMode + priority
*   [x] **SectionRenderer:** Maps section types to pattern functions
*   [x] **Restaurant Recipes:** Classic Bistro (playful) + Modern Dining (modern)
*   [x] **37 Unit Tests:** Recipe selection + section order validation

### Gen 2.0 Phase 4: Ecommerce Vertical (Complete)
*   [x] **Ecommerce Design Tokens:** `src/generator/design-system/verticals/ecommerce.ts`
*   [x] **Ecommerce Recipes:** Product Showcase (modern/bold) + Minimal Store (playful/minimal)
*   [x] **5 Section Patterns:** Hero, Category Grid, Featured Products, Trust Badges, Newsletter
*   [x] **Heavy Mode for Ecommerce:** `FORCE_HEAVY_FOR_ECOMMERCE` flag in orchestrator
*   [x] **WCAG AA Contrast Fix:** Safe token pairs for hero overlays and newsletter sections
*   [x] **Brand Style Expansion:** Added `bold` and `minimal` to `TT4BrandStyle` type
*   [x] **41 Unit Tests:** Ecommerce design tokens + section order validation

### Gen 2.0 Phase 5: SaaS/Service Vertical (Next)
*   [x] **SaaS Design Tokens:** `src/generator/design-system/verticals/saas.ts`
*   [x] **SaaS Recipes:** Feature-driven layouts with pricing tables, testimonials
*   [x] **SaaS Section Patterns:** Pricing grid, feature comparison, integration logos
*   [x] **Heavy Mode for SaaS:** Route SaaS verticals through recipe engine

---

## Ongoing: "Hard Gates" Maintenance
*   **Validator:** Continuously update `WP Theme Output Checker` skill.
*   **Forensics:** Log any new FSE errors to `attempt-recovery-forensics.md`.
*   [x] **Block Config Completeness (2026-02-23):** `BlockConfigValidator` checks required attributes per block before ZIP creation (see below).




## Phase 14: Generator 2.0 — Pattern Library & Verticals (Feb 2026)

> Branch: `001-generator-2-baseline`
> Spec: `/specs/001-generator-2-baseline/`

### Completed Tasks

| Task | Commit | Date |
|------|--------|------|
| Brand modes (modern, playful, bold, minimal) | — | Feb 2026 |
| Button contrast fixes (outline buttons, dark backgrounds) | `5b975b5` | Feb 12 |
| Security hardening (input sanitization, attack tests) | `01dbd32` | Feb 12 |
| Restaurant patterns (chef, gallery, menu, location) | `cf99574` + follow-ups | Feb 12 |
| SaaS vertical (8 patterns, 2 recipes) | `cc6ec85` | Feb 12 |
| Portfolio vertical (9 patterns, 3 recipes, Gallery nav) | `64214c4` | Feb 12 |
| Local Service vertical | — | Feb 12 |
| Ecommerce vertical | — | Feb 12 |
| Visual testing pipeline (Playwright) | `103ed7e` | Feb 12 |
| Agent docs (wp-fse-rules.md, AGENTS.md update) | `64214c4` | Feb 12 |

### In Progress

| Task | Status | Notes |
|------|--------|-------|
| Visual testing pipeline | ⏳ Planned | Playwright screenshots of generated themes |
| WordPress install verification | ⏳ Next | Test ZIPs in actual WordPress |
| CI integration | ⏳ Planned | GitHub Actions for visual tests |

### Verticals Status

| Vertical | Patterns | Recipes | Nav Special | Status |
|----------|----------|---------|-------------|--------|
| Restaurant | 12+ | classic-bistro, modern-dining | Menu | ✅ Complete |
| SaaS | 8 | startup-landing, enterprise-product | — | ✅ Complete |
| Portfolio/Talent | 9 | creative-professional, freelancer, talent-agency | Gallery | ✅ Complete |
| Local Service | 10 | home-services, professional-services, wellness-services | — | ✅ Complete |
| Ecommerce | 10 | boutique-store, product-showcase, artisan-shop | Shop | ✅ Complete |

### Security

- [x] Input sanitization (`sanitize.ts`)
- [x] Path traversal protection
- [x] PHP injection protection
- [x] Attack payload test suite
- [ ] CI security gate (GitHub Actions)
- [ ] Laravel subprocess argument escaping

### Brand Modes

All verticals support 4 brand modes:
- `modern` — Clean, professional
- `playful` — Friendly, rounded
- `bold` — High contrast, impactful
- `minimal` — Simple, whitespace-focused

---

## Phase 15: Production Polish (Planned)

- [ ] Visual testing pipeline (Playwright)
- [ ] Ecommerce vertical with WooCommerce
- [ ] Multi-language support (RTL for Arabic)
- [ ] CI security gate integration
- [ ] Performance optimization for 1000+ users

---

## Patch Note: 2026-02-23

- [x] **Block Config Validation system:**
  - New `BlockAttributeSchema.ts` — maps required/recommended attributes + valid values per block type
  - New `BlockConfigValidator.ts` — static validator class, two severity levels (CRITICAL blocks ZIP, WARNING logs only)
  - `PatternInjector.validateAndWrite()` — pre-file-write checkpoint logs issues before every HTML write
  - `bin/generate.ts` Step 2C — pre-ZIP gate scans ALL HTML files; ZIP blocked + exit(1) on CRITICAL issues
  - `{slug}-manifest.json` written alongside every ZIP documenting slot→value mapping
  - Critical blocks covered: `core/cover` (dimRatio), `core/template-part` (slug), `core/social-link` (service + url), `core/query` (queryId + query), `core/heading` (level), `core/embed` (url)

---

## Patch Note: 2026-02-21

- [x] **Testimonials block hardening (restaurant social proof):**
  - Removed duplicate avatar dimensions from inline `<img>` style in `src/generator/patterns/sections/social-proof.ts`.
  - Canonical output now keeps sizing in HTML attributes (`width="48" height="48"`) without inline width/height duplication.
- [x] **Bypass flow hero-layout reliability:**
  - Added hero-layout normalization in `app/api/generate/route.ts` for bypass checkout generation.
  - Mapped selected style into canonical hero enums (`fullBleed`, `fullWidth`, `split`, `minimal`) and injected into `studioInput.heroLayout`.
