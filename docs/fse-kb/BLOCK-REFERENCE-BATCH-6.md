# BLOCK-REFERENCE.md - BATCH 6
**WordPress Core Blocks Markup Reference for AI Coding Agents**  
*Target: WordPress 6.7+ Block Library*

**BATCH 6: QUERY BLOCKS**

---

## QUERY LOOP SYSTEM OVERVIEW

The Query Loop system is WordPress's block-based replacement for traditional PHP loops. It consists of 8 interconnected blocks that work together to display posts, pages, or custom post types with filtering, layout control, and pagination.

**System Architecture:**
```
core/query (container)
├── core/post-template (loop iterator)
│   └── [Any post-related blocks]
├── core/query-pagination (pagination container)
│   ├── core/query-pagination-previous
│   ├── core/query-pagination-numbers
│   └── core/query-pagination-next
├── core/query-no-results (fallback content)
└── core/query-title (context-aware title)
```

**Block Context API:**

Query blocks use WordPress's Block Context system to pass data between parent and child blocks:

```javascript
core/query provides context:
  → queryId: Unique identifier for this query instance
  → query: Object with all query parameters
  → enhancedPagination: Boolean for page transition behavior

core/post-template consumes context from query:
  → Uses queryId, query to fetch and loop through posts

core/query-pagination consumes context:
  → Uses queryId, query to generate pagination links
  → Provides paginationArrow, showLabel to children

Child pagination blocks consume:
  → queryId, query, paginationArrow, showLabel, enhancedPagination
```

---

## 1. QUERY BLOCK

**Block Name:** `core/query`

**Purpose:** Container block that defines query parameters and executes WP_Query to fetch posts/pages/CPTs.

**Block Type:** Container block with dynamic children (server-side rendering for children)

### Attributes

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `queryId` | number | undefined | Unique ID for this query instance |
| `query` | object | (see below) | WP_Query parameters object |
| `query.perPage` | number | `null` | Posts per page (null uses global setting) |
| `query.pages` | number | `0` | Max pages to show (0 = all) |
| `query.offset` | number | `0` | Number of posts to skip |
| `query.postType` | string | `"post"` | Post type to query |
| `query.order` | string | `"desc"` | Sort order (`"asc"` or `"desc"`) |
| `query.orderBy` | string | `"date"` | Sort field (`"date"`, `"title"`, `"author"`, etc.) |
| `query.author` | string | `""` | Filter by author ID |
| `query.search` | string | `""` | Search keyword |
| `query.exclude` | array | `[]` | Post IDs to exclude |
| `query.sticky` | string | `""` | Sticky post handling (`""`, `"exclude"`, `"only"`) |
| `query.inherit` | boolean | `true` | Inherit query from template context |
| `query.taxQuery` | object\|null | `null` | Taxonomy query (include/exclude terms) |
| `query.parents` | array | `[]` | Parent post IDs (for hierarchical types) |
| `query.format` | array | `[]` | Post formats to include |
| `tagName` | string | `"div"` | HTML element for wrapper |
| `namespace` | string | undefined | Identifier for block variations |
| `enhancedPagination` | boolean | `false` | Enable client-side page transitions |
| `displayLayout` | object | undefined | Layout configuration for post-template |
| `align` | string | undefined | Block alignment |

### HTML Structure

**Basic Query Block:**
```html
<!-- wp:query {"queryId":1,"query":{"perPage":3,"pages":0,"offset":0,"postType":"post","order":"desc","orderBy":"date","author":"","search":"","exclude":[],"sticky":"","inherit":false}} -->
<div class="wp-block-query">
  <!-- Inner blocks here: post-template, pagination, etc. -->
</div>
<!-- /wp:query -->
```

**Query with Inherited Context:**
```html
<!-- wp:query {"queryId":2,"query":{"perPage":10,"pages":0,"offset":0,"postType":"post","order":"desc","orderBy":"date","author":"","search":"","exclude":[],"sticky":"","inherit":true}} -->
<div class="wp-block-query">
  <!-- Inherits query from template (archive, search, category, etc.) -->
</div>
<!-- /wp:query -->
```

**Query for Custom Post Type:**
```html
<!-- wp:query {"queryId":3,"query":{"perPage":6,"pages":0,"offset":0,"postType":"product","order":"desc","orderBy":"date","author":"","search":"","exclude":[],"sticky":"","inherit":false}} -->
<div class="wp-block-query">
  <!-- Inner blocks -->
</div>
<!-- /wp:query -->
```

