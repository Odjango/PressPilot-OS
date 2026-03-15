# CLAUDE_CODE_RULES.md — PressPilot Generator Guardrails
# ============================================================
# MANDATORY: Read this ENTIRE file before making ANY code change.
# If you skip this, you WILL break the generator. This has happened
# repeatedly for 8 months. Do not be the next agent to break it.
# ============================================================

## What this project is

PressPilot generates WordPress Full Site Editing (FSE) block themes as ZIP files.
Users download these ZIPs and install them in WordPress. If the block markup is
wrong BY EVEN ONE CHARACTER, WordPress shows "Attempt Recovery" errors and the
theme is broken.

WordPress validates blocks by comparing the saved HTML against what the block's
JavaScript `save()` function would produce. If they don't match exactly,
WordPress flags it. There is ZERO tolerance for markup mismatches.

---

## THE GOLDEN RULES (violate any of these = broken theme)

### Rule 1: JSON comment attributes and HTML classes must match EXACTLY

Every WordPress block has two parts:
- A JSON comment: `<!-- wp:paragraph {"textColor":"base","fontSize":"small"} -->`
- An HTML tag: `<p class="has-base-color has-text-color has-small-font-size">text</p>`

These MUST be in sync. The mapping is:

| JSON attribute | Required HTML class(es) |
|---|---|
| `"textColor":"base"` | `has-base-color has-text-color` |
| `"textColor":"contrast"` | `has-contrast-color has-text-color` |
| `"textColor":"primary"` | `has-primary-color has-text-color` |
| `"textColor":"foreground"` | `has-foreground-color has-text-color` |
| `"textColor":"{any-slug}"` | `has-{any-slug}-color has-text-color` |
| `"backgroundColor":"primary"` | `has-primary-background-color has-background` |
| `"backgroundColor":"{slug}"` | `has-{slug}-background-color has-background` |
| `"fontSize":"small"` | `has-small-font-size` |
| `"fontSize":"medium"` | `has-medium-font-size` |
| `"fontSize":"x-large"` | `has-x-large-font-size` |
| `"textAlign":"center"` | `has-text-align-center` |
| `"align":"full"` | `alignfull` |
| `"align":"wide"` | `alignwide` |

If the JSON says `"textColor":"base"` but the HTML class list is missing
`has-base-color has-text-color`, WordPress WILL flag Attempt Recovery.

**NEVER** add `textColor="base"` as an HTML attribute on the tag itself.
`textColor` is a JSON comment attribute ONLY. The HTML gets CSS classes.

### Rule 2: URLs in HTML must use &amp; not &

In the JSON comment, URLs use raw `&`:
```
<!-- wp:cover {"url":"https://example.com/photo?a=1&b=2"} -->
```

In HTML tags, URLs MUST use `&amp;`:
```html
<img src="https://example.com/photo?a=1&amp;b=2" alt=""/>
```

This applies to ALL HTML attributes that contain URLs:
- `<img src="...">`
- `style="background-image:url(...)"`
- Any other HTML attribute with a URL

**In PHP, use `htmlspecialchars($url, ENT_QUOTES, 'UTF-8')` when inserting
URLs into HTML attributes.**

Failure to encode `&` as `&amp;` is the #1 cause of Attempt Recovery errors
in PressPilot. Every Unsplash URL has 6+ query parameters joined by `&`.

### Rule 3: Block-specific attribute placement

#### wp:image — `aspectRatio` is a TOP-LEVEL attribute
```
CORRECT: <!-- wp:image {"sizeSlug":"full","aspectRatio":"16/9","style":{"border":{"radius":"5px"}}} -->
WRONG:   <!-- wp:image {"sizeSlug":"full","style":{"border":{"radius":"5px"},"aspectRatio":"16/9"}} -->
```
`aspectRatio` nested inside `style` triggers Attempt Recovery.

#### wp:cover — `dimRatio` must match the CSS class
| JSON | Required CSS class |
|---|---|
| `"dimRatio":85` | `has-background-dim-85 has-background-dim` |
| `"dimRatio":75` | `has-background-dim-75 has-background-dim` |
| `"dimRatio":60` | `has-background-dim-60 has-background-dim` |

