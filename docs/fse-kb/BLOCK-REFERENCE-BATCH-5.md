# BLOCK-REFERENCE.md - BATCH 5
**WordPress Core Blocks Markup Reference for AI Coding Agents**  
*Target: WordPress 6.7+ Block Library*

**BATCH 5: SITE BLOCKS**

---

## 1. SITE-TITLE BLOCK

**Block Name:** `core/site-title`

**Purpose:** Displays the site title (blogname) from WordPress settings. Updates globally when changed.

**Block Type:** Dynamic block (rendered server-side)

### Attributes

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `level` | number | `1` | Heading level (0 for paragraph, 1-6 for h1-h6) |
| `levelOptions` | array | `[0,1,2,3,4,5,6]` | Available heading levels in UI dropdown |
| `textAlign` | string | undefined | Text alignment (`"left"`, `"center"`, `"right"`) |
| `isLink` | boolean | `true` | Whether to wrap title in link to homepage |
| `linkTarget` | string | `"_self"` | Link target attribute (`"_self"` or `"_blank"`) |
| `className` | string | undefined | Additional CSS classes |

### HTML Structure

**Basic Site Title (as H1 Link - Default):**
```html
<!-- wp:site-title /-->

<!-- Renders as: -->
<h1 class="wp-block-site-title">
  <a href="https://example.com" target="_self" rel="home">My Site Name</a>
</h1>
```

**Site Title with aria-current (on homepage):**
```html
<!-- On homepage, renders as: -->
<h1 class="wp-block-site-title">
  <a href="https://example.com" target="_self" rel="home" aria-current="page">My Site Name</a>
</h1>
```

**Site Title as H2:**
```html
<!-- wp:site-title {"level":2} /-->

<!-- Renders as: -->
<h2 class="wp-block-site-title">
  <a href="https://example.com" target="_self" rel="home">My Site Name</a>
</h2>
```

**Site Title as Paragraph (level: 0):**
```html
<!-- wp:site-title {"level":0} /-->

<!-- Renders as: -->
<p class="wp-block-site-title">
  <a href="https://example.com" target="_self" rel="home">My Site Name</a>
</p>
```

**Site Title Without Link:**
```html
<!-- wp:site-title {"isLink":false} /-->

<!-- Renders as: -->
<h1 class="wp-block-site-title">My Site Name</h1>
```

**Site Title with Text Alignment:**
```html
<!-- wp:site-title {"textAlign":"center"} /-->

<!-- Renders as: -->
<h1 class="wp-block-site-title has-text-align-center">
  <a href="https://example.com" target="_self" rel="home">My Site Name</a>
</h1>
```

**Site Title Opening in New Tab:**
```html
<!-- wp:site-title {"linkTarget":"_blank"} /-->

<!-- Renders as: -->
<h1 class="wp-block-site-title">
  <a href="https://example.com" target="_blank" rel="home">My Site Name</a>
</h1>
```

**Site Title with Custom Colors:**
```html
<!-- wp:site-title {"textColor":"primary"} /-->

<!-- Renders as: -->
<h1 class="wp-block-site-title has-primary-color has-text-color">
  <a href="https://example.com" target="_self" rel="home">My Site Name</a>
</h1>
```

### Allowed Inner Blocks

**NONE** - Site title is rendered dynamically from site settings.

### CSS Classes Applied

**Base class:** `wp-block-site-title` (always present)

**Text alignment classes:**
- `has-text-align-left` when `textAlign: "left"`
- `has-text-align-center` when `textAlign: "center"`
- `has-text-align-right` when `textAlign: "right"`

**Color classes:**
- `has-{color-slug}-color` - text color
- `has-text-color` - indicates text color is set
- `has-link-color` - when link color is set via style attribute

### Level to HTML Tag Mapping

| level value | HTML tag |
|------------|----------|
| `0` | `<p>` |
| `1` | `<h1>` (default) |
| `2` | `<h2>` |
| `3` | `<h3>` |
| `4` | `<h4>` |
| `5` | `<h5>` |
| `6` | `<h6>` |

