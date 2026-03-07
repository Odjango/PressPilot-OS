# SSWG Phase 2.7 — Pipeline Quality Fix

> **Status:** SPEC READY — awaiting agent execution
> **Priority:** CRITICAL — Phase 3 is BLOCKED until this ships
> **Date:** 2026-03-06
> **Author:** WP Factory Architect
> **Reviewed by:** Omar (product owner)

---

## 1. PROBLEM STATEMENT

The SSWG pipeline generates themes that mechanically work (ZIP, upload, install, activate) but produce **unacceptable visual quality**. Owner review of 5 generated themes reveals:

1. "Attempt Recovery" in Site Editor — block markup is invalid
2. Hero images not rendering — Cover block backgrounds show white
3. Only front-page.html has content — inner pages are empty shells
4. Footer is Ollie's, not PressPilot's branded design
5. 94-98% of page text is hardcoded Ollie content (not business-specific)
6. Site name mismatch in footer

**The old Node.js generator produced significantly better themes** (e.g., "Cozy Cup Cafe", "Coastal Cafe") because it generated ALL text content via 60+ slots and had purpose-built vertical sections. SSWG regressed by only tokenizing 81 surface-level items in copied Ollie patterns.

**Industry standard** (ZipWP, InstaWP, WordPress.com): Proven block structures + 100% AI-generated content. Every text node is dynamic.

---

## 2. ARCHITECTURE DECISION

**Approach: "Proven Skeleton + Full AI Content"**

Keep SSWG's core pipeline (AIPlanner → PatternSelector → TokenInjector → ThemeAssembler) but fix the content layer:

1. **Replace shallowly-tokenized patterns with FULLY-tokenized skeletons** — Block markup from proven themes (Ollie, Spectra, Frost), but EVERY text node is a `{{TOKEN}}`. Zero hardcoded content.
2. **Expand AI content generation** — AIPlanner generates complete page content per vertical (200+ tokens), not just 81 headlines.
3. **Build PressPilot footer** — Custom footer template matching the established 3-column design (already exists in old generator as `universal-footer.ts`).
4. **Fix ThemeAssembler** — Proper inner page templates, use patterns for about/services/contact pages (currently selected but never written to templates).
5. **Fix Cover block images** — The `extractMarkup()` strips PHP image URLs, leaving Cover blocks empty.

**What stays the same:** Laravel pipeline, Horizon workers, Supabase upload, GenerateThemeJob orchestration, retry logic.

**What changes:** Pattern files, token-schema.json, AIPlanner prompt, ThemeAssembler template generation, footer template.

---

## 3. DETAILED DESIGN

### 3.1 New Skeleton Pattern System

**Current state:** 115 patterns at 2-6% tokenization (94-98% hardcoded Ollie text).
**Target state:** ~30 skeleton patterns at 100% tokenization (zero hardcoded content).

Each skeleton is valid WordPress block markup extracted from proven themes, with every text string replaced by a token. The block grammar (element names, classes, attributes, nesting) comes from Ollie/Spectra/Frost — this is the "proven" part. The content is 100% AI-generated — this is the "smart" part.

**Section types needed (with token counts):**

| Section | Tokens | Used By |
|---------|--------|---------|
| `hero-cover` | 5-7 | All verticals |
| `hero-split` | 5-7 | All verticals |
| `about-story` | 6-8 | All verticals |
| `features-3col` | 15-18 | All verticals |
| `features-6col` | 27-30 | SaaS, Ecommerce |
| `testimonials-3col` | 12-15 | All verticals |
| `cta-banner` | 3-5 | All verticals |
| `contact-info` | 8-10 | All verticals |
| `faq-accordion` | 10-12 | All verticals |
| `pricing-3col` | 18-24 | SaaS |
| `stats-numbers` | 8-10 | SaaS, Portfolio |
| `team-grid` | 10-12 | Professional, Restaurant |
| `gallery-grid` | 6-8 | Portfolio, Restaurant |
| `menu-2col` | 16-20 | Restaurant |
| `hours-location` | 8-10 | Restaurant, Local Service |
| `product-grid` | 12-16 | Ecommerce |
| `service-areas` | 8-10 | Local Service |
| `process-steps` | 10-12 | Portfolio, Professional |
| `chef-highlight` | 6-8 | Restaurant |
| `reservation-cta` | 4-6 | Restaurant |

**Total: ~20-25 skeletons, ~200-250 tokens**

