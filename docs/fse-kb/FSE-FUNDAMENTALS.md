# FSE-FUNDAMENTALS.md
**WordPress Block Theme / Full Site Editing (FSE) Reference for AI Coding Agents**  
*Target: WordPress 6.7+ (Current stable as of February 2025)*

---

## 1. WHAT IS A BLOCK THEME (vs Classic Theme)

### Block Theme Definition
A **block theme** is identified by a **single critical requirement**:
- **REQUIRED**: The presence of `templates/index.html` (an HTML file in the `/templates` folder)

```
DO: Create templates/index.html with block markup
DON'T: Create templates/index.php (that's a classic theme)
```

**This is the ONLY file distinction that makes a theme a "block theme" vs "classic theme."**

### Structural Differences

| Aspect | Block Theme | Classic Theme |
|--------|-------------|---------------|
| **Templates** | HTML files with serialized block markup | PHP files with PHP functions and HTML |
| **Template Location** | `/templates` folder (REQUIRED) | Theme root directory |
| **Template Parts Location** | `/parts` folder | `/template-parts` folder or theme root |
| **Styling System** | `theme.json` (single source of truth) | `functions.php` with `add_theme_support()` |
| **Content Markup** | Blocks (HTML comments + HTML) | PHP template tags (`the_content()`, `the_title()`) |
| **Site Editor** | Full Site Editing enabled | Not available |
| **User Editing** | Users can edit templates in Site Editor | Users cannot edit templates |

### Block Themes Use HTML + Block Markup, NOT PHP Template Tags

**Block markup example** (correct for block themes):
```html
<!-- wp:paragraph {"align":"center"} -->
<p class="has-text-align-center">Welcome to my site</p>
<!-- /wp:paragraph -->
```

**PHP template tag example** (WRONG for block theme templates):
```php
<?php the_content(); ?> ❌ DO NOT USE IN BLOCK THEME TEMPLATES
```

---

## 2. FILES THAT EXIST vs FILES THAT DO NOT EXIST

### REQUIRED Files for Block Themes

**Minimum viable block theme:**
```
my-theme/
├── style.css          ← REQUIRED: Theme metadata
└── templates/
    └── index.html     ← REQUIRED: Fallback template
```

**That's it.** Only two files are REQUIRED for a functional block theme.

### STANDARD Files (Recommended but Optional)

```
my-theme/
├── style.css                    ← REQUIRED: Theme info header
├── theme.json                   ← Recommended: Global settings/styles
├── functions.php                ← Optional: PHP functionality only
├── screenshot.png               ← Optional: Theme preview (1200×900)
├── README.txt                   ← Required for WordPress.org submission
├── templates/                   ← REQUIRED folder
│   ├── index.html              ← REQUIRED: Default template
│   ├── home.html               ← Optional: Blog homepage
│   ├── front-page.html         ← Optional: Static front page
│   ├── single.html             ← Optional: Single post
│   ├── page.html               ← Optional: Page template
│   ├── archive.html            ← Optional: Archive pages
│   ├── 404.html                ← Optional: Error page
│   └── search.html             ← Optional: Search results
├── parts/                       ← Optional: Template parts folder
│   ├── header.html             ← Optional: Site header
│   └── footer.html             ← Optional: Site footer
└── patterns/                    ← Optional: Block patterns folder
    └── hero.php                ← Optional: Pattern files
```

### FILES THAT DO NOT EXIST IN BLOCK THEMES

**These classic theme files DO NOT EXIST in pure block themes:**

```
❌ header.php           ← Use parts/header.html instead
❌ footer.php           ← Use parts/footer.html instead
❌ sidebar.php          ← Use parts/sidebar.html instead
❌ index.php            ← Use templates/index.html instead
❌ single.php           ← Use templates/single.html instead
❌ page.php             ← Use templates/page.html instead
❌ archive.php          ← Use templates/archive.html instead
❌ search.php           ← Use templates/search.html instead
❌ 404.php              ← Use templates/404.html instead
❌ comments.php         ← Use core/comments block instead
```

