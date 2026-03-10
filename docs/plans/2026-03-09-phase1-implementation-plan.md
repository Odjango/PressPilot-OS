# Phase 1: Restaurant Design Quality — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make the restaurant vertical produce premium-quality, visually varied themes by adding skeleton variants, font pairings, and spacing consistency.

**Architecture:** Upgrade the inputs to the existing 5-step pipeline (skeletons, recipes, tokens) without changing the engine. PatternSelector learns pipe-delimited alternatives in recipes. ThemeAssembler learns heading+body font pairs. All existing skeletons get spacing audit. ~15 new skeletons expand the library.

**Tech Stack:** PHP 8.1+ (Laravel), WordPress FSE block markup (HTML), JSON configs

**Safety constraint:** All non-restaurant verticals MUST remain untouched and pass existing smoke tests.

---

### Task 1: Recipe Variation System — PatternSelector

**Files:**
- Modify: `backend/app/Services/PatternSelector.php`
- Modify: `pattern-library/vertical-recipes.json` (restaurant section only)
- Modify: `backend/tests/Unit/PatternSelectorTest.php`

**Step 1: Update PatternSelector to parse pipe-delimited alternatives**

In `PatternSelector.php`, replace the inner foreach loop (lines 50-80) so that when a recipe entry contains ` | `, it splits and picks one randomly:

```php
public function select(string $category, ?string $heroLayout = null): array
{
    $category = strtolower(trim($category));
    $recipe = $this->verticalRecipes[$category]
        ?? $this->verticalRecipes['local_service']
        ?? [];

    if (empty($recipe)) {
        throw new RuntimeException("No recipe found for category: {$category}");
    }

    $result = [];
    foreach ($recipe as $pageType => $skeletonIds) {
        $result[$pageType] = [];
        foreach ($skeletonIds as $skeletonEntry) {
            // Support pipe-delimited alternatives: "hero-cover | hero-split | hero-minimal"
            $skeletonId = $this->resolveSkeletonId($skeletonEntry);

            // Override hero skeleton on home page if heroLayout is provided
            if ($pageType === 'home' && $this->isHeroSkeleton($skeletonId) && $heroLayout) {
                $heroMap = [
                    'fullBleed' => 'hero-fullbleed',
                    'fullWidth' => 'hero-cover',
                    'split' => 'hero-split',
                    'minimal' => 'hero-minimal',
                ];
                $mappedSkeletonId = $heroMap[$heroLayout] ?? $skeletonId;
                \Illuminate\Support\Facades\Log::info(
                    "PatternSelector: Overriding hero skeleton",
                    ['requested' => $heroLayout, 'mapped_to' => $mappedSkeletonId]
                );
                $skeletonId = $mappedSkeletonId;
            }

            $skeleton = $this->skeletonRegistry[$skeletonId] ?? null;
            if ($skeleton && isset($skeleton['file'])) {
                $result[$pageType][] = [
                    'id' => $skeletonId,
                    'file' => $skeleton['file'],
                    'required_tokens' => $skeleton['required_tokens'] ?? [],
                ];
            } else {
                \Illuminate\Support\Facades\Log::warning(
                    "PatternSelector: Skeleton '{$skeletonId}' not found in registry",
                    ['category' => $category, 'page' => $pageType]
                );
            }
        }
    }

    return $result;
}

/**
 * Resolve a skeleton entry that may contain pipe-delimited alternatives.
 * "hero-cover | hero-split | hero-minimal" → picks one randomly.
 * "hero-cover" → returns as-is.
 */
private function resolveSkeletonId(string $entry): string
{
    if (! str_contains($entry, '|')) {
        return trim($entry);
    }

    $alternatives = array_map('trim', explode('|', $entry));
    // Filter to only alternatives that exist in the registry
    $valid = array_filter($alternatives, fn ($id) => isset($this->skeletonRegistry[$id]));

    if (empty($valid)) {
        // Fallback: return first alternative even if not in registry (will log warning later)
        return $alternatives[0];
    }

    return $valid[array_rand($valid)];
}

/**
 * Check if a skeleton ID is a hero variant.
 */
private function isHeroSkeleton(string $skeletonId): bool
{
    return str_starts_with($skeletonId, 'hero-');
}
```

**Step 2: Run existing tests to verify no breakage**

Run: `cd /sessions/laughing-focused-edison/mnt/PressPilot-OS/backend && php artisan test --filter=PatternSelector`

Note: Existing tests use `selectForPage()` which is a stale method signature. Tests may need updating to use `select()`. If they fail, update them to match the current API before proceeding.

**Step 3: Write new tests for pipe-delimited resolution**

Add to `PatternSelectorTest.php`:

```php
public function test_pipe_delimited_alternatives_resolve_to_valid_skeleton(): void
{
    // Create a temporary recipes file with pipe alternatives
    $recipes = [
        'restaurant' => [
            'home' => ['hero-cover | hero-split', 'about-story', 'testimonials-3col'],
        ],
    ];
    $recipesPath = tempnam(sys_get_temp_dir(), 'recipes_') . '.json';
    file_put_contents($recipesPath, json_encode($recipes));

    $registryPath = base_path('../pattern-library/skeleton-registry.json');
    $selector = new PatternSelector($registryPath, $recipesPath);
    $result = $selector->select('restaurant');

    // First skeleton should be one of the two hero variants
    $heroId = $result['home'][0]['id'];
    $this->assertContains($heroId, ['hero-cover', 'hero-split']);

    unlink($recipesPath);
}

public function test_plain_entries_still_work(): void
{
    $selector = new PatternSelector();
    $result = $selector->select('restaurant');

    $this->assertNotEmpty($result['home']);
    $this->assertArrayHasKey('id', $result['home'][0]);
    $this->assertArrayHasKey('file', $result['home'][0]);
}

public function test_hero_layout_override_still_works(): void
{
    $selector = new PatternSelector();
    $result = $selector->select('restaurant', 'split');

    $heroId = $result['home'][0]['id'];
    $this->assertEquals('hero-split', $heroId);
}
```

**Step 4: Run new tests**

Run: `cd /sessions/laughing-focused-edison/mnt/PressPilot-OS/backend && php artisan test --filter=PatternSelector`
Expected: All PASS

**Step 5: Commit**

```bash
git add backend/app/Services/PatternSelector.php backend/tests/Unit/PatternSelectorTest.php
git commit -m "feat: add pipe-delimited skeleton alternatives in PatternSelector"
```

---

### Task 2: Font Pairing System

**Files:**
- Create: `pattern-library/font-pairings.json`
- Modify: `backend/app/Jobs/GenerateThemeJob.php` (lines 115-126)
- Modify: `backend/app/Services/ThemeAssembler.php` (lines 329-334)

**Step 1: Create font-pairings.json**

