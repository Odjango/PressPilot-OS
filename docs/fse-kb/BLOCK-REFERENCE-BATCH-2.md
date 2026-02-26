# BLOCK-REFERENCE.md - BATCH 2
**WordPress Core Blocks Markup Reference for AI Coding Agents**  
*Target: WordPress 6.7+ Block Library*

**BATCH 2: TEXT BLOCKS**

---

## 1. HEADING BLOCK

**Block Name:** `core/heading`

**Purpose:** Introduce sections and organize content structure with semantic heading elements (h1-h6).

### Attributes

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `content` | rich-text | `""` | Heading text content (supports inline formatting) |
| `level` | number | `2` | Heading level (1-6, outputs h1-h6) |
| `textAlign` | string | undefined | Text alignment (`"left"`, `"center"`, `"right"`) |
| `levelOptions` | array | undefined | Array limiting which levels are available (e.g., `[3,4,5]`) |
| `placeholder` | string | undefined | Placeholder text shown when empty |
| `align` | string | undefined | Block alignment (`"wide"`, `"full"`) |
| `anchor` | string | undefined | HTML ID attribute for linking |
| `className` | string | undefined | Additional CSS classes |
| `style` | object | undefined | Inline styles (typography, colors, spacing, borders) |

### HTML Structure

**Basic Heading (Level 2, Default):**
```html
<!-- wp:heading -->
<h2 class="wp-block-heading">Heading Text</h2>
<!-- /wp:heading -->
```

**Heading Level 1:**
```html
<!-- wp:heading {"level":1} -->
<h1 class="wp-block-heading">Page Title</h1>
<!-- /wp:heading -->
```

**Heading with Text Alignment:**
```html
<!-- wp:heading {"textAlign":"center"} -->
<h2 class="wp-block-heading has-text-align-center">Centered Heading</h2>
<!-- /wp:heading -->
```

**Heading with Color:**
```html
<!-- wp:heading {"textColor":"primary"} -->
<h2 class="wp-block-heading has-primary-color has-text-color">Colored Heading</h2>
<!-- /wp:heading -->
```

**Heading with Font Size:**
```html
<!-- wp:heading {"fontSize":"large"} -->
<h2 class="wp-block-heading has-large-font-size">Large Heading</h2>
<!-- /wp:heading -->
```

**Full Example with Multiple Attributes:**
```html
<!-- wp:heading {"level":3,"textAlign":"center","textColor":"primary","fontSize":"large"} -->
<h3 class="wp-block-heading has-text-align-center has-primary-color has-text-color has-large-font-size">Section Title</h3>
<!-- /wp:heading -->
```

**Heading with Inline Styles:**
```html
<!-- wp:heading {"style":{"typography":{"fontSize":"2.5rem"}}} -->
<h2 class="wp-block-heading" style="font-size:2.5rem">Custom Sized Heading</h2>
<!-- /wp:heading -->
```

### Allowed Inner Blocks

**NONE** - Headings are text-only blocks (RichText with inline formatting only).

### CSS Classes Applied

**Base class:** `wp-block-heading` (ALWAYS present)

**Text alignment classes:**
- `has-text-align-left` when `textAlign: "left"`
- `has-text-align-center` when `textAlign: "center"`
- `has-text-align-right` when `textAlign: "right"`

**Color classes:**
- `has-{color-slug}-color` when `textColor` is set
- `has-text-color` when text color is set
- `has-{color-slug}-background-color` when `backgroundColor` is set
- `has-background` when background color is set

**Font size classes:**
- `has-{size-slug}-font-size` when `fontSize` preset is used

**Alignment classes:**
- `alignwide` when `align: "wide"`
- `alignfull` when `align: "full"`

### Common Mistakes

❌ **WRONG:** Omitting `wp-block-heading` class
```html
<!-- wp:heading -->
<h2>Heading</h2>
<!-- /wp:heading -->
```

✅ **CORRECT:** Always include base class
```html
<!-- wp:heading -->
<h2 class="wp-block-heading">Heading</h2>
<!-- /wp:heading -->
```

❌ **WRONG:** Wrong heading tag for level attribute
```html
<!-- wp:heading {"level":3} -->
<h2 class="wp-block-heading">Wrong Tag</h2>
<!-- /wp:heading -->
```

