# PHASE 1: Pattern Tokenization Engine

> **Duration:** 7-10 days | **Branch:** `feat/phase-1-tokenization`
> **Prerequisite:** Phase 0 merged. Playground validation working.
> **Goal:** Tokenize 80-100 patterns with complete placeholder vocabulary. Build the pattern registry.

---

## Task 1.1: Define Complete Token Vocabulary

**What:** Create the master token specification — every placeholder that SSWG uses.

**Steps:**
1. Create `pattern-library/TOKEN_SPEC.md` (human-readable reference)
2. Create `pattern-library/token-schema.json` (machine-readable schema)
3. Organize tokens by section type
4. Each token needs: name, type (text|image|url|color), maxLength, description, exampleValue, usedInSections[]

**Minimum token categories (aim for 70-80 tokens):**

| Category | Token Examples | Count |
|----------|---------------|-------|
| Hero | HERO_PRETITLE, HERO_TITLE, HERO_TEXT, HERO_CTA, HERO_CTA_URL, HERO_CTA_SECONDARY, HERO_IMAGE | 8-10 |
| Features/Services | FEATURES_TITLE, FEATURE_1_TITLE, FEATURE_1_TEXT, FEATURE_1_ICON, (repeat x6) | 12-15 |
| About | ABOUT_TITLE, ABOUT_TEXT, ABOUT_MISSION, ABOUT_IMAGE | 6-8 |
| Team | TEAM_TITLE, TEAM_1_NAME, TEAM_1_ROLE, TEAM_1_BIO, TEAM_1_IMAGE (repeat x4) | 8-10 |
| Testimonials | TESTIMONIALS_TITLE, TESTIMONIAL_1_TEXT, TESTIMONIAL_1_AUTHOR, TESTIMONIAL_1_ROLE (repeat x3) | 8-10 |
| Contact | CONTACT_TITLE, CONTACT_TEXT, CONTACT_EMAIL, CONTACT_PHONE, CONTACT_ADDRESS, CONTACT_HOURS | 6-8 |
| Blog | BLOG_TITLE, BLOG_INTRO | 2-4 |
| Pricing | PRICING_TITLE, PRICING_TEXT, PLAN_1_NAME, PLAN_1_PRICE, PLAN_1_FEATURES, PLAN_1_CTA (repeat x3) | 10-12 |
| CTA | CTA_TITLE, CTA_TEXT, CTA_BUTTON, CTA_BUTTON_URL | 4-6 |
| Header/Footer | BUSINESS_NAME, FOOTER_TEXT, FOOTER_COPYRIGHT, SOCIAL_LINK_1..5 | 6-8 |
| Restaurant | MENU_SECTION_1_TITLE, MENU_ITEM_1_NAME, MENU_ITEM_1_DESC, MENU_ITEM_1_PRICE, OPENING_HOURS, RESERVATION_TEXT | 8-10 |
| Images | IMAGE_HERO, IMAGE_ABOUT, IMAGE_FEATURE_1..3, IMAGE_TEAM_1..4, IMAGE_GALLERY_1..4 | 10-12 |

**Files created:**
- `pattern-library/TOKEN_SPEC.md`
- `pattern-library/token-schema.json`

**Verification:**
- [ ] token-schema.json is valid JSON
- [ ] Contains at least 70 unique tokens
- [ ] Every token has all required fields
- [ ] No duplicate token names
- [ ] See [TOKEN_SPEC_DRAFT.md](TOKEN_SPEC_DRAFT.md) for starting point

---

## Task 1.2: Build Tokenizer Script

**What:** Node.js script that converts raw proven-core patterns into tokenized versions.

**Steps:**
1. Create `scripts/tokenize-pattern.js`
2. Script takes: input pattern file path, output path, token mapping config
3. Script MUST:
   - Parse the pattern file
   - Identify text content nodes (text inside `<p>`, `<h1>`-`<h6>`, `<a>`, `<span>`, `<li>`, and `alt=""` attributes)
   - Replace identified text with appropriate `{{TOKEN}}` placeholders
   - **NEVER modify block comment JSON** (the `<!-- wp:blockname {"attr":"val"} -->` parts)
   - **NEVER modify CSS classes or inline styles**
   - **NEVER modify HTML tag structure**
   - Output the tokenized file
   - Generate a manifest listing which tokens were inserted

4. The script should have a mapping config that says: "for hero patterns, the first h1 maps to {{HERO_TITLE}}, the first p after h1 maps to {{HERO_TEXT}}" etc.

**Files created:**
- `scripts/tokenize-pattern.js`
- `scripts/token-mappings/` (config files per pattern category)

**Verification:**
- [ ] Run on `proven-cores/ollie/patterns/hero-light.php` → output has {{HERO_PRETITLE}}, {{HERO_TITLE}}, {{HERO_TEXT}}, {{HERO_CTA}} in correct positions
- [ ] Block comment JSON is byte-identical to input (diff the `<!-- wp:` lines)
- [ ] Run Playground validation on the tokenized pattern (package in minimal theme) — must still pass
- [ ] Tokens don't break block validation — this is the critical test

**CRITICAL:** Even one extra space in block comment JSON causes Attempt Recovery. The tokenizer must be surgically precise — text content only.

---

## Task 1.3: Tokenize Priority Patterns (Batch 1: 40 patterns)

**What:** Tokenize the first 40 highest-priority patterns.

**Pattern selection (40 total):**

