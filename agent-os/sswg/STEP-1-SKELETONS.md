# STEP 1: Create Fully-Tokenized Skeleton Patterns

> **Run this task FIRST.** No dependencies on other steps.
> **Estimated effort:** 3-4 hours
> **Output directory:** `pattern-library/skeletons/`

---

## WHAT YOU'RE DOING

Creating ~20 HTML skeleton files in `pattern-library/skeletons/`. Each file is a WordPress FSE block markup section where ALL visible text is replaced with `{{TOKEN}}` placeholders. Zero hardcoded content.

## WHY

Current patterns are 94-98% hardcoded Ollie text (e.g., "Easily Customizable", "Darlene Robertson"). Only 2-6% is tokenized. These new skeletons will be 100% tokenized so every word on the theme is AI-generated business content.

## RULES (CRITICAL)

1. **Source block markup from proven cores** — open the corresponding file in `proven-cores/ollie/patterns/` or `proven-cores/spectra-one/patterns/`, copy the block structure
2. **Replace ALL visible text with `{{TOKEN_NAME}}`** — headings, paragraphs, button labels, names, roles, prices — EVERYTHING
3. **NO hardcoded text** — if a user would see it, it must be a token
4. **NO PHP** — these are pure `.html` files
5. **Cover block images use tokens in BOTH places:**
   ```html
   <!-- wp:cover {"url":"{{IMAGE_HERO}}","dimRatio":60} -->
   ...
   <img ... src="{{IMAGE_HERO}}" .../>
   ```
6. **Use CSS custom properties** — `var:preset|spacing|*` and `var:preset|color|*`, no hardcoded hex or px
7. **Inline styles are REQUIRED** — WordPress FSE needs them for block validation. Do NOT remove `style=""` attributes
8. **Every block must be properly closed** — matching `<!-- wp:name -->` with `<!-- /wp:name -->` (or self-closing `<!-- wp:name /-->`)
9. **Block attributes must be valid JSON** — double quotes, no trailing commas

## FILES TO CREATE

Create directory `pattern-library/skeletons/` then create these files:

### 1. `hero-cover.html` — Full-width hero with background image
Source from: `proven-cores/ollie/patterns/hero.php` or similar hero pattern
Tokens needed: `IMAGE_HERO`, `HERO_PRETITLE`, `HERO_TITLE`, `HERO_TEXT`, `HERO_CTA`, `HERO_CTA_SECONDARY`
Structure: `wp:cover` with image → `wp:group` inner → pretitle paragraph + h1 heading + text paragraph + buttons row

### 2. `hero-split.html` — Two-column hero (text left, image right)
Source from: `proven-cores/ollie/patterns/hero-two-column.php` or similar
Tokens: `IMAGE_HERO`, `HERO_PRETITLE`, `HERO_TITLE`, `HERO_TEXT`, `HERO_CTA`
Structure: `wp:columns` → col1: text content → col2: `wp:image`

### 3. `about-story.html` — About section with image and text
Source from: `proven-cores/ollie/patterns/card-image-and-text.php` or text-and-image pattern
Tokens: `ABOUT_TITLE`, `ABOUT_TEXT`, `ABOUT_TEXT_2`, `IMAGE_ABOUT`
Structure: `wp:group` constrained → heading + columns (text + image)

### 4. `features-3col.html` — Three feature cards
Source from: `proven-cores/ollie/patterns/feature-boxes-with-button.php`
Tokens: `FEATURES_TITLE`, `FEATURES_SUBTITLE`, `FEATURE_1_TITLE`, `FEATURE_1_TEXT`, `FEATURE_2_TITLE`, `FEATURE_2_TEXT`, `FEATURE_3_TITLE`, `FEATURE_3_TEXT`
Structure: `wp:group` → heading + subtitle + `wp:columns` (3 columns, each with heading + paragraph)