✅ **CORRECT:** Tag must match level
```html
<!-- wp:heading {"level":3} -->
<h3 class="wp-block-heading">Correct Tag</h3>
<!-- /wp:heading -->
```

❌ **WRONG:** Using inline style attribute for textAlign instead of class
```html
<!-- wp:heading {"textAlign":"center"} -->
<h2 class="wp-block-heading" style="text-align:center">Centered</h2>
<!-- /wp:heading -->
```

✅ **CORRECT:** Text alignment uses CSS class
```html
<!-- wp:heading {"textAlign":"center"} -->
<h2 class="wp-block-heading has-text-align-center">Centered</h2>
<!-- /wp:heading -->
```

---

## 2. PARAGRAPH BLOCK

**Block Name:** `core/paragraph`

**Purpose:** Add simple text content. The default and most commonly used block.

### Attributes

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `content` | rich-text | `""` | Paragraph text content (supports inline formatting) |
| `align` | string | undefined | Block alignment (`"left"`, `"center"`, `"right"`, `"wide"`, `"full"`) |
| `dropCap` | boolean | `false` | Enable drop cap on first letter |
| `placeholder` | string | undefined | Placeholder text shown when empty |
| `anchor` | string | undefined | HTML ID attribute |
| `className` | string | undefined | Additional CSS classes |
| `style` | object | undefined | Inline styles |

### HTML Structure

**Basic Paragraph:**
```html
<!-- wp:paragraph -->
<p>This is a paragraph of text.</p>
<!-- /wp:paragraph -->
```

**Paragraph with Text Alignment:**
```html
<!-- wp:paragraph {"align":"center"} -->
<p class="has-text-align-center">Centered paragraph text.</p>
<!-- /wp:paragraph -->
```

**Paragraph with Drop Cap:**
```html
<!-- wp:paragraph {"dropCap":true} -->
<p class="has-drop-cap">This paragraph has a drop cap on the first letter.</p>
<!-- /wp:paragraph -->
```

**Paragraph with Color:**
```html
<!-- wp:paragraph {"textColor":"primary","backgroundColor":"light-gray"} -->
<p class="has-primary-color has-light-gray-background-color has-text-color has-background">Colored paragraph.</p>
<!-- /wp:paragraph -->
```

**Paragraph with Font Size:**
```html
<!-- wp:paragraph {"fontSize":"medium"} -->
<p class="has-medium-font-size">Medium-sized text.</p>
<!-- /wp:paragraph -->
```

**Full Example:**
```html
<!-- wp:paragraph {"align":"center","fontSize":"large","textColor":"dark-gray"} -->
<p class="has-text-align-center has-large-font-size has-dark-gray-color has-text-color">A styled paragraph with alignment, size, and color.</p>
<!-- /wp:paragraph -->
```

**Paragraph with Inline Formatting:**
```html
<!-- wp:paragraph -->
<p>This is <strong>bold</strong> and this is <em>italic</em> text.</p>
<!-- /wp:paragraph -->
```

### Allowed Inner Blocks

**NONE** - Paragraphs contain inline content only (RichText).

### CSS Classes Applied

**Base class:** NONE by default (bare `<p>` tag unless attributes are set)

**Text alignment classes:**
- `has-text-align-left` when `align: "left"`
- `has-text-align-center` when `align: "center"`
- `has-text-align-right` when `align: "right"`

**Drop cap class:**
- `has-drop-cap` when `dropCap: true`

**Color classes:**
- `has-{color-slug}-color` when `textColor` is set
- `has-text-color` when text color is set
- `has-{color-slug}-background-color` when `backgroundColor` is set
- `has-background` when background color is set

**Font size classes:**
- `has-{size-slug}-font-size` when `fontSize` preset is used

**Block alignment classes:**
- `alignwide` when `align: "wide"`
- `alignfull` when `align: "full"`

### Common Mistakes

❌ **WRONG:** Adding wrapper div around paragraph
```html
<!-- wp:paragraph -->
<div><p>Text</p></div>
<!-- /wp:paragraph -->
```

✅ **CORRECT:** Paragraph is just a `<p>` tag
```html
<!-- wp:paragraph -->
<p>Text</p>
<!-- /wp:paragraph -->
```

❌ **WRONG:** Using style attribute for text alignment
```html
<!-- wp:paragraph {"align":"center"} -->
<p style="text-align:center">Text</p>
<!-- /wp:paragraph -->
```

