# BLOCK-REFERENCE.md
**WordPress Core Blocks Markup Reference for AI Coding Agents**  
*Target: WordPress 6.7+ Block Library*

**PURPOSE:** Provide EXACT block markup specifications to prevent "Attempt Recovery" validation errors when generating WordPress block theme templates.

**⚠️ CRITICAL RULES:**
1. **NEVER guess block markup** - Use EXACT specifications from this document
2. **COPY attribute JSON exactly** - No trailing commas, double quotes only
3. **Match HTML structure precisely** - Wrapper elements and CSS classes must be exact
4. **Respect nesting rules** - Only nest allowed child blocks
5. **Use WordPress Code Editor to verify** - When in doubt, add block in editor and copy markup

---

## DOCUMENT STRUCTURE

This document covers blocks in batches:
- **BATCH 1 (THIS DOCUMENT): Layout Blocks** - group, columns, column, cover, media-text, spacer, separator
- BATCH 2: Text Blocks - heading, paragraph, list, list-item, quote, pullquote, preformatted
- BATCH 3: Media Blocks - image, gallery, video, audio
- BATCH 4: Interactive Blocks - buttons, button, navigation, search, social-links, social-link
- BATCH 5: Site Blocks - site-title, site-logo, site-tagline
- BATCH 6: Query Blocks - query, post-template, post-title, post-excerpt, post-content, post-featured-image, post-date, post-author, pagination, pagination-next, pagination-previous
- BATCH 7: Template Blocks - template-part

---

# BATCH 1: LAYOUT BLOCKS

## 1. GROUP BLOCK

**Block Name:** `core/group`

**Purpose:** Gather blocks in a layout container. Used for creating sections, applying background colors, adding spacing between content areas.

### Attributes

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `tagName` | string | `"div"` | HTML tag to use for wrapper (`"div"`, `"main"`, `"section"`, `"article"`, `"aside"`, `"header"`, `"footer"`) |
| `align` | string | undefined | Block alignment (`"full"`, `"wide"`) |
| `layout` | object | `{"type":"constrained"}` | Layout configuration object |
| `style` | object | undefined | Inline styles (colors, spacing, typography) |
| `backgroundColor` | string | undefined | Preset background color slug |
| `textColor` | string | undefined | Preset text color slug |
| `gradient` | string | undefined | Preset gradient slug |
| `className` | string | undefined | Additional CSS classes |
| `anchor` | string | undefined | HTML ID attribute |

**Layout Object Structure:**
```json
{
  "type": "constrained",     // or "flow", "grid", "flex"
  "contentSize": "840px",    // optional: max width for constrained
  "wideSize": "1200px"       // optional: max width for wide alignment
}
```

### HTML Structure

**Basic Group (no attributes):**
```html
<!-- wp:group -->
<div class="wp-block-group">
  <!-- Inner blocks here -->
</div>
<!-- /wp:group -->
```

**Group with Semantic Tag:**
```html
<!-- wp:group {"tagName":"main"} -->
<main class="wp-block-group">
  <!-- Inner blocks here -->
</main>
<!-- /wp:group -->
```

**Group with Layout:**
```html
<!-- wp:group {"layout":{"type":"constrained"}} -->
<div class="wp-block-group">
  <!-- Inner blocks here -->
</div>
<!-- /wp:group -->
```

**Group with Background Color:**
```html
<!-- wp:group {"backgroundColor":"primary","textColor":"white"} -->
<div class="wp-block-group has-primary-background-color has-white-color has-text-color has-background">
  <!-- Inner blocks here -->
</div>
<!-- /wp:group -->
```

**Group with Inline Styles:**
```html
<!-- wp:group {"style":{"spacing":{"padding":{"top":"var:preset|spacing|50","bottom":"var:preset|spacing|50"}}}} -->
<div class="wp-block-group" style="padding-top:var(--wp--preset--spacing--50);padding-bottom:var(--wp--preset--spacing--50)">
  <!-- Inner blocks here -->
</div>
<!-- /wp:group -->
```

