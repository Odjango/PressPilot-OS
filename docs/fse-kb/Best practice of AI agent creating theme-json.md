<img src="https://r2cdn.perplexity.ai/pplx-full-logo-primary-dark%402x.png" style="height:64px;margin-right:32px"/>

# What is the best practice of AI agent creating "theme.json" file in creating a modern WP FSE  theme for a heavy content website for both scenarios A) Create a new theme from scratch. B) Converting a statice site to a modern WP FSE theme website ?

Here is a comprehensive breakdown of `theme.json` best practices for both scenarios in a modern WordPress FSE theme built for a **heavy content website** (like a news portal, magazine, documentation hub, or blog-heavy SaaS):

***

## The Foundation: What theme.json Must Always Include

Regardless of scenario, every modern `theme.json` should begin with these non-negotiable top-level entries:[^1]

```json
{
  "$schema": "https://schemas.wp.org/trunk/theme.json",
  "version": 3
}
```

The `$schema` line unlocks IntelliSense autocomplete and real-time validation in VS Code — it turns the file from a guessing game into a documented API. Always use **version 3**, introduced in WordPress 6.6, which provides the latest schema features and better CSS custom property generation.[^2][^1]

***

## Scenario A: Building a New Theme from Scratch

When creating an FSE theme for a content-heavy site, your AI agent should build `theme.json` in the following layered order:

### 1. Layout \& Content Width First

Define your reading width early — this is critical for heavy text content:[^2]

```json
"settings": {
  "layout": {
    "contentSize": "800px",
    "wideSize": "1280px"
  }
}
```

For content-heavy sites, `contentSize` around 700–800px is optimal for reading comfort. `wideSize` is used for full-bleed images and featured sections.

### 2. Design Tokens (Colors, Typography, Spacing)

Encode your entire design system as presets. This prevents content editors from breaking the design:[^1]

- **Colors** — Define a named palette (`primary`, `secondary`, `neutral`, `contrast`, `base`) and set `"custom": false` and `"customGradient": false` to lock out ad-hoc color pickers
- **Fluid Typography** — Enable `"fluid": true` under `typography` for responsive font scaling without media queries, crucial when serving content across device sizes[^2]
- **Spacing Presets** — Use numbered slugs (`10`, `20`, `30`...) to create a consistent spacing scale users pick from dropdowns

```json
"typography": {
  "fluid": true,
  "fontFamilies": [...],
  "fontSizes": [...]
},
"color": {
  "custom": false,
  "customGradient": false,
  "palette": [...]
}
```


### 3. Enable Appearance Tools

Set `"appearanceTools": true` as a shortcut to enable borders, margins, padding, block gap, and typography controls in the editor all at once. This is especially important for heavy content layouts.[^2]

### 4. Self-Host Fonts via `fontFace`

Use the `fontFace` declaration inside `fontFamilies` to bundle fonts locally instead of pulling from Google Fonts CDN:[^2]

```json
"fontFace": [
  {
    "fontFamily": "Inter",
    "fontWeight": "700",
    "src": ["file:./assets/fonts/inter-bold.woff2"]
  }
]
```

This improves both GDPR compliance and Core Web Vitals — critical for content sites prioritizing SEO.

### 5. Block-Level Overrides in `styles.blocks`

For a content-heavy theme, configure specific blocks that will be used heavily:[^1]

```json
"styles": {
  "blocks": {
    "core/paragraph": { "typography": { "lineHeight": "1.8" } },
    "core/heading": { "typography": { "fontWeight": "700" } },
    "core/code": { "color": { "background": "#1a1a2e" } },
    "core/quote": { "border": { "left": "4px solid var(--wp--preset--color--primary)" } }
  }
}
```


### 6. Register templateParts and customTemplates

Register content-specific templates like `single-article`, `landing-page`, and `blank` in the top-level keys:[^3]

```json
"templateParts": [
  { "name": "header", "title": "Header", "area": "header" },
  { "name": "footer", "title": "Footer", "area": "footer" },
  { "name": "sidebar", "title": "Sidebar", "area": "uncategorized" }
],
"customTemplates": [
  { "name": "blank", "title": "Blank", "postTypes": ["page"] },
  { "name": "full-width-article", "title": "Full Width Article", "postTypes": ["post"] }
]
```


***

## Scenario B: Converting a Static Site to FSE

The conversion process requires `theme.json` to act as a **design token bridge** — it must replicate the static site's existing visual system before a single template is touched.[^2]

