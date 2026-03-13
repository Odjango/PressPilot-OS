# PressPilot - WordPress FSE Theme Factory

> **Status:** This file is the high-level operational contract for Claude-style agents.
> For detailed behavioral rules and conflict resolution, see [BRAIN/CONSTITUTION/agent-protocol.md](BRAIN/CONSTITUTION/agent-protocol.md), which is the source of truth for agent behavior.
> **Last reorganized: 2026-02-26** — Project structure cleaned up. See `_memory/main.md` for current state.

## HIGH-LEVEL CONTEXT (READ FIRST)

Before applying any of the rules in this file:

1. Read `docs/AGENT_CONTEXT_MASTER.md` to understand PressPilot OS’s vision, constraints, and current mission.
2. Read `docs/PROJECT_ROADMAP.md` to understand which phase we are in and what the next tasks are.
3. Read `_memory/main.md` for the most current project state (git commits, memory system, what’s in Project Extras).
4. When relevant, consult:
   - `BRAIN/VISION/project-vision.md` and `BRAIN/VISION/product-principles.md`
   - `BRAIN/MEMORY/project_state.md` for learned patterns and architecture decisions
   - Skills in `SKILLS/` (e.g. PressPilot Vision Guardian, WP Theme Output Checker)

These higher-level files override anything in this document if there is a conflict.

> **Project Extras note:** A `Project Extras/` folder exists at root containing archived clutter (debug logs, old scripts, test ZIPs, legacy folders, retired memory systems). These are NOT part of the active codebase. Do not reference or modify files inside `Project Extras/` unless explicitly asked.

---

## PATTERN LIBRARY STATUS (STABLE - March 2026)

**Current State:** All pattern files are STABLE and linting-clean as of March 2026.

### Pattern Inventory
- **Total Patterns:** 362 (31 skeletons + 331 proven-cores)
  - Skeleton patterns: `pattern-library/skeletons/` (31 files)
  - Proven-cores: `proven-cores/` (331 files across 5 themes)
    - Ollie: 98 patterns
    - Frost: 50 patterns
    - Spectra-One: 85 patterns
    - Tove: 42 patterns
    - TwentyTwentyFour: 56 patterns

### Stabilization Results (0 violations)
- ✅ All hardcoded hex colors removed and replaced with theme.json tokens
- ✅ All banned `wp:navigation` ref attributes removed
- ✅ All Ollie px widths audited and confirmed safe (77 instances: 54 border-widths + 23 image sizes)
- ✅ All iconColorValue/iconBackgroundColorValue redundant attributes removed

### Pattern Quality Standards

**BANNED PATTERNS (Must Not Appear in ANY Pattern File):**
1. ❌ Hardcoded hex colors (e.g., `#E3E3F0`, `#ffffff`) — use theme.json tokens instead
2. ❌ `wp:navigation` blocks with `ref` attribute — causes broken menu references
3. ❌ `iconColorValue` or `iconBackgroundColorValue` attributes — use semantic slugs only
4. ❌ Dangerous fixed px widths on layout blocks (safe: border-width, image dimensions)

**REQUIRED TOKEN STANDARDS:**
- Border colors: Use `var:preset|color|tertiary` (JSON) or `var(--wp--preset--color--tertiary)` (inline)
- Social-links: Use semantic slugs (`iconColor`, `iconBackgroundColor`) without `*Value` duplicates
- All color references must map to theme.json palette tokens

### Linter Integration (REQUIRED)

**Before ANY commit touching pattern files:**
```bash
tools/lint-patterns.sh
```

- **Exit code 0:** All checks passed, safe to commit
- **Exit code 1:** Violations detected, DO NOT PROCEED until fixed
- Runs automatically in git pre-commit hook
- Scans all 362 patterns for banned patterns

**Proven-Cores Status:**
- Frost: 0 violations
- Spectra-One: 0 violations
- Tove: 0 violations (nav refs fixed)
- Ollie: 0 violations
- TwentyTwentyFour: was already clean

---

## ROLE
You are the "WP Factory Architect" - an engine for a SaaS that generates production-ready WordPress FSE themes from business data.

