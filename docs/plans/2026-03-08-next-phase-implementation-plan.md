# PressPilot OS — Next Phase Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.
> **Created:** 2026-03-08
> **Last Updated:** 2026-03-08 (Session E)
> **Context:** All SSWG Phase 0-3 code is committed and deployed. Session D UX fixes (commit `ec67554`) are pushed. This plan covers everything from post-deploy verification through launch readiness.
>
> **EXECUTION STATUS (Session E):**
> - Prerequisites: ✅ ALL DONE (redeploy, OPENAI_API_KEY, migration)
> - Phase A: ⏳ PENDING — Manual testing required (A1, A2, A3)
> - Phase B: B1 ⏸️ ON HOLD (bank account pending) | B2 ✅ | B3 ✅ | B4 ✅
> - Phase C: C1 ✅ | C2 ✅ (migration ran successfully after 4 fix iterations) | C3 ✅ | C4 ✅

---

## Prerequisites (Omar — manual steps before Claude starts)

1. **Redeploy via Coolify** — backend service → click Redeploy
2. **Add OPENAI_API_KEY** — In Coolify, add `OPENAI_API_KEY=sk-...` to both `laravel-app` AND `laravel-horizon` environment variables
3. **Run tier migration** — After deploy, SSH or exec into Laravel container:
   ```
   php artisan migrate
   ```
4. **Confirm deploy success** — Visit `presspilotapp.com` and verify the site loads

---

## Phase A: Verification & Stabilization (Do First)

### Task A1: Generate Test Theme & Verify Session D Fixes

**Goal:** Confirm all 5 UX fixes from commit `ec67554` work in production.

**Steps:**
1. Use the Studio UI to generate a new restaurant theme ("Luigi Pizza") WITH a logo uploaded
2. Download the generated ZIP
3. Extract and verify these 5 things:
   - `parts/header-transparent.html` exists with `textColor: base` on site-title and navigation
   - `templates/front-page.html` references `header-transparent` slug
   - `parts/footer.html` has logo (60px) + business name side-by-side, tagline below
   - `templates/page-about.html` (or equivalent inner pages) have 3+ sections each
   - Image tokens for team/chef resolve to portrait images (not food)
4. Open the ZIP in WordPress Site Editor — verify NO "Attempt Recovery" errors
5. Check all inner pages render with proper styling

**Verification method:** Visual inspection of generated theme files + WordPress Site Editor test.

**If any fix is broken:** Document which fix failed and open a targeted debugging session before continuing.

---

### Task A2: Multi-Vertical Smoke Test

**Goal:** Verify all 5 verticals generate valid themes.

**Steps:**
1. Generate one theme per vertical:
   - Restaurant: "Luigi Pizza" (with logo)
   - E-commerce: "Urban Threads" (no logo)
   - SaaS: "DataFlow Analytics" (with logo)
   - Portfolio: "Sarah Chen Photography" (no logo)
   - Local Service: "Bright Smile Dental" (with logo)
2. For each: download ZIP, check for block markup errors, verify inner pages have content
3. Log any failures with vertical name + error

**Success criteria:** 5/5 verticals generate without errors. All have proper headers, footers, inner page content.

---

### Task A3: Disable Debug Mode

**Files:** Coolify environment variables

**Steps:**
1. In Coolify env vars, set `APP_DEBUG=false`
2. Redeploy backend
3. Verify error pages show user-friendly messages (not stack traces)

---

## Phase B: Launch Blockers (Required for Public Launch)

### Task B1: LemonSqueezy Payment Integration

**Goal:** Replace placeholder payment button with real LemonSqueezy checkout.

**Files:**
- Modify: `app/studio/StudioClient.tsx` (payment gate at Step 5)
- Create: `app/api/webhooks/lemonsqueezy/route.ts` (webhook receiver)
- Modify: `backend/routes/api.php` (webhook endpoint)
- Create: `backend/app/Http/Controllers/WebhookController.php`

**Steps:**

1. **Create LemonSqueezy product** (Omar — manual):
   - Log into `lemonsqueezy.com`
   - Create product: "PressPilot Single Theme" — $29.99, one-time
   - Note the product variant ID and store ID
   - Set webhook URL to `https://presspilotapp.com/api/webhooks/lemonsqueezy`
   - Copy webhook signing secret

2. **Add env vars** (Omar — Coolify):
   ```
   LEMONSQUEEZY_API_KEY=...
   LEMONSQUEEZY_STORE_ID=...
   LEMONSQUEEZY_WEBHOOK_SECRET=...
   LEMONSQUEEZY_VARIANT_ID=...
   ```

3. **Frontend: LemonSqueezy JS overlay**
   - Install LemonSqueezy.js: add `<script src="https://app.lemonsqueezy.com/js/lemon.js" defer></script>` to layout
   - Replace the placeholder `window.open(...)` in payment gate with `LemonSqueezy.Url.Open(checkoutUrl)` overlay
   - Pass `checkout[custom][job_id]` as custom data so webhook knows which job to activate
   - On overlay close/success, call `handlePaymentSuccess()`

4. **Backend: Webhook receiver**
   ```php
   // POST /api/webhooks/lemonsqueezy
   // Verify signature using LEMONSQUEEZY_WEBHOOK_SECRET
   // On order_created event: extract custom.job_id
   // Dispatch UpgradeThemeImagesJob for that job
   // Mark project as paid
   ```

5. **Test:** Use LemonSqueezy test mode to simulate purchase → verify webhook fires → verify DALL-E upgrade triggers → verify download works

**Commit:** `feat: wire LemonSqueezy payment checkout with webhook for theme purchase`

---