✅ **CORRECT:** Alignment uses CSS class
```html
<!-- wp:paragraph {"align":"center"} -->
<p class="has-text-align-center">Text</p>
<!-- /wp:paragraph -->
```

---

## 3. LIST BLOCK

**Block Name:** `core/list`

**Purpose:** Create ordered or unordered lists. Container for list-item blocks.

### Attributes

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `ordered` | boolean | `false` | Whether list is ordered (`true` = `<ol>`, `false` = `<ul>`) |
| `start` | number | undefined | Starting number for ordered lists |
| `reversed` | boolean | `false` | Reverse numbering for ordered lists |
| `type` | string | undefined | List style type (for ordered: `"1"`, `"A"`, `"a"`, `"I"`, `"i"`) |
| `className` | string | undefined | Additional CSS classes |
| `style` | object | undefined | Inline styles |
| `anchor` | string | undefined | HTML ID attribute |

### HTML Structure

**Basic Unordered List:**
```html
<!-- wp:list -->
<ul class="wp-block-list">
  <!-- wp:list-item -->
  <li>First item</li>
  <!-- /wp:list-item -->
  
  <!-- wp:list-item -->
  <li>Second item</li>
  <!-- /wp:list-item -->
</ul>
<!-- /wp:list -->
```

**Ordered List:**
```html
<!-- wp:list {"ordered":true} -->
<ol class="wp-block-list">
  <!-- wp:list-item -->
  <li>First item</li>
  <!-- /wp:list-item -->
  
  <!-- wp:list-item -->
  <li>Second item</li>
  <!-- /wp:list-item -->
</ol>
<!-- /wp:list -->
```

**Ordered List with Start Value:**
```html
<!-- wp:list {"ordered":true,"start":5} -->
<ol start="5" class="wp-block-list">
  <!-- wp:list-item -->
  <li>Item 5</li>
  <!-- /wp:list-item -->
  
  <!-- wp:list-item -->
  <li>Item 6</li>
  <!-- /wp:list-item -->
</ol>
<!-- /wp:list -->
```

**Reversed Ordered List:**
```html
<!-- wp:list {"ordered":true,"reversed":true} -->
<ol reversed class="wp-block-list">
  <!-- wp:list-item -->
  <li>Item 3</li>
  <!-- /wp:list-item -->
  
  <!-- wp:list-item -->
  <li>Item 2</li>
  <!-- /wp:list-item -->
  
  <!-- wp:list-item -->
  <li>Item 1</li>
  <!-- /wp:list-item -->
</ol>
<!-- /wp:list -->
```

**List with Style Type:**
```html
<!-- wp:list {"ordered":true,"type":"A"} -->
<ol type="A" class="wp-block-list">
  <!-- wp:list-item -->
  <li>First (A)</li>
  <!-- /wp:list-item -->
  
  <!-- wp:list-item -->
  <li>Second (B)</li>
  <!-- /wp:list-item -->
</ol>
<!-- /wp:list -->
```

**Nested List:**
```html
<!-- wp:list -->
<ul class="wp-block-list">
  <!-- wp:list-item -->
  <li>Parent item
    <!-- wp:list -->
    <ul class="wp-block-list">
      <!-- wp:list-item -->
      <li>Nested item 1</li>
      <!-- /wp:list-item -->
      
      <!-- wp:list-item -->
      <li>Nested item 2</li>
      <!-- /wp:list-item -->
    </ul>
    <!-- /wp:list -->
  </li>
  <!-- /wp:list-item -->
</ul>
<!-- /wp:list -->
```

### Allowed Inner Blocks

**ONLY `core/list-item` blocks** - no other blocks allowed as direct children.

### CSS Classes Applied

**Base class:** `wp-block-list` (always present on both `<ul>` and `<ol>`)

**No modifier classes** - styling primarily comes from HTML element type and attributes.

### Common Mistakes

❌ **WRONG:** Using `<ul>` when ordered is true
```html
<!-- wp:list {"ordered":true} -->
<ul class="wp-block-list">...</ul>
<!-- /wp:list -->
```

✅ **CORRECT:** ordered:true uses `<ol>`
```html
<!-- wp:list {"ordered":true} -->
<ol class="wp-block-list">...</ol>
<!-- /wp:list -->
```