**Example skeleton (features-3col):**
```html
<!-- wp:group {"align":"full","style":{"spacing":{"padding":{"top":"var:preset|spacing|70","bottom":"var:preset|spacing|70"}}},"backgroundColor":"base-2","layout":{"type":"constrained"}} -->
<div class="wp-block-group alignfull has-base-2-background-color has-background" style="padding-top:var(--wp--preset--spacing--70);padding-bottom:var(--wp--preset--spacing--70)">

    <!-- wp:heading {"textAlign":"center","level":2} -->
    <h2 class="wp-block-heading has-text-align-center">{{FEATURES_TITLE}}</h2>
    <!-- /wp:heading -->

    <!-- wp:paragraph {"align":"center","textColor":"contrast-2"} -->
    <p class="has-text-align-center has-contrast-2-color has-text-color">{{FEATURES_SUBTITLE}}</p>
    <!-- /wp:paragraph -->

    <!-- wp:columns {"align":"wide"} -->
    <div class="wp-block-columns alignwide">
        <!-- wp:column -->
        <div class="wp-block-column">
            <!-- wp:heading {"level":3,"fontSize":"medium"} -->
            <h3 class="wp-block-heading has-medium-font-size">{{FEATURE_1_TITLE}}</h3>
            <!-- /wp:heading -->
            <!-- wp:paragraph {"textColor":"contrast-2"} -->
            <p class="has-contrast-2-color has-text-color">{{FEATURE_1_DESC}}</p>
            <!-- /wp:paragraph -->
        </div>
        <!-- /wp:column -->
        <!-- wp:column -->
        <div class="wp-block-column">
            <!-- wp:heading {"level":3,"fontSize":"medium"} -->
            <h3 class="wp-block-heading has-medium-font-size">{{FEATURE_2_TITLE}}</h3>
            <!-- /wp:heading -->
            <!-- wp:paragraph {"textColor":"contrast-2"} -->
            <p class="has-contrast-2-color has-text-color">{{FEATURE_2_DESC}}</p>
            <!-- /wp:paragraph -->
        </div>
        <!-- /wp:column -->
        <!-- wp:column -->
        <div class="wp-block-column">
            <!-- wp:heading {"level":3,"fontSize":"medium"} -->
            <h3 class="wp-block-heading has-medium-font-size">{{FEATURE_3_TITLE}}</h3>
            <!-- /wp:heading -->
            <!-- wp:paragraph {"textColor":"contrast-2"} -->
            <p class="has-contrast-2-color has-text-color">{{FEATURE_3_DESC}}</p>
            <!-- /wp:paragraph -->
        </div>
        <!-- /wp:column -->
    </div>
    <!-- /wp:columns -->
</div>
<!-- /wp:group -->
```

**Key rules for skeletons:**
- Block markup is copied from proven themes (Ollie, Spectra, Frost) — never hand-written
- Every text string is a `{{TOKEN}}` — zero hardcoded content
- Images use `{{IMAGE_TOKEN}}` in block attributes (`{"url":"{{IMAGE_HERO}}"}`)
- No PHP — these are `.html` files, not `.php`
- Use theme.json preset variables (`var:preset|spacing|70`, `var:preset|color|primary`) not hardcoded values
- All blocks properly closed, all container blocks have matching wrapper HTML elements

### 3.2 Expanded AI Content Generation

**Current AIPlanner prompt:** "Return a JSON object with token names and plain text values" + list of 81 token names.

**New approach:** Vertical-specific prompts that generate complete business content.

**New prompt structure:**
```
You are generating website content for a {category} business.

Business: {name}
Description: {description}
Pages: {pages}

Generate a JSON object with ALL of the following content. Every value must be
specific to this business — no generic placeholder text. Write as if you are the
business owner describing your actual business to customers.

HERO SECTION:
- HERO_PRETITLE: short tagline (max 60 chars)
- HERO_TITLE: main headline (max 80 chars)
- HERO_TEXT: supporting description (max 200 chars)
- HERO_CTA: primary button text (max 30 chars)
- HERO_CTA_SECONDARY: secondary button text (max 30 chars)

ABOUT SECTION:
- ABOUT_PRETITLE: section label (max 40 chars)
- ABOUT_TITLE: section headline (max 80 chars)
- ABOUT_TEXT: 2-3 sentence business story (max 400 chars)
- ABOUT_MISSION: mission statement (max 200 chars)

FEATURES/SERVICES (generate 6):
- FEATURES_TITLE: section headline
- FEATURES_SUBTITLE: section description
- FEATURE_1_TITLE through FEATURE_6_TITLE: service/feature names
- FEATURE_1_DESC through FEATURE_6_DESC: 1-2 sentence descriptions

TESTIMONIALS (generate 3):
- TESTIMONIALS_TITLE: section headline
- TESTIMONIALS_SUBTITLE: section description
- TESTIMONIAL_1_QUOTE through TESTIMONIAL_3_QUOTE: realistic customer reviews (60-120 chars each)
- TESTIMONIAL_1_NAME through TESTIMONIAL_3_NAME: realistic full names
- TESTIMONIAL_1_ROLE through TESTIMONIAL_3_ROLE: customer roles/titles

CTA SECTION:
- CTA_TITLE: call-to-action headline
- CTA_TEXT: supporting text
- CTA_BUTTON: button text

CONTACT:
- CONTACT_TITLE: section headline
- CONTACT_TEXT: section description
- CONTACT_EMAIL: business email
- CONTACT_PHONE: business phone
- CONTACT_ADDRESS: full business address
- CONTACT_HOURS: business hours

FOOTER:
- FOOTER_TAGLINE: short business tagline for footer
- FOOTER_COPYRIGHT: copyright text

{VERTICAL_SPECIFIC_TOKENS}
```

**Vertical-specific token blocks:**

