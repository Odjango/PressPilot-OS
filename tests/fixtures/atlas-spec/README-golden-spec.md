# PressPilot Golden Spec (Block Theme Skeleton)

This folder defines the **canonical, known-good block theme structure** that all
PressPilot theme generators MUST follow.

It is **not** a random example theme. It is the *law*:

- `golden-theme.json`  
  A clone of Twenty Twenty-Four’s theme.json, used as the base design system.
  AI is allowed to change **values** (colors, fonts, spacing) but **never** the
  structure of keys, slugs, or preset names.

- `parts/header.html`  
  Golden header structure: logo + site title left, navigation right. AI may
  adjust padding, alignment, and colors, but not the block types or nesting.

- `parts/footer.html`  
  Simple, stable footer pattern using site title and credits. Safe to restyle.

- `templates/index.html`  
  Golden index template: header → main group → patterns → footer. AI may swap
  which patterns are used, but must keep the header/main/footer structure.

- `patterns/*.html`  
  Example patterns to show how patterns should be structured. AI generators
  should create new patterns using the same basic shape.

See `golden-theme-rules.md` for the detailed “DO / DON’T” rules that agents
must follow when they generate themes.