| Category | Count | Source Selection |
|----------|-------|-----------------|
| Heroes | 6 | ollie/hero-light, ollie/hero-dark, ollie/hero-call-to-action-buttons, frost/hero-one-column, spectra-one/hero-banner, tt4/banner-hero |
| Features | 6 | ollie/feature-boxes-with-button, ollie/features-with-emojis, ollie/text-and-image-columns-with-icons, spectra-one/feature, spectra-one/feature-3, tt4/text-feature-grid-3-col |
| CTAs | 5 | ollie/text-call-to-action, ollie/card-call-to-action, spectra-one/call-to-action, spectra-one/call-to-action-2, frost/cta-button |
| Pricing | 4 | ollie/pricing-table, ollie/pricing-table-3-column, spectra-one/pricing, spectra-one/pricing-2 |
| Testimonials | 4 | ollie/testimonials-and-logos, ollie/single-testimonial, spectra-one/testimonials, tt4/testimonial-centered |
| Headers | 4 | ollie/header-light, ollie/header-dark, spectra-one/header, tove/header-horizontal |
| Footers | 4 | ollie/footer-light, ollie/footer-dark, frost/footer-default, tove/footer-horizontal |
| Contact | 3 | spectra-one/contact, spectra-one/contact-2, ollie/card-contact |
| About/Text | 2 | ollie/large-text-and-text-boxes, tt4/text-centered-statement |
| Blog | 2 | ollie/post-loop-grid-default, tt4/posts-3-col |
| Team | 2 | ollie/team-members, tt4/team-4-col |
| Restaurant | 2 | tove/restaurant-menu, tove/restaurant-opening-hours |

**Steps:**
1. Run tokenizer on each pattern
2. Place outputs in `pattern-library/tokenized/{source-core}/`
3. Create `pattern-library/batch-1-manifest.json` listing all patterns with their tokens

**Files created:**
- `pattern-library/tokenized/ollie/` (tokenized Ollie patterns)
- `pattern-library/tokenized/frost/` (tokenized Frost patterns)
- `pattern-library/tokenized/tove/` (tokenized Tove patterns)
- `pattern-library/tokenized/spectra-one/` (tokenized Spectra patterns)
- `pattern-library/tokenized/tt4/` (tokenized TT4 patterns)
- `pattern-library/batch-1-manifest.json`

**Verification:**
- [ ] 40 tokenized patterns exist in `pattern-library/tokenized/`
- [ ] ALL 40 pass Playground validation (run validate-theme script packaging each into a minimal theme)
- [ ] batch-1-manifest.json lists every pattern with its tokens, source core, and category
- [ ] No original demo text remains in tokenized patterns (only {{TOKENS}} and structural text like "Why Choose Us" section headings)

---

## Task 1.4: Tokenize Extended Patterns (Batch 2: 40-60 more)

**What:** Expand to 80-100 total tokenized patterns.

**Focus areas for Batch 2:**
- Dark/light variants of Batch 1 patterns
- Additional restaurant patterns from Tove (featured-dish, reservation, location)
- Portfolio/gallery patterns from Frost and TT4
- Newsletter/lead capture patterns
- FAQ patterns from Spectra and Tove
- Numbers/stats patterns from Ollie
- More CTA and feature variety
- Additional contact patterns from Spectra (contact-3 through contact-9)

**Files created:**
- 40-60 additional files in `pattern-library/tokenized/`
- `pattern-library/batch-2-manifest.json`

**Verification:**
- [ ] 80-100 total tokenized patterns exist
- [ ] ALL pass Playground validation
- [ ] Every category has at least 3 variants
- [ ] Restaurant category has at least 5 patterns
- [ ] Contact category has at least 5 patterns

---

## Task 1.5: Build Pattern Registry

**What:** Create the master index that the assembly engine uses to select patterns.

**Steps:**
1. Create `pattern-library/registry.json`
2. Each entry must have:
   ```json
   {
     "pattern_id": "ollie/hero-light",
     "slug": "hero-light",
     "file": "tokenized/ollie/hero-light.php",
     "category": "hero",
     "sub_type": "centered-light",
     "source_core": "ollie",
     "required_tokens": ["HERO_PRETITLE", "HERO_TITLE", "HERO_TEXT", "HERO_CTA"],
     "image_slots": ["IMAGE_HERO"],
     "vertical_affinity": ["general", "saas", "agency"],
     "style_affinity": ["modern", "clean"],
     "complexity": "moderate",
     "supports_dark": true,
     "dark_variant": "ollie/hero-dark"
   }
   ```
3. Categories: hero, features, cta, pricing, testimonials, header, footer, contact, blog, team, faq, gallery, restaurant, newsletter, about, numbers

**Files created:**
- `pattern-library/registry.json`

**Verification:**
- [ ] registry.json is valid JSON with 80-100 entries
- [ ] Every pattern file referenced in `file` field actually exists
- [ ] Every token in `required_tokens` exists in token-schema.json
- [ ] No orphan patterns (in directory but not registry)
- [ ] No ghost entries (in registry but file missing)
- [ ] Every category has at least 3 entries
- [ ] Run: `node scripts/verify-registry.js` (create this verification script)

---

## PHASE 1 CHECKPOINT

**Before moving to Phase 2, Omar must verify:**

1. ✅ TOKEN_SPEC.md covers all content needs for 5-page sites (review the token list)
2. ✅ At least 80 tokenized patterns exist and ALL pass Playground validation
3. ✅ registry.json is complete and internally consistent
4. ✅ Visual spot-check: open 5 random tokenized patterns in Playground, verify they render correctly
5. ✅ All files committed to `feat/phase-1-tokenization` branch
6. ✅ PR opened and CodeRabbit review passes

**CodeRabbit checks:**
- No original demo text remaining in tokenized patterns
- Consistent `{{TOKEN}}` naming (UPPER_SNAKE_CASE)
- Valid JSON in all manifest and registry files
- No block comment modifications (diff against originals)

**After Omar approves → Merge PR → Begin [PHASE-2.md](PHASE-2.md)**