**Full Example from TwentyTwentyFive:**
```html
<!-- wp:group {"tagName":"main","style":{"spacing":{"margin":{"top":"var:preset|spacing|60"}}},"layout":{"type":"constrained"}} -->
<main class="wp-block-group" style="margin-top:var(--wp--preset--spacing--60)">
  <!-- wp:query-title {"type":"archive"} /-->
  <!-- wp:pattern {"slug":"twentytwentyfive/posts-personal-blog"} /-->
</main>
<!-- /wp:group -->
```

### Allowed Inner Blocks

**ALL blocks can be nested inside Group** - no restrictions.

### CSS Classes Applied

**Base class:** `wp-block-group`

**Preset color classes:**
- `has-{color-slug}-background-color` when `backgroundColor` is set
- `has-{color-slug}-color` when `textColor` is set
- `has-background` when background color is set
- `has-text-color` when text color is set

**Preset gradient class:**
- `has-{gradient-slug}-gradient-background` when `gradient` is set

**Alignment classes:**
- `alignfull` when `align: "full"`
- `alignwide` when `align: "wide"`

### Common Mistakes

❌ **WRONG:** Using `<group>` tag
```html
<!-- wp:group -->
<group class="wp-block-group">...</group>
<!-- /wp:group -->
```

✅ **CORRECT:** Group uses `<div>` by default
```html
<!-- wp:group -->
<div class="wp-block-group">...</div>
<!-- /wp:group -->
```

❌ **WRONG:** Missing closing comment
```html
<!-- wp:group -->
<div class="wp-block-group">...</div>
```

✅ **CORRECT:** Always close wrapper blocks
```html
<!-- wp:group -->
<div class="wp-block-group">...</div>
<!-- /wp:group -->
```

❌ **WRONG:** Wrong tag name when `tagName` attribute is set
```html
<!-- wp:group {"tagName":"main"} -->
<div class="wp-block-group">...</div>
<!-- /wp:group -->
```

✅ **CORRECT:** HTML tag must match `tagName` attribute
```html
<!-- wp:group {"tagName":"main"} -->
<main class="wp-block-group">...</main>
<!-- /wp:group -->
```

---

## 2. COLUMNS BLOCK

**Block Name:** `core/columns`

**Purpose:** Create multi-column layouts. ALWAYS contains `core/column` blocks as children.

### Attributes

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `isStackedOnMobile` | boolean | `true` | Whether columns stack on mobile devices |
| `verticalAlignment` | string | undefined | Vertical alignment (`"top"`, `"center"`, `"bottom"`) |
| `align` | string | undefined | Block alignment (`"full"`, `"wide"`) |
| `style` | object | undefined | Inline styles |
| `className` | string | undefined | Additional CSS classes |

### HTML Structure

**Basic Columns (2 columns):**
```html
<!-- wp:columns -->
<div class="wp-block-columns">
  <!-- wp:column -->
  <div class="wp-block-column"></div>
  <!-- /wp:column -->
  
  <!-- wp:column -->
  <div class="wp-block-column"></div>
  <!-- /wp:column -->
</div>
<!-- /wp:columns -->
```

**Columns with Vertical Alignment:**
```html
<!-- wp:columns {"verticalAlignment":"center"} -->
<div class="wp-block-columns are-vertically-aligned-center">
  <!-- wp:column {"verticalAlignment":"center"} -->
  <div class="wp-block-column is-vertically-aligned-center"></div>
  <!-- /wp:column -->
  
  <!-- wp:column {"verticalAlignment":"center"} -->
  <div class="wp-block-column is-vertically-aligned-center"></div>
  <!-- /wp:column -->
</div>
<!-- /wp:columns -->
```

**Columns NOT Stacked on Mobile:**
```html
<!-- wp:columns {"isStackedOnMobile":false} -->
<div class="wp-block-columns is-not-stacked-on-mobile">
  <!-- wp:column -->
  <div class="wp-block-column"></div>
  <!-- /wp:column -->
  
  <!-- wp:column -->
  <div class="wp-block-column"></div>
  <!-- /wp:column -->
</div>
<!-- /wp:columns -->
```

### Allowed Inner Blocks

**ONLY `core/column` blocks** - no other blocks allowed as direct children.

### CSS Classes Applied

**Base class:** `wp-block-columns`