### Common Mistakes

❌ **WRONG:** Hardcoding site title text
```html
<h1 class="wp-block-site-title">
  <a href="/">My Hardcoded Site</a>
</h1>
```

✅ **CORRECT:** Self-closing block (dynamic rendering)
```html
<!-- wp:site-title /-->
```

❌ **WRONG:** Missing rel="home" on link
```html
<h1 class="wp-block-site-title">
  <a href="/" target="_self">Site Name</a>
</h1>
```

✅ **CORRECT:** Always includes rel="home"
```html
<h1 class="wp-block-site-title">
  <a href="/" target="_self" rel="home">Site Name</a>
</h1>
```

❌ **WRONG:** Wrong tag for level attribute
```html
<!-- wp:site-title {"level":2} /-->
<!-- Renders as h1 instead of h2 -->
```

✅ **CORRECT:** Tag matches level attribute
```html
<!-- wp:site-title {"level":2} /-->
<!-- Renders as: -->
<h2 class="wp-block-site-title">...</h2>
```

---

## 2. SITE-LOGO BLOCK

**Block Name:** `core/site-logo`

**Purpose:** Displays the site logo (custom logo) from WordPress settings. Updates globally when changed.

**Block Type:** Dynamic block (rendered server-side)

### Attributes

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `width` | number | undefined | Logo width in pixels |
| `isLink` | boolean | `true` | Whether to wrap logo in link to homepage |
| `linkTarget` | string | `"_self"` | Link target attribute |
| `shouldSyncIcon` | boolean | undefined | Whether to sync with site icon |
| `align` | string | undefined | Block alignment |
| `className` | string | undefined | Additional CSS classes |

### HTML Structure

**Basic Site Logo (with link - default):**
```html
<!-- wp:site-logo /-->

<!-- Renders as (when logo is set): -->
<div class="wp-block-site-logo">
  <a href="https://example.com" class="custom-logo-link" rel="home" aria-current="page">
    <img width="200" height="100" src="https://example.com/logo.png" class="custom-logo" alt="Site Name" />
  </a>
</div>
```

**Site Logo with Custom Width:**
```html
<!-- wp:site-logo {"width":150} /-->

<!-- Renders as: -->
<div class="wp-block-site-logo">
  <a href="https://example.com" class="custom-logo-link" rel="home">
    <img width="150" height="75" src="https://example.com/logo.png" class="custom-logo" alt="Site Name" />
  </a>
</div>
```

**Site Logo Without Link:**
```html
<!-- wp:site-logo {"isLink":false} /-->

<!-- Renders as: -->
<div class="wp-block-site-logo">
  <img width="200" height="100" src="https://example.com/logo.png" class="custom-logo" alt="Site Name" />
</div>
```

**Site Logo Aligned Center:**
```html
<!-- wp:site-logo {"align":"center"} /-->

<!-- Renders as: -->
<div class="wp-block-site-logo aligncenter">
  <a href="https://example.com" class="custom-logo-link" rel="home">
    <img width="200" height="100" src="https://example.com/logo.png" class="custom-logo" alt="Site Name" />
  </a>
</div>
```

**Site Logo Opening in New Tab:**
```html
<!-- wp:site-logo {"linkTarget":"_blank"} /-->

<!-- Renders as: -->
<div class="wp-block-site-logo">
  <a href="https://example.com" target="_blank" class="custom-logo-link" rel="home">
    <img width="200" height="100" src="https://example.com/logo.png" class="custom-logo" alt="Site Name" />
  </a>
</div>
```

**No Logo Set (returns empty string):**
```html
<!-- wp:site-logo /-->

<!-- When no logo is configured, renders as: -->
<!-- Nothing (empty string returned to avoid wrapper div) -->
```

### Allowed Inner Blocks

**NONE** - Site logo is rendered dynamically from site settings.

### CSS Classes Applied

**Base class:** `wp-block-site-logo` (always present on wrapper div)

**Image classes:**
- `custom-logo` (on img element)

**Link classes:**
- `custom-logo-link` (on a element when isLink is true)

