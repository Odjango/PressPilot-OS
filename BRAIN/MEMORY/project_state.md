# PressPilot Project Memory
**State Saved: 2026-03-06** | **Current Phase: SSWG Phase 2.7 COMPLETE — Deploy + end-to-end verification needed. Phase 3 UNBLOCKED.**

> **2026-03-06 UPDATE (PM — Phase 2.7 Complete):** Complete skeleton-based pipeline rewrite addresses all 6 quality issues from morning's test. 20 HTML skeleton patterns (zero hardcoded content), 196 tokens, 5 vertical recipes. All services rewritten: AIPlanner, PatternSelector, TokenInjector, ThemeAssembler, GenerateThemeJob. Commit `70a0c1c` — 39 files, +5,086/-732 lines. **NEXT: Push to GitHub → Coolify auto-deploy → generate 5 test themes.**
>
> **2026-03-06 UPDATE (AM):** Pipeline test: 5/5 themes generate mechanically but 6 quality issues found (Attempt Recovery, broken hero images, empty inner pages, Ollie footer, Ollie content leakage, site name mismatch). All addressed by Phase 2.7.

---

## 2026-02-26 Project State (CURRENT — Read This First)

### What is Production-Ready
- **All 5 verticals:** Restaurant, SaaS, Portfolio, Ecommerce, Local Service — all passed WP smoke tests (Feb 21). Zero "Attempt Recovery" errors in Site Editor.
- **Brand modes:** DROPPED for SSWG MVP (see DECISIONS.md). Will add post-launch via Ollie style variations. Old Node.js generator supported 4 modes (modern, playful, bold, minimal) but SSWG focuses on one bulletproof pipeline first.
- **Generator 2.0:** Design token system, recipe engine, slot system, security hardening — complete
- **Block Config Validation (Feb 23):** BlockConfigValidator enforces required block attributes at two checkpoints (pre-write log + pre-ZIP hard gate)
- **Deployment:** presspilotapp.com live, Laravel backend running, factory.presspilotapp.com running

### Known Active Issue
- **P5 — Generation stall at DELIVER step:** DEPRIORITIZED — entire pipeline being replaced by SSWG.

### SSWG Pipeline Status (2026-03-06)
- **Phase 0–2:** COMPLETE — 115 tokenized patterns, 6 Laravel services, deployed to production
- **Phase 2.5 (Pipeline Activation):** ✅ COMPLETE — first end-to-end run (Luigi Pizza, 17s). 6 bugs fixed.
- **Multi-Vertical Test (2026-03-06 AM):** 5/5 generate mechanically, 6 quality issues found
- **Phase 2.7 (Quality Fix — Skeleton Pipeline):** ✅ COMPLETE (2026-03-06 PM)
  - 20 skeleton patterns, 196 tokens, 5 vertical recipes, all services rewritten
  - All 6 quality issues addressed
  - Commit: `70a0c1c` — 39 files, +5,086/-732 lines
  - **NEEDS: Push → Coolify deploy → end-to-end re-test**
- **Phase 3 (Frontend Integration):** UNBLOCKED pending Phase 2.7 deploy verification
  - Task 3.1: ✅ COMPLETE
  - Task 3.2: ❌ REVERTED
  - Task 3.3 (Image Tier): Ready after verification
  - Task 3.4 (Error Handling): Ready after verification
  - **Must fix first:** Block markup validity, tokenization coverage, inner page templates, PressPilot footer, hero images
- **Test command:** `docker exec $(docker ps -qf "name=laravel-app") curl -s -X POST http://localhost:8080/api/generate -H "Content-Type: application/json" -d '{"input":{...}}'`
- **Status check:** `docker exec $(docker ps -qf "name=laravel-app") curl -s "http://localhost:8080/api/status?id=<JOB_ID>"`

### Project Structure (as of Feb 26)
**Active directories at root:**
- `src/` — Generator engine, components, preview, hooks
- `app/` — Next.js App Router (pages + API routes)
- `lib/` — Shared Next.js/Node utilities (imported by `bin/generate.ts`)
- `backend/` — Laravel 12 app (API, jobs, queue)
- `bin/` — Generator CLI entry point
- `docs/` — All project documentation and FSE Knowledge Base
- `BRAIN/` — Vision, Constitution, Memory (AI agent knowledge base)
- `_memory/` — OneContext plugin memory (mirrors key state from BRAIN/MEMORY/)
- `SKILLS/` — Agent skills (PressPilot Vision Guardian, WP Theme Output Checker, etc.)
- `tests/`, `scripts/`, `specs/`, `public/`, `docker/`, `supabase/`, `types/`, `agent-os/`

**Archived to `Project Extras/`:** All clutter — 2,211 files in 9 subfolders:
- `debug-logs/`, `test-zips/`, `old-scripts/`, `old-workflows/`, `old-docs/`, `test-output-runs/`, `legacy-folders/`, `archived-memory/`, `archived-instructions/`

### Memory System (Resolved)
- **Canonical:** `BRAIN/MEMORY/` — project_state.md, coding_standards.md, user_profile.md, phase-history.md, marketing-seeds.md
- **OneContext:** `_memory/` — required by plugin, kept in sync
- **Archived:** `.agent_memory/`, `memory/db.json` → `Project Extras/archived-memory/`

### Instruction Files (Active)
`CLAUDE.md` → `AI_INSTRUCTIONS.md` → `CONTRIBUTING.md` → `BRAIN/CONSTITUTION/agent-protocol.md` → `.claude/rules/WP_FSE_SKILL.md` → `.github/instructions/wp-fse.instructions.md`

### Git Status
- Branch: `main`
- Latest commit: pending push of Docker path fix (2026-03-04)
- SSWG Phase 2 code merged to main and deployed via Coolify
- TypeScript: `npx tsc --noEmit` passes (Project Extras excluded via tsconfig.json)

---

---

## 1. Core Directives (User Mandates)