### Step 1: Audit Before You Write

Before generating `theme.json`, the AI agent must extract from the static site:[^2]

- All hex colors used (map to named palette slugs)
- All font families and weights (map to `fontFamilies`)
- Font sizes used (map to `fontSizes` with `rem` values)
- Max content width and wide/full-bleed widths (map to `layout`)
- Spacing values (map to `spacingSizes`)


### Step 2: Write theme.json as the First File

`theme.json` should be the **very first file created** — before any templates — so that visual consistency is established before block markup is written. If you start with templates first, every block will inherit WordPress defaults instead of your design system.[^2]

### Step 3: Hybrid Theme Strategy for Safe Migration

Add `theme.json` to the existing classic/static theme initially to gradually adopt FSE features without breaking anything. WordPress supports hybrid themes that mix PHP and HTML templates:[^2]

- Start by converting simple templates: `404.html`, `search.html`
- Then move to `page.html`, `single.html`
- Convert complex layouts (archives, custom post types) last


### Step 4: Map Static CSS → theme.json Styles

Replace your static CSS rules with `theme.json` equivalents to avoid duplicate cascade conflicts:[^1]


| Static CSS | theme.json Equivalent |
| :-- | :-- |
| `body { font-family: ... }` | `styles.typography.fontFamily` |
| `a { color: ... }` | `styles.elements.link.color.text` |
| `h1 { font-size: ... }` | `styles.elements.h1.typography.fontSize` |
| `.container { max-width: ... }` | `settings.layout.contentSize` |
| `button { border-radius: ... }` | `styles.blocks.core/button.border.radius` |

WordPress auto-generates CSS custom properties from your presets (e.g., `var(--wp--preset--color--primary)`), so referencing them in `styles` ensures a single source of truth.[^1]

### Step 5: Validate with Schema Before Deploying

A single missing comma in `theme.json` breaks the entire file silently. Always validate JSON syntax using the `$schema` URI and a linter before pushing to production.[^2]

***

## Heavy Content Site-Specific Configurations

These settings are especially important for news, documentation, or article-heavy sites:

- **`blockGap`** — Set a comfortable `1.5rem`–`2rem` in `styles.spacing.blockGap` for readable vertical rhythm between content blocks[^2]
- **Disable custom colors/sizes** — Lock design controls with `"custom": false` so editors can't accidentally break typography or color consistency[^1]
- **`core/query` block defaults** — Configure Query Loop block defaults in `settings.blocks` for consistent archive/listing page rendering
- **Style variations** — Create alternate JSON files in `/styles/` (e.g., `styles/dark-mode.json`) for content display flexibility without duplicating the entire `theme.json`[^2]
- **`wp_enqueue_block_style()`** — Use this function for any custom block CSS so it only loads when that block is actually present on the page — critical for performance on content-heavy pages with many block types[^2]
<span style="display:none">[^10][^11][^12][^13][^14][^15][^4][^5][^6][^7][^8][^9]</span>

<div align="center">⁂</div>

[^1]: https://deliciousbrains.com/the-anatomy-of-theme-json-a-developers-cheat-sheet/

[^2]: https://attowp.com/wordpress-development/wordpress-full-site-editing-guide/

[^3]: https://www.advancedcustomfields.com/blog/wordpress-theme-json/

[^4]: https://developer.wordpress.org/news/2025/11/how-wordpress-6-9-gives-forms-a-theme-json-makeover/

[^5]: https://www.reddit.com/r/Wordpress/comments/1pbcnj2/be_honest_end_of_2025_should_we_fully_switch_to/

[^6]: https://jetpack.com/resources/wordpress-theme-json/

[^7]: https://www.wpdownloadmanager.com/theme-json-file/

[^8]: https://www.codeable.io/blog/convert-html-to-wordpress-theme/

[^9]: https://wpengine.com/resources/decode-modern-theming-full-site-editing-and-beyond/

[^10]: https://community.latenode.com/t/whats-the-best-way-to-turn-a-static-html-site-into-a-wordpress-template/35626

[^11]: https://olliewp.com/wordpress-full-site-editing/

[^12]: https://fullsiteediting.com/lessons/global-styles/

[^13]: https://www.youtube.com/watch?v=X2TCO5ESvbk

[^14]: https://hackmd.io/@gplitems/Syao_45r-l

[^15]: https://developer.wordpress.org/block-editor/how-to-guides/themes/global-settings-and-styles/