```json
{
  "restaurant": {
    "heading": "Playfair Display",
    "body": "Source Sans 3",
    "personality": "Warm, inviting, classic"
  },
  "ecommerce": {
    "heading": "Inter",
    "body": "Inter",
    "personality": "Clean, modern, trustworthy"
  },
  "saas": {
    "heading": "Plus Jakarta Sans",
    "body": "Inter",
    "personality": "Tech-forward, professional"
  },
  "portfolio": {
    "heading": "Space Grotesk",
    "body": "DM Sans",
    "personality": "Creative, bold"
  },
  "local_service": {
    "heading": "Nunito",
    "body": "Open Sans",
    "personality": "Friendly, trustworthy"
  }
}
```

Save to: `pattern-library/font-pairings.json`

**Step 2: Modify GenerateThemeJob to use font pairings**

Replace the font mapping block (lines 115-126) in `GenerateThemeJob.php`:

```php
// Map fontProfile to actual Google Font family names
// Legacy single-font profiles (backward compatible)
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

// NEW: Load vertical-aware font pairings (heading + body)
$fontPairingsPath = base_path('../pattern-library/font-pairings.json');
if (file_exists($fontPairingsPath) && ! isset($projectData['fontPairing'])) {
    $fontPairings = json_decode(file_get_contents($fontPairingsPath), true) ?? [];
    $vertical = $this->normalizeCategory($projectData['businessCategory'] ?? $projectData['category'] ?? 'local_service');
    if (isset($fontPairings[$vertical])) {
        $projectData['fontPairing'] = $fontPairings[$vertical];
        // Override fontFamily with heading font (backward compatible)
        if (! isset($projectData['fontFamily'])) {
            $projectData['fontFamily'] = $fontPairings[$vertical]['heading'];
        }
    }
}
```

**Step 3: Modify ThemeAssembler::writeThemeJson() to inject heading + body fonts**

Replace the font override block (lines 329-334) in `ThemeAssembler.php`:

```php
// Override font families (heading + body pairing if available, else single font)
$fontPairing = $project['fontPairing'] ?? null;
$fontFamily = $project['fontFamily'] ?? ($project['fonts']['primary'] ?? null);

if ($fontPairing && isset($themeJson['settings']['typography']['fontFamilies'])) {
    // Replace first font family with heading font
    $themeJson['settings']['typography']['fontFamilies'][0] = [
        'fontFamily' => $fontPairing['heading'] . ', system-ui, sans-serif',
        'name' => $fontPairing['heading'],
        'slug' => 'heading',
    ];

    // Add body font as second family (or update existing)
    $bodyEntry = [
        'fontFamily' => $fontPairing['body'] . ', system-ui, sans-serif',
        'name' => $fontPairing['body'],
        'slug' => 'body',
    ];

    // If heading and body are same font, just use one entry with slug "primary"
    if ($fontPairing['heading'] === $fontPairing['body']) {
        $themeJson['settings']['typography']['fontFamilies'][0]['slug'] = 'primary';
    } else {
        // Ensure body font is second entry, replacing or adding
        if (isset($themeJson['settings']['typography']['fontFamilies'][1])) {
            $themeJson['settings']['typography']['fontFamilies'][1] = $bodyEntry;
        } else {
            $themeJson['settings']['typography']['fontFamilies'][] = $bodyEntry;
        }
    }

    Log::info('ThemeAssembler: Applied font pairing', [
        'heading' => $fontPairing['heading'],
        'body' => $fontPairing['body'],
    ]);
} elseif ($fontFamily && isset($themeJson['settings']['typography']['fontFamilies'][0])) {
    // Legacy: single font override (backward compatible)
    $themeJson['settings']['typography']['fontFamilies'][0]['fontFamily'] = $fontFamily . ', system-ui, sans-serif';
    $themeJson['settings']['typography']['fontFamilies'][0]['name'] = $fontFamily;
}
```

**Step 4: Test font pairing injection**

Run: `cd /sessions/laughing-focused-edison/mnt/PressPilot-OS/backend && php artisan test --filter=ThemeAssembler`
Then verify by inspecting a generated theme.json for restaurant vertical — it should contain both `Playfair Display` and `Source Sans 3` in fontFamilies.

**Step 5: Commit**

```bash
git add pattern-library/font-pairings.json backend/app/Jobs/GenerateThemeJob.php backend/app/Services/ThemeAssembler.php
git commit -m "feat: add vertical-aware font pairing system (heading + body fonts)"
```

---

### Task 3: Spacing Standardization

**Files:**
- Modify: All existing skeletons in `pattern-library/skeletons/*.html` (audit and fix)

**Spacing Rules (8px rhythm, consistent across all skeletons):**

| Context | Preset Slug | CSS Value | Usage |
|---------|------------|-----------|-------|
| Section top/bottom padding | `spacing\|70` | `clamp(2rem, 5vw, 3rem)` | All outer section groups |
| Section left/right padding | `spacing\|50` | `clamp(1.5rem, 4vw, 2rem)` | All outer section groups |
| Column gap (major) | `spacing\|60` | (between columns) | Column blocks |
| Block gap within section | `spacing\|50` | Between child blocks | Inner group blockGap |
| Card internal padding | `spacing\|50` | Card content padding | Bordered card groups |
| Card internal gap | `spacing\|40` | Between card elements | Card group blockGap |
| Button group gap | `spacing\|30` | Between buttons | Button groups |
| Tight element gap | `spacing\|30` | Name/role pairs | Metadata groups |

**Step 1: Audit all 22 existing skeletons for spacing consistency**

Read each skeleton file, check all `spacing|*` values against the rules above. Document any deviations.

**Step 2: Fix any inconsistencies found**

For each skeleton that deviates from the rules:
- Section wrappers: must use `spacing|70` top/bottom, `spacing|50` left/right
- Column gaps: must use `spacing|60` for `blockGap.left`
- Inner content gaps: must use `spacing|50` blockGap
- Card padding: must use `spacing|50` all sides
- Card internal gap: must use `spacing|40` blockGap
- Button gaps: must use `spacing|30`

**Step 3: Verify no block markup is broken after edits**

For each modified skeleton, manually verify:
- All `<!-- wp:` blocks have matching closers
- All JSON attributes are valid (double quotes, no trailing commas)
- Container blocks have matching HTML wrapper elements

**Step 4: Commit**

```bash
git add pattern-library/skeletons/
git commit -m "fix: standardize spacing to 8px grid across all existing skeletons"
```

---

### Task 4: New Hero Skeletons

**Files:**
- Create: `pattern-library/skeletons/hero-minimal.html`
- Create: `pattern-library/skeletons/hero-centered.html`
- Create: `pattern-library/skeletons/hero-image-grid.html`
- Modify: `pattern-library/skeleton-registry.json` (register new heroes)
- Modify: `pattern-library/vertical-recipes.json` (wire into restaurant recipes)