**Modifier classes:**
- `is-not-stacked-on-mobile` when `isStackedOnMobile: false`
- `are-vertically-aligned-{alignment}` when `verticalAlignment` is set on parent
- `alignfull` when `align: "full"`
- `alignwide` when `align: "wide"`

### Common Mistakes

❌ **WRONG:** Putting non-column blocks directly inside columns
```html
<!-- wp:columns -->
<div class="wp-block-columns">
  <!-- wp:paragraph -->
  <p>This won't work</p>
  <!-- /wp:paragraph -->
</div>
<!-- /wp:columns -->
```

✅ **CORRECT:** Only column blocks as direct children
```html
<!-- wp:columns -->
<div class="wp-block-columns">
  <!-- wp:column -->
  <div class="wp-block-column">
    <!-- wp:paragraph -->
    <p>This is correct</p>
    <!-- /wp:paragraph -->
  </div>
  <!-- /wp:column -->
</div>
<!-- /wp:columns -->
```

❌ **WRONG:** Mismatched vertical alignment between parent and child
```html
<!-- wp:columns {"verticalAlignment":"center"} -->
<div class="wp-block-columns are-vertically-aligned-center">
  <!-- wp:column -->
  <div class="wp-block-column"></div>
  <!-- /wp:column -->
</div>
<!-- /wp:columns -->
```

✅ **CORRECT:** Children should inherit parent alignment or set their own
```html
<!-- wp:columns {"verticalAlignment":"center"} -->
<div class="wp-block-columns are-vertically-aligned-center">
  <!-- wp:column {"verticalAlignment":"center"} -->
  <div class="wp-block-column is-vertically-aligned-center"></div>
  <!-- /wp:column -->
</div>
<!-- /wp:columns -->
```

---

## 3. COLUMN BLOCK

**Block Name:** `core/column`

**Purpose:** A single column within a columns block. MUST be nested inside `core/columns`.

### Attributes

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `width` | string | undefined | Column width (e.g., `"50%"`, `"33.33%"`, `"300px"`) |
| `verticalAlignment` | string | undefined | Vertical alignment (`"top"`, `"center"`, `"bottom"`) |
| `style` | object | undefined | Inline styles |
| `backgroundColor` | string | undefined | Preset background color slug |
| `textColor` | string | undefined | Preset text color slug |
| `className` | string | undefined | Additional CSS classes |

### HTML Structure

**Basic Column:**
```html
<!-- wp:column -->
<div class="wp-block-column"></div>
<!-- /wp:column -->
```

**Column with Custom Width:**
```html
<!-- wp:column {"width":"33.33%"} -->
<div class="wp-block-column" style="flex-basis:33.33%"></div>
<!-- /wp:column -->
```

**Column with Vertical Alignment:**
```html
<!-- wp:column {"verticalAlignment":"center"} -->
<div class="wp-block-column is-vertically-aligned-center"></div>
<!-- /wp:column -->
```

**Column with Background Color:**
```html
<!-- wp:column {"backgroundColor":"primary"} -->
<div class="wp-block-column has-primary-background-color has-background"></div>
<!-- /wp:column -->
```

**Full Example (Column with Content):**
```html
<!-- wp:column {"width":"66.66%"} -->
<div class="wp-block-column" style="flex-basis:66.66%">
  <!-- wp:heading -->
  <h2 class="wp-block-heading">Column Content</h2>
  <!-- /wp:heading -->
  
  <!-- wp:paragraph -->
  <p>This is inside a column.</p>
  <!-- /wp:paragraph -->
</div>
<!-- /wp:column -->
```

### Allowed Inner Blocks

**ALL blocks can be nested inside Column** - no restrictions.

### CSS Classes Applied

**Base class:** `wp-block-column`

**Modifier classes:**
- `is-vertically-aligned-{alignment}` when `verticalAlignment` is set
- `has-{color-slug}-background-color` when `backgroundColor` is set
- `has-{color-slug}-color` when `textColor` is set
- `has-background` when background color is set
- `has-text-color` when text color is set

### Common Mistakes

❌ **WRONG:** Column used outside of columns block
```html
<!-- wp:column -->
<div class="wp-block-column"></div>
<!-- /wp:column -->
```