**Alignment classes:**
- `aligncenter` when `align: "center"`
- `alignleft` when `align: "left"`
- `alignright` when `align: "right"`

### Width Behavior

When `width` attribute is set:
- Automatically calculates proportional `height` based on original aspect ratio
- Applies `width` and `height` attributes to `<img>` tag
- Maintains aspect ratio of uploaded logo

### Common Mistakes

❌ **WRONG:** Hardcoding logo markup
```html
<div class="wp-block-site-logo">
  <img src="/logo.png" alt="Logo" />
</div>
```

✅ **CORRECT:** Self-closing block (dynamic rendering)
```html
<!-- wp:site-logo /-->
```

❌ **WRONG:** Missing custom-logo class on img
```html
<img src="logo.png" alt="Site" />
```

✅ **CORRECT:** Includes custom-logo class
```html
<img width="200" height="100" src="logo.png" class="custom-logo" alt="Site Name" />
```

❌ **WRONG:** Wrapper div present when no logo set
```html
<div class="wp-block-site-logo"></div>
```

✅ **CORRECT:** Returns empty string when no logo
```html
<!-- Nothing rendered -->
```

---

## 3. SITE-TAGLINE BLOCK

**Block Name:** `core/site-tagline`

**Purpose:** Displays the site tagline (description) from WordPress settings. Updates globally when changed.

**Block Type:** Dynamic block (rendered server-side)

### Attributes

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `level` | number | `0` | Heading level (0 for paragraph, 1-6 for h1-h6) |
| `levelOptions` | array | `[0,1,2,3,4,5,6]` | Available heading levels in UI dropdown |
| `textAlign` | string | undefined | Text alignment (`"left"`, `"center"`, `"right"`) |
| `className` | string | undefined | Additional CSS classes |

### HTML Structure

**Basic Site Tagline (as paragraph - default):**
```html
<!-- wp:site-tagline /-->

<!-- Renders as: -->
<p class="wp-block-site-tagline">Just another WordPress site</p>
```

**Site Tagline as H2:**
```html
<!-- wp:site-tagline {"level":2} /-->

<!-- Renders as: -->
<h2 class="wp-block-site-tagline">Just another WordPress site</h2>
```

**Site Tagline with Text Alignment:**
```html
<!-- wp:site-tagline {"textAlign":"center"} /-->

<!-- Renders as: -->
<p class="wp-block-site-tagline has-text-align-center">Just another WordPress site</p>
```

**Site Tagline with Custom Colors:**
```html
<!-- wp:site-tagline {"textColor":"secondary"} /-->

<!-- Renders as: -->
<p class="wp-block-site-tagline has-secondary-color has-text-color">Just another WordPress site</p>
```

**Site Tagline with Custom Typography:**
```html
<!-- wp:site-tagline {"fontSize":"small"} /-->

<!-- Renders as: -->
<p class="wp-block-site-tagline has-small-font-size">Just another WordPress site</p>
```

### Allowed Inner Blocks

**NONE** - Site tagline is rendered dynamically from site settings.

### CSS Classes Applied

**Base class:** `wp-block-site-tagline` (always present)

**Text alignment classes:**
- `has-text-align-left` when `textAlign: "left"`
- `has-text-align-center` when `textAlign: "center"`
- `has-text-align-right` when `textAlign: "right"`

**Color classes:**
- `has-{color-slug}-color` - text color
- `has-text-color` - indicates text color is set
- `has-{color-slug}-background-color` - background color
- `has-background` - indicates background is set

**Typography classes:**
- `has-{size-slug}-font-size` - font size preset

### Level to HTML Tag Mapping

| level value | HTML tag |
|------------|----------|
| `0` | `<p>` (default) |
| `1` | `<h1>` |
| `2` | `<h2>` |
| `3` | `<h3>` |
| `4` | `<h4>` |
| `5` | `<h5>` |
| `6` | `<h6>` |

### Common Mistakes

❌ **WRONG:** Hardcoding tagline text
```html
<p class="wp-block-site-tagline">My Custom Tagline</p>
```