The `<span>` overlay element must have BOTH classes.

#### wp:cover — `overlayColor` must match the CSS class
| JSON | Required CSS class on span |
|---|---|
| `"overlayColor":"contrast"` | `has-contrast-background-color` |
| `"overlayColor":"primary"` | `has-primary-background-color` |
| `"overlayColor":"main"` | `has-main-background-color` |

#### wp:media-text — `imageFill` requires specific HTML structure
When `"imageFill":true`, the `<figure>` MUST have:
- `style="background-image:url(...);background-position:50% 50%"`
- The `<img>` inside must have `class="wp-image-{id} size-full"`

#### wp:image — `has-custom-border` class
When `style.border` exists in JSON, the `<figure>` MUST include `has-custom-border`.

### Rule 4: Every paragraph and heading MUST have explicit textColor

Do NOT rely on CSS inheritance. WordPress themes render differently and inherited
colors are unpredictable. Every `wp:paragraph` and `wp:heading` must have:
- `"textColor":"something"` in the JSON comment
- `has-something-color has-text-color` in the HTML classes

**Which textColor to use depends on the background:**

| Parent background | Text color to use |
|---|---|
| Dark (primary, main, contrast) | `"textColor":"base"` (white) |
| Light (base, background, tertiary) | `"textColor":"contrast"` or `"textColor":"foreground"` |
| White card on dark parent | `"textColor":"contrast"` (dark text on white card) |
| No explicit background | `"textColor":"foreground"` (safe default) |

**Exception:** Price paragraphs with `"textColor":"primary"` (brand color) are
acceptable on white/light backgrounds.

### Rule 5: The cover block HTML structure

WordPress 6.7+ expects this exact structure for `wp:cover`:

```html
<!-- wp:cover {"url":"...","dimRatio":85,"overlayColor":"contrast",...} -->
<div class="wp-block-cover alignfull" style="min-height:100vh;...">
  <span aria-hidden="true" class="wp-block-cover__background has-contrast-background-color has-background-dim-85 has-background-dim"></span>
  <img class="wp-block-cover__image-background" alt="" src="..." data-object-fit="cover"/>
  <div class="wp-block-cover__inner-container">
    <!-- inner blocks go here -->
  </div>
</div>
<!-- /wp:cover -->
```

Key elements that must be present:
- `<span aria-hidden="true" class="wp-block-cover__background ...">` for the overlay
- `<img class="wp-block-cover__image-background" ... data-object-fit="cover"/>` for the image
- `<div class="wp-block-cover__inner-container">` wrapping inner content

**Do NOT wrap the image in a `<figure>` tag.** The cover block uses a bare `<img>`.

---

## PROTECTED FILES — DO NOT MODIFY WITHOUT VALIDATION

These files are stable and working. Modifying them has historically caused
regressions. If you must change them, you MUST run validation afterward.

### Core pipeline files (changes here affect ALL generated themes):
- `backend/app/Services/TokenInjector.php`
- `backend/app/Services/CorePaletteResolver.php`
- `backend/app/Services/ThemeAssembler.php`

### Skeleton files (the source templates for generated output):
- `pattern-library/skeletons/*.html` — all 31+ skeleton files

### Gold-standard theme (the base restaurant theme):
- `themes/gold-standard-restaurant/patterns/*.php`
- `themes/gold-standard-restaurant/templates/*.html`

**Before modifying ANY of these files:**
1. Read this entire document
2. Make your change
3. Run the validation script (see below)
4. Only commit if validation passes

---

## VALIDATION COMMANDS

Run these BEFORE every commit. If any command reports errors, fix them
before committing.

### Check 1: No raw & in HTML img/style attributes
```bash
# Must return 0 for all files
for f in pattern-library/skeletons/*.html; do
  count=$(grep -c '<img[^>]*src="[^"]*&[^a][^m][^p]' "$f" 2>/dev/null || echo 0)
  if [ "$count" -gt 0 ]; then echo "FAIL: $f has $count unencoded & in img src"; fi
done
```

