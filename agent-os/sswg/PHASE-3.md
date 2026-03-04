# PHASE 3: Frontend Integration & End-to-End

> **Duration:** 7-10 days | **Branch:** `feat/phase-3-frontend-integration`
> **Prerequisite:** Phase 2 merged. Assembly engine working end-to-end.
> **Goal:** Connect Next.js frontend to new engine. Full user flow from form to download.

---

## Task 3.1: Update Studio Page

**What:** Update the Studio form to send payload format expected by the new GenerationController.

**Steps:**
1. Review current `app/studio/page.tsx` form fields
2. Ensure all fields map to the new payload format (see GenerationController.resolvePayload)
3. Key fields: businessName, businessDescription, businessCategory, primaryLanguage, palette, fontProfile, heroLayout, contactInfo
4. Add tier selection (standard / agency) that determines image sourcing
5. Verify the generation flow: submit → loading state → poll status → show result

**Files modified:**
- `app/studio/page.tsx`
- Related API route files in `app/api/`

**Verification:**
- [ ] Fill out form with restaurant info → submit → generation starts
- [ ] Status polling works (shows progress)
- [ ] On completion: download link appears
- [ ] Downloaded theme passes Playground validation

---

## Task 3.2: Add Playground Preview Component

**What:** Embed a live WordPress Playground preview so users see their theme before downloading.

**Steps:**
1. Create `app/components/ThemePreview.tsx`
2. Use Playground's iframe embed API (`@wp-playground/client`)
3. After generation completes:
   a. Load Playground in an iframe
   b. Install the generated theme via Blueprint
   c. Navigate to front page
   d. User sees their actual theme live in the browser
4. Add navigation controls so user can browse between pages in the preview
5. Add "Download Theme" button below the preview

**Files created:**
- `app/components/ThemePreview.tsx`

**Verification:**
- [ ] After generation: preview loads within 15 seconds
- [ ] Shows the actual generated theme (not a generic WordPress install)
- [ ] User can navigate between pages in the preview
- [ ] "Download Theme" button works
- [ ] Preview works on mobile (responsive iframe)

**Note:** Playground preview runs entirely in the user's browser — no server resources consumed. This is a major feature for user confidence.

---

## Task 3.3: Image Tier Integration

**What:** Implement image sourcing tier logic in the frontend.

**Steps:**
1. Standard tier: add messaging "AI-generated images will be created for your site"
2. Agency tier: add Unsplash image picker component
   - Search interface for Unsplash
   - User selects hero image, about image, feature images
   - Selected image URLs are sent with the generation payload
3. Pass tier and image selections to the backend

**Files modified/created:**
- `app/studio/page.tsx` (tier selection)
- `app/components/UnsplashPicker.tsx` (new, for agency tier)

**Verification:**
- [ ] Standard tier: generates with AI images (or placeholders if AI unavailable)
- [ ] Agency tier: Unsplash picker appears, user can search and select images
- [ ] Selected Unsplash images appear in the generated theme
- [ ] Unsplash attribution is included per their API requirements

---

## Task 3.4: Error Handling & Retry Flow

**What:** Handle all failure cases gracefully.

**Steps:**
1. AI content generation fails → show "Content generation failed, retrying..." → retry up to 2x → show error message with retry button
2. Image generation fails → fall back to placeholder images → show notice "Using placeholder images — you can replace them later"
3. Playground validation fails → log error → retry assembly once with different pattern selection → if still fails, show "Generation encountered an issue, please try again"
4. Network errors → show retry button
5. Job timeout (>120 seconds) → show "Taking longer than expected..." message

**Files modified:**
- `app/studio/page.tsx` (error states)
- `backend/app/Jobs/GenerateThemeJob.php` (retry logic)

**Verification:**
- [ ] Simulate AI failure (mock 500 response) → user sees retry message
- [ ] Simulate image failure → theme generates with placeholder images
- [ ] Simulate network timeout → retry button appears
- [ ] No unhandled errors in browser console during normal flow
- [ ] No unhandled exceptions in Laravel logs during normal flow

---

## PHASE 3 CHECKPOINT

**Before moving to Phase 4, Omar must verify:**

1. ✅ Complete user journey: visit site → fill form → generate → preview → download
2. ✅ Works for 3+ different business types
3. ✅ Playground preview shows actual theme correctly
4. ✅ Downloaded .zip installs on a real WordPress site without errors
5. ✅ Error states show graceful messages (test by disconnecting network during generation)
6. ✅ Both Standard and Agency tiers work
7. ✅ All files committed and PR passes review

**After Omar approves → Merge PR → Begin [PHASE-4.md](PHASE-4.md)**
