# TASK 3.1 — Wire Studio Form to Laravel SSWG Pipeline

> **Copy-paste this entire prompt to your AI coding agent (Cursor, Codex, etc.)**
> **Date:** 2026-03-05
> **Phase:** SSWG Phase 3 — Frontend Integration
> **Branch:** Create `feat/phase-3-frontend-integration` from `main`

---

## CONTEXT

PressPilot's SSWG pipeline (Laravel) can generate WordPress themes end-to-end. It was tested successfully on 2026-03-05 (Luigi Pizza, 17s). The pipeline is deployed in Coolify.

The Next.js frontend currently has a working proxy system (`BACKEND_URL` feature flag) that can forward requests to Laravel. **The proxy code already exists and works.** The only thing needed is:

1. Set the `BACKEND_URL` env var in production so the proxy activates
2. Make small adjustments to ensure the payload the frontend sends matches what Laravel expects
3. Verify the polling and download flow works end-to-end

## WHAT ALREADY EXISTS (DO NOT REWRITE)

These files already have the proxy logic built in. **Do not rewrite them:**

- `lib/presspilot/backendApi.ts` — `proxyJsonToBackend()` function, `isBackendProxyEnabled()`, etc.
- `app/api/generate/route.ts` — Already calls `proxyJsonToBackend(request, '/generate', 'POST', body)` at line 91. If it returns a response, it short-circuits.
- `app/api/status/route.ts` — Already calls `proxyJsonToBackend(request, '/status?...', 'GET')` at line 19.
- `app/api/download/route.ts` — Already has proxy logic.
- `backend/app/Http/Controllers/GenerationController.php` — Laravel endpoints are complete and deployed.
- `backend/routes/api.php` — Routes exist: `POST /api/generate`, `GET /api/status`, `GET /api/download`.

## TASK: 3 CHANGES NEEDED

### Change 1: Set BACKEND_URL in production environment

**File:** The Next.js app's environment in Coolify (or `.env.local` for local dev)

Add this env var to the Next.js container in Coolify:

```
BACKEND_URL=http://laravel-app:8080
```

For local development, add to `.env.local`:
```
BACKEND_URL=http://localhost:8080
```

**Why:** This activates the proxy in `backendApi.ts`. Once set, all `/api/generate`, `/api/status`, and `/api/download` requests will be forwarded to Laravel instead of using the local Supabase-based handler.

**Verification:** After setting, the Next.js server logs should show the proxy forwarding requests. The old Supabase-based code path (demo user creation, direct DB inserts) will be completely bypassed.

### Change 2: Ensure StudioClient sends `input` field that Laravel can parse

**File:** `app/studio/StudioClient.tsx`

The `handleGenerate` function (line ~603) currently sends:

```typescript
body: JSON.stringify({
  variationId: selectedVariation.id,
  businessTypeId: variations.businessTypeId,
  styleVariation: variations.styleVariation,
  businessCategoryId: selectedBusinessCategoryId,
  wpImportPreset,
  input: studioInput(),
}),
```

Laravel's `GenerationController::resolvePayload()` only looks at `payload` and `input`. The extra fields (`variationId`, `businessTypeId`, `styleVariation`, `businessCategoryId`, `wpImportPreset`) are ignored by Laravel — they were for the old Node.js pipeline.

**The `input` field is already being sent**, and Laravel's `resolvePayload()` already knows how to convert it to the canonical SaaS payload format. So this mostly works already.

**However**, verify that `studioInput()` (defined in `StudioClient.tsx` around line ~530-600) includes these fields that Laravel's `resolvePayload()` expects:

| Field | StudioClient state var | Required by Laravel |
|-------|----------------------|-------------------|
| `businessName` | From `brief` or project name | YES — empty = 400 error |
| `businessDescription` | `brief` | YES — empty = 400 error |
| `businessCategory` | `selectedBusinessCategoryId` | YES (defaults to 'service') |
| `primaryLanguage` | hardcoded or from state | Optional (defaults to 'en') |
| `heroLayout` | `selectedHeroLayout` | Optional |
| `fontProfile` | `selectedFontProfile` | Optional |
| `brandStyle` | `selectedBrandStyle` | Optional |
| `palette` | From `customPaletteId` / logo colors | Optional |
| `contactEmail` | `contactEmail` | Optional |
| `contactPhone` | `contactPhone` | Optional |
| `menus` | `menus` (restaurant only) | Optional |

