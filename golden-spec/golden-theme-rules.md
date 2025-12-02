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
