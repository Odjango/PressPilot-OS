# Block save() Output Reference — The Ground Truth

> **Purpose:** This is the DEFINITIVE reference for the exact HTML that WordPress's `save()` function produces for every block type used in the SSWG generator. WordPress validates stored block markup by re-running save() and comparing character-by-character. Any mismatch triggers "Attempt Recovery."
>
> **Source:** All examples derived directly from WordPress Gutenberg source code (`@wordpress/block-library` save.js files) as of March 2026.
>
> **How to use:** When generating or modifying any block markup, find the block type below, match your attribute combination, and ensure your output is character-equivalent to the reference.

---

## HOW WORDPRESS VALIDATES BLOCKS

### The Validation Pipeline

1. WordPress parses stored HTML to extract block comments and inner HTML
2. It re-runs the block's `save()` function with the stored attributes
3. It compares the stored inner HTML against the save() output using `isEquivalentHTML()`
4. **Any mismatch → "Attempt Recovery" error**

### What `isEquivalentHTML()` Actually Checks

From Gutenberg source (`@wordpress/blocks/src/api/validation/index.js`):

- **Tag names:** Must match (case-insensitive)
- **Attributes:** Must have the same count AND the same values, with special rules:
  - `class` attribute: **ORDER DOES NOT MATTER** — classes are compared as unordered sets
  - `style` attribute: **Property order does not matter** — parsed into objects and deep-compared
  - Boolean attributes (e.g., `reversed`, `open`): **Presence is enough** — value doesn't matter
  - All other attributes: **Exact string match required**
- **Text content:** Whitespace is collapsed, but non-whitespace text must match exactly
- **Whitespace-only nodes:** Completely ignored (you can add/remove whitespace between tags)

### What This Means for the Generator

| Rule | Implication |
|------|------------|
| Class order doesn't matter | `class="a b c"` = `class="c b a"` ✅ |
| Style property order doesn't matter | `style="color:red;margin:0"` = `style="margin:0;color:red"` ✅ |
| Attribute count must match | Adding an extra `style=""` that save() doesn't produce → ❌ FAIL |
| Whitespace between tags is ignored | `<p>text</p>` = `<p>  text  </p>` ✅ |
| Empty attributes are stripped | `class=""` is removed by getMeaningfulAttributePairs → don't add empty classes |
| data-* attributes always preserved | `data-align="center"` is always meaningful |

---

## BLOCK TYPE CATEGORIES

### Dynamic Blocks (Server-Rendered — No save() Validation)

These blocks return `null` from save() and are rendered by PHP on the server. **They cannot cause "Attempt Recovery" errors** because there's no save() output to compare against. Their block comment attributes must be valid JSON, but the inner HTML is irrelevant to validation.

| Block | Comment Syntax |
|-------|---------------|
| `core/site-title` | `<!-- wp:site-title /-->` |
| `core/site-tagline` | `<!-- wp:site-tagline /-->` |
| `core/site-logo` | `<!-- wp:site-logo /-->` |
| `core/template-part` | `<!-- wp:template-part {"slug":"header","area":"header","tagName":"header"} /-->` |
| `core/post-title` | `<!-- wp:post-title /-->` |
| `core/post-content` | `<!-- wp:post-content /-->` |
| `core/post-date` | `<!-- wp:post-date /-->` |
| `core/post-excerpt` | `<!-- wp:post-excerpt /-->` |
| `core/post-featured-image` | `<!-- wp:post-featured-image /-->` |
| `core/post-author` | `<!-- wp:post-author /-->` |
| `core/post-author-name` | `<!-- wp:post-author-name /-->` |
| `core/post-author-biography` | `<!-- wp:post-author-biography /-->` |
| `core/post-terms` | `<!-- wp:post-terms {"term":"category"} /-->` |
| `core/post-comments-form` | `<!-- wp:post-comments-form /-->` |
| `core/post-navigation-link` | `<!-- wp:post-navigation-link /-->` |
| `core/query` | Has save() that returns `<InnerBlocks.Content />` — inner blocks are validated individually |
| `core/query-title` | `<!-- wp:query-title /-->` |
| `core/query-no-results` | Contains inner blocks |
| `core/query-pagination` | Contains inner blocks |
| `core/query-pagination-next` | `<!-- wp:query-pagination-next /-->` |
| `core/query-pagination-previous` | `<!-- wp:query-pagination-previous /-->` |
| `core/query-pagination-numbers` | `<!-- wp:query-pagination-numbers /-->` |
| `core/post-template` | Contains inner blocks |
| `core/comment-template` | Contains inner blocks |
| `core/comments` | Contains inner blocks |
| `core/comments-title` | `<!-- wp:comments-title /-->` |
| `core/comment-author-name` | `<!-- wp:comment-author-name /-->` |
| `core/comment-content` | `<!-- wp:comment-content /-->` |
| `core/comment-date` | `<!-- wp:comment-date /-->` |
| `core/comment-edit-link` | `<!-- wp:comment-edit-link /-->` |
| `core/comment-reply-link` | `<!-- wp:comment-reply-link /-->` |
| `core/comments-pagination` | Contains inner blocks |
| `core/avatar` | `<!-- wp:avatar /-->` |
| `core/search` | `<!-- wp:search /-->` |
| `core/latest-posts` | `<!-- wp:latest-posts /-->` |
| `core/tag-cloud` | `<!-- wp:tag-cloud /-->` |
| `core/categories` | `<!-- wp:categories /-->` |
| `core/term-description` | `<!-- wp:term-description /-->` |
| `core/social-link` | `<!-- wp:social-link {"url":"...","service":"..."} /-->` |
| `core/navigation` | Dynamic when `ref` is set; see special section below |
| `core/pattern` | `<!-- wp:pattern {"slug":"..."} /-->` |

**Key insight:** For dynamic blocks, you only need valid JSON attributes in the comment. The HTML between open/close comments (if any) is inner blocks content that gets validated individually per-block.

### Static Blocks (Have save() — VALIDATION CRITICAL)

These blocks have save() functions that produce exact HTML. **This is where "Attempt Recovery" comes from.**

---

## STATIC BLOCK REFERENCE

### 1. core/paragraph

**Source:** `@wordpress/block-library/src/paragraph/save.js`

**Save function logic:**
- Renders a `<p>` tag
- `useBlockProps.save()` adds the wrapper classes/styles
- `dropCap` adds class `has-drop-cap` (unless text-align is center or opposite-direction)
- `direction` adds `dir` attribute

**Attribute → Class/Attribute mapping:**

