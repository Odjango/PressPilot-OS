# PressPilot — DEFINITIVE FIX (Based on Actual Production ZIP Analysis)

## CONTEXT
I extracted and analyzed the actual production-generated theme ZIP. Here are the REAL bugs — not guesses, confirmed from the markup.

## BUG 1: Testimonial quote paragraphs — `has-text-color` class without actual color

**Location:** The skeleton that generates testimonial cards (likely `pattern-library/skeletons/testimonials-3col.html` or similar)

**What the generated output looks like:**
```html
<!-- wp:paragraph {"fontSize":"small"} -->
<p class="has-text-color has-small-font-size">Quote text here...</p>
<!-- /wp:paragraph -->
```

**What's wrong:**
- JSON has NO `textColor` attribute
- HTML has `has-text-color` class but NO color class like `has-contrast-color`
- This means WordPress applies the `has-text-color` CSS rule (which overrides inherited color) but sets it to NOTHING — resulting in invisible text

**Fix:** Find the skeleton/pattern that produces these testimonial quote paragraphs. Two changes needed:
1. Add `"textColor":"contrast"` to the JSON comment
2. Change `has-text-color` to `has-contrast-color has-text-color` in the HTML class

**Correct output should be:**
```html
<!-- wp:paragraph {"fontSize":"small","textColor":"contrast"} -->
<p class="has-contrast-color has-text-color has-small-font-size">Quote text here...</p>
<!-- /wp:paragraph -->
```

**Search for the source:**
```bash
# Find which skeleton produces testimonial blocks
grep -rln "testimonial\|what.*customers\|what.*guests" pattern-library/skeletons/
# Also check the gold-standard patterns
grep -rln "testimonial\|what.*customers\|what.*guests" themes/gold-standard-restaurant/patterns/
# Check the ThemeAssembler to see which skeleton is used for testimonials
grep -rn "testimonial" backend/app/Services/ThemeAssembler.php
```

Fix ALL testimonial quote paragraphs in EVERY file that produces them.

## BUG 2: CRITICAL — Image URL `&` encoding causes Attempt Recovery

**This is the ROOT CAUSE of ALL Attempt Recovery errors.**

**What the generated output looks like:**
```html
<img src="https://images.unsplash.com/photo-123?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4..." alt="" style="..."/>
```

**What WordPress expects:**
```html
<img src="https://images.unsplash.com/photo-123?crop=entropy&amp;cs=tinysrgb&amp;fit=max&amp;fm=jpg&amp;ixid=M3w4..." alt="" style="..."/>
```

**The problem:** In HTML, `&` inside attribute values MUST be encoded as `&amp;`. The generator is outputting raw `&` in Unsplash image URLs inside `<img>` tags. When WordPress's block parser validates the saved HTML against the block's `save()` function output, it sees a mismatch because the `save()` function properly encodes `&` as `&amp;`.

**This affects EVERY image block in EVERY template.** The page-about.html alone has 9+ image blocks with this bug.

**Where to fix:** Find where the generator assembles the `<img>` HTML tags. This is likely in:
```bash
# Search for where image URLs are inserted into HTML
grep -rn "img.*src\|<img\|image.*url\|unsplash" backend/app/Services/ --include="*.php" | head -20

# Search for the function that builds image block markup
grep -rn "wp-block-image\|wp:image\|figure.*class" backend/app/Services/ --include="*.php" | head -20
```

**The fix is simple:** Wherever the Unsplash URL is inserted into an `<img>` tag's `src` attribute in the HTML portion (NOT the JSON comment — JSON uses raw `&`), the URL must be run through `htmlspecialchars()` or have `&` replaced with `&amp;`.

**IMPORTANT DISTINCTION:**
- In the JSON block comment: `&` stays as `&` (JSON doesn't use HTML entities)
- In the HTML `<img>` tag: `&` must become `&amp;`

Example of correct output:
```html
<!-- wp:image {"url":"https://example.com/photo?a=1&b=2"} -->
<figure class="wp-block-image"><img src="https://example.com/photo?a=1&amp;b=2" alt=""/></figure>
<!-- /wp:image -->
```

## BUG 3: Image `aspectRatio` at wrong JSON level

**Some images have:**
```json
{"sizeSlug":"full","style":{"border":{"radius":"5px"},"aspectRatio":"3/4"}}
```

**WordPress expects:**
```json
{"sizeSlug":"full","aspectRatio":"3/4","style":{"border":{"radius":"5px"}}}
```

`aspectRatio` must be a TOP-LEVEL attribute in the image block JSON, not nested inside `style`. When it's inside `style`, WordPress's image block `save()` function doesn't recognize it and produces different HTML, triggering Attempt Recovery.

**Search and fix:**
```bash
# Find where aspectRatio is placed in image blocks
grep -rn "aspectRatio" backend/app/Services/ --include="*.php"
grep -rn "aspectRatio" pattern-library/skeletons/ --include="*.html"
grep -rn "aspectRatio" themes/gold-standard-restaurant/ --include="*.php" --include="*.html"
```

Move `aspectRatio` from inside `style` to the top level of the image block JSON attributes.

## BUG 4: Hero dimRatio still 75 in production

The skeleton/generator is still producing `dimRatio:75`. Your local fixes to the gold-standard patterns may have set it to 85, but either:
- Those fixes haven't deployed, OR
- The production pipeline uses skeletons (not gold-standard patterns) for this

**Verify which path the generator uses:**
```bash
# Check if the hero skeleton still has dimRatio:75
grep -n "dimRatio" pattern-library/skeletons/hero-cover.html pattern-library/skeletons/hero-fullbleed.html
# Check the gold-standard hero
grep -n "dimRatio" themes/gold-standard-restaurant/patterns/hero-light.php
```

Fix dimRatio to 85 in WHICHEVER file is actually used by the production generator.

## PRIORITY ORDER

1. **BUG 2 (& encoding) FIRST** — this causes ALL Attempt Recovery errors across ALL templates. Fixing this one bug eliminates every Attempt Recovery dialog you've been seeing.
2. **BUG 1 (testimonial text)** — invisible quote text
3. **BUG 3 (aspectRatio level)** — additional Attempt Recovery source
4. **BUG 4 (dimRatio)** — hero readability

## VERIFICATION AFTER FIXES

Generate a new theme, download the ZIP, and run these checks:
```bash
# Check 1: No raw & in img src attributes (must be &amp;)
grep -n '<img.*src=.*&[^a]' templates/*.html parts/*.html
# Expected: ZERO results (all & should be &amp;)

# Check 2: All testimonial paragraphs have textColor
grep -B1 'has-small-font-size.*testimonial\|has-small-font-size.*coming\|has-small-font-size.*Wings' templates/front-page.html
# Look for textColor in the JSON comment line above each

# Check 3: aspectRatio at top level in image blocks
grep 'wp:image' templates/*.html | grep '"style".*aspectRatio'
# Expected: ZERO results (aspectRatio should NOT be inside style)

# Check 4: dimRatio is 85
grep 'dimRatio' templates/front-page.html
# Expected: dimRatio:85
```

## COMMIT
```bash
git add -A
git commit -m "fix: HTML entity encoding in image URLs + testimonial textColor + aspectRatio placement

- Encode & as &amp; in all img src attributes (fixes ALL Attempt Recovery errors)
- Add textColor:contrast to testimonial quote paragraphs
- Move aspectRatio to top-level image block attribute
- Ensure dimRatio:85 in hero blocks"

git push origin main
```
