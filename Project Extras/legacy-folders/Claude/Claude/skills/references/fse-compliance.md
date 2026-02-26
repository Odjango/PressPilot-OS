# WordPress FSE Theme Compliance

## ⚠️ MANDATORY: FSE Only

PressPilot generates **FSE block themes exclusively**. If you see classic PHP template files being created (`header.php`, `footer.php`, `single.php`, `archive.php`, `page.php`, etc.), STOP - this is wrong.

The ONLY PHP files allowed in a PressPilot theme:
- `functions.php` - for enqueuing scripts/styles and theme setup
- `index.php` - WordPress fallback requirement (can be nearly empty)

## What is FSE (Full Site Editing)?

FSE = WordPress's block-based theme system. Instead of PHP templates, themes use HTML files with block markup. Introduced in WordPress 5.9+.

## Required Structure

```
theme-name/
├── style.css              # Theme metadata
├── theme.json             # Design tokens, settings
├── functions.php          # PHP code (optional but recommended)
├── index.php              # Fallback (required for WP)
├── templates/             # Block templates
│   ├── index.html         # Default template (required)
│   ├── single.html        # Single post
│   ├── page.html          # Single page
│   ├── archive.html       # Archive pages
│   ├── 404.html           # Not found
│   └── search.html        # Search results
├── parts/                 # Reusable template parts
│   ├── header.html
│   ├── footer.html
│   └── sidebar.html
└── patterns/              # Block patterns (optional)
    └── example-pattern.php
```

## theme.json Essentials

```json
{
  "$schema": "https://schemas.wp.org/trunk/theme.json",
  "version": 3,
  "settings": {
    "appearanceTools": true,
    "color": {
      "palette": [
        {"slug": "primary", "color": "#1a1a1a", "name": "Primary"},
        {"slug": "secondary", "color": "#666666", "name": "Secondary"}
      ]
    },
    "typography": {
      "fontFamilies": [
        {
          "fontFamily": "system-ui, sans-serif",
          "slug": "system",
          "name": "System"
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
      "text": "var(--wp--preset--color--primary)"
    }
  },
  "templateParts": [
    {"name": "header", "area": "header", "title": "Header"},
    {"name": "footer", "area": "footer", "title": "Footer"}
  ]
}
```

## Block Template Syntax

Templates are HTML with special WordPress block comments.

### Basic block
```html
<!-- wp:paragraph -->
<p>This is a paragraph.</p>
<!-- /wp:paragraph -->
```

### Self-closing block
```html
<!-- wp:site-title /-->
<!-- wp:post-content /-->
```

### Block with attributes
```html
<!-- wp:group {"layout":{"type":"constrained"}} -->
<div class="wp-block-group">
  <!-- inner blocks here -->
</div>
<!-- /wp:group -->
```

### Template part reference
```html
<!-- wp:template-part {"slug":"header","tagName":"header"} /-->
```

## Common FSE Blocks

| Block | Markup |
|-------|--------|
| Site Title | `<!-- wp:site-title /-->` |
| Site Logo | `<!-- wp:site-logo /-->` |
| Navigation | `<!-- wp:navigation /-->` |
| Post Title | `<!-- wp:post-title /-->` |
| Post Content | `<!-- wp:post-content /-->` |
| Post Featured Image | `<!-- wp:post-featured-image /-->` |
| Query Loop | `<!-- wp:query -->...<!-- /wp:query -->` |
| Group | `<!-- wp:group -->...<!-- /wp:group -->` |
| Columns | `<!-- wp:columns -->...<!-- /wp:columns -->` |
| Cover | `<!-- wp:cover -->...<!-- /wp:cover -->` |

## Minimal Valid index.html

```html
<!-- wp:template-part {"slug":"header","tagName":"header"} /-->

<!-- wp:group {"tagName":"main","layout":{"type":"constrained"}} -->
<main class="wp-block-group">
  <!-- wp:post-content /-->
</main>
<!-- /wp:group -->

<!-- wp:template-part {"slug":"footer","tagName":"footer"} /-->
```

## PressPilot-Specific Requirements

1. **Footer must include PressPilot credit**
   ```html
   <!-- wp:paragraph {"align":"center"} -->
   <p class="has-text-align-center">Powered by <a href="https://presspilotapp.com">PressPilot</a></p>
   <!-- /wp:paragraph -->
   ```

2. **Use CSS custom properties from theme.json**
   - Colors: `var(--wp--preset--color--primary)`
   - Spacing: `var(--wp--preset--spacing--50)`
   - Fonts: `var(--wp--preset--font-family--system)`

3. **Support RTL for Arabic**
   - Use `dir="rtl"` attribute when Arabic selected
   - Use logical properties: `margin-inline-start` not `margin-left`

4. **Light/Dark mode**
   - Define both palettes in theme.json
   - Use CSS class toggle: `.is-dark-mode`
