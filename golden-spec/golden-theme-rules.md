# Golden Theme Rules (Hardened)

This document is the **SINGLE SOURCE OF TRUTH** for preventing recurring bugs in PressPilot themes.
Any deviation from these rules is considered a critical failure.

## 1. Vertical Layout & Viewport
**Problem**: Themes often collapse vertically or center content unexpectedly due to FSE defaults.
**Rule**: You MUST include the following **Aggressive CSS Reset** in `theme.json` (root `css` property):

```css
html,
body {
  min-height: 100%;
  margin: 0;
  padding: 0;
}

/* Root wrapper for block themes */
.wp-site-blocks {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: flex-start !important; /* FORCE TOP ALIGNMENT */
  align-items: stretch !important;       /* FORCE FULL WIDTH */
  padding: 0;
}

/* Main content should expand to fill available height */
.wp-site-blocks > main {
  flex: 1 0 auto;
  display: flex;
  flex-direction: column;
  justify-content: flex-start !important;
}
```

## 2. Content Seeding Isolation
**Problem**: If a user installs V1, then V2, V2 fails to seed content because it checks the same database option key.
**Rule**: Every theme version (or major refactor) MUST use a **unique namespace** for:
1.  **Seeding Function**: `presspilot_onion_v2_seed_content` (suffix with version/slug).
2.  **Database Option**: `presspilot_onion_v2_seed_version` (suffix with version/slug).
3.  **Pattern Category**: `PressPilot / Onion V2` (suffix with version/slug).

## 3. Pattern Isolation
**Problem**: The WordPress Editor caches patterns by slug. If V2 uses `presspilot/home-hero` but changes the HTML, the editor might still load the old V1 pattern from the database.
**Rule**: All pattern slugs MUST be namespaced to the specific theme version or slug.
-   **Bad**: `slug: presspilot/home-hero`
-   **Good**: `slug: presspilot-v2/home-hero`

## 4. Canonical Hero
**Problem**: Hero sections often lose their fullwidth alignment or padding.
**Rule**: The "Home Hero" MUST be identical to the "Canonical Hero" pattern.
-   **Structure**: `wp:group` with `align: "full"`.
-   **Placeholders**: `{{HERO_TITLE}}`, `{{HERO_SUBTITLE}}`.
-   **Usage**: This pattern must be used for **ALL** generated pages (Home, About, Services, etc.).

## 5. Build Script Automation
**Rule**: The build script (`buildWpTheme.ts`) MUST automatically enforce these namespaces. Do not rely on manual string replacement in PHP files if possible.

## 6. Image & Asset Policy (V1.1)

### 6.1 Asset Types

The generator must treat images as one of two types:

1. Theme assets  
   - Design visuals that ship with every theme ZIP.  
   - Examples: hero placeholders, background textures, icons, decorative shapes.  
   - Location in the generated theme:  
     `assets/images/`

2. Content images  
   - Belong to user content (posts, pages, products).  
   - Normally live in the Media Library (`/wp-content/uploads/...`).  
   - V1.1 generator does **not** create or depend on Media Library images.

For V1.1, all images emitted by the generator are **theme assets**, not Media Library content.

---

### 6.2 Paths and URLs (No External Domains)

- Block templates and patterns **must not** hard-code external domains  
  - No `https://unsplash.com/...`  
  - No `https://oldsite.com/wp-content/uploads/...`
- Templates/patterns must not depend on attachment IDs from another site.  
- Image references must be either:
  - A stable theme asset reference (see 6.3), or  
  - A block layout with **no fixed image**, where the user chooses an image later.

Any detection of external image URLs or foreign uploads is a validation failure.

---

### 6.3 Theme Asset Location

Every generated theme must include:

```text
{theme-slug}/assets/images/
Examples (not exhaustive):
assets/images/hero-placeholder-home.jpg
assets/images/hero-placeholder-page.jpg
assets/images/logo-placeholder.svg
```
These files must be copied into the theme ZIP at build time.

### 6.4 Hero & Layout Images (V1.1 Behavior)
Hero sections are primarily layout patterns, not photo galleries.
The generator must produce hero patterns that:
- Render correctly even if no image is selected.
- Contain clear placeholder copy such as “Replace this hero image with a photo of your business.”

V1.1 default:
Hero may be a core/cover block with a neutral background color and no fixed image URI.
If a decorative image is required, it must be implemented as a CSS background using a theme asset (see 6.5), not a hard-coded `<img src="...">` with an external URL.

### 6.5 CSS-Based Decorative Assets
If the theme uses evergreen decorative assets (textures, shapes, icons):
- Assets must live in `assets/images/`.
- `functions.php` may enqueue a small stylesheet that defines classes like:
```css
.pp-hero--with-texture {
  background-image: url("{{THEME_URI}}/assets/images/hero-texture.jpg");
}
```
Block templates and patterns may only reference these assets via CSS classes (e.g. `class="wp-block-group pp-hero--with-texture"`), not by embedding full image URLs in HTML.

### 6.6 Accessibility & Fallback
Any non-decorative `<img>` emitted by the generator must include an `alt` attribute.
Patterns and templates must still look reasonable if images are missing:
- Layout must not collapse.
- Placeholder text must make it obvious where the user should insert their own images.

## 7. Canonical Footer Pattern V1.0 (Golden V1.2)
**Rule**: `parts/footer.html` must exist in every generated theme.

**Structure**:
1.  **Root Block**: `core/group` with `tagName: "footer"`.
2.  **Layout**:
    -   Outer Group: `layout: { type: "constrained" }` (or default).
    -   Inner Group: `align: "full"`, acts as "surface" layer for background/padding.
    -   Columns: `core/columns` with 2 or 3 columns inside the inner group.

**Column Layout (Recommended)**:
-   **Column 1**: `core/site-title` + `core/paragraph` (Copyright).
    -   Copyright default: "© [YEAR] [Site Title]. All rights reserved."
-   **Column 2**: Optional Heading ("Quick links") + `core/page-list`.
-   **Column 3**: Optional `core/social-links`.

**Prohibitions**:
-   No overlay-style navigation in footer.
-   No custom HTML blocks for layout.
-   No extra nested Groups beyond the required Outer/Inner structure.

## 8. Canonical Template Set V1.0 (Golden V1.2)
**Rule**: The theme must provide, at minimum, these templates:
-   `templates/index.html`
-   `templates/page.html`
-   `templates/single.html`
-   `templates/archive.html`
-   `templates/search.html`
-   `templates/404.html`

**Structure**:
-   **Header**: Include Canonical Header Pattern V1.2 via `template-part` (`slug: "header"`).
-   **Footer**: Include Canonical Footer Pattern V1.0 via `template-part` (`slug: "footer"`).
-   **Main Content**:
    -   Outer `core/group` with `tagName: "main"`.
    -   Inner `core/group` with constrained/wide layout.

**Prohibitions**:
-   No overlay menus.
-   No `core/html` blocks for structure.
-   No wrapping header/footer inside extra layout blocks.


