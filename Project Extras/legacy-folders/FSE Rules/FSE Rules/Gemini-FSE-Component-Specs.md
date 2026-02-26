# Gemini FSE Component Specs (From Notebook)

This plan outlines the detailed specifications for every major component of a WordPress Full Site Editing (FSE) theme. It is designed to guide an AI theme generator to create a stable, "Attempt Recovery"-free theme where `theme.json` acts as the single source of truth and the Global Styles interface functions correctly.

### 1. The Global "Brain" Component: `theme.json`
Before defining visual components (Logo, Nav, etc.), the generator must build the rulebook that controls them.

*   **Role:** Centralizes styles, settings, and layout logic.
*   **Specs:** Must use **Version 2** or **Version 3** schema.
*   **Should Have:**
    *   `"appearanceTools": true`: **Mandatory.** This exposes UI controls for margins, padding, border radius, and link colors in the editor.
    *   `"layout"`: Define `contentSize` (e.g., `800px`) and `wideSize` (e.g., `1200px`) here. This controls alignment for all components below.
    *   `"typography" > "fluid": true`: Enable fluid typography so fonts scale automatically between mobile and desktop.
    *   `"spacing" > "spacingScale"`: Define spacing presets (t-shirt sizing like small, medium, large) to ensure consistent padding between components.
*   **Should NOT Have:**
    *   Hardcoded color values in `styles`. Instead, define a **Palette** in `settings` and reference them as variables (e.g., `var(--wp--preset--color--brand)`) in `styles`. This allows users to change a color globally via the Site Editor.

---

### 2. Component: Site Logo
*   **Role:** The brand identity image.
*   **File Location:** Placed inside `parts/header.html`.
*   **Block Markup:** `<!-- wp:site-logo {"width":120,"shouldSyncIcon":true} /-->`
*   **Specs:**
    *   The generator should treat this as a placeholder block that users populate.
    *   **Important:** WordPress 6.5+ allows managing the Site Icon (favicon) via General Settings, but the Site Logo block is strictly for the visual logo on the page.
*   **Should Have:**
    *   `"shouldSyncIcon": false`: If you want the logo to be independent of the favicon. If true, updating the logo updates the browser tab icon.
    *   Pre-defined width constraint in `theme.json` (e.g., `styles.blocks.core/site-logo`) to prevent massive image blowouts on upload.
*   **Should NOT Have:**
    *   Inline `style="..."` attributes for dimensions if possible. Use `theme.json` to enforce max-width limits to maintain the design system integrity.

---

### 3. Component: Site Title
*   **Role:** The text-based name of the site (SEO H1 on home, usually div or p on other pages).
*   **File Location:** `parts/header.html`.
*   **Block Markup:** `<!-- wp:site-title /-->`
*   **Specs:**
    *   Must inherit typography settings from `theme.json`.
*   **Should Have:**
    *   **Typography Consistency:** Ensure the font family matches the Navigation block font settings in `theme.json` for a cohesive header look.
    *   **Link Toggle:** Ensure the block is configured to link to home (default behavior, but explicitly checking the setting is good practice).
*   **Should NOT Have:**
    *   Hardcoded colors in the HTML markup. If the header background is dark, define the Site Title color in `theme.json` under `styles.elements.link` or `styles.blocks.core/site-title` to ensure readability.

---

### 4. Component: Navigation (The Menu)
*   **Role:** Main site links. This is the most fragile component regarding "Attempt Recovery" errors.
*   **File Location:** `parts/header.html`.
*   **Block Markup:** `<!-- wp:navigation {"layout":{"type":"flex","orientation":"horizontal"}} --> ... <!-- /wp:navigation -->`
*   **Specs:**
    *   **Crucial:** Do not rely on PHP menu registration or `wp_nav_menu` for the initial setup. The AI must write **hardcoded** inner blocks (Page Links) inside the Navigation block markup in the HTML file. This ensures the menu exists immediately upon theme activation.