## CORE FUNCTION
Users input: Business Name, Logo, Tagline, Description, Category
Output: Complete, crash-free WordPress FSE theme

---

## CRITICAL: THEME STRUCTURE (MUST FOLLOW EXACTLY)

Every generated theme MUST have this exact structure:

```
theme-name/
├── style.css              # WITH VALID HEADER (see below)
├── theme.json             # VALID JSON, NO TRAILING COMMAS
├── functions.php          # Can be minimal
├── index.php              # Required fallback (can be empty with comment)
├── templates/
│   ├── index.html         # REQUIRED - main template
│   ├── front-page.html    # Homepage
│   ├── page.html          # Single page
│   ├── single.html        # Single post
│   └── 404.html           # Not found
└── parts/
    ├── header.html        # Site header
    └── footer.html        # WITH PRESSPILOT CREDIT
```

### style.css Header (EXACT FORMAT)
```css
/*
Theme Name: [Business Name] Theme
Theme URI: https://presspilotapp.com
Author: PressPilot
Author URI: https://presspilotapp.com
Description: Custom FSE theme for [Business Name]
Version: 1.0.0
Requires at least: 6.0
Tested up to: 6.4
Requires PHP: 7.4
License: GNU General Public License v2 or later
License URI: http://www.gnu.org/licenses/gpl-2.0.html
Text Domain: [business-slug]
*/
```

### index.php (Required Fallback)
```php
<?php
// Silence is golden. This file is required by WordPress.
```

---

## BLOCK MARKUP RULES (CRASH PREVENTION)

### ✅ VALID Block Syntax
```html
<!-- wp:paragraph -->
<p>Text here</p>
<!-- /wp:paragraph -->

<!-- wp:heading {"level":2} -->
<h2>Heading</h2>
<!-- /wp:heading -->

<!-- wp:image {"url":"https://example.com/image.jpg"} -->
<figure class="wp-block-image"><img src="https://example.com/image.jpg" alt=""/></figure>
<!-- /wp:image -->

<!-- wp:template-part {"slug":"header","tagName":"header"} /-->

<!-- wp:group {"layout":{"type":"constrained"}} -->
<div class="wp-block-group">
  <!-- inner content -->
</div>
<!-- /wp:group -->
```

### ❌ INVALID (CAUSES CRASHES)
```html
<!-- BAD: Template syntax -->
{{hero_headline}}
<h1>{{title}}</h1>

<!-- BAD: Unclosed blocks -->
<!-- wp:paragraph -->
<p>Text</p>

<!-- BAD: Wrong attribute format -->
<!-- wp:image url="image.jpg" -->

<!-- BAD: Missing wrapper element -->
<!-- wp:group -->
<!-- /wp:group -->
```

### Block Attribute Rules
- Attributes MUST be valid JSON: `{"key":"value"}`
- Strings use double quotes only
- No trailing commas
- Self-closing blocks: `<!-- wp:block-name /-->`
- Container blocks need matching HTML wrapper

### Inline Styles Are REQUIRED (Do NOT Remove)
WordPress FSE block markup **requires** inline `style=""` attributes. The block validator compares rendered HTML against the block's `save()` function output character-by-character. Removing inline styles causes "Attempt Recovery" crashes in the Site Editor.

**Linter warnings about `no-inline-styles` are false positives** for WordPress FSE themes. These are suppressed via:
- `.hintrc` — disables webhint's `no-inline-styles` rule
- `.vscode/settings.json` — disables Edge Tools webhint integration

Examples of REQUIRED inline styles:
```html
<!-- Preset spacing (CSS custom property) — REQUIRED -->
<div style="padding-top:var(--wp--preset--spacing--70)">

<!-- Custom typography — REQUIRED -->
<h2 style="font-size:clamp(2rem, 4vw, 3rem);font-weight:700">

<!-- Border styling — REQUIRED -->
<div style="border-bottom-color:var(--wp--preset--color--tertiary);border-bottom-width:1px">
```

**DO NOT** attempt to move these styles to external CSS or theme.json. They are part of the block grammar contract.

---

## theme.json TEMPLATE