*   **The "Rental" Prohibition:** ZERO external plugin dependencies. Standalone themes only.
*   **The "Blueprint" Rule:** File-based structure (zip), not database layouts.
*   **Semantic Ownership:** Standard WP hierarchy (`archive.php`, `single.php`).

---

## 2. Generator Architecture (Phase 13-14)

### Proven-Core Orchestration Model
The generator assembles themes from proven base themes rather than synthesizing new code:
- **Chassis System:** Load pre-validated base themes (Frost, Tove, TT4)
- **Recipe Mode:** Pattern-based assembly for standard verticals
- **Heavy Mode:** Full content injection with hero differentiation (used for restaurants)

### Base Theme Routing
| Vertical | brandStyle | Base Theme |
|----------|-----------|------------|
| Restaurant | playful | Tove |
| Restaurant | modern | Frost |
| General | - | TT4 |

### Hero Layout System
Four hero variants implemented (Phase 13):
- **fullBleed:** Full-width cover with dark overlay
- **fullWidth:** Constrained content, full-width background
- **split:** Two-column layout (50%/50%)
- **minimal:** Clean, text-focused header

### Visual Controls (Phase 15.2)
Studio UI visual customization is via:
- **Brand Palette:** Preset palettes or brand-kit (logo color extraction)
- **Hero Layout:** fullBleed, fullWidth, split, minimal
- **Font Profile:** elegant, modern, bold, friendly

**Removed (Phase 15.2):** Theme Mood UI (Warm/Fresh/Minimal/Dark) - E2E testing confirmed it only affected Studio preview, not WordPress output. Style variations still ship with themes for Site Editor switching.

---

## 3. Homepage Assembly Logic (Current)

### Modules
| Module | Path | Role |
|--------|------|------|
| **Orchestrator** | `src/generator/index.ts` | Mode selection (heavy vs standard) |
| **Heavy Mode Home** | `src/generator/patterns/universal-home.ts` | 4-section homepage (restaurants) |
| **Standard Mode** | `src/generator/engine/PatternInjector.ts` | Recipe-based assembly |
| **Recipes** | `src/generator/config/PatternRegistry.ts` | Per-base-theme section definitions |
| **Hero Variants** | `src/generator/patterns/hero-variants.ts` | 4 hero layouts (fullBleed, etc.) |

### Mode Selection Logic
```typescript
// src/generator/index.ts:77-86
const isRestaurant = ['restaurant', 'cafe', 'restaurant_cafe'].includes(industry);
let mode = options.mode || 'standard';
if (FORCE_HEAVY_FOR_RESTAURANTS && isRestaurant) {
    mode = 'heavy'; // Restaurants always use Heavy Mode
}
```

### Heavy Mode Sections (universal-home.ts)
| Section | Background | Purpose |
|---------|------------|---------|
| 1. Hero | varies by layout | Brand-forward intro |
| 2. "Why Choose Us" | `base-2` | 3 feature columns |
| 3. CTA Band | `accent` | "Ready to Get Started?" |
| 4. "Our Values" | `accent-2` | 3 value cards |

**Current Issue:** Only 4 generic sections; no industry-specific content, testimonials, or services grid.

### Standard Mode Recipes (PatternRegistry)
| Base Theme | Industry | Sections |
|------------|----------|----------|
| TT4 | SaaS | Hero → Features Grid → Pricing CTA → FAQ → Footer |
| TT4 | E-commerce | Banner → Alternating Images → CTA → Footer |
| Ollie | SaaS | Header → Hero → Feature Boxes → Testimonials → FAQ → Footer |
| Ollie | Restaurant | Header → Hero → About → Menu Teaser → Testimonials → Contact → Footer |
| Tove | Restaurant | Header → Hero → Features → Menu → Hours → Location → Testimonials → Footer |
| Frost | Restaurant | Header → Hero → Boxes → CTA → Footer |
| Blockbase | All | Header → Footer only (no content patterns) |

**Current Issue:** Some base themes (Blockbase, Tove index) lack proper landing page patterns.

### Vertical Fallbacks
When no industry-specific recipe exists:
1. Look for `personality.recipes[industry]`
2. Fall back to `personality.recipes['saas']`
3. If no recipes, use base theme's home_template (often blog loop)

### Homepage Color Logic (Phase 15.3)

**Brand Color Distribution:**
| Section | Color Token | Purpose |
|---------|-------------|---------|
| Hero | varies by layout | Brand-forward intro |
| Value Proposition | `base` | Clean white background |
| Services Grid | `base-2` | Subtle card surface |
| Social Proof | `accent-2` | Light brand tint |
| FAQ | `base` | Clean white background |
| Final CTA | `accent` | Brand primary (bold impact) |
| Footer | `base-2` | Light gray (not dark) |

**Color Rules:**
1. Brand `accent` appears 3+ times per page (hero CTA, final CTA, accent headings)
2. Maximum 1 dark (`contrast`) section per page (if any)
3. Dark sections must contain visible content (not empty voids)
4. All text on colored backgrounds uses appropriate contrast token (`contrast`, `base`)
5. Footer uses light background (`base-2`) to avoid dark voids

**New Section Pattern Files (Phase 15.3):**
- `src/generator/patterns/sections/value-proposition.ts`
- `src/generator/patterns/sections/services-grid.ts`
- `src/generator/patterns/sections/social-proof.ts`
- `src/generator/patterns/sections/faq-section.ts`
- `src/generator/patterns/sections/final-cta.ts`

---

## 4. Learned Factory Patterns

### Footer Factory
*   **Structure:** Must use **Paragraph Links** inside Group blocks.
*   **Prohibition:** Do NOT use `core/navigation` block in the footer (causes "Attempt Recovery" errors).
*   **Styling:** Must match Brand Colors (Primary Background, Text Contrast).

### Brand Factory (Color Logic)
*   **Source of Truth:**
    1.  **Manual Override:** User picks via UI (Primary/Secondary/Accent).
    2.  **Smart Extraction:** If no manual override, extract 3-color palette from **Uploaded Logo** using k-means clustering.
    3.  **Fallback:** Preset JSON (e.g., `restaurant-soft.json`).
