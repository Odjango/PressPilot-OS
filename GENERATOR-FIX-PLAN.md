# PressPilot Generator Fix Plan — "Best in Industry" FSE Theme Engine

> **Author:** Senior Software Engineer (Architecture Review)
> **Date:** 2026-03-03
> **Scope:** Complete the generator to production-grade, industry-leading quality
> **Prerequisite reading:** `_memory/main.md`, `docs/AGENT_CONTEXT_MASTER.md`, `CLAUDE.md`

---

## Executive Summary

After a full architecture audit of the generator codebase, the core engine is mature: design tokens, recipe system, 5 verticals, 100+ content slots, multi-layer block validation, and 12 unit test files all work. Three systemic gaps prevent "best in industry" status:

1. **P5 production stall** — Users can't get their themes (DELIVER step hangs)
2. **No automated WordPress validation** — Playground integration is scaffolding only
3. **Technical debt** — 41 dead stub renderers, stale docs, unrebilt ZIP

This plan addresses all three in priority order across 4 phases.

---

## PHASE 1: Checkpoint & Hygiene (30 min) — ✅ COMPLETE (`f7d5069`)

**Goal:** Clean baseline before any code changes. Git commit everything from the Phase 0 audit.

### Task 1.1: Rebuild Gold Standard ZIP
- Rebuild `themes/gold-standard-restaurant.zip` from the fixed theme directory
- Verify the ZIP contains all files (style.css, theme.json, functions.php, index.php, templates/, parts/, patterns/, assets/fonts/)
- Verify no `ollie` references survive in the ZIP

### Task 1.2: Update Phase 0 Completion Summary
- Rewrite `PHASE-0-COMPLETION-SUMMARY.md` to reflect honest status:
  - Task 0.1 (Playground CLI install): ✅ Complete
  - Task 0.2 (Validation blueprint): ✅ Complete
  - Task 0.3 (Validation scripts): ⚠️ Scaffolding only — stubs, not functional
  - Task 0.4 (Validate all cores): ⚠️ Scaffolding only — HEALTH_MATRIX shows 0/6 (honest)
  - Task 0.5 (Gold standard theme): ✅ Complete — standalone, all assets, block markup valid

### Task 1.3: Clean Dead Code
- Remove the 41 Phase 2 stub renderers in `src/generator/recipes/renderer.ts` that return `''`
  - These are in `SECTION_RENDERERS` (Phase 2 legacy object)
  - Phase 3 `SECTION_RENDERERS_V2` has the real implementations
  - The Phase 2 object should ONLY contain the 6 renderers that are actually used (hero, story, menu-preview, promo-band, testimonials, final-cta)
  - OR remove `SECTION_RENDERERS` entirely if `renderSectionsWithRecipe()` only uses V2
  - **Decision rule:** grep for `SECTION_RENDERERS[` (without V2) — if nothing calls it except V2 fallback, remove it

### Task 1.4: Fix Known Data Issues
- Fix broken URL in `proven-cores/cores.json`: `"source": "https://github.com/g Theme/frost"` → correct GitHub URL
- Update `docs/KNOWN_ISSUES.md` to mark P1–P4 as resolved (currently stale, still shows them as open)

### Task 1.5: Git Commit
- Stage all changes from Phase 0 audit fixes + this cleanup
- Commit message: `chore: Phase 0 checkpoint — gold standard clean, dead code removed, docs updated`

**Verification:** `git status` clean, `npx tsc --noEmit` passes

---

## PHASE 2: P5 Diagnosis & Fix (Production Blocker) — ⏳ OPEN (requires server access)

**Goal:** Fix the generation stall at "Building Your Assets" so users can actually receive themes.

### Context
- Steps 1–4 of generation work (data input, hero preview, etc.)
- Step 5 (DELIVER) stalls indefinitely with "Building Your Assets" spinner
- This is a Laravel/Horizon queue issue, NOT a generator engine issue
- The generator CLI (`bin/generate.ts`) works fine standalone
- The issue is in the handoff: Laravel dispatches `GenerateThemeJob` → Horizon worker runs Node subprocess → output should upload to Supabase → signed URL returned to frontend