❌ **WRONG:** Putting non-list-item blocks inside list
```html
<!-- wp:list -->
<ul class="wp-block-list">
  <!-- wp:paragraph -->
  <p>Not allowed</p>
  <!-- /wp:paragraph -->
</ul>
<!-- /wp:list -->
```

✅ **CORRECT:** Only list-item blocks as direct children
```html
<!-- wp:list -->
<ul class="wp-block-list">
  <!-- wp:list-item -->
  <li>Correct</li>
  <!-- /wp:list-item -->
</ul>
<!-- /wp:list -->
```

❌ **WRONG:** Missing wp-block-list class
```html
<!-- wp:list -->
<ul>...</ul>
<!-- /wp:list -->
```

✅ **CORRECT:** Always include base class
```html
<!-- wp:list -->
<ul class="wp-block-list">...</ul>
<!-- /wp:list -->
```

---

## 4. LIST-ITEM BLOCK

**Block Name:** `core/list-item`

**Purpose:** Individual item within a list. MUST be child of `core/list`.

### Attributes

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `content` | rich-text | `""` | List item text content (supports inline formatting) |
| `placeholder` | string | undefined | Placeholder text when empty |
| `className` | string | undefined | Additional CSS classes |
| `style` | object | undefined | Inline styles |

### HTML Structure

**Basic List Item:**
```html
<!-- wp:list-item -->
<li>List item text</li>
<!-- /wp:list-item -->
```

**List Item with Inline Formatting:**
```html
<!-- wp:list-item -->
<li>This is <strong>bold</strong> and this is <em>italic</em></li>
<!-- /wp:list-item -->
```

**List Item with Link:**
```html
<!-- wp:list-item -->
<li>Check out <a href="https://example.com">this link</a></li>
<!-- /wp:list-item -->
```

**List Item with Nested List:**
```html
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

### Parent Constraint

**MUST be child of:** `core/list` block only.

### CSS Classes Applied

**NONE by default** - List items are bare `<li>` tags unless custom classes are added.

### Common Mistakes

❌ **WRONG:** List item used outside of list block
```html
<!-- wp:list-item -->
<li>Item</li>
<!-- /wp:list-item -->
```

✅ **CORRECT:** Must be inside list block
```html
<!-- wp:list -->
<ul class="wp-block-list">
  <!-- wp:list-item -->
  <li>Item</li>
  <!-- /wp:list-item -->
</ul>
<!-- /wp:list -->
```

❌ **WRONG:** Adding wrapper div
```html
<!-- wp:list-item -->
<div><li>Item</li></div>
<!-- /wp:list-item -->
```

✅ **CORRECT:** Just the `<li>` tag
```html
<!-- wp:list-item -->
<li>Item</li>
<!-- /wp:list-item -->
```

---

## 5. QUOTE BLOCK

**Block Name:** `core/quote`

**Purpose:** Give quoted text visual emphasis with a blockquote element and optional citation.

### Attributes

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `value` | string (HTML) | `""` | Quote content (multiline paragraphs) |
| `citation` | rich-text | `""` | Citation text (author/source) |
| `textAlign` | string | undefined | Text alignment (`"left"`, `"center"`, `"right"`) |
| `align` | string | undefined | Block alignment (`"left"`, `"right"`, `"wide"`, `"full"`) |
| `className` | string | undefined | Additional CSS classes (used for style variations) |
| `anchor` | string | undefined | HTML ID attribute |
| `style` | object | undefined | Inline styles |

### HTML Structure

**Basic Quote:**
```html
<!-- wp:quote -->
<blockquote class="wp-block-quote">
  <p>This is a quote.</p>
</blockquote>
<!-- /wp:quote -->
```

**Quote with Citation:**
```html
<!-- wp:quote -->
<blockquote class="wp-block-quote">
  <p>In quoting others, we cite ourselves.</p>
  <cite>Julio Cortázar</cite>
</blockquote>
<!-- /wp:quote -->
```

**Quote with Multiple Paragraphs:**
```html
<!-- wp:quote -->
<blockquote class="wp-block-quote">
  <p>First paragraph of the quote.</p>
  <p>Second paragraph of the quote.</p>
  <cite>Author Name</cite>
</blockquote>
<!-- /wp:quote -->
```

**Quote with Text Alignment:**
```html
<!-- wp:quote {"textAlign":"center"} -->
<blockquote class="wp-block-quote has-text-align-center">
  <p>Centered quote text.</p>
  <cite>Source</cite>