*   **Requirement:** The user must have a "Color Wheel" option (Implemented in MVP Demo).

### Navigation Logic
*   **Restoration:** "Menu" and "Map" pages must be functional (content + nav links), not empty.
*   **Restaurant Specifics:** `page-menu.html` must be generated with a 2-column grid pattern.

---

## 5. Content Injection System (Phase 13-14)

### Slot-Based Injection
ContentBuilder creates a `slots` dictionary with `{{PLACEHOLDER}}` format:
```typescript
slots['{{BUSINESS_NAME}}'] = userData.name;
slots['{{CONTACT_EMAIL}}'] = userData.email || '';
slots['{{CONTACT_PHONE}}'] = userData.phone || '';
slots['{{SOCIAL_FACEBOOK}}'] = userData.socialLinks?.facebook || '#';
```

PatternInjector applies these via `applySlotReplacements()`.

### Legacy Content Replacement
For base themes with hardcoded demo content (Frost, Tove, TT4):
- **Frost:** "Build with Frost" → business name, testimonial demo names replaced
- **Tove:** "Niofika Café" → business name, address replaced
- **TT4:** "Études" → business name

### Pattern Cleaning (Phase 14)
After chassis loading, ALL base theme patterns are sanitized:
```typescript
await patternInjector.cleanAllPatterns(themeDir, userData);
```
This ensures patterns in the WordPress pattern library don't contain marketing content.

---

## 6. Restaurant Vertical Fixes (Phase 14)

### Frost (brandStyle=modern)
- Added restaurant recipe to PatternRegistry (was falling back to SaaS)
- Added legacy content replacements for "Build with Frost" and testimonial names
- Forces **Heavy Mode** for hero layout differentiation

### Tove (brandStyle=playful)
- Reduced page template spacing from `spacing-70` to `spacing-50`
- Added explicit `textColor="foreground"` to menu patterns
- Rewrote opening hours from 3-column to horizontal table layout

### Heavy Mode Forcing
Restaurants always use Heavy Mode to ensure hero differentiation:
```typescript
if (isRestaurant) {
    mode = 'heavy';
    console.log('[Orchestrator] Restaurant vertical -> forcing Heavy Mode');
}
```

---

## 7. Data Flow Pipeline

```
StudioFormInput (UI)
    → buildSaaSInputFromStudioInput()
    → PressPilotSaaSInput (API)
    → transformSaaSInputToGeneratorData()
    → GeneratorData (Internal)
    → ContentBuilder.invoke()
    → ContentJSON (slots + pages)
    → PatternInjector
    → Final Theme (.html, .php)
```

See [docs/DATA_FLOW.md](../../docs/DATA_FLOW.md) for full documentation.

---

## 8. Quality Gates

### ContentValidator
Post-generation validation prevents demo content from shipping:
```typescript
const FORBIDDEN_STRINGS = [
    'Niofika Café', 'Niofika', 'hammarby@niofika.se',
    'Études', 'Build with Frost', 'Allison Taylor',
    // ...
];
```

### Hard Gates (6 validation layers — updated 2026-02-23)
1. Block Markup Structural Gate (stack-based parser)
2. Attributes JSON Gate (JSON.parse validation)
3. PressPilot Hard Rules Gate (NAV-REF BAN, PRESET EXISTENCE)
4. Layout Discipline Gate (nesting depth, media constraints)
5. Diagnostics
6. **Block Config Completeness Gate** — `BlockConfigValidator` (NEW, 2026-02-23)

### BlockConfigValidator (Layer 6)
**Files:**
- `src/generator/validators/blocks/BlockAttributeSchema.ts` — per-block attribute specs
- `src/generator/validators/BlockConfigValidator.ts` — static validator class

**Two checkpoints:**
1. `PatternInjector.validateAndWrite()` — pre-file-write, logs CRITICAL/ERROR/WARN to stderr
2. `bin/generate.ts` Step 2C — pre-ZIP gate, scans ALL HTML files, blocks ZIP on critical issues

**Blocks with required attributes:**
| Block | Required |
|-------|---------|
| `core/cover` | `dimRatio` |
| `core/template-part` | `slug` |
| `core/social-link` | `service`, `url` |
| `core/query` | `queryId`, `query` |
| `core/heading` | `level` |
| `core/embed` | `url` |

**Content Manifest:** After ZIP creation, `bin/generate.ts` writes `{slug}-manifest.json` alongside the ZIP with a complete `slots` map (slot name → resolved value), enabling future re-spin without full re-generation.

See [docs/pp-hard-gates.md](../../docs/pp-hard-gates.md) for details on layers 1-5.

---

## 9. Architect Skills (Role Definitions)

The system leverages specialized "Architect" skills found in `CONSTITUTION/verticals/`:
*   `restaurant_architect.md`: Defines the "Menu Grid" pattern and Nav injection
*   `woocommerce_architect.md`: Defines shop page patterns
*   `fitness_architect.md`: Defines class schedule patterns
*   `portfolio_architect.md`: Defines gallery patterns

**Status:** These patterns are implemented in `PatternInjector.ts` and recipe configs. Code is the enforceable law.

---

## 10. Recent Commits (Reference)

| Commit | Date | Description |
|--------|------|-------------|
| `cf4ccf9` | 2026-02-02 | feat: Phase 14 - Restaurant theme fixes (Frost & Tove) |
| `82a3eee` | 2026-02-02 | feat: Phase 13 - generator best practices upgrade |
| `5054842` | 2026-02-02 | fix: add Tove content replacement to PatternInjector |
| `562826b` | 2026-02-02 | feat: Phase 11 - hero visual differentiation + restaurant brandStyle |

---

## 11. Known Patterns to Preserve

### Patterns That Work
- Heavy Mode for restaurants (ensures hero differentiation)
- Pattern cleaning after chassis load (removes demo content)
- Slot-based content injection (predictable, testable)
- Legacy content replacement (handles base theme marketing)