### Check 2: Every paragraph has textColor
```bash
# Review each match — paragraphs inside dark sections MUST have textColor
grep -rn '<!-- wp:paragraph' pattern-library/skeletons/*.html | grep -v textColor | grep -v '/wp:paragraph'
# If any result is inside a dark-background section, it's a bug
```

### Check 3: JSON textColor matches HTML class
```bash
# Find mismatches: JSON says textColor but HTML missing the class
for f in pattern-library/skeletons/*.html; do
  # Extract textColor values and check for matching has-X-color class
  grep -n 'textColor' "$f" | while read line; do
    linenum=$(echo "$line" | cut -d: -f1)
    slug=$(echo "$line" | grep -o '"textColor":"[^"]*"' | cut -d'"' -f4)
    if [ -n "$slug" ]; then
      nextline=$(sed -n "$((linenum+1))p" "$f")
      if ! echo "$nextline" | grep -q "has-${slug}-color"; then
        echo "MISMATCH in $f:$linenum — JSON has textColor:$slug but HTML missing has-${slug}-color"
      fi
    fi
  done
done
```

### Check 4: aspectRatio not inside style
```bash
grep -rn '"style".*aspectRatio' pattern-library/skeletons/*.html
# Must return ZERO results
```

### Check 5: dimRatio matches CSS class
```bash
for f in pattern-library/skeletons/*.html; do
  grep -n 'dimRatio' "$f" | while read line; do
    linenum=$(echo "$line" | cut -d: -f1)
    ratio=$(echo "$line" | grep -o '"dimRatio":[0-9]*' | cut -d: -f2)
    if [ -n "$ratio" ]; then
      # Check if the corresponding span has the right class
      grep -A5 "wp-block-cover__background" "$f" | grep -q "has-background-dim-${ratio}"
      if [ $? -ne 0 ]; then
        echo "MISMATCH in $f — dimRatio:$ratio but missing has-background-dim-${ratio} class"
      fi
    fi
  done
done
```

---

## THE COLOR PALETTE

These are the standard color slugs used across all generated themes.
The actual hex values change per theme, but the SLUG NAMES are constant.

| Slug | Typical color | Usage |
|---|---|---|
| `base` | #ffffff (white) | Light text on dark backgrounds |
| `contrast` | #1a1a1a (near-black) | Dark text on light backgrounds |
| `primary` | varies (brand color) | Accent text, prices, brand elements |
| `foreground` | #333333 (dark gray) | Body text on light backgrounds |
| `main` | #333333 (dark gray) | Alternative body text |
| `secondary` | varies | DO NOT USE for textColor (was removed) |
| `tertiary` | varies (light tint) | Light section backgrounds |
| `background` | #ffffff | Page background |
| `border` | varies | Border colors |
| `border-light` | varies | Light border colors |

**NEVER use `textColor:"secondary"`.** It was removed and replaced with
`"foreground"` across all skeletons. Using it will cause color mismatches.

---

## COMMON MISTAKES THAT BREAK THEMES (learn from 8 months of failures)

### Mistake 1: Fixing one block and breaking another
When you fix a skeleton or pattern file, you must check that your change
doesn't affect other blocks in the same file. WordPress validates EVERY
block in the template, not just the one you changed.

### Mistake 2: Assuming CSS inheritance works
It doesn't. Different WordPress themes, different browsers, and the Site
Editor all render inherited colors differently. Always use explicit
textColor on every text block.

### Mistake 3: Changing the regex in enforceTextColorRules()
The regex `\{[^}]*\}` in `TokenInjector.php` cannot handle nested JSON.
The method `extractJsonFromOffset()` (lines 124-168) handles nested braces
correctly. If you need to modify text color enforcement logic, use
`extractJsonFromOffset()`, not regex.

### Mistake 4: Adding HTML attributes that WordPress doesn't expect
WordPress block markup is strict. Adding attributes like `textColor="base"`
or `data-custom="anything"` to HTML tags WILL trigger Attempt Recovery if
the block's `save()` function doesn't output those attributes.

### Mistake 5: Using the wrong dimRatio
- `dimRatio:60` = too transparent, text hard to read over busy photos
- `dimRatio:75` = borderline, sometimes readable
- `dimRatio:85` = good contrast for text readability (USE THIS)
- `dimRatio:90` = very opaque, image barely visible

