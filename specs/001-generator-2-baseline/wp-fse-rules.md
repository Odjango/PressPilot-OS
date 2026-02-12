# WordPress FSE Block Rules

## Block Markup Format

Every block follows this structure:
```html
<!-- wp:block-name {"attr":"value"} -->
<div class="wp-block-name">Content</div>
<!-- /wp:block-name -->
```

## Common Blocks Reference

### Cover Block
```html
<!-- wp:cover {"overlayColor":"contrast","minHeight":500} -->
<div class="wp-block-cover">
  <span class="wp-block-cover__background has-contrast-background-color"></span>
  <div class="wp-block-cover__inner-container">
    <!-- nested content -->
  </div>
</div>
<!-- /wp:cover -->
```

### Columns Block
```html
<!-- wp:columns -->
<div class="wp-block-columns">
  <!-- wp:column {"width":"50%"} -->
  <div class="wp-block-column" style="flex-basis:50%">
    <!-- content -->
  </div>
  <!-- /wp:column -->
</div>
<!-- /wp:columns -->
```

### Buttons Block
```html
<!-- wp:buttons -->
<div class="wp-block-buttons">
  <!-- wp:button {"className":"is-style-fill"} -->
  <div class="wp-block-button is-style-fill">
    <a class="wp-block-button__link wp-element-button">Click Me</a>
  </div>
  <!-- /wp:button -->
</div>
<!-- /wp:buttons -->
```

### Group Block
```html
<!-- wp:group {"layout":{"type":"constrained"}} -->
<div class="wp-block-group">
  <!-- content -->
</div>
<!-- /wp:group -->
```

## Validation Errors to Avoid

| Error | Cause | Fix |
|-------|-------|-----|
| Block validation failed | Mismatched opening/closing comments | Ensure `<!-- wp:x -->` matches `<!-- /wp:x -->` |
| Invalid JSON | Bad attributes | Validate JSON in block comment |
| Unexpected block | Wrong nesting | Check parent-child relationships |
| Unknown block | Typo in block name | Use exact WP core block names |

## theme.json Requirements
```json
{
  "version": 3,
  "settings": {
    "color": {
      "palette": [
        {"slug": "base", "color": "#ffffff", "name": "Base"},
        {"slug": "contrast", "color": "#000000", "name": "Contrast"},
        {"slug": "accent", "color": "#3366ff", "name": "Accent"}
      ]
    },
    "typography": {
      "fontSizes": [
        {"slug": "small", "size": "14px", "name": "Small"},
        {"slug": "medium", "size": "18px", "name": "Medium"}
      ]
    }
  }
}
```

## Required Color Slugs
- `base` — Light background/text
- `contrast` — Dark background/text  
- `accent` — Brand color for CTAs

## PressPilot Pattern Rules

1. All patterns export a function returning block markup string
2. Use placeholder tokens: `{{business_name}}`, `{{tagline}}`, etc.
3. Apply `sanitizeForPHP()` to all user content
4. Test across all 4 brand modes before committing