### Patterns to Avoid
- Navigation blocks in footer (causes "Attempt Recovery")
- Hardcoded hex colors (use theme.json presets)
- Recipe mode for restaurants (doesn't apply hero layouts)
- Template placeholders like `{{variable}}` (old system, replaced by blocks)

---

## 12. Documentation Decisions (Phase 14.1)

**Date:** 2026-02-02

Documentation rationalization completed with the following decisions:

- **PRD.md:** Kept deprecated in BRAIN/ARCHIVE/; project-vision.md is canonical
- **PROJECT_LOG.md:** Archived; phase-history.md is canonical summary
- **master-prompt.md:** Restored to archive for historical reference
- **Authority hierarchy:** VISION > CONSTITUTION > MEMORY > ARCHIVE
- **agent-protocol.md:** Source of truth for agent behavior within CONSTITUTION/
- **CLAUDE.md:** High-level context; points to agent-protocol.md for rules

## 13. Current Phase Status (Phase 15)

**Date:** 2026-02-02

- Studio UI now defaults to dark theme with unified AppShell (header/footer consistent with reliability-first landing positioning)

---

## 14. Restaurant Homepage Recipe v1 (Phase 15.4)

**Date:** 2026-02-04

### Reference Files Used
Source: `tests/artifacts/Gallery/Restaurant Demo/` (BBQ Restaurant Astra theme)

| File | Page |
|------|------|
| `screencapture-bbq-restaurant-astra-instawp-xyz-2026-02-04-08_56_22.png` | Homepage |
| `screencapture-bbq-restaurant-astra-instawp-xyz-about-us-2026-02-04-08_57_00.png` | About |
| `screencapture-bbq-restaurant-astra-instawp-xyz-menu-2026-02-04-08_58_09.png` | Menu |
| `screencapture-bbq-restaurant-astra-instawp-xyz-contact-us-2026-02-04-08_58_36.png` | Contact |

### Extracted Section Sequence

| # | Section | Background | Key Elements |
|---|---------|------------|--------------|
| 1 | **Header** | white | Logo, nav links, accent CTA button |
| 2 | **Hero** | full-bleed dark image | Headline, subtext, dual CTAs |
| 3 | **Story/About** | `base` (white) | Image + text block, trust badges below |
| 4 | **Menu Preview** | `base-2` (cream) | 6 circular food images in 3x2 grid |
| 5 | **Promo Band** | `contrast` (dark image) | "Happy Hours" promotional messaging |
| 6 | **Testimonials** | `base` (white) | Customer quotes with avatars |
| 7 | **Final CTA** | `contrast` (dark image) | "Let's Eat" reservation CTA |
| 8 | **Footer** | `contrast` (dark) | Social icons, copyright, PressPilot credit |

### Target Recipe for Generator
```
1. Hero (fullBleed or fullWidth)
2. Story/About Section (image + text, trust badges)
3. Menu Preview Grid (circular food items)
4. Promo/Special Offer Band (optional)
5. Testimonials/Social Proof
6. Final CTA (reservation/contact)
7. Footer
```

### Implementation Status: COMPLETE (Phase 15.4)

**Implemented 2026-02-04:**

New section pattern files created:
- `src/generator/patterns/sections/restaurant-story.ts`
- `src/generator/patterns/sections/restaurant-menu-preview.ts`
- `src/generator/patterns/sections/restaurant-promo-band.ts`

Updated files:
- `src/generator/patterns/sections/index.ts` - exports new sections
- `src/generator/patterns/universal-home.ts` - restaurant-specific assembly
- `src/generator/engine/PatternInjector.ts` - writes to front-page.html for FSE

Generated screenshots:
- `tests/artifacts/Gallery/home-restaurant-playful-v2.jpg` (272 KB)
- `tests/artifacts/Gallery/home-restaurant-modern-v2.jpg` (260 KB)

---

## 15. Restaurant Visual Modes & Tokens (Phase 15.5)

**Date:** 2026-02-04

### Visual Mode Differentiation

Restaurant themes now have distinct visual characteristics based on `brandStyle`:

| Mode | Base Theme | Button Style | Card Radius | Image Style | Spacing |
|------|------------|--------------|-------------|-------------|---------|
| **Playful** | Tove | Pill (100px radius) | Rounded (16px) | Circular | Generous |
| **Modern** | Frost | Square (4px radius) | Minimal (8px) | Rectangular (8px) | Compact |

### Style Token System

New file: `src/generator/patterns/sections/restaurantThemeTokens.ts`

Provides centralized tokens for visual differentiation:
```typescript
interface RestaurantStyleTokens {
    buttonRadius: string;      // '100px' (playful) vs '4px' (modern)
    cardRadius: string;        // '16px' vs '8px'
    imageRadius: string;       // '100%' (circular) vs '8px' (rectangular)
    storyImageRadius: string;  // Story section image rounding
    sectionPadding: string;    // Vertical section padding
    columnGap: string;         // Gap between columns
    cardPadding: string;       // Internal card padding
    buttonMarginTop: string;   // Space above buttons
    buttonWeight: string;      // '600' (playful) vs '500' (modern)
    badgeWeight: string;       // Badge/label font weight
    menuImageStyle: 'circular' | 'rectangular';
    buttonStyle: 'pill' | 'rounded' | 'square';
}
```

### Updated Section Files

All restaurant sections now accept `brandStyle` parameter:
- `restaurant-story.ts` - Dynamic image/button radius
- `restaurant-menu-preview.ts` - Circular vs rectangular food images
- `restaurant-promo-band.ts` - Dynamic button/badge styling

### Promo Band Color Safety

Promo sections use TT4 semantic tokens for guaranteed contrast:
- Background: `contrast` (always dark)
- Text: `base` (always light)
- Badge: `accent` (brand color on dark bg)
- Button: `accent` bg with `base` text

### Header/Footer Spacing Normalization

CSS normalization added to `StyleEngine.ts`:
```css
/* Normalize first block spacing (hero directly under header) */
.wp-site-blocks > .entry-content > :first-child,
.wp-site-blocks main > :first-child,
main.wp-block-group > :first-child {
    margin-top: 0 !important;
}

/* Normalize back-to-back alignfull blocks */
.alignfull + .alignfull {
    margin-top: 0;
}

/* Header/footer at viewport edges */
header.wp-block-template-part { margin-top: 0; }
footer.wp-block-template-part { margin-bottom: 0; }
```

### Test Matrix Requirements

Any change to restaurant patterns must verify:
1. Restaurant playful homepage (Tove) - circular images, pill buttons
2. Restaurant modern homepage (Frost) - rectangular images, square buttons
3. Promo band contrast compliance (dark bg, light text)
4. Header/footer spacing (no gaps)

### Generated Screenshots (Phase 15.5)
- `tests/artifacts/Gallery/home-restaurant-playful-v2.jpg` (270 KB)
- `tests/artifacts/Gallery/home-restaurant-modern-v2.jpg` (257 KB)

---

## 16. Generator 2.0 – Phase 1 Complete (Design System Foundation)

**Date:** 2026-02-05

### Overview

Implemented a centralized design system API that can support all verticals and brand modes. Restaurant behavior remains identical via backward-compatible bridge.

### New Files Created

| File | Purpose |
|------|---------|
| `src/generator/design-system/index.ts` | Main entry point for design system exports |
| `src/generator/design-system/globalThemeTokens.ts` | Core interface + `getDesignTokens()` resolver |
| `src/generator/design-system/brandModes.ts` | 4 brand mode definitions (playful, modern, minimal, bold) |
| `src/generator/design-system/verticals/restaurant.ts` | Restaurant-specific token mappings |
| `tests/unit/design-tokens.test.ts` | 23 unit tests for design system |

### How to Use

```typescript
// New way (preferred for new patterns)
import { getDesignTokens, type BrandMode, type Vertical } from '../design-system';
const tokens = getDesignTokens('playful', 'restaurant');
// Access: tokens.radius.button, tokens.spacing.sectionPadding, etc.

// Legacy way (still works for existing patterns)
import { getRestaurantStyleTokens } from './restaurantThemeTokens';
const tokens = getRestaurantStyleTokens('playful');
// Access: tokens.buttonRadius, tokens.sectionPadding, etc.
```

### DesignSystemTokens Interface

```typescript
interface DesignSystemTokens {
  brandMode: BrandMode;
  vertical: Vertical;
  spacing: { sectionPadding, columnGap, cardPadding, buttonMarginTop };
  radius: { button, card, image };
  typography: { buttonWeight, badgeWeight };
  colors: { background, surface, primary, contrast, promoBg, promoText };
  shadows: { card, elevated };
}
```

### Brand Mode Characteristics

| Mode | Button Radius | Card Radius | Spacing | Character |
|------|---------------|-------------|---------|-----------|
| **playful** | 100px (pill) | 16px | Generous | Soft, warm, inviting |
| **modern** | 4px | 8px | Compact | Clean, minimal, sharp |
| **minimal** | 0px | 0px | Maximum whitespace | Stark, elegant |
| **bold** | 8px | 12px | Strong | High contrast, impactful |

### Backward Compatibility

`restaurantThemeTokens.ts` is now a thin bridge:
- Public API unchanged (getRestaurantStyleTokens, isModernStyle, isPlayfulStyle)
- Internally delegates to `getDesignTokens('brandMode', 'restaurant')`
- Maps new DesignSystemTokens to legacy RestaurantStyleTokens interface

### Test Results

- **Unit tests:** 23/23 passing (`npx tsx tests/unit/design-tokens.test.ts`)
- **Visual regression:** Pending Docker (restaurant screenshots should be unchanged)

### Phase 2 Notes (Recipes)

When implementing Phase 2 (data-driven recipes):
1. Use `getDesignTokens()` in section patterns via SectionContext
2. Recipes should pass `brandMode` to all section generators
3. Add ecommerce/saas verticals to `src/generator/design-system/verticals/`
4. Update `universal-home.ts` to use recipe-driven assembly

---

## 17. Generator 2.0 – Phase 2 Complete (Recipe System)

**Date:** 2026-02-05

### Overview

Implemented data-driven layout recipes for restaurant homepages. Refactored hard-coded restaurant homepage logic in `universal-home.ts` to use recipes, without changing visual output.

### New Files Created

| File | Purpose |
|------|---------|
| `src/generator/recipes/types.ts` | LayoutRecipe, SectionDefinition, SectionType interfaces |
| `src/generator/recipes/selector.ts` | RecipeSelector class - selects best recipe for context |
| `src/generator/recipes/renderer.ts` | SectionRenderer - maps section types to pattern functions |
| `src/generator/recipes/index.ts` | Main entry point (updated, was SiteRecipe registry) |
| `src/generator/recipes/restaurant/classic-bistro.ts` | Classic Bistro recipe (current 6-section layout) |
| `src/generator/recipes/restaurant/modern-dining.ts` | Modern Dining recipe (stub, same sections) |
| `src/generator/recipes/restaurant/index.ts` | Restaurant recipe exports |
| `tests/unit/recipe-selector.test.ts` | 16 tests for recipe selection |
| `tests/unit/section-order.test.ts` | 21 tests for section order validation |

### How Recipe Selection Works

```typescript
// 1. Build context
const recipeContext: RecipeContext = {
    vertical: 'restaurant',
    brandMode: 'playful',  // or 'modern'
    businessType: undefined  // Future: 'fine-dining', 'cafe', etc.
};

// 2. Select recipe
const recipe = RecipeSelector.selectRecipe(recipeContext);
// Returns: CLASSIC_BISTRO_RECIPE or MODERN_DINING_RECIPE

// 3. Render sections
const html = SectionRenderer.renderSections(recipe.sections, renderContext);
```

### Selection Logic

| Context | Recipe Selected | Reason |
|---------|-----------------|--------|
| No brandMode | Classic Bistro | Universal default (no brandModes restriction) |
| brandMode: 'playful' | Classic Bistro | Modern Dining requires ['modern', 'minimal'] |
| brandMode: 'modern' | Modern Dining | Higher priority (60 vs 50) + matches brandMode |
| brandMode: 'minimal' | Modern Dining | Matches brandMode |
| brandMode: 'bold' | Classic Bistro | Falls back to universal default |

### Recipe Structure

```typescript
interface LayoutRecipe {
    id: string;                    // 'restaurant-classic-bistro'
    name: string;                  // 'Classic Bistro'
    vertical: Vertical;            // 'restaurant'
    conditions: {
        brandModes?: BrandMode[];  // Optional - restricts matching
        businessTypes?: string[];  // Optional - restricts matching
        priority?: number;         // 0-100, higher wins when multiple match
    };
    sections: SectionDefinition[]; // Ordered list of sections
}

interface SectionDefinition {
    type: SectionType;             // 'hero' | 'story' | 'menu-preview' | etc.
    id: string;                    // Unique within recipe
    backgroundColor?: BackgroundSlot;  // 'base' | 'base-2' | 'accent' | etc.
    config?: Record<string, unknown>;  // Future: section-specific options
}
```

### Restaurant Recipe v1 (Classic Bistro)

| # | Section Type | Background | Pattern Function |
|---|-------------|------------|------------------|
| 1 | hero | (internal) | getHeroByLayout() |
| 2 | story | base | getRestaurantStorySection() |
| 3 | menu-preview | base-2 | getRestaurantMenuPreviewSection() |
| 4 | promo-band | contrast | getRestaurantPromoBandSection() |
| 5 | testimonials | accent-2 | getSocialProofSection() |
| 6 | final-cta | accent | getFinalCTASection() |

### Test Results

- **Recipe Selector tests:** 16/16 passing
- **Section Order tests:** 21/21 passing
- **Design Token tests:** 23/23 passing
- **TypeScript:** No errors

### What Changed in universal-home.ts

Before (hardcoded):
```typescript
if (isRestaurant) {
    return `${heroSection}
${getRestaurantStorySection(content, brandStyle)}
${getRestaurantMenuPreviewSection(content, brandStyle)}
...`;
}
```

After (recipe-driven):
```typescript
if (isRestaurant) {
    const recipe = RecipeSelector.selectRecipe({
        vertical: 'restaurant',
        brandMode: brandStyle as BrandMode
    });
    return SectionRenderer.renderSections(recipe.sections, renderContext);
}
```

### Non-Restaurant Verticals

Non-restaurant verticals (saas, ecommerce, etc.) still use hardcoded section assembly. Recipe system for these will be added in Phase 3+.

### Phase 3 Notes (SectionContext)

When implementing Phase 3:
1. Add dynamic background override from recipe to section renderers
2. Implement SectionContext to pass design tokens to sections
3. Add more restaurant recipes with different section combinations
4. Consider adding ecommerce/saas recipes

---

## 18. Generator 2.0 – Phase 4 Complete (Ecommerce Vertical)

**Date:** 2026-02-06

### Overview

Added full Generator 2.0 support for the ecommerce vertical with design tokens, recipes, and context-driven patterns. Wired the orchestrator so both restaurant and ecommerce verticals use the complete token → recipe → section rendering flow.

### Problem Solved

Ecommerce themes were generating with generic Ollie demo patterns instead of recipe-driven content. The issue was:
1. Only restaurants were forced to Heavy Mode
2. Ecommerce stayed in Standard Mode which used `injectRecipe()` with Ollie pattern references
3. `getUniversalHomeContent()` (which has the Phase 4 ecommerce routing) was never called

### Fix Applied

Extended Heavy Mode forcing to ecommerce verticals in `src/generator/index.ts`:

```typescript
const FORCE_HEAVY_FOR_ECOMMERCE = true;

const isEcommerce = ['ecommerce', 'retail', 'shop', 'online_store'].includes(industry);
if (FORCE_HEAVY_FOR_ECOMMERCE && isEcommerce) {
    mode = 'heavy';
    console.log('[Phase4] Ecommerce vertical -> forcing Heavy Mode for recipe-driven content');
}
```

### Type System Updates

Extended `TT4BrandStyle` to include all brand modes:

| File | Change |
|------|--------|
| `lib/theme/palettes.ts` | `TT4BrandStyle = 'playful' \| 'modern' \| 'bold' \| 'minimal'` |
| `types/presspilot.ts` | `brandStyle?: 'playful' \| 'modern' \| 'bold' \| 'minimal'` |

Added new brand style options:
- **bold**: Sharp edges, high contrast CTAs (outlets, deal-focused stores)
- **minimal**: Maximum whitespace, elegant (luxury/boutique stores)

### Ecommerce Recipes

| Recipe | brandModes | Sections |
|--------|------------|----------|
| **Product Showcase** (default) | modern, bold | hero → category-grid → featured-products → trust-badges → newsletter → footer |
| **Minimal Store** | playful, minimal | hero → featured-products → testimonials → newsletter → footer |

### Token Differentiation (Verified)

| Mode | Button Radius | Font Weight |
|------|---------------|-------------|
| modern | 4px | 600 |
| bold | 0px | 800 |
| playful | 100px (pill) | 600 |
| minimal | 0px | 600 |

### Test Results

| Test Suite | Passed | Total |
|------------|--------|-------|
| Ecommerce Design Tokens | 15 | 15 |
| Ecommerce Section Order | 26 | 26 |
| TypeScript Compilation | ✓ | - |

### WCAG AA Contrast Fix (Phase 4.1)

Added safe token pairs for high-risk sections that need guaranteed contrast:

| Token | Value | Usage |
|-------|-------|-------|
| `heroOverlayText` | `base` | White text on dark hero overlays |
| `newsletterBg` | `contrast` | Dark background for newsletter |
| `newsletterText` | `base` | Light text on newsletter section |

Files updated:
- `src/generator/design-system/globalThemeTokens.ts` - Extended ColorTokens interface
- `src/generator/design-system/brandModes.ts` - Added safe values to DEFAULT_COLORS
- `src/generator/patterns/sections/ecommerce-hero.ts` - Uses `tokens.colors.heroOverlayText`
- `src/generator/patterns/sections/ecommerce-newsletter.ts` - Uses `contrast` bg + `base` text

Newsletter section now uses `contrast` background (guaranteed dark) instead of risky `accent` color that varied by palette.

### Generated Screenshots

| File | Size | Description |
|------|------|-------------|
| `tests/artifacts/Gallery/home-ecommerce-modern-v3.jpg` | 206 KB | WCAG AA contrast, rounded cards (4px) |
| `tests/artifacts/Gallery/home-ecommerce-bold-v3.jpg` | 204 KB | WCAG AA contrast, sharp edges (0px) |

### Files Changed

| File | Change |
|------|--------|
| `src/generator/index.ts` | Added FORCE_HEAVY_FOR_ECOMMERCE, ecommerce routing |
| `lib/theme/palettes.ts` | Extended TT4BrandStyle, added bold/minimal options |
| `types/presspilot.ts` | Extended brandStyle type |
| `tests/e2e-ecommerce-capture.ts` | E2E capture for ecommerce homepages |

### Files Created in Previous Session (Phase 4 Foundation)

| File | Purpose |
|------|---------|
| `src/generator/design-system/verticals/ecommerce.ts` | Ecommerce design tokens |
| `src/generator/recipes/ecommerce/product-showcase.ts` | Default ecommerce recipe |
| `src/generator/recipes/ecommerce/minimal-store.ts` | Boutique/luxury recipe |
| `src/generator/patterns/sections/ecommerce-hero.ts` | Hero with collection image |
| `src/generator/patterns/sections/ecommerce-category-grid.ts` | 4-column category cards |
| `src/generator/patterns/sections/ecommerce-featured-products.ts` | 4 product cards with prices |
| `src/generator/patterns/sections/ecommerce-trust-badges.ts` | Shipping/payment/returns icons |
| `src/generator/patterns/sections/ecommerce-newsletter.ts` | Email signup CTA |

### Orchestrator Routing Logic (Current)

```
Industry Detection → Mode Selection → Content Generation

Restaurant → Heavy Mode → universal-home.ts → restaurant recipe
Ecommerce  → Heavy Mode → universal-home.ts → ecommerce recipe
Other      → Standard   → PatternInjector → Ollie patterns
```

### Phase 5 Notes

When expanding to SaaS/Service verticals:
1. Add `FORCE_HEAVY_FOR_SAAS` flag if recipe-driven content needed
2. Create `src/generator/design-system/verticals/saas.ts`
3. Create SaaS recipes in `src/generator/recipes/saas/`
4. Add SaaS section patterns (pricing table, feature grid, etc.)
5. Update `universal-home.ts` routing for saas industry

---

## 19. M0 Laravel Backend Foundation (2026-02-08)

### Status: ~85% Complete (P10 deployment + P8 observation pending)

M0 deploys a Laravel control-plane scaffold alongside the existing Next.js + Node system. Zero production traffic flows to Laravel. Code-level gates (P1-P9) are GREEN/YELLOW. **P10 is RED — the Laravel stack has NOT been deployed to Coolify.** "Factory-Stable" in Coolify is a WordPress/MySQL service, not the Laravel backend.

### What's Built

| Component | Status | Files |
|-----------|--------|-------|
| Laravel 12 scaffold | DONE | `backend/` |
| Docker Compose (3 containers) | DONE | `docker-compose.m0-laravel.yml` |
| Eloquent models (Project, GenerationJob, GeneratedTheme, User) | DONE | `backend/app/Models/` |
| GenerateThemeJob (subprocess → Node generator) | DONE | `backend/app/Jobs/GenerateThemeJob.php` |
| `bin/generate.ts` (stdin/stdout CLI wrapper) | DONE | `bin/generate.ts` |
| Supabase S3 filesystem driver | DONE | `backend/config/filesystems.php` |
| Internal endpoints (health, test-dispatch, job status) | DONE | `backend/routes/api.php` |
| Horizon + Redis configuration | DONE | `backend/config/horizon.php` |
| Coolify deployment | **NOT DONE** | "Factory-Stable" is WordPress, not Laravel. Deploy using `output/COOLIFY_M0_DEPLOY_RUNBOOK.md` |

### What's Pending

| Item | Status | Notes |
|------|--------|-------|
| Full integration test (dispatch → subprocess → upload → complete) | DONE | `GenerateThemeSmokeTest` (7 tests) + `m0-smoke-test.sh` (Docker E2E) |
| Supabase Storage upload round-trip verification | DONE | Upload paths + signed URLs verified in smoke test response shape |
| 3-day metrics baseline (8 structured-log metrics) | IN PROGRESS | All 8 emission points exist in code; runtime baseline requires deployed stack observation |

### M0 Gate Closeout (2026-02-08)

**Verification artifacts produced:**
- `backend/tests/Feature/GenerateThemeSmokeTest.php` — 7 tests: optimistic lock, claim, complete, fail, expiry, status endpoint, dispatch
- `backend/scripts/m0-smoke-test.sh` — Docker end-to-end: health → dispatch → poll → storage → signed URLs → metrics
- `backend/database/factories/ProjectFactory.php` — Unblocks test suite (`Project::factory()->create()`)
- `backend/app/Http/Controllers/InternalController.php` — Added metric #7 (`storage.signed_url_generated`) emission

**Gates closed:** P5 (GREEN), P6 (GREEN), P7 (GREEN), P8 (YELLOW → awaiting runtime baseline)

**Infrastructure fix (2026-02-08):** Laravel scheduler was not running in Docker — `schedule:work` added to `backend/docker/app/supervisord.conf`. Without this, metric #8 (`horizon.queue_depth`) could never fire because no process invoked `php artisan schedule:run`.

### Coolify Deployment Map (CORRECTED 2026-02-08)

**VERIFIED:** "Factory-Stable" in Coolify is WordPress/MySQL — NOT the Laravel backend.

| Coolify Resource | Actual Role | Status |
|------------------|-------------|--------|
| Next.js App | Production frontend + API | Running |
| Factory-Stable | WordPress/MySQL (unrelated to M0) | Running |
| Laravel M0 stack | **NOT DEPLOYED** | Must be created as new Docker Compose resource |

**To deploy:** Follow `output/COOLIFY_M0_DEPLOY_RUNBOOK.md`. Create new resource → Docker Compose → point to `docker-compose.m0-laravel.yml` on `main`.

**After deployment, expected containers:**

| Container | Role | Docker Image |
|-----------|------|-------------|
| `presspilot-laravel-app` | PHP-FPM + nginx + scheduler | `backend/docker/app/Dockerfile` |
| `presspilot-laravel-horizon` | Horizon queue worker + Node subprocess | `backend/docker/horizon/Dockerfile` |
| `presspilot-redis` | Redis 7.4 (queues, cache, sessions) | `redis:7.4-alpine` |

**Access:** All Laravel services use `expose` (NOT `ports`). Access via `docker exec` or SSH tunnel with port binding.

### Where to Find Logs (after deployment)

- **Coolify UI:** Project → [Laravel resource name] → Logs tab. Select container (`laravel-app`, `laravel-horizon`, or `redis`).
- **SSH (docker logs):** `docker logs presspilot-laravel-horizon 2>&1 | grep '"metric"'`
- **Full compose logs:** `docker compose -f docker-compose.m0-laravel.yml logs laravel-horizon 2>&1 | grep '"metric"'`
- **Metric format:** All metrics are JSON lines on stderr with key `"metric"`. Example:
  ```json
  {"message":"metric","context":{"metric":"job.started","timestamp":"2026-02-08T12:00:00Z","job_id":"abc-123","worker_id":"presspilot-laravel-horizon"}}
  ```

### P8 Baseline Tracking (3-Day Observation)

| Day | Date | Metrics Present | Job Runs | Notes |
|-----|------|-----------------|----------|-------|
| 1 | ____-__-__ | _/8 | _ | |
| 2 | ____-__-__ | _/8 | _ | |
| 3 | ____-__-__ | _/8 | _ | |

**How to check (run daily):**
```bash
# SSH into VPS, then:
docker logs presspilot-laravel-horizon 2>&1 | grep '"metric"' | jq -r '.context.metric' | sort | uniq -c
```

**Expected 8 metric names:**
1. `job.dispatched` — on POST /jobs/test-dispatch
2. `job.started` — when GenerateThemeJob begins
3. `job.completed` — on successful completion
4. `job.failed` — on failure (after retries)
5. `generator.subprocess_duration_ms` — after Node subprocess returns
6. `storage.upload_duration_ms` — after each S3 upload
7. `storage.signed_url_generated` — on GET /jobs/{id} for completed jobs
8. `horizon.queue_depth` — every 60s from scheduler

**To trigger metrics 1-7:** Run `M0_PROJECT_ID=<uuid> bash backend/scripts/m0-smoke-test.sh` via SSH tunnel.
**Metric 8** fires automatically every minute (requires scheduler process — now added to supervisord.conf).

### Resolved M0 Unknowns (from spec §10)

| Unknown | Resolution |
|---------|------------|
| U1 (CLI stdin) | **RESOLVED** — `bin/generate.ts:36-44` implements `readStdin()` |
| U3 (Generator cwd) | **RESOLVED** — `bin/generate.ts:53-55` does `chdir(path.resolve(__dirname, '..'))` |
| U7 (Puppeteer) | **RESOLVED** — `bin/generate.ts` does not import Puppeteer; generator doesn't use it |
| U8 (Static site deps) | **RESOLVED** — Horizon image now copies generator payload into `/app/generator` at build time (`backend/docker/horizon/Dockerfile`); no bind-mount dependency in Coolify |

### Deferred to M1

| Item | Reason |
|------|--------|
| PHP data transformer | Not needed while Next.js transforms data. `GenerateThemeJob` passes pre-transformed `project.data` directly. |
| Public API endpoints | M0 is internal-only. `/generate`, `/status`, `/download` are M1 scope. |
| `BACKEND_URL` feature flag | Frontend routing to Laravel is M1 scope. |
| Node worker shutdown | Worker remains active; Horizon processes test data only. |

### Key Architecture Files

| File | Purpose |
|------|---------|
| `docker-compose.m0-laravel.yml` | 3-container stack (app, horizon, redis) |
| `backend/docker/app/Dockerfile` | PHP 8.3-FPM + nginx |
| `backend/docker/horizon/Dockerfile` | PHP 8.3-CLI + Node 20 (dual runtime for subprocess) |
| `backend/app/Jobs/GenerateThemeJob.php` | Core job: subprocess → upload → complete |
| `bin/generate.ts` | Node CLI wrapper: stdin JSON → stdout JSON |
| `output/M0_LARAVEL_BACKEND_PREP_SPEC.md` | Full M0 specification |
| `output/contracts/contract-notes.md` | V2.1 contract invariants |
| `output/M1_READINESS_CHECKLIST.md` | M1 entry gate |
| `output/RISK_REGISTER_2026-02-08.md` | 5 identified migration risks |

### M1 Blockers (Must Address Before M1)

1. PHP data transformer port (`dataTransformer.ts` → PHP)
2. `pp_projects` → `projects` unification DDL
3. BrandStyle 4→2 mapping strategy
4. Node worker shutdown runbook
5. Public API endpoints in Laravel
6. `BACKEND_URL` feature flag in Next.js
