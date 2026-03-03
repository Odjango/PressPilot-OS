# WPaify Converter — Fix & Improvement Plan

> **Purpose:** Actionable fix plan for a separate WPaify development session.
> **Context:** WPaify is an HTML-to-WordPress FSE theme converter. This plan addresses the current converter logic. SSWG Phase 4 will eventually replace this with a pattern-assembly approach, but the current converter needs to work NOW.
> **Date:** 2026-03-03

---

## CURRENT STATE (What Exists)

WPaify takes uploaded HTML/CSS/JS files and converts them into a WordPress FSE block theme. The converter must produce valid block markup that passes the WordPress Site Editor without "Attempt Recovery" errors.

### Known Issues (From Previous Sessions)

1. **Block markup validation failures** — generated blocks don't always match WordPress's `save()` function output, causing "Attempt Recovery" errors in the Site Editor
2. **HTML-to-block mapping inconsistencies** — some HTML patterns map to wrong block types (e.g., flex containers mapped as constrained groups)
3. **Image path handling** — assets referenced with wrong paths after conversion
4. **SVG handling** — SVGs rendered as raw code instead of image blocks or inline HTML blocks
5. **Navigation conversion** — static `<a>` links not properly converted to `wp:navigation` + `wp:navigation-link` blocks
6. **CSS-to-theme.json extraction** — colors and fonts not fully extracted from source CSS into theme.json palette/typography
7. **Layout fidelity** — spacing, alignment, and responsive behavior drift between original HTML and converted theme

---

## FIX PLAN — 7 PHASES

### Phase 1: Audit Current Converter Output

**Goal:** Establish a baseline of what's broken.

**Steps:**
1. Take 3 test HTML sites (restaurant, corporate/services, portfolio) and run them through the current converter
2. Activate each generated theme in WordPress (local WP or Playground)
3. Document every failure:
   - "Attempt Recovery" errors → note which block and which template file
   - Visual drift → screenshot original vs. converted, note the section
   - Missing content → text or images that didn't transfer
   - Broken navigation → links that don't work or aren't WP navigation blocks
4. Categorize failures by type (markup, layout, content, assets, navigation)
5. Prioritize: markup crashes > missing content > layout drift > visual polish

**Output:** `CONVERTER-AUDIT-RESULTS.md` with failure inventory and priority ranking.

---

### Phase 2: Fix Block Markup Generation

**Goal:** Zero "Attempt Recovery" errors.

This is the highest-priority fix. Every block must follow exact WordPress grammar.

**Steps:**
1. **Read the FSE Knowledge Base** before touching any code:
   - `docs/fse-kb/FSE-KNOWLEDGE-BASE-INDEX.md` (navigation guide)
   - `docs/fse-kb/BLOCK-MARKUP-SPEC.md` (universal syntax rules)
   - Relevant `BLOCK-REFERENCE-BATCH-*.md` files for blocks being generated
2. **Fix opening/closing comment matching** — every `<!-- wp:blockname -->` must have a matching `<!-- /wp:blockname -->` (or be self-closing with `/-->`)
3. **Fix JSON attributes** — must be valid JSON inside comments (double quotes only, no trailing commas, booleans unquoted)
4. **Fix HTML wrapper classes** — `wp-block-group`, `wp-block-columns`, `wp-block-cover` etc. must match the block type exactly
5. **Fix nesting** — nested blocks go INSIDE the HTML wrapper element, BETWEEN the opening and closing comments
6. **Fix self-closing blocks** — template-parts (`<!-- wp:template-part {"slug":"header"} /-->`), navigation, spacers
7. **Add required attributes** — `dimRatio` on Cover, `level` on Heading, `slug` on Template Part, `url` on Image

**Validation rule:** After fixes, run every generated template through the BlockConfigValidator (if available) or manually check in Site Editor — ZERO recovery errors.

**Reference:** The full block syntax spec is in `docs/fse-kb/BLOCK-MARKUP-SPEC.md`. Do NOT guess markup — always reference the spec.

---

### Phase 3: Fix HTML-to-Block Mapping Logic

**Goal:** Each HTML element maps to the correct WordPress block type.

**Decision tree (use this exact logic):**

```
Is it <header> or contains <nav> as first child?
  → Template-part (header) with wp:site-title + wp:navigation

Is it <footer>?
  → Template-part (footer)

Is it a section with large background image?
  → wp:cover (with dimRatio, minHeight)

Is it a container/wrapper (<section>, <div>, <article>)?
  → wp:group. Then determine layout:
    - Children stacked vertically → {"layout":{"type":"constrained"}}
    - Children in a horizontal row (flexbox) → {"layout":{"type":"flex","flexWrap":"nowrap"}}
    - CSS Grid → {"layout":{"type":"grid"}}
    - Full-width wrapper → {"layout":{"type":"default"}} + alignfull

Is it <img> or <figure> with <img>?
  → wp:image (with url, alt, optional caption)

Is it <h1> through <h6>?
  → wp:heading {"level": N}

Is it <p>?
  → wp:paragraph

Is it <a> styled as a button?
  → wp:buttons wrapping wp:button (NOT a bare wp:button)

Is it <ul> or <ol>?
  → wp:list with wp:list-item children

Is it a multi-column layout?
  → wp:columns with wp:column children (one per column)

Is it something with no block equivalent?
  → wp:html (custom HTML block — LAST RESORT)
```

**Common mistakes to fix:**
- `<div class="flex">` mapped as constrained group → should be flex group
- `<a>` buttons not wrapped in `wp:buttons` container
- Cover blocks missing `dimRatio` attribute (defaults to 50, must be explicit)
- Heading blocks missing `level` attribute
- Group blocks missing wrapper `<div>` element between comments

---

### Phase 4: Fix Image & Asset Handling