**Critical distinction:**
- Classic themes: `.php` files in theme root with PHP functions
- Block themes: `.html` files in `/templates` folder with block markup

---

## 3. ROLE OF THEME.JSON AS SINGLE SOURCE OF TRUTH

### What is theme.json?

`theme.json` is a **JSON configuration file** in the theme root that defines:
1. **Settings**: What customization options are available to users
2. **Styles**: Default visual appearance (colors, typography, spacing)
3. **Template mappings** and other theme-level configuration

**Location**: Must be in theme root directory
```
my-theme/
├── theme.json    ← Here, at root level
├── style.css
└── templates/
```

### theme.json is the SINGLE SOURCE OF TRUTH for:

1. **Color palettes** (replaces `add_theme_support('editor-color-palette')`)
2. **Font sizes** (replaces `add_theme_support('editor-font-sizes')`)
3. **Typography settings** (font families, line heights, etc.)
4. **Spacing scales** (replaces custom spacing in PHP)
5. **Layout settings** (content width, wide width)
6. **Feature flags** (border controls, link colors, etc.)
7. **Custom CSS variables** (generated automatically)

### Minimal theme.json Example

```json
{
  "$schema": "https://schemas.wp.org/wp/6.7/theme.json",
  "version": 3,
  "settings": {
    "layout": {
      "contentSize": "840px",
      "wideSize": "1100px"
    },
    "color": {
      "palette": [
        {
          "name": "Base",
          "slug": "base",
          "color": "#ffffff"
        },
        {
          "name": "Contrast",
          "slug": "contrast",
          "color": "#000000"
        }
      ]
    }
  },
  "styles": {
    "color": {
      "background": "var(--wp--preset--color--base)",
      "text": "var(--wp--preset--color--contrast)"
    }
  }
}
```

### CSS Custom Properties (Auto-generated)

theme.json automatically generates CSS variables following this pattern:

**Naming convention:**
```
--wp--preset--{category}--{slug}
```

**Examples:**
```css
/* Color palette */
--wp--preset--color--base
--wp--preset--color--contrast

/* Font sizes */
--wp--preset--font-size--small
--wp--preset--font-size--medium

/* Spacing */
--wp--preset--spacing--30
--wp--preset--spacing--40
```

**These are automatically available in:**
- Block editor
- Frontend CSS
- User customizations via Site Editor

### DO Use theme.json For:

```
✅ Defining color palettes
✅ Setting typography options
✅ Configuring spacing scales
✅ Setting content/wide widths
✅ Enabling/disabling editor features
✅ Defining block-level styles
✅ Creating style variations
```

### DON'T Use add_theme_support() For Things theme.json Handles:

```
❌ add_theme_support('editor-color-palette')      ← Use theme.json settings.color.palette
❌ add_theme_support('editor-font-sizes')         ← Use theme.json settings.typography.fontSizes
❌ add_theme_support('custom-line-height')        ← Use theme.json settings.typography.lineHeight
❌ add_theme_support('custom-spacing')            ← Use theme.json settings.spacing
❌ add_theme_support('disable-custom-colors')     ← Use theme.json settings.color.custom
❌ add_theme_support('editor-gradient-presets')   ← Use theme.json settings.color.gradients
```

**For block themes, theme.json replaces most `add_theme_support()` calls.**

---

## 4. TEMPLATES AS HTML FILES WITH SERIALIZED BLOCK MARKUP

### What is "Serialized Block Markup"?

Block markup is **HTML + HTML comment delimiters** that WordPress uses to identify and parse blocks.

**Structure:**
```html
<!-- wp:{namespace}/{blockname} {json-attributes} -->
<html>Actual HTML output</html>
<!-- /wp:{namespace}/{blockname} -->
```

### Core Blocks Use "wp:" Prefix (No Namespace)

