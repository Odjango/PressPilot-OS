# FSE Knowledge Base - Master Index

**Quick Navigation Guide for AI Agents**

---

## How to Use This Index

**For AI Agents Generating WordPress Themes:**

1. **Identify what you need to build** (e.g., "restaurant header with navigation")
2. **Look up blocks in Quick Lookup Table** below
3. **Read the referenced BATCH file(s)** for exact specifications
4. **Generate markup following documented patterns**

**Critical Rule:** NEVER generate WordPress block markup without consulting this knowledge base first.

---

## Document Structure Overview

```
FSE Knowledge Base/
├── FSE-FUNDAMENTALS.md          ← Start here (FSE architecture)
├── BLOCK-MARKUP-SPEC.md         ← Read second (universal rules)
├── FSE-KNOWLEDGE-BASE-INDEX.md  ← You are here (navigation)
├── BLOCK-REFERENCE-BATCH-1.md   ← Layout blocks
├── BLOCK-REFERENCE-BATCH-2.md   ← Text blocks
├── BLOCK-REFERENCE-BATCH-3.md   ← Media blocks
├── BLOCK-REFERENCE-BATCH-4.md   ← Interactive blocks
├── BLOCK-REFERENCE-BATCH-5.md   ← Site identity blocks
├── BLOCK-REFERENCE-BATCH-6.md   ← Query Loop system
├── BLOCK-REFERENCE-BATCH-7.md   ← Template parts
└── PROJECT-COMPLETE-SUMMARY.md  ← Project overview
```

---

## Quick Lookup Table

**Find any block instantly:**

| Block Name | BATCH | Use Case | Critical Notes |
|------------|-------|----------|----------------|
| **group** | 1 | Generic container, layout control | Most versatile block |
| **columns** | 1 | Multi-column layouts | Requires column children |
| **column** | 1 | Individual column | Must be child of columns |
| **stack** | 1 | Vertical stacking | Variation of group |
| **row** | 1 | Horizontal layout | Variation of group |
| **spacer** | 1 | Vertical spacing | Height in px |
| **cover** | 1 | Hero sections, image overlays | Complex inner structure |
| **paragraph** | 2 | Body text | dropCap support |
| **heading** | 2 | h1-h6 headings | level attribute 1-6 |
| **list** | 2 | Ordered/unordered lists | Requires list-item children |
| **list-item** | 2 | List items | Must be child of list |
| **quote** | 2 | Blockquotes | citation support |
| **code** | 2 | Code snippets | Inline display |
| **preformatted** | 2 | Preformatted text | Preserves whitespace |
| **image** | 3 | Single images | wp-image-{id} class critical |
| **gallery** | 3 | Image grids | has-nested-images pattern |
| **video** | 3 | Video player | autoplay requires muted |
| **audio** | 3 | Audio player | controls always present |
| **buttons** | 4 | Button container | Requires button children |
| **button** | 4 | Individual button/link | Must be child of buttons |
| **navigation** | 4 | Site navigation menus | Complex with submenu support |
| **search** | 4 | Search form | role="search" required |
| **social-links** | 4 | Social icons container | Requires social-link children |
| **social-link** | 4 | Individual social icon | Dynamic rendering, 50+ services |
| **site-title** | 5 | Site name | Dynamic, global updates |
| **site-logo** | 5 | Site logo | Dynamic, auto-calculates height |
| **site-tagline** | 5 | Site description | Dynamic, level 0 default |
| **query** | 6 | Query container | queryId required |
| **post-template** | 6 | Loop iterator | Must be child of query |
| **query-pagination** | 6 | Pagination container | Provides context to children |
| **query-pagination-previous** | 6 | Previous page link | Must be child of pagination |
| **query-pagination-next** | 6 | Next page link | Must be child of pagination |
| **query-pagination-numbers** | 6 | Page numbers | Must be child of pagination |
| **query-no-results** | 6 | Empty query fallback | Only renders when query empty |
| **query-title** | 6 | Archive/search titles | Context-aware, type attribute |
| **template-part** | 7 | Reusable sections | slug attribute required |

---

## Common Task Workflows

### Task: Generate Restaurant Header

**Blocks needed:**
- template-part (BATCH 7)
- group (BATCH 1)
- site-logo (BATCH 5)
- navigation (BATCH 4)

**Reading order:**
1. BATCH 7 → Understand template-part wrapper
2. BATCH 1 → Understand group layout
3. BATCH 5 → Get site-logo exact specs
4. BATCH 4 → Get navigation exact specs