</blockquote>
<!-- /wp:quote -->
```

**Quote with Block Alignment (Left):**
```html
<!-- wp:quote {"align":"left"} -->
<blockquote class="wp-block-quote alignleft">
  <p>This quote floats to the left.</p>
  <cite>Author</cite>
</blockquote>
<!-- /wp:quote -->
```

**Quote with Style Variation (Plain):**
```html
<!-- wp:quote {"className":"is-style-plain"} -->
<blockquote class="wp-block-quote is-style-plain">
  <p>Plain style quote without border.</p>
</blockquote>
<!-- /wp:quote -->
```

### Allowed Inner Blocks

**NONE** - Quote content is stored as HTML string in `value` attribute, citation in `citation` attribute.

### CSS Classes Applied

**Base class:** `wp-block-quote` (always present)

**Text alignment classes:**
- `has-text-align-left` when `textAlign: "left"`
- `has-text-align-center` when `textAlign: "center"`
- `has-text-align-right` when `textAlign: "right"`

**Block alignment classes:**
- `alignleft` when `align: "left"` (floats left)
- `alignright` when `align: "right"` (floats right)
- `alignwide` when `align: "wide"`
- `alignfull` when `align: "full"`

**Style variation classes:**
- `is-style-default` - standard quote with border
- `is-style-plain` - no border
- `is-style-large` - larger text (some themes)

### Common Mistakes

❌ **WRONG:** Using `<quote>` instead of `<blockquote>`
```html
<!-- wp:quote -->
<quote class="wp-block-quote">
  <p>Text</p>
</quote>
<!-- /wp:quote -->
```

✅ **CORRECT:** Always use `<blockquote>`
```html
<!-- wp:quote -->
<blockquote class="wp-block-quote">
  <p>Text</p>
</blockquote>
<!-- /wp:quote -->
```

❌ **WRONG:** Citation outside blockquote
```html
<!-- wp:quote -->
<blockquote class="wp-block-quote">
  <p>Quote text</p>
</blockquote>
<cite>Author</cite>
<!-- /wp:quote -->
```

✅ **CORRECT:** Citation inside blockquote
```html
<!-- wp:quote -->
<blockquote class="wp-block-quote">
  <p>Quote text</p>
  <cite>Author</cite>
</blockquote>
<!-- /wp:quote -->
```

❌ **WRONG:** Quote text not wrapped in `<p>` tags
```html
<!-- wp:quote -->
<blockquote class="wp-block-quote">
  Quote text
</blockquote>
<!-- /wp:quote -->
```

✅ **CORRECT:** Quote content in paragraphs
```html
<!-- wp:quote -->
<blockquote class="wp-block-quote">
  <p>Quote text</p>
</blockquote>
<!-- /wp:quote -->
```

---

## 6. PULLQUOTE BLOCK

**Block Name:** `core/pullquote`

**Purpose:** Give special visual emphasis to a quote, typically styled larger than regular quotes.

### Attributes

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `value` | rich-text | `""` | Quote content text |
| `citation` | rich-text | `""` | Citation text |
| `textAlign` | string | undefined | Text alignment (`"left"`, `"center"`, `"right"`) |
| `align` | string | undefined | Block alignment (`"left"`, `"right"`, `"wide"`, `"full"`) |
| `className` | string | undefined | Additional CSS classes |
| `anchor` | string | undefined | HTML ID attribute |
| `style` | object | undefined | Inline styles |

### HTML Structure

**Basic Pullquote:**
```html
<!-- wp:pullquote -->
<figure class="wp-block-pullquote">
  <blockquote>
    <p>This is a pullquote.</p>
  </blockquote>
</figure>
<!-- /wp:pullquote -->
```

**Pullquote with Citation:**
```html
<!-- wp:pullquote -->
<figure class="wp-block-pullquote">
  <blockquote>
    <p>Give special visual emphasis to a quote from your text.</p>
    <cite>WordPress Documentation</cite>
  </blockquote>
</figure>
<!-- /wp:pullquote -->
```

**Pullquote with Text Alignment:**
```html
<!-- wp:pullquote {"textAlign":"center"} -->
<figure class="wp-block-pullquote has-text-align-center">
  <blockquote>
    <p>Centered pullquote text.</p>
  </blockquote>