**Examples:**
```html
<!-- wp:paragraph -->
<p>This is a paragraph.</p>
<!-- /wp:paragraph -->

<!-- wp:heading {"level":2} -->
<h2>This is an H2 heading</h2>
<!-- /wp:heading -->

<!-- wp:image {"id":123,"sizeSlug":"large"} -->
<figure class="wp-block-image size-large">
  <img src="example.jpg" alt=""/>
</figure>
<!-- /wp:image -->
```

### Self-Closing Blocks (No HTML Content)

Some blocks are **self-closing** (dynamic blocks that render server-side):

```html
<!-- wp:site-title /-->

<!-- wp:post-title /-->

<!-- wp:post-featured-image /-->
```

### Block Attributes (JSON in HTML Comments)

Block settings are stored as **JSON objects** inside the HTML comment:

```html
<!-- wp:paragraph {"align":"center","textColor":"contrast","fontSize":"large"} -->
<p class="has-text-align-center has-contrast-color has-text-color has-large-font-size">
  Centered, large text
</p>
<!-- /wp:paragraph -->
```

**The JSON attributes define:**
- Alignment
- Colors
- Spacing
- Typography
- Custom CSS classes
- Any block-specific settings

### Nested Blocks Example

```html
<!-- wp:group {"tagName":"header","layout":{"type":"constrained"}} -->
<header class="wp-block-group">
  
  <!-- wp:columns -->
  <div class="wp-block-columns">
    
    <!-- wp:column -->
    <div class="wp-block-column">
      <!-- wp:site-logo /-->
    </div>
    <!-- /wp:column -->
    
    <!-- wp:column -->
    <div class="wp-block-column">
      <!-- wp:navigation /-->
    </div>
    <!-- /wp:column -->
    
  </div>
  <!-- /wp:columns -->
  
</header>
<!-- /wp:group -->
```

### Complete Template Example (templates/index.html)

```html
<!-- wp:template-part {"slug":"header","tagName":"header"} /-->

<!-- wp:group {"tagName":"main","layout":{"type":"constrained"}} -->
<main class="wp-block-group">
  
  <!-- wp:query -->
  <div class="wp-block-query">
    
    <!-- wp:post-template -->
      <!-- wp:post-title {"isLink":true} /-->
      <!-- wp:post-excerpt /-->
    <!-- /wp:post-template -->
    
    <!-- wp:query-pagination -->
    <div class="wp-block-query-pagination">
      <!-- wp:query-pagination-previous /-->
      <!-- wp:query-pagination-numbers /-->
      <!-- wp:query-pagination-next /-->
    </div>
    <!-- /wp:query-pagination -->
    
  </div>
  <!-- /wp:query -->
  
</main>
<!-- /wp:group -->

<!-- wp:template-part {"slug":"footer","tagName":"footer"} /-->
```

### HOW TO GET CORRECT BLOCK MARKUP

**DO NOT GUESS block markup from memory.** Instead:

1. **Add the block in WordPress editor** (Post Editor or Site Editor)
2. **Switch to Code Editor** (Ctrl+Shift+Alt+M or Shift+Option+Command+M)
3. **Copy the exact markup** WordPress generates
4. **Paste into your template files**

**Why?** AI models have outdated/incorrect block markup knowledge. The block editor generates the EXACT markup WordPress expects. Guessing leads to "Attempt Recovery" errors.

---

## 5. TEMPLATE PARTS, PATTERNS, AND HOW THEY RELATE

### Template Parts

**Definition:** Reusable sections of site STRUCTURE that sync across all uses

**Location:** `/parts/` folder in theme
```
my-theme/
└── parts/
    ├── header.html
    ├── footer.html
    └── sidebar.html
```

**Usage in Templates:**
```html
<!-- wp:template-part {"slug":"header","tagName":"header"} /-->
```