**Restaurant:**
```
RESTAURANT MENU (generate 6 items in 2 categories):
- MENU_CAT_1_NAME, MENU_CAT_2_NAME: category names (e.g., "Starters", "Mains")
- MENU_ITEM_1_NAME through MENU_ITEM_6_NAME
- MENU_ITEM_1_DESC through MENU_ITEM_6_DESC: brief food descriptions
- MENU_ITEM_1_PRICE through MENU_ITEM_6_PRICE: realistic prices
- CHEF_NAME, CHEF_TITLE, CHEF_BIO: head chef info (2-3 sentences)
- RESERVATION_CTA: reservation call-to-action text
- HOURS_WEEKDAY, HOURS_WEEKEND: operating hours
```

**SaaS:**
```
PRICING (generate 3 tiers):
- PRICING_TITLE, PRICING_SUBTITLE
- PLAN_1_NAME, PLAN_1_PRICE, PLAN_1_PERIOD, PLAN_1_DESC
- PLAN_1_FEATURE_1 through PLAN_1_FEATURE_4
- (same for PLAN_2 and PLAN_3)
- STATS_1_NUMBER, STATS_1_LABEL (e.g., "99.9%", "Uptime")
- STATS_2_NUMBER, STATS_2_LABEL
- STATS_3_NUMBER, STATS_3_LABEL
```

**Ecommerce:**
```
PRODUCTS (generate 6):
- PRODUCTS_TITLE, PRODUCTS_SUBTITLE
- PRODUCT_1_NAME through PRODUCT_6_NAME
- PRODUCT_1_DESC through PRODUCT_6_DESC
- PRODUCT_1_PRICE through PRODUCT_6_PRICE
- PRODUCT_CTA: shop button text
```

**Portfolio:**
```
- PROCESS_TITLE, PROCESS_SUBTITLE
- PROCESS_1_TITLE, PROCESS_1_DESC (e.g., "Discovery", "We learn about your brand...")
- PROCESS_2_TITLE, PROCESS_2_DESC
- PROCESS_3_TITLE, PROCESS_3_DESC
- GALLERY_TITLE, GALLERY_SUBTITLE
- SKILLS_TITLE, SKILLS_SUBTITLE
```

**Local Service:**
```
- SERVICE_AREA_TITLE, SERVICE_AREA_TEXT
- SERVICE_AREA_1 through SERVICE_AREA_4: service area names
- EMERGENCY_CTA: emergency call-to-action
- LICENSE_TEXT: licensing/certification info
```

**Token count: ~200-250 total (up from 81)**

### 3.3 PressPilot Footer Template

The footer is NOT a pattern — it's a fixed template part that ThemeAssembler writes directly. This ensures consistency across all themes.

**Source:** Port `src/generator/patterns/universal-footer.ts` to PHP/HTML in ThemeAssembler. The design is already proven (Cozy Cup Cafe footer).

**Structure:**
```
┌─────────────────────────────────────────────────┐
│  [Logo]  Business Name    │  QUICK LINKS    │  GET IN TOUCH          │
│          {{FOOTER_TAGLINE}}│  {{NAV_LINKS}}  │  {{CONTACT_TEXT}}      │
│                           │                 │  [FB] [X] [IG]         │
├─────────────────────────────────────────────────┤
│  © {{YEAR}} {{BUSINESS_NAME}}. All rights reserved. Powered by PressPilot.   │
└─────────────────────────────────────────────────┘
```

**Block markup:** Use the exact markup from `universal-footer.ts` (already validated, already used in production). Convert the JS template literal to an HTML template with `{{TOKEN}}` placeholders. ThemeAssembler injects business name, tagline, navigation links, and social URLs.

### 3.4 ThemeAssembler Fixes

**A. Inner page templates:**

Currently `page.html` is just `header + wp:post-content + footer`. This is actually correct for FSE — inner pages use the `wp:post-content` block to render whatever content the page has. The problem is that there are NO pages created in WordPress — the theme doesn't include default page content.

**Fix:** Add a `patterns/` directory in the theme with registered block patterns for each page type. When the user creates an "About" page, they can insert the pattern. This is how Ollie, Spectra, and all modern FSE themes work.

Alternatively (simpler for MVP): Generate `about.html`, `services.html`, `contact.html` as custom templates with pattern content. ThemeAssembler already selects patterns for these pages — it just never writes them to template files.

**Decision: Use both approaches.**
- `page.html` stays as `header + post-content + footer` (correct FSE pattern)
- Add `templates/page-about.html`, `templates/page-services.html`, `templates/page-contact.html` with full pattern content
- Register these as custom templates in theme.json `customTemplates` array
- Add `patterns/` directory with block patterns for user customization

**B. Front-page assembly:**

Currently `patternReferences()` builds `<!-- wp:pattern {"slug":"theme/pattern-name"} /-->` references. This requires patterns to be registered via `functions.php`. Verify this registration is happening.

**C. Image handling in patterns:**

**Root cause found:** Old patterns use PHP `get_template_directory_uri()` for image paths. `extractMarkup()` strips PHP, leaving empty image references. Cover blocks end up with `{"url":""}` or missing `url` attribute entirely.

**Fix:** New skeleton patterns use `{{IMAGE_TOKEN}}` directly in block attributes:
```html
<!-- wp:cover {"url":"{{IMAGE_HERO}}","dimRatio":60} -->
```
TokenInjector replaces `{{IMAGE_HERO}}` with the actual Unsplash URL. No PHP needed since these are `.html` files.