</figure>
<!-- /wp:pullquote -->
```

**Pullquote with Wide Alignment:**
```html
<!-- wp:pullquote {"align":"wide"} -->
<figure class="wp-block-pullquote alignwide">
  <blockquote>
    <p>Wide pullquote spanning beyond content width.</p>
    <cite>Author</cite>
  </blockquote>
</figure>
<!-- /wp:pullquote -->
```

**Pullquote with Colors:**
```html
<!-- wp:pullquote {"backgroundColor":"light-gray","textColor":"dark-gray"} -->
<figure class="wp-block-pullquote has-dark-gray-color has-light-gray-background-color has-text-color has-background">
  <blockquote>
    <p>Colored pullquote.</p>
  </blockquote>
</figure>
<!-- /wp:pullquote -->
```

### Allowed Inner Blocks

**NONE** - Pullquote content is stored as rich-text in `value` and `citation` attributes.

### CSS Classes Applied

**Base class:** `wp-block-pullquote` (always present on `<figure>`)

**Text alignment classes:**
- `has-text-align-left` when `textAlign: "left"`
- `has-text-align-center` when `textAlign: "center"`
- `has-text-align-right` when `textAlign: "right"`

**Block alignment classes:**
- `alignleft` when `align: "left"`
- `alignright` when `align: "right"`
- `alignwide` when `align: "wide"`
- `alignfull` when `align: "full"`

**Color classes:**
- `has-{color-slug}-color` when `textColor` is set
- `has-text-color` when text color is set
- `has-{color-slug}-background-color` when `backgroundColor` is set
- `has-background` when background color is set

**Style variation classes:**
- `is-style-solid-color` - some themes provide this style

### Common Mistakes

❌ **WRONG:** Using `<div>` instead of `<figure>`
```html
<!-- wp:pullquote -->
<div class="wp-block-pullquote">
  <blockquote>
    <p>Text</p>
  </blockquote>
</div>
<!-- /wp:pullquote -->
```

✅ **CORRECT:** Pullquote uses `<figure>` wrapper
```html
<!-- wp:pullquote -->
<figure class="wp-block-pullquote">
  <blockquote>
    <p>Text</p>
  </blockquote>
</figure>
<!-- /wp:pullquote -->
```

❌ **WRONG:** Missing `<blockquote>` inside figure
```html
<!-- wp:pullquote -->
<figure class="wp-block-pullquote">
  <p>Text</p>
</figure>
<!-- /wp:pullquote -->
```

✅ **CORRECT:** blockquote required inside figure
```html
<!-- wp:pullquote -->
<figure class="wp-block-pullquote">
  <blockquote>
    <p>Text</p>
  </blockquote>
</figure>
<!-- /wp:pullquote -->
```

❌ **WRONG:** Citation outside blockquote
```html
<!-- wp:pullquote -->
<figure class="wp-block-pullquote">
  <blockquote>
    <p>Quote</p>
  </blockquote>
  <cite>Author</cite>
</figure>
<!-- /wp:pullquote -->
```

✅ **CORRECT:** Citation inside blockquote
```html
<!-- wp:pullquote -->
<figure class="wp-block-pullquote">
  <blockquote>
    <p>Quote</p>
    <cite>Author</cite>
  </blockquote>
</figure>
<!-- /wp:pullquote -->
```

---

## 7. PREFORMATTED BLOCK

**Block Name:** `core/preformatted`

**Purpose:** Display text that respects spacing and tabs, shown in monospace font. For code snippets, poetry, ASCII art, or any text requiring exact formatting.

### Attributes

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `content` | rich-text | `""` | Preformatted text content |
| `anchor` | string | undefined | HTML ID attribute |
| `className` | string | undefined | Additional CSS classes |
| `style` | object | undefined | Inline styles |

### HTML Structure

**Basic Preformatted:**
```html
<!-- wp:preformatted -->
<pre class="wp-block-preformatted">This is preformatted text.</pre>
<!-- /wp:preformatted -->
```

**Preformatted with Preserved Spacing:**
```html
<!-- wp:preformatted -->
<pre class="wp-block-preformatted">Line 1
    Indented line
        Double indented