**Characteristics:**
- ✅ Stored as HTML files in `/parts` folder
- ✅ Editable by users in Site Editor
- ✅ Changes sync across ALL templates using the part
- ✅ Represent site STRUCTURE (headers, footers, sidebars)
- ✅ Can be replaced through template part interface
- ✅ Area-specific (header, footer, general)
- ❌ Cannot be used inside patterns
- ❌ Not content - they're structural elements

**When to use template parts:**
- Site headers
- Site footers  
- Sidebars
- Any structural element that should:
  - Appear on multiple templates
  - Update everywhere when edited once
  - Not be part of post/page content

### Block Patterns

**Definition:** Reusable groups of blocks for CONTENT that DON'T sync

**Location:** `/patterns/` folder in theme
```
my-theme/
└── patterns/
    ├── hero.php
    ├── cta.php
    └── testimonial.php
```

**File structure (patterns/hero.php):**
```php
<?php
/**
 * Title: Hero Section
 * Slug: mytheme/hero
 * Categories: featured
 */
?>
<!-- wp:cover {"url":"<?php echo esc_url( get_theme_file_uri( 'assets/images/hero.jpg' ) ); ?>","dimRatio":50} -->
<div class="wp-block-cover">
  <span aria-hidden="true" class="wp-block-cover__background has-background-dim"></span>
  <img class="wp-block-cover__image-background" src="<?php echo esc_url( get_theme_file_uri( 'assets/images/hero.jpg' ) ); ?>" />
  <div class="wp-block-cover__inner-container">
    
    <!-- wp:heading {"textAlign":"center","level":1} -->
    <h1 class="wp-block-heading has-text-align-center"><?php esc_html_e( 'Welcome to My Site', 'mytheme' ); ?></h1>
    <!-- /wp:heading -->
    
  </div>
</div>
<!-- /wp:cover -->
```

**Usage in Templates:**
```html
<!-- wp:pattern {"slug":"mytheme/hero"} /-->
```