**Step 1: Read the FSE Knowledge Base**

Read: `docs/fse-kb/FSE-KNOWLEDGE-BASE-INDEX.md`
Identify batch files for blocks: cover, group, heading, paragraph, buttons, columns, image
Read the relevant `docs/fse-kb/BLOCK-REFERENCE-BATCH-*.md` files.

**Step 2: Create hero-minimal.html**

Design: Large heading + subheading only, lots of whitespace, no image. Elegant, restaurant-appropriate.
Tokens needed: `HERO_TITLE`, `HERO_TEXT`, `HERO_CTA` (reuses existing tokens — no new ones needed)

```html
<!-- wp:group {"align":"full","style":{"spacing":{"padding":{"top":"var:preset|spacing|70","bottom":"var:preset|spacing|70","right":"var:preset|spacing|50","left":"var:preset|spacing|50"},"margin":{"top":"0","bottom":"0"},"blockGap":"var:preset|spacing|50"}},"layout":{"type":"constrained","contentSize":"680px"}} -->
<div class="wp-block-group alignfull" style="margin-top:0;margin-bottom:0;padding-top:var(--wp--preset--spacing--70);padding-right:var(--wp--preset--spacing--50);padding-bottom:var(--wp--preset--spacing--70);padding-left:var(--wp--preset--spacing--50)"><!-- wp:heading {"textAlign":"center","level":1,"style":{"typography":{"fontSize":"clamp(2.75rem, 6vw, 4.5rem)","fontWeight":"400","letterSpacing":"-0.02em","lineHeight":"1.1"}}} -->
<h1 class="wp-block-heading has-text-align-center" style="font-size:clamp(2.75rem, 6vw, 4.5rem);font-weight:400;letter-spacing:-0.02em;line-height:1.1">{{HERO_TITLE}}</h1>
<!-- /wp:heading -->

<!-- wp:paragraph {"align":"center","style":{"typography":{"lineHeight":"1.6"}},"textColor":"secondary","fontSize":"medium"} -->
<p class="has-text-align-center has-secondary-color has-text-color has-medium-font-size" style="line-height:1.6">{{HERO_TEXT}}</p>
<!-- /wp:paragraph -->

<!-- wp:buttons {"layout":{"type":"flex","justifyContent":"center"},"style":{"spacing":{"blockGap":"var:preset|spacing|30"}}} -->
<div class="wp-block-buttons"><!-- wp:button {"backgroundColor":"primary","textColor":"base"} -->
<div class="wp-block-button"><a class="wp-block-button__link has-base-color has-primary-background-color has-text-color has-background wp-element-button">{{HERO_CTA}}</a></div>
<!-- /wp:button --></div>
<!-- /wp:buttons --></div>
<!-- /wp:group -->
```

**Step 3: Create hero-centered.html**

Design: Centered text over a gradient/solid color background (no image). Uses primary-alt background for warmth.
Tokens: `HERO_PRETITLE`, `HERO_TITLE`, `HERO_TEXT`, `HERO_CTA`, `HERO_CTA_SECONDARY`

```html
<!-- wp:group {"align":"full","style":{"spacing":{"padding":{"top":"var:preset|spacing|70","bottom":"var:preset|spacing|70","right":"var:preset|spacing|50","left":"var:preset|spacing|50"},"margin":{"top":"0","bottom":"0"},"blockGap":"var:preset|spacing|50"}},"backgroundColor":"primary","layout":{"type":"constrained","contentSize":"740px"}} -->
<div class="wp-block-group alignfull has-primary-background-color has-background" style="margin-top:0;margin-bottom:0;padding-top:var(--wp--preset--spacing--70);padding-right:var(--wp--preset--spacing--50);padding-bottom:var(--wp--preset--spacing--70);padding-left:var(--wp--preset--spacing--50)"><!-- wp:paragraph {"align":"center","style":{"typography":{"fontStyle":"normal","fontWeight":"500","textTransform":"uppercase","letterSpacing":"0.1em"}},"textColor":"primary-accent","fontSize":"x-small"} -->
<p class="has-text-align-center has-primary-accent-color has-text-color has-x-small-font-size" style="font-style:normal;font-weight:500;text-transform:uppercase;letter-spacing:0.1em">{{HERO_PRETITLE}}</p>
<!-- /wp:paragraph -->

<!-- wp:heading {"textAlign":"center","level":1,"style":{"typography":{"fontSize":"clamp(2.5rem, 5vw, 4rem)","fontWeight":"600"}},"textColor":"base"} -->
<h1 class="wp-block-heading has-text-align-center has-base-color has-text-color" style="font-size:clamp(2.5rem, 5vw, 4rem);font-weight:600">{{HERO_TITLE}}</h1>
<!-- /wp:heading -->

<!-- wp:paragraph {"align":"center","textColor":"primary-accent","fontSize":"base"} -->
<p class="has-text-align-center has-primary-accent-color has-text-color has-base-font-size">{{HERO_TEXT}}</p>
<!-- /wp:paragraph -->

<!-- wp:buttons {"layout":{"type":"flex","justifyContent":"center"},"style":{"spacing":{"blockGap":"var:preset|spacing|30"}}} -->
<div class="wp-block-buttons"><!-- wp:button {"backgroundColor":"base","textColor":"primary"} -->
<div class="wp-block-button"><a class="wp-block-button__link has-primary-color has-base-background-color has-text-color has-background wp-element-button">{{HERO_CTA}}</a></div>
<!-- /wp:button -->

<!-- wp:button {"className":"is-style-outline","borderColor":"base","textColor":"base"} -->
<div class="wp-block-button is-style-outline"><a class="wp-block-button__link has-base-color has-text-color has-border-color has-base-border-color wp-element-button">{{HERO_CTA_SECONDARY}}</a></div>
<!-- /wp:button --></div>
<!-- /wp:buttons --></div>
<!-- /wp:group -->
```

**Step 4: Create hero-image-grid.html**

Design: Two-column layout — text on left, 2x2 image grid on right. Dynamic, restaurant-friendly (food photos).
Tokens: `HERO_PRETITLE`, `HERO_TITLE`, `HERO_TEXT`, `HERO_CTA`, `IMAGE_HERO`, `IMAGE_ABOUT`, `IMAGE_GALLERY_1`, `IMAGE_GALLERY_2`