**Pattern:**
```html
<!-- wp:template-part {"slug":"header","tagName":"header"} /-->
```

Then create `/parts/header.html`:
```html
<!-- wp:group {"layout":{"type":"flex","justifyContent":"space-between"}} -->
  <!-- wp:site-logo {"width":120} /-->
  <!-- wp:navigation /-->
<!-- /wp:group -->
```

---

### Task: Generate Blog Listing Page

**Blocks needed:**
- query (BATCH 6)
- post-template (BATCH 6)
- query-pagination (BATCH 6)
- All pagination children (BATCH 6)

**Reading order:**
1. BATCH 6 → Read entire Query section
2. Understand queryId requirement
3. Understand inherit:true vs inherit:false
4. Follow post-template layout patterns

**Pattern:**
```html
<!-- wp:query {"queryId":1,"query":{"perPage":9,"inherit":false}} -->
  <!-- wp:post-template {"layout":{"type":"grid","columnCount":3}} -->
    <!-- Post blocks -->
  <!-- /wp:post-template -->
  
  <!-- wp:query-pagination -->
    <!-- Pagination blocks -->
  <!-- /wp:query-pagination -->
<!-- /wp:query -->
```

---

### Task: Generate Footer with Social Links

**Blocks needed:**
- template-part (BATCH 7)
- group (BATCH 1)
- columns (BATCH 1)
- social-links (BATCH 4)
- social-link (BATCH 4)

**Reading order:**
1. BATCH 7 → Template-part wrapper
2. BATCH 1 → Columns layout
3. BATCH 4 → Social links system

---

## Parent-Child Constraints Quick Reference

**MUST follow these hierarchies:**

```
columns
  └── column (REQUIRED)

list
  └── list-item (REQUIRED)

buttons
  └── button (REQUIRED)

query
  └── post-template (REQUIRED for posts)

query-pagination
  ├── query-pagination-previous
  ├── query-pagination-numbers
  └── query-pagination-next

social-links
  └── social-link (REQUIRED)

navigation
  ├── navigation-link
  └── navigation-submenu
```

**Violation = Validation Error**

---

## Block Context API Flow

**Understand data flow between blocks:**

### Navigation System (BATCH 4)
```
core/navigation (provides context)
  → showSubmenuIcon, openSubmenusOnClick, colors
  
  core/navigation-link (consumes context)
  core/navigation-submenu (consumes context)
```

### Query System (BATCH 6)
```
core/query (provides context)
  → queryId, query object, enhancedPagination
  
  core/post-template (consumes)
  core/query-pagination (consumes + provides)
    → paginationArrow, showLabel
    
    core/query-pagination-* (consume)
```

### Social Links System (BATCH 4)
```
core/social-links (provides context)
  → iconColor, showLabels, openInNewTab
  
  core/social-link (consumes)
```

---

## Critical Validation Rules

**These ALWAYS cause "Attempt Recovery" errors:**

❌ Missing required attributes:
- query without queryId
- template-part without slug
- columns without column children

❌ Wrong parent-child relationships:
- button outside buttons
- column outside columns
- query-pagination-next outside query-pagination

❌ Boolean as string:
```json
{"inherit":"true"}  // WRONG
{"inherit":true}    // CORRECT
```

❌ Missing critical CSS classes:
```html
<img src="..." />  // WRONG - missing wp-image-{id}
<img class="wp-image-123" src="..." />  // CORRECT
```

❌ Wrong tagName values:
- template-part only allows: div, header, footer, main, section, article, aside
- Other HTML elements are invalid

---

## Document Reading Priority

### For First-Time Setup:
1. **FSE-FUNDAMENTALS.md** - Understand FSE architecture
2. **BLOCK-MARKUP-SPEC.md** - Learn universal markup rules
3. **This index** - Bookmark for quick reference

### For Each Theme Generation:
1. **This index** - Look up blocks needed
2. **Relevant BATCH files** - Read exact specifications
3. **Generate markup** - Follow documented patterns

### For Debugging Validation Errors:
1. **BLOCK-MARKUP-SPEC.md** - Check basic syntax
2. **Relevant BATCH file** - Check "Common Mistakes" section
3. **Parent-Child Constraints** - Verify hierarchy

---

## Batch File Contents Summary

### BATCH 1: Layout Blocks
- **Purpose:** Structure and layout control
- **Blocks:** group, columns, column, stack, row, spacer, cover
- **Key concepts:** Layout types, alignment, nesting rules