### Task 2.1: Locate Laravel Logs
- The container path `/app/storage/logs/laravel.log` returned "No such file or directory"
- Check Coolify log tab instead (Coolify captures container stdout/stderr)
- Alternative: `docker compose logs laravel-app` and `docker compose logs laravel-horizon`
- Find the actual log output path in the Docker/Coolify setup

### Task 2.2: Check Horizon Dashboard
- Access Horizon dashboard (usually at `{BACKEND_URL}/horizon`)
- Check for: failed jobs, pending jobs, stuck jobs
- Look at the `GenerateThemeJob` specifically — is it dispatched? Does it start? Where does it fail?
- Check Redis connection: `redis-cli ping` from within the Horizon container

### Task 2.3: Check Supabase Upload
- If the job runs but upload fails, check:
  - Supabase storage bucket `generated-themes` permissions
  - S3 filesystem driver configuration in Laravel `.env`
  - File size limits on the Supabase storage bucket
  - Network connectivity from Docker container to Supabase

### Task 2.4: Check Node Subprocess Execution
- Inside the Horizon container, manually run:
  ```bash
  echo '{"base":"flavor-starter","mode":"heavy","brandMode":"modern","slug":"test","outDir":"/tmp/test","data":{...}}' | npx tsx /app/generator/bin/generate.ts
  ```
- Verify the generator actually runs and produces output
- Check if Node/npx/tsx are available in the Horizon container