✅ **CORRECT:** Column must be child of columns
```html
<!-- wp:columns -->
<div class="wp-block-columns">
  <!-- wp:column -->
  <div class="wp-block-column"></div>
  <!-- /wp:column -->
</div>
<!-- /wp:columns -->
```

❌ **WRONG:** Width attribute without inline style
```html
<!-- wp:column {"width":"50%"} -->
<div class="wp-block-column"></div>
<!-- /wp:column -->
```

✅ **CORRECT:** Width generates `flex-basis` inline style
```html
<!-- wp:column {"width":"50%"} -->
<div class="wp-block-column" style="flex-basis:50%"></div>
<!-- /wp:column -->
```

---

## 4. COVER BLOCK

**Block Name:** `core/cover`

**Purpose:** Add an image or video with a text overlay. Creates full-width hero sections.

### Attributes

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `url` | string | undefined | Background image/video URL |
| `id` | number | undefined | Media attachment ID |
| `alt` | string | `""` | Alt text for background image |
| `hasParallax` | boolean | `false` | Enable parallax scrolling effect |
| `isRepeated` | boolean | `false` | Repeat background image as pattern |
| `dimRatio` | number | `50` | Overlay opacity (0-100) |
| `overlayColor` | string | undefined | Preset overlay color slug |
| `customOverlayColor` | string | undefined | Custom overlay color hex |
| `backgroundType` | string | `"image"` | Type of background (`"image"` or `"video"`) |
| `minHeight` | number | undefined | Minimum height in pixels |
| `minHeightUnit` | string | `"px"` | Unit for minHeight (`"px"`, `"vh"`, `"em"`) |
| `gradient` | string | undefined | Preset gradient slug for overlay |
| `customGradient` | string | undefined | Custom gradient CSS |
| `contentPosition` | string | `"center center"` | Content alignment position |
| `isDark` | boolean | `true` | Whether overlay is dark (affects text color) |
| `align` | string | undefined | Block alignment (`"full"`, `"wide"`) |
| `style` | object | undefined | Inline styles |
| `className` | string | undefined | Additional CSS classes |

### HTML Structure

**Basic Cover with Image:**
```html
<!-- wp:cover {"url":"https://example.com/image.jpg","id":123,"dimRatio":50} -->
<div class="wp-block-cover"><span aria-hidden="true" class="wp-block-cover__background has-background-dim"></span><img class="wp-block-cover__image-background wp-image-123" alt="" src="https://example.com/image.jpg" data-object-fit="cover"/><div class="wp-block-cover__inner-container">
  <!-- Inner blocks here -->
</div></div>
<!-- /wp:cover -->
```

**Cover with Custom Dim Ratio:**
```html
<!-- wp:cover {"url":"https://example.com/image.jpg","dimRatio":80} -->
<div class="wp-block-cover"><span aria-hidden="true" class="wp-block-cover__background has-background-dim-80 has-background-dim"></span><img class="wp-block-cover__image-background" alt="" src="https://example.com/image.jpg" data-object-fit="cover"/><div class="wp-block-cover__inner-container">
  <!-- Inner blocks here -->
</div></div>
<!-- /wp:cover -->
```

**Cover with Overlay Color:**
```html
<!-- wp:cover {"overlayColor":"primary","dimRatio":50} -->
<div class="wp-block-cover"><span aria-hidden="true" class="wp-block-cover__background has-primary-background-color has-background-dim"></span><div class="wp-block-cover__inner-container">
  <!-- Inner blocks here -->
</div></div>
<!-- /wp:cover -->
```

**Cover with Min Height:**
```html
<!-- wp:cover {"url":"https://example.com/image.jpg","minHeight":400,"minHeightUnit":"px"} -->
<div class="wp-block-cover" style="min-height:400px"><span aria-hidden="true" class="wp-block-cover__background has-background-dim"></span><img class="wp-block-cover__image-background" alt="" src="https://example.com/image.jpg" data-object-fit="cover"/><div class="wp-block-cover__inner-container">
  <!-- Inner blocks here -->
</div></div>
<!-- /wp:cover -->
```

