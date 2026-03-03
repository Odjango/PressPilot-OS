# Known Issues & Future Work

## Current Issues (as of Mar 3, 2026)

### P5 - Generation Stall at "Building Your Assets"
- **Status**: OPEN / UNDIAGNOSED
- **Symptom**: UI stalls indefinitely at Step 5 (DELIVER) with "Building Your Assets" spinner
- **Cause**: Unknown — requires Laravel/Horizon logs
- **Next Steps**:
  - Locate Laravel logs in Coolify (not `/app/storage/logs/`)
  - Check Horizon dashboard for failed/pending jobs
  - Verify Supabase upload stage

## Resolved Issues

### P1 - Hero Previews Capture Wrong Section
- **Status**: RESOLVED (Feb 21, 2026)
- **Fix Commit**: `6b35765`
- **Resolution**:
  - Added `.pp-hero-preview` marker class to all hero variants
  - Hero preview runner now prioritizes `.pp-hero-preview` selector

### P2 - Site Editor "Attempt Recovery" Errors (Testimonials)
- **Status**: RESOLVED (Feb 21, 2026)
- **Fix Commit**: `ce24dd4`
- **Resolution**:
  - Removed conflicting restaurant testimonial pattern
  - Cleaned testimonial markup (layout classes, width/height)
  - All 5 verticals passed WP smoke tests

### P3 - Apostrophe Encoding (`&#39;`)
- **Status**: RESOLVED (Feb 20, 2026)
- **Fix Commit**: `300992c`
- **Resolution**:
  - Removed apostrophe HTML-entity conversion from sanitizer
  - Fixed double-encoding bug (`'` → `&#39;` → `&amp;#39;`)

### P4 - Header Embedded Inside FullBleed Hero
- **Status**: RESOLVED (Feb 21, 2026)
- **Fix Commit**: `ce24dd4`
- **Resolution**:
  - Header is now always injected as a separate template part
  - Removed inline transparent header from fullBleed hero
  - FullBleed hero now truly starts at top of viewport

---

## Troubleshooting: "Attempt Recovery" Errors in Site Editor

**Symptom:** Blocks show "Block contains unexpected or invalid content" with "Attempt recovery" button.

**Common causes:**
1. Block comment JSON attributes don't match rendered HTML (missing layout classes)
2. Conflicting pattern files (static `.php` pattern vs inline recipe-rendered content)
3. Invalid nesting (styles on `wp:column` instead of nested `wp:group`)
4. Duplicate sizing on `core/image` markup (`style` + HTML width/height)

**Diagnostic steps:**
1. Download generated theme ZIP
2. Check `patterns/` for unexpected legacy files
3. Compare `templates/front-page.html` block markup against WordPress block grammar