**Query with Taxonomy Filter:**
```html
<!-- wp:query {"queryId":4,"query":{"perPage":6,"pages":0,"offset":0,"postType":"post","order":"desc","orderBy":"date","author":"","search":"","exclude":[],"sticky":"","inherit":false,"taxQuery":{"category":[5,10,15]}}} -->
<div class="wp-block-query">
  <!-- Only posts in categories 5, 10, or 15 -->
</div>
<!-- /wp:query -->
```

**Query with Alignment:**
```html
<!-- wp:query {"queryId":5,"query":{...},"align":"wide"} -->
<div class="wp-block-query alignwide">
  <!-- Inner blocks -->
</div>
<!-- /wp:query -->
```

### Allowed Inner Blocks

**Core query-related blocks:**
- `core/post-template` (REQUIRED for displaying posts)
- `core/query-pagination`
- `core/query-no-results`
- `core/query-title`

**Other allowed blocks:**
- Any block can technically be placed inside, but only query-aware blocks will have access to query context

### Query Object Details

**inherit: true behavior:**
```
On archive pages → inherits archive query (category, tag, date, author, CPT archive)
On search pages → inherits search query with search term
On homepage → shows latest posts per Settings → Reading
Custom template → can be modified via pre_get_posts filter
```

**inherit: false behavior:**
```
Executes independent WP_Query with specified parameters
Ignores template context
Useful for custom post listings, related posts, featured content
```

**taxQuery structure:**
```json
{
  "taxQuery": {
    "include": {
      "category": [1, 2, 3],
      "post_tag": [10, 20]
    },
    "exclude": {
      "category": [5, 6],
      "post_tag": [15]
    }
  }
}
```

### Common Mistakes

❌ **WRONG:** Missing queryId
```html
<!-- wp:query {"query":{...}} -->
```

✅ **CORRECT:** Always include queryId
```html
<!-- wp:query {"queryId":1,"query":{...}} -->
```

❌ **WRONG:** Query object not nested
```html
{"perPage":3,"postType":"post"}
```

✅ **CORRECT:** Query parameters inside query object
```html
{"query":{"perPage":3,"postType":"post"}}
```

❌ **WRONG:** Boolean as string
```html
{"inherit":"true"}
```

✅ **CORRECT:** Boolean as boolean
```html
{"inherit":true}
```

---

## 2. POST-TEMPLATE BLOCK

**Block Name:** `core/post-template`

**Purpose:** Iterates through query results and repeats inner blocks for each post. Acts as the loop container.

**Block Type:** Container block (dynamic rendering)

**Parent Block:** MUST be child of `core/query`

### Attributes

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `layout` | object | undefined | Layout configuration (list vs grid) |
| `layout.type` | string | undefined | `"default"`, `"grid"`, or `"flex"` |
| `layout.columnCount` | number | undefined | Columns for grid layout |
| `align` | string | undefined | Block alignment |

### Context Consumed

| Context Key | Source | Description |
|-------------|--------|-------------|
| `queryId` | core/query | Query identifier |
| `query` | core/query | Query parameters |
| `displayLayout` | core/query | Legacy layout config |
| `templateSlug` | Template | Template being used |
| `previewPostType` | Editor | Post type for preview |
| `enhancedPagination` | core/query | Pagination behavior |

### HTML Structure

**List Layout (Default):**
```html
<!-- wp:post-template -->
<!-- post template inner blocks -->
<!-- /wp:post-template -->

<!-- Renders as: -->
<ul class="wp-block-post-template">
  <li><!-- First post with inner blocks --></li>
  <li><!-- Second post with inner blocks --></li>
  <li><!-- Third post with inner blocks --></li>
</ul>
```

**Grid Layout:**
```html
<!-- wp:post-template {"layout":{"type":"grid","columnCount":3}} -->
<!-- post template inner blocks -->
<!-- /wp:post-template -->

<!-- Renders as: -->
<ul class="wp-block-post-template is-layout-grid columns-3">
  <li><!-- First post --></li>
  <li><!-- Second post --></li>
  <li><!-- Third post --></li>
</ul>
```

**Complete Example with Inner Blocks:**
```html
<!-- wp:post-template {"layout":{"type":"grid","columnCount":2}} -->
  <!-- wp:post-featured-image /-->
  <!-- wp:post-title {"isLink":true,"level":3} /-->
  <!-- wp:post-date /-->
  <!-- wp:post-excerpt /-->
<!-- /wp:post-template -->
```

### Layout Types

**Default (List):**
```html
<ul class="wp-block-post-template">
  <li>Post content</li>
</ul>
```

**Grid:**
```html
<ul class="wp-block-post-template is-layout-grid columns-3">
  <li class="wp-block-post">Post content</li>
</ul>
```