**Goal:** All images display correctly in the converted theme.

**Steps:**
1. **Copy images** from uploaded HTML into theme's `assets/images/` directory
2. **Rewrite paths** — all `<img src="...">` paths must point to the theme directory:
   - In templates (`.html` files): use relative paths or block attributes `{"url":"..."}`
   - In patterns (`.php` files): use `<?php echo esc_url( get_template_directory_uri() ); ?>/assets/images/filename.jpg`
3. **Handle SVGs:**
   - SVGs used as decorative images → `wp:image` block with SVG file path
   - SVGs used as icons inline → `wp:html` block wrapping the raw SVG
   - NEVER put raw SVG code inside a paragraph or heading block
4. **Handle external images** — if original HTML references CDN/external URLs, keep them as-is in block attributes
5. **Image block attributes** — always include `url`, `alt` (even if empty string), and optionally `width`/`height`

---

### Phase 5: Fix Navigation Conversion

**Goal:** Navigation works as proper WordPress navigation blocks.

**Steps:**
1. **Identify navigation** in source HTML — `<nav>`, `<ul class="menu">`, header link lists
2. **Convert to `wp:navigation`** — this is a SELF-CLOSING block in templates:
   ```html
   <!-- wp:navigation {"overlayMenu":"never"} /-->
   ```
3. **Do NOT put navigation links as inner blocks** — WordPress manages navigation items through the database/navigation post type, not inline markup
4. **For the header template-part**, use this structure:
   ```html
   <!-- wp:group {"layout":{"type":"flex","justifyContent":"space-between"}} -->
   <div class="wp-block-group">
     <!-- wp:site-title /-->
     <!-- wp:navigation {"overlayMenu":"never"} /-->
   </div>
   <!-- /wp:group -->
   ```
5. **Navigation items** get populated when the theme is activated — the converter doesn't need to create them inline

---

### Phase 6: Fix CSS-to-theme.json Extraction

**Goal:** Colors, fonts, and spacing from the original site appear in the converted theme.

**Steps:**
1. **Extract color palette** from source CSS:
   - Find the most-used non-gray colors → map to `primary`, `secondary`, `accent`
   - Find background colors → map to `background`
   - Find text colors → map to `foreground`
   - Add all to `settings.color.palette` in theme.json
2. **Extract font families** from CSS:
   - Identify heading font and body font
   - Add to `settings.typography.fontFamilies` with slug, name, fontFamily
   - If Google Fonts, include proper font-display: swap
3. **Extract spacing values:**
   - Content max-width → `settings.layout.contentSize`
   - Wide max-width → `settings.layout.wideSize`
   - Common padding values → `settings.spacing.spacingSizes`
4. **What CANNOT go in theme.json** (keep in style.css):
   - Animations and transitions
   - Complex hover states
   - Pseudo-elements (::before, ::after)
   - Non-standard media queries
   - CSS Grid with named areas

**Reference:** `docs/fse-kb/Best practice of AI agent creating theme-json.md`

---

### Phase 7: Visual Fidelity Pass

**Goal:** Converted theme looks close to the original (not pixel-perfect, but recognizably the same site).

**Steps:**
1. **Side-by-side comparison** — open original HTML in one window, converted theme in another
2. **Fix spacing** — adjust group block padding/margin via block attributes or theme.json spacing presets
3. **Fix typography** — ensure font sizes match using `settings.typography.fontSizes` presets
4. **Fix colors** — verify palette colors applied correctly via `has-{slug}-color` / `has-{slug}-background-color` classes
5. **Fix alignment** — check `alignwide` and `alignfull` on appropriate blocks
6. **Responsive check** — verify at 3 breakpoints (mobile 375px, tablet 768px, desktop 1200px)

---

## VERIFICATION CHECKLIST (Run After All Fixes)

- [ ] Theme activates without PHP errors
- [ ] Site Editor loads ALL templates without "Attempt Recovery"
- [ ] Header renders with logo/title and working navigation
- [ ] Footer renders correctly
- [ ] Homepage layout matches original structure (sections in correct order)
- [ ] All images display (no broken image icons)
- [ ] Typography matches (correct fonts loaded)
- [ ] Colors match (palette applied correctly)
- [ ] Responsive layout works at mobile/tablet/desktop
- [ ] SVGs render as graphics, not raw code
- [ ] theme.json is valid JSON (no trailing commas, no comments)
- [ ] style.css has complete header with all required fields
- [ ] templates/index.html exists as fallback
- [ ] parts/header.html and parts/footer.html exist

---

## REFERENCE FILES (Agent Must Read)

Before starting any fix work, the agent MUST read:

1. `docs/fse-kb/FSE-KNOWLEDGE-BASE-INDEX.md` — master navigation for FSE knowledge
2. `docs/fse-kb/BLOCK-MARKUP-SPEC.md` — block syntax rules (the law)
3. Relevant `docs/fse-kb/BLOCK-REFERENCE-BATCH-*.md` for blocks being generated:
   - Batch 1: layout blocks (group, columns, cover, spacer)
   - Batch 2: text blocks (paragraph, heading, list, quote)
   - Batch 3: media blocks (image, gallery, video)
   - Batch 4: interactive (buttons, navigation, search, social-links)
   - Batch 5: site identity (site-title, site-logo, site-tagline)
   - Batch 7: template-parts
4. `agent-os/references/convert-kb-to-agent-skill.md` — HTML-to-block mapping procedures and failure modes

---

## FUTURE: SSWG Phase 4 Integration

Once SSWG Phases 1-3 are complete, the converter will be rebuilt using the pattern-assembly approach (see `agent-os/sswg/PHASE-4.md`). That approach eliminates most markup validation issues because patterns are pre-validated. The fixes in this plan are for the CURRENT converter to work while SSWG is being built.