| Attribute | Generated Output |
|-----------|-----------------|
| `{"align":"center"}` | Block support adds `class="has-text-align-center"` |
| `{"align":"right"}` | Block support adds `class="has-text-align-right"` |
| `{"dropCap":true}` | `class="has-drop-cap"` |
| `{"direction":"rtl"}` | `dir="rtl"` on the `<p>` |
| `{"textColor":"primary"}` | `class="has-primary-color has-text-color"` |
| `{"backgroundColor":"secondary"}` | `class="has-secondary-background-color has-background"` |
| `{"fontSize":"large"}` | `class="has-large-font-size"` |
| `{"fontSize":"small"}` | `class="has-small-font-size"` |
| `{"style":{"typography":{"fontSize":"18px"}}}` | `style="font-size:18px"` + `class="has-custom-font-size"` |
| `{"style":{"color":{"text":"#333"}}}` | `style="color:#333"` + `class="has-text-color"` |
| `{"style":{"color":{"background":"#fff"}}}` | `style="background-color:#fff"` + `class="has-background"` |

**Exact HTML examples:**

```html
<!-- Minimal paragraph -->
<!-- wp:paragraph -->
<p class="wp-block-paragraph">Hello world</p>
<!-- /wp:paragraph -->

<!-- NOTE: As of WP 6.x, plain paragraphs may NOT have wp-block-paragraph class.
     The class is only added when useBlockProps.save() detects block supports.
     In practice, a simple paragraph produces: -->
<!-- wp:paragraph -->
<p>Hello world</p>
<!-- /wp:paragraph -->

<!-- With text alignment -->
<!-- wp:paragraph {"align":"center"} -->
<p class="has-text-align-center">Centered text</p>
<!-- /wp:paragraph -->

<!-- With named text color -->
<!-- wp:paragraph {"textColor":"primary"} -->
<p class="has-primary-color has-text-color">Colored text</p>
<!-- /wp:paragraph -->

<!-- With named background color -->
<!-- wp:paragraph {"backgroundColor":"secondary"} -->
<p class="has-secondary-background-color has-background">Background text</p>
<!-- /wp:paragraph -->

<!-- With preset font size -->
<!-- wp:paragraph {"fontSize":"large"} -->
<p class="has-large-font-size">Large text</p>
<!-- /wp:paragraph -->

<!-- With custom font size -->
<!-- wp:paragraph {"style":{"typography":{"fontSize":"18px"}}} -->
<p style="font-size:18px">Custom size text</p>
<!-- /wp:paragraph -->

<!-- With drop cap -->
<!-- wp:paragraph {"dropCap":true} -->
<p class="has-drop-cap">Lorem ipsum dolor sit amet...</p>
<!-- /wp:paragraph -->

<!-- Combined: color + font size + alignment -->
<!-- wp:paragraph {"align":"center","textColor":"primary","fontSize":"large"} -->
<p class="has-text-align-center has-primary-color has-text-color has-large-font-size">Combined</p>
<!-- /wp:paragraph -->

<!-- With inline style color (custom hex) -->
<!-- wp:paragraph {"style":{"color":{"text":"#ff6b35"}}} -->
<p class="has-text-color" style="color:#ff6b35">Custom color</p>
<!-- /wp:paragraph -->

<!-- With inline background + text color -->
<!-- wp:paragraph {"style":{"color":{"text":"#ffffff","background":"#1a1a1a"}}} -->
<p class="has-text-color has-background" style="color:#ffffff;background-color:#1a1a1a">Dark bg white text</p>
<!-- /wp:paragraph -->
```