### 3.5 Block Markup Validation

**Why "Attempt Recovery" still appears:**
The tokenized patterns were modified from their original proven-core sources (adding `{{TOKEN}}` markers). These modifications may have broken block grammar — changed attribute JSON, mismatched wrappers, or altered the block comment format that WordPress validates character-by-character.

**Fix:** After TokenInjector replaces all tokens, run a block grammar check:
1. Every `<!-- wp:blockname {json} -->` must have valid JSON attributes
2. Every opening block must have a matching closer (or be self-closing)
3. Container blocks must have matching HTML wrapper elements
4. Required attributes present (dimRatio on Cover, slug on template-part, service on social-link)

This is essentially what `BlockConfigValidator` in the old generator does. Port the validation logic to the SSWG pipeline as a post-injection check in TokenInjector or ThemeAssembler.

---

## 4. VERTICAL CONTENT RECIPES

Each vertical gets a **content recipe** — a list of sections in order that defines the homepage structure.

| Vertical | Homepage Sections (in order) |
|----------|------------------------------|
| **Restaurant** | hero-cover → about-story → menu-2col → hours-location → chef-highlight → testimonials-3col → reservation-cta → gallery-grid |
| **Ecommerce** | hero-cover → features-3col → product-grid → testimonials-3col → cta-banner |
| **SaaS** | hero-cover → features-6col → stats-numbers → pricing-3col → testimonials-3col → faq-accordion → cta-banner |
| **Portfolio** | hero-split → about-story → process-steps → gallery-grid → testimonials-3col → cta-banner |
| **Local Service** | hero-cover → features-3col → service-areas → about-story → testimonials-3col → hours-location → cta-banner |

PatternSelector uses these recipes to determine which skeleton patterns to use for each vertical.

---

## 5. FILE CHANGES SUMMARY

| File | Action | Description |
|------|--------|-------------|
| `pattern-library/skeletons/` | **CREATE** (new directory) | ~25 fully-tokenized HTML skeleton files |
| `pattern-library/skeleton-registry.json` | **CREATE** | Registry mapping skeleton IDs to files, token requirements, vertical affinity |
| `pattern-library/token-schema.json` | **REWRITE** | Expand from 81 → ~250 tokens with vertical-specific sections |
| `pattern-library/vertical-recipes.json` | **CREATE** | Section order per vertical (restaurant, ecommerce, saas, portfolio, local_service) |
| `backend/app/Services/AIPlanner.php` | **REWRITE** | Vertical-specific prompts, generate 200+ tokens, structured content generation |
| `backend/app/Services/PatternSelector.php` | **REWRITE** | Use skeleton-registry.json + vertical-recipes.json instead of old registry.json |
| `backend/app/Services/TokenInjector.php` | **MODIFY** | Add post-injection block grammar validation |
| `backend/app/Services/ThemeAssembler.php` | **MODIFY** | PressPilot footer, inner page templates, custom template registration, image path fix |
| `backend/app/Jobs/GenerateThemeJob.php` | **MODIFY** | Update orchestration for new skeleton system |

**Files NOT changed:** ImageHandler.php (works correctly), PlaygroundValidator.php (keep as-is), Supabase upload logic, Docker/Coolify config.

---

## 6. TRADE-OFF ANALYSIS

| Decision | Alternative | Why this choice |
|----------|-------------|-----------------|
| ~25 new skeletons vs. re-tokenize 115 existing | Re-tokenize all 115 patterns | Faster, cleaner. Old patterns are 94-98% hardcoded — easier to start fresh from proven block markup than surgically tokenize |
| HTML skeletons vs. PHP patterns | Keep PHP patterns with `extractMarkup()` | PHP patterns cause the image bug. HTML skeletons are simpler, directly usable, no extraction needed |
| Vertical-specific AI prompts vs. one generic prompt | Keep generic 81-token prompt | Vertical prompts generate relevant content (menus for restaurants, pricing for SaaS). Generic prompts produce generic output. |
| Fixed PressPilot footer vs. tokenized footer patterns | Multiple footer designs | Consistent brand identity. One proven footer design used by all themes. The Craft Coffee/Cozy Cup footer is already validated. |
| Custom page templates vs. block patterns only | Block patterns only | Users expect inner pages to have content out of the box. Registered patterns are a bonus for customization. |

---

## 7. SUCCESS CRITERIA

A theme generated by the fixed pipeline must:

1. **Zero "Attempt Recovery" errors** in WordPress Site Editor
2. **All hero images render** — Cover block backgrounds show actual images
3. **All text is business-specific** — zero Ollie/generic content visible
4. **Footer matches PressPilot design** — 3-column with logo, Quick Links, social icons, copyright
5. **Inner pages have content** — About, Services, Contact pages are not empty shells
6. **Comparable to Cozy Cup Cafe quality** — rich, vertical-specific content throughout
7. **Works across all 5 verticals** — restaurant, ecommerce, saas, portfolio, local_service

---

## 8. AGENT IMPLEMENTATION STEPS

> **For the coding agent.** Execute these steps IN ORDER. Each step has a clear deliverable and verification.

### STEP 1: Create Skeleton Patterns (new directory)

**Goal:** Create `pattern-library/skeletons/` with ~25 fully-tokenized HTML skeleton files.