*   **Should Have:**
    *   **Interactivity States:** Define `:hover` and `:focus` states in `theme.json` under `styles.blocks.core/navigation.elements.link`. This allows the menu to change color when hovered without custom CSS.
    *   **Overlay Menu:** Configure the `overlayMenu` attribute (off, mobile, or always) in the block markup to control the "Hamburger" menu behavior.
*   **Should NOT Have:**
    *   Reference to a database ID (`"ref": 123`). The generator must create a **local** navigation menu (inner blocks) to avoid dependencies on database items that don't exist on a fresh install.

---

### 5. Component: Header Container
*   **Role:** Wraps Logo, Title, and Nav.
*   **File Location:** `parts/header.html` (Registered in `theme.json` under `templateParts`).
*   **Block Markup:** `<!-- wp:group {"tagName":"header","layout":{"type":"flex","justifyContent":"space-between"}} -->`
*   **Specs:**
    *   Must use semantic HTML tag `<header>` via the `tagName` attribute.
*   **Should Have:**
    *   **Sticky Positioning:** If requested, add `"style":{"position":{"type":"sticky","top":"0px"}}` to the Group block to make it stick to the top of the screen.
    *   **Padding Awareness:** If the header is full-width, use `theme.json` setting `useRootPaddingAwareAlignments: true` to ensure the header content aligns with the rest of the page content while the background stretches full width.
*   **Should NOT Have:**
    *   Fixed heights. Allow the content (logo/nav) to dictate the height to prevent responsiveness issues.

---

### 6. Component: Main Content Area
*   **Role:** Displays the page content or blog loop.
*   **File Location:** `templates/index.html` (and others).
*   **Block Markup:**
    ```html
    <!-- wp:group {"tagName":"main","layout":{"type":"constrained"}} -->
      <!-- wp:post-content /-->
    <!-- /wp:group -->
    ```
*   **Specs:**
    *   Must use the `core/post-content` block.
    *   Must be wrapped in a block with `"tagName":"main"` for accessibility.
*   **Should Have:**
    *   **Constrained Layout:** The wrapper Group block must have `layout: {"type": "constrained"}`. This forces the content to respect the `contentSize` defined in `theme.json` (e.g., 800px) while allowing "Wide" and "Full" alignment blocks to break out of the container.
*   **Should NOT Have:**
    *   Multiple `<h1>` tags. Ensure the template only has one H1 (usually the Post Title block).

---

### 7. Component: Footer
*   **Role:** Copyright, widgets, secondary links.
*   **File Location:** `parts/footer.html` (Registered in `theme.json` under `templateParts`).
*   **Specs:**
    *   Semantic tag `<footer>`.
*   **Should Have:**
    *   **Patterns:** Since footers can be complex (columns, social icons), the AI should generate a **Pattern** for the footer columns and reference it in the template part if the layout is complex.
    *   **Dynamic Date:** Use a short bit of PHP or a specialized block for the copyright year so it doesn't become outdated `© <?php echo date('Y'); ?>`.
*   **Should NOT Have:**
    *   Hardcoded links to "Home" or "About" that might change. Use dynamic Page List blocks or Navigation blocks.

---

### 8. Summary Checklist for the AI Generator

To ensure the "successful site" requirement is met:

1.  **Structure:** Generate `theme.json`, `style.css`, `functions.php` (clean, only page creation), `templates/`, and `parts/`.
2.  **theme.json:** Use Version 2/3. Set `appearanceTools: true`. Define color palette and layout widths.
3.  **Navigation:** Hardcode `core/navigation-link` blocks inside `parts/header.html` to guarantee a visible menu on activation.
4.  **Templates:** Ensure `index.html` exists as the fallback. Create `front-page.html` for the custom homepage layout.
5.  **Validation:** Ensure JSON is valid (no trailing commas) to prevent the "Attempt Recovery" error.