**Full-Width Cover with Content:**
```html
<!-- wp:cover {"url":"https://example.com/hero.jpg","id":456,"dimRatio":30,"overlayColor":"black","align":"full","minHeight":600,"minHeightUnit":"px"} -->
<div class="wp-block-cover alignfull" style="min-height:600px"><span aria-hidden="true" class="wp-block-cover__background has-black-background-color has-background-dim-30 has-background-dim"></span><img class="wp-block-cover__image-background wp-image-456" alt="" src="https://example.com/hero.jpg" data-object-fit="cover"/><div class="wp-block-cover__inner-container">
  <!-- wp:heading {"textAlign":"center","level":1} -->
  <h1 class="wp-block-heading has-text-align-center">Hero Title</h1>
  <!-- /wp:heading -->
  
  <!-- wp:paragraph {"align":"center"} -->
  <p class="has-text-align-center">Hero description text.</p>
  <!-- /wp:paragraph -->
</div></div>
<!-- /wp:cover -->
```

### Allowed Inner Blocks

**ALL blocks can be nested inside Cover's inner container** - no restrictions.

### CSS Classes Applied

**Base class:** `wp-block-cover`

**Modifier classes:**
- `alignfull` when `align: "full"`
- `alignwide` when `align: "wide"`
- `has-parallax` when `hasParallax: true`
- `is-repeated` when `isRepeated: true`
- `is-light` when `isDark: false`

**Background/overlay classes:**
- `has-background-dim` on overlay span
- `has-background-dim-{dimRatio}` when dimRatio is not 50
- `has-{color-slug}-background-color` when `overlayColor` is set
- `has-{gradient-slug}-gradient-background` when `gradient` is set

### Common Mistakes

❌ **WRONG:** Missing inner container div
```html
<!-- wp:cover {"url":"image.jpg"} -->
<div class="wp-block-cover">
  <span class="wp-block-cover__background"></span>
  <img class="wp-block-cover__image-background" src="image.jpg"/>
  <!-- wp:paragraph -->
  <p>Text</p>
  <!-- /wp:paragraph -->
</div>
<!-- /wp:cover -->
```

✅ **CORRECT:** Inner blocks go inside inner-container
```html
<!-- wp:cover {"url":"image.jpg"} -->
<div class="wp-block-cover"><span class="wp-block-cover__background has-background-dim"></span><img class="wp-block-cover__image-background" src="image.jpg" data-object-fit="cover"/><div class="wp-block-cover__inner-container">
  <!-- wp:paragraph -->
  <p>Text</p>
  <!-- /wp:paragraph -->
</div></div>
<!-- /wp:cover -->
```

❌ **WRONG:** Missing `data-object-fit` on image
```html
<img class="wp-block-cover__image-background" src="image.jpg"/>
```

✅ **CORRECT:** Always include `data-object-fit="cover"`
```html
<img class="wp-block-cover__image-background" src="image.jpg" data-object-fit="cover"/>
```

❌ **WRONG:** Wrong dimRatio class structure
```html
<span class="wp-block-cover__background has-background-dim-80"></span>
```

✅ **CORRECT:** Both classes needed when dimRatio !== 50
```html
<span class="wp-block-cover__background has-background-dim-80 has-background-dim"></span>
```

---

## 5. MEDIA & TEXT BLOCK

**Block Name:** `core/media-text`

**Purpose:** Display media (image or video) alongside text content in a two-column layout.

### Attributes

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `mediaAlt` | string | `""` | Alt text for media |
| `mediaPosition` | string | `"left"` | Position of media (`"left"` or `"right"`) |
| `mediaId` | number | undefined | Media attachment ID |
| `mediaUrl` | string | undefined | Media URL |
| `mediaType` | string | undefined | Type of media (`"image"` or `"video"`) |
| `mediaSizeSlug` | string | undefined | Image size slug |
| `mediaWidth` | number | `50` | Width percentage of media column (0-100) |
| `isStackedOnMobile` | boolean | `true` | Whether to stack on mobile |
| `verticalAlignment` | string | undefined | Vertical alignment (`"top"`, `"center"`, `"bottom"`) |
| `imageFill` | boolean | `false` | Whether image should fill entire media area |
| `focalPoint` | object | undefined | Image focal point `{x: 0.5, y: 0.5}` |
| `align` | string | undefined | Block alignment (`"full"`, `"wide"`) |
| `className` | string | undefined | Additional CSS classes |