✅ **CORRECT:** Self-closing block (dynamic rendering)
```html
<!-- wp:site-tagline /-->
```

❌ **WRONG:** Using h1 by default
```html
<h1 class="wp-block-site-tagline">Tagline</h1>
```

✅ **CORRECT:** Defaults to paragraph (level 0)
```html
<p class="wp-block-site-tagline">Tagline</p>
```

❌ **WRONG:** Wrong tag for level attribute
```html
<!-- wp:site-tagline {"level":3} /-->
<!-- Renders as p instead of h3 -->
```

✅ **CORRECT:** Tag matches level attribute
```html
<!-- wp:site-tagline {"level":3} /-->
<!-- Renders as: -->
<h3 class="wp-block-site-tagline">Tagline</h3>
```

---

## BATCH 5 SUMMARY

**Site blocks documented:** 3  
✅ site-title  
✅ site-logo  
✅ site-tagline

**Key Patterns to Remember:**

1. **All site blocks are dynamic** - rendered server-side, not saved in content
2. **Site title** - default level 1 (H1), default isLink true
3. **Site logo** - default isLink true, auto-calculates height from width
4. **Site tagline** - default level 0 (paragraph)
5. **Level 0** - special case that renders as `<p>` instead of heading
6. **Global updates** - changing site title/logo/tagline in settings updates all instances

**Critical Validation Points:**

**Site Title:**
- Tag must match level attribute (level:2 = h2)
- Level 0 renders as `<p>`, not `<h0>`
- When isLink true, MUST include `rel="home"` attribute
- On homepage with isLink true, includes `aria-current="page"`
- Self-closing block comment (no inner content)

**Site Logo:**
- Returns empty string if no logo configured (no wrapper div)
- When isLink true, link has `custom-logo-link` class
- Image always has `custom-logo` class
- Width attribute auto-calculates proportional height
- Self-closing block comment (no inner content)

**Site Tagline:**
- Defaults to paragraph (level:0), NOT heading
- Level attribute works same as site-title
- No isLink option (tagline is never linked)
- Self-closing block comment (no inner content)

**Dynamic Block Pattern:**

All three site blocks follow this pattern:
```html
<!-- Block comment (self-closing) -->
<!-- wp:site-title /-->
<!-- wp:site-logo /-->
<!-- wp:site-tagline /-->

<!-- HTML rendered server-side on each request -->
<!-- Content pulled from WordPress settings -->
<!-- Updates globally when settings change -->
```

**Level Attribute Special Case:**

```
level: 0 → <p> (paragraph)
level: 1 → <h1>
level: 2 → <h2>
... and so on
```

This is **unique to heading-style blocks** - level 0 is a special WordPress convention for rendering as paragraph instead of heading.

**PressPilot Specific Applications:**

**Header with Site Title and Logo:**
```html
<!-- wp:group {"layout":{"type":"flex","flexWrap":"nowrap","justifyContent":"space-between"}} -->
<div class="wp-block-group">
  <!-- wp:site-logo {"width":120} /-->
  
  <!-- wp:site-title {"level":0,"isLink":true} /-->
</div>
<!-- /wp:group -->
```

**Header with Centered Branding:**
```html
<!-- wp:group {"layout":{"type":"flex","orientation":"vertical","justifyContent":"center"}} -->
<div class="wp-block-group">
  <!-- wp:site-logo {"width":180,"align":"center"} /-->
  <!-- wp:site-title {"textAlign":"center","level":1} /-->
  <!-- wp:site-tagline {"textAlign":"center","fontSize":"small"} /-->
</div>
<!-- /wp:group -->
```

**Footer with Logo and Tagline:**
```html
<!-- wp:group {"layout":{"type":"flex","orientation":"vertical","justifyContent":"center"}} -->
<div class="wp-block-group">
  <!-- wp:site-logo {"width":100,"isLink":false,"align":"center"} /-->
  <!-- wp:site-tagline {"textAlign":"center","textColor":"gray"} /-->
</div>
<!-- /wp:group -->
```

**Sidebar Logo (non-linked):**
```html
<!-- wp:site-logo {"width":80,"isLink":false} /-->
```

