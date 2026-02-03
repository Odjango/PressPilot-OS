# PressPilot Phase History

> Consolidated development history from PROJECT_LOG.md and git commits.
> For detailed technical implementation, see the original [PROJECT_LOG.md](../../PROJECT_LOG.md).

---

## Phase 1: Static Export Fix
**Date:** January 12, 2026 | **Status:** Complete

**Problem:** Static site export had font mismatch - live preview used Mona Sans but static export showed fallback fonts.

**Solution:** Enhanced custom static exporter to include fonts:
- Added `copy_fonts()` method
- Added `@font-face` CSS declaration
- Font files copied to `/assets/fonts/`

**Files:** `factory-plugin/includes/class-static-exporter.php`

---

## Phase 2: 12 Layout System
**Date:** January 12, 2026 | **Status:** Complete

**Goal:** Expand from 4 layouts to 12 distinct visual styles.

**Layouts Created:**
| Layout | Hero Pattern | Style |
|--------|-------------|-------|
| modern | hero-centered | Bold colors, centered |
| classic | hero-split | Split layout, professional |
| minimal | hero-minimal | Dark hero, large typography |
| elegant | hero | Balanced, refined |
| bold | hero-bold | Large text, vibrant |
| corporate | hero-corporate | Trust badges, split |
| creative | hero-creative | Dark, asymmetric |
| startup | hero-gradient | Gradient backgrounds |
| agency | hero-agency | Portfolio style |
| local | hero-local | Contact-first |
| ecommerce | hero-product | Product-focused |
| restaurant | hero-food | Food imagery |

---

## Phase 3: Placeholder Image System
**Date:** January 12, 2026 | **Status:** Complete

**Goal:** Generate 5-6 contextual images per website based on business category.

**Sources:**
- Hero/About/Feature: Unsplash Source API
- Testimonial avatars: pravatar.cc

**Files:** `includes/class-image-provider.php`

---

## Phase 4: Category-Specific Logic
**Date:** January 12, 2026 | **Status:** Complete

**Goal:** Smart page generation based on business category.

**Categories:** restaurant, corporate, ecommerce, agency, startup, local, healthcare, realestate, fitness, education

**Files:** `includes/class-category-config.php`

---

## Phase 5: Color Contrast System
**Date:** January 12, 2026 | **Status:** Complete

**Goal:** Ensure WCAG AA compliance by auto-calculating readable text colors.

**Algorithm:** WCAG luminance calculation with threshold at 0.179

**Files:** `includes/class-color-utils.php`

---

## Phase 6: MVP Demo Factory Integration
**Date:** January 12, 2026 | **Status:** Complete

**Goal:** Connect MVP demo page to factory API.

**Changes:**
- Updated API endpoint from inventithere.com to factory.presspilotapp.com
- Updated auth header and request schema
- Added category mapping

---

## Phase 7: WordPress Block Validation Fix
**Date:** January 13, 2026 | **Status:** Complete

**Problem:** "Block contains unexpected or invalid content" errors with "Attempt Recovery" buttons.

**Root Cause:** Mismatch between block JSON attributes and inline HTML styles.

**Key Lesson:** Every inline `style` property MUST have a corresponding entry in the block comment JSON, plus the appropriate CSS class.

---

## Phase 8: Internal Generator Migration
**Date:** January 24, 2026 | **Status:** Complete

**Major Changes:**
1. Migrated to internal Node.js generator (removed N8N dependency)
2. Implemented 3-color "Trinity" system (k-means extraction from logo)
3. Triple-layout generation (Original, High Contrast, Inverted)
4. Removed unused dependencies (openai, colorthief, etc.)

**Result:** Deployment stable on 512MB/1GB VPS.

---

## Phase 9-12: Stabilization
**Date:** January 2026 | **Status:** Complete

Incremental fixes and improvements leading to Phase 13.

---

## Phase 13: Generator Best Practices Upgrade
**Date:** February 2, 2026 | **Status:** Complete

**Goals Achieved:**
1. **Contact Data Flow:** Wired Studio UI contact fields through full pipeline
2. **Hero Layout Differentiation:** Implemented fullBleed, fullWidth, split, minimal variants
3. **Restaurant brandStyle Routing:** playful → Tove, modern → Frost
4. **Content Validation:** Added ContentValidator to catch forbidden demo strings

**Key Commits:**
- `82a3eee` feat: Phase 13 - generator best practices upgrade
- `562826b` feat: Phase 11 - hero visual differentiation + restaurant brandStyle

---

## Phase 14: Restaurant Theme Fixes
**Date:** February 2, 2026 | **Status:** Complete

**Issues Resolved:**

| Issue | Theme | Fix |
|-------|-------|-----|
| "Build with Frost" promo blocks | Frost | Added restaurant recipe + legacy replacements |
| Testimonial demo names | Frost | Replace Allison Taylor etc. with neutral names |
| Split hero not rendering | Frost | Force Heavy Mode for restaurants |
| Excessive whitespace | Tove | Reduce spacing-70 to spacing-50 |
| Blue-on-blue contrast | Tove | Add textColor="foreground" |
| Narrow opening hours | Tove | Rewrite to horizontal table |

**Key Addition:** `cleanAllPatterns()` method to sanitize ALL base theme patterns after chassis loading.

**Key Commit:** `cf4ccf9` feat: Phase 14 - Restaurant theme fixes (Frost & Tove)

---

## Phase 15: Documentation & Marketing Prep
**Date:** February 2026 | **Status:** In Progress

**Goals:**
- [ ] User Guides: "Getting Started" docs
- [ ] Developer Docs: API documentation
- [ ] Marketing Assets: Screenshots of flagship themes
- [ ] Landing Page: "Generated in 90s" value prop

---

## Ongoing: Hard Gates Maintenance

**Continuous Tasks:**
- Update `WP Theme Output Checker` skill
- Log new FSE errors to forensics
- Maintain ContentValidator forbidden strings

---

## Server Information

**Production Server:** https://factory.presspilotapp.com (134.209.167.43)

**Test Command:**
```bash
curl -X POST https://factory.presspilotapp.com/wp-json/presspilot/v1/generate \
  -H "Content-Type: application/json" \
  -H "X-PressPilot-Key: pp_factory_2026_..." \
  -d '{"businessName":"Test","category":"restaurant"}'
```

---

*Last Updated: February 2, 2026*