```html
<!-- wp:group {"align":"full","style":{"spacing":{"padding":{"top":"var:preset|spacing|70","bottom":"var:preset|spacing|70","right":"var:preset|spacing|50","left":"var:preset|spacing|50"},"margin":{"top":"0","bottom":"0"}}},"layout":{"type":"constrained"}} -->
<div class="wp-block-group alignfull" style="margin-top:0;margin-bottom:0;padding-top:var(--wp--preset--spacing--70);padding-right:var(--wp--preset--spacing--50);padding-bottom:var(--wp--preset--spacing--70);padding-left:var(--wp--preset--spacing--50)"><!-- wp:columns {"align":"wide","style":{"spacing":{"blockGap":{"left":"var:preset|spacing|60"}}}} -->
<div class="wp-block-columns alignwide"><!-- wp:column {"verticalAlignment":"center","width":"50%"} -->
<div class="wp-block-column is-vertically-aligned-center" style="flex-basis:50%"><!-- wp:paragraph {"style":{"typography":{"fontStyle":"normal","fontWeight":"500","textTransform":"uppercase","letterSpacing":"0.1em"}},"textColor":"primary","fontSize":"x-small"} -->
<p class="has-primary-color has-text-color has-x-small-font-size" style="font-style:normal;font-weight:500;text-transform:uppercase;letter-spacing:0.1em">{{HERO_PRETITLE}}</p>
<!-- /wp:paragraph -->

<!-- wp:heading {"level":1,"style":{"typography":{"fontSize":"clamp(2rem, 4vw, 3.5rem)","lineHeight":"1.15"}}} -->
<h1 class="wp-block-heading" style="font-size:clamp(2rem, 4vw, 3.5rem);line-height:1.15">{{HERO_TITLE}}</h1>
<!-- /wp:heading -->

<!-- wp:paragraph {"textColor":"secondary"} -->
<p class="has-secondary-color has-text-color">{{HERO_TEXT}}</p>
<!-- /wp:paragraph -->

<!-- wp:buttons {"style":{"spacing":{"blockGap":"var:preset|spacing|30"}}} -->
<div class="wp-block-buttons"><!-- wp:button {"backgroundColor":"primary","textColor":"base"} -->
<div class="wp-block-button"><a class="wp-block-button__link has-base-color has-primary-background-color has-text-color has-background wp-element-button">{{HERO_CTA}}</a></div>
<!-- /wp:button --></div>
<!-- /wp:buttons --></div>
<!-- /wp:column -->

<!-- wp:column {"width":"50%"} -->
<div class="wp-block-column" style="flex-basis:50%"><!-- wp:columns {"style":{"spacing":{"blockGap":{"left":"var:preset|spacing|30","top":"var:preset|spacing|30"}}}} -->
<div class="wp-block-columns"><!-- wp:column -->
<div class="wp-block-column"><!-- wp:image {"sizeSlug":"full","style":{"border":{"radius":"8px"}}} -->
<figure class="wp-block-image size-full has-custom-border"><img src="{{IMAGE_HERO}}" alt="" style="border-radius:8px"/></figure>
<!-- /wp:image -->

<!-- wp:image {"sizeSlug":"full","style":{"border":{"radius":"8px"}}} -->
<figure class="wp-block-image size-full has-custom-border"><img src="{{IMAGE_GALLERY_1}}" alt="" style="border-radius:8px"/></figure>
<!-- /wp:image --></div>
<!-- /wp:column -->

<!-- wp:column -->
<div class="wp-block-column"><!-- wp:image {"sizeSlug":"full","style":{"border":{"radius":"8px"}}} -->
<figure class="wp-block-image size-full has-custom-border"><img src="{{IMAGE_ABOUT}}" alt="" style="border-radius:8px"/></figure>
<!-- /wp:image -->

<!-- wp:image {"sizeSlug":"full","style":{"border":{"radius":"8px"}}} -->
<figure class="wp-block-image size-full has-custom-border"><img src="{{IMAGE_GALLERY_2}}" alt="" style="border-radius:8px"/></figure>
<!-- /wp:image --></div>
<!-- /wp:column --></div>
<!-- /wp:columns --></div>
<!-- /wp:column --></div>
<!-- /wp:columns --></div>
<!-- /wp:group -->
```

**Step 5: Register all 3 new heroes in skeleton-registry.json**

Add these entries to `pattern-library/skeleton-registry.json`:

```json
"hero-minimal": {
    "file": "pattern-library/skeletons/hero-minimal.html",
    "category": "hero",
    "required_tokens": ["HERO_TITLE", "HERO_TEXT", "HERO_CTA"],
    "vertical_affinity": ["general"]
},
"hero-centered": {
    "file": "pattern-library/skeletons/hero-centered.html",
    "category": "hero",
    "required_tokens": ["HERO_PRETITLE", "HERO_TITLE", "HERO_TEXT", "HERO_CTA", "HERO_CTA_SECONDARY"],
    "vertical_affinity": ["general"]
},
"hero-image-grid": {
    "file": "pattern-library/skeletons/hero-image-grid.html",
    "category": "hero",
    "required_tokens": ["HERO_PRETITLE", "HERO_TITLE", "HERO_TEXT", "HERO_CTA", "IMAGE_HERO", "IMAGE_ABOUT", "IMAGE_GALLERY_1", "IMAGE_GALLERY_2"],
    "vertical_affinity": ["restaurant", "portfolio"]
}
```

**Step 6: Wire into restaurant recipes with pipe alternatives**

Update `vertical-recipes.json` restaurant home page:

```json
"home": ["hero-cover | hero-split | hero-minimal | hero-centered | hero-image-grid", "about-story", "menu-2col", "hours-location", "chef-highlight", "testimonials-3col", "reservation-cta"]
```

**Step 7: Commit**

```bash
git add pattern-library/skeletons/hero-minimal.html pattern-library/skeletons/hero-centered.html pattern-library/skeletons/hero-image-grid.html pattern-library/skeleton-registry.json pattern-library/vertical-recipes.json
git commit -m "feat: add 3 new hero skeleton variants (minimal, centered, image-grid)"
```

---

### Task 5: New Testimonial Skeletons

**Files:**
- Create: `pattern-library/skeletons/testimonials-single-featured.html`
- Create: `pattern-library/skeletons/testimonials-with-rating.html`
- Modify: `pattern-library/skeleton-registry.json`
- Modify: `pattern-library/vertical-recipes.json`

**Step 1: Read FSE Knowledge Base for quote, group, paragraph blocks**

**Step 2: Create testimonials-single-featured.html**

Design: One large, centered testimonial with a star rating accent. Elegant, premium feel. Uses existing tokens (just TESTIMONIAL_1_*).

