# PressPilot Golden Contract
*Target Compliance: V2.0 (Refless & Integrity)*

> [!IMPORTANT]
> This contract supercedes `golden-theme-rules.md` where conflicts exist. This is the **Supreme Law** for the Generator and Validator pipelines.

## 1. Navigation Architecture ("The Refless Rule")
**Rule**: The theme MUST NOT reference database-stored navigation menus by ID or Ref.
**Constraint**: `<!-- wp:navigation {"ref":...} -->` is **STRICTLY PROHIBITED**.
**Mechanism**:
-   Navigation must be "Inline" (contained entirely within `parts/header.html`).
-   Navigation items must be `<!-- wp:navigation-link -->` blocks nested directly inside the `wp:navigation` block.
-   **Why?** Database refs (Post IDs) are unstable across site installs. Inline navigation ensures 100% portability.

## 2. Preset Integrity ("The Verified Token Rule")
**Rule**: Every CSS variable preset used in templates/patterns MUST exist in `theme.json`.
**Constraint**: Usage of `var(--wp--preset--color--foo)` is prohibited unless `foo` is defined in `settings.color.palette`.
**Scope**:
-   Colors (`--wp--preset--color--*`)
-   Font Sizes (`--wp--preset--font-size--*`)
-   Font Families (`--wp--preset--font-family--*`)
-   Spacing (`--wp--preset--spacing--*`)

## 3. Front-Page Structural Validity
**Rule**: `front-page.html` must be a self-contained, valid block structure.
**Constraint**:
-   **No Orphaned Content**: Usage of `<!-- wp:post-content /-->` in `front-page.html` is **DISCOURAGED** unless the theme specifically intends to render the DB-content of the page assigned as Front.
-   **Explicit Structure**: The Front Page should primarily consist of Patterns (Hero, Features, Testimonials) defined in the theme, ensuring it looks correct immediately upon activation without user content entry.
-   **Locked Layout**: Root blocks should usually be `wp:group` with `layout:{"type":"constrained"}` or `align:full`.

## Definition of Done (Validator Checklist)
The Generator build is considered "Green" ONLY when the Validator confirms:

-   [ ] **Zero Nav Refs**: `grep` check for `"ref":` inside `wp:navigation` returns 0 hits.
-   [ ] **Zero Missing Presets**: All extracted var-refs map to valid `theme.json` keys.
-   [ ] **Valid JSON**: All `theme.json` and block JSON comments are parseable.
-   [ ] **Asset Existence**: All referenced images/assets exist in the build folder.
