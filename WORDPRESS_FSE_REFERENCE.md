# WordPress FSE Knowledge Base

Comprehensive reference for building WordPress Full Site Editing (FSE) themes with ZERO validation errors. Organized by topic with actionable solutions and code examples.

**Purpose:** This knowledge base supports our programmatic theme generator, ensuring all generated themes are valid, accessible, and user-editable.

---

## Table of Contents
1. [Navigation & "Attempt Recovery" Errors](#1-navigation--attempt-recovery-errors)
2. [Cover Block Overlay Rules](#2-cover-block-overlay-rules)
3. [Block Validation Patterns to Avoid](#3-block-validation-patterns-to-avoid)
4. [Header Consistency Across Pages](#4-header-consistency-across-pages)
5. [Color Palette & Contrast Requirements](#5-color-palette--contrast-requirements)
6. [Programmatically Generated Theme Best Practices](#6-programmatically-generated-theme-best-practices)
7. [Google Fonts Loading Performance](#7-google-fonts-loading-performance)
8. [Automated Testing for FSE Themes](#8-automated-testing-for-fse-themes)
9. [Accessibility & WCAG Compliance](#9-accessibility--wcag-compliance)
10. [Template Locked InnerBlocks](#10-template-locked-innerblocks)
11. [Version-Specific Validation Changes (6.3-6.6)](#11-version-specific-validation-changes-63-66)
12. [Navigation Serialization Deep Dive](#12-navigation-serialization-deep-dive)
13. [WooCommerce FSE Integration](#13-woocommerce-fse-integration)
14. [theme.json Schema Validation](#14-themejson-schema-validation)
15. [Color Palette Generation from Brand Color](#15-color-palette-generation-from-brand-color)
16. [ContrastChecker Component & WCAG Calculations](#16-contrastchecker-component--wcag-calculations)
17. [Playwright E2E Testing for FSE Themes](#17-playwright-e2e-testing-for-fse-themes)
18. [PHPUnit Tests for FSE Compatibility](#18-phpunit-tests-for-fse-compatibility)
19. [WooCommerce theme.json Block Configuration](#19-woocommerce-themejson-block-configuration)
20. [Common theme.json Validation Errors & Fixes](#20-common-themejson-validation-errors--fixes)
21. [Future Research Topics](#21-future-research-topics)
22. [Competitor Analysis & Industry Patterns](#22-competitor-analysis--industry-patterns)
23. [QuickWP Architecture Deep Dive](#23-quickwp-architecture-deep-dive)
24. [WP-Bench Official WordPress AI Benchmark](#24-wp-bench-official-wordpress-ai-benchmark)

---

## 1. Navigation & "Attempt Recovery" Errors

### Problem
Navigation blocks with embedded `navigation-link` children cause validation errors: "Block contains invalid or unexpected content."

### Why Navigation Blocks Are Fragile
- `core/navigation` stores structure via nested `core/navigation-link` inner blocks
- Even small markup changes or outdated serialized content cause validation errors
- Schema changes between WordPress versions break serialized content
- Issues persist when navigation is locked or embedded in template parts
- When using `templateLock="all"`, recovery cannot replace inner blocks

### Solution: Use Paragraph Links

Replace navigation blocks with simple Paragraph blocks containing links:

```html
<!-- wp:group {"layout":{"type":"flex","flexWrap":"nowrap","justifyContent":"center"}} -->
<div class="wp-block-group">
  <!-- wp:paragraph {"fontSize":"medium"} -->
  <p class="has-medium-font-size"><a href="/">Home</a></p>
  <!-- /wp:paragraph -->
  
  <!-- wp:paragraph {"fontSize":"medium"} -->
  <p class="has-medium-font-size"><a href="/about">About</a></p>
  <!-- /wp:paragraph -->
  
  <!-- wp:paragraph {"fontSize":"medium"} -->
  <p class="has-medium-font-size"><a href="/contact">Contact</a></p>
  <!-- /wp:paragraph -->
</div>
<!-- /wp:group -->
```

**Trade-offs:**
| Loses | Gains |
|-------|-------|
| Responsive nav | Stability |
| Aria attributes | No validation errors |
| Menu syncing | Guaranteed FSE compatibility |

### If You Must Use Native Navigation
- Never use "Edit as HTML" on navigation blocks
- Create/edit menus only via Navigation block UI in Site Editor
- After WordPress updates, re-save any header/menu template parts that show errors
- Remove custom code that manipulates navigation markup directly
- Avoid copy-pasting navigation JSON between environments

**Sources:** wordpress.com, kadencewp.com, briancoords.com, github.com/WordPress/gutenberg

---

## 2. Cover Block Overlay Rules

### Problem
Using `overlayColor:"foreground"` or `"contrast"` resolves to user's brand color (could be light green on light image = unreadable white text).

### Solution
**ALWAYS use `overlayColor:"black"` for guaranteed dark overlay with white text.**

```html
<!-- wp:cover {"overlayColor":"black","dimRatio":70,"url":"image.jpg"} -->
<div class="wp-block-cover">
  <span class="wp-block-cover__background has-black-background-color has-background-dim-70 has-background-dim"></span>
  <img class="wp-block-cover__image-background" src="image.jpg" alt=""/>
  <div class="wp-block-cover__inner-container">
    <!-- Content with white text here -->
  </div>
</div>
<!-- /wp:cover -->
```

### Cover Block Structure Rules
| Scenario | JSON Requirement | HTML Requirement |
|----------|------------------|------------------|
| Cover HAS image | Must include `url` attribute | Must include `<img>` tag |
| Cover NO image | Must NOT include `url` | Must NOT include `<img>` tag |

### Never Use
- `overlayColor:"foreground"` - resolves to unpredictable brand color
- `overlayColor:"contrast"` - same issue
- Light overlay colors with white text

---

## 3. Block Validation Patterns to Avoid

### Why Blocks Break
Validation failures come from:
1. Attributes the block's `save` implementation doesn't support
2. Subtle serialization differences (whitespace, style object shapes)
3. Mixing legacy/new attribute shapes

### Known Problematic Patterns

| Pattern | Problem | Safe Alternative |
|---------|---------|------------------|
| `wp:list` with `textColor` | Unsupported attribute | Use `style.color.text` or parent container colors |
| `wp:separator` with `backgroundColor` | Schema mismatch after updates | Use `style.color` or theme.json presets |
| Complex margin objects on `wp:separator` | Exceeds expected style schema | Use single margin value or wrapper groups |
| Mixed legacy + new attributes | Fragile across updates | Use only current attribute model |

### Safer Authoring Strategies

1. **Generate patterns from the editor, not by hand**
   - Build layout in Site Editor first
   - Copy block markup from "Code editor" / "Copy all blocks"
   - Use that as reference schema for generators

2. **Favor theme.json over inline attributes**
   - Move colors, typography, spacing to theme.json
   - Patterns use presets, fewer inline attributes
   - Reduces schema mismatch risk

3. **Keep style objects simple**
   - Avoid deeply nested `style` objects
   - For complex spacing, use wrapper groups/rows/stack blocks

4. **Never "invent" attributes**
   - Only use attributes you've seen produced by the editor
   - If you can't produce it by clicking controls, don't hard-code it

5. **Validation workflow**
   - Insert each pattern into posts/pages/templates
   - Save, reload, confirm no validation notices
   - Check for hidden whitespace differences

**Source:** fullsiteediting.com/lessons/troubleshooting-block-themes/

---

## 4. Header Consistency & Fullbleed vs Fullwidth

### Fullbleed vs Fullwidth - CRITICAL DISTINCTION

| Term | Visual Effect | Header Position | Implementation |
|------|---------------|-----------------|----------------|
| **Fullwidth** | Hero spans full width but header is ABOVE | Header above hero | Header template part, then Cover block |
| **Fullbleed** | Hero extends to TOP of viewport, header overlays | Header INSIDE hero | Cover block contains inline header |

### Problem
Header colors change between fullbleed hero homepage (with Cover block overlay) and regular inner pages.

### Root Cause
Cover block overlay or per-block color settings override Global Styles.

### Solution: Centralize Colors in theme.json

**Core Principle:** WordPress FSE's Global Styles (`theme.json`) are the single source of truth for colors.

```json
{
  "settings": {
    "color": {
      "palette": [
        { "slug": "base", "color": "#ffffff" },
        { "slug": "contrast", "color": "#111111" },
        { "slug": "primary", "color": "#cc0000" }
      ]
    }
  },
  "styles": {
    "elements": {
      "link": {
        "color": { "text": "var(--wp--preset--color--contrast)" }
      }
    },
    "blocks": {
      "core/navigation": {
        "color": { "text": "var(--wp--preset--color--contrast)" },
        "elements": {
          "link": {
            ":hover": { "color": { "text": "var(--wp--preset--color--primary)" } }
          }
        }
      },
      "core/site-title": {
        "color": { "text": "var(--wp--preset--color--contrast)" }
      }
    }
  }
}
```

### Three Patterns for Header + Hero

| Pattern | Structure | Best For |
|---------|-----------|----------|
| **A: Header Above Hero** | Header template part ABOVE Cover block | Fullwidth layouts, split heroes, non-cover heroes |
| **B: Transparent Header Inside Cover** | Header embedded in Cover block's inner-container | TRUE Fullbleed (header overlays hero image) |
| **C: CSS Positioned Header** | Header with `position:absolute` | Advanced use cases only |

**PressPilot Implementation:**
- **Fullbleed heroes (restaurant/flavor):** Use Pattern B - header is inline INSIDE the Cover block
- **Non-fullbleed heroes:** Use Pattern A - header template part ABOVE the hero section
- This ensures fullbleed creates the immersive effect users expect

### Inline Transparent Header for Fullbleed

When embedding header INSIDE a Cover block:
- Header group has NO background color (transparent)
- Site title and nav links use `textColor:"white"`
- Cover block's dark overlay ensures white text is readable
- Header content is the FIRST element inside Cover's inner-container

```html
<!-- wp:cover {"overlayColor":"black","dimRatio":60,"minHeight":100,"minHeightUnit":"vh"} -->
<div class="wp-block-cover">
  <span class="wp-block-cover__background has-black-background-color"></span>
  <img class="wp-block-cover__image-background" src="hero.jpg"/>
  <div class="wp-block-cover__inner-container">
    <!-- INLINE HEADER (no background, white text) -->
    <!-- wp:group {"tagName":"header"} -->
    <header class="wp-block-group">
      <!-- Logo, site title, nav links with white text -->
    </header>
    <!-- /wp:group -->
    
    <!-- HERO CONTENT -->
    <!-- wp:heading {"textColor":"white"} -->
    <h1>Hero Headline</h1>
    <!-- /wp:heading -->
  </div>
</div>
<!-- /wp:cover -->
```

### Disable Custom Color Picker

Prevent editors from accidentally changing header colors:

```json
"settings": {
  "blocks": {
    "core/navigation": { "color": { "custom": false } },
    "core/site-title": { "color": { "custom": false } }
  }
}
```

**Sources:** fullsiteediting.com, rich.blog, olliewp.com

---

## 5. Color Palette & Contrast Requirements

### WCAG Contrast Basics
- **WCAG Level AA**: 4.5:1 for normal text, 3:1 for large text (18px+ regular or 14px+ bold)
- **UI Elements**: 3:1 minimum for non-text UI components

### Structuring theme.json Palettes

Use semantic naming:
- `base` - Background
- `contrast` - Foreground/text
- `primary` - Main brand color
- `secondary` - Supporting color
- `accent` - Highlight color

### Preventing Low-Contrast Combinations
- Light "primary" colors on light backgrounds → reserve for borders/accents only
- Disable arbitrary custom colors so editors use pre-vetted accessible palette
- Run all palette pairs through WCAG contrast checker before shipping

### Practical Hardening Steps
1. Test: `contrast` on `base`, `primary` on `base`, `contrast` on `primary`
2. Ensure buttons/badges hit at least 3:1 for non-text, 4.5:1 for text
3. Use tools: WebAIM Contrast Checker, AXE, WAVE

**Sources:** wordpress.com/blog/color-accessibility, developer.wordpress.org, nustart.solutions

---

## 6. Programmatically Generated Theme Best Practices

### Core Principle
Treat the Site Editor as the "source of truth" - generate what Gutenberg expects.

### 1. Start from Real Editor Output
- Prototype layouts in Site Editor first
- Export and inspect generated `templates/`, `parts/`, `theme.json`
- Use exported theme as reference schema for generators

### 2. Keep theme.json Semantic and Minimal
- Small semantic palette (`base`, `contrast`, `primary`)
- Derive programmatic variants (shades, tints) in pipeline
- Centralize typography, spacing, layout scales in `settings`

### 3. Generate Templates as Composable Building Blocks
- Model headers, footers, loops as composable template parts
- Assemble into `templates/*.html` according to site type
- Keep structural HTML predictable (main, header, footer, content)

### 4. Treat Patterns as a Reusable Library
- Maintain versioned block pattern library
- Generation picks and parametrizes existing patterns
- Each pattern validated in editor before programmatic use

### 5. Design for Validation and Backward Compatibility
- Build automated tests: activate theme, insert patterns, save, reload, check for errors
- When core changes serialization, update generators
- Keep "deprecated" variants where necessary

### 6. Respect Accessibility and SEO
- Enforce heading hierarchy (H1 in templates, H2+ in content)
- Maintain landmark structure (header/main/footer)
- Pre-vet color pairs against WCAG contrast rules

### 7. Make the Theme User-Editable
- Lean on Global Styles so users can restyle via Site Editor
- Expose "Style Variations" (alternate theme.json style objects)
- Avoid hard-coding every design choice in templates

**Sources:** fullsiteediting.com, gutenbergmarket.com, developer.wordpress.org

---

## 7. Google Fonts Loading Performance

### Best Practices

1. **Use theme.json and Font Library**
   - Register fonts in theme.json with local `src` files (`.woff2`)
   - Core handles enqueueing and editor/front-end usage automatically
   - Avoids extra remote Google Fonts requests

2. **Optimize What You Load**
   - Only include exact families and weights needed (e.g., 400, 700)
   - Reference semantic font presets (`body`, `heading`) to avoid extra loads
   - Prefer `.woff2` format for best compression

3. **Control Loading Behavior**
   - Use `font-display: swap` in `@font-face` rules
   - Reduces layout shifts and "flash of invisible text"
   - If using CDN: single optimized URL with `&display=swap`

### theme.json Font Registration Example

```json
{
  "settings": {
    "typography": {
      "fontFamilies": [
        {
          "fontFamily": "Inter, sans-serif",
          "slug": "inter",
          "fontFace": [
            {
              "fontFamily": "Inter",
              "fontWeight": "400",
              "fontStyle": "normal",
              "fontDisplay": "swap",
              "src": ["file:./assets/fonts/inter-regular.woff2"]
            },
            {
              "fontFamily": "Inter",
              "fontWeight": "700",
              "fontStyle": "normal",
              "fontDisplay": "swap",
              "src": ["file:./assets/fonts/inter-bold.woff2"]
            }
          ]
        }
      ]
    }
  }
}
```

### Generator Considerations
- Emit single, centralized `typography.fontFamilies` section
- Reuse handles across styles/blocks
- For brand variations, generate different style variations mapping to same minimal font set

**Sources:** wpengine.com, fullsiteediting.com, nitropack.io, kinsta.com

---

## 8. Automated Testing for FSE Themes

### Three Testing Layers

#### Layer 1: Static and Structural Checks
- Run official theme testing guidelines (coding standards, required files)
- Parse `theme.json`, `templates/*.html`, `parts/*.html` for valid JSON
- Verify required template parts exist (header, footer, index, 404)

#### Layer 2: Block Validity and Serialization Tests
- Activate generated theme
- Programmatically insert each template/pattern into posts
- Save, reload, verify no "unexpected or invalid content" errors
- Maintain unit tests for custom block save/render functions

#### Layer 3: E2E/Regression Tests
- Use browser automation (Playwright)
- Test flows: open Site Editor, switch templates, apply style variations, save
- Check front-end output for layout and navigation integrity
- Target high-risk areas: navigation, query loops, reused template parts

### CI Integration
- Wire tests into CI for every commit touching generator/theme definitions
- Run against WordPress/PHP matrix
- Block merges on failures
- Periodically extend matrix to newer WordPress versions

### Practical Additions
- Snapshot core pages and compare HTML across builds
- Add Lighthouse/AXE accessibility audits
- Monitor Core Web Vitals across pattern/template evolution

**Sources:** developer.wordpress.org, kinsta.com, linkedin.com, deployhq.com

---

## 9. Accessibility & WCAG Compliance

### Structural and Semantic Requirements
- Use headings in logical order (single H1 per page, then H2-H3 in patterns)
- Rely on real HTML landmarks: `<header>`, `<main>`, `<footer>`, `<nav>`
- Buttons/links use proper elements with meaningful text labels
- No icon-only or div clicks

### Color, Typography, and Media
- All text meets WCAG AA contrast (4.5:1 body, 3:1 large)
- Avoid low-contrast combinations in preset palettes
- Images have appropriate alt text (empty for decorative)

### Interaction and Keyboard Use
- Navigation/accordions/tabs operable via keyboard alone
- Correct focus order and visible focus styles
- Avoid complex multi-column patterns causing reading order issues
- Keep logical DOM order, use CSS for layout

### Testing Patterns for WCAG
1. **Automated**: Run AXE, WAVE, or editor accessibility checker plugins
2. **Manual WCAG 2.x AA reviews**:
   - Keyboard walkthrough
   - Screen-reader spot checks
   - Zoom/low-vision testing

**Sources:** make.wordpress.org, allaccessible.org, fullsiteediting.com, equalizedigital.com, w3.org

---

## 10. Template Locked InnerBlocks

### Problem
For template-locked InnerBlocks, "Attempt Recovery" often fails because the editor can't replace locked inner blocks.

### Why Recovery Fails with templateLock
- `templateLock="all"` or `"insert"` prevents structural changes to InnerBlocks
- Also blocks the automatic replacement step that recovery needs
- If block's `save` output changed, stored HTML won't match - but editor can't fix it

### Solutions

#### Editor-Side Strategies
1. Temporarily disable locking: change `templateLock` to `false`
2. Reload, use "Attempt recovery", re-save
3. Once blocks validate, re-enable `templateLock`
4. If recovery fails: use "Resolve → Convert to Blocks/HTML", recreate manually

#### Block-Code Strategies (Custom Blocks)
- When InnerBlock content invalidates, add a deprecated version matching old markup
- Lets Gutenberg map legacy content forward without errors
- Avoid changing InnerBlocks markup in breaking ways without deprecated definition

#### Template/Pattern Maintenance Workflow
- Test template parts in non-locked context first
- Confirm no validation errors
- Add `templateLock` only after markup is stable
- When updating locked template: unlock → update → save → re-lock

**Sources:** github.com/WordPress/gutenberg, wordpress.com, stackoverflow.com

---

## 11. Version-Specific Validation Changes (6.3-6.6)

Understanding what changed between WordPress versions helps prevent validation errors when generating themes.

### WordPress 6.3: Synced Patterns
- Reusable blocks renamed and re-modeled as "synced patterns"
- Changed how pattern references and internal IDs/metadata are stored
- Content assuming old reusable-block structure (`wp_block` posts) triggers validation errors
- **Risk:** Custom attributes or direct DB manipulation around patterns

### WordPress 6.4: Pattern Organization
- Refined pattern organization and Site Editor pattern handling
- Pattern categories and registration serialization changed
- Blocks depending on earlier pattern metadata became "unexpected/invalid"
- **Risk:** Themes generating pattern markup directly (instead of using editor export)

### WordPress 6.5: Block Bindings API
- Introduced `metadata.bindings` object for binding block attributes to custom fields
- Malformed `metadata` or `bindings` objects fail validation
- **Risk:** Wrong structure for `content` or `args.key`

**Example attribute shape for bound paragraph:**
```json
"metadata": {
  "bindings": {
    "content": {
      "source": "core/post-meta",
      "args": { "key": "my_custom_field" }
    }
  }
}
```

### WordPress 6.6: Pattern Overrides
- Extended `metadata.bindings` to synced pattern overrides
- Added `__default` bindings for Heading, Paragraph, Image, Button
- **Risk:** Partial or incorrect `metadata.bindings.__default` structures

**Example 6.6 pattern-override metadata:**
```json
"metadata": {
  "bindings": {
    "__default": { "source": "core/pattern-overrides" }
  },
  "name": "Hero title"
}
```

### CSS Specificity Changes (6.6)
- Global Styles now wrapped in `:root :where(...)` for lower specificity
- Doesn't change block attributes but exposes earlier CSS hacks
- Re-saving content can surface previously hidden validation errors

### Riskiest Attributes Summary
| Version | Risky Area | Avoid |
|---------|------------|-------|
| 6.3 | Pattern metadata | Old reusable-block model references |
| 6.4 | Pattern categories | Direct pattern markup manipulation |
| 6.5 | Block Bindings | Malformed `metadata.bindings` objects |
| 6.6 | Pattern overrides | Incorrect `__default` binding structures |

### Practical Approach
- Generate block markup via the editor for each target version
- Test on 6.3, 6.4, 6.5, and 6.6 instances
- Look for "unexpected/invalid content" blocks
- Inspect attribute JSON especially around patterns, navigation, layout, and `metadata.bindings`

**Sources:** kinsta.com, nerdpress.net, newspack.com, nomad.blog, fastcomet.com, developer.wordpress.org

---

## 12. Navigation Serialization Deep Dive

Detailed understanding of how navigation blocks serialize and why they break.

### How Navigation Serialization Works
- Navigation structure stored as `wp_navigation` custom post
- `core/navigation` block contains `ref` attribute pointing to navigation post
- Inner blocks for links and page lists
- Editor reconstructs block tree from stored attributes and HTML
- Mismatch = "This block contains unexpected or invalid content"

### What Changed Across Versions
- **6.2-6.3:** Centralized Navigation management screen introduced
- Clearer separation between menus (navigation posts) and rendering
- Changed how `ref` and inner structure are synchronized
- Editor UX changes (focus mode, unified menu management, pattern tweaks)
- More ways to edit navigation = higher risk of serialized HTML falling out of sync

### Typical Causes of "Attempt Recovery"

| Cause | Details |
|-------|---------|
| Manual HTML edits | Removing/rearranging wrappers, attributes, or `navigation-link` blocks |
| Copy-paste between sites | `ref` and inner blocks don't match registered menu |
| Plugin/theme code filters | Injecting extra attributes/inner blocks creates mismatch |
| WordPress updates | New implementation doesn't match stored content |

### Why Navigation Is Particularly Fragile
1. Separate post type (`wp_navigation`) as source of truth
2. Inner blocks nested in templates/patterns
3. Evolving editor UX and schema

Any inconsistency between these three layers across versions = validation/recovery prompts.

### Practical Mitigation
- **Avoid editing navigation markup in code or HTML view**
- Manage menus through Site Editor's navigation screens and UI
- After major upgrades, open key templates (headers, footers) in editor
- Let WordPress re-serialize navigation blocks, then re-save
- This aligns stored markup with current implementation

**Sources:** make.wordpress.org, kinsta.com, wpbeginner.com, wordpress.com, webnots.com, stackoverflow.com

---

## 13. WooCommerce FSE Integration

Best practices for integrating WooCommerce blocks with FSE themes.

### Core Principle
WooCommerce blocks should inherit from `theme.json` (colors, typography, spacing, layout). The theme should feel like one design system that happens to include shop blocks.

### Wire WooCommerce to theme.json

**Define a semantic design system:**
- Colors, typography, spacing, layout in `theme.json`
- Avoid hard-coding visuals in templates
- WooCommerce product/title/price/notice blocks automatically pick up global presets

**Use `styles.blocks` for minimal overrides:**
- Font size/weight for prices
- Accent colors for sale badges
- Button styles aligned with global `core/button` settings
- Not bespoke CSS

### Build Woo Templates from Blocks
- Create product archives, single product, cart, checkout as **block templates**
- Use WooCommerce blocks: Product Catalog, Product Details, Mini Cart, Cart, Checkout
- No custom PHP templates - let Site Editor control layout
- Woo blocks respond to `theme.json` automatically

### Reusable Patterns for WooCommerce
Keep Woo-specific template parts as reusable block patterns:
- Shop header
- Product loop header
- Upsell sections
- Easy to update, stay in sync across views

### Performance Best Practices
- Lean on FSE architecture (only blocks on page load their assets)
- Keep extra Woo CSS/JS minimal
- Avoid global WooCommerce CSS overrides
- Prefer Interactivity API and native blocks over jQuery widgets

### UX, Accessibility, and Conversion
- Patterns must respect global heading hierarchy, color contrast, focus styles
- Product cards, filters, checkout controls meet WCAG
- Provide opinionated but flexible defaults:
  - Add-to-cart buttons
  - Price emphasis
  - Badges, rating stars
- Use theme.json + Woo block style variations

### WooCommerce Integration Checklist
- [ ] One `theme.json` design system - Woo blocks inherit it
- [ ] All Woo templates are block-based (no custom PHP layouts)
- [ ] Minimal, scoped CSS for Woo blocks
- [ ] Patterns for product grids, hero + featured products, cart/checkout sidebars
- [ ] All patterns tested for accessibility and responsive behavior

**Sources:** blazecommerce.io, fullsiteediting.com, wpbeginner.com, crocoblock.com, kinsta.com, developer.woocommerce.com, gutenbergtimes.com

---

## 14. theme.json Schema Validation

How to validate theme.json programmatically before packaging theme ZIP.

### Use the Official Schema
WordPress publishes a JSON Schema for theme.json:

```json
"$schema": "https://schemas.wp.org/trunk/theme.json"
```

The schema defines:
- Allowed keys and types
- Which properties exist for a given WordPress version
- Catches typos, wrong types, unsupported sections

### Programmatic Validation Workflow

**Node/CI build workflow:**
1. Fetch or vendor the theme.json schema URL
2. Use JSON Schema validator (e.g., Ajv) to validate generated theme.json
3. Fail build if validation reports errors
4. Surface error path/message for correction

### Align Schema Version and theme.json Version
- Schema URL is versioned (e.g., `wp/6.5` vs `trunk`)
- Inside file, set `"version": 2` or `3` to match Global Styles API version
- Pick schema matching your minimum supported WordPress version
- Schema tells you which settings are allowed

### Extra Pre-ZIP Checks

Beyond strict schema validation:

| Check | Details |
|-------|---------|
| Preset references | Every `var(--wp--preset--color--X)` used has matching palette entry |
| Required keys | `settings`, `styles`, `customTemplates`, `templateParts` present |
| No duplicates | No conflicting definitions across style variations |

### Implementation Example

```javascript
import Ajv from 'ajv';
import schema from './theme-json-schema.json';

const ajv = new Ajv();
const validate = ajv.compile(schema);

function validateThemeJson(themeJson) {
  const valid = validate(themeJson);
  if (!valid) {
    console.error('theme.json validation errors:', validate.errors);
    throw new Error('Invalid theme.json');
  }
  return true;
}
```

**Sources:** developer.wordpress.org, wrmf.ca, wpfieldwork.com, kinsta.com

---

## 15. Color Palette Generation from Brand Color

How to generate accessible color palettes from a single brand color.

### Core Approach
1. Generate semantic system around brand color
2. Algorithmically derive tints/shades and neutral companions
3. Check every foreground/background pair against WCAG before writing to theme.json

### Step 1: Define Roles, Not Just Hex Values

| Role | Purpose |
|------|---------|
| `base` | Background |
| `contrast` | Foreground/text |
| `primary` | Brand accent |
| `muted` | Subtle background |
| `accent-strong` | Emphasis |
| `success/warning/error` | Status colors (if needed) |

Use semantic slugs so blocks rely on meaning, not hue.

### Step 2: Derive Palette from Brand Color

From the brand color:
- Generate **darker variant** for text on light brand backgrounds
- Generate **lighter variant** for backgrounds behind brand-colored text
- Keep hue and saturation close for cohesion
- Add near-black and near-white neutrals as universal anchors

### Step 3: Enforce WCAG Contrast

For each intended role pair, compute contrast:

| Pair | Minimum Ratio |
|------|---------------|
| Normal text | 4.5:1 |
| Large text (18px+) | 3:1 |
| Non-text UI | 3:1 |

**Programmatic checks:**
- Use same math as Color Safe or online contrast checkers
- Fail palette generation when candidate pair doesn't meet ratio
- No invalid combo reaches theme.json

### Step 4: Map Palette into theme.json

```json
{
  "settings": {
    "color": {
      "palette": [
        { "slug": "base", "color": "#ffffff", "name": "Base" },
        { "slug": "contrast", "color": "#111111", "name": "Contrast" },
        { "slug": "primary", "color": "#cc0000", "name": "Primary" },
        { "slug": "muted", "color": "#f5f5f5", "name": "Muted" }
      ]
    }
  }
}
```

- Reference consistently in `styles` and `styles.blocks`
- Editors choose between safe combinations
- Avoid unrestricted custom color picker for text/backgrounds

### Step 5: Test in Real Contexts

Some pairs that pass numerically still feel low-contrast:
- Body text, headings, buttons
- Alerts, cards, over images/overlays
- Small sizes or light weights

**Never rely on color alone:**
- Combine with icons, text labels, underlines for links
- Border styles for color-blind users

### Minimal Accessible Role Set

A practical set derived from one brand color:
1. Base background (light or dark, highly neutral)
2. Primary foreground (main text) with strong contrast to base
3. Brand primary with both light-on-brand and brand-on-light pairings meeting WCAG
4. Muted background for cards/sections plus matching text color

### Color Generation Algorithm (Pseudocode)

```javascript
function generatePalette(brandColor) {
  const hsl = hexToHSL(brandColor);
  
  return {
    base: '#ffffff',
    contrast: '#111111',
    primary: brandColor,
    primaryDark: adjustLightness(hsl, -20),
    primaryLight: adjustLightness(hsl, +30),
    muted: '#f5f5f5',
    mutedForeground: '#666666'
  };
}

function validateContrast(palette) {
  const pairs = [
    ['contrast', 'base'],
    ['contrast', 'primary'],
    ['base', 'primary'],
    ['contrast', 'muted']
  ];
  
  for (const [fg, bg] of pairs) {
    const ratio = calculateContrastRatio(palette[fg], palette[bg]);
    if (ratio < 4.5) {
      throw new Error(`Insufficient contrast: ${fg} on ${bg}`);
    }
  }
}
```

**Sources:** wordpress.com, developer.wordpress.org, kdesign.co, utiawpguide.tennessee.edu, wpaccessibility.day, colorsafe.co, creativethemes.com

---

## 16. ContrastChecker Component & WCAG Calculations

How WordPress block editor calculates and displays color contrast warnings.

### WCAG Algorithm
WordPress uses the standard WCAG 2.1 formula via its `ContrastChecker` component:

1. **Convert colors to sRGB linear RGB values**
2. **Compute relative luminance**: `L = 0.2126 × R + 0.7152 × G + 0.0722 × B`
3. **Calculate contrast ratio**: `(L_lighter + 0.05) / (L_darker + 0.05)`

### Thresholds

| Text Type | Minimum Ratio |
|-----------|---------------|
| Normal text | 4.5:1 |
| Large text (≥18px regular, ≥14px bold) | 3:1 |

### When Warnings Appear
- Triggers automatically in color picker UI for text/background and link/background combinations
- Shows notice like "Color contrast is not sufficient" with exact ratio (e.g., "2.3:1")
- Accounts for `fontSize` and `isLargeText` props for lenient thresholds
- No warning for AAA (7:1) failures - only AA

### Component Integration

```javascript
// ContrastChecker from @wordpress/block-editor
// Runs real-time in color panels
<ContrastChecker
  textColor={textColor}
  backgroundColor={backgroundColor}
  fontSize={fontSize}
/>
```

Renders styled notice only on failure, keeping UI clean when accessible.

### Practical Implications for Theme Authors
- Global Styles colors in theme.json get pre-checked during Site Editor saves
- Palette presets should already pass or users see warnings when deviating
- Custom blocks using `ColorPalette` or `ColorPicker` inherit checker automatically

**Sources:** github.com/WordPress/gutenberg, developer.wordpress.org, dev.to

---

## 17. Playwright E2E Testing for FSE Themes

Automated FSE theme validation in CI/CD using Playwright.

### Setup Dependencies

```bash
npm install --save-dev @playwright/test @wordpress/e2e-test-utils-playwright @wordpress/env @wordpress/scripts
```

### Core FSE Validation Tests

**1. Theme Activation & Site Editor Access**
```javascript
import { test, expect } from '@wordpress/e2e-test-utils-playwright';

test.describe('FSE Theme Validation', () => {
  test.beforeAll(async ({ requestUtils }) => {
    await requestUtils.activateTheme('your-generated-theme');
  });

  test('Site Editor loads without errors', async ({ admin, editor }) => {
    await admin.visitSiteEditor();
    await expect(editor.canvas.locator('.edit-site-visual-editor__editor-canvas')).toBeVisible();
  });
});
```

**2. Template Validation (No Recovery Prompts)**
```javascript
test('All templates load without recovery prompts', async ({ admin, editor }) => {
  await admin.visitSiteEditor({ path: '/wp_template/all' });
  
  // Check no "attempt recovery" notices
  await expect(editor.canvas.locator('[aria-label*="recovery"], [class*="is-invalid"]')).not.toBeVisible();
  
  // Test switching between key templates
  await editor.templatePart.switchTemplate('index');
  await expect(page.locator('.edit-site-visual-editor__editor-canvas')).toBeVisible();
});
```

**3. Pattern Insertion Test**
```javascript
test('Theme patterns insert without validation errors', async ({ admin, pageUtils }) => {
  const postId = await pageUtils.createPost();
  await admin.visitPostEditor(postId);
  
  await pageUtils.insertBlock('core/pattern');
  await expect(page.locator('.wp-block:not(.is-invalid)')).toBeVisible();
});
```

**4. Front-end Rendering with Screenshots**
```javascript
test('Front-end pages render correctly', async ({ page }) => {
  const pages = ['/', '/shop/', '/single-product/', '/cart/'];
  
  for (const url of pages) {
    await page.goto(url);
    await expect(page.locator('main')).toBeVisible();
    await expect(page).toHaveScreenshot(`${url.replace('/', '')}.png`);
  }
});
```

**5. Accessibility & Core Web Vitals**
```javascript
test('Meets basic accessibility standards', async ({ page, axe }) => {
  await page.goto('/');
  await axe.run(); // Requires @axe-core/playwright
  await expect(axe.getAllViolations()).toHaveLength(0);
});

test('Core Web Vitals pass', async ({ page }) => {
  await page.goto('/');
  const metrics = await page.metrics();
  expect(metrics.LargestContentfulPaint).toBeLessThan(2500);
});
```

### GitHub Actions CI/CD

```yaml
name: FSE Theme Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node
        uses: actions/setup-node@v4
        with: { node-version: 20 }
      - name: Install & Build Theme
        run: |
          npm ci
          npm run build:theme
      - name: Run Playwright Tests
        uses: wordpress-community/wordpress-playwright-action@v1
        with:
          plugins: ./your-generated-theme
      - name: Upload Screenshots
        uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: playwright-screenshots
          path: test-results/
```

### Key Assertions Checklist
- [ ] No recovery prompts: `expect(locator('[aria-label*="recovery"]')).not.toBeVisible()`
- [ ] Templates switch cleanly: index, page, single, archive, 404, search
- [ ] Global Styles apply: Verify theme.json colors/typography render
- [ ] Navigation works: Test menu rendering, mobile toggle
- [ ] Block patterns validate: Insert every registered pattern
- [ ] Front-end matches design: Screenshot diffs or CSS selector checks

**Sources:** developer.wordpress.org, pascalbirchler.com, advancedcustomfields.com

---

## 18. PHPUnit Tests for FSE Compatibility

PHPUnit tests for validating FSE theme compatibility across WordPress versions.

### Core Test Structure

```php
class FSEThemeTest extends WP_UnitTestCase {
    protected static $theme_slug = 'your-generated-theme';
    
    public function setUp(): void {
        parent::setUp();
        switch_theme( static::$theme_slug );
    }
    
    public function tearDown(): void {
        parent::tearDown();
        switch_theme( 'twentytwentyfour' ); // Reset
    }
}
```

### 1. theme.json Validation Tests

```php
public function test_theme_json_loads_without_errors() {
    $theme_json = WP_Theme_JSON_Resolver::get_theme_data();
    $this->assertInstanceOf( 'WP_Theme_JSON', $theme_json );
    
    $settings = $theme_json->get_settings();
    $this->assertArrayHasKey( 'color', $settings );
    $this->assertArrayHasKey( 'typography', $settings );
}

public function test_color_palette_contrast() {
    $theme_json = WP_Theme_JSON_Resolver::get_theme_data();
    $palette = $theme_json->get_raw( 'settings.color.palette' );
    
    foreach ( $palette as $color ) {
        $this->assertArrayHasKey( 'slug', $color );
        $this->assertArrayHasKey( 'color', $color );
        $this->assertRegExp( '/^#[0-9a-fA-F]{6}$/', $color['color'] );
    }
}
```

### 2. Template & Parts Validation

```php
public function test_all_templates_exist_and_parse() {
    $templates = get_block_templates();
    $required = [ 'index', 'page', 'single', 'archive', '404', 'search' ];
    
    foreach ( $required as $slug ) {
        $template = array_filter( $templates, function( $t ) use ( $slug ) {
            return strpos( $t->slug, $slug ) !== false;
        } );
        $this->assertNotEmpty( $template, "Missing template: {$slug}" );
    }
}

public function test_template_parts_load_without_validation_errors() {
    $parts = get_block_templates( [ 'template_type' => 'part' ] );
    
    foreach ( $parts as $part ) {
        if ( strpos( $part->theme, static::$theme_slug ) !== false ) {
            $content = $part->content_raw;
            parse_blocks( $content ); // Should not throw
            $this->assertTrue( true );
        }
    }
}
```

### 3. Block & Pattern Registration

```php
public function test_navigation_block_renders() {
    $content = '<!-- wp:navigation /-->';
    $blocks = parse_blocks( $content );
    $this->assertCount( 1, $blocks );
    
    $rendered = do_blocks( $content );
    $this->assertNotEmpty( $rendered );
    $this->assertStringNotContainsString( 'Attempt Block Recovery', $rendered );
}

public function test_patterns_register_correctly() {
    $patterns = WP_Block_Patterns_Registry::get_instance()->get_all_registered();
    foreach ( $patterns as $pattern ) {
        if ( strpos( $pattern['source'], static::$theme_slug ) !== false ) {
            $this->assertArrayHasKey( 'content', $pattern );
            $blocks = parse_blocks( $pattern['content'] );
            $this->assertNotEmpty( $blocks );
        }
    }
}
```

### 4. Version Compatibility Matrix

```php
/**
 * @dataProvider version_data_provider
 */
public function test_theme_json_parses_across_wp_versions( $wp_version ) {
    $theme_json = WP_Theme_JSON_Resolver::get_theme_data();
    $this->assertInstanceOf( 'WP_Theme_JSON', $theme_json );
}

public function version_data_provider() {
    return [
        'WP 6.3'  => [ '6.3' ],
        'WP 6.4'  => [ '6.4' ],
        'WP 6.5'  => [ '6.5' ],
        'WP 6.6+' => [ '6.6' ],
    ];
}
```

### GitHub Actions Matrix

```yaml
jobs:
  test:
    strategy:
      matrix:
        wp-version: [6.3, 6.4, 6.5, 6.6]
        php-version: [8.0, 8.1, 8.2]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: WordPress/wordpress-action@v1
        with:
          wordpress-version: ${{ matrix.wp-version }}
      - run: vendor/bin/phpunit --testsuite="FSE Theme Tests"
```

**Sources:** wpmudev.com, make.wordpress.org

---

## 19. WooCommerce theme.json Block Configuration

How to configure WooCommerce product blocks in theme.json.

### WooCommerce Block Namespaces

```
woocommerce/product-price
woocommerce/product-image
woocommerce/product-title
woocommerce/product-rating
woocommerce/product-button
woocommerce/product-badge
woocommerce/cart
woocommerce/checkout
woocommerce/all-products
woocommerce/product-best-sellers
```

### Settings Configuration

```json
{
  "version": 3,
  "settings": {
    "blocks": {
      "woocommerce/product-price": {
        "color": {
          "palette": [
            {"slug": "sale-price", "color": "#d63638", "name": "Sale Price"}
          ]
        }
      },
      "woocommerce/product-image": {
        "spacing": {"margin": true},
        "border": {"radius": true}
      }
    }
  }
}
```

### Styles Configuration

```json
{
  "styles": {
    "blocks": {
      "woocommerce/product-price": {
        "typography": {
          "fontSize": "var(--wp--preset--font-size--medium)",
          "fontWeight": "700"
        },
        "color": {"text": "var(--wp--preset--color--primary)"}
      },
      "woocommerce/product-title": {
        "typography": {
          "fontSize": "var(--wp--preset--font-size--large)",
          "fontWeight": "600"
        },
        "color": {"text": "var(--wp--preset--color--contrast)"}
      },
      "woocommerce/product-badge": {
        "color": {
          "background": "var(--wp--preset--color--primary)",
          "text": "var(--wp--preset--color--base)"
        },
        "border": {"radius": "3px"}
      },
      "woocommerce/product-button": {
        "color": {
          "background": "var(--wp--preset--color--primary)",
          "text": "var(--wp--preset--color--base)"
        }
      },
      "woocommerce/product-image": {
        "border": {"radius": "8px"}
      }
    }
  }
}
```

### Price Hierarchy (Sale vs Regular)

```json
"woocommerce/product-price": {
  "elements": {
    "del": {
      "typography": {
        "textDecoration": "line-through",
        "fontSize": "var(--wp--preset--font-size--small)"
      },
      "color": {"text": "var(--wp--preset--color--muted)"}
    },
    "ins": {
      "color": {"text": "var(--wp--preset--color--primary)"}
    }
  }
}
```

### Product Layout Consistency

```json
"woocommerce/all-products": {
  "spacing": {"blockGap": "var(--wp--preset--spacing--40)"}
},
"woocommerce/cart": {
  "typography": {"fontSize": "var(--wp--preset--font-size--medium)"}
},
"woocommerce/checkout": {
  "spacing": {"blockGap": "var(--wp--preset--spacing--30)"}
}
```

### Validation Workflow
1. Reference WooCommerce block slugs from their `block.json` files
2. Build in Site Editor first, copy exact block names from working layouts
3. Test contrast ratios for prices, badges, buttons against palette
4. Scope inheritance - let Woo buttons inherit `core/button` styles unless commerce-specific

**Sources:** developer.woocommerce.com, fullsiteediting.com

---

## 20. Common theme.json Validation Errors & Fixes

Common errors and how to fix them.

### 1. Syntax Errors (Most Common)

**Error**: Site Editor goes white  
**Causes**:
- Trailing commas after last array/object items
- Missing commas between properties
- Single quotes (`'`) instead of double quotes (`"`)
- Unclosed braces `{` or brackets `[`

```json
// ❌ Wrong - trailing comma
"palette": [
  {"slug": "primary", "color": "#000"},
]

// ✅ Correct
"palette": [
  {"slug": "primary", "color": "#000"}
]
```

**Fix**: Use JSON linter, run `jsonlint theme.json`

### 2. Version Mismatch

**Error**: Global Styles don't apply  
**Cause**: `"version": 3` on WP < 6.2, or vice versa

```json
{
  "version": 2,  // WP 5.9 - 6.1
  // or
  "version": 3   // WP 6.2+
}
```

### 3. Unsupported Properties

**Error**: Silent failure - styles don't apply  
**Cause**: Using properties not available in target WP version

```json
// ❌ Won't work pre-WP 6.1
"border": {"radius": "8px"}

// ❌ Fluid typography pre-WP 6.1  
"fontSize": "clamp(1rem, 4vw, 2rem)"
```

**Fix**: Check Theme Handbook for version support

### 4. Invalid Preset References

**Error**: CSS vars don't resolve  
**Cause**: Referencing non-existent palette slugs

```json
{
  "settings": {
    "color": {
      "palette": [
        {"slug": "primary", "color": "#d63638"}
      ]
    }
  },
  "styles": {
    "color": {
      "text": "var(--wp--preset--color--primary)"  // Must match slug
    }
  }
}
```

### 5. Duplicate Slugs

**Error**: Only first item applies  

```json
// ❌ Duplicate slugs
"palette": [
  {"slug": "primary", "color": "#d63638"},
  {"slug": "primary", "color": "#b32d00"}  // Ignored!
]
```

### 6. Invalid Color/Font Values

```json
// ❌ Invalid hex (too short)
{"slug": "primary", "color": "#d6363"}

// ✅ Correct
{"slug": "primary", "color": "#d63638"}
```

### 7. Layout Definition Errors

```json
// ❌ Missing orientation
"layout": {"type": "flex"}

// ✅ Correct
"layout": {"type": "flex", "orientation": "vertical"}
```

### Quick Validation Workflow
1. **Editor linter**: VSCode JSON + `$schema` reference
2. **CLI check**: `node -e "JSON.parse(require('fs').readFileSync('theme.json'))"`
3. **WP test**: Rename → create blank → gradually paste sections
4. **Schema validation**: Use `https://schemas.wp.org/trunk/theme.json`

### Emergency Recovery
If Site Editor breaks:
1. FTP → rename `/theme/theme.json` → `theme-broken.json`
2. Create minimal `theme.json`: `{}`
3. Gradually reintroduce sections, testing each save

**Sources:** seahawkmedia.com, jetpack.com, fullsiteediting.com, developer.wordpress.org

---

## 21. Future Research Topics

Captured from research suggestions for future investigation:

### Version-Specific Validation
- List block attributes added or deprecated in each WordPress version 6.3-6.6
- Which block attributes commonly trigger theme validation errors
- How do Block Bindings API changes affect validation between versions
- Show examples of invalid block comment markup that breaks validation
- How to detect attribute schema mismatches in theme.json and blocks metadata

### Navigation & Recovery
- Check if replaceBlock works with templateLock set to all
- Steps to reproduce Attempt Block Recovery failing in InnerBlocks
- Workaround to recover multiple broken InnerBlocks at once
- How templateLock affects innerBlocks validation in Gutenberg
- Debugging tips for replaceBlock promise failures
- Show differences in core/navigation markup between WP versions
- Which WP versions introduced navigation block serialization changes
- How synced patterns affect navigation block updates sitewide
- What triggers Attempt Recovery for navigation block in FSE
- How to debug block serialization mismatches in WordPress FSE

### Theme Development
- How to add theme.json to classic themes
- Steps to create block-based template parts
- Best practices for custom block styles in FSE
- Using Twenty Twenty Three as FSE base theme
- SEO techniques for FSE template structures

### WooCommerce Integration
- How to configure theme.json for WooCommerce blocks
- Best FSE themes for WooCommerce in 2025
- Steps to switch classic theme to FSE for WooCommerce
- Common pitfalls integrating WooCommerce with FSE
- Performance optimization for WooCommerce FSE themes

### theme.json Validation
- Where to find the official WordPress theme.json schema URL
- How to use AJV to validate theme.json against schema
- WordPress CLI command for theme.json validation
- Integrate theme.json validation into npm build script
- Common theme.json validation errors and fixes

### Color Palette Generation
- Generate WCAG-compliant light and dark variations from one brand color
- How to calculate contrast ratios for text and UI elements
- Tools to test color blindness friendliness for palettes
- Best ways to derive accessible neutral and accent colors
- How to update theme.json with multiple accessible palettes

### Fonts & Performance
- How to self-host Google Fonts in theme.json
- Best font-display settings for theme.json
- Limit Google Fonts variants in WordPress themes
- Use Create Block Theme plugin for fonts
- Optimize theme.json for Core Web Vitals

### Testing & CI/CD (Playwright)
- Set up Playwright tests for a WordPress FSE theme in GitHub Actions
- Configure @wordpress/e2e-test-utils-playwright for theme validation
- Run Playwright headless cross-browser tests for block themes
- Integrate theme.json schema checks into Playwright workflow
- Persist login state to skip authentication in CI Playwright tests

### Testing & CI/CD (PHPUnit)
- Which FSE theme features need cross-version unit tests
- How to mock WordPress core functions for FSE tests
- Examples of PHPUnit tests for block theme templates
- How to run tests across multiple WP versions with wp-env
- How to test theme.json changes with PHPUnit testsuite setup

### ContrastChecker & Accessibility
- Explain the WCAG formula WordPress uses for contrast calculations
- How WordPress determines large text for contrast checks
- Where block editor stores contrast checker code in core repo
- How to customize ContrastChecker component in a theme
- How to add contrast warnings to custom blocks in block.json
- Essential FSE patterns for accessibility
- Screen reader testing for block patterns
- Block Accessibility Checks plugin for patterns

### WooCommerce theme.json Deep Dive
- Which theme.json block keys control WooCommerce product image styles
- How to set product price typography in theme.json for WooCommerce
- Example theme.json snippet for wc product button styles
- How to target specific product templates with theme.json overrides
- How to apply global color palette to WooCommerce blocks in theme.json

### theme.json Troubleshooting
- How to validate theme.json syntax with JSON linter
- Fix unsupported properties in theme.json WordPress
- Test theme.json responsive design across devices
- Regenerate permalinks to fix theme.json errors
- Switch to default theme for theme.json troubleshooting

---

## Quick Reference Checklist

### Before Generating a Theme

**Colors & Contrast**
- [ ] Colors defined in theme.json palette with semantic names (base, contrast, primary, muted)
- [ ] All color pairs meet WCAG AA contrast (4.5:1 text, 3:1 large/UI)
- [ ] Brand color has both light-on-brand and brand-on-light pairings tested
- [ ] Custom color pickers disabled for navigation/site-title

**Header & Navigation**
- [ ] Site-title uses Global Styles color (no per-block textColor)
- [ ] Navigation uses Global Styles color (no per-block textColor)
- [ ] Header template part used consistently across all pages
- [ ] Paragraph links instead of navigation blocks with embedded children

**Block Patterns**
- [ ] Cover blocks use `overlayColor:"black"` (never "foreground" or "contrast")
- [ ] No `wp:list` with `textColor` attribute
- [ ] No `wp:separator` with `backgroundColor` attribute
- [ ] No complex margin objects on separators
- [ ] Heading hierarchy enforced (H1 → H2 → H3)
- [ ] Patterns validated in editor before programmatic use

**Version Compatibility**
- [ ] No malformed `metadata.bindings` objects (6.5+ compatibility)
- [ ] No incorrect `__default` binding structures (6.6+ compatibility)
- [ ] Block markup generated from editor, not hand-crafted
- [ ] theme.json validated against official schema

**Fonts & Performance**
- [ ] Fonts self-hosted with font-display: swap
- [ ] Only necessary font weights included (e.g., 400, 700)
- [ ] Single centralized typography.fontFamilies section

**WooCommerce (if applicable)**
- [ ] WooCommerce blocks inherit from theme.json
- [ ] All Woo templates are block-based (no custom PHP)
- [ ] Minimal, scoped CSS for Woo blocks

---

## 22. Competitor Analysis & Industry Patterns

### Top 4 WordPress AI Theme Generators

| Product | Team | Primary Approach | Open Source |
|---------|------|------------------|-------------|
| **QuickWP** | ThemeIsle/CodeinWP | FSE theme + patterns + OpenAI selection | ✅ Yes |
| **Divi AI** | Elegant Themes | AI in visual builder, trained on Divi codebase | ❌ No |
| **ZipWP** | Brainstorm Force/Astra | Complete hosted site generation | ❌ No |
| **WP.com AI Builder** | Automattic | Block editor + FSE primitives | ❌ No |

### Industry-Wide Pattern: AI Selects, Doesn't Generate HTML

**Critical Insight:** All major players use **pre-curated pattern libraries** instead of AI-generating raw block HTML:

- AI interprets user prompts and **selects appropriate patterns**
- AI fills in **content (text, colors)** into pattern templates
- AI does NOT generate raw WordPress block markup from scratch
- This prevents validation errors and ensures consistency

**Why This Matters for PressPilot:**
- Our pattern-based approach aligns with industry best practices
- Generating raw block HTML leads to validation errors
- Pre-validated patterns + AI content = reliable themes

### QuickWP vs ZipWP Comparison

| Aspect | QuickWP | ZipWP |
|--------|---------|-------|
| **Output** | FSE theme (theme.json + patterns) | Complete hosted WordPress site |
| **Base** | TT4 fork (Twenty Twenty-Four) | Astra + Spectra builders |
| **AI Role** | Selects patterns, fills copy/colors | Generates sitemap, pages, content |
| **Hosting** | ❌ Export theme only | ✅ Full managed hosting |
| **Preview** | WordPress Playground (in-browser) | Live hosted site |

**QuickWP is our closest architectural reference** - same model of FSE theme + pattern selection + exportable ZIP.

---

## 23. QuickWP Architecture Deep Dive

### Repository Structure

Two GitHub repos work together:
- **quickwp** (plugin): https://github.com/Codeinwp/quickwp - Builder logic, API, UI
- **quickwp-theme**: https://github.com/Codeinwp/quickwp-theme - TT4 fork with patterns

### Theme Architecture

**theme.json Structure:**
```json
{
  "$schema": "https://schemas.wp.org/trunk/theme.json",
  "version": 2,
  "settings": {
    "color": {
      "palette": [
        { "slug": "base", "name": "Background", "color": "#ffffff" },
        { "slug": "base-2", "name": "Light Background", "color": "#f7f7f3" },
        { "slug": "base-3", "name": "Dark Background", "color": "#1A1919" },
        { "slug": "contrast", "name": "Text", "color": "#0C0C0C" },
        { "slug": "contrast-4", "name": "Text on dark", "color": "#F8F8F8" },
        { "slug": "accent", "name": "Accent", "color": "#325CE8" }
      ]
    },
    "spacing": {
      "spacingSizes": [
        { "name": "2XS", "size": "clamp(0.47rem, calc(0.22vw + 0.4rem), 0.71rem)", "slug": "10" },
        { "name": "XS", "size": "clamp(0.71rem, calc(0.33vw + 0.61rem), 1.07rem)", "slug": "20" }
        // ... fluid spacing scale
      ]
    },
    "typography": {
      "fluid": true,
      "fontFamilies": [{ "fontFamily": "\"Inter\", sans-serif", "slug": "body" }]
    },
    "custom": {
      "radius": { "button": "5px", "card": "5px", "image": "24px" },
      "lineHeight": { "s": "1.2", "m": "1.65", "l": "1.7" }
    }
  }
}
```

**Key Insights:**
- Uses **fluid spacing** with clamp() for responsive design
- Custom properties for `radius` and `lineHeight` (reusable across patterns)
- Self-hosted Inter font (variable font, single file)
- Comprehensive block styles for buttons, navigation, quotes, etc.

### Pattern Structure

Patterns use **PHP placeholders** for dynamic content:

```php
<?php
/**
 * Title: Hero Cover
 * Slug: quickwp/hero-cover
 * Categories: quickwp/heroes_page_titles
 */
$content = new ThemeIsle\QuickWPTheme\Content( 'hero-cover', 'hero' );
$cover = $content->get_image( 'image', 'qwp-img-09.webp' );
?>

<!-- wp:cover {"url":"<?php echo $cover; ?>","dimRatio":50,"minHeight":70,"minHeightUnit":"vh"} -->
<div class="wp-block-cover">
  <!-- wp:heading {"level":1} -->
  <h1><?php $content->string( 'title', 'hero_title', 'title' ); ?></h1>
  <!-- /wp:heading -->
</div>
<!-- /wp:cover -->
```

**Pattern Categories (24 patterns):**
- Heroes: `hero-cover`, `hero-centered`, `hero-3`
- Features: `feature-columns`, `features-grid`, `features-row`
- Content: `content-plain`, `content-with-image`, `content-on-background`
- Testimonials: `testimonial-centered`, `testimonial-columns`
- Team: `team-columns`, `team-rows`
- CTAs: `call-to-action-1`, `call-to-action-2`

### API Flow

1. User provides prompt → sent to ThemeIsle's hosted API
2. API uses OpenAI to:
   - Parse business description
   - Select appropriate patterns
   - Generate copy for each pattern slot
   - Choose colors
3. Response contains JSON with pattern selections + content
4. Plugin assembles patterns into WordPress Playground preview
5. User exports as theme ZIP

**Key API Endpoints:**
- `/wizard/send` - Send user prompt
- `/wizard/status` - Check generation status
- `/wizard/get` - Retrieve generated data
- `/wizard/images` - Fetch stock images (Pexels)
- `/templates` - Get assembled template previews

### Lessons for PressPilot

1. **Pattern Selection > HTML Generation**: AI should select from validated patterns
2. **Content Placeholders**: Use filter system for dynamic content injection
3. **Fluid Spacing**: Use clamp() for responsive without breakpoints
4. **Custom Properties**: Define reusable values in theme.json custom
5. **Category Organization**: Group patterns by purpose for AI selection

---

## 24. WP-Bench Official WordPress AI Benchmark

### Overview

**WP-Bench** is the official WordPress AI benchmark from WordPress.org:
- Repository: https://github.com/WordPress/wp-bench
- Purpose: Evaluate AI model WordPress development knowledge
- Covers: WordPress 6.9 APIs, coding standards, security

### Knowledge Categories (17 test files)

| Category | Relevance to FSE Themes |
|----------|------------------------|
| **block-api.json** | Block API internals (WP 6.9) |
| **block-editor.json** | Block Editor, apiVersion 3 |
| **block-hooks.json** | Block Hooks API |
| **block-bindings.json** | Block bindings |
| **font-library.json** | Font Library API |
| **gotchas.json** | Common WordPress pitfalls |
| hooks.json | General hooks |
| rest-api.json | REST API |
| interactivity-api.json | Interactivity API |

### Key Knowledge Extracted

**Block Editor (WordPress 6.9):**
- `apiVersion: 3` required for iframe-backed editor
- `supports.visibility` enables Hide/Show toggle
- New **Accordion block** for collapsible sections

**Block Hooks (Important for Templates):**
- Only apply to templates, template parts, patterns, navigation posts
- Do NOT apply inside post content
- Use `ignoredHookedBlocks` to prevent re-insertion after removal
- `multiple: false` prevents duplicate hooked blocks

**Font Library:**
- Disable UI via `fontLibraryEnabled=false` in `block_editor_settings_all` filter

**Common Gotcha:**
- `get_post_meta($id, 'missing_key', true)` returns **empty string** (not null/false)

### Execution Tests Schema

WP-Bench uses this structure for code generation tests:
```json
{
  "id": "unique-test-id",
  "prompt": "Task description for the model",
  "requirements": ["List of requirements"],
  "static_checks": { "pattern": "regex to check" },
  "runtime_checks": { "assertion": "WP environment test" },
  "reference_solution": "Example correct code"
}
```

**Use Case:** Could adapt this schema for PressPilot's own pattern validation tests.

---

## Sources

### Core Documentation
- developer.wordpress.org (official documentation, theme.json schema)
- make.wordpress.org (core development updates)
- wordpress.com/support (block editor guides)
- github.com/WordPress/gutenberg (issue discussions, source code)

### FSE Tutorials & Troubleshooting
- fullsiteediting.com (tutorials and troubleshooting)
- rich.blog/standardizing-theme-json-colors/ (color palette best practices)
- olliewp.com (FSE tips and tricks)
- kadencewp.com (block recovery guides)
- gutenbergtimes.com (FSE news and updates)

### Version-Specific Research
- kinsta.com (WordPress version breakdowns, testing)
- nerdpress.net (WordPress 6.3 changes)
- newspack.com (release notes)
- nomad.blog (Block Bindings API)
- fastcomet.com (WordPress 6.6 changes)
- teamupdraft.com (version updates)

### WooCommerce
- developer.woocommerce.com (official WooCommerce docs)
- blazecommerce.io (FSE + WooCommerce performance)
- crocoblock.com (FSE integration guides)

### Accessibility
- w3.org/TR/WCAG21 (accessibility standards)
- nustart.solutions (WCAG color contrast)
- wpaccessibility.day (WordPress accessibility)
- colorsafe.co (contrast checking tool)
- equalizedigital.com (WordPress accessibility)
- allaccessible.org (implementation guides)

### Performance
- wpengine.com (Google Fonts best practices)
- nitropack.io (font optimization)

### Validation & Testing
- wrmf.ca (theme.json validation)
- wpfieldwork.com (JSON schema)
- deployhq.com (CI/CD for WordPress)
- webnots.com (block recovery fixes)

### Competitor & AI Benchmarks
- github.com/Codeinwp/quickwp (QuickWP builder plugin - open source)
- github.com/Codeinwp/quickwp-theme (QuickWP TT4 theme fork)
- github.com/WordPress/wp-bench (Official WordPress AI benchmark)
- themeisle.com/blog/we-are-open-sourcing-our-ai-site-builder/ (QuickWP announcement)
- zipwp.com (ZipWP AI site builder)
- elegantthemes.com/ai/ (Divi AI)
- wordpress.com/ai-website-builder/ (WordPress.com AI Builder)