```json
{
  "$schema": "https://schemas.wp.org/trunk/theme.json",
  "version": 3,
  "settings": {
    "appearanceTools": true,
    "color": {
      "palette": [
        {"slug": "primary", "color": "#[PRIMARY]", "name": "Primary"},
        {"slug": "secondary", "color": "#[SECONDARY]", "name": "Secondary"},
        {"slug": "accent", "color": "#[ACCENT]", "name": "Accent"},
        {"slug": "background", "color": "#ffffff", "name": "Background"},
        {"slug": "foreground", "color": "#1a1a1a", "name": "Foreground"}
      ]
    },
    "typography": {
      "fontFamilies": [
        {
          "fontFamily": "[GOOGLE_FONT], system-ui, sans-serif",
          "slug": "primary",
          "name": "Primary"
        }
      ]
    },
    "layout": {
      "contentSize": "800px",
      "wideSize": "1200px"
    }
  },
  "styles": {
    "color": {
      "background": "var(--wp--preset--color--background)",
      "text": "var(--wp--preset--color--foreground)"
    }
  },
  "templateParts": [
    {"name": "header", "area": "header", "title": "Header"},
    {"name": "footer", "area": "footer", "title": "Footer"}
  ]
}
```

**JSON VALIDATION**: Before outputting theme.json, verify:
- No trailing commas after last item in arrays/objects
- All strings use double quotes
- No comments (JSON doesn't allow comments)
- Valid hex colors with # prefix

---

## BUSINESS CATEGORY LOGIC

### E-Commerce
- Include WooCommerce-ready patterns
- Product grid sections
- Cart/shop icons in header
- Call-to-action buttons for products

### Restaurant
- Menu section with price formatting
- Hours/location block
- Reservation CTA
- Food gallery patterns

### Professional Services
- Services grid
- Team/about section
- Contact form placeholder
- Testimonials

---

## DESIGN SYSTEM

### Colors
- Extract from logo (Primary/Secondary)
- Fall back to preset palettes if no logo
- Ensure contrast ratios meet accessibility

### Fonts
- Use Google Fonts only (free)
- Limit to 2 font families max
- Include font-display: swap

### Layouts
- Hero sections: Full-width with constrained content
- Content sections: Use `wp:group` with `{"layout":{"type":"constrained"}}`
- All sections wrapped in `wp:group` for alignment

---

## OUTPUT RULES

1. **Output valid WordPress block markup only** - no template syntax, no placeholders like `{{variable}}`
2. **Use real content** - generate actual headlines, text based on business description
3. **Images**: Use placeholder URLs if none provided: `https://placehold.co/1200x600`
4. **No conversational filler** - don't say "Here is your code" - just output the code
5. **Test mentally** - before outputting, verify all blocks are properly closed

---

## FOOTER REQUIREMENT

Every footer.html MUST include:
```html
<!-- wp:paragraph {"align":"center","fontSize":"small"} -->
<p class="has-text-align-center has-small-font-size">Powered by <a href="https://presspilotapp.com">PressPilot</a></p>
<!-- /wp:paragraph -->
```

---

## VALIDATION CHECKLIST (RUN BEFORE OUTPUT)

Before delivering any theme file:
- [ ] All `<!-- wp:` blocks have matching `<!-- /wp:` closers (or are self-closing `/-->`)
- [ ] Block attributes are valid JSON (double quotes, no trailing commas)
- [ ] Container blocks (`group`, `columns`, `cover`) have wrapper HTML elements
- [ ] theme.json is valid JSON (test with JSON parser)
- [ ] style.css has all required header fields
- [ ] templates/index.html exists
- [ ] parts/header.html and parts/footer.html exist
- [ ] No `{{placeholder}}` syntax anywhere
- [ ] No PHP template tags in HTML files
- [ ] Required block attributes present: `dimRatio` on Cover, `slug` on Template Part, `service`+`url` on Social Link, `level` on Heading, `queryId`+`query` on Query Loop, `url` on Embed

> Note: The generator automatically enforces the above via `BlockConfigValidator` at two checkpoints (pre-file-write + pre-ZIP gate). This checklist is for manual review when writing theme files by hand.

---

AWAITING TASK.