### HTML Structure

**Basic Media & Text (Image Left):**
```html
<!-- wp:media-text {"mediaId":123,"mediaUrl":"https://example.com/image.jpg","mediaType":"image"} -->
<div class="wp-block-media-text is-stacked-on-mobile"><figure class="wp-block-media-text__media"><img src="https://example.com/image.jpg" alt="" class="wp-image-123 size-full"/></figure><div class="wp-block-media-text__content">
  <!-- Inner blocks here -->
</div></div>
<!-- /wp:media-text -->
```

**Media & Text (Image Right):**
```html
<!-- wp:media-text {"mediaPosition":"right","mediaId":123,"mediaUrl":"https://example.com/image.jpg","mediaType":"image"} -->
<div class="wp-block-media-text has-media-on-the-right is-stacked-on-mobile"><div class="wp-block-media-text__content">
  <!-- Inner blocks here -->
</div><figure class="wp-block-media-text__media"><img src="https://example.com/image.jpg" alt="" class="wp-image-123 size-full"/></figure></div>
<!-- /wp:media-text -->
```

**Media & Text with Custom Width:**
```html
<!-- wp:media-text {"mediaId":123,"mediaUrl":"https://example.com/image.jpg","mediaType":"image","mediaWidth":40} -->
<div class="wp-block-media-text is-stacked-on-mobile" style="grid-template-columns:40% auto"><figure class="wp-block-media-text__media"><img src="https://example.com/image.jpg" alt="" class="wp-image-123 size-full"/></figure><div class="wp-block-media-text__content">
  <!-- Inner blocks here -->
</div></div>
<!-- /wp:media-text -->
```

**Media & Text with Vertical Alignment:**
```html
<!-- wp:media-text {"mediaId":123,"mediaUrl":"https://example.com/image.jpg","mediaType":"image","verticalAlignment":"center"} -->
<div class="wp-block-media-text is-stacked-on-mobile is-vertically-aligned-center"><figure class="wp-block-media-text__media"><img src="https://example.com/image.jpg" alt="" class="wp-image-123 size-full"/></figure><div class="wp-block-media-text__content">
  <!-- Inner blocks here -->
</div></div>
<!-- /wp:media-text -->
```

**Full Example with Content:**
```html
<!-- wp:media-text {"mediaId":789,"mediaUrl":"https://example.com/photo.jpg","mediaType":"image","verticalAlignment":"center","imageFill":true} -->
<div class="wp-block-media-text is-stacked-on-mobile is-vertically-aligned-center is-image-fill"><figure class="wp-block-media-text__media" style="background-image:url(https://example.com/photo.jpg)"><img src="https://example.com/photo.jpg" alt="" class="wp-image-789 size-full"/></figure><div class="wp-block-media-text__content">
  <!-- wp:heading -->
  <h2 class="wp-block-heading">Our Story</h2>
  <!-- /wp:heading -->
  
  <!-- wp:paragraph -->
  <p>Content alongside the image.</p>
  <!-- /wp:paragraph -->
</div></div>
<!-- /wp:media-text -->
```

### Allowed Inner Blocks

**ALL blocks can be nested inside the content area** - no restrictions.

### CSS Classes Applied

**Base class:** `wp-block-media-text`

**Modifier classes:**
- `has-media-on-the-right` when `mediaPosition: "right"`
- `is-stacked-on-mobile` when `isStackedOnMobile: true` (default)
- `is-vertically-aligned-{alignment}` when `verticalAlignment` is set
- `is-image-fill` when `imageFill: true`
- `alignfull` when `align: "full"`
- `alignwide` when `align: "wide"`

### Common Mistakes

❌ **WRONG:** Media position doesn't match HTML order
```html
<!-- wp:media-text {"mediaPosition":"right"} -->
<div class="wp-block-media-text has-media-on-the-right">
  <figure class="wp-block-media-text__media">...</figure>
  <div class="wp-block-media-text__content">...</div>
</div>
<!-- /wp:media-text -->
```