**Characteristics:**
- ✅ Stored as `.php` files in `/patterns` folder (can use PHP for i18n, dynamic URLs)
- ✅ Inserted by users from Pattern inserter
- ✅ Each instance is INDEPENDENT (editing one doesn't affect others)
- ✅ Represent CONTENT/DESIGN (hero sections, CTAs, testimonials)
- ✅ Can be used in templates, template parts, OR other patterns
- ✅ Can include PHP for internationalization and dynamic content
- ❌ Do NOT sync across instances
- ❌ Cannot include template parts (patterns cannot reference template-part blocks)

**When to use patterns:**
- Hero sections
- Call-to-action blocks
- Testimonials
- Gallery layouts
- Any repeatable design that:
  - Users insert into content
  - Should be independently editable per instance
  - Needs i18n or dynamic PHP values

### Synced Patterns (Reusable Blocks)

**Definition:** Patterns with syncing enabled (behaves like template parts but for content)

**Created by users in:** Block Editor → Patterns → Create synced pattern

**Characteristics:**
- ✅ Changes sync across ALL instances
- ✅ Created through UI, not files
- ✅ Stored in database (wp_block post type)
- ✅ Referenced by post ID, not slug
- ❌ Not typically part of theme files

**Usage in templates (by post ID):**
```html
<!-- wp:block {"ref":123} /-->
```

### Decision Matrix: Template Part vs Pattern

| Need | Use Template Part | Use Pattern |
|------|------------------|-------------|
| Site header | ✅ Yes | ❌ No |
| Site footer | ✅ Yes | ❌ No |
| Hero section | ❌ No | ✅ Yes |
| CTA block | ❌ No | ✅ Yes |
| Changes sync globally | ✅ Yes | ❌ No (unless synced pattern) |
| Editable per instance | ❌ No | ✅ Yes |
| Needs internationalization | ❌ No (HTML only) | ✅ Yes (PHP patterns) |
| Part of site structure | ✅ Yes | ❌ No |
| Part of content | ❌ No | ✅ Yes |

### Critical Rule: Template Parts CANNOT Be Inside Patterns

```html
<!-- patterns/hero.php -->
❌ WRONG - This will break:
<!-- wp:template-part {"slug":"header"} /-->

✅ CORRECT - Use pattern in template, not template part in pattern
```

**Templates can include both:**
```html
<!-- templates/front-page.html -->
<!-- wp:template-part {"slug":"header"} /-->   ← Template part (synced structure)
<!-- wp:pattern {"slug":"mytheme/hero"} /-->   ← Pattern (unsynced content)
<!-- wp:template-part {"slug":"footer"} /-->   ← Template part (synced structure)
```

---

## 6. WHAT FUNCTIONS.PHP DOES AND DOES NOT DO IN BLOCK THEMES

### What functions.php IS

`functions.php` is an **optional PHP file** that acts like a plugin. It runs on:
- Every page load (frontend and admin)
- Before the theme is fully loaded

**Location:** Theme root directory
```
my-theme/
├── functions.php    ← Optional PHP functionality
├── style.css
└── templates/
```

### What functions.php DOES in Block Themes

```
✅ Enqueue CSS/JS assets (scripts and stylesheets)
✅ Register custom post types and taxonomies
✅ Add WordPress hooks and filters
✅ Register block styles (PHP)
✅ Register block stylesheets (per-block CSS)
✅ Register navigation menus (though Navigation block handles UI)
✅ Load text domain for internationalization
✅ Add image sizes
✅ Modify WordPress core behavior (hooks/filters)
✅ Register sidebars (for widget areas)
✅ Set up theme after_setup_theme actions
```

### What functions.php DOES NOT DO in Block Themes

```
❌ Define template structure (that's in HTML templates)
❌ Output HTML for headers/footers (use template parts)
❌ Replace theme.json for colors/fonts/spacing
❌ Use PHP template tags like the_content() in templates
❌ Handle template hierarchy via PHP (use HTML templates)
```

### Auto-Enabled Theme Supports in Block Themes

These `add_theme_support()` calls are **automatic** in block themes (DO NOT add them):

```php
// ❌ DON'T ADD - Automatic in block themes:
add_theme_support( 'post-thumbnails' );
add_theme_support( 'responsive-embeds' );
add_theme_support( 'editor-styles' );
add_theme_support( 'html5', array( 'style', 'script' ) );
add_theme_support( 'automatic-feed-links' );
```

### Minimal functions.php Example

```php
<?php
/**
 * Theme functions
 */

// Theme setup
function mytheme_setup() {
    // Load theme text domain
    load_theme_textdomain( 'mytheme', get_template_directory() . '/languages' );
}
add_action( 'after_setup_theme', 'mytheme_setup' );

// Enqueue theme stylesheet
function mytheme_enqueue_styles() {
    wp_enqueue_style(
        'mytheme-style',
        get_stylesheet_uri(),
        array(),
        wp_get_theme()->get( 'Version' )
    );
}
add_action( 'wp_enqueue_scripts', 'mytheme_enqueue_styles' );

// Register a custom block style
function mytheme_register_block_styles() {
    register_block_style(
        'core/button',
        array(
            'name'  => 'outline',
            'label' => __( 'Outline', 'mytheme' ),
        )
    );
}
add_action( 'init', 'mytheme_register_block_styles' );
```

### Critical: functions.php for Hooks ONLY

In block themes:
- **functions.php** = Hooks, filters, registrations
- **theme.json** = Visual settings and styles
- **Templates (HTML)** = Page structure and content

**DO NOT try to output HTML from functions.php into templates.**

---

## 7. NEVER USE THESE IN A BLOCK THEME

### Classic Theme PHP Template Tags (FORBIDDEN)

These functions are for **classic themes ONLY**. Using them in block theme templates will break the Site Editor or cause "Attempt Recovery" errors.

```php
❌ get_header()           // Use template-part block instead
❌ get_footer()           // Use template-part block instead
❌ get_sidebar()          // Use template-part block or blocks
❌ get_template_part()    // Use template-part block instead
❌ wp_head()              // Automatic in block themes
❌ wp_footer()            // Automatic in block themes
❌ body_class()           // Automatic in block themes
❌ wp_body_open()         // Automatic in block themes
```

**Why?** Block themes automatically handle `wp_head()`, `wp_body_open()`, and `wp_footer()` hooks. Templates are pure HTML + block markup.

### Classic Theme Content Functions (FORBIDDEN in Templates)

```php
❌ the_content()          // Use post-content block
❌ the_title()            // Use post-title block
❌ the_excerpt()          // Use post-excerpt block
❌ the_post_thumbnail()   // Use post-featured-image block
❌ the_permalink()        // Use post-title block with isLink
❌ the_category()         // Use post-terms block
❌ the_tags()             // Use post-terms block
❌ the_author()           // Use post-author block
❌ the_date()             // Use post-date block
❌ the_time()             // Use post-date block
```

### Classic Theme Loop Functions (FORBIDDEN in Templates)

```php
❌ have_posts()           // Use query block
❌ the_post()             // Use post-template block
❌ while ( have_posts() ) // Use query block
❌ wp_reset_postdata()    // Not needed with query block
```

**Example of WRONG classic theme pattern:**
```php
<!-- templates/index.html -->
❌ NEVER DO THIS IN BLOCK THEMES:

<?php if ( have_posts() ) : ?>
    <?php while ( have_posts() ) : the_post(); ?>
        <h2><?php the_title(); ?></h2>
        <?php the_content(); ?>
    <?php endwhile; ?>
<?php endif; ?>
```

**CORRECT block theme pattern:**
```html
<!-- templates/index.html -->
✅ DO THIS IN BLOCK THEMES:

<!-- wp:query -->
<div class="wp-block-query">
  <!-- wp:post-template -->
    <!-- wp:post-title {"isLink":true} /-->
    <!-- wp:post-content /-->
  <!-- /wp:post-template -->
</div>
<!-- /wp:query -->
```

### Classic Theme Navigation Functions (FORBIDDEN in Templates)

```php
❌ wp_nav_menu()          // Use navigation block
❌ register_nav_menus()   // Still OK in functions.php, but Navigation block handles UI
❌ wp_list_pages()        // Use page-list block
❌ wp_list_categories()   // Use categories block
```

**Classic approach (WRONG):**
```php
❌ <?php wp_nav_menu( array( 'theme_location' => 'primary' ) ); ?>
```

**Block theme approach (CORRECT):**
```html
✅ <!-- wp:navigation /-->
```

### Classic Theme Sidebar/Widget Functions (FORBIDDEN in Templates)

```php
❌ dynamic_sidebar()      // Use blocks instead
❌ is_active_sidebar()    // Not applicable
```

### Template Hierarchy PHP Files (FORBIDDEN)

```php
❌ header.php             // Use parts/header.html
❌ footer.php             // Use parts/footer.html
❌ sidebar.php            // Use parts/sidebar.html or blocks
❌ single.php             // Use templates/single.html
❌ page.php               // Use templates/page.html
❌ archive.php            // Use templates/archive.html
❌ category.php           // Use templates/category.html
❌ tag.php                // Use templates/tag.html
❌ author.php             // Use templates/author.html
❌ date.php               // Use templates/date.html
❌ search.php             // Use templates/search.html
❌ 404.php                // Use templates/404.html
❌ index.php              // Use templates/index.html
```

### add_theme_support() Calls Replaced by theme.json

```php
// ❌ DON'T USE - theme.json handles these:

add_theme_support( 'editor-color-palette', [...] );
// ✅ USE: theme.json → settings.color.palette

add_theme_support( 'editor-font-sizes', [...] );
// ✅ USE: theme.json → settings.typography.fontSizes

add_theme_support( 'custom-line-height' );
// ✅ USE: theme.json → settings.typography.lineHeight

add_theme_support( 'custom-spacing' );
// ✅ USE: theme.json → settings.spacing

add_theme_support( 'disable-custom-colors' );
// ✅ USE: theme.json → settings.color.custom: false

add_theme_support( 'editor-gradient-presets', [...] );
// ✅ USE: theme.json → settings.color.gradients

add_theme_support( 'custom-units', [...] );
// ✅ USE: theme.json → settings.spacing.units

add_theme_support( 'align-wide' );
// ✅ USE: theme.json → settings.layout.wideSize
```

### Complete "Never Use" Checklist

**When writing block theme code, NEVER:**

```
❌ Create .php template files in templates/ folder
❌ Use PHP template tags in HTML templates
❌ Call get_header(), get_footer(), get_sidebar()
❌ Use the WordPress Loop in templates
❌ Call the_content(), the_title(), etc. in templates
❌ Use wp_nav_menu() in templates
❌ Use add_theme_support() for things theme.json handles
❌ Guess block markup from memory
❌ Mix classic theme patterns with block theme patterns
❌ Create header.php, footer.php, sidebar.php, index.php
❌ Use dynamic_sidebar() or widget functions
❌ Reference template parts inside patterns
```

**Instead:**

```
✅ Create .html template files in templates/ folder
✅ Use block markup (HTML comments + HTML)
✅ Use template-part block for header/footer
✅ Use query + post-template blocks for loops
✅ Use post-content, post-title blocks, etc.
✅ Use navigation block for menus
✅ Define colors/fonts/spacing in theme.json
✅ Copy block markup from WordPress editor
✅ Embrace block-based architecture exclusively
✅ Create parts/header.html, parts/footer.html, templates/index.html
✅ Use blocks for all content areas
✅ Reference patterns inside templates and template parts
```

---

## SUMMARY: Block Theme Fundamental Principles

1. **Block themes are identified by `templates/index.html`** - that's the only technical requirement

2. **Templates are HTML files** in `/templates` folder containing serialized block markup, NOT PHP files

3. **Block markup = HTML comments + HTML** following the pattern:  
   `<!-- wp:blockname {attributes} -->HTML<!-- /wp:blockname -->`

4. **theme.json is the single source of truth** for colors, typography, spacing, and settings - replaces most `add_theme_support()` calls

5. **Template parts** (in `/parts`) = reusable STRUCTURE that syncs globally (headers, footers)

6. **Patterns** (in `/patterns`) = reusable CONTENT that doesn't sync (hero sections, CTAs)

7. **functions.php** is for PHP functionality (hooks, filters, registrations) - NOT for outputting HTML

8. **Never use classic theme functions** like `the_content()`, `get_header()`, `wp_nav_menu()` in block theme templates

9. **Get block markup from the editor** - never guess from memory (prevents validation errors)

10. **Automatic theme supports**: Block themes auto-enable thumbnails, responsive embeds, editor styles, HTML5, and feed links

---

## For AI Agents: Critical Reminders

**When generating block theme code:**

- ✅ **ALWAYS** create templates as `.html` files in `/templates` folder
- ✅ **ALWAYS** copy exact block markup from WordPress editor, never invent it
- ✅ **ALWAYS** use theme.json for colors, fonts, spacing - not PHP
- ✅ **ALWAYS** use blocks for content (post-title, post-content, etc.) - not PHP template tags
- ❌ **NEVER** use classic theme PHP template tags in block theme templates
- ❌ **NEVER** create `.php` template files (index.php, single.php, etc.)
- ❌ **NEVER** mix block theme and classic theme patterns
- ❌ **NEVER** assume block markup - verify against actual WordPress output

**Block themes are HTML + JSON, not PHP + HTML.**

---

*Document version: 1.0*  
*Last updated: February 2025*  
*Target: WordPress 6.7+*
