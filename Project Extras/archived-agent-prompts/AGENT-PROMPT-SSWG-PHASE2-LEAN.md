# SSWG Phase 2 — Assembly Engine

> **Branch:** `feat/phase-2-assembly-engine`
> **Prerequisite:** Phase 1 is merged (commit `560dc16`). 115 tokenized patterns + registry available.
> **Goal:** Build the core services that generate validated theme.zip files from AI content.

---

## CRITICAL CONSTRAINT — RATE LIMIT AWARENESS

Your API plan has a 30K input token/minute limit. **Do NOT load multiple large files in a single request.**

- Read reference files ONE AT A TIME, only when needed for the current task
- Do NOT pre-load all docs at start
- If you hit a rate limit, wait 60 seconds and retry

---

## WHAT ALREADY EXISTS (Phase 1 Output)

```
pattern-library/
├── TOKEN_SPEC.md              # 81 tokens defined
├── token-schema.json          # Token vocabulary with types, maxLength, required flags
├── registry.json              # 115 patterns with metadata (category, affinity, required_tokens, image_slots)
├── batch-manifest.json        # Batch processing log
└── tokenized/                 # Tokenized pattern files
    ├── ollie/                 # Primary core (most patterns)
    ├── tove/                  # Restaurant affinity
    ├── frost/                 # Minimal style affinity
    ├── spectra-one/
    └── tt4/

scripts/
├── tokenize-pattern.ts        # Single pattern tokenizer
├── tokenize-batch.ts          # Batch tokenizer
├── verify-registry.ts         # Registry validation (all pass ✅)
└── token-mappings/*.json      # Token mapping configs per core
```

**Pattern categories (115 total):** hero(16), features(15), cta(14), testimonials(10), footer(9), pricing(9), header(7), contact(6), restaurant(6), about(4), faq(4), blog(3), gallery(3), newsletter(3), numbers(3), team(3)

---

## RESOLVED DECISIONS (Do Not Reopen)

| Decision | Resolution |
|----------|-----------|
| Primary Core | **Ollie** (fallback for everything) |
| Navigation | **Paragraph links in group** — NOT `core/navigation` |
| Placeholder System | `{{TOKEN}}` string replacement via `str_replace()` |
| Validation | WordPress Playground via `@wp-playground/cli` |
| AI Model | Claude Sonnet 4 for content generation (configurable) |
| Images | Unsplash for initial testing, AI-generated later (interface-based, swappable) |
| n8n | Email ONLY — sends welcome email. NOT in critical generation path |

---

## 6 TASKS

### Task 1: PatternSelector Service

**File:** `backend/app/Services/PatternSelector.php`

Build a service that picks the best patterns for a given page specification.

**Input:** page type, vertical (e.g. restaurant), style preference (e.g. modern)
**Output:** ranked list of pattern IDs from `pattern-library/registry.json`

**Selection logic (in priority order):**
1. Category match — REQUIRED (hero request returns only hero patterns)
2. Vertical affinity — restaurant patterns score higher for restaurant sites
3. Style affinity — "minimal" preference boosts Frost patterns
4. Complexity fit — hero accepts complex, footer prefers simple

**Fallback:** If no good match, return Ollie patterns (primary core).

**Rules:**
- Read `pattern-library/registry.json` for pattern metadata
- Every page type (home, about, services, contact, blog) must return at least 4 patterns
- Unknown verticals fall back to Ollie general patterns

**Test:** `backend/tests/Unit/PatternSelectorTest.php`

**Verify:**
- [ ] Restaurant home page → returns restaurant-affinity hero + Tove patterns
- [ ] Corporate minimal → returns Frost/Ollie patterns
- [ ] Unknown vertical → Ollie fallback
- [ ] Every page type returns ≥ 4 patterns

---

### Task 2: TokenInjector Service

**File:** `backend/app/Services/TokenInjector.php`

Takes a tokenized pattern + token values, outputs final block markup.

**Input:** pattern file path, key-value map of token values
**Output:** string of final block markup with all tokens replaced

**Rules — THIS IS THE HEART OF SSWG:**
- Use `str_replace()` ONLY — no regex on block markup, no DOM parsing
- HTML-escape all injected text: `htmlspecialchars($value, ENT_QUOTES, 'UTF-8')`
- Image URLs: validate format but do NOT escape
- Validate all required tokens are provided → throw `MissingTokenException` if not
- After injection: verify no `{{` or `}}` remain in output
- Block comment JSON must be byte-identical before/after injection (tokens only appear in HTML content, never in block comments)

**Test:** `backend/tests/Unit/TokenInjectorTest.php`

**Verify:**
- [ ] Inject into `ollie/hero-light` → valid markup with real content
- [ ] Missing required token → `MissingTokenException`
- [ ] Business name with `&`, `'`, `<` → properly escaped
- [ ] Block comment JSON unchanged after injection
- [ ] Zero `{{` or `}}` remaining in output

---

### Task 3: ThemeAssembler Service

**File:** `backend/app/Services/ThemeAssembler.php`

Builds the complete theme directory from selected + injected patterns.

**Input:** project data (name, slug, colors, fonts), injected patterns
**Output:** path to assembled theme directory ready for zipping

**Assembly process:**
1. Create temp dir: `/tmp/themes/{slug}/`
2. Copy base files from Ollie: `functions.php`, `index.php`
3. Generate `style.css` with theme header (see CLAUDE.md for exact format)
4. Generate `theme.json`:
   - Start from Ollie's base `theme.json`
   - Replace color palette with user's design tokens
   - Replace font family if user selected different fonts
   - Keep spacing, layout, block styles unchanged