### 5. `features-6col.html` — Six feature cards in 2 rows
Tokens: `FEATURES_TITLE`, `FEATURES_SUBTITLE`, `FEATURE_1_TITLE` through `FEATURE_6_TITLE`, `FEATURE_1_TEXT` through `FEATURE_6_TEXT`
Structure: `wp:group` → heading + subtitle + `wp:columns` (3 cols) + `wp:columns` (3 cols)

### 6. `testimonials-3col.html` — Three testimonial cards
Source from: `proven-cores/ollie/patterns/card-testimonial.php` (use 3 instances)
Tokens: `TESTIMONIALS_TITLE`, `TESTIMONIAL_1_TEXT`, `TESTIMONIAL_1_NAME`, `TESTIMONIAL_1_ROLE`, `TESTIMONIAL_2_TEXT`, `TESTIMONIAL_2_NAME`, `TESTIMONIAL_2_ROLE`, `TESTIMONIAL_3_TEXT`, `TESTIMONIAL_3_NAME`, `TESTIMONIAL_3_ROLE`
Structure: `wp:group` → heading + `wp:columns` (3 columns, each with quote paragraph + name + role)

### 7. `cta-banner.html` — Call-to-action banner
Source from: `proven-cores/ollie/patterns/card-call-to-action-with-buttons.php`
Tokens: `CTA_TITLE`, `CTA_TEXT`, `CTA_BUTTON`, `CTA_BUTTON_SECONDARY`
Structure: `wp:group` with background color → heading + paragraph + buttons

### 8. `contact-info.html` — Contact information section
Source from: `proven-cores/ollie/patterns/contact-details.php`
Tokens: `CONTACT_TITLE`, `CONTACT_TEXT`, `CONTACT_ADDRESS`, `CONTACT_PHONE`, `CONTACT_EMAIL`, `CONTACT_HOURS`
Structure: `wp:group` → heading + paragraph + columns (address + phone/email + hours)

### 9. `faq-accordion.html` — FAQ section
Source from: `proven-cores/ollie/patterns/faq.php`
Tokens: `FAQ_TITLE`, `FAQ_SUBTITLE`, `FAQ_1_Q`, `FAQ_1_A`, `FAQ_2_Q`, `FAQ_2_A`, `FAQ_3_Q`, `FAQ_3_A`, `FAQ_4_Q`, `FAQ_4_A`
Structure: `wp:group` → heading + subtitle + details/summary blocks (or wp:group pairs for Q&A)

### 10. `pricing-3col.html` — Three pricing tiers
Source from: `proven-cores/ollie/patterns/card-pricing-table.php` (use 3 instances)
Tokens: `PRICING_TITLE`, `PRICING_SUBTITLE`, `PLAN_1_NAME`, `PLAN_1_PRICE`, `PLAN_1_PERIOD`, `PLAN_1_DESC`, `PLAN_1_FEATURE_1` through `PLAN_1_FEATURE_4`, same for PLAN_2 and PLAN_3, `PRICING_CTA`
Structure: `wp:group` → heading + subtitle + `wp:columns` (3 pricing cards)

### 11. `stats-numbers.html` — Statistics/numbers row
Tokens: `STATS_TITLE`, `STATS_1_NUMBER`, `STATS_1_LABEL`, `STATS_2_NUMBER`, `STATS_2_LABEL`, `STATS_3_NUMBER`, `STATS_3_LABEL`
Structure: `wp:group` with background → heading + `wp:columns` (3 columns, each with big number heading + label)

### 12. `team-grid.html` — Team members grid
Tokens: `TEAM_TITLE`, `TEAM_SUBTITLE`, `TEAM_1_NAME`, `TEAM_1_ROLE`, `TEAM_1_BIO`, `IMAGE_TEAM_1`, `TEAM_2_NAME`, `TEAM_2_ROLE`, `TEAM_2_BIO`, `IMAGE_TEAM_2`, `TEAM_3_NAME`, `TEAM_3_ROLE`, `TEAM_3_BIO`, `IMAGE_TEAM_3`
Structure: `wp:group` → heading + subtitle + `wp:columns` (3 columns with image + name + role + bio)

