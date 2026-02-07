# PressPilot Project Memory
**State Saved: 2026-02-06** | **Current Phase: Generator 2.0 Phase 4 Complete**

> Generator 2.0 Phase 4 (Ecommerce Vertical & Orchestrator Wiring) complete. See Section 18 for details.

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

### Hard Gates (5 validation layers)
1. Block Markup Structural Gate (stack-based parser)
2. Attributes JSON Gate (JSON.parse validation)
3. PressPilot Hard Rules Gate (NAV-REF BAN, PRESET EXISTENCE)
4. Layout Discipline Gate (nesting depth, media constraints)
5. Diagnostics

See [docs/pp-hard-gates.md](../../docs/pp-hard-gates.md) for details.

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