```html
<!-- wp:group {"align":"full","style":{"spacing":{"padding":{"top":"var:preset|spacing|70","bottom":"var:preset|spacing|70","right":"var:preset|spacing|50","left":"var:preset|spacing|50"},"margin":{"top":"0"},"blockGap":"var:preset|spacing|50"}},"backgroundColor":"tertiary","layout":{"type":"constrained","contentSize":"680px"}} -->
<div class="wp-block-group alignfull has-tertiary-background-color has-background" style="margin-top:0;padding-top:var(--wp--preset--spacing--70);padding-right:var(--wp--preset--spacing--50);padding-bottom:var(--wp--preset--spacing--70);padding-left:var(--wp--preset--spacing--50)"><!-- wp:heading {"textAlign":"center"} -->
<h2 class="wp-block-heading has-text-align-center">{{TESTIMONIALS_TITLE}}</h2>
<!-- /wp:heading -->

<!-- wp:group {"style":{"spacing":{"blockGap":"var:preset|spacing|40","padding":{"top":"var:preset|spacing|50","bottom":"var:preset|spacing|50","left":"var:preset|spacing|50","right":"var:preset|spacing|50"}},"border":{"radius":"8px"}},"backgroundColor":"base","layout":{"type":"constrained"}} -->
<div class="wp-block-group has-base-background-color has-background" style="border-radius:8px;padding-top:var(--wp--preset--spacing--50);padding-right:var(--wp--preset--spacing--50);padding-bottom:var(--wp--preset--spacing--50);padding-left:var(--wp--preset--spacing--50)"><!-- wp:paragraph {"align":"center","style":{"typography":{"fontSize":"clamp(1.1rem, 2.5vw, 1.35rem)","lineHeight":"1.7","fontStyle":"italic"}},"textColor":"main"} -->
<p class="has-text-align-center has-main-color has-text-color" style="font-size:clamp(1.1rem, 2.5vw, 1.35rem);line-height:1.7;font-style:italic">{{TESTIMONIAL_1_TEXT}}</p>
<!-- /wp:paragraph -->

<!-- wp:separator {"style":{"spacing":{"margin":{"top":"var:preset|spacing|40","bottom":"var:preset|spacing|40"}}},"backgroundColor":"border-light","className":"is-style-wide"} -->
<hr class="wp-block-separator has-text-color has-border-light-color has-border-light-background-color has-background is-style-wide" style="margin-top:var(--wp--preset--spacing--40);margin-bottom:var(--wp--preset--spacing--40)"/>
<!-- /wp:separator -->

<!-- wp:paragraph {"align":"center","style":{"typography":{"fontStyle":"normal","fontWeight":"600"}},"fontSize":"base"} -->
<p class="has-text-align-center has-base-font-size" style="font-style:normal;font-weight:600">{{TESTIMONIAL_1_NAME}}</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph {"align":"center","textColor":"secondary","fontSize":"small"} -->
<p class="has-text-align-center has-secondary-color has-text-color has-small-font-size">{{TESTIMONIAL_1_ROLE}}</p>
<!-- /wp:paragraph --></div>
<!-- /wp:group --></div>
<!-- /wp:group -->
```

**Step 3: Create testimonials-with-rating.html**

Design: Three testimonials in columns, each with a 5-star text rating ("★★★★★") for social proof. Restaurant-friendly.

```html
<!-- wp:group {"align":"full","style":{"spacing":{"padding":{"top":"var:preset|spacing|70","bottom":"var:preset|spacing|70","right":"var:preset|spacing|50","left":"var:preset|spacing|50"},"blockGap":"var:preset|spacing|60","margin":{"top":"0"}}},"layout":{"type":"constrained"}} -->
<div class="wp-block-group alignfull" style="margin-top:0;padding-top:var(--wp--preset--spacing--70);padding-right:var(--wp--preset--spacing--50);padding-bottom:var(--wp--preset--spacing--70);padding-left:var(--wp--preset--spacing--50)"><!-- wp:heading {"textAlign":"center"} -->
<h2 class="wp-block-heading has-text-align-center">{{TESTIMONIALS_TITLE}}</h2>
<!-- /wp:heading -->

<!-- wp:columns {"align":"wide","style":{"spacing":{"blockGap":{"left":"var:preset|spacing|50"}}}} -->
<div class="wp-block-columns alignwide"><!-- wp:column -->
<div class="wp-block-column"><!-- wp:group {"style":{"spacing":{"padding":{"top":"var:preset|spacing|50","bottom":"var:preset|spacing|50","left":"var:preset|spacing|50","right":"var:preset|spacing|50"},"blockGap":"var:preset|spacing|40"},"border":{"radius":"8px","width":"1px","color":"#e2e2ef"}},"backgroundColor":"base"} -->
<div class="wp-block-group has-border-color has-base-background-color has-background" style="border-color:#e2e2ef;border-width:1px;border-radius:8px;padding-top:var(--wp--preset--spacing--50);padding-right:var(--wp--preset--spacing--50);padding-bottom:var(--wp--preset--spacing--50);padding-left:var(--wp--preset--spacing--50)"><!-- wp:paragraph {"textColor":"primary","fontSize":"small"} -->
<p class="has-primary-color has-text-color has-small-font-size">★★★★★</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph {"fontSize":"small"} -->
<p class="has-small-font-size">{{TESTIMONIAL_1_TEXT}}</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph {"style":{"typography":{"fontStyle":"normal","fontWeight":"600"}},"fontSize":"small"} -->
<p class="has-small-font-size" style="font-style:normal;font-weight:600">{{TESTIMONIAL_1_NAME}}</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph {"textColor":"secondary","fontSize":"x-small"} -->
<p class="has-secondary-color has-text-color has-x-small-font-size">{{TESTIMONIAL_1_ROLE}}</p>
<!-- /wp:paragraph --></div>
<!-- /wp:group --></div>
<!-- /wp:column -->

<!-- wp:column -->
<div class="wp-block-column"><!-- wp:group {"style":{"spacing":{"padding":{"top":"var:preset|spacing|50","bottom":"var:preset|spacing|50","left":"var:preset|spacing|50","right":"var:preset|spacing|50"},"blockGap":"var:preset|spacing|40"},"border":{"radius":"8px","width":"1px","color":"#e2e2ef"}},"backgroundColor":"base"} -->
<div class="wp-block-group has-border-color has-base-background-color has-background" style="border-color:#e2e2ef;border-width:1px;border-radius:8px;padding-top:var(--wp--preset--spacing--50);padding-right:var(--wp--preset--spacing--50);padding-bottom:var(--wp--preset--spacing--50);padding-left:var(--wp--preset--spacing--50)"><!-- wp:paragraph {"textColor":"primary","fontSize":"small"} -->
<p class="has-primary-color has-text-color has-small-font-size">★★★★★</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph {"fontSize":"small"} -->
<p class="has-small-font-size">{{TESTIMONIAL_2_TEXT}}</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph {"style":{"typography":{"fontStyle":"normal","fontWeight":"600"}},"fontSize":"small"} -->
<p class="has-small-font-size" style="font-style:normal;font-weight:600">{{TESTIMONIAL_2_NAME}}</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph {"textColor":"secondary","fontSize":"x-small"} -->
<p class="has-secondary-color has-text-color has-x-small-font-size">{{TESTIMONIAL_2_ROLE}}</p>
<!-- /wp:paragraph --></div>
<!-- /wp:group --></div>
<!-- /wp:column -->

<!-- wp:column -->
<div class="wp-block-column"><!-- wp:group {"style":{"spacing":{"padding":{"top":"var:preset|spacing|50","bottom":"var:preset|spacing|50","left":"var:preset|spacing|50","right":"var:preset|spacing|50"},"blockGap":"var:preset|spacing|40"},"border":{"radius":"8px","width":"1px","color":"#e2e2ef"}},"backgroundColor":"base"} -->
<div class="wp-block-group has-border-color has-base-background-color has-background" style="border-color:#e2e2ef;border-width:1px;border-radius:8px;padding-top:var(--wp--preset--spacing--50);padding-right:var(--wp--preset--spacing--50);padding-bottom:var(--wp--preset--spacing--50);padding-left:var(--wp--preset--spacing--50)"><!-- wp:paragraph {"textColor":"primary","fontSize":"small"} -->
<p class="has-primary-color has-text-color has-small-font-size">★★★★★</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph {"fontSize":"small"} -->
<p class="has-small-font-size">{{TESTIMONIAL_3_TEXT}}</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph {"style":{"typography":{"fontStyle":"normal","fontWeight":"600"}},"fontSize":"small"} -->
<p class="has-small-font-size" style="font-style:normal;font-weight:600">{{TESTIMONIAL_3_NAME}}</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph {"textColor":"secondary","fontSize":"x-small"} -->
<p class="has-secondary-color has-text-color has-x-small-font-size">{{TESTIMONIAL_3_ROLE}}</p>
<!-- /wp:paragraph --></div>
<!-- /wp:group --></div>
<!-- /wp:column --></div>
<!-- /wp:columns --></div>
<!-- /wp:group -->
```