### Task B2: Disable Dead Preview Button

**Goal:** Remove the "Generate Preview" button that calls the deleted `/api/studio/hero-previews` endpoint.

**Files:**
- Modify: `app/studio/StudioClient.tsx`

**Steps:**
1. Find the button or function that calls `/api/studio/hero-previews`
2. Remove it entirely (the endpoint was deleted with the old Node.js generator in commit `1577458`)
3. If the button is in Step 4, replace it with a static hero layout selection (the hero is already chosen by `heroLayout` field — just show the user their choice as confirmation)

**Commit:** `fix: remove dead hero preview button (endpoint deleted in 1577458)`

---

### Task B3: User Guide — Install Theme ZIP

**Goal:** Create a simple guide users see after downloading their theme.

**Files:**
- Create: `public/guides/install-theme.html` (or embed in Step 5 post-download)

**Content outline:**
1. Log into your WordPress admin (yourdomain.com/wp-admin)
2. Go to Appearance → Themes → Add New → Upload Theme
3. Choose the downloaded ZIP file → Install Now → Activate
4. Go to Appearance → Editor to customize your site
5. Troubleshooting: minimum WordPress 6.0, PHP 7.4

**Format:** Can be a downloadable PDF included in the ZIP, or an inline accordion in the Step 5 UI, or a separate page. Keep it simple — 1 page max.

**Commit:** `docs: add user guide for installing generated theme ZIP`

---

### Task B4: API Documentation

**Goal:** Document the public API for potential integrations.

**Files:**
- Create: `docs/API.md`

**Endpoints to document:**
- `POST /api/generate` — Start theme generation (params: name, logo, tagline, description, category, heroLayout, colorPrimary, colorSecondary, fontProfile)
- `GET /api/status?id={jobId}` — Check generation status (returns: status, themeUrl, staticUrl, images_upgraded)
- `POST /api/upgrade-images` — Trigger DALL-E image upgrade (params: jobId)
- `POST /api/webhooks/lemonsqueezy` — Payment webhook (internal)

**Format:** Standard REST API docs with request/response examples, error codes, rate limits.

**Commit:** `docs: add REST API documentation for theme generation endpoints`

---

## Phase C: Quality & Polish (Post-Launch or Parallel)

### Task C1: Node Worker Shutdown (M1 cleanup)

**Goal:** Remove the old Node.js worker process since Laravel handles all generation.

**Files:**
- Modify: Coolify/Docker configuration
- Modify: `package.json` (remove generation scripts)

**Steps:**
1. Verify no Next.js API routes still proxy to Node workers
2. Remove any `npm run generate` or worker scripts
3. Update Coolify to not start Node worker process
4. Keep Next.js frontend running (it's still the UI layer)

**Risk:** LOW — Node generator was deleted in commit `1577458`. Just need to stop the worker process.

**Commit:** `chore: shut down deprecated Node.js worker process`

---

### Task C2: `pp_projects` → `projects` Table Unification (M1 cleanup)

**Goal:** Consolidate the two project tables into one.

**Files:**
- Create: migration to merge data
- Modify: all code referencing `pp_projects`

**Steps:**
1. Audit which code reads from `pp_projects` vs `projects`
2. Create migration to copy any missing data from `pp_projects` to `projects`
3. Update all queries/models to use `projects` only
4. Add `pp_projects` deprecation (don't delete yet — keep as backup for 30 days)

**Risk:** MEDIUM — need to audit all references carefully.

**Commit:** `refactor: unify pp_projects and projects tables`

---

### Task C3: Marketing Screenshots

**Goal:** Generate polished theme screenshots for landing page.

**Steps:**
1. Generate 3 flagship themes (restaurant, SaaS, portfolio) with best possible inputs
2. Screenshot each at 1440px viewport width
3. Create before/after or multi-device mockups
4. Save to `public/marketing/` for landing page use

---

### Task C4: Landing Page Update

**Goal:** Update presspilotapp.com landing page with real generated theme examples.

**Files:**
- Modify: `app/page.tsx` or equivalent landing page

**Changes:**
- Replace placeholder screenshots with real generated theme screenshots
- Add "Generated in under 30 seconds" value prop
- Add pricing section ($29.99 one-time)
- Add "How It Works" 3-step section

---

## Task Order & Dependencies

```
PHASE A: Verification (DO FIRST — blocks everything)
  A1 (verify Session D) ──→ A2 (multi-vertical) ──→ A3 (disable debug)

PHASE B: Launch Blockers (after Phase A passes)
  B1 (LemonSqueezy) ───────┐
  B2 (dead preview button) ─┤ all independent, can parallelize
  B3 (user guide) ──────────┤
  B4 (API docs) ────────────┘

PHASE C: Post-Launch Polish
  C1 (Node shutdown) ──┐
  C2 (table unify) ────┤ can parallelize
  C3 (screenshots) ────┤
  C4 (landing page) ───┘ depends on C3
```

**Parallelizable groups for Claude Code agents:**
- Phase A: Sequential (each depends on previous)
- Phase B: B1 + B2 + B3 + B4 can all run in parallel (4 agents)
- Phase C: C1 + C2 + C3 can run in parallel; C4 after C3

---

## How to Use This Plan

**For Claude Code CLI:** Point Claude to this file:
```
Read docs/plans/2026-03-08-next-phase-implementation-plan.md and execute it using superpowers:executing-plans. Start with Phase A Task A1.
```

**For parallel execution:**
```
Read docs/plans/2026-03-08-next-phase-implementation-plan.md. Execute Phase B tasks B1, B2, B3, B4 in parallel using superpowers:dispatching-parallel-agents.
```