**Process:**
1. Create directory `pattern-library/skeletons/`
2. For each section type in the table from §3.1, create an `.html` file
3. **Source block markup from proven cores** — open the corresponding pattern in `proven-cores/ollie/patterns/` or `proven-cores/spectra-one/patterns/`, copy the block structure, then replace ALL text content with `{{TOKEN}}` placeholders
4. For Cover blocks with images, use `{"url":"{{IMAGE_TOKEN}}","dimRatio":60}` in the block comment attributes — NOT PHP paths
5. Ensure every opening block has a matching closer (or is self-closing `/ -->`)
6. Ensure every container block (`wp:group`, `wp:columns`, `wp:column`, `wp:cover`) has a matching HTML wrapper element
7. Use `var:preset|spacing|*` and `var:preset|color|*` for all spacing and colors — no hardcoded pixel values or hex colors
8. **NO PHP** — these are pure HTML files
9. **NO hardcoded text** — if it's visible to the user, it must be a `{{TOKEN}}`

**Files to create:**
```
pattern-library/skeletons/
├── hero-cover.html
├── hero-split.html
├── about-story.html
├── features-3col.html
├── features-6col.html
├── testimonials-3col.html
├── cta-banner.html
├── contact-info.html
├── faq-accordion.html
├── pricing-3col.html
├── stats-numbers.html
├── team-grid.html
├── gallery-grid.html
├── menu-2col.html
├── hours-location.html
├── product-grid.html
├── service-areas.html
├── process-steps.html
├── chef-highlight.html
└── reservation-cta.html
```

**Verification:** For each file:
- `grep -c '{{' file.html` should return the expected token count
- `grep -c 'Ollie\|ollie\|theme\|starter' file.html` should return 0
- All `<!-- wp:` have matching `<!-- /wp:` (or self-closing)
- Valid JSON in all block attributes (no trailing commas, double quotes only)

### STEP 2: Create Skeleton Registry + Vertical Recipes

**Goal:** Create `pattern-library/skeleton-registry.json` and `pattern-library/vertical-recipes.json`

**skeleton-registry.json structure:**
```json
{
  "hero-cover": {
    "file": "skeletons/hero-cover.html",
    "category": "hero",
    "required_tokens": ["HERO_PRETITLE", "HERO_TITLE", "HERO_TEXT", "HERO_CTA", "HERO_CTA_SECONDARY", "IMAGE_HERO"],
    "vertical_affinity": ["general"]
  },
  "menu-2col": {
    "file": "skeletons/menu-2col.html",
    "category": "menu",
    "required_tokens": ["MENU_CAT_1_NAME", "MENU_CAT_2_NAME", "MENU_ITEM_1_NAME", "MENU_ITEM_1_DESC", "MENU_ITEM_1_PRICE", ...],
    "vertical_affinity": ["restaurant"]
  }
}
```

**vertical-recipes.json structure:**
```json
{
  "restaurant": {
    "home": ["hero-cover", "about-story", "menu-2col", "hours-location", "chef-highlight", "testimonials-3col", "reservation-cta"],
    "about": ["about-story", "chef-highlight", "team-grid"],
    "services": ["menu-2col", "gallery-grid"],
    "contact": ["contact-info", "hours-location"]
  },
  "ecommerce": {
    "home": ["hero-cover", "features-3col", "product-grid", "testimonials-3col", "cta-banner"],
    "about": ["about-story", "team-grid"],
    "services": ["product-grid", "features-3col"],
    "contact": ["contact-info"]
  },
  "saas": {
    "home": ["hero-cover", "features-6col", "stats-numbers", "pricing-3col", "testimonials-3col", "faq-accordion", "cta-banner"],
    "about": ["about-story", "team-grid", "stats-numbers"],
    "services": ["features-6col", "pricing-3col"],
    "contact": ["contact-info", "faq-accordion"]
  },
  "portfolio": {
    "home": ["hero-split", "about-story", "process-steps", "gallery-grid", "testimonials-3col", "cta-banner"],
    "about": ["about-story", "process-steps"],
    "services": ["gallery-grid", "features-3col"],
    "contact": ["contact-info"]
  },
  "local_service": {
    "home": ["hero-cover", "features-3col", "service-areas", "about-story", "testimonials-3col", "hours-location", "cta-banner"],
    "about": ["about-story", "team-grid"],
    "services": ["features-3col", "service-areas"],
    "contact": ["contact-info", "hours-location"]
  }
}
```

**Verification:** Both files must be valid JSON (no trailing commas). Every skeleton ID in recipes must exist in registry. Every token in registry must exist in token-schema.json.

### STEP 3: Expand Token Schema

**Goal:** Rewrite `pattern-library/token-schema.json` to cover ALL tokens used in skeletons.

**Process:**
1. Scan all skeleton files for `{{TOKEN_NAME}}` patterns
2. Create a comprehensive token-schema.json with every token found
3. Group tokens by section (hero, about, features, testimonials, cta, contact, footer, menu, pricing, etc.)
4. Set appropriate `maxLength` for each (headlines: 80, descriptions: 200, paragraphs: 400, prices: 20)
5. Add `vertical` field to mark vertical-specific tokens (e.g., `"vertical": "restaurant"` for MENU_* tokens)