✅ **CORRECT:** When media is right, content comes first in HTML
```html
<!-- wp:media-text {"mediaPosition":"right"} -->
<div class="wp-block-media-text has-media-on-the-right">
  <div class="wp-block-media-text__content">...</div>
  <figure class="wp-block-media-text__media">...</figure>
</div>
<!-- /wp:media-text -->
```

❌ **WRONG:** Missing inline style when mediaWidth is set
```html
<!-- wp:media-text {"mediaWidth":60} -->
<div class="wp-block-media-text">...</div>
<!-- /wp:media-text -->
```

✅ **CORRECT:** Custom mediaWidth generates grid-template-columns style
```html
<!-- wp:media-text {"mediaWidth":60} -->
<div class="wp-block-media-text" style="grid-template-columns:60% auto">...</div>
<!-- /wp:media-text -->
```

---

## 6. SPACER BLOCK

**Block Name:** `core/spacer`

**Purpose:** Create vertical spacing between blocks. A void block with no inner content.

### Attributes

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `height` | string | `"100px"` | Height of spacer (with unit) |
| `width` | string | undefined | Width of spacer (rarely used) |

### HTML Structure

**Basic Spacer (Default Height):**
```html
<!-- wp:spacer -->
<div style="height:100px" aria-hidden="true" class="wp-block-spacer"></div>
<!-- /wp:spacer -->
```

**Spacer with Custom Height:**
```html
<!-- wp:spacer {"height":"50px"} -->
<div style="height:50px" aria-hidden="true" class="wp-block-spacer"></div>
<!-- /wp:spacer -->
```

**Spacer with Different Units:**
```html
<!-- wp:spacer {"height":"5rem"} -->
<div style="height:5rem" aria-hidden="true" class="wp-block-spacer"></div>
<!-- /wp:spacer -->
```

### Allowed Inner Blocks

**NONE** - Spacer is a void block with no children.

### CSS Classes Applied

**Base class:** `wp-block-spacer`

**No modifier classes** - styling comes from inline `height` style attribute.

### Common Mistakes

❌ **WRONG:** Missing `aria-hidden="true"` attribute
```html
<div style="height:100px" class="wp-block-spacer"></div>
```

✅ **CORRECT:** Always include aria-hidden for accessibility
```html
<div style="height:100px" aria-hidden="true" class="wp-block-spacer"></div>
```

❌ **WRONG:** Trying to add content inside spacer
```html
<!-- wp:spacer -->
<div style="height:100px" class="wp-block-spacer">
  <p>Content</p>
</div>
<!-- /wp:spacer -->
```

✅ **CORRECT:** Spacer is always empty
```html
<!-- wp:spacer -->
<div style="height:100px" aria-hidden="true" class="wp-block-spacer"></div>
<!-- /wp:spacer -->
```

❌ **WRONG:** Height not matching attribute
```html
<!-- wp:spacer {"height":"200px"} -->
<div style="height:100px" aria-hidden="true" class="wp-block-spacer"></div>
<!-- /wp:spacer -->
```

✅ **CORRECT:** Inline style must match height attribute
```html
<!-- wp:spacer {"height":"200px"} -->
<div style="height:200px" aria-hidden="true" class="wp-block-spacer"></div>
<!-- /wp:spacer -->
```

---

## 7. SEPARATOR BLOCK

**Block Name:** `core/separator`

**Purpose:** Create a visual separator / horizontal rule between content sections.

### Attributes

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `opacity` | string | `"alpha-channel"` | Opacity mode (`"css"` or `"alpha-channel"`) |
| `align` | string | undefined | Block alignment (`"wide"`, `"full"`, `"center"`) |
| `className` | string | undefined | Additional CSS classes (used for styles) |
| `style` | object | undefined | Inline styles |
| `backgroundColor` | string | undefined | Preset background color slug |
| `textColor` | string | undefined | Preset text color slug (affects separator line color) |

### HTML Structure

**Basic Separator:**
```html
<!-- wp:separator -->
<hr class="wp-block-separator has-alpha-channel-opacity"/>
<!-- /wp:separator -->
```

**Separator with CSS Opacity Mode:**
```html
<!-- wp:separator {"opacity":"css"} -->
<hr class="wp-block-separator has-css-opacity"/>
<!-- /wp:separator -->
```