### 13. `gallery-grid.html` — Image gallery grid
Tokens: `GALLERY_TITLE`, `GALLERY_SUBTITLE`, `IMAGE_GALLERY_1` through `IMAGE_GALLERY_6`
Structure: `wp:group` → heading + subtitle + `wp:gallery` with 6 images

### 14. `menu-2col.html` — Restaurant menu (2 categories) [VERTICAL: restaurant]
Tokens: `MENU_TITLE`, `MENU_SUBTITLE`, `MENU_CAT_1_NAME`, `MENU_CAT_2_NAME`, `MENU_ITEM_1_NAME`, `MENU_ITEM_1_DESC`, `MENU_ITEM_1_PRICE` through item 6
Structure: `wp:group` → heading + subtitle + `wp:columns` (2 columns, each with category heading + item rows)

### 15. `hours-location.html` — Hours and location info
Tokens: `HOURS_TITLE`, `HOURS_WEEKDAY`, `HOURS_WEEKEND`, `LOCATION_ADDRESS`, `LOCATION_PHONE`, `LOCATION_TEXT`
Structure: `wp:group` → heading + `wp:columns` (hours column + location column)

### 16. `product-grid.html` — Product cards [VERTICAL: ecommerce]
Tokens: `PRODUCTS_TITLE`, `PRODUCTS_SUBTITLE`, `PRODUCT_1_NAME`, `PRODUCT_1_DESC`, `PRODUCT_1_PRICE`, `IMAGE_PRODUCT_1` through product 6, `PRODUCT_CTA`
Structure: `wp:group` → heading + subtitle + `wp:columns` (3 product cards per row, 2 rows)

### 17. `service-areas.html` — Service areas list [VERTICAL: local_service]
Tokens: `SERVICE_AREA_TITLE`, `SERVICE_AREA_TEXT`, `SERVICE_AREA_1` through `SERVICE_AREA_4`, `EMERGENCY_CTA`, `LICENSE_TEXT`
Structure: `wp:group` → heading + paragraph + columns with area names + CTA button

### 18. `process-steps.html` — Process/workflow steps [VERTICAL: portfolio]
Tokens: `PROCESS_TITLE`, `PROCESS_SUBTITLE`, `PROCESS_1_TITLE`, `PROCESS_1_DESC`, `PROCESS_2_TITLE`, `PROCESS_2_DESC`, `PROCESS_3_TITLE`, `PROCESS_3_DESC`
Structure: `wp:group` → heading + subtitle + `wp:columns` (3 numbered step cards)

### 19. `chef-highlight.html` — Chef/owner spotlight [VERTICAL: restaurant]
Tokens: `CHEF_NAME`, `CHEF_TITLE`, `CHEF_BIO`, `IMAGE_CHEF`
Structure: `wp:group` → `wp:columns` (image column + bio column with name + title + bio text)

### 20. `reservation-cta.html` — Reservation CTA [VERTICAL: restaurant]
Tokens: `RESERVATION_TITLE`, `RESERVATION_TEXT`, `RESERVATION_CTA`
Structure: `wp:group` with background → heading + paragraph + button

## VERIFICATION

After creating all files, run these checks:

```bash
# Every file has tokens (should return > 0 for each)
for f in pattern-library/skeletons/*.html; do echo "$f: $(grep -c '{{' $f) tokens"; done

# No Ollie or hardcoded content leaked through
grep -ril 'Ollie\|starter\|starter theme\|Darlene\|Robertson\|lorem ipsum\|Customizable\|Blazing Fast' pattern-library/skeletons/

# All blocks are properly closed (opening count should equal closing + self-closing count)
for f in pattern-library/skeletons/*.html; do
  opens=$(grep -c '<!-- wp:' $f)
  closes=$(grep -c '<!-- /wp:' $f)
  selfclose=$(grep -c '/-->' $f)
  echo "$f: opens=$opens closes=$closes selfclose=$selfclose"
done
```

If any file has hardcoded text or unclosed blocks, fix it before moving to Step 2.