**Flex (Legacy displayLayout):**
```html
<ul class="wp-block-post-template is-flex-container columns-3">
  <li>Post content</li>
</ul>
```

### Allowed Inner Blocks

**Any post-aware blocks:**
- `core/post-title`
- `core/post-featured-image`
- `core/post-excerpt`
- `core/post-content`
- `core/post-date`
- `core/post-author`
- `core/post-terms`

**Standard blocks:**
- `core/group`
- `core/columns`
- `core/spacer`
- Any other block (won't have post context)

### Common Mistakes

❌ **WRONG:** Post-template without parent query
```html
<!-- wp:post-template -->
```

✅ **CORRECT:** Always nested in query block
```html
<!-- wp:query -->
  <!-- wp:post-template -->
  <!-- /wp:post-template -->
<!-- /wp:query -->
```

❌ **WRONG:** Missing column count for grid
```html
{"layout":{"type":"grid"}}
```

✅ **CORRECT:** Grid with column count
```html
{"layout":{"type":"grid","columnCount":3}}
```

❌ **WRONG:** Using div as tagName
```html
<div class="wp-block-post-template">
```

✅ **CORRECT:** Always renders as ul
```html
<ul class="wp-block-post-template">
```

---

## 3. QUERY-PAGINATION BLOCK

**Block Name:** `core/query-pagination`

**Purpose:** Container for pagination controls (previous, next, numbers).

**Block Type:** Container block (dynamic rendering)

**Parent Block:** Typically child of `core/query`

### Attributes

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `paginationArrow` | string | `"none"` | Arrow style (`"none"`, `"arrow"`, `"chevron"`) |
| `showLabel` | boolean | `true` | Show text labels on prev/next |
| `layout` | object | `{"type":"flex"}` | Layout configuration |

### Context Provided

| Context Key | Type | Description |
|-------------|------|-------------|
| `paginationArrow` | string | Passed to child blocks |
| `showLabel` | boolean | Passed to child blocks |

### Context Consumed

| Context Key | Source | Description |
|-------------|--------|-------------|
| `queryId` | core/query | Query identifier |
| `query` | core/query | Query parameters |

### HTML Structure

**Basic Pagination:**
```html
<!-- wp:query-pagination -->
  <!-- wp:query-pagination-previous /-->
  <!-- wp:query-pagination-numbers /-->
  <!-- wp:query-pagination-next /-->
<!-- /wp:query-pagination -->

<!-- Renders as: -->
<nav class="wp-block-query-pagination" aria-label="Pagination">
  <div class="wp-block-query-pagination-previous">...</div>
  <div class="wp-block-query-pagination-numbers">...</div>
  <div class="wp-block-query-pagination-next">...</div>
</nav>
```

**With Arrow Style:**
```html
<!-- wp:query-pagination {"paginationArrow":"arrow","showLabel":true} -->
  <!-- wp:query-pagination-previous /-->
  <!-- wp:query-pagination-next /-->
<!-- /wp:query-pagination -->

<!-- Renders as: -->
<nav class="wp-block-query-pagination" aria-label="Pagination">
  <a href="..."><span class="wp-block-query-pagination-previous-arrow is-arrow-arrow">←</span> Previous</a>
  <a href="...">Next <span class="wp-block-query-pagination-next-arrow is-arrow-arrow">→</span></a>
</nav>
```

**Without Labels:**
```html
<!-- wp:query-pagination {"paginationArrow":"chevron","showLabel":false} -->
  <!-- wp:query-pagination-previous /-->
  <!-- wp:query-pagination-next /-->
<!-- /wp:query-pagination -->

<!-- Renders as: -->
<nav class="wp-block-query-pagination" aria-label="Pagination">
  <a href="..."><span class="wp-block-query-pagination-previous-arrow is-arrow-chevron">‹</span></a>
  <a href="..."><span class="wp-block-query-pagination-next-arrow is-arrow-chevron">›</span></a>
</nav>
```

### Allowed Inner Blocks

**ONLY these child blocks:**
- `core/query-pagination-previous`
- `core/query-pagination-numbers`
- `core/query-pagination-next`

### CSS Classes Applied

**Base class:** `wp-block-query-pagination`

**Layout classes:**
- `is-content-justification-left`
- `is-content-justification-center`
- `is-content-justification-right`
- `is-content-justification-space-between`

### Common Mistakes

❌ **WRONG:** Non-pagination child blocks
```html
<!-- wp:query-pagination -->
  <!-- wp:paragraph -->
  <p>Page:</p>
  <!-- /wp:paragraph -->
<!-- /wp:query-pagination -->
```

✅ **CORRECT:** Only pagination child blocks
```html
<!-- wp:query-pagination -->
  <!-- wp:query-pagination-previous /-->
  <!-- wp:query-pagination-numbers /-->
  <!-- wp:query-pagination-next /-->
<!-- /wp:query-pagination -->
```

---

## 4. QUERY-PAGINATION-PREVIOUS BLOCK

**Block Name:** `core/query-pagination-previous`

**Purpose:** Displays link to previous page of results.

**Block Type:** Dynamic block (server-side rendering)

**Parent Block:** MUST be child of `core/query-pagination`

### Attributes

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `label` | string | undefined | Custom label text |

### Context Consumed

| Context Key | Source | Description |
|-------------|--------|-------------|
| `queryId` | core/query | Query identifier |
| `query` | core/query | Query parameters |
| `paginationArrow` | core/query-pagination | Arrow style |
| `showLabel` | core/query-pagination | Show label |
| `enhancedPagination` | core/query | Pagination behavior |

### HTML Structure

**On Page 2+ (link active):**
```html
<!-- wp:query-pagination-previous /-->

<!-- Renders as: -->
<div class="wp-block-query-pagination-previous">
  <a href="/blog/?query-1-page=1">Previous Page</a>
</div>
```

**On Page 1 (span placeholder):**
```html
<!-- Renders as: -->
<div class="wp-block-query-pagination-previous">
  <span>Previous Page</span>
</div>
```

**With Arrow:**
```html
<!-- Parent has paginationArrow:"arrow" -->
<!-- Renders as: -->
<a href="...">
  <span class="wp-block-query-pagination-previous-arrow is-arrow-arrow">←</span>
  Previous Page
</a>
```

**With Custom Label:**
```html
<!-- wp:query-pagination-previous {"label":"Older Posts"} /-->

<!-- Renders as: -->
<a href="...">Older Posts</a>
```

### CSS Classes Applied

**Base class:** `wp-block-query-pagination-previous`

**Arrow classes:**
- `wp-block-query-pagination-previous-arrow`
- `is-arrow-arrow` (when paginationArrow is "arrow")
- `is-arrow-chevron` (when paginationArrow is "chevron")

### Common Mistakes

❌ **WRONG:** Hardcoding link
```html
<a href="/page/1">Previous</a>
```

✅ **CORRECT:** Self-closing block (dynamic rendering)
```html
<!-- wp:query-pagination-previous /-->
```

---

## 5. QUERY-PAGINATION-NEXT BLOCK

**Block Name:** `core/query-pagination-next`

**Purpose:** Displays link to next page of results.

**Block Type:** Dynamic block (server-side rendering)

**Parent Block:** MUST be child of `core/query-pagination`

### Attributes

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `label` | string | undefined | Custom label text |

### Context Consumed

| Context Key | Source | Description |
|-------------|--------|-------------|
| `queryId` | core/query | Query identifier |
| `query` | core/query | Query parameters |
| `paginationArrow` | core/query-pagination | Arrow style |
| `showLabel` | core/query-pagination | Show label |
| `enhancedPagination` | core/query | Pagination behavior |

### HTML Structure

**When More Pages Exist (link active):**
```html
<!-- wp:query-pagination-next /-->

<!-- Renders as: -->
<div class="wp-block-query-pagination-next">
  <a href="/blog/?query-1-page=3">Next Page</a>
</div>
```

**On Last Page (span placeholder):**
```html
<!-- Renders as: -->
<div class="wp-block-query-pagination-next">
  <span>Next Page</span>
</div>
```

**With Arrow:**
```html
<!-- Parent has paginationArrow:"arrow" -->
<!-- Renders as: -->
<a href="...">
  Next Page
  <span class="wp-block-query-pagination-next-arrow is-arrow-arrow">→</span>
</a>
```

**With Custom Label:**
```html
<!-- wp:query-pagination-next {"label":"Newer Posts"} /-->

<!-- Renders as: -->
<a href="...">Newer Posts</a>
```

### CSS Classes Applied

**Base class:** `wp-block-query-pagination-next`

**Arrow classes:**
- `wp-block-query-pagination-next-arrow`
- `is-arrow-arrow` (when paginationArrow is "arrow")
- `is-arrow-chevron` (when paginationArrow is "chevron")

### Common Mistakes

❌ **WRONG:** Using without pagination container
```html
<!-- wp:query -->
  <!-- wp:query-pagination-next /-->
<!-- /wp:query -->
```

✅ **CORRECT:** Inside pagination container
```html
<!-- wp:query -->
  <!-- wp:query-pagination -->
    <!-- wp:query-pagination-next /-->
  <!-- /wp:query-pagination -->
<!-- /wp:query -->
```

---

## 6. QUERY-PAGINATION-NUMBERS BLOCK

**Block Name:** `core/query-pagination-numbers`

**Purpose:** Displays page number links (1, 2, 3...).

**Block Type:** Dynamic block (server-side rendering)

**Parent Block:** MUST be child of `core/query-pagination`

### Attributes

**NONE** - Inherits all configuration from parent and context

### Context Consumed

| Context Key | Source | Description |
|-------------|--------|-------------|
| `queryId` | core/query | Query identifier |
| `query` | core/query | Query parameters |
| `enhancedPagination` | core/query | Pagination behavior |

### HTML Structure

**Page Numbers:**
```html
<!-- wp:query-pagination-numbers /-->

<!-- Renders as (on page 2 of 5): -->
<div class="wp-block-query-pagination-numbers">
  <a href="/?query-1-page=1">1</a>
  <span class="page-numbers current" aria-current="page">2</span>
  <a href="/?query-1-page=3">3</a>
  <a href="/?query-1-page=4">4</a>
  <a href="/?query-1-page=5">5</a>
</div>
```

**With Ellipsis (Many Pages):**
```html
<!-- On page 5 of 20: -->
<div class="wp-block-query-pagination-numbers">
  <a href="/?query-1-page=1">1</a>
  <span class="page-numbers dots">…</span>
  <a href="/?query-1-page=4">4</a>
  <span class="page-numbers current" aria-current="page">5</span>
  <a href="/?query-1-page=6">6</a>
  <span class="page-numbers dots">…</span>
  <a href="/?query-1-page=20">20</a>
</div>
```

### CSS Classes Applied

**Base class:** `wp-block-query-pagination-numbers`

**Number classes:**
- `page-numbers` (on all number elements)
- `current` (on current page span)
- `dots` (on ellipsis spans)

### Accessibility

**Current page:**
- Uses `<span>` not `<a>`
- Includes `aria-current="page"`
- Has `current` class for styling

### Common Mistakes

❌ **WRONG:** Hardcoding page numbers
```html
<a href="/page/1">1</a>
<a href="/page/2">2</a>
```

✅ **CORRECT:** Self-closing block (dynamic rendering)
```html
<!-- wp:query-pagination-numbers /-->
```

---

## 7. QUERY-NO-RESULTS BLOCK

**Block Name:** `core/query-no-results`

**Purpose:** Container for content to display when query returns no results.

**Block Type:** Container block

**Ancestor Block:** MUST be inside `core/query`

### Attributes

**NONE** - Acts as simple container

### Context Consumed

| Context Key | Source | Description |
|-------------|--------|-------------|
| `queryId` | core/query | Query identifier (for conditional display) |

### HTML Structure

**Basic No Results Message:**
```html
<!-- wp:query-no-results -->
  <!-- wp:paragraph -->
  <p>No results found.</p>
  <!-- /wp:paragraph -->
<!-- /wp:query-no-results -->

<!-- When query returns 0 results, renders as: -->
<div class="wp-block-query-no-results">
  <p>No results found.</p>
</div>

<!-- When query has results, renders nothing -->
```

**Rich No Results Content:**
```html
<!-- wp:query-no-results -->
  <!-- wp:heading -->
  <h2>No Posts Found</h2>
  <!-- /wp:heading -->
  
  <!-- wp:paragraph -->
  <p>Sorry, but nothing matched your search criteria. Please try again with different keywords.</p>
  <!-- /wp:paragraph -->
  
  <!-- wp:search /-->
<!-- /wp:query-no-results -->
```

**Complete Query with No Results:**
```html
<!-- wp:query {"queryId":1,"query":{...}} -->
<div class="wp-block-query">
  <!-- wp:post-template -->
  <!-- Post content blocks -->
  <!-- /wp:post-template -->
  
  <!-- wp:query-no-results -->
    <!-- wp:paragraph -->
    <p>No posts available.</p>
    <!-- /wp:paragraph -->
  <!-- /wp:query-no-results -->
</div>
<!-- /wp:query -->
```

### Allowed Inner Blocks

**Any blocks allowed** - typically:
- `core/paragraph`
- `core/heading`
- `core/search`
- `core/button`
- `core/group`

### Display Behavior

**When query HAS results:**
```
Block does not render (returns empty string)
Content inside is completely hidden
```

**When query has NO results:**
```
Block renders with all inner content
Shows fallback message/content to user
```

### Common Mistakes

❌ **WRONG:** Placing outside query block
```html
<!-- wp:query-no-results -->
<p>No results</p>
<!-- /wp:query-no-results -->
```

✅ **CORRECT:** Inside query block
```html
<!-- wp:query -->
  <!-- wp:query-no-results -->
  <p>No results</p>
  <!-- /wp:query-no-results -->
<!-- /wp:query -->
```

❌ **WRONG:** Placing before post-template
```html
<!-- wp:query -->
  <!-- wp:query-no-results -->...<!-- /wp:query-no-results -->
  <!-- wp:post-template -->...<!-- /wp:post-template -->
<!-- /wp:query -->
```

✅ **CORRECT:** After post-template (order matters for some edge cases)
```html
<!-- wp:query -->
  <!-- wp:post-template -->...<!-- /wp:post-template -->
  <!-- wp:query-no-results -->...<!-- /wp:query-no-results -->
<!-- /wp:query -->
```

---

## 8. QUERY-TITLE BLOCK

**Block Name:** `core/query-title`

**Purpose:** Displays context-aware title for archives, searches, and post type archives.

**Block Type:** Dynamic block (server-side rendering)

**Ancestor Block:** Typically inside `core/query` but can be standalone

### Attributes

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `type` | string | undefined | Title type (`"archive"`, `"search"`, `"post-type"`) |
| `level` | number | `1` | Heading level (1-6) |
| `levelOptions` | array | undefined | Available heading levels in UI |
| `textAlign` | string | undefined | Text alignment |
| `showPrefix` | boolean | `true` | Show "Category:", "Tag:", etc. prefix |
| `showSearchTerm` | boolean | `true` | Show search term in search results |

### HTML Structure

**Archive Title (Category):**
```html
<!-- wp:query-title {"type":"archive"} /-->

<!-- On category archive, renders as: -->
<h1 class="wp-block-query-title">Category: Technology</h1>
```

**Archive Title Without Prefix:**
```html
<!-- wp:query-title {"type":"archive","showPrefix":false} /-->

<!-- Renders as: -->
<h1 class="wp-block-query-title">Technology</h1>
```

**Search Title:**
```html
<!-- wp:query-title {"type":"search"} /-->

<!-- On search results page, renders as: -->
<h1 class="wp-block-query-title">Search results for: "wordpress"</h1>
```

**Search Title Without Term:**
```html
<!-- wp:query-title {"type":"search","showSearchTerm":false} /-->

<!-- Renders as: -->
<h1 class="wp-block-query-title">Search results</h1>
```

**Post Type Archive:**
```html
<!-- wp:query-title {"type":"post-type"} /-->

<!-- On product archive, renders as: -->
<h1 class="wp-block-query-title">Products</h1>
```

**Custom Heading Level:**
```html
<!-- wp:query-title {"type":"archive","level":2} /-->

<!-- Renders as: -->
<h2 class="wp-block-query-title">Category: News</h2>
```

**With Text Alignment:**
```html
<!-- wp:query-title {"type":"archive","textAlign":"center"} /-->

<!-- Renders as: -->
<h1 class="wp-block-query-title has-text-align-center">Category: News</h1>
```

### Type Behavior

**type: "archive"**
- Shows on: Category, tag, date, author archives
- Returns empty if not on archive page
- Prefix: "Category:", "Tag:", "Author:", "Archives:", etc.

**type: "search"**
- Shows on: Search results pages
- Returns empty if not on search page
- Default: "Search results"
- With showSearchTerm: "Search results for: \"{term}\""

**type: "post-type"**
- Shows on: Custom post type archives
- Returns empty if not on CPT archive
- Shows: Post type plural label

**type: undefined**
- Shows appropriate title based on context
- Auto-detects archive vs search

### Conditional Rendering

```php
// WordPress core logic
if ('archive' === $type && !is_archive()) {
    return ''; // Don't render
}

if ('search' === $type && !is_search()) {
    return ''; // Don't render  
}
```

### CSS Classes Applied

**Base class:** `wp-block-query-title`

**Text alignment classes:**
- `has-text-align-left`
- `has-text-align-center`
- `has-text-align-right`

### Common Mistakes

❌ **WRONG:** Missing type attribute
```html
<!-- wp:query-title /-->
```

✅ **CORRECT:** Specify type
```html
<!-- wp:query-title {"type":"archive"} /-->
```

❌ **WRONG:** Hardcoding title text
```html
<h1>Category: News</h1>
```

✅ **CORRECT:** Self-closing block (dynamic rendering)
```html
<!-- wp:query-title {"type":"archive"} /-->
```

❌ **WRONG:** Boolean as string
```html
{"showPrefix":"false"}
```

✅ **CORRECT:** Boolean as boolean
```html
{"showPrefix":false}
```

---

## BATCH 6 SUMMARY

**Query blocks documented:** 8  
✅ query (main container)  
✅ post-template (loop iterator)  
✅ query-pagination (pagination container)  
✅ query-pagination-previous  
✅ query-pagination-next  
✅ query-pagination-numbers  
✅ query-no-results (fallback content)  
✅ query-title (context-aware title)

**Key System Patterns:**

1. **Block Context Flow:** query → post-template + pagination → pagination children
2. **Parent-Child Requirements:** Strict hierarchy must be maintained
3. **Dynamic Rendering:** Most blocks render server-side on each request
4. **Query Inheritance:** inherit:true uses template context, inherit:false uses custom params

**Critical Architecture Points:**

**Query System Hierarchy:**
```
core/query (REQUIRED - top level)
  └── core/post-template (REQUIRED - loop container)
  │     └── [Any post blocks]
  └── core/query-pagination (OPTIONAL)
  │     ├── core/query-pagination-previous
  │     ├── core/query-pagination-numbers
  │     └── core/query-pagination-next
  └── core/query-no-results (OPTIONAL)
  └── core/query-title (OPTIONAL - can be outside query too)
```

**Context API Pattern:**

```javascript
// Parent provides context
core/query: {
  queryId: 1,
  query: {...},
  enhancedPagination: false
}

// Children consume context
core/post-template uses: queryId, query
core/query-pagination uses: queryId, query
core/query-pagination-previous uses: queryId, query, paginationArrow, showLabel

// Grandchildren inherit through chain
```

**Query Execution Flow:**

```
1. Query block parses attributes
2. Builds WP_Query with parameters
3. Executes database query
4. Provides results via context
5. Post-template iterates results
6. For each post: renders inner blocks with post data
7. Pagination calculates page numbers
8. No-results checks if results empty
```

**Performance Considerations:**

**Inherit Query (inherit:true):**
- Uses existing WP_Query from template
- No additional database query
- Faster performance
- Respects pre_get_posts filters

**Custom Query (inherit:false):**
- Executes new WP_Query
- Additional database overhead
- Independent of template context
- Useful for multiple queries on same page

**Best Practice:**
```html
<!-- Homepage: Use inherit for main loop -->
<!-- wp:query {"query":{"inherit":true}} -->

<!-- Custom section: Use custom query -->
<!-- wp:query {"query":{"inherit":false,"postType":"product","perPage":3}} -->
```

**PressPilot-Specific Applications:**

**Blog Listing Page:**
```html
<!-- wp:query {"queryId":1,"query":{"perPage":9,"pages":0,"offset":0,"postType":"post","order":"desc","orderBy":"date","inherit":false}} -->
<div class="wp-block-query">
  <!-- wp:post-template {"layout":{"type":"grid","columnCount":3}} -->
    <!-- wp:post-featured-image {"isLink":true} /-->
    <!-- wp:post-title {"isLink":true,"level":3} /-->
    <!-- wp:post-excerpt {"moreText":"Read More"} /-->
  <!-- /wp:post-template -->
  
  <!-- wp:query-pagination {"paginationArrow":"arrow"} -->
    <!-- wp:query-pagination-previous /-->
    <!-- wp:query-pagination-numbers /-->
    <!-- wp:query-pagination-next /-->
  <!-- /wp:query-pagination -->
  
  <!-- wp:query-no-results -->
    <!-- wp:paragraph -->
    <p>No blog posts found.</p>
    <!-- /wp:paragraph -->
  <!-- /wp:query-no-results -->
</div>
<!-- /wp:query -->
```

**Category Archive Template:**
```html
<!-- wp:query-title {"type":"archive","level":1,"showPrefix":false} /-->

<!-- wp:query {"queryId":2,"query":{"inherit":true}} -->
<div class="wp-block-query">
  <!-- wp:post-template -->
    <!-- Post blocks -->
  <!-- /wp:post-template -->
  
  <!-- wp:query-pagination -->
    <!-- wp:query-pagination-previous /-->
    <!-- wp:query-pagination-next /-->
  <!-- /wp:query-pagination -->
</div>
<!-- /wp:query -->
```

**Search Results Template:**
```html
<!-- wp:query-title {"type":"search","level":1,"showSearchTerm":true} /-->

<!-- wp:query {"queryId":3,"query":{"inherit":true}} -->
<div class="wp-block-query">
  <!-- wp:post-template -->
    <!-- Search result blocks -->
  <!-- /wp:post-template -->
  
  <!-- wp:query-no-results -->
    <!-- wp:heading -->
    <h2>No Results Found</h2>
    <!-- /wp:heading -->
    
    <!-- wp:paragraph -->
    <p>Try searching with different keywords.</p>
    <!-- /wp:paragraph -->
    
    <!-- wp:search {"showLabel":false,"buttonText":"Search Again"} /-->
  <!-- /wp:query-no-results -->
</div>
<!-- /wp:query -->
```

**Related Products (Custom Query):**
```html
<!-- wp:query {"queryId":4,"query":{"perPage":3,"pages":0,"offset":0,"postType":"product","order":"rand","orderBy":"rand","inherit":false}} -->
<div class="wp-block-query">
  <!-- wp:heading -->
  <h2>You May Also Like</h2>
  <!-- /wp:heading -->
  
  <!-- wp:post-template {"layout":{"type":"grid","columnCount":3}} -->
    <!-- wp:post-featured-image /-->
    <!-- wp:post-title {"isLink":true,"level":4} /-->
  <!-- /wp:post-template -->
</div>
<!-- /wp:query -->
```

**Multiple Queries on Homepage:**
```html
<!-- Featured Posts Section -->
<!-- wp:query {"queryId":5,"query":{"perPage":1,"offset":0,"postType":"post","sticky":"only","inherit":false}} -->
  <!-- Hero layout -->
<!-- /wp:query -->

<!-- Recent Posts Section -->
<!-- wp:query {"queryId":6,"query":{"perPage":6,"offset":1,"postType":"post","order":"desc","orderBy":"date","inherit":false}} -->
  <!-- Grid layout -->
<!-- /wp:query -->
```

### Advanced Query Parameters

**Sticky Posts Handling:**
```json
{
  "sticky": "",         // Include sticky in normal position
  "sticky": "exclude",  // Exclude all sticky posts
  "sticky": "only"      // Show ONLY sticky posts
}
```

**Taxonomy Filtering:**
```json
{
  "taxQuery": {
    "include": {
      "category": [1, 5, 10],
      "post_tag": [20, 30]
    },
    "exclude": {
      "category": [99]
    }
  }
}
```

**Author Filtering:**
```json
{
  "author": "5"  // Show posts by author ID 5
}
```

**Search Filtering:**
```json
{
  "search": "wordpress"  // Search posts containing "wordpress"
}
```

**Post Exclusion:**
```json
{
  "exclude": [42, 108, 256]  // Exclude specific post IDs
}
```

**Hierarchical Post Types:**
```json
{
  "parents": [15, 30]  // Only children of these parent IDs
}
```

### Query Variations Pattern

**Creating Custom Query Variations:**

```javascript
// JavaScript for registering variation
registerBlockVariation('core/query', {
  name: 'my-theme/products-grid',
  title: 'Products Grid',
  attributes: {
    namespace: 'my-theme/products-grid',
    query: {
      perPage: 12,
      postType: 'product',
      orderBy: 'menu_order',
      order: 'asc',
      inherit: false
    }
  },
  innerBlocks: [
    ['core/post-template', {
      layout: {type: 'grid', columnCount: 4}
    }, [
      ['core/post-featured-image'],
      ['core/post-title', {level: 3, isLink: true}]
    ]]
  ],
  scope: ['inserter']
});
```

### Filtering Query Results

**Server-side filtering:**

```php
// Modify query parameters
add_filter('query_loop_block_query_vars', function($query, $block) {
  // Only modify our specific variation
  if (isset($block->context['namespace']) 
      && 'my-theme/products-grid' === $block->context['namespace']) {
    $query['meta_key'] = 'featured';
    $query['meta_value'] = '1';
  }
  return $query;
}, 10, 2);
```

### Debugging Query Blocks

**Common Issues:**

1. **No posts showing** → Check queryId is unique, verify query parameters
2. **Pagination broken** → Ensure queryId is set, check URL parameters
3. **Wrong posts showing** → Verify inherit setting, check taxQuery syntax
4. **No-results always showing** → Check block order (after post-template)
5. **Context not passing** → Verify parent-child hierarchy is correct

**Next Batch:**
- BATCH 7: Template Blocks (1 block) - template-part for reusable template sections

---

*Document version: 1.0*  
*Batch 6 completed: February 2025*  
*Based on: WordPress 6.7+ Block Library*  
*Sources: Gutenberg block.json files, WordPress Core source code, Official Documentation, Query Loop implementation*