**Wide Separator:**
```html
<!-- wp:separator {"align":"wide"} -->
<hr class="wp-block-separator alignwide has-alpha-channel-opacity"/>
<!-- /wp:separator -->
```

**Separator with Style Variation:**
```html
<!-- wp:separator {"className":"is-style-dots"} -->
<hr class="wp-block-separator has-alpha-channel-opacity is-style-dots"/>
<!-- /wp:separator -->
```

**Separator with Color:**
```html
<!-- wp:separator {"backgroundColor":"primary"} -->
<hr class="wp-block-separator has-text-color has-primary-color has-alpha-channel-opacity has-primary-background-color has-background"/>
<!-- /wp:separator -->
```

### Allowed Inner Blocks

**NONE** - Separator is a void element (`<hr>`).

### CSS Classes Applied

**Base class:** `wp-block-separator`

**Opacity classes (one required):**
- `has-alpha-channel-opacity` when `opacity: "alpha-channel"` (default)
- `has-css-opacity` when `opacity: "css"`

**Alignment classes:**
- `alignwide` when `align: "wide"`
- `alignfull` when `align: "full"`
- `aligncenter` when `align: "center"`

**Style variation classes:**
- `is-style-wide` - full-width thin line
- `is-style-dots` - three dots instead of line

**Color classes:**
- `has-{color-slug}-background-color` when `backgroundColor` is set
- `has-{color-slug}-color` when `textColor` is set (affects line color)
- `has-text-color` when text color is set
- `has-background` when background color is set

### Common Mistakes

❌ **WRONG:** Using `<div>` instead of `<hr>`
```html
<!-- wp:separator -->
<div class="wp-block-separator"></div>
<!-- /wp:separator -->
```

✅ **CORRECT:** Separator always uses `<hr>` element
```html
<!-- wp:separator -->
<hr class="wp-block-separator has-alpha-channel-opacity"/>
<!-- /wp:separator -->
```

❌ **WRONG:** Self-closing `<hr/>` format
```html
<!-- wp:separator -->
<hr class="wp-block-separator has-alpha-channel-opacity"/>
<!-- /wp:separator -->
```

✅ **CORRECT:** While `<hr/>` is technically valid HTML5, WordPress outputs `<hr>` without slash
```html
<!-- wp:separator -->
<hr class="wp-block-separator has-alpha-channel-opacity"/>
<!-- /wp:separator -->
```

❌ **WRONG:** Missing opacity class
```html
<!-- wp:separator -->
<hr class="wp-block-separator"/>
<!-- /wp:separator -->
```

✅ **CORRECT:** Must include either `has-alpha-channel-opacity` or `has-css-opacity`
```html
<!-- wp:separator -->
<hr class="wp-block-separator has-alpha-channel-opacity"/>
<!-- /wp:separator -->
```

---

## BATCH 1 SUMMARY

**Layout blocks documented:** 7  
✅ group  
✅ columns  
✅ column  
✅ cover  
✅ media-text  
✅ spacer  
✅ separator

**Key Patterns to Remember:**

1. **Group blocks** use semantic HTML tags via `tagName` attribute
2. **Columns ONLY contain column blocks** as direct children
3. **Column blocks** MUST be inside columns parent
4. **Cover block** has 3-layer structure: wrapper → background/overlay/image → inner-container
5. **Media & Text** HTML order changes based on `mediaPosition` attribute
6. **Spacer** always includes `aria-hidden="true"` for accessibility
7. **Separator** always uses `<hr>` tag and requires opacity class

**Next Batches:**
- BATCH 2: Text Blocks (heading, paragraph, list, list-item, quote, pullquote, preformatted)
- BATCH 3: Media Blocks (image, gallery, video, audio)
- BATCH 4: Interactive Blocks (buttons, button, navigation, search, social-links, social-link)
- BATCH 5: Site Blocks (site-title, site-logo, site-tagline)
- BATCH 6: Query Blocks (query, post-template, post-title, etc.)
- BATCH 7: Template Blocks (template-part)

---

*Document version: 1.0*  
*Batch 1 completed: February 2025*  
*Based on: WordPress 6.7+ Block Library*  
*Sources: WordPress Core Blocks Reference, TwentyTwentyFive Theme, Official WordPress Documentation*