**Verification:** Every `{{TOKEN}}` in every skeleton file has a matching entry in token-schema.json.

### STEP 4: Rewrite AIPlanner.php

**Goal:** Generate complete, vertical-specific business content.

**Changes:**
1. Load `vertical-recipes.json` to determine which sections are needed for the business category
2. Load `skeleton-registry.json` to get the `required_tokens` for each section in the recipe
3. Build a vertical-specific prompt (see §3.2 for prompt structure)
4. Only request tokens that are actually needed for the selected recipe — don't ask for MENU_* tokens for a SaaS business
5. Increase `max_tokens` to 8192 (current 4096 may not be enough for 200+ tokens)
6. Parse and validate the response — every required token must be present
7. For missing tokens, generate sensible defaults based on business name and category (e.g., missing CONTACT_EMAIL → `info@{slug}.com`)

**Key requirement:** The AI prompt must explicitly state "Write as if you ARE the business owner. Every piece of text must be specific to {business_name}. No generic placeholder text like 'Lorem ipsum' or 'Your business description here'."

**Verification:** Run AIPlanner with a test input for each vertical. Verify response contains all required tokens with business-specific content. No token value should contain "Ollie", "theme", "WordPress", "block", or other meta-references.

### STEP 5: Rewrite PatternSelector.php

**Goal:** Use skeleton registry + vertical recipes instead of old pattern registry.

**Changes:**
1. Load `skeleton-registry.json` and `vertical-recipes.json`
2. Look up the vertical recipe for the business category
3. For each page type (home, about, services, contact), return the skeleton IDs from the recipe
4. For each skeleton ID, resolve to the file path and required tokens
5. Return the selection as: `['home' => [skeleton_ids], 'about' => [skeleton_ids], ...]`

**The old offset-based retry is no longer needed** — skeletons are fixed per vertical, not scored/ranked.

**Verification:** Call PatternSelector for each of the 5 verticals. Verify it returns the correct skeleton IDs matching the recipe. Verify all referenced skeleton files exist on disk.

### STEP 6: Update TokenInjector.php

**Goal:** Inject tokens into HTML skeletons (not PHP patterns) + add block grammar validation.