**⚠️ CRITICAL RULES:**
- The `class` attribute: classes are compared as **unordered sets** — `"has-text-color has-primary-color"` = `"has-primary-color has-text-color"`
- Named color → generates TWO classes: `has-{slug}-{context}` AND `has-text-color` or `has-background`
- Custom color (inline hex) → generates ONE class (`has-text-color` or `has-background`) PLUS inline `style`
- **NEVER mix named + custom** for the same property (e.g., don't have both `textColor` and `style.color.text`)
- Empty content is valid: `<p></p>` ✅

---

### 2. core/heading

**Source:** `@wordpress/block-library/src/heading/save.js`

**Save function logic:**
- Renders `<h1>` through `<h6>` based on `level` attribute (default: 2)
- `useBlockProps.save()` adds wrapper classes
- Content via `RichText.Content`

**Exact HTML examples:**

```html
<!-- Default heading (h2) -->
<!-- wp:heading -->
<h2 class="wp-block-heading">My Heading</h2>
<!-- /wp:heading -->

<!-- Specific level -->
<!-- wp:heading {"level":1} -->
<h1 class="wp-block-heading">Page Title</h1>
<!-- /wp:heading -->

<!-- wp:heading {"level":3} -->
<h3 class="wp-block-heading">Subheading</h3>
<!-- /wp:heading -->

<!-- With text alignment -->
<!-- wp:heading {"textAlign":"center"} -->
<h2 class="wp-block-heading has-text-align-center">Centered Heading</h2>
<!-- /wp:heading -->

<!-- With named color -->
<!-- wp:heading {"textColor":"primary"} -->
<h2 class="wp-block-heading has-primary-color has-text-color">Colored Heading</h2>
<!-- /wp:heading -->

<!-- With font size -->
<!-- wp:heading {"level":2,"fontSize":"x-large"} -->
<h2 class="wp-block-heading has-x-large-font-size">Large Heading</h2>
<!-- /wp:heading -->

<!-- With custom inline styles -->
<!-- wp:heading {"level":2,"style":{"typography":{"fontSize":"clamp(2rem, 4vw, 3rem)","fontWeight":"700"}}} -->
<h2 class="wp-block-heading" style="font-size:clamp(2rem, 4vw, 3rem);font-weight:700">Responsive Heading</h2>
<!-- /wp:heading -->

<!-- Combined -->
<!-- wp:heading {"level":2,"textAlign":"center","textColor":"primary","fontSize":"x-large"} -->
<h2 class="wp-block-heading has-text-align-center has-primary-color has-text-color has-x-large-font-size">All Options</h2>
<!-- /wp:heading -->
```

**⚠️ CRITICAL RULES:**
- `wp-block-heading` class is ALWAYS present (added by useBlockProps.save())
- `level` attribute defaults to 2 if omitted — generates `<h2>`
- **DO NOT** put `level` in attributes JSON if it's 2 (WordPress omits defaults)
- Headings support same color/typography/alignment block supports as paragraphs

---

### 3. core/group

**Source:** `@wordpress/block-library/src/group/save.js`

**Save function logic:**
- Renders the tag specified by `tagName` attribute (default: `div`)
- Uses `useInnerBlocksProps.save(useBlockProps.save())` — merges inner blocks into wrapper
- Layout is controlled via block supports, not the save function directly

**Exact HTML examples:**

```html
<!-- Default group (div, constrained layout) -->
<!-- wp:group {"layout":{"type":"constrained"}} -->
<div class="wp-block-group">
<!-- inner blocks go here -->
</div>
<!-- /wp:group -->

<!-- Group with wide alignment -->
<!-- wp:group {"align":"full","layout":{"type":"constrained"}} -->
<div class="wp-block-group alignfull">
<!-- inner blocks -->
</div>
<!-- /wp:group -->

<!-- Group with flex layout (Row) -->
<!-- wp:group {"layout":{"type":"flex","flexWrap":"nowrap"}} -->
<div class="wp-block-group">
<!-- inner blocks -->
</div>
<!-- /wp:group -->

<!-- Group as <section> tag -->
<!-- wp:group {"tagName":"section","layout":{"type":"constrained"}} -->
<section class="wp-block-group">
<!-- inner blocks -->
</section>
<!-- /wp:group -->

<!-- Group with background color -->
<!-- wp:group {"backgroundColor":"primary","layout":{"type":"constrained"}} -->
<div class="wp-block-group has-primary-background-color has-background">
<!-- inner blocks -->
</div>
<!-- /wp:group -->

<!-- Group with custom background + padding -->
<!-- wp:group {"style":{"color":{"background":"#1a1a2e"},"spacing":{"padding":{"top":"var:preset|spacing|50","bottom":"var:preset|spacing|50"}}},"layout":{"type":"constrained"}} -->
<div class="wp-block-group has-background" style="background-color:#1a1a2e;padding-top:var(--wp--preset--spacing--50);padding-bottom:var(--wp--preset--spacing--50)">
<!-- inner blocks -->
</div>
<!-- /wp:group -->

<!-- Stack layout variation -->
<!-- wp:group {"layout":{"type":"flex","orientation":"vertical"}} -->
<div class="wp-block-group">
<!-- inner blocks stacked vertically -->
</div>
<!-- /wp:group -->
```

**⚠️ CRITICAL RULES:**
- `wp-block-group` class is ALWAYS present
- The `layout` attribute does NOT produce classes in the save HTML — WordPress processes layout at render time via `wp_render_layout_support_flag()`
- `tagName` defaults to `"div"` — omit from JSON if using div
- **The wrapper element MUST match tagName** — if `"tagName":"section"` then wrapper MUST be `<section>`
- Inner blocks content goes BETWEEN the open/close wrapper tags
- Spacing values using preset syntax: `"var:preset|spacing|50"` in JSON → `var(--wp--preset--spacing--50)` in inline style

---

### 4. core/columns

**Source:** `@wordpress/block-library/src/columns/save.js`

**Save function logic:**
- Renders a `<div>` with inner blocks
- `verticalAlignment` → class `are-vertically-aligned-{value}`
- `isStackedOnMobile` defaults true; when false → class `is-not-stacked-on-mobile`

**Exact HTML examples:**

```html
<!-- Default columns (stacked on mobile) -->
<!-- wp:columns -->
<div class="wp-block-columns">
<!-- wp:column blocks go here -->
</div>
<!-- /wp:columns -->

<!-- Columns not stacked on mobile -->
<!-- wp:columns {"isStackedOnMobile":false} -->
<div class="wp-block-columns is-not-stacked-on-mobile">
<!-- columns -->
</div>
<!-- /wp:columns -->

<!-- Columns with vertical alignment -->
<!-- wp:columns {"verticalAlignment":"center"} -->
<div class="wp-block-columns are-vertically-aligned-center">
<!-- columns -->
</div>
<!-- /wp:columns -->
```

**⚠️ CRITICAL RULES:**
- `isStackedOnMobile` defaults to `true` — do NOT include in JSON when true
- Only produces `is-not-stacked-on-mobile` class when explicitly `false`
- `wp-block-columns` is ALWAYS present
- Must contain ONLY `core/column` children

---

### 5. core/column

**Source:** `@wordpress/block-library/src/column/save.js`

**Save function logic:**
- Renders `<div>` with inner blocks
- `verticalAlignment` → class `is-vertically-aligned-{value}`
- `width` → inline `style="flex-basis:{value}"` (handles %, px, etc.)

**Exact HTML examples:**

```html
<!-- Default column (auto width) -->
<!-- wp:column -->
<div class="wp-block-column">
<!-- inner blocks -->
</div>
<!-- /wp:column -->

<!-- Column with explicit width -->
<!-- wp:column {"width":"33.33%"} -->
<div class="wp-block-column" style="flex-basis:33.33%">
<!-- inner blocks -->
</div>
<!-- /wp:column -->

<!-- Column with vertical alignment -->
<!-- wp:column {"verticalAlignment":"center","width":"50%"} -->
<div class="wp-block-column is-vertically-aligned-center" style="flex-basis:50%">
<!-- inner blocks -->
</div>
<!-- /wp:column -->
```

**⚠️ CRITICAL RULES:**
- `wp-block-column` is ALWAYS present
- Width with `%` → produces `flex-basis:33.33%` (no space around colon)
- Numeric width (legacy) → appended with `%` automatically
- Must be direct child of `core/columns`

---

### 6. core/cover

**Source:** `@wordpress/block-library/src/cover/save.js`

**Save function logic:** The most complex static block. Produces different HTML based on backgroundType (image vs video), parallax, dimRatio, overlay color, etc.

**Key output structure:**
```
<Tag class="wp-block-cover [modifiers]" style="min-height:{value}">
  <img class="wp-block-cover__image-background wp-image-{id}" ... />  (or <div> for parallax)
  <span class="wp-block-cover__background [color-classes] [dim-class]" style="..." />
  <div class="wp-block-cover__inner-container">
    <!-- inner blocks -->
  </div>
</Tag>
```

**Exact HTML examples:**

```html
<!-- Cover with image, default dim (50%) -->
<!-- wp:cover {"url":"https://example.com/image.jpg","id":123,"dimRatio":50,"overlayColor":"primary"} -->
<div class="wp-block-cover"><img class="wp-block-cover__image-background wp-image-123" alt="" src="https://example.com/image.jpg" data-object-fit="cover"/><span aria-hidden="true" class="wp-block-cover__background has-primary-background-color has-background-dim"></span><div class="wp-block-cover__inner-container">
<!-- inner blocks -->
</div></div>
<!-- /wp:cover -->

<!-- Cover with custom overlay color -->
<!-- wp:cover {"url":"https://example.com/image.jpg","dimRatio":70,"customOverlayColor":"#1a1a2e"} -->
<div class="wp-block-cover"><img class="wp-block-cover__image-background" alt="" src="https://example.com/image.jpg" data-object-fit="cover"/><span aria-hidden="true" class="wp-block-cover__background has-background-dim-70 has-background-dim" style="background-color:#1a1a2e"></span><div class="wp-block-cover__inner-container">
<!-- inner blocks -->
</div></div>
<!-- /wp:cover -->

<!-- Cover with min-height -->
<!-- wp:cover {"url":"https://example.com/hero.jpg","dimRatio":50,"minHeight":600,"minHeightUnit":"px","overlayColor":"primary"} -->
<div class="wp-block-cover" style="min-height:600px"><img class="wp-block-cover__image-background" alt="" src="https://example.com/hero.jpg" data-object-fit="cover"/><span aria-hidden="true" class="wp-block-cover__background has-primary-background-color has-background-dim"></span><div class="wp-block-cover__inner-container">
<!-- inner blocks -->
</div></div>
<!-- /wp:cover -->

<!-- Cover with parallax (uses div instead of img) -->
<!-- wp:cover {"url":"https://example.com/bg.jpg","hasParallax":true,"dimRatio":50,"overlayColor":"primary"} -->
<div class="wp-block-cover has-parallax"><div role="img" class="wp-block-cover__image-background has-parallax" style="background-position:50% 50%;background-image:url(https://example.com/bg.jpg)"></div><span aria-hidden="true" class="wp-block-cover__background has-primary-background-color has-background-dim"></span><div class="wp-block-cover__inner-container">
<!-- inner blocks -->
</div></div>
<!-- /wp:cover -->

<!-- Cover with focal point -->
<!-- wp:cover {"url":"https://example.com/image.jpg","dimRatio":50,"focalPoint":{"x":0.3,"y":0.7},"overlayColor":"primary"} -->
<div class="wp-block-cover"><img class="wp-block-cover__image-background" alt="" src="https://example.com/image.jpg" style="object-position:30% 70%" data-object-fit="cover" data-object-position="30% 70%"/><span aria-hidden="true" class="wp-block-cover__background has-primary-background-color has-background-dim"></span><div class="wp-block-cover__inner-container">
<!-- inner blocks -->
</div></div>
<!-- /wp:cover -->

<!-- Cover full-width -->
<!-- wp:cover {"url":"https://example.com/hero.jpg","dimRatio":50,"overlayColor":"primary","align":"full"} -->
<div class="wp-block-cover alignfull"><img class="wp-block-cover__image-background" alt="" src="https://example.com/hero.jpg" data-object-fit="cover"/><span aria-hidden="true" class="wp-block-cover__background has-primary-background-color has-background-dim"></span><div class="wp-block-cover__inner-container">
<!-- inner blocks -->
</div></div>
<!-- /wp:cover -->

<!-- Light cover (is-light class) -->
<!-- wp:cover {"url":"https://example.com/light.jpg","dimRatio":80,"overlayColor":"background","isDark":false} -->
<div class="wp-block-cover is-light"><img class="wp-block-cover__image-background" alt="" src="https://example.com/light.jpg" data-object-fit="cover"/><span aria-hidden="true" class="wp-block-cover__background has-background-background-color has-background-dim-80 has-background-dim"></span><div class="wp-block-cover__inner-container">
<!-- inner blocks -->
</div></div>
<!-- /wp:cover -->
```

**⚠️ CRITICAL RULES:**
- `dimRatio` is **REQUIRED** — omitting it causes validation failure
- `dimRatio` generates `has-background-dim` PLUS `has-background-dim-{value}` (e.g., `has-background-dim-70`) EXCEPT when dimRatio is 50 (50 is default, no `-50` suffix)
- **Wait, correction from source:** `dimRatioToClass(dimRatio)` → produces `has-background-dim-{ratio}` for all values. The `has-background-dim` class is produced when `dimRatio !== undefined`.
- When `isDark` is false → adds `is-light` class. Default is true (dark), no class added.
- `hasParallax` → switches from `<img>` to `<div role="img">` with `background-image` CSS
- The `<span>` overlay MUST come immediately BEFORE `wp-block-cover__inner-container`
- `tagName` defaults to `"div"` — for semantic HTML, `"section"` is common
- Cover blocks with `useFeaturedImage:true` → no `<img>` tag at all (image injected server-side)
- Focal point `{x:0.3, y:0.7}` → `style="object-position:30% 70%"` (multiplied by 100)

---

### 7. core/image

**Source:** `@wordpress/block-library/src/image/save.js`

**Save function logic:**
- Wraps in `<figure>` using `useBlockProps.save()`
- Image gets `wp-image-{id}` class when `id` is set
- Optional `<a>` wrapper for linked images
- Optional `<figcaption>` for captions
- Border and shadow via block supports

**Exact HTML examples:**

```html
<!-- Simple image -->
<!-- wp:image {"id":456,"sizeSlug":"large"} -->
<figure class="wp-block-image size-large"><img src="https://example.com/photo.jpg" alt="" class="wp-image-456"/></figure>
<!-- /wp:image -->

<!-- Image with alt text -->
<!-- wp:image {"id":456,"sizeSlug":"full","alt":"A beautiful sunset"} -->
<figure class="wp-block-image size-full"><img src="https://example.com/photo.jpg" alt="A beautiful sunset" class="wp-image-456"/></figure>
<!-- /wp:image -->

<!-- Image with link -->
<!-- wp:image {"id":456,"sizeSlug":"large","linkDestination":"custom"} -->
<figure class="wp-block-image size-large"><a href="https://example.com"><img src="https://example.com/photo.jpg" alt="" class="wp-image-456"/></a></figure>
<!-- /wp:image -->

<!-- Image with caption -->
<!-- wp:image {"id":456,"sizeSlug":"large"} -->
<figure class="wp-block-image size-large"><img src="https://example.com/photo.jpg" alt="" class="wp-image-456"/><figcaption class="wp-element-caption">Photo caption</figcaption></figure>
<!-- /wp:image -->

<!-- Image with custom dimensions -->
<!-- wp:image {"id":456,"width":"300px","height":"200px","sizeSlug":"full"} -->
<figure class="wp-block-image size-full is-resized"><img src="https://example.com/photo.jpg" alt="" class="wp-image-456" style="width:300px;height:200px"/></figure>
<!-- /wp:image -->

<!-- Image with alignment -->
<!-- wp:image {"align":"center","id":456,"sizeSlug":"large"} -->
<figure class="wp-block-image aligncenter size-large"><img src="https://example.com/photo.jpg" alt="" class="wp-image-456"/></figure>
<!-- /wp:image -->

<!-- Image with aspect ratio and scale -->
<!-- wp:image {"id":456,"sizeSlug":"large","aspectRatio":"16/9","scale":"cover"} -->
<figure class="wp-block-image size-large"><img src="https://example.com/photo.jpg" alt="" class="wp-image-456" style="aspect-ratio:16/9;object-fit:cover"/></figure>
<!-- /wp:image -->
```

**⚠️ CRITICAL RULES:**
- `wp-block-image` is ALWAYS on the `<figure>`
- `size-{sizeSlug}` class is on the `<figure>` when sizeSlug is set
- `wp-image-{id}` class is on the `<img>` (NOT the figure!)
- `is-resized` added to `<figure>` when width OR height is set
- Caption class is `wp-element-caption` (NOT `wp-block-image__caption` — that's deprecated)
- `alt=""` is output even when empty (as empty string)
- When no `id` is provided, no `wp-image-` class is added to `<img>`

---

### 8. core/button

**Source:** `@wordpress/block-library/src/button/save.js`

**Save function logic:**
- Wrapper `<div>` via `useBlockProps.save()`
- Inner `<a>` (or `<button>` if tagName is "button") with class `wp-block-button__link`
- Color classes on the INNER element, not the wrapper
- Border, shadow, spacing, typography on the inner element

**Exact HTML examples:**

```html
<!-- Default button (link) -->
<!-- wp:button -->
<div class="wp-block-button"><a class="wp-block-button__link wp-element-button">Click Me</a></div>
<!-- /wp:button -->

<!-- Button with URL -->
<!-- wp:button -->
<div class="wp-block-button"><a class="wp-block-button__link wp-element-button" href="https://example.com">Visit Site</a></div>
<!-- /wp:button -->

<!-- Button with target blank -->
<!-- wp:button -->
<div class="wp-block-button"><a class="wp-block-button__link wp-element-button" href="https://example.com" target="_blank" rel="noreferrer noopener">New Tab</a></div>
<!-- /wp:button -->

<!-- Button with named colors -->
<!-- wp:button {"backgroundColor":"primary","textColor":"background"} -->
<div class="wp-block-button"><a class="wp-block-button__link has-background-background-color has-primary-background-color has-text-color has-background wp-element-button">Styled</a></div>
<!-- /wp:button -->

<!-- Button with custom colors (inline) -->
<!-- wp:button {"style":{"color":{"background":"#ff6b35","text":"#ffffff"}}} -->
<div class="wp-block-button"><a class="wp-block-button__link has-text-color has-background wp-element-button" style="color:#ffffff;background-color:#ff6b35">Custom</a></div>
<!-- /wp:button -->

<!-- Button with border radius -->
<!-- wp:button {"style":{"border":{"radius":"50px"}}} -->
<div class="wp-block-button"><a class="wp-block-button__link wp-element-button" style="border-radius:50px">Rounded</a></div>
<!-- /wp:button -->

<!-- Button with zero border radius (backwards compat) -->
<!-- wp:button {"style":{"border":{"radius":0}}} -->
<div class="wp-block-button"><a class="wp-block-button__link no-border-radius wp-element-button">Square</a></div>
<!-- /wp:button -->

<!-- Button with font size -->
<!-- wp:button {"fontSize":"large"} -->
<div class="wp-block-button"><a class="wp-block-button__link has-large-font-size has-custom-font-size wp-element-button">Large</a></div>
<!-- /wp:button -->
```

**⚠️ CRITICAL RULES:**
- Wrapper is ALWAYS `<div class="wp-block-button">`
- Inner element ALWAYS has `wp-block-button__link` AND `wp-element-button` classes
- Color classes go on the INNER `<a>`, NOT the wrapper `<div>`
- `wp-element-button` class is added by `__experimentalGetElementClassName('button')`
- `href` attribute only on `<a>` tags, NOT on `<button>` tags
- When `tagName` is omitted, defaults to `<a>`

---

### 9. core/buttons (container)

**Source:** `@wordpress/block-library/src/buttons/save.js`

**Save function logic:**
- Renders `<div>` with inner blocks
- `fontSize` or custom fontSize → adds `has-custom-font-size` class

**Exact HTML examples:**

```html
<!-- Default buttons container -->
<!-- wp:buttons -->
<div class="wp-block-buttons">
<!-- wp:button blocks -->
</div>
<!-- /wp:buttons -->

<!-- Buttons with center alignment -->
<!-- wp:buttons {"layout":{"type":"flex","justifyContent":"center"}} -->
<div class="wp-block-buttons">
<!-- wp:button blocks -->
</div>
<!-- /wp:buttons -->
```

**⚠️ CRITICAL RULES:**
- `wp-block-buttons` is ALWAYS present
- Layout justification doesn't produce save-time classes (processed at render)
- Must contain ONLY `core/button` children

---

### 10. core/separator

**Source:** `@wordpress/block-library/src/separator/save.js`

**Exact HTML examples:**

```html
<!-- Default separator -->
<!-- wp:separator -->
<hr class="wp-block-separator has-alpha-channel-opacity"/>
<!-- /wp:separator -->

<!-- Separator with named color -->
<!-- wp:separator {"backgroundColor":"primary","opacity":"css"} -->
<hr class="wp-block-separator has-text-color has-primary-color has-css-opacity"/>
<!-- /wp:separator -->

<!-- Wide separator -->
<!-- wp:separator {"align":"wide"} -->
<hr class="wp-block-separator alignwide has-alpha-channel-opacity"/>
<!-- /wp:separator -->

<!-- Dots style (is-style-dots) -->
<!-- wp:separator {"className":"is-style-dots"} -->
<hr class="wp-block-separator has-alpha-channel-opacity is-style-dots"/>
<!-- /wp:separator -->
```

**⚠️ CRITICAL RULES:**
- Uses `<hr>` tag (self-closing in HTML)
- `opacity` defaults to `"alpha-channel"` → class `has-alpha-channel-opacity`
- `opacity: "css"` → class `has-css-opacity`
- Color on separator uses `has-text-color` + `has-{slug}-color` (not background-color!)
- `tagName` attribute controls the HTML tag (defaults to `"hr"`)

---

### 11. core/spacer

**Source:** `@wordpress/block-library/src/spacer/save.js`

**Exact HTML examples:**

```html
<!-- Default spacer (100px) -->
<!-- wp:spacer -->
<div style="height:100px" aria-hidden="true" class="wp-block-spacer"></div>
<!-- /wp:spacer -->

<!-- Spacer with custom height -->
<!-- wp:spacer {"height":"50px"} -->
<div style="height:50px" aria-hidden="true" class="wp-block-spacer"></div>
<!-- /wp:spacer -->

<!-- Spacer with preset spacing -->
<!-- wp:spacer {"height":"var:preset|spacing|50"} -->
<div style="height:var(--wp--preset--spacing--50)" aria-hidden="true" class="wp-block-spacer"></div>
<!-- /wp:spacer -->
```

**⚠️ CRITICAL RULES:**
- ALWAYS has `aria-hidden="true"` attribute
- Height with preset syntax: JSON uses `"var:preset|spacing|50"`, HTML outputs `var(--wp--preset--spacing--50)`
- `wp-block-spacer` class is ALWAYS present

---

### 12. core/list

**Source:** `@wordpress/block-library/src/list/save.js`

**Exact HTML examples:**

```html
<!-- Unordered list -->
<!-- wp:list -->
<ul class="wp-block-list">
<!-- wp:list-item -->
<li>Item one</li>
<!-- /wp:list-item -->
</ul>
<!-- /wp:list -->

<!-- Ordered list -->
<!-- wp:list {"ordered":true} -->
<ol class="wp-block-list">
<!-- wp:list-item blocks -->
</ol>
<!-- /wp:list -->

<!-- Reversed ordered list -->
<!-- wp:list {"ordered":true,"reversed":true} -->
<ol reversed class="wp-block-list">
<!-- wp:list-item blocks -->
</ol>
<!-- /wp:list -->

<!-- Ordered list with start number -->
<!-- wp:list {"ordered":true,"start":5} -->
<ol start="5" class="wp-block-list">
<!-- wp:list-item blocks -->
</ol>
<!-- /wp:list -->
```

**⚠️ CRITICAL RULES:**
- `ordered: true` → `<ol>`, `ordered: false` or omitted → `<ul>`
- `reversed` is a boolean attribute — just presence matters
- Must contain ONLY `core/list-item` children
- `wp-block-list` class is ALWAYS present

---

### 13. core/list-item

**Source:** `@wordpress/block-library/src/list-item/save.js`

**Exact HTML examples:**

```html
<!-- Simple list item -->
<!-- wp:list-item -->
<li>Item content</li>
<!-- /wp:list-item -->

<!-- List item with nested list -->
<!-- wp:list-item -->
<li>Parent item
<!-- wp:list -->
<ul class="wp-block-list">
<!-- wp:list-item -->
<li>Nested item</li>
<!-- /wp:list-item -->
</ul>
<!-- /wp:list -->
</li>
<!-- /wp:list-item -->
```

---

### 14. core/quote

**Source:** `@wordpress/block-library/src/quote/save.js`

**Exact HTML examples:**

```html
<!-- Simple quote -->
<!-- wp:quote -->
<blockquote class="wp-block-quote">
<!-- wp:paragraph -->
<p>Quote text here</p>
<!-- /wp:paragraph -->
</blockquote>
<!-- /wp:quote -->

<!-- Quote with citation -->
<!-- wp:quote -->
<blockquote class="wp-block-quote">
<!-- wp:paragraph -->
<p>Quote text here</p>
<!-- /wp:paragraph -->
<cite>Author Name</cite>
</blockquote>
<!-- /wp:quote -->

<!-- Quote with text alignment -->
<!-- wp:quote {"textAlign":"center"} -->
<blockquote class="wp-block-quote has-text-align-center">
<!-- inner blocks -->
</blockquote>
<!-- /wp:quote -->
```

**⚠️ CRITICAL RULES:**
- Uses `<blockquote>` wrapper
- Citation uses `<cite>` tag (inside blockquote, after inner blocks)
- Quote contains inner blocks (paragraphs, etc.) — NOT direct text

---

### 15. core/social-links (container)

**Source:** `@wordpress/block-library/src/social-links/save.js`

**Save function logic:**
- Renders `<ul>` with inner blocks
- `showLabels` → class `has-visible-labels`
- `iconColorValue` / `iconBackgroundColorValue` → inline styles

**Exact HTML examples:**

```html
<!-- Default social links -->
<!-- wp:social-links -->
<ul class="wp-block-social-links">
<!-- wp:social-link blocks -->
</ul>
<!-- /wp:social-links -->

<!-- Social links with icon colors (semantic slugs) -->
<!-- wp:social-links {"iconColor":"background","iconBackgroundColor":"primary"} -->
<ul class="wp-block-social-links has-icon-color has-icon-background-color">
<!-- wp:social-link blocks -->
</ul>
<!-- /wp:social-links -->

<!-- Social links with visible labels -->
<!-- wp:social-links {"showLabels":true} -->
<ul class="wp-block-social-links has-visible-labels">
<!-- wp:social-link blocks -->
</ul>
<!-- /wp:social-links -->

<!-- Social links with size -->
<!-- wp:social-links {"size":"has-large-icon-size"} -->
<ul class="wp-block-social-links has-large-icon-size">
<!-- wp:social-link blocks -->
</ul>
<!-- /wp:social-links -->
```

**⚠️ CRITICAL RULES FOR PRESSPILOT:**
- **NEVER** use `iconColorValue` / `iconBackgroundColorValue` — these produce inline `style` attributes and are banned by the pattern linter
- **USE** `iconColor` / `iconBackgroundColor` with semantic slug names — these produce `has-icon-color` / `has-icon-background-color` classes
- Each social-link child is a dynamic block (rendered server-side) — only the comment attributes matter

---

### 16. core/social-link (individual, DYNAMIC)

This is a **dynamic block** — rendered server-side by PHP. The save() returns null.

**Comment syntax only:**
```html
<!-- wp:social-link {"url":"https://twitter.com/example","service":"twitter"} /-->
<!-- wp:social-link {"url":"https://facebook.com/example","service":"facebook"} /-->
<!-- wp:social-link {"url":"https://instagram.com/example","service":"instagram"} /-->
<!-- wp:social-link {"url":"mailto:hello@example.com","service":"mail"} /-->
```

**⚠️ CRITICAL RULES:**
- Self-closing block (`/-->`)
- `service` attribute is **REQUIRED** — must match one of ~70 supported services
- `url` attribute is required for the link to render
- The PHP renderer adds `<li>` wrapper, SVG icon, and color classes at runtime

---

### 17. core/media-text

**Source:** `@wordpress/block-library/src/media-text/save.js`

**Key structure:**
```
<div class="wp-block-media-text [modifiers]" style="grid-template-columns:...">
  <figure class="wp-block-media-text__media">
    <img ... />
  </figure>
  <div class="wp-block-media-text__content">
    <!-- inner blocks -->
  </div>
</div>
```

**Exact HTML examples:**

```html
<!-- Default media-text (image left, 50/50) -->
<!-- wp:media-text {"mediaId":123,"mediaType":"image","mediaUrl":"https://example.com/photo.jpg"} -->
<div class="wp-block-media-text is-stacked-on-mobile"><figure class="wp-block-media-text__media"><img src="https://example.com/photo.jpg" alt="" class="wp-image-123 size-full"/></figure><div class="wp-block-media-text__content">
<!-- inner blocks -->
</div></div>
<!-- /wp:media-text -->

<!-- Media on right side -->
<!-- wp:media-text {"mediaPosition":"right","mediaId":123,"mediaType":"image","mediaUrl":"https://example.com/photo.jpg"} -->
<div class="wp-block-media-text has-media-on-the-right is-stacked-on-mobile"><div class="wp-block-media-text__content">
<!-- inner blocks -->
</div><figure class="wp-block-media-text__media"><img src="https://example.com/photo.jpg" alt="" class="wp-image-123 size-full"/></figure></div>
<!-- /wp:media-text -->

<!-- Custom width ratio (60/40) -->
<!-- wp:media-text {"mediaId":123,"mediaType":"image","mediaUrl":"https://example.com/photo.jpg","mediaWidth":60} -->
<div class="wp-block-media-text is-stacked-on-mobile" style="grid-template-columns:60% auto"><figure class="wp-block-media-text__media"><img src="https://example.com/photo.jpg" alt="" class="wp-image-123 size-full"/></figure><div class="wp-block-media-text__content">
<!-- inner blocks -->
</div></div>
<!-- /wp:media-text -->
```

**⚠️ CRITICAL RULES:**
- `is-stacked-on-mobile` is added when `isStackedOnMobile` is true (DEFAULT)
- `mediaPosition: "right"` → flips HTML order (content before figure) AND adds `has-media-on-the-right`
- `mediaWidth` other than 50 → adds `grid-template-columns` inline style
- Image classes: `wp-image-{id}` AND `size-{sizeSlug}` on the `<img>`

---

### 18. core/navigation

**Special case:** Navigation with `ref` returns `undefined` (not null) — the block is loaded from the `wp_navigation` entity. Without `ref`, it saves inner blocks.

**⚠️ PRESSPILOT RULE:** Do NOT use `core/navigation` with `ref`. The pattern linter bans it. Use paragraph-based links or navigation-link blocks without ref.

```html
<!-- Navigation WITHOUT ref (inner blocks saved) -->
<!-- wp:navigation -->
<!-- wp:navigation-link {"label":"Home","url":"/"} /-->
<!-- wp:navigation-link {"label":"About","url":"/about"} /-->
<!-- /wp:navigation -->
```

---

### 19. core/gallery

**Source:** `@wordpress/block-library/src/gallery/save.js`

**Exact HTML examples:**

```html
<!-- Gallery with images -->
<!-- wp:gallery {"columns":3,"linkTo":"none"} -->
<figure class="wp-block-gallery has-nested-images columns-3">
<!-- wp:image blocks -->
</figure>
<!-- /wp:gallery -->

<!-- Gallery with crop -->
<!-- wp:gallery {"columns":3,"imageCrop":true} -->
<figure class="wp-block-gallery has-nested-images columns-3 is-cropped">
<!-- wp:image blocks -->
</figure>
<!-- /wp:gallery -->

<!-- Gallery with caption -->
<!-- wp:gallery {"columns":2} -->
<figure class="wp-block-gallery has-nested-images columns-2">
<!-- wp:image blocks -->
<figcaption class="blocks-gallery-caption wp-element-caption">Gallery caption</figcaption>
</figure>
<!-- /wp:gallery -->
```

**⚠️ CRITICAL RULES:**
- Uses `<figure>` wrapper (not `<div>`)
- `has-nested-images` class is ALWAYS present
- `columns-{n}` when columns is specified; `columns-default` when not
- `is-cropped` when `imageCrop` is true
- Contains `core/image` blocks as children

---

### 20. core/table

**Source:** `@wordpress/block-library/src/table/save.js`

**Key structure:**
```
<figure class="wp-block-table">
  <table class="[color-classes] [border-classes] [has-fixed-layout]" style="...">
    <thead>...</thead>
    <tbody>...</tbody>
    <tfoot>...</tfoot>
  </table>
  <figcaption>...</figcaption>
</figure>
```

**Exact HTML examples:**

```html
<!-- Simple table -->
<!-- wp:table -->
<figure class="wp-block-table"><table><tbody><tr><td>Cell 1</td><td>Cell 2</td></tr></tbody></table></figure>
<!-- /wp:table -->

<!-- Table with header -->
<!-- wp:table -->
<figure class="wp-block-table"><table><thead><tr><th>Header 1</th><th>Header 2</th></tr></thead><tbody><tr><td>Cell 1</td><td>Cell 2</td></tr></tbody></table></figure>
<!-- /wp:table -->

<!-- Fixed layout table -->
<!-- wp:table {"hasFixedLayout":true} -->
<figure class="wp-block-table"><table class="has-fixed-layout"><tbody><tr><td>Cell</td></tr></tbody></table></figure>
<!-- /wp:table -->
```

---

## BLOCK SUPPORT CLASS GENERATION RULES

These rules apply to ALL blocks that support the relevant feature. They are generated by `useBlockProps.save()` based on block support hooks.

### Color Classes (from `@wordpress/block-editor/src/hooks/color.js`)

```
getColorClassName(contextName, colorSlug) → "has-{kebab(slug)}-{contextName}"

Examples:
  getColorClassName("color", "primary")             → "has-primary-color"
  getColorClassName("background-color", "secondary") → "has-secondary-background-color"
  getColorClassName("color", "vivid-red")           → "has-vivid-red-color"
```

**Full class generation rules:**

| Condition | Classes Added |
|-----------|-------------|
| `textColor: "primary"` | `has-primary-color has-text-color` |
| `backgroundColor: "secondary"` | `has-secondary-background-color has-background` |
| `style.color.text: "#hex"` | `has-text-color` (+ inline `style="color:#hex"`) |
| `style.color.background: "#hex"` | `has-background` (+ inline `style="background-color:#hex"`) |
| `gradient: "vivid-cyan-blue-to-vivid-purple"` | `has-vivid-cyan-blue-to-vivid-purple-gradient-background` |
| `style.elements.link.color` exists | `has-link-color` |

### Alignment Classes (from `@wordpress/block-editor/src/hooks/align.js`)

```
align: "wide"   → class "alignwide"
align: "full"   → class "alignfull"
align: "left"   → class "alignleft"
align: "center" → class "aligncenter"
align: "right"  → class "alignright"
```

### Font Size Classes (from `@wordpress/block-editor/src/hooks/font-size.js`)

```
fontSize: "small"  → class "has-small-font-size"
fontSize: "medium" → class "has-medium-font-size"
fontSize: "large"  → class "has-large-font-size"
fontSize: "x-large" → class "has-x-large-font-size"
```

### Spacing (Padding/Margin) Inline Styles

JSON attribute format: `"var:preset|spacing|50"`
HTML output format: `var(--wp--preset--spacing--50)`

```json
{"style":{"spacing":{"padding":{"top":"var:preset|spacing|50","bottom":"var:preset|spacing|50"}}}}
```
→ `style="padding-top:var(--wp--preset--spacing--50);padding-bottom:var(--wp--preset--spacing--50)"`

---

## COMMENT SERIALIZATION FORMAT

From `@wordpress/blocks/src/api/serializer.js`:

### Block with content:
```
<!-- wp:{blockName} {JSON} -->
{innerHTML}
<!-- /wp:{blockName} -->
```

### Self-closing block:
```
<!-- wp:{blockName} {JSON} /-->
```

### Rules:
1. `core/` prefix is STRIPPED: `core/paragraph` → `wp:paragraph`
2. Attributes are serialized as JSON with special escaping:
   - `--` (double dash) → `\u002d\u002d` (can't have `--` inside HTML comments)
   - `<` → `\u003c`
   - `>` → `\u003e`
   - `&` → `\u0026`
3. Empty attributes object `{}` is omitted entirely
4. There is a SPACE between block name and `-->` or `/-->`
5. There is a SPACE between block name and `{` for attributes

### Valid comment formats:
```html
<!-- wp:paragraph -->              ✅ (no attributes)
<!-- wp:paragraph {"align":"center"} -->  ✅ (with attributes)
<!-- wp:spacer {"height":"50px"} /-->     ✅ (self-closing with attributes)
<!-- wp:template-part {"slug":"header"} /-->  ✅ (self-closing)
<!-- wp:paragraph-->               ❌ (missing space before -->)
<!-- wp:paragraph { "align": "center" } -->  ❌ (spaces inside JSON — technically valid JSON but WordPress serializer doesn't produce this)
```

---

## QUICK REFERENCE: MOST COMMON MISTAKES

| Mistake | Why It Fails | Fix |
|---------|-------------|-----|
| `class="wp-block-image wp-image-123"` on `<figure>` | `wp-image-{id}` belongs on `<img>`, not `<figure>` | Move to `<img>` tag |
| Missing `has-text-color` with `textColor` | Named colors produce TWO classes | Always add both `has-{slug}-color` AND `has-text-color` |
| Missing `has-background` with `backgroundColor` | Same as above | Always add both `has-{slug}-background-color` AND `has-background` |
| `style=""` when save() doesn't produce it | Empty style = extra attribute = count mismatch | Don't add style if there are no inline styles |
| `<div class="wp-block-group">` with `tagName: "section"` | Tag name must match | Use `<section class="wp-block-group">` |
| Missing `aria-hidden="true"` on spacer | save() always adds it | Always include on spacer blocks |
| Missing `data-object-fit="cover"` on cover image | save() always adds it | Always include on cover `<img>` |
| Missing `wp-element-button` on button link | New class added by block supports | Always include both `wp-block-button__link` and `wp-element-button` |
| Using `iconColorValue` on social-links | PressPilot linter bans it + produces inline styles | Use `iconColor` semantic slug |
| Missing `dimRatio` on cover | Required attribute | Always specify dimRatio (50 is common default) |
| `has-background-dim` without `has-background-dim-{N}` on cover | dimRatioToClass always produces the numbered class | Include both classes |
| `<figcaption class="wp-block-image__caption">` | Deprecated class name | Use `wp-element-caption` |
| `<hr>` without `has-alpha-channel-opacity` | Default opacity class for separator | Always include unless using `opacity: "css"` |

---

## VERSION NOTES

- This reference is based on WordPress Gutenberg trunk as of March 2026
- `wp-element-button` and `wp-element-caption` classes were added in WordPress 6.1
- The `wp-block-heading` class was added to headings (previously headings had no block class)
- Cover block's `is-light` class replaces the older dark/light detection
- Gallery block uses inner `core/image` blocks (modern format, not legacy `<img>` direct children)

---

## COMMON VIOLATIONS & FIXES

### 1. Missing `wp-element-button` Class

**Violation:** Button link missing `wp-element-button` class

**Why it fails:** WordPress 6.1+ added this class via `__experimentalGetElementClassName('button')` in the button save function. Without it, validation detects a class count mismatch.

**Wrong:**
```html
<a class="wp-block-button__link">Click Me</a>
```

**Correct:**
```html
<a class="wp-block-button__link wp-element-button">Click Me</a>
```

**Fix:** Add `wp-element-button` to ALL `<a class="wp-block-button__link">` elements.

---

### 2. Missing `wp-block-heading` Class

**Violation:** Heading element missing `wp-block-heading` class

**Why it fails:** WordPress 6.x+ always adds `wp-block-heading` via `useBlockProps.save()` in the heading block's save function.

**Wrong:**
```html
<!-- wp:heading {"level":2} -->
<h2>My Heading</h2>
<!-- /wp:heading -->
```

**Correct:**
```html
<!-- wp:heading {"level":2} -->
<h2 class="wp-block-heading">My Heading</h2>
<!-- /wp:heading -->
```

**Fix:** Add `wp-block-heading` to ALL `<h1>`-`<h6>` tags within `wp:heading` blocks.

---

### 3. Missing Separator Opacity Class

**Violation:** Separator missing opacity class

**Why it fails:** The separator save function ALWAYS outputs an opacity class. Default is `has-alpha-channel-opacity` unless `opacity:"css"` is specified in attributes.

**Wrong:**
```html
<!-- wp:separator -->
<hr class="wp-block-separator"/>
<!-- /wp:separator -->
```

**Correct:**
```html
<!-- wp:separator -->
<hr class="wp-block-separator has-alpha-channel-opacity"/>
<!-- /wp:separator -->
```

**Fix:** Add `has-alpha-channel-opacity` (default) or `has-css-opacity` to ALL separator `<hr>` elements.

---

### 4. Using `iconColorValue` Instead of Semantic Slugs

**Violation:** social-links using `iconColorValue` or `iconBackgroundColorValue`

**Why it fails:**
1. Produces inline `style` attributes (banned by PressPilot linter)
2. Uses hex colors instead of theme.json tokens
3. WordPress save() with semantic slugs produces classes, not inline styles

**Wrong:**
```html
<!-- wp:social-links {"iconColorValue":"#ffffff","iconBackgroundColorValue":"#d8262f"} -->
<ul class="wp-block-social-links" style="color:#ffffff;">
```

**Correct:**
```html
<!-- wp:social-links {"iconColor":"base","iconBackgroundColor":"primary"} -->
<ul class="wp-block-social-links has-icon-color has-icon-background-color">
```

**Fix:**
1. Replace `iconColorValue` → `iconColor` (use semantic slug from theme.json)
2. Replace `iconBackgroundColorValue` → `iconBackgroundColor` (use semantic slug)
3. Remove inline `style` attributes from `<ul>`
4. Ensure `has-icon-color` and `has-icon-background-color` classes are present

**Color mapping guide:**
- `#ffffff` or `#fff` → `"base"` (light/white)
- `#000000` or `#000` → `"contrast"` (dark/black)
- Theme-specific colors → map to closest theme.json palette slug

---

*Generated from WordPress Gutenberg source code. This is the ground truth for block validation.*