### Task 2.5: Fix Root Cause
- Based on diagnosis, fix the specific failure point
- Common causes:
  - Node not installed in Horizon container (Dockerfile missing Node 20 setup)
  - Generator payload not COPY'd into container (Horizon Dockerfile packaging issue — was fixed once in Feb 14 but may have regressed)
  - Supabase credentials missing or expired in `.env`
  - Redis connection timeout (Horizon can't pick up jobs)
  - Queue worker not running (supervisord config)

### Task 2.6: Verify E2E
- After fix, run a full generation through the Studio UI
- Confirm theme ZIP is downloadable
- Confirm no console errors in browser

**Verification:** Full E2E generation completes — user inputs business data → gets downloadable theme ZIP

---

## PHASE 3: Automated WordPress Validation Pipeline — ✅ COMPLETE (`437d1cb`)

**Goal:** Replace the validation scaffolding with real WordPress Playground integration. Every generated theme gets automatically validated against a live WordPress environment before the ZIP ships.

### Architecture Decision (UPDATED — original plan was wrong)

**Approach: `@wp-playground/cli` subprocess validation**

The original plan specified `@wp-playground/node` in-process validation — **that package does not exist**. The actual implementation uses `@wp-playground/cli` (v3.1.3, already in devDependencies) as a subprocess via `child_process.execFile`. This creates a temporary blueprint JSON, ZIPs the theme to a temp file, runs `npx @wp-playground/cli run-blueprint`, and parses stdout/stderr for errors.

See `AGENT-PROMPT-PHASE3-LEAN.md` for the corrected architecture spec that was actually implemented.

### Task 3.1: Install `@wp-playground/node`
```bash
npm install @wp-playground/node
```
- Add to `dependencies` (not devDependencies) — this will be used in the build pipeline

### Task 3.2: Implement `PlaygroundValidator`
Create `src/generator/validators/PlaygroundValidator.ts`:

```typescript
// Core interface
export interface PlaygroundValidationResult {
  valid: boolean;
  errors: PlaygroundError[];
  warnings: PlaygroundWarning[];
  screenshots?: { page: string; path: string }[];
}

export interface PlaygroundError {
  type: 'attempt-recovery' | 'block-error' | 'php-error' | 'js-error' | 'missing-template';
  message: string;
  template?: string;
  block?: string;
}
```

Implementation requirements:
1. Accept a theme directory path (not ZIP — validate before archiving)
2. Boot WordPress Playground with the theme installed and activated
3. Navigate to Site Editor
4. Check for "Attempt Recovery" banners (the #1 FSE failure mode)
5. Navigate to each template (index, front-page, page, single, 404)
6. Check for JavaScript console errors
7. Check for PHP fatal errors (white screen)
8. Return structured result with pass/fail per template
9. Optionally capture screenshots (for debugging, not blocking)

### Task 3.3: Wire into Generation Pipeline
In `bin/generate.ts`, add a new step between block validation and ZIP creation:

```
Step 2C: BlockConfigValidator (existing — static analysis)
Step 2D: PlaygroundValidator (NEW — live WordPress test)  ← ADD THIS
Step 3: Create ZIP (existing)
```

- If PlaygroundValidator returns `valid: false` with any errors of type `attempt-recovery` or `block-error`, the ZIP is NOT created and the process exits with code 1
- Warnings (PHP notices, missing optional templates) are logged but don't block
- This step should have a timeout (30 seconds max) — if Playground hangs, log warning and proceed (don't block generation on infra issues)

### Task 3.4: Replace Stub Scripts
- Rewrite `scripts/playground/validate-theme.js` to use PlaygroundValidator
- Rewrite `scripts/playground/validate-all-cores.js` to validate all 6 proven cores
- Update `proven-cores/HEALTH_MATRIX.md` with real results

### Task 3.5: Add npm Script
```json
{
  "scripts": {
    "validate:theme": "tsx scripts/playground/validate-theme.ts",
    "validate:all-cores": "tsx scripts/playground/validate-all-cores.ts",
    "validate:gold-standard": "tsx scripts/playground/validate-theme.ts -- themes/gold-standard-restaurant"
  }
}
```

### Task 3.6: Unit Tests
Add `tests/unit/playground-validator.test.ts`:
- Test with gold-standard-restaurant (should pass)
- Test with a deliberately broken theme (missing dimRatio on cover → should detect attempt-recovery)
- Test timeout behavior (Playground hang → graceful degradation)

**Verification:**
- `npm run validate:gold-standard` returns valid=true
- A broken test theme returns valid=false with specific error
- `npm run validate:all-cores` produces a real HEALTH_MATRIX (not all-pass, not all-fail — honest results)

---

## PHASE 4: Hardening & Documentation — ✅ COMPLETE (`b13e836`)

**Goal:** Final polish that puts this generator above anything else in the WordPress theme generation space.

### Task 4.1: Input Schema Validation
Create `src/generator/validators/InputValidator.ts`:
- Validate the JSON input to `bin/generate.ts` BEFORE any generation starts
- Check required fields: `base`, `mode`, `data.businessName`
- Validate data types: colors are valid hex, URLs are valid URLs
- Content length limits: businessName ≤ 100 chars, description ≤ 500 chars
- Return actionable error messages: "Missing required field: data.businessName"

### Task 4.2: Content Length Safety
In `ContentBuilder.ts`, add truncation with ellipsis for all slots:
- Headlines: max 80 characters
- Body text: max 300 characters per paragraph
- Business name: max 60 characters
- These prevent layout overflow in fixed-width block patterns

### Task 4.3: Accessibility Validation
Add to BlockConfigValidator or create `AccessibilityValidator.ts`:
- Every `core/image` must have a non-empty `alt` attribute
- Every `core/button` must have visible text content (not empty)
- Color contrast: verify primary text on background meets WCAG AA (4.5:1)
- Heading hierarchy: no skipped levels (h1 → h3 without h2)

### Task 4.4: Update All Documentation
- `PHASE-0-COMPLETION-SUMMARY.md`: Final honest status
- `docs/KNOWN_ISSUES.md`: P1–P5 all resolved
- `proven-cores/HEALTH_MATRIX.md`: Real validation results
- `_memory/main.md`: Update with Phase completion status
- `docs/AGENT_CONTEXT_MASTER.md`: Update current mission

### Task 4.5: Final Verification Suite
Run the complete test battery:
```bash
npx tsc --noEmit                    # Type check
npm run test                        # Unit tests
npm run validate:gold-standard      # Playground validation
npm run validate:all-cores          # All proven cores
npm run test:wp:smoke               # Playwright WordPress tests (if WP available)
```
All must pass. Any failure = not shipping.

### Task 4.6: Git Tag
- Commit all Phase 1–4 changes
- Tag: `v2.0.0-validated` — first version with full automated WordPress validation

**Verification:** All tests green, all validation passing, documentation accurate, git tag created.

---

---

## POST-PHASE 4: Hero Layout Rework (`a15c076`)

**Not in original plan — emerged from design review.**

### Changes
- **fullBleed hero:** Re-embedded transparent navigation inside Cover block (100vh). Intentionally reverses the Feb 21 P4 header separation. Visual quality (transparent nav overlay on hero image) outweighs sticky positioning.
- **fullWidth hero:** Converted from solid-color `wp:group` to `wp:cover` with background image + 70% overlay, 60vh height.
- **PatternInjector:** Conditionally skips `header` template-part when `heroLayout === 'fullBleed'`.
- **Hero preview mirror:** `heroPreviewInjector.ts` synced to match both fullBleed and fullWidth changes. New `HeroPreviewOptions` interface for passing businessName/pages/hasLogo.

### Remaining
- [ ] Test fresh fullBleed generation end-to-end
- [ ] Wire `HeroPreviewRunnerOptions` to pass businessName/pages/hasLogo through to injector (currently uses defaults)

---

## Success Criteria: "Best in Industry"

When this plan is complete, PressPilot's generator will have:

1. **Zero false positives** — Every generated theme is validated against a live WordPress environment before shipping. No "Attempt Recovery" errors reach users.
2. **Multi-layer validation** — Static analysis (BlockConfigValidator) + live testing (PlaygroundValidator) + structure checking (StructureValidator) + token enforcement (TokenValidator).
3. **Input protection** — Schema validation catches bad data before generation starts. Content length limits prevent layout overflow.
4. **Accessibility baseline** — Alt text, heading hierarchy, color contrast all checked automatically.
5. **Production pipeline working** — P5 resolved, E2E generation completes, users get their themes.
6. **Clean codebase** — No dead code, no stale docs, no dishonest status reports.
7. **Comprehensive test coverage** — Unit tests + Playground validation + WordPress smoke tests.

No other WordPress theme generator in the market has automated Playground validation as a build gate. That's the differentiator.

---

## Priority & Dependency Map

```
PHASE 1 (Checkpoint)     →  PHASE 2 (P5 Fix)     →  PHASE 3 (Validation)  →  PHASE 4 (Hardening)
  ├─ Rebuild ZIP              ├─ Find logs             ├─ Install pkg           ├─ Input validation
  ├─ Update docs              ├─ Check Horizon         ├─ PlaygroundValidator   ├─ Content limits
  ├─ Remove dead code         ├─ Check Supabase        ├─ Wire into pipeline    ├─ Accessibility
  ├─ Fix data issues          ├─ Test subprocess       ├─ Replace stubs         ├─ Final docs
  └─ Git commit               ├─ Fix root cause        ├─ npm scripts           ├─ Full test suite
                              └─ Verify E2E            └─ Unit tests            └─ Git tag v2.0.0
```

Phases 1→2→3→4 are sequential. Within each phase, tasks can be parallelized where noted.

---

## Estimated Timeline

| Phase | Duration | Depends On |
|-------|----------|-----------|
| Phase 1: Checkpoint | 30 min | Nothing (start immediately) |
| Phase 2: P5 Fix | 2–4 hours | Phase 1; access to Coolify/Docker |
| Phase 3: Validation | 4–6 hours | Phase 1; `@wp-playground/node` API docs |
| Phase 4: Hardening | 2–3 hours | Phase 3 |
| **Total** | **8–13 hours** | |

Note: Phase 2 requires server access (Coolify dashboard, Docker containers). If Omar doesn't have access in this session, skip to Phase 3 and come back to Phase 2 when server access is available.
