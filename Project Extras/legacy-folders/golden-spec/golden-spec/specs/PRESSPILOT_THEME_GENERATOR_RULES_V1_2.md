# PressPilot Theme Generator – Golden V1.2 Rules

This is the contract for any AI (Antigravity, Claude, Cursor, etc.) that generates or edits WordPress themes for PressPilot.

## 1. Goal

Generate **WordPress block themes** that:

- Work on WordPress **6.5+**.
- Activate with **no errors** on any normal host.
- Open in **Site Editor** with **no “Attempt Recovery”**.
- Use **Full Site Editing (FSE)** (templates, template parts, patterns, theme.json).
- Are **host-agnostic** (no hard-coded URLs or plugin dependencies).

## 2. Required Structure

Every generated theme must include at least:

- `style.css` with a valid theme header.
- `theme.json` with:
  - `"version": 3`
  - `"$schema": "https://schemas.wp.org/trunk/theme.json"`
- `functions.php`
- `templates/index.html`
- `templates/page.html`
- `templates/front-page.html`
- `parts/header.html`
- `parts/footer.html`

Patterns are strongly encouraged:

- `patterns/hero-default.php`
- `patterns/features-simple.php`
- Additional patterns may be added, but must follow the same pattern structure.

Do not remove these base files unless explicitly instructed.

## 3. Block Markup Rules

- Templates and template parts must use **only Gutenberg block markup**:
  - Example: `<!-- wp:group {...} --> … <!-- /wp:group -->`.
- **Forbidden** inside templates/parts:
  - PHP (`<?php ... ?>`)
  - Raw `<ul><li>` navigation markup.
  - Inline `<script>` or `<style>`.
  - Hard-coded URLs like `https://example.com` or `/wp-content/uploads/...`.

If additional layout or design is needed, use **blocks**, not raw HTML.

## 4. Templates vs Parts vs Patterns

### 4.1 Templates

- Define **page structure only** (header, main, footer, basic content).
- Must include:
  - `header` and `footer` template parts.
  - A main `wp:group` with `tagName: "main"`.

Examples:

- `index.html`:
  - Uses a `wp:query` block to render posts.
- `page.html`:
  - Uses `wp:post-title` and `wp:post-content`.
- `front-page.html`:
  - Uses a **pattern** for hero (`presspilot/hero-default`) plus a simple query or content section.

Do **not** place complex layouts directly into templates. Those belong in patterns.

### 4.2 Template Parts

- `header.html`:
  - Must include Site Title or Site Logo block.
  - Must include a **Navigation block** (no raw HTML menus).

- `footer.html`:
  - Simple group with paragraph(s), optionally additional blocks.
  - No complex logic or hard-coded menus.

### 4.3 Patterns

- All rich sections (hero, features, pricing, testimonials, etc.) must be implemented as **patterns**, not templates.
- Patterns live in the `patterns/` folder and use PHP headers:

  ```php
  <?php
  /**
   * Title: Hero - Default
   * Slug: presspilot/hero-default
   * Categories: presspilot, text
   */
  ?>
  <!-- wp:group ... --> ... <!-- /wp:group -->
Pattern slugs must be prefixed with presspilot/.
## 5. Navigation Rules (Updated – Golden V1.2)

### 5.1 General

- Every theme must provide a **single primary navigation** area in the header.
- Navigation must use the **core Navigation block** (`wp:navigation`) – no custom HTML menus.
- Themes must be **host-agnostic**:
  - Do NOT hard-code specific page IDs, URLs, or slugs.
  - Do NOT depend on a particular page set being present.

### 5.2 Canonical Header Implementation

The default header template part MUST follow this pattern (structure, not necessarily the same copy):

- A `header` group using flex layout:
  - Left: `site-logo` + `site-title`.
  - Right: a single `navigation` block.

Inside the navigation block:

- Must set:

  ```json
  "overlayMenu": "never",
  "layout": {
    "type": "flex",
    "orientation": "horizontal"
  }
  ```

- Must contain a Page List block:

  ```html
  <!-- wp:navigation {"overlayMenu":"never","layout":{"type":"flex","justifyContent":"right","orientation":"horizontal"}} -->
    <!-- wp:page-list /-->
  <!-- /wp:navigation -->
  ```

This ensures:
- The menu immediately shows all published pages on any host.
- No permanent “Select page” placeholders in the editor.
- Frontend and editor are always in sync.

### 5.3 What the Generator May NOT Do

- Must NOT:
  - Wrap the Navigation block in extra layout blocks that hide or mask it.
  - Set `"overlayMenu": "mobile"` or `"always"` by default.
  - Output raw `<ul><li>` HTML markup for menus.
  - Hard-code menus tied to specific page IDs or slugs.

**Optional exception:**
For very specific marketing themes, the generator may create a custom named menu with fixed items, BUT:
- It must still be rendered via the Navigation block.
- It must still be compatible with the Page List approach and not break FSE.

### 5.4 Styling via theme.json

Navigation styling must be done through `theme.json` presets where possible.

Example recommended block styles:

```json
"blocks": {
  "core/navigation": {
    "typography": {
      "fontSize": "var(--wp--preset--font-size--sm)",
      "fontWeight": "500"
    }
  },
  "core/navigation-link": {
    "color": {
      "text": "var(--wp--preset--color--foreground)"
    }
  }
}
```

No custom CSS should hide, move, or visually collapse the navigation by default. Navigation must be visible, horizontal, and usable on desktop with no extra configuration.
6. theme.json Rules
Must define:
Layout:
settings.layout.contentSize
settings.layout.wideSize
Colors:
A custom palette with slugs (background, foreground, primary, accent, muted).
Optionally defaultPalette: false to disable WP default palette.
Typography:
At least one font family preset.
Several font sizes (xs, sm, base, md, lg, xl).
styles.layout must mirror layout sizes for front-end consistency.
Use preset variables:
var(--wp--preset--color--primary)
var(--wp--preset--font-size--md)
var(--wp--preset--font-family--system-sans)
All layout, color and typography decisions should be expressed through theme.json wherever possible, not through custom CSS.
7. Host & Plugin Independence
Generated themes must not:
Depend on any plugin (FluentCart, Flowmattic, etc.) to function.
Include plugin-specific blocks or hooks.
Hard-code URLs, paths, or IDs.
The theme must work on a clean WP install with only core enabled.
8. Editing Behavior for AI
When modifying this theme:
Preserve the overall structure (required files + folders).
You may:
Adjust theme.json design tokens (colors, fonts, spacing).
Add new patterns.
Refine templates and parts while keeping them minimal and block-based.
You may not:
Remove FSE capabilities.
Replace Navigation blocks with classic menus.
Add PHP logic inside templates/parts.
Always optimize for:
Structural stability (no errors, no Attempt Recovery).
Editor compatibility (everything editable via Site Editor).
Future flexibility (design can change via patterns and theme.json, not code rewrites).