Back to start</pre>
<!-- /wp:preformatted -->
```

**Preformatted with Color:**
```html
<!-- wp:preformatted {"backgroundColor":"light-gray","textColor":"dark-gray"} -->
<pre class="wp-block-preformatted has-dark-gray-color has-light-gray-background-color has-text-color has-background">Colored preformatted text.</pre>
<!-- /wp:preformatted -->
```

**Preformatted with Font Size:**
```html
<!-- wp:preformatted {"fontSize":"small"} -->
<pre class="wp-block-preformatted has-small-font-size">Smaller monospace text.</pre>
<!-- /wp:preformatted -->
```

**Code Example in Preformatted:**
```html
<!-- wp:preformatted -->
<pre class="wp-block-preformatted">function hello() {
  console.log("Hello World");
  return true;
}</pre>
<!-- /wp:preformatted -->
```

### Allowed Inner Blocks

**NONE** - Preformatted blocks contain text content only (can include inline HTML).

### CSS Classes Applied

**Base class:** `wp-block-preformatted` (always present)

**Color classes:**
- `has-{color-slug}-color` when `textColor` is set
- `has-text-color` when text color is set
- `has-{color-slug}-background-color` when `backgroundColor` is set
- `has-background` when background color is set

**Font size classes:**
- `has-{size-slug}-font-size` when `fontSize` preset is used

### Common Mistakes

❌ **WRONG:** Using `<code>` instead of `<pre>`
```html
<!-- wp:preformatted -->
<code class="wp-block-preformatted">Text</code>
<!-- /wp:preformatted -->
```

✅ **CORRECT:** Preformatted uses `<pre>` tag
```html
<!-- wp:preformatted -->
<pre class="wp-block-preformatted">Text</pre>
<!-- /wp:preformatted -->
```

❌ **WRONG:** Wrapping pre in div
```html
<!-- wp:preformatted -->
<div class="wp-block-preformatted">
  <pre>Text</pre>
</div>
<!-- /wp:preformatted -->
```

✅ **CORRECT:** Just the pre element
```html
<!-- wp:preformatted -->
<pre class="wp-block-preformatted">Text</pre>
<!-- /wp:preformatted -->
```

❌ **WRONG:** Collapsing whitespace in content
```html
<!-- wp:preformatted -->
<pre class="wp-block-preformatted">Line 1 Indented line</pre>
<!-- /wp:preformatted -->
```

✅ **CORRECT:** Preserve exact spacing (that's the point!)
```html
<!-- wp:preformatted -->
<pre class="wp-block-preformatted">Line 1
    Indented line</pre>
<!-- /wp:preformatted -->
```

---

## BATCH 2 SUMMARY

**Text blocks documented:** 7  
✅ heading  
✅ paragraph  
✅ list  
✅ list-item  
✅ quote  
✅ pullquote  
✅ preformatted

**Key Patterns to Remember:**

1. **Heading block** always includes `wp-block-heading` class, level determines HTML tag (h1-h6)
2. **Paragraph block** has NO default class (bare `<p>` tag), classes only added when attributes are set
3. **List block** ONLY contains list-item blocks as direct children
4. **List-item block** MUST be child of list block, is bare `<li>` tag
5. **Quote block** uses `<blockquote>` wrapper, citation goes INSIDE blockquote
6. **Pullquote block** uses `<figure>` → `<blockquote>` structure, citation inside blockquote
7. **Preformatted block** uses `<pre>` tag, preserves ALL whitespace and formatting

**Critical Validation Points:**

- **Heading:** Tag (`<h1>`-`<h6>`) must match `level` attribute
- **List:** Element type (`<ul>` vs `<ol>`) must match `ordered` attribute
- **Quote/Pullquote:** Citation must be inside `<blockquote>`, not outside
- **Quote:** Uses `<blockquote>` directly
- **Pullquote:** Wraps `<blockquote>` in `<figure>`
- **Text alignment:** Uses CSS classes (`has-text-align-center`), NOT inline styles

**Next Batches:**
- BATCH 3: Media Blocks (image, gallery, video, audio)
- BATCH 4: Interactive Blocks (buttons, button, navigation, search, social-links, social-link)
- BATCH 5: Site Blocks (site-title, site-logo, site-tagline)
- BATCH 6: Query Blocks (query, post-template, post-title, etc.)
- BATCH 7: Template Blocks (template-part)

---

*Document version: 1.0*  
*Batch 2 completed: February 2025*  
*Based on: WordPress 6.7+ Block Library*  
*Sources: Gutenberg block.json files, WordPress Core Blocks Reference, Official Documentation*