**Changes:**
1. Read skeleton `.html` files directly (no `extractMarkup()` needed — they're already HTML)
2. Replace all `{{TOKEN}}` placeholders with AI-generated content from AIPlanner
3. For `{{IMAGE_*}}` tokens, replace with the Unsplash URL from ImageHandler
4. **CRITICAL:** For Cover blocks, the `{{IMAGE_TOKEN}}` appears INSIDE the block comment JSON: `<!-- wp:cover {"url":"{{IMAGE_HERO}}"} -->`. The replacement must preserve valid JSON — the URL must not contain characters that break JSON (escape if needed).
5. After all replacements, run block grammar validation:
   - Parse all `<!-- wp:blockname {json} -->` — verify JSON is valid
   - Verify all blocks are properly closed
   - Verify required attributes (dimRatio on Cover, slug on template-part, service on social-link)
   - Log warnings for any issues found
6. Strip any remaining `{{TOKEN}}` placeholders (replace with empty string + log warning)

**Verification:** Inject tokens into each skeleton. Verify output contains zero `{{TOKEN}}` markers. Verify all block comment JSON is valid. Open output in WordPress Site Editor — must show zero "Attempt Recovery" errors.

### STEP 7: Update ThemeAssembler.php

**Goal:** PressPilot footer, inner page templates, correct file structure.

**Changes:**

**A. PressPilot Footer (parts/footer.html):**
1. Replace the current `writeParts()` footer logic entirely
2. Port the footer markup from `src/generator/patterns/universal-footer.ts` to an HTML template
3. Inject: `{{BUSINESS_NAME}}`, `{{FOOTER_TAGLINE}}`, navigation links from pages array, social URLs, copyright year
4. Do NOT use any Ollie footer content
5. The footer template should be a method in ThemeAssembler that returns the HTML string

**B. Header (parts/header.html):**
1. Keep using pattern-based header OR use a clean fallback header
2. The fallback header should include: `wp:site-title` + `wp:navigation` with page links
3. Ensure the header uses the theme's color palette from theme.json

**C. Inner page templates:**
1. For each page in the recipe (about, services, contact), create a template:
   - `templates/page-about.html` — header + about-section skeletons + footer
   - `templates/page-services.html` — header + services skeletons + footer
   - `templates/page-contact.html` — header + contact skeletons + footer
2. Register as custom templates in `theme.json` under `customTemplates`:
   ```json
   "customTemplates": [
     {"name": "page-about", "title": "About", "postTypes": ["page"]},
     {"name": "page-services", "title": "Services", "postTypes": ["page"]},
     {"name": "page-contact", "title": "Contact", "postTypes": ["page"]}
   ]
   ```
3. Keep `page.html` as the generic fallback (header + post-content + footer)

**D. front-page.html:**
1. Assemble from the recipe's home section skeletons (after token injection)
2. Wrap with header template-part at top, footer template-part at bottom
3. Each section skeleton's injected HTML is placed sequentially

**E. Theme files:**
1. `style.css` — keep current header format (verified working)
2. `theme.json` — add `customTemplates` array, verify color palette and font settings
3. `functions.php` — register block patterns if using patterns directory
4. `index.php` — keep as-is (silence is golden)

**Verification:**
1. Generated theme ZIP contains: `templates/front-page.html`, `templates/page-about.html`, `templates/page-services.html`, `templates/page-contact.html`, `templates/page.html`, `templates/single.html`, `templates/404.html`, `templates/index.html`
2. `parts/footer.html` contains the PressPilot 3-column footer with business name
3. `parts/header.html` contains site-title + navigation
4. `theme.json` contains `customTemplates` array
5. No Ollie content in any file

### STEP 8: Update GenerateThemeJob.php

**Goal:** Wire the updated services together.

**Changes:**
1. Update the flow to use new services:
   - AIPlanner (now returns 200+ tokens with vertical-specific content)
   - PatternSelector (now uses skeleton-registry + vertical-recipes)
   - TokenInjector (now reads HTML skeletons, not PHP patterns)
   - ThemeAssembler (now builds PressPilot footer, inner page templates)
2. Pass the business category to PatternSelector so it can look up the vertical recipe
3. Pass the full token map to TokenInjector for each skeleton
4. Pass injected HTML sections to ThemeAssembler grouped by page type

**Verification:** Dispatch a test generation for each of the 5 verticals. Verify each produces a valid ZIP with all expected files.

### STEP 9: End-to-End Verification

**Goal:** Generate 5 themes (one per vertical) and verify quality.

**Process:**
1. Dispatch 5 test generations via `POST /api/generate` (same test data as the Mar 6 pipeline test)
2. Download all 5 ZIPs
3. Install on Local WP (wpaify-test.local)
4. For each theme, verify:
   - [ ] Zero "Attempt Recovery" in Site Editor
   - [ ] Hero image renders (Cover block background visible)
   - [ ] All text is business-specific (zero Ollie content)
   - [ ] Footer matches PressPilot design (3-column, logo, Quick Links, social, copyright)
   - [ ] About page has content (not empty header+footer)
   - [ ] Services page has content
   - [ ] Contact page has content
   - [ ] grep for "Ollie" returns zero matches
   - [ ] grep for "{{" returns zero matches (no unresolved tokens)

**Success:** All 5 themes pass all checks. Quality is comparable to Cozy Cup Cafe / Coastal Cafe.

---

## 9. RISK REGISTER

| Risk | Impact | Mitigation |
|------|--------|------------|
| AI generates inconsistent content quality across verticals | Some themes have weak copy | Add few-shot examples to vertical prompts — show sample output for each vertical |
| Block grammar breaks after token injection | "Attempt Recovery" persists | Post-injection validation in TokenInjector catches issues before ZIP creation |
| 200+ tokens exceed Claude API context limits | AI can't generate all tokens | Split into 2 API calls: base tokens + vertical-specific tokens |
| Cover block image URLs break JSON in block comments | Images still don't render | Escape URLs properly, test with actual Unsplash URLs containing special chars |
| Some skeleton patterns render differently across WP versions | Visual inconsistency | Test on WP 6.4 (theme requirement) and WP 6.9 (current Local WP) |

---

## 10. ESTIMATED EFFORT

| Step | Effort | Dependencies |
|------|--------|-------------|
| Step 1: Create skeletons | 3-4 hours | None |
| Step 2: Registry + recipes | 1 hour | Step 1 |
| Step 3: Token schema | 1 hour | Step 1 |
| Step 4: AIPlanner rewrite | 2-3 hours | Step 3 |
| Step 5: PatternSelector rewrite | 1-2 hours | Step 2 |
| Step 6: TokenInjector update | 1-2 hours | Steps 1, 3 |
| Step 7: ThemeAssembler update | 2-3 hours | Steps 1-6 |
| Step 8: GenerateThemeJob update | 1 hour | Steps 4-7 |
| Step 9: E2E verification | 2 hours | Step 8 |
| **Total** | **~15-20 hours** | Sequential |

---

## APPENDIX A: PressPilot Footer Template (Reference)

Port this proven markup from `src/generator/patterns/universal-footer.ts`:

```html
<!-- wp:group {"align":"full","style":{"spacing":{"padding":{"top":"var:preset|spacing|70","bottom":"var:preset|spacing|50"}}},"backgroundColor":"base-2","textColor":"contrast","layout":{"type":"constrained"}} -->
<div class="wp-block-group alignfull has-contrast-color has-base-2-background-color has-text-color has-background" style="padding-top:var(--wp--preset--spacing--70);padding-bottom:var(--wp--preset--spacing--50)">

    <!-- wp:columns {"align":"wide","style":{"spacing":{"blockGap":{"left":"var:preset|spacing|70"}}}} -->
    <div class="wp-block-columns alignwide">
        <!-- wp:column {"width":"33%"} -->
        <div class="wp-block-column" style="flex-basis:33%">
            <!-- wp:group {"layout":{"type":"flex","flexWrap":"nowrap","verticalAlignment":"top"}} -->
            <div class="wp-block-group">
                <!-- wp:group {"layout":{"type":"flex","orientation":"vertical","justifyContent":"left"}} -->
                <div class="wp-block-group">
                    <!-- wp:site-title {"style":{"typography":{"fontStyle":"normal","fontWeight":"700","fontSize":"1.5rem"}}} /-->
                    <!-- wp:paragraph {"fontSize":"small","textColor":"contrast-2"} -->
                    <p class="has-small-font-size has-contrast-2-color has-text-color">{{FOOTER_TAGLINE}}</p>
                    <!-- /wp:paragraph -->
                </div>
                <!-- /wp:group -->
            </div>
            <!-- /wp:group -->
        </div>
        <!-- /wp:column -->
        <!-- wp:column {"width":"33%"} -->
        <div class="wp-block-column" style="flex-basis:33%">
            <!-- wp:heading {"level":4,"textColor":"contrast","style":{"typography":{"fontWeight":"700","textTransform":"uppercase","letterSpacing":"1px"}},"fontSize":"small"} -->
            <h4 class="wp-block-heading has-small-font-size has-contrast-color has-text-color" style="font-weight:700;text-transform:uppercase;letter-spacing:1px">Quick Links</h4>
            <!-- /wp:heading -->
            <!-- wp:navigation {"overlayMenu":"never","layout":{"type":"flex","orientation":"vertical"},"style":{"spacing":{"blockGap":"0.75rem"},"typography":{"textDecoration":"underline"}},"textColor":"contrast"} -->
                {{NAV_LINKS}}
            <!-- /wp:navigation -->
        </div>
        <!-- /wp:column -->
        <!-- wp:column {"width":"33%"} -->
        <div class="wp-block-column" style="flex-basis:33%">
            <!-- wp:heading {"level":4,"textColor":"contrast","style":{"typography":{"fontWeight":"700","textTransform":"uppercase","letterSpacing":"1px"}},"fontSize":"small"} -->
            <h4 class="wp-block-heading has-small-font-size has-contrast-color has-text-color" style="font-weight:700;text-transform:uppercase;letter-spacing:1px">Get In Touch</h4>
            <!-- /wp:heading -->
            <!-- wp:paragraph {"fontSize":"small","textColor":"contrast-2"} -->
            <p class="has-small-font-size has-contrast-2-color has-text-color">Get in touch with us for more information.</p>
            <!-- /wp:paragraph -->
            <!-- wp:social-links {"iconColor":"contrast","iconColorValue":"currentColor","size":"has-normal-icon-size","style":{"spacing":{"blockGap":{"left":"var:preset|spacing|40"}}},"className":"is-style-logos-only"} -->
            <ul class="wp-block-social-links has-normal-icon-size has-icon-color is-style-logos-only">
                <!-- wp:social-link {"url":"{{SOCIAL_FACEBOOK}}","service":"facebook"} /-->
                <!-- wp:social-link {"url":"{{SOCIAL_TWITTER}}","service":"x"} /-->
                <!-- wp:social-link {"url":"{{SOCIAL_INSTAGRAM}}","service":"instagram"} /-->
            </ul>
            <!-- /wp:social-links -->
        </div>
        <!-- /wp:column -->
    </div>
    <!-- /wp:columns -->

    <!-- wp:spacer {"height":"var:preset|spacing|50"} -->
    <div style="height:var(--wp--preset--spacing--50)" aria-hidden="true" class="wp-block-spacer"></div>
    <!-- /wp:spacer -->

    <!-- wp:paragraph {"align":"center","fontSize":"small","textColor":"contrast-2"} -->
    <p class="has-text-align-center has-small-font-size has-contrast-2-color has-text-color">© {{YEAR}} {{BUSINESS_NAME}}. All rights reserved. Powered by <a href="https://www.presspilotapp.com" target="_blank" rel="noopener noreferrer" style="color:inherit">PressPilot</a>.</p>
    <!-- /wp:paragraph -->

</div>
<!-- /wp:group -->
```

---

## APPENDIX B: Cover Block Image Fix

**Problem:** Old patterns use PHP for image URLs:
```php
<?php echo esc_url( get_template_directory_uri() ); ?>/patterns/images/desktop.webp
```
`extractMarkup()` strips all PHP, leaving empty image references.

**Fix in new skeletons:**
```html
<!-- wp:cover {"url":"{{IMAGE_HERO}}","dimRatio":60,"overlayColor":"contrast","isUserOverlayColor":true,"minHeight":500,"align":"full"} -->
<div class="wp-block-cover alignfull" style="min-height:500px">
    <span aria-hidden="true" class="wp-block-cover__background has-contrast-background-color has-background-dim-60 has-background-dim"></span>
    <img class="wp-block-cover__image-background" alt="{{HERO_IMAGE_ALT}}" src="{{IMAGE_HERO}}" data-object-fit="cover"/>
    <div class="wp-block-cover__inner-container">
        <!-- hero content blocks here -->
    </div>
</div>
<!-- /wp:cover -->
```

The `{{IMAGE_HERO}}` token appears in TWO places:
1. Block comment JSON: `{"url":"{{IMAGE_HERO}}"}`
2. `<img>` tag: `src="{{IMAGE_HERO}}"`

Both are replaced by TokenInjector with the same Unsplash URL.

**TokenInjector must handle JSON-safe replacement:** If the URL contains `&` or `"`, those must be preserved correctly in the JSON context. Use a dedicated replacement for block comment attributes that ensures JSON validity.
