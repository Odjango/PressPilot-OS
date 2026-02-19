# Known Issues & Future Work

## Current Issues (as of Feb 19, 2026)

### P1 - Hero Previews Capture Wrong Section
- **Status**: Preview images now render in UI (via `/api/previews/`), but content is wrong.
- **Symptom**: Screenshot shows "Our Story" / non-hero section instead of the selected hero layout.
- **Cause**: Hero selector logic in Playwright matches the wrong block.
- **Location**: `src/preview/HeroPreviewRunner.ts` (`captureHeroSection` selector order/criteria)
- **Fix needed**: Tighten selector strategy to target generated hero block only.

### P2 - Site Editor "Attempt Recovery" Errors
- **Symptom**: WordPress Site Editor prompts "Attempt Recovery" on some generated pages.
- **Cause**: Invalid testimonial block markup.
- **Location**: testimonial block pattern generation/serialization
- **Fix needed**: Correct testimonial block structure and validate against WP block parser.

### P3 - HTML Encoding Bug (`&#39;`)
- **Symptom**: Apostrophes render as HTML entities (example: `Memo&#39;s Pizza`).
- **Cause**: Over-encoding/escaping in content pipeline before final pattern output.
- **Location**: content transformation and pattern injection path
- **Fix needed**: Ensure apostrophes are preserved as text in rendered block content.

## Recently Resolved (Feb 19, 2026)

- ✅ Hero preview image serving path issue resolved with runtime preview API routing.
- ✅ End-to-end theme generation stable (multi-page outputs: Home, About, Services, Contact, Menu).
- ✅ Hero screenshot generation runs across 4 layouts with Playwright capture.