### Mistake 6: Not encoding URLs for HTML context
JSON context: raw `&` is correct
HTML context: `&amp;` is required
CSS context (background-image url): raw `&` is correct (CSS is not HTML)
This distinction MUST be handled at the point of HTML generation.

### Mistake 7: Deploying without generating a fresh test theme
After pushing to main and waiting for Coolify to deploy, you MUST:
1. Generate a brand new theme on presspilotapp.com
2. Download the ZIP
3. Upload to WordPress Playground (https://playground.wordpress.net/)
4. Click INTO each template in the Site Editor (not just view the list)
5. Confirm zero Attempt Recovery errors and all text is readable

---

## BLOCK MARKUP REFERENCE (copy-paste these exact patterns)

### Paragraph with textColor on dark background
```html
<!-- wp:paragraph {"align":"center","textColor":"base","fontSize":"medium"} -->
<p class="has-text-align-center has-base-color has-text-color has-medium-font-size">Your text here</p>
<!-- /wp:paragraph -->
```

### Paragraph with textColor on light background
```html
<!-- wp:paragraph {"textColor":"foreground","fontSize":"base"} -->
<p class="has-foreground-color has-text-color has-base-font-size">Your text here</p>
<!-- /wp:paragraph -->
```

### Heading with textColor
```html
<!-- wp:heading {"textAlign":"center","textColor":"base","fontSize":"x-large","style":{"typography":{"fontWeight":"700"}}} -->
<h2 class="wp-block-heading has-text-align-center has-base-color has-text-color has-x-large-font-size" style="font-weight:700">Your heading</h2>
<!-- /wp:heading -->
```

### Image block with aspectRatio (CORRECT placement)
```html
<!-- wp:image {"sizeSlug":"full","aspectRatio":"16/9","style":{"border":{"radius":"5px"}}} -->
<figure class="wp-block-image size-full has-custom-border"><img src="https://example.com/photo.jpg" alt="" style="border-radius:5px;aspect-ratio:16/9;object-fit:cover"/></figure>
<!-- /wp:image -->
```

### Cover block (hero)
```html
<!-- wp:cover {"url":"https://example.com/hero.jpg","dimRatio":85,"overlayColor":"contrast","isUserOverlayColor":true,"align":"full","minHeight":100,"minHeightUnit":"vh"} -->
<div class="wp-block-cover alignfull" style="min-height:100vh">
  <span aria-hidden="true" class="wp-block-cover__background has-contrast-background-color has-background-dim-85 has-background-dim"></span>
  <img class="wp-block-cover__image-background" alt="" src="https://example.com/hero.jpg" data-object-fit="cover"/>
  <div class="wp-block-cover__inner-container">
    <!-- inner blocks -->
  </div>
</div>
<!-- /wp:cover -->
```

### Group with dark background
```html
<!-- wp:group {"align":"full","backgroundColor":"primary","layout":{"type":"constrained"}} -->
<div class="wp-block-group alignfull has-primary-background-color has-background">
  <!-- ALL child headings and paragraphs MUST have textColor:"base" -->
</div>
<!-- /wp:group -->
```

### Group with dark background AND textColor on the group itself
```html
<!-- wp:group {"align":"full","backgroundColor":"primary","textColor":"base","layout":{"type":"constrained"}} -->
<div class="wp-block-group alignfull has-base-color has-primary-background-color has-text-color has-background">
  <!-- Child blocks should STILL have their own explicit textColor -->
</div>
<!-- /wp:group -->
```

---

## WHEN IN DOUBT

1. Check the WordPress block editor source code for the exact `save()` output
2. Create a block manually in WordPress, save it, and inspect the HTML
3. Compare your generated markup character-by-character against the WordPress output
4. Run the validation commands above
5. Generate a test theme and check it in WordPress Playground

**Never guess. Never assume. Always verify.**

---

## VERSION HISTORY

- 2026-03-14: Initial version based on 8 months of debugging patterns
- Covers: text color rules, URL encoding, attribute placement, cover block
  structure, image block rules, media-text rules, validation commands

---

# END OF RULES
# If you've read this far, you're ready to make changes.
# Run validation after every change. No exceptions.
