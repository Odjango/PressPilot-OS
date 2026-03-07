# Phase 2.8: Theme Quality Fix Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Fix all 10 user-reported quality issues in SSWG-generated themes so that generated themes have real images, brand colors, user-chosen hero layout, proper navigation, logo in header, and zero Attempt Recovery errors.

**Architecture:** The SSWG pipeline (GenerateThemeJob → AIPlanner → PatternSelector → ImageHandler → TokenInjector → ThemeAssembler) has data flow gaps. The frontend sends colors, heroLayout, logo, and fonts via DataTransformer, but the pipeline ignores most of these. Images are downloaded to temp but never packaged into the theme. This plan patches the pipeline's data flow without a rewrite.

**Tech Stack:** Laravel 12, PHP 8.2, WordPress FSE block markup, Unsplash API

---

## Root Cause Summary

| # | User Issue | Root Cause | Fix Location |
|---|-----------|-----------|--------------|
| 1 | Theme only 19KB | Images not bundled in ZIP (see #6) | ThemeAssembler |
| 2 | Pages not in Admin > Pages | Expected FSE behavior — templates ≠ pages. NOT A BUG. | Documentation |
| 3 | Only Homepage renders; About/Services/Contact empty | Inner page templates work, but WordPress needs actual Page posts assigned to custom templates | ThemeAssembler (add starter content) |
| 4 | Site name = "My WordPress Website" | WordPress `blogname` is a DB setting, can't be set by theme. NOT A BUG, but we can improve via starter content. | functions.php |
| 5 | White text on white BG button in hero | Hero CTA buttons use `has-base-color` class but no background color class | hero-cover.html skeleton |
| 6 | No images at all (not even Unsplash) | ImageHandler returns LOCAL FILE PATHS (`/tmp/...`). TokenInjector validates with `FILTER_VALIDATE_URL` → fails → falls back to `placehold.co/1200x600`. Images never copied into theme ZIP. | ImageHandler + ThemeAssembler |
| 7 | Full Bleed chosen but Full Width rendered | `vertical-recipes.json` hardcodes `hero-cover` for restaurant. User's `heroLayout` selection from DataTransformer is never read by PatternSelector. | PatternSelector + GenerateThemeJob |
| 8 | Brand colors not used (Ollie/Frost defaults) | DataTransformer puts colors in `$projectData['primary']`, `$projectData['secondary']`, `$projectData['accent']`. But ThemeAssembler reads `$project['colors']['primary']`. Key mismatch — colors are at root level, not nested under `colors`. | GenerateThemeJob (data mapping) |
| 9 | No logo block in header/footer | `buildHeader()` only has `wp:site-title`. No `wp:site-logo` or `wp:image` block. Logo URL available as `$projectData['logo']` but never used. | ThemeAssembler |
| 10 | Attempt Recovery on menu items + no Menu page | Menu skeleton (`menu-2col.html`) has block markup errors (missing required attributes on separator/group blocks). Restaurant doesn't get a dedicated "menu" nav link. | menu-2col.html + header builder |

---

## Issue #2 Clarification (NOT A BUG)

WordPress FSE themes use **Templates** (Appearance → Editor → Templates), not traditional Pages. The screenshot shows About, Contact, Front Page, Services, etc. all exist as templates. This is correct WordPress FSE behavior.

However, for the templates to render content when a user visits `/about`, WordPress needs either:
- A Page post with slug `about` assigned to the `page-about` custom template, OR
- The template to use `<!-- wp:post-content /-->` so it renders whatever Page is assigned

We'll fix this via starter content in functions.php (Task 5).

## Issue #4 Clarification (PARTIAL BUG)

"My WordPress Website" as site title is a WordPress default. Themes can't override this directly. BUT we can:
1. Add starter content that sets the site title to the business name
2. This only works on fresh installs (WordPress Playground counts as fresh)

---

## Tasks

### Task 1: Fix Image Pipeline — Bundle Unsplash Images Into Theme ZIP

**The Critical Fix.** This is the #1 issue causing empty themes.

**Files:**
- Modify: `backend/app/Services/ImageHandler.php` — return URLs alongside file paths
- Modify: `backend/app/Services/ThemeAssembler.php` — copy images into theme, use relative paths
- Modify: `backend/app/Jobs/GenerateThemeJob.php` — pass image paths to assembler

**Root Cause:** `ImageHandler::generateImages()` downloads images to `/tmp/pp-jobs/xxx/assets/images/` and returns paths like `/tmp/pp-jobs/xxx/assets/images/image_hero.jpg`. These get merged into `$allTokens`. `TokenInjector` then checks `filter_var($path, FILTER_VALIDATE_URL)` which fails on local paths → falls back to `https://placehold.co/1200x600`. Even if TokenInjector accepted the paths, they'd be meaningless inside the theme ZIP because images are never copied into the theme directory.

**Fix Strategy:**
1. After ImageHandler downloads images, copy them into the theme's `assets/images/` directory
2. Replace image token values with **relative paths**: `assets/images/image_hero.jpg`
3. These relative paths work in WordPress block markup because WP serves them relative to the theme directory... **WAIT** — actually WordPress block themes need absolute URLs or `get_template_directory_uri()` calls. Block markup in `.html` template files can't use relative paths.

**Revised Fix Strategy (Unsplash URLs directly):**
1. Change ImageHandler to return BOTH the downloaded file path AND the original Unsplash URL
2. Use the Unsplash URL directly in block markup (these are permanent CDN URLs)
3. Skip copying images into the theme ZIP (keeps themes lightweight)
4. This matches how the old generator worked — Unsplash URLs directly in markup

**Step 1: Modify ImageHandler to return URLs**

In `ImageHandler.php`, change `generateImages()` to track original URLs:

```php
// In the foreach loop, after fetching:
$results[$token] = [
    'url' => $url,           // Original Unsplash/placeholder URL
    'path' => $path,         // Local downloaded file (for DALL-E upgrade later)
];
```

But this breaks the `array_merge($tokens, $imageUrls)` pattern since tokens expect `string` values. So instead:

```php
// Return two arrays
return [
    'urls' => $urlResults,    // TOKEN => URL string (for markup injection)
    'paths' => $pathResults,  // TOKEN => local path string (for DALL-E upgrade)
];
```

**Step 2: Update GenerateThemeJob to use URLs for injection**

```php
// Step 3 in handle():
$imageResult = $imageHandler->generateImages($projectData, $tempDir . '/assets/images', $imageTokens);
$allTokens = array_merge($tokens, $imageResult['urls']);
// Store paths for DALL-E upgrade manifest
$imagePaths = $imageResult['paths'];
```

**Step 3: Update markCompleted to store paths (for DALL-E upgrade)**

```php
$job->markCompleted([
    'download_path' => $themeStoragePath,
    'image_tokens' => $imageTokens,
    'image_paths' => $imagePaths,  // Local paths for future DALL-E swap
    'project_data' => [...],
]);
```

**Step 4: Verify TokenInjector accepts Unsplash URLs**

TokenInjector line 58: `filter_var($url, FILTER_VALIDATE_URL)` — Unsplash URLs like `https://images.unsplash.com/photo-xxx?w=1920&h=800&fit=crop` ARE valid URLs. This will pass. No change needed in TokenInjector.

**Step 5: Commit**

```bash
git add backend/app/Services/ImageHandler.php backend/app/Jobs/GenerateThemeJob.php
git commit -m "fix(sswg): return Unsplash URLs from ImageHandler for direct block markup injection"
```

---

### Task 2: Fix Brand Color Flow — Wire DataTransformer Colors to ThemeAssembler

**Files:**
- Modify: `backend/app/Jobs/GenerateThemeJob.php` — map flat color keys to nested `colors` array

**Root Cause:** DataTransformer puts colors at root level: `$projectData['primary']`, `$projectData['secondary']`, `$projectData['accent']`. ThemeAssembler reads `$project['colors']['primary']`. Key path mismatch.

**Step 1: Add color mapping in GenerateThemeJob::handle()**

After line 76 (`$projectData['language'] = ...`), add:

```php
// Map flat color keys from DataTransformer to nested 'colors' array for ThemeAssembler
if (! isset($projectData['colors'])) {
    $projectData['colors'] = [];
}
foreach (['primary', 'secondary', 'accent', 'background', 'foreground'] as $colorKey) {
    if (isset($projectData[$colorKey]) && ! isset($projectData['colors'][$colorKey])) {
        $projectData['colors'][$colorKey] = $projectData[$colorKey];
    }
}

// Also map selectedPaletteId to colors if no custom colors provided
if (empty($projectData['colors']['primary']) && ! empty($projectData['selectedPaletteId'])) {
    // Palette colors are defined in frontend — for now, provide sensible defaults
    // This will be enhanced when palette definitions are shared to backend
    Log::info('GenerateThemeJob: No custom colors, using palette defaults', [
        'paletteId' => $projectData['selectedPaletteId'],
    ]);
}
```

**Step 2: Add default fallback colors in ThemeAssembler::writeThemeJson()**

After the palette override loop (line 138), add:

```php
// If NO colors were overridden (all null), apply PressPilot defaults
$anyColorSet = false;
foreach ($paletteOverrides as $v) {
    if ($v) { $anyColorSet = true; break; }
}
if (! $anyColorSet) {
    Log::info('ThemeAssembler: No brand colors provided, applying PressPilot defaults');
    // PressPilot default palette — professional, neutral
    $defaults = [
        'primary' => '#1e3a5f',    // Deep navy
        'secondary' => '#4a90d9',  // Steel blue
        'primary-alt' => '#2ecc71', // Accent green
        'base' => '#ffffff',       // White background
        'main' => '#1a1a2e',       // Dark foreground
    ];
    foreach ($themeJson['settings']['color']['palette'] as $index => $entry) {
        $slug = $entry['slug'] ?? null;
        if ($slug && isset($defaults[$slug])) {
            $themeJson['settings']['color']['palette'][$index]['color'] = $defaults[$slug];
        }
    }
}
```

**Step 3: Commit**

```bash
git add backend/app/Jobs/GenerateThemeJob.php backend/app/Services/ThemeAssembler.php
git commit -m "fix(sswg): wire brand colors from DataTransformer through to theme.json palette"
```

---

### Task 3: Fix Hero Layout Selection — Respect User's Choice

**Files:**
- Modify: `backend/app/Services/PatternSelector.php` — accept heroLayout parameter
- Modify: `backend/app/Jobs/GenerateThemeJob.php` — pass heroLayout to PatternSelector
- Modify: `backend/pattern-library/vertical-recipes.json` — no change needed (hero is swapped dynamically)

**Root Cause:** User selects "Full-Bleed Hero" in Studio Step 3. DataTransformer normalizes to `fullBleed`. But PatternSelector reads the recipe directly: `"home": ["hero-cover", ...]`. The hero skeleton is always `hero-cover` regardless of user choice. No `hero-fullbleed.html` skeleton exists either.

**Fix Strategy:**
We have two hero skeletons: `hero-cover.html` (fullwidth cover with image) and `hero-split.html` (side-by-side). We need a third: `hero-fullbleed.html` for the fullBleed layout. But creating a new skeleton is complex. Simpler approach: modify `hero-cover.html` to support fullbleed by making the cover block 100vh with min-height.

Actually, the real fix: the `hero-cover` skeleton IS a cover block with background image. The difference between "fullWidth" and "fullBleed" in WordPress FSE is the `align` attribute:
- `fullWidth` = `{"align":"full"}` (stretches to container edges)
- `fullBleed` = `{"align":"full"}` + 100vh min-height + transparent nav overlay

**Step 1: Create hero-fullbleed.html skeleton**

Create `backend/pattern-library/skeletons/hero-fullbleed.html` — a 100vh cover block with centered content and no separate header (nav is inline). This matches the old generator's fullBleed pattern.

```html
<!-- wp:cover {"url":"{{IMAGE_HERO}}","dimRatio":60,"minHeight":100,"minHeightUnit":"vh","align":"full","style":{"spacing":{"padding":{"top":"0","bottom":"0","left":"var:preset|spacing|50","right":"var:preset|spacing|50"}}}} -->
<div class="wp-block-cover alignfull" style="min-height:100vh;padding-top:0;padding-bottom:0;padding-left:var(--wp--preset--spacing--50);padding-right:var(--wp--preset--spacing--50)">
<span aria-hidden="true" class="wp-block-cover__background has-background-dim-60 has-background-dim"></span>
<img class="wp-block-cover__image-background" alt="" src="{{IMAGE_HERO}}" data-object-fit="cover"/>
<div class="wp-block-cover__inner-container">

<!-- wp:group {"layout":{"type":"flex","flexWrap":"nowrap","justifyContent":"space-between"},"style":{"spacing":{"padding":{"top":"var:preset|spacing|40","bottom":"var:preset|spacing|40"}}}} -->
<div class="wp-block-group" style="padding-top:var(--wp--preset--spacing--40);padding-bottom:var(--wp--preset--spacing--40)">
    <!-- wp:site-title {"level":0,"style":{"typography":{"fontWeight":"700"},"elements":{"link":{"color":{"text":"var:preset|color|base"}}}},"textColor":"base"} /-->
    <!-- wp:navigation {"overlayMenu":"never","style":{"typography":{"fontWeight":"600"},"elements":{"link":{"color":{"text":"var:preset|color|base"}}}},"textColor":"base","layout":{"type":"flex","justifyContent":"right"}} /-->
</div>
<!-- /wp:group -->

<!-- wp:group {"layout":{"type":"constrained"},"style":{"spacing":{"padding":{"top":"var:preset|spacing|80","bottom":"var:preset|spacing|80"}}}} -->
<div class="wp-block-group" style="padding-top:var(--wp--preset--spacing--80);padding-bottom:var(--wp--preset--spacing--80)">
    <!-- wp:paragraph {"align":"center","style":{"typography":{"textTransform":"uppercase","letterSpacing":"3px","fontSize":"14px"}},"textColor":"base"} -->
    <p class="has-text-align-center has-base-color has-text-color" style="font-size:14px;letter-spacing:3px;text-transform:uppercase">{{HERO_PRETITLE}}</p>
    <!-- /wp:paragraph -->
    <!-- wp:heading {"textAlign":"center","level":1,"style":{"typography":{"fontSize":"clamp(2.5rem, 6vw, 4.5rem)","fontWeight":"800","lineHeight":"1.1"}},"textColor":"base"} -->
    <h1 class="wp-block-heading has-text-align-center has-base-color has-text-color" style="font-size:clamp(2.5rem, 6vw, 4.5rem);font-weight:800;line-height:1.1">{{HERO_TITLE}}</h1>
    <!-- /wp:heading -->
    <!-- wp:paragraph {"align":"center","style":{"typography":{"fontSize":"18px","lineHeight":"1.6"}},"textColor":"base"} -->
    <p class="has-text-align-center has-base-color has-text-color" style="font-size:18px;line-height:1.6">{{HERO_TEXT}}</p>
    <!-- /wp:paragraph -->
    <!-- wp:buttons {"layout":{"type":"flex","justifyContent":"center"},"style":{"spacing":{"margin":{"top":"var:preset|spacing|50"}}}} -->
    <div class="wp-block-buttons" style="margin-top:var(--wp--preset--spacing--50)">
        <!-- wp:button {"backgroundColor":"base","textColor":"main","style":{"border":{"radius":"4px"},"spacing":{"padding":{"top":"16px","bottom":"16px","left":"32px","right":"32px"}}}} -->
        <div class="wp-block-button"><a class="wp-block-button__link has-main-color has-base-background-color has-text-color has-background wp-element-button" style="border-radius:4px;padding-top:16px;padding-right:32px;padding-bottom:16px;padding-left:32px">{{HERO_CTA}}</a></div>
        <!-- /wp:button -->
        <!-- wp:button {"className":"is-style-outline","style":{"border":{"radius":"4px"},"spacing":{"padding":{"top":"16px","bottom":"16px","left":"32px","right":"32px"}},"elements":{"link":{"color":{"text":"var:preset|color|base"}}},"color":{"text":"var:preset|color|base"}},"borderColor":"base"} -->
        <div class="wp-block-button is-style-outline"><a class="wp-block-button__link has-base-color has-text-color has-border-color has-base-border-color wp-element-button" style="border-radius:4px;padding-top:16px;padding-right:32px;padding-bottom:16px;padding-left:32px">{{HERO_CTA_SECONDARY}}</a></div>
        <!-- /wp:button -->
    </div>
    <!-- /wp:buttons -->
</div>
<!-- /wp:group -->

</div></div>
<!-- /wp:cover -->
```

Key differences from `hero-cover.html`:
- `minHeight: 100vh` (full viewport)
- Inline transparent nav (site-title + wp:navigation block)
- Proper button color classes (`has-main-color has-base-background-color` for primary CTA)
- Outline style for secondary CTA with `base` border/text color

**Step 2: Register in skeleton-registry.json**

Add `hero-fullbleed` entry to the registry.

**Step 3: Modify PatternSelector to accept and apply heroLayout**

```php
public function select(string $category, ?string $heroLayout = null): array
{
    // ... existing recipe loading ...

    // Override hero skeleton based on user's layout choice
    if ($heroLayout && isset($selections['home'])) {
        $heroMap = [
            'fullBleed' => 'hero-fullbleed',
            'fullWidth' => 'hero-cover',
            'split' => 'hero-split',
            'minimal' => 'hero-cover', // fallback
        ];
        $heroSkeleton = $heroMap[$heroLayout] ?? null;
        if ($heroSkeleton) {
            // Replace first skeleton (hero) in home page
            $selections['home'][0] = $heroSkeleton;
        }
    }

    return $selections;
}
```

**Step 4: Pass heroLayout from GenerateThemeJob**

```php
$heroLayout = $projectData['heroLayout'] ?? null;
$skeletonSelections = $patternSelector->select($category, $heroLayout);
```

**Step 5: When heroLayout is fullBleed, skip separate header template-part in front-page.html**

ThemeAssembler::writeTemplates() needs to check if hero is fullbleed. If so, don't prepend `<!-- wp:template-part {"slug":"header"} /-->` to front-page.html (the header is already inline in the hero).

**Step 6: Commit**

```bash
git add backend/pattern-library/skeletons/hero-fullbleed.html \
       backend/pattern-library/skeleton-registry.json \
       backend/app/Services/PatternSelector.php \
       backend/app/Jobs/GenerateThemeJob.php \
       backend/app/Services/ThemeAssembler.php
git commit -m "feat(sswg): add fullBleed hero skeleton + wire user heroLayout choice through pipeline"
```

---

### Task 4: Fix Hero CTA Buttons — White-on-White Prevention

**Files:**
- Modify: `backend/pattern-library/skeletons/hero-cover.html` — fix button color classes

**Root Cause:** The hero-cover.html buttons use `has-base-color` for text but no explicit background color. When `base` resolves to white (#ffffff) and the cover overlay is light, buttons become invisible.

**Fix:** Add explicit `backgroundColor` and `textColor` attributes to button blocks:

Primary CTA: `{"backgroundColor":"primary","textColor":"base"}` — colored background, white text
Secondary CTA: `{"className":"is-style-outline","borderColor":"base","textColor":"base"}` — outline with white border/text

(The fullbleed skeleton in Task 3 already has this fix applied.)

**Step 1: Update hero-cover.html buttons**

Replace the buttons section with properly attributed buttons (same pattern as Task 3's hero-fullbleed.html).

**Step 2: Commit**

```bash
git add backend/pattern-library/skeletons/hero-cover.html
git commit -m "fix(sswg): hero CTA buttons use explicit color classes to prevent white-on-white"
```

---

### Task 5: Add Logo Block to Header and Footer

**Files:**
- Modify: `backend/app/Services/ThemeAssembler.php` — update `buildHeader()` and `buildPressPilotFooter()`

**Root Cause:** `buildHeader()` only has `wp:site-title`. No `wp:site-logo` or `wp:image` block. Logo URL is available as `$projectData['logo']` but never used.

**Fix Strategy:**
- If `$project['logo']` is set, add `wp:image` block before site-title with the logo URL
- If no logo, keep just site-title (current behavior)
- In footer, add logo to the left column (before tagline)

**Step 1: Update buildHeader()**

```php
private function buildHeader(array $project): string
{
    $name = htmlspecialchars((string) ($project['name'] ?? 'PressPilot'), ENT_QUOTES, 'UTF-8');
    $logoUrl = $project['logo'] ?? null;

    $logoBlock = '';
    if ($logoUrl && filter_var($logoUrl, FILTER_VALIDATE_URL)) {
        $escapedLogo = htmlspecialchars($logoUrl, ENT_QUOTES, 'UTF-8');
        $logoBlock = <<<LOGO
        <!-- wp:image {"width":"40px","height":"40px","sizeSlug":"full","style":{"border":{"radius":"4px"}}} -->
        <figure class="wp-block-image size-full" style="width:40px;height:40px"><img src="{$escapedLogo}" alt="{$name} logo" style="border-radius:4px;width:40px;height:40px;object-fit:contain"/></figure>
        <!-- /wp:image -->
LOGO;
    }

    // Build navigation with wp:navigation block instead of hardcoded links
    return <<<HEADER
<!-- wp:group {"align":"full","style":{"spacing":{"padding":{"top":"var:preset|spacing|40","bottom":"var:preset|spacing|40","left":"var:preset|spacing|50","right":"var:preset|spacing|50"}}},"layout":{"type":"flex","flexWrap":"nowrap","justifyContent":"space-between"}} -->
<div class="wp-block-group alignfull" style="padding-top:var(--wp--preset--spacing--40);padding-bottom:var(--wp--preset--spacing--40);padding-left:var(--wp--preset--spacing--50);padding-right:var(--wp--preset--spacing--50)">
    <!-- wp:group {"layout":{"type":"flex","flexWrap":"nowrap"}} -->
    <div class="wp-block-group">
        {$logoBlock}
        <!-- wp:site-title {"level":0,"style":{"typography":{"fontWeight":"700"}}} /-->
    </div>
    <!-- /wp:group -->
    <!-- wp:navigation {"overlayMenu":"never","layout":{"type":"flex","justifyContent":"right"}} /-->
</div>
<!-- /wp:group -->
HEADER;
}
```

Key changes:
1. Logo image block added before site-title (when logo URL available)
2. `wp:navigation` block replaces hardcoded paragraph links — WordPress auto-populates this from the site's menu. If no menu exists, it shows page list.

**Step 2: Update footer left column to include logo**

Add same logo block to the footer's left column above the site-title.

**Step 3: Commit**

```bash
git add backend/app/Services/ThemeAssembler.php
git commit -m "feat(sswg): add logo block to header/footer + replace hardcoded nav with wp:navigation"
```

---

### Task 6: Fix Attempt Recovery on Menu Items

**Files:**
- Modify: `backend/pattern-library/skeletons/menu-2col.html` — fix block markup errors

**Root Cause:** The menu-2col.html skeleton has block markup that doesn't match WordPress's `save()` output. Specific issues: separator blocks missing required attributes, group blocks with incorrect inline styles, or mismatched class names.

**Step 1: Read the FSE Knowledge Base for correct block syntax**

Read `docs/fse-kb/FSE-KNOWLEDGE-BASE-INDEX.md` and identify the relevant batch file for separator, group, and columns blocks. Verify exact required attributes.

**Step 2: Audit and fix menu-2col.html**

Common Attempt Recovery causes in menu markup:
- `wp:separator` missing `{"className":"is-style-wide"}` or missing the `<hr>` element
- `wp:group` with inline styles that don't match the JSON attributes
- `wp:columns` with incorrect `isStackedOnMobile` attribute

Fix each block to match the exact WordPress save() output format. The approach: recreate the menu layout using known-good block patterns from proven-cores.

**Step 3: Test by generating a restaurant theme and checking in WordPress Playground**

**Step 4: Commit**

```bash
git add backend/pattern-library/skeletons/menu-2col.html
git commit -m "fix(sswg): menu-2col.html block markup matches WordPress save() output"
```

---

### Task 7: Add Restaurant "Menu" Page + Dynamic Nav Links

**Files:**
- Modify: `backend/pattern-library/vertical-recipes.json` — add "menu" page to restaurant recipe
- Modify: `backend/app/Services/ThemeAssembler.php` — generate menu template, update nav links per vertical

**Root Cause:** Restaurant vertical recipe only has 4 pages: home, about, services, contact. But restaurant themes need a dedicated "Menu" page. Currently menu content is crammed into the "services" page.

**Step 1: Update restaurant recipe**

```json
"restaurant": {
    "home": ["hero-cover", "about-story", "menu-2col", "hours-location", "chef-highlight", "testimonials-3col", "reservation-cta"],
    "about": ["about-story", "chef-highlight"],
    "menu": ["menu-2col", "gallery-grid"],
    "services": ["features-3col", "hours-location"],
    "contact": ["contact-info", "hours-location"]
}
```

**Step 2: Update ThemeAssembler to handle "menu" page type**

In `writeTemplates()`, add support for a `menu` page type that creates `templates/page-menu.html`.

**Step 3: Register custom template in theme.json**

Add `{"name": "page-menu", "title": "Menu", "postTypes": ["page"]}` to the customTemplates array.

**Step 4: Commit**

```bash
git add backend/pattern-library/vertical-recipes.json \
       backend/app/Services/ThemeAssembler.php
git commit -m "feat(sswg): add dedicated Menu page for restaurant vertical"
```

---

### Task 8: Add Starter Content for Pages + Site Title

**Files:**
- Modify: `backend/app/Services/ThemeAssembler.php` — generate a custom functions.php with starter content

**Root Cause:** Generated themes install as empty shells. WordPress doesn't auto-create Pages for custom templates. Users see templates in the editor but no actual pages. Site title stays as "My WordPress Website".

**Fix:** Add WordPress `starter_content` support in the generated `functions.php`. This tells WordPress to auto-create pages when the theme is activated on a fresh site (or via the Customizer).

**Step 1: Generate custom functions.php**

Instead of copying Ollie's functions.php, generate one with starter content:

```php
<?php
// Custom FSE theme for {business_name}

// Register starter content for fresh installations
add_action('after_setup_theme', function() {
    add_theme_support('starter-content', [
        'options' => [
            'blogname' => '{business_name}',
            'blogdescription' => '{tagline}',
            'show_on_front' => 'page',
            'page_on_front' => '{{home}}',
        ],
        'posts' => [
            'home' => ['post_type' => 'page', 'post_title' => 'Home', 'template' => 'front-page'],
            'about' => ['post_type' => 'page', 'post_title' => 'About', 'template' => 'page-about'],
            'services' => ['post_type' => 'page', 'post_title' => 'Services', 'template' => 'page-services'],
            'contact' => ['post_type' => 'page', 'post_title' => 'Contact', 'template' => 'page-contact'],
        ],
        'nav_menus' => [
            'primary' => [
                'name' => 'Primary',
                'items' => [
                    'page_home',
                    'page_about',
                    'page_services',
                    'page_contact',
                ],
            ],
        ],
    ]);
});
```

This creates pages automatically when theme is activated on fresh WP installs.

**Step 2: Commit**

```bash
git add backend/app/Services/ThemeAssembler.php
git commit -m "feat(sswg): generate functions.php with starter content (pages, site title, navigation)"
```

---

### Task 9: Font Family Pass-Through

**Files:**
- Modify: `backend/app/Jobs/GenerateThemeJob.php` — map font data for ThemeAssembler

**Root Cause:** DataTransformer extracts `fontProfile` from the form. ThemeAssembler reads `$project['fontFamily']` or `$project['fonts']['primary']`. The font profile ID (e.g., "cleanSans") isn't mapped to an actual font family name.

**Step 1: Add font mapping in GenerateThemeJob**

```php
// Map fontProfile to actual font family
$fontMap = [
    'cleanSans' => 'Inter',
    'classicSerif' => 'Playfair Display',
    'modernSlab' => 'Roboto Slab',
    'elegantSerif' => 'Cormorant Garamond',
    'boldDisplay' => 'Montserrat',
];
$fontProfile = $projectData['fontProfile'] ?? 'cleanSans';
if (isset($fontMap[$fontProfile]) && ! isset($projectData['fontFamily'])) {
    $projectData['fontFamily'] = $fontMap[$fontProfile];
}
```

**Step 2: Commit**

```bash
git add backend/app/Jobs/GenerateThemeJob.php
git commit -m "fix(sswg): map fontProfile selection to actual Google Font family name"
```

---

### Task 10: Update Documentation + Memory

**Files:**
- Modify: `docs/PROJECT_ROADMAP.md` — add Phase 2.8 section
- Modify: `_memory/main.md` — record Phase 2.8 work

**Step 1: Add Phase 2.8 to roadmap**

Mark Phase 2.8 as the quality fix pass. List all 10 issues and their resolution.

**Step 2: Update memory with architectural lessons**

Record the key lesson: "Pipeline rewrites need a feature parity checklist. Data flow gaps (colors, heroLayout, logo, fonts) are invisible until you trace the full path from frontend form to theme ZIP."

**Step 3: Commit**

```bash
git add docs/PROJECT_ROADMAP.md _memory/main.md
git commit -m "docs: Phase 2.8 quality fixes — root causes and resolutions"
```

---

## Execution Order

Tasks are ordered by dependency and impact:

1. **Task 1** (Images) — HIGHEST IMPACT. Fixes issues #1 and #6. All themes immediately get real Unsplash images.
2. **Task 4** (CTA buttons) — Quick fix. Fixes issue #5. Prevents white-on-white.
3. **Task 2** (Colors) — Fixes issue #8. Brand colors flow through to theme.json.
4. **Task 3** (Hero layout) — Fixes issue #7. User's fullBleed choice is respected.
5. **Task 5** (Logo + wp:navigation) — Fixes issues #9 and partially #10. Logo in header/footer, dynamic nav.
6. **Task 6** (Menu markup) — Fixes issue #10 (Attempt Recovery).
7. **Task 7** (Menu page) — Fixes restaurant-specific page structure.
8. **Task 8** (Starter content) — Fixes issues #3 and #4. Pages auto-created, site title set.
9. **Task 9** (Fonts) — Polish. Font selection flows through.
10. **Task 10** (Docs) — Housekeeping.

## Risk Assessment

| Risk | Mitigation |
|------|-----------|
| Unsplash URLs expire | Unsplash CDN URLs are permanent (unlike DALL-E which expire after 1h). Safe for theme distribution. |
| wp:navigation block causes Attempt Recovery | It's a core WordPress block. If no menu exists, it auto-shows page list. Well-tested. |
| Starter content only works on fresh installs | WordPress Playground = fresh install. Real user sites may not trigger it, but that's expected WP behavior. |
| fullBleed hero with inline nav may have styling issues | Test in WordPress Playground after generation. The old generator proved this pattern works. |
| Color slug mismatch between PressPilot defaults and Ollie palette | We match against Ollie's exact slug names: primary, secondary, primary-alt, base, main. Verified in theme.json. |