**Step 4: Register and wire**

Register in `skeleton-registry.json`:
```json
"testimonials-single-featured": {
    "file": "pattern-library/skeletons/testimonials-single-featured.html",
    "category": "testimonials",
    "required_tokens": ["TESTIMONIALS_TITLE", "TESTIMONIAL_1_TEXT", "TESTIMONIAL_1_NAME", "TESTIMONIAL_1_ROLE"],
    "vertical_affinity": ["general"]
},
"testimonials-with-rating": {
    "file": "pattern-library/skeletons/testimonials-with-rating.html",
    "category": "testimonials",
    "required_tokens": ["TESTIMONIALS_TITLE", "TESTIMONIAL_1_TEXT", "TESTIMONIAL_1_NAME", "TESTIMONIAL_1_ROLE", "TESTIMONIAL_2_TEXT", "TESTIMONIAL_2_NAME", "TESTIMONIAL_2_ROLE", "TESTIMONIAL_3_TEXT", "TESTIMONIAL_3_NAME", "TESTIMONIAL_3_ROLE"],
    "vertical_affinity": ["general"]
}
```

Wire into restaurant recipes — replace all `testimonials-3col` entries with pipe alternatives:
```
"testimonials-3col | testimonials-single-featured | testimonials-with-rating"
```

**Step 5: Commit**

```bash
git add pattern-library/skeletons/testimonials-single-featured.html pattern-library/skeletons/testimonials-with-rating.html pattern-library/skeleton-registry.json pattern-library/vertical-recipes.json
git commit -m "feat: add 2 new testimonial skeleton variants (single-featured, with-rating)"
```

---

### Task 6: New CTA & Features Skeletons

**Files:**
- Create: `pattern-library/skeletons/cta-split.html`
- Create: `pattern-library/skeletons/features-alternating.html`
- Modify: `pattern-library/skeleton-registry.json`
- Modify: `pattern-library/vertical-recipes.json`

**Step 1: Read FSE KB for cover, columns, group blocks**

**Step 2: Create cta-split.html**

Design: Half image, half CTA text. Not just a banner — a rich section with a compelling image alongside.
Tokens: `CTA_TITLE`, `CTA_TEXT`, `CTA_BUTTON`, `IMAGE_HERO`

```html
<!-- wp:group {"align":"full","style":{"spacing":{"margin":{"top":"0","bottom":"0"}}},"layout":{"type":"constrained"}} -->
<div class="wp-block-group alignfull" style="margin-top:0;margin-bottom:0"><!-- wp:columns {"align":"full","style":{"spacing":{"blockGap":{"left":"0"}}}} -->
<div class="wp-block-columns alignfull"><!-- wp:column {"width":"50%"} -->
<div class="wp-block-column" style="flex-basis:50%"><!-- wp:cover {"url":"{{IMAGE_HERO}}","dimRatio":0,"minHeight":480,"style":{"spacing":{"padding":{"top":"0","bottom":"0","left":"0","right":"0"}}}} -->
<div class="wp-block-cover" style="padding-top:0;padding-right:0;padding-bottom:0;padding-left:0;min-height:480px"><span aria-hidden="true" class="wp-block-cover__background has-background-dim-0 has-background-dim"></span><img class="wp-block-cover__image-background" alt="" src="{{IMAGE_HERO}}" data-object-fit="cover"/><div class="wp-block-cover__inner-container"><!-- wp:paragraph -->
<p></p>
<!-- /wp:paragraph --></div></div>
<!-- /wp:cover --></div>
<!-- /wp:column -->

<!-- wp:column {"verticalAlignment":"center","width":"50%","style":{"spacing":{"padding":{"top":"var:preset|spacing|70","bottom":"var:preset|spacing|70","right":"var:preset|spacing|70","left":"var:preset|spacing|70"}}}} -->
<div class="wp-block-column is-vertically-aligned-center" style="padding-top:var(--wp--preset--spacing--70);padding-right:var(--wp--preset--spacing--70);padding-bottom:var(--wp--preset--spacing--70);padding-left:var(--wp--preset--spacing--70);flex-basis:50%"><!-- wp:heading {"style":{"typography":{"fontSize":"clamp(1.75rem, 3.5vw, 2.5rem)"}}} -->
<h2 class="wp-block-heading" style="font-size:clamp(1.75rem, 3.5vw, 2.5rem)">{{CTA_TITLE}}</h2>
<!-- /wp:heading -->

<!-- wp:paragraph {"textColor":"secondary"} -->
<p class="has-secondary-color has-text-color">{{CTA_TEXT}}</p>
<!-- /wp:paragraph -->

<!-- wp:buttons -->
<div class="wp-block-buttons"><!-- wp:button {"backgroundColor":"primary","textColor":"base"} -->
<div class="wp-block-button"><a class="wp-block-button__link has-base-color has-primary-background-color has-text-color has-background wp-element-button">{{CTA_BUTTON}}</a></div>
<!-- /wp:button --></div>
<!-- /wp:buttons --></div>
<!-- /wp:column --></div>
<!-- /wp:columns --></div>
<!-- /wp:group -->
```