### Design Patterns

**Site Title Hierarchy:**
- **Homepage/Main Header:** level 1 (H1) - main site identifier
- **Secondary Headers:** level 0 (paragraph) - when H1 used elsewhere
- **Breadcrumb/Footer:** level 0 (paragraph) - supplementary mention

**Site Logo Sizing:**
- **Desktop Header:** width 150-200px
- **Mobile Header:** width 100-120px
- **Footer:** width 80-120px
- **Sidebar/Widget:** width 60-80px

**Site Tagline Usage:**
- **Below Title in Header:** Small font, subtle color
- **Hero Section:** Larger font, prominent placement
- **Footer:** Small font, muted color
- **SEO:** Always set even if not displayed (helps search engines)

### Accessibility Best Practices

**Site Title:**
- Use H1 on homepage (level:1)
- Use paragraph on other pages if H1 used elsewhere
- Always enable isLink for keyboard navigation
- Link includes `rel="home"` for semantic meaning

**Site Logo:**
- Alt text automatically pulled from site title
- Always provide meaningful site name
- Logo should be keyboard accessible (when isLink true)
- Consider contrast for logo visibility

**Site Tagline:**
- Use descriptive, meaningful tagline (not "Just another WordPress site")
- Keep concise (under 160 characters for SEO)
- Consider as H2 for semantic structure in some templates
- Important for SEO even when visually hidden

### Global Settings Integration

**Where values come from:**
- **Site Title:** Settings → General → Site Title
- **Site Logo:** Customizer → Site Identity → Logo
- **Site Tagline:** Settings → General → Tagline

**Update behavior:**
```
User changes site title in Settings
       ↓
WordPress updates option 'blogname'
       ↓
All site-title blocks update automatically
       ↓
No need to edit templates/content
```

This is different from static blocks where content is saved in the database.

### Theme.json Integration

Site blocks respect theme.json settings:

```json
{
  "styles": {
    "blocks": {
      "core/site-title": {
        "typography": {
          "fontSize": "2rem",
          "fontWeight": "700"
        }
      },
      "core/site-tagline": {
        "typography": {
          "fontSize": "0.875rem"
        },
        "color": {
          "text": "#666"
        }
      }
    }
  }
}
```

### Performance Considerations

**Dynamic rendering impact:**
- Rendered on each page load (server-side)
- Minimal performance impact (simple queries)
- Consider caching for high-traffic sites
- No additional database queries (uses existing options)

**Caching behavior:**
- Site title/tagline cached in object cache
- Logo URL cached by get_custom_logo()
- Updates clear relevant caches automatically

### Technical Implementation Notes

**Site Title rendering logic:**
```php
// Simplified from WordPress core
function render_block_core_site_title($attributes) {
    $site_title = get_bloginfo('name');
    $tag_name = ($attributes['level'] === 0) ? 'p' : 'h' . $attributes['level'];
    
    if ($attributes['isLink']) {
        $site_title = sprintf(
            '<a href="%s" target="%s" rel="home">%s</a>',
            home_url(),
            $attributes['linkTarget'],
            $site_title
        );
    }
    
    return sprintf('<%s class="wp-block-site-title">%s</%s>', 
        $tag_name, $site_title, $tag_name);
}
```

**Site Logo rendering logic:**
```php
// Simplified from WordPress core
function render_block_core_site_logo($attributes) {
    $custom_logo = get_custom_logo();
    
    if (empty($custom_logo)) {
        return ''; // No wrapper if no logo
    }
    
    // Width adjustment happens via filter
    return sprintf('<div class="wp-block-site-logo">%s</div>', $custom_logo);
}
```

**Next Batches:**
- BATCH 6: Query Blocks (11 blocks) - query loop system for post listings
- BATCH 7: Template Blocks (1 block) - template-part for reusable template sections

---

*Document version: 1.0*  
*Batch 5 completed: February 2025*  
*Based on: WordPress 6.7+ Block Library*  
*Sources: Gutenberg block.json files, WordPress Core source code, Official Documentation*
