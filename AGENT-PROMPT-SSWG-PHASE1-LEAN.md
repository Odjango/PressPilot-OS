# SSWG Phase 1: Pattern Tokenization Engine (Lean Prompt)

## YOUR ROLE
Senior Engineer on PressPilot OS — building a pattern-assembly WordPress FSE theme generator.

## CRITICAL CONTEXT (Don't read extra files — everything you need is here)

### What is SSWG?
A paradigm shift from generating raw block markup to **assembling themes from pre-validated patterns**:
1. AI generates content JSON (text only)
2. Engine selects pre-validated patterns from proven-core themes
3. `{{TOKEN}}` placeholders get replaced with actual content
4. Theme assembled into ZIP
5. WordPress Playground validates output
6. User gets a crash-free theme

### What exists (Phase 0 done)
- `@wp-playground/cli@3.1.3` installed (devDependencies)
- `src/generator/validators/PlaygroundValidator.ts` — real CLI-based validation (Step 2D in pipeline)
- `scripts/playground/validate-theme.ts` — CLI script wrapping PlaygroundValidator
- `scripts/playground/validate-all-cores.ts` — validates all proven-core themes
- `themes/gold-standard-restaurant/` — reference theme that passes validation
- `proven-cores/` — 5 core themes with patterns:
  - `ollie/patterns/` — 98 patterns (primary core)
  - `spectra-one/patterns/` — 85 patterns
  - `twentytwentyfour/patterns/` — 56 patterns
  - `frost/patterns/` — 50 patterns
  - `tove/patterns/` — 42 patterns
- `agent-os/sswg/TOKEN_SPEC_DRAFT.md` — starting token vocabulary (read this for reference)