**Step 3: Create features-alternating.html**

Design: Two rows, each with image-left/text-right then text-left/image-right. Visual rhythm.
Tokens: `FEATURES_TITLE`, `FEATURE_1_TITLE`, `FEATURE_1_TEXT`, `FEATURE_2_TITLE`, `FEATURE_2_TEXT`, `IMAGE_ABOUT`, `IMAGE_GALLERY_1`

```html
<!-- wp:group {"align":"full","style":{"spacing":{"padding":{"top":"var:preset|spacing|70","bottom":"var:preset|spacing|70","right":"var:preset|spacing|50","left":"var:preset|spacing|50"},"margin":{"top":"0"},"blockGap":"var:preset|spacing|60"}},"layout":{"type":"constrained"}} -->
<div class="wp-block-group alignfull" style="margin-top:0;padding-top:var(--wp--preset--spacing--70);padding-right:var(--wp--preset--spacing--50);padding-bottom:var(--wp--preset--spacing--70);padding-left:var(--wp--preset--spacing--50)"><!-- wp:heading {"textAlign":"center"} -->
<h2 class="wp-block-heading has-text-align-center">{{FEATURES_TITLE}}</h2>
<!-- /wp:heading -->

<!-- wp:columns {"align":"wide","style":{"spacing":{"blockGap":{"left":"var:preset|spacing|60"}}}} -->
<div class="wp-block-columns alignwide"><!-- wp:column {"width":"50%"} -->
<div class="wp-block-column" style="flex-basis:50%"><!-- wp:image {"sizeSlug":"full","style":{"border":{"radius":"8px"}}} -->
<figure class="wp-block-image size-full has-custom-border"><img src="{{IMAGE_ABOUT}}" alt="" style="border-radius:8px"/></figure>
<!-- /wp:image --></div>
<!-- /wp:column -->

<!-- wp:column {"verticalAlignment":"center","width":"50%"} -->
<div class="wp-block-column is-vertically-aligned-center" style="flex-basis:50%"><!-- wp:heading {"level":3,"style":{"typography":{"fontSize":"clamp(1.25rem, 2.5vw, 1.75rem)"}}} -->
<h3 class="wp-block-heading" style="font-size:clamp(1.25rem, 2.5vw, 1.75rem)">{{FEATURE_1_TITLE}}</h3>
<!-- /wp:heading -->

<!-- wp:paragraph {"textColor":"secondary"} -->
<p class="has-secondary-color has-text-color">{{FEATURE_1_TEXT}}</p>
<!-- /wp:paragraph --></div>
<!-- /wp:column --></div>
<!-- /wp:columns -->

<!-- wp:columns {"align":"wide","style":{"spacing":{"blockGap":{"left":"var:preset|spacing|60"}}}} -->
<div class="wp-block-columns alignwide"><!-- wp:column {"verticalAlignment":"center","width":"50%"} -->
<div class="wp-block-column is-vertically-aligned-center" style="flex-basis:50%"><!-- wp:heading {"level":3,"style":{"typography":{"fontSize":"clamp(1.25rem, 2.5vw, 1.75rem)"}}} -->
<h3 class="wp-block-heading" style="font-size:clamp(1.25rem, 2.5vw, 1.75rem)">{{FEATURE_2_TITLE}}</h3>
<!-- /wp:heading -->

<!-- wp:paragraph {"textColor":"secondary"} -->
<p class="has-secondary-color has-text-color">{{FEATURE_2_TEXT}}</p>
<!-- /wp:paragraph --></div>
<!-- /wp:column -->

<!-- wp:column {"width":"50%"} -->
<div class="wp-block-column" style="flex-basis:50%"><!-- wp:image {"sizeSlug":"full","style":{"border":{"radius":"8px"}}} -->
<figure class="wp-block-image size-full has-custom-border"><img src="{{IMAGE_GALLERY_1}}" alt="" style="border-radius:8px"/></figure>
<!-- /wp:image --></div>
<!-- /wp:column --></div>
<!-- /wp:columns --></div>
<!-- /wp:group -->
```

**Step 4: Register and wire**

Register in `skeleton-registry.json`:
```json
"cta-split": {
    "file": "pattern-library/skeletons/cta-split.html",
    "category": "cta",
    "required_tokens": ["CTA_TITLE", "CTA_TEXT", "CTA_BUTTON", "IMAGE_HERO"],
    "vertical_affinity": ["general"]
},
"features-alternating": {
    "file": "pattern-library/skeletons/features-alternating.html",
    "category": "features",
    "required_tokens": ["FEATURES_TITLE", "FEATURE_1_TITLE", "FEATURE_1_TEXT", "FEATURE_2_TITLE", "FEATURE_2_TEXT", "IMAGE_ABOUT", "IMAGE_GALLERY_1"],
    "vertical_affinity": ["general"]
}
```

Wire into restaurant recipes:
- Replace `features-3col` with `"features-3col | features-alternating"`
- Replace `reservation-cta` (on home page) with `"reservation-cta | cta-split"` — BUT `cta-split` uses CTA tokens while `reservation-cta` uses RESERVATION tokens. Keep them separate. Instead, ADD `cta-split` as an alternative only for sections that already use CTA tokens:
  - In restaurant services page: `"cta-banner"` → `"cta-banner | cta-split"`

**Step 5: Commit**

```bash
git add pattern-library/skeletons/cta-split.html pattern-library/skeletons/features-alternating.html pattern-library/skeleton-registry.json pattern-library/vertical-recipes.json
git commit -m "feat: add cta-split and features-alternating skeleton variants"
```

---

### Task 7: New Restaurant-Specific Skeletons

**Files:**
- Create: `pattern-library/skeletons/specials-highlight.html`
- Create: `pattern-library/skeletons/gallery-featured.html`
- Modify: `pattern-library/skeleton-registry.json`
- Modify: `pattern-library/token-schema.json` (add SPECIALS_* tokens)
- Modify: `pattern-library/vertical-recipes.json`

**Step 1: Add SPECIALS tokens to token-schema.json**