**Action:** Find the `studioInput()` callback (search for `const studioInput` in StudioClient.tsx). Verify it populates `businessName` and `businessDescription`. If `businessName` is missing or empty, add it — it can come from the project name (`project?.name`).

Look at the `studioInput` callback definition. It likely builds a `StudioFormInput` object. Make sure:

```typescript
// Ensure businessName is always populated
const input: StudioFormInput = {
  businessName: project?.name || brief.split('.')[0] || 'My Business',
  businessDescription: brief,
  businessCategory: selectedBusinessCategoryId || 'local_service',
  // ... rest of existing fields
};
```

### Change 3: Verify polling response format compatibility

**File:** `app/studio/StudioClient.tsx` (lines ~336-364)

The polling logic at Step 5 does:

```typescript
const data = await res.json();
setJobStatus(data.status);

if (data.status === "completed") {
  setArtifacts({
    themeUrl: data.themeUrl,
    staticUrl: data.staticUrl,
    slug: data.project_id
  });
}
```

Laravel's `/api/status` response (from `GenerationController::status()`) returns:

```json
{
  "id": "job-uuid",
  "project_id": "project-uuid",
  "status": "pending|completed|failed",
  "themeUrl": "signed-url-or-null",
  "staticUrl": "signed-url-or-null",
  "generated_theme": { ... }
}
```

**This is compatible.** The field names match (`status`, `themeUrl`, `staticUrl`, `project_id`). No changes needed to polling logic.

**One thing to verify:** Laravel uses these status strings:
- `pending` (job created, not yet picked up)
- `processing` (job running)
- `completed` (done, ZIP uploaded)
- `failed` (error)

The StudioClient checks for `"completed"` and `"failed"` — both match. The `"processing"` status will keep the polling loop running (since it's not completed or failed), which is correct behavior.

**IMPORTANT:** Laravel may return `"processing"` status (the old Node.js path didn't have this intermediate state). The current polling UI shows a spinner for anything that isn't completed/failed, so this works automatically.

## TESTING CHECKLIST

After making changes:

1. **Local test (if possible):**
   - Start Laravel backend locally (`docker compose up`)
   - Set `BACKEND_URL=http://localhost:8080` in `.env.local`
   - Start Next.js (`npm run dev`)
   - Fill out Studio form with: Name="Test Pizza", Description="A family pizza restaurant in Brooklyn", Category=Restaurant
   - Click Generate
   - Verify: Step 5 shows spinner → polls status → shows download link
   - Click download → verify ZIP downloads

2. **Production test:**
   - Set `BACKEND_URL=http://laravel-app:8080` in the Next.js Coolify environment
   - Redeploy Next.js
   - Visit presspilotapp.com → Studio → fill form → generate → verify download works

3. **Verify these Laravel logs appear (in Horizon container):**
   ```
   docker exec $(docker ps -qf "name=laravel-horizon") grep "job.dispatched" /app/storage/logs/laravel.log
   ```

## WHAT NOT TO DO

- Do NOT rewrite the proxy logic in `backendApi.ts` — it's done
- Do NOT rewrite the API routes — they already proxy when BACKEND_URL is set
- Do NOT create new API endpoints — everything needed exists
- Do NOT touch `GenerationController.php` — it's production-tested
- Do NOT remove the old Supabase-based code path from the API routes — keep it as fallback (when BACKEND_URL is not set, the old path still works)
- Do NOT add authentication/auth headers — M2 scope, not Phase 3

## FILES TO CHANGE (SUMMARY)

| File | Change | Size |
|------|--------|------|
| `.env.local` | Add `BACKEND_URL=http://localhost:8080` | 1 line |
| Coolify Next.js env | Add `BACKEND_URL=http://laravel-app:8080` | 1 line (manual in Coolify UI) |
| `app/studio/StudioClient.tsx` | Verify `studioInput()` includes `businessName` and `businessDescription` | ~5 lines if fix needed |

**That's it.** The heavy lifting was already done in M0/M1 when the proxy infrastructure was built, and in Phase 2/2.5 when the Laravel pipeline was completed. Task 3.1 is essentially "flip the switch."

---

## POST-TASK VERIFICATION

After the agent makes changes, Omar should verify:

1. The proxy is active: check Next.js server logs for `fetch(http://laravel-app:8080/api/generate, ...)`
2. Generation works: fill form → generate → get download link
3. The old path still works: if you unset `BACKEND_URL`, the Next.js Supabase path should still function (safety net)
4. Download link works: click the download button → ZIP file downloads → can be installed in WordPress
