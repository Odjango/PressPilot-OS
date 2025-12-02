# Golden Spec: The Source of Truth

**CRITICAL:** This directory (`golden-spec/`) is the **single source of truth** for all generated themes.

## The Rule of Law
1.  **Do NOT** invent theme structure in TypeScript (`buildWpTheme.ts`).
2.  **Do NOT** construct HTML strings in code.
3.  **ALWAYS** define templates, patterns, and settings in this directory.
4.  The build script (`scripts/buildWpTheme.ts`) is a **dumb copier**. Its only job is to copy files from here and replace simple placeholders (e.g. `{{THEME_NAME}}`).

## Directory Structure
-   `golden-theme.json`: The canonical `theme.json`. Defines layout (840px), colors, and typography.
-   `templates/`: Canonical block templates (e.g. `page.html` with `align: full`).
-   `parts/`: Canonical template parts (Header, Footer).
-   `patterns/`:
    -   `seed-hero.html`: **MUST** use `align: full` for the outer wrapper and constrained inner content.
    -   `seed-*.html`: HTML fragments for seeded content (Hero, Details, Features).
    -   `page-*.php`: Full page patterns (About, Services, etc.).
-   `navigation.json`: The blueprint for the Primary Navigation menu.

## Validation Rules
The build script enforces the following:
-   All required Golden Spec files must exist.
-   `navigation.json` must be a valid JSON array.
-   Placeholders in `navigation.json` must be preserved until runtime replacement.

## How to Make Changes
-   **Want to change the layout?** Edit `golden-theme.json`.
-   **Want to change the About page?** Edit `patterns/page-about.php`.
-   **Want to add a menu item?** Edit `navigation.json`.

**NEVER** modify the build script to change the theme's look or structure.
