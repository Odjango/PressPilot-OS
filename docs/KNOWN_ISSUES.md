# Known Issues & Future Work

## Current Issues (as of Feb 19, 2026)

### P1 - Hero Previews Capture Wrong Section
- **Status**: Preview images now render in UI (via `/api/previews/`), but content is wrong.
- **Symptom**: Screenshot shows "Our Story" / non-hero section instead of the selected hero layout.
- **Cause**: Hero selector logic in Playwright matches the wrong block.
- **Location**: `src/preview/HeroPreviewRunner.ts` (`captureHeroSection` selector order/criteria)
- **Fix needed**: Tighten selector strategy to target generated hero block only.

### P2 - Site Editor "Attempt Recovery" Errors
- **Status**: Fixed (Feb 20, 2026).
- **Resolution**:
  - Removed conflicting restaurant registration of `general-testimonials-columns.php`.
  - Added explicit restaurant/cafe cleanup of `patterns/general-testimonials-columns.php` in `PatternInjector`.
  - Restaurant/cafe testimonials now come from inline recipe-rendered social proof markup (`social-proof.ts`).

### P3 - HTML Encoding Bug (`&#39;`)
- **Status**: Fixed (Feb 20, 2026).
- **Resolution**:
  - Removed apostrophe HTML-entity conversion from sanitizer.
  - Kept PHP single-quoted string escaping as the single source of quote safety.
  - Eliminated double encoding (`'` -> `&#39;` -> `&amp;#39;`).

## Recently Resolved (Feb 19, 2026)

- ✅ Hero preview image serving path issue resolved with runtime preview API routing.
- ✅ End-to-end theme generation stable (multi-page outputs: Home, About, Services, Contact, Menu).
- ✅ Hero screenshot generation runs across 4 layouts with Playwright capture.
- ✅ Site Editor testimonial recovery issue fixed by removing static-vs-inline testimonial conflicts.
- ✅ Apostrophe rendering fixed for generated business names/content.

## Troubleshooting: "Attempt Recovery" Errors in Site Editor

**Symptom:** Blocks show "Block contains unexpected or invalid content" with "Attempt recovery" button.

**Common causes:**
1. Block comment JSON attributes don't match rendered HTML (for example, missing `is-layout-constrained` class).
2. Conflicting pattern files (static `.php` pattern vs inline recipe-rendered content).
3. Invalid nesting (styles on `wp:column` instead of nested `wp:group`).

**Diagnostic steps:**
1. Download generated theme ZIP.
2. Check `patterns/` for unexpected legacy files.
3. Compare `templates/front-page.html` block markup against WordPress block grammar expectations.