### Resolved Architecture Decisions (DO NOT CHANGE)
- Navigation: **Paragraph links in groups** (NOT `core/navigation` — #1 cause of Attempt Recovery)
- Token system: `{{TOKEN}}` string replacement (UPPER_SNAKE_CASE, double curly braces)
- Tokens exist ONLY in source pattern files — final output has zero tokens remaining
- **NEVER modify block comment JSON** (`<!-- wp:blockname {"attr":"val"} -->`)
- **NEVER modify CSS classes, inline styles, or HTML structure**
- Only replace TEXT CONTENT inside elements (`<p>`, `<h1>`-`<h6>`, `<a>`, `<span>`, `<li>`, `alt=""` attributes)

---

## TASKS (Execute in order)

### Task 1: Define Token Vocabulary

Create two files:

**`pattern-library/TOKEN_SPEC.md`** — Human-readable reference
**`pattern-library/token-schema.json`** — Machine-readable schema

Use `agent-os/sswg/TOKEN_SPEC_DRAFT.md` as starting point. Expand to **70-80 unique tokens** covering:

| Category | Token Prefix | Target Count |
|----------|-------------|-------------|
| Hero | `HERO_*`, `IMAGE_HERO` | 8-10 |
| Features/Services | `FEATURES_*`, `FEATURE_N_*` | 12-15 |
| About | `ABOUT_*`, `IMAGE_ABOUT` | 6-8 |
| Team | `TEAM_*`, `TEAM_N_*` | 8-10 |
| Testimonials | `TESTIMONIAL_*`, `TESTIMONIAL_N_*` | 8-10 |
| Contact | `CONTACT_*` | 6-8 |
| Pricing | `PRICING_*`, `PLAN_N_*` | 10-12 |
| CTA | `CTA_*` | 4-6 |
| Blog | `BLOG_*` | 2-4 |
| Header/Footer | `BUSINESS_NAME`, `FOOTER_*`, `SOCIAL_*` | 6-8 |
| Restaurant | `MENU_*`, `OPENING_HOURS`, `RESERVATION_*` | 8-10 |
| Images | `IMAGE_*` | 10-12 |

Each token in `token-schema.json` needs:
```json
{
  "name": "HERO_TITLE",
  "type": "text",
  "maxLength": 80,
  "description": "Main headline",
  "exampleValue": "The Best Pizza in New York",
  "usedInSections": ["hero"]
}
```

### Task 2: Build Tokenizer Script

Create `scripts/tokenize-pattern.ts` (TypeScript, runnable with `tsx`).

**Input:** Raw pattern PHP file path + token mapping config
**Output:** Tokenized pattern file with `{{TOKEN}}` placeholders + manifest

**CRITICAL RULES:**
1. Parse the pattern file to find text content nodes
2. Replace text inside `<p>`, `<h1>`-`<h6>`, `<a>`, `<span>`, `<li>`, button text, and `alt=""` attributes
3. **NEVER** modify anything inside `<!-- wp:blockname {"attr":"val"} -->` comment delimiters
4. **NEVER** modify CSS classes, inline `style=""` attributes, or HTML tag structure
5. **NEVER** modify `class="..."` attributes
6. Use a category-based mapping config (hero patterns get `HERO_*` tokens, feature patterns get `FEATURE_*` tokens, etc.)
7. Generate a manifest listing which tokens were inserted and where

**Implementation approach:**
- Read the pattern file as a string
- Use regex or parser to identify text content between HTML tags (NOT inside block comments)
- Apply token mapping based on the pattern's category + element position
- For numbered slots (features, team members, testimonials), map by position: 1st item → `_1_`, 2nd → `_2_`, etc.

Create mapping configs in `scripts/token-mappings/`:
- `hero.json` — maps h1 → HERO_TITLE, first p → HERO_TEXT, button text → HERO_CTA, etc.
- `features.json` — maps section title → FEATURES_TITLE, each feature h3 → FEATURE_N_TITLE, etc.
- `testimonials.json`, `team.json`, `pricing.json`, `contact.json`, `cta.json`, `about.json`, `blog.json`, `header.json`, `footer.json`, `restaurant.json`

### Task 3: Tokenize Batch 1 (40 Priority Patterns)

Run the tokenizer on 40 high-priority patterns. Selection:

| Category | Count | Source Patterns |
|----------|-------|----------------|
| Heroes | 6 | ollie/hero-light, ollie/hero-dark, ollie/hero-call-to-action-buttons, frost (pick 1 hero), spectra-one/hero-banner, tt4 (pick 1 hero-like) |
| Features | 6 | ollie/feature-boxes-with-button, ollie/features-with-emojis, ollie/text-and-image-columns-with-icons, spectra-one (pick 2 feature patterns), tt4 (pick 1) |
| CTAs | 5 | ollie/text-call-to-action, ollie/card-call-to-action, spectra-one (pick 2 CTA patterns), frost (pick 1 CTA) |
| Pricing | 4 | ollie/pricing-table, ollie/pricing-table-3-column, spectra-one (pick 2 pricing) |
| Testimonials | 4 | ollie/testimonials-and-logos, ollie/single-testimonial, spectra-one (pick 1), tt4 (pick 1) |
| Headers | 3 | ollie/header-light, ollie/header-dark, tove (pick 1 header) |
| Footers | 3 | ollie/footer-light, ollie/footer-dark, frost (pick 1 footer) |
| Contact | 3 | spectra-one (pick 2 contact patterns), ollie/card-contact |
| About/Text | 2 | ollie/large-text-and-text-boxes, tt4 (pick 1) |
| Team | 2 | ollie/team-members, tt4 (pick 1) |
| Restaurant | 2 | tove/restaurant-menu, tove/restaurant-opening-hours |

**Output structure:**
```
pattern-library/
├── TOKEN_SPEC.md
├── token-schema.json
├── batch-1-manifest.json
└── tokenized/
    ├── ollie/
    │   ├── hero-light.php
    │   ├── hero-dark.php
    │   └── ...
    ├── frost/
    ├── tove/
    ├── spectra-one/
    └── tt4/
```

**Validation:** For each tokenized pattern, verify the block comment JSON lines are **byte-identical** to the original. A diff of `<!-- wp:` lines between original and tokenized must show zero changes.

### Task 4: Tokenize Batch 2 (40-60 More Patterns)

Expand to **80-100 total** tokenized patterns. Focus on:
- Dark/light variants of Batch 1 patterns
- Additional restaurant patterns from Tove
- Portfolio/gallery patterns
- Newsletter/lead capture
- FAQ patterns
- Numbers/stats patterns
- More CTA and feature variety
- Additional contact patterns from Spectra

### Task 5: Build Pattern Registry

Create `pattern-library/registry.json` — the master index for the assembly engine.

Each entry:
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

Categories: hero, features, cta, pricing, testimonials, header, footer, contact, blog, team, faq, gallery, restaurant, newsletter, about, numbers

### Task 6: Build Registry Verification Script

Create `scripts/verify-registry.ts`:
- Every `file` in registry exists on disk
- Every token in `required_tokens` exists in `token-schema.json`
- No orphan patterns (files not in registry)
- No ghost entries (registry entries without files)
- Every category has at least 3 entries
- Print summary: total patterns, per-category counts, validation status

### Task 7: Validate & Commit

```bash
npx tsc --noEmit
node scripts/verify-registry.ts
# Spot-check: package 5 random tokenized patterns into a minimal theme and validate
git add -A
git commit -m "feat(sswg): Phase 1 — pattern tokenization engine with 80+ tokenized patterns"
```

---

## CONSTRAINTS

- Do NOT modify proven-core source files — always read from `proven-cores/`, write to `pattern-library/tokenized/`
- Do NOT modify existing generator code (src/generator/) — Phase 1 is a parallel system
- Do NOT modify bin/generate.ts — the tokenized patterns are a separate pipeline
- Do NOT use `core/navigation` blocks in headers — use paragraph links in flex groups
- Do NOT commit node_modules, .env, or API keys

## SUCCESS CRITERIA

- [ ] `pattern-library/TOKEN_SPEC.md` with 70-80 unique tokens documented
- [ ] `pattern-library/token-schema.json` — valid JSON, all tokens with full metadata
- [ ] `scripts/tokenize-pattern.ts` — working tokenizer that preserves block comments
- [ ] `pattern-library/tokenized/` — 80-100 tokenized patterns across 5 cores
- [ ] `pattern-library/registry.json` — complete index with metadata per pattern
- [ ] `scripts/verify-registry.ts` — passes with zero errors
- [ ] Block comment JSON in tokenized patterns is byte-identical to originals
- [ ] `npx tsc --noEmit` passes
- [ ] Git commit created

## OUTPUT

Report: files created, token count, pattern count per category, registry validation results, any issues encountered, commit hash.