### BATCH 2: Text Blocks
- **Purpose:** Text content and typography
- **Blocks:** paragraph, heading, list, list-item, quote, code, preformatted
- **Key concepts:** Typography controls, text alignment, drop caps

### BATCH 3: Media Blocks
- **Purpose:** Images, galleries, video, audio
- **Blocks:** image, gallery, video, audio
- **Key concepts:** Media IDs, responsive sizing, captions, autoplay rules

### BATCH 4: Interactive Blocks
- **Purpose:** User interaction elements
- **Blocks:** buttons, button, navigation, search, social-links, social-link
- **Key concepts:** Block Context API, dynamic rendering, accessibility

### BATCH 5: Site Identity Blocks
- **Purpose:** Site-wide identity elements
- **Blocks:** site-title, site-logo, site-tagline
- **Key concepts:** Dynamic rendering, global updates, Settings integration

### BATCH 6: Query Loop System
- **Purpose:** Post listings, archives, pagination
- **Blocks:** query, post-template, query-pagination (+ 5 related blocks)
- **Key concepts:** WP_Query parameters, inherit behavior, Context flow

### BATCH 7: Template System
- **Purpose:** Reusable template sections
- **Blocks:** template-part
- **Key concepts:** File-based system, global updates, semantic HTML

---

## Troubleshooting Guide

### Validation Error: "This block contains unexpected or invalid content"

**Likely causes:**
1. Wrong parent-child relationship → Check Batch file for constraints
2. Missing required attribute → Check attribute table
3. Boolean as string → Change `"true"` to `true`
4. Invalid nested block → Check allowed inner blocks

### Validation Error: "Attempt block recovery"

**Likely causes:**
1. Missing critical CSS class (e.g., wp-image-{id})
2. Wrong HTML structure (check BATCH file examples)
3. Invalid attribute value (check defaults in table)
4. Self-closing vs container mismatch

### Block Not Rendering

**Likely causes:**
1. Template-part: File doesn't exist in `/parts/`
2. Query blocks: Missing queryId
3. Site blocks: No value set in Settings
4. Dynamic blocks: Check PHP error logs

---

## Quick Answer Decision Tree

```
Question: "How do I create a [component]?"
    ↓
Does it use existing blocks?
    ↓
├─ YES → Look up blocks in Quick Lookup Table
│         Read referenced BATCH files
│         Follow exact specifications
│
└─ NO → Consider custom block development
         (outside scope of this knowledge base)
```

---

## Integration Checklist for AI Agents

Before generating WordPress block markup:

- [ ] Have you read FSE-FUNDAMENTALS.md? (one-time)
- [ ] Have you read BLOCK-MARKUP-SPEC.md? (one-time)
- [ ] Have you identified all blocks needed?
- [ ] Have you looked up each block in this index?
- [ ] Have you read the relevant BATCH files?
- [ ] Have you checked parent-child constraints?
- [ ] Have you verified attribute requirements?
- [ ] Have you confirmed CSS class patterns?
- [ ] Are you using exact markup from docs?

If all checkboxes = YES → Generate markup  
If any = NO → READ DOCUMENTATION FIRST

---

## Version Information

**Knowledge Base Version:** 1.0  
**WordPress Version:** 6.7+  
**Last Updated:** February 2025  
**Total Blocks Documented:** 39+  
**Total Pages:** ~200+

---

## File Paths Reference

```
/mnt/user-data/outputs/FSE-FUNDAMENTALS.md
/mnt/user-data/outputs/BLOCK-MARKUP-SPEC.md
/mnt/user-data/outputs/FSE-KNOWLEDGE-BASE-INDEX.md (this file)
/mnt/user-data/outputs/BLOCK-REFERENCE-BATCH-1.md
/mnt/user-data/outputs/BLOCK-REFERENCE-BATCH-2.md
/mnt/user-data/outputs/BLOCK-REFERENCE-BATCH-3.md
/mnt/user-data/outputs/BLOCK-REFERENCE-BATCH-4.md
/mnt/user-data/outputs/BLOCK-REFERENCE-BATCH-5.md
/mnt/user-data/outputs/BLOCK-REFERENCE-BATCH-6.md
/mnt/user-data/outputs/BLOCK-REFERENCE-BATCH-7.md
/mnt/user-data/outputs/PROJECT-COMPLETE-SUMMARY.md
```

---

*This index is your starting point for all WordPress FSE block generation. Always consult it before generating markup.*