5. Create `templates/`:
   - `index.html` — blog pattern reference
   - `front-page.html` — header part + main group with home patterns + footer part
   - `page.html` — header + post-content + footer
   - `404.html` — simple error page
6. Create `parts/`:
   - `header.html` — selected header pattern with **paragraph-link navigation** (NOT core/navigation)
   - `footer.html` — selected footer pattern with PressPilot credit line
7. Create `patterns/` — all injected patterns registered as WP patterns (PHP files with pattern header comment)
8. Copy images to `assets/images/` if any
9. Zip the directory

**Verify:**
- [ ] "Roma Pizza" input → produces .zip
- [ ] .zip contains: style.css, theme.json, functions.php, index.php, templates/, parts/, patterns/
- [ ] theme.json has custom colors, NOT Ollie defaults
- [ ] Header uses paragraph-link navigation
- [ ] Footer has PressPilot credit
- [ ] Zero `{{TOKEN}}` strings in any file

---

### Task 4: ImageHandler Service

**File:** `backend/app/Services/ImageHandler.php`
**Interface:** `backend/app/Contracts/ImageProviderInterface.php`

**Implement two providers:**
1. `UnsplashProvider` — calls Unsplash API for stock photos (primary for testing)
2. `PlaceholderProvider` — returns `https://placehold.co/{width}x{height}` URLs (fallback)

**Logic:**
- Read image requirements from token spec (IMAGE_HERO needs 1920x800, IMAGE_FEATURE needs 800x500, etc.)
- Call provider, download images, save to `assets/images/{token_name}.jpg`
- If API fails → fall back to PlaceholderProvider
- Return map of image token → local file path

**Note:** AI image provider is a future enhancement. Build the interface so providers are swappable. Use Unsplash for now.

**Verify:**
- [ ] Restaurant context → returns relevant images
- [ ] Images are valid files (not 0-byte)
- [ ] Fallback to placeholder works when API unavailable

---

### Task 5: AIPlanner Service

**File:** `backend/app/Services/AIPlanner.php`
**Config:** `backend/config/presspilot.php`

Calls Claude API to generate content for all tokens.

**System prompt must:**
- Include token vocabulary from `pattern-library/token-schema.json` (read the file, don't hardcode)
- Specify output format: JSON object with token names as keys
- Emphasize: text content only, NO HTML, NO block markup

**User prompt:** business name, description, category, language, pages needed

**Response handling:**
- Parse JSON response
- Validate all required tokens present
- Validate values fit within maxLength constraints
- Retry up to 2 times for malformed JSON → throw `ContentGenerationException` after 2 failures

**Config:** Use Claude Sonnet 4 (model configurable in `config/presspilot.php`)

**Verify:**
- [ ] "Roma Pizza, Italian restaurant in NYC" → valid JSON with all required tokens
- [ ] Content is restaurant-relevant, not generic filler
- [ ] Token values respect maxLength from schema
- [ ] Malformed JSON triggers retry (test with mock)

---

### Task 6: Wire GenerateThemeJob

**File:** Refactor `backend/app/Jobs/GenerateThemeJob.php`

Connect all services into the generation pipeline:

```
1. AIPlanner → generate content (JSON)
2. PatternSelector → pick patterns for each page
3. TokenInjector → inject content into patterns
4. ImageHandler → source/generate images
5. ThemeAssembler → build theme directory + zip
6. PlaygroundValidator → validate output
7. Upload to Supabase storage
8. Fire n8n webhook for welcome email
```

**Also create:**
- `backend/app/Services/PlaygroundValidator.php` — wraps the Node.js validation script
- Proper error handling: if validation fails, retry once with alternative patterns

**Verify (END-TO-END):**
- [ ] `POST /api/generate` with restaurant payload → job dispatched
- [ ] Job completes → valid .zip at download URL
- [ ] .zip passes Playground validation independently
- [ ] .zip installs on WordPress without Attempt Recovery errors
- [ ] Test with 3 verticals: restaurant, corporate, portfolio
- [ ] Welcome email webhook fires

---

## CONSTRAINTS

1. **Do NOT modify pattern files** in `pattern-library/tokenized/` — those are Phase 1 output, read-only
2. **Do NOT modify scripts/** from Phase 1 — they are verified and working
3. **Navigation is paragraph-links in a group block** — NEVER use `core/navigation`
4. **Read reference files one at a time** — rate limit is 30K tokens/min
5. **All API keys in config** — never hardcoded
6. **Token replacement is `str_replace()` only** — no regex on block markup, no DOM parsing

---

## REFERENCE FILES (Read ONE AT A TIME, only when needed)

- `agent-os/sswg/PROTOCOL.md` — resolved architecture decisions
- `agent-os/sswg/PHASE-2.md` — original detailed spec
- `pattern-library/TOKEN_SPEC.md` — token definitions
- `pattern-library/token-schema.json` — token vocabulary with types/constraints
- `pattern-library/registry.json` — all 115 patterns with metadata
- `CLAUDE.md` — theme structure requirements (style.css header format, footer credit, etc.)

---

## SUCCESS CRITERIA

Phase 2 is DONE when:
1. All 6 services exist with unit tests
2. `GenerateThemeJob` wires them into a working pipeline
3. 3 different verticals (restaurant, corporate, portfolio) each produce a valid .zip
4. ALL 3 zips pass Playground validation — ZERO Attempt Recovery errors
5. Content is relevant and professional (not generic)
6. Navigation uses paragraph links in ALL themes
7. `npx tsc --noEmit` passes (if TypeScript files touched)
8. `php artisan test` passes
9. All files committed to `feat/phase-2-assembly-engine` branch