Add to the tokens array:
```json
{"name": "SPECIALS_TITLE", "description": "Specials section heading", "maxLength": 60, "group": "specials", "vertical": "restaurant"},
{"name": "SPECIALS_SUBTITLE", "description": "Specials section subtext", "maxLength": 120, "group": "specials", "vertical": "restaurant"},
{"name": "SPECIAL_1_NAME", "description": "First special item name", "maxLength": 60, "group": "specials", "vertical": "restaurant"},
{"name": "SPECIAL_1_DESC", "description": "First special item description", "maxLength": 150, "group": "specials", "vertical": "restaurant"},
{"name": "SPECIAL_1_PRICE", "description": "First special item price", "maxLength": 20, "group": "specials", "vertical": "restaurant"},
{"name": "SPECIAL_2_NAME", "description": "Second special item name", "maxLength": 60, "group": "specials", "vertical": "restaurant"},
{"name": "SPECIAL_2_DESC", "description": "Second special item description", "maxLength": 150, "group": "specials", "vertical": "restaurant"},
{"name": "SPECIAL_2_PRICE", "description": "Second special item price", "maxLength": 20, "group": "specials", "vertical": "restaurant"},
{"name": "SPECIAL_3_NAME", "description": "Third special item name", "maxLength": 60, "group": "specials", "vertical": "restaurant"},
{"name": "SPECIAL_3_DESC", "description": "Third special item description", "maxLength": 150, "group": "specials", "vertical": "restaurant"},
{"name": "SPECIAL_3_PRICE", "description": "Third special item price", "maxLength": 20, "group": "specials", "vertical": "restaurant"}
```

**Step 2: Create specials-highlight.html**

Design: "Today's Specials" section with 3 highlighted dishes. Warm background, elegant cards. Restaurant-exclusive.

(Build this skeleton following the same patterns as menu-2col.html but with a 3-column card layout featuring SPECIAL_* tokens. Use `backgroundColor: "primary"` with `textColor: "base"` for one featured card to create visual hierarchy.)

**Step 3: Create gallery-featured.html**

Design: One large featured image + 4 smaller images in a grid. Better than the current uniform 6-image gallery.
Tokens: Reuses existing `GALLERY_*` and `IMAGE_GALLERY_*` tokens.

(Build using a 2-column layout: left column is a single large image spanning full height, right column is a 2x2 grid of smaller images. All with 8px border radius.)

**Step 4: Register and wire**

Register both in `skeleton-registry.json`. Wire into restaurant recipes:
- Add `specials-highlight` as new section on restaurant home page (after menu-2col)
- Replace `gallery-grid` alternatives in restaurant about page

**Step 5: Update AIPlanner prompt to generate SPECIALS tokens for restaurant**

Check `backend/app/Services/AIPlanner.php` — the system prompt for restaurant vertical needs to include SPECIALS_* tokens in its expected output.

**Step 6: Commit**

```bash
git add pattern-library/skeletons/specials-highlight.html pattern-library/skeletons/gallery-featured.html pattern-library/skeleton-registry.json pattern-library/token-schema.json pattern-library/vertical-recipes.json
git commit -m "feat: add restaurant-specific specials-highlight and gallery-featured skeletons"
```

---

### Task 8: Wire Complete Restaurant Recipes with All Alternatives

**Files:**
- Modify: `pattern-library/vertical-recipes.json` (final recipe for all restaurant pages)

**Step 1: Update all restaurant page recipes with pipe alternatives**

Final `vertical-recipes.json` restaurant section should be:

```json
"restaurant": {
    "home": [
        "hero-cover | hero-split | hero-minimal | hero-centered | hero-image-grid",
        "about-story",
        "menu-2col",
        "specials-highlight",
        "hours-location",
        "chef-highlight",
        "testimonials-3col | testimonials-single-featured | testimonials-with-rating",
        "reservation-cta"
    ],
    "about": [
        "page-banner",
        "about-story",
        "chef-highlight",
        "team-grid",
        "gallery-grid | gallery-featured"
    ],
    "menu": [
        "page-banner",
        "menu-2col",
        "specials-highlight",
        "reservation-cta",
        "testimonials-3col | testimonials-single-featured | testimonials-with-rating"
    ],
    "services": [
        "page-banner",
        "features-3col | features-alternating",
        "testimonials-3col | testimonials-single-featured | testimonials-with-rating",
        "hours-location",
        "reservation-cta"
    ],
    "contact": [
        "page-banner",
        "contact-info",
        "hours-location",
        "reservation-cta"
    ]
}
```

**Step 2: Verify all referenced skeletons exist in registry**

Manually check that every skeleton ID referenced (including all pipe alternatives) has a matching entry in `skeleton-registry.json`.

**Step 3: Commit**

```bash
git add pattern-library/vertical-recipes.json
git commit -m "feat: wire complete restaurant recipes with skeleton alternatives"
```

---

### Task 9: Integration Test — Generate 3 Restaurant Themes

**Goal:** Verify the complete pipeline works end-to-end, themes look different, and nothing is broken.

**Step 1: Run existing smoke tests**

Run: `cd /sessions/laughing-focused-edison/mnt/PressPilot-OS/backend && php artisan test`
Expected: All existing tests PASS (nothing broken)

**Step 2: Generate 3 restaurant themes**

Use the API or a test artisan command to generate 3 restaurant themes with different business names:
1. "Bella Cucina" (Italian restaurant)
2. "Sakura Sushi" (Japanese restaurant)
3. "The Rustic Grill" (American BBQ)

For each, verify:
- theme.json contains both `Playfair Display` and `Source Sans 3` in fontFamilies
- The hero section differs between at least 2 of the 3 themes
- The testimonials section differs between at least 2 of the 3 themes
- All blocks are properly closed (no crash errors)
- Footer contains PressPilot credit
- style.css has valid header

**Step 3: Visual comparison**

If WordPress Playground is available, load each theme and screenshot the homepage. Verify:
- Typography looks curated (serif headings, sans-serif body)
- Spacing is consistent (no cramped or oversized gaps)
- Sections alternate between light/dark backgrounds
- Overall feel is "premium" not "template"

**Step 4: Verify non-restaurant verticals are unaffected**

Generate one theme each for: ecommerce, saas, portfolio, local_service.
Verify they still use their original recipes (no pipe syntax, no changes).

**Step 5: Commit final state**

```bash
git add -A
git commit -m "feat: Phase 1 complete — restaurant design quality upgrade with skeleton variants, font pairings, spacing"
```

---

## Task Dependency Map

```
Task 1 (PatternSelector pipe support)
  ├── Task 4 (New hero skeletons) ─────────┐
  ├── Task 5 (New testimonial skeletons) ──├── Task 8 (Wire final recipes)
  ├── Task 6 (New CTA/features skeletons) ─┤        │
  └── Task 7 (Restaurant-specific) ────────┘        │
                                                     │
Task 2 (Font pairing system) ────────────────────────┤
Task 3 (Spacing standardization) ────────────────────┤
                                                     │
                                                     └── Task 9 (Integration test)
```

Tasks 1, 2, 3 can run in parallel (no dependencies).
Tasks 4-7 depend on Task 1 (need pipe support in PatternSelector).
Task 8 depends on Tasks 4-7 (needs all skeletons registered).
Task 9 depends on everything.
