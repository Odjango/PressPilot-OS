# PHASE 2: Assembly Engine (Laravel)

> **Status: CODE COMPLETE (2026-03-04)** — All 6 services built, reviewed, cleaned up. Tests pending VPS execution.
> **Duration:** 10-14 days | **Branch:** `feat/phase-2-assembly-engine`
> **Prerequisite:** Phase 1 merged. 80-100 tokenized patterns + registry available.
> **Goal:** Build the core Laravel services that generate validated theme.zip files from AI content.

---

## Task 2.1: Create PatternSelector Service

**What:** Laravel service that picks the best patterns for a given page specification.

**Steps:**
1. Create `backend/app/Services/PatternSelector.php`
2. Input: page type, vertical, style preferences
3. Output: ranked list of pattern IDs from registry.json
4. Selection logic:
   - Category match (REQUIRED — hero returns hero patterns)
   - Vertical affinity score (restaurant patterns score higher for restaurant sites)
   - Style preference score (if user wants "minimal", Frost patterns score higher)
   - Complexity fit (hero = complex OK, footer = simple preferred)
5. Deterministic fallbacks — if no perfect match, return best available from Ollie (primary core)
6. Create `backend/tests/Unit/PatternSelectorTest.php`

**Verification:**
- [ ] `PatternSelector::selectForPage('home', 'restaurant', 'modern')` returns restaurant hero, Tove patterns
- [ ] `PatternSelector::selectForPage('home', 'corporate', 'minimal')` returns Frost/Ollie patterns
- [ ] Unknown vertical falls back to Ollie general patterns
- [ ] Every page type (home, about, services, contact, blog) returns at least 4 patterns
- [ ] Unit tests pass: `php artisan test --filter=PatternSelectorTest`

---

## Task 2.2: Create TokenInjector Service

**What:** Takes a tokenized pattern + token values, outputs final block markup.

**Steps:**
1. Create `backend/app/Services/TokenInjector.php`
2. Input: pattern file path, key-value map of token values
3. Output: string of final block markup
4. Rules:
   - ONLY replace `{{TOKEN_NAME}}` strings via `str_replace()`
   - HTML-escape all injected text values (prevent XSS): `htmlspecialchars($value, ENT_QUOTES, 'UTF-8')`
   - Validate all required tokens are provided — throw `MissingTokenException` if not
   - Image tokens: replace with provided URL (no escaping needed for URLs, but validate format)
   - After injection: verify no `{{` or `}}` remain in output
5. Create `backend/tests/Unit/TokenInjectorTest.php`

**Verification:**
- [ ] Inject hero tokens into ollie/hero-light → valid block markup with real content
- [ ] Missing required token → throws `MissingTokenException`
- [ ] HTML special chars in business name (e.g., "Tom & Jerry's Pizza") are properly escaped
- [ ] Block comment JSON is byte-identical before and after injection (diff test)
- [ ] No `{{` or `}}` remain after injection
- [ ] Unit tests pass: `php artisan test --filter=TokenInjectorTest`

**CRITICAL:** This is the heart of SSWG. It MUST be dead simple. `str_replace()` with safeguards. No regex on block markup. No parsing. No DOM manipulation. Just replace tokens.

---

## Task 2.3: Create ThemeAssembler Service

**What:** Builds the complete theme.zip from selected + injected patterns.

**Steps:**
1. Create `backend/app/Services/ThemeAssembler.php`
2. Input: project data (name, slug, colors, fonts), selected patterns (from PatternSelector), injected content (from TokenInjector)
3. Assembly process:
   a. Create temp directory: `/tmp/themes/{slug}/`
   b. Copy base files from Ollie proven-core: `functions.php`, `index.php`
   c. Generate `style.css` with theme header (name, description, version, etc.)
   d. Generate `theme.json`:
      - Start with Ollie's base theme.json
      - Replace color palette values with user's design tokens
      - Replace font family if user selected different fonts
      - Keep everything else (spacing, layout, block styles) unchanged
   e. Create `templates/` directory:
      - `index.html` — references blog pattern
      - `front-page.html` — header part + main group with selected home patterns + footer part
      - `page.html` — header + post-content + footer
      - `404.html` — simple error page
   f. Create `parts/` directory:
      - `header.html` — selected header pattern with paragraph-link navigation
      - `footer.html` — selected footer pattern with PressPilot credit
   g. Create `patterns/` directory:
      - All injected pattern files registered as WordPress patterns
   h. Copy images to `assets/images/` if any
   i. Zip the entire directory
4. Create `backend/tests/Unit/ThemeAssemblerTest.php`

**Verification:**
- [ ] Given AI spec for "Roma Pizza" restaurant: produces a .zip file
- [ ] .zip contains: style.css, theme.json, functions.php, index.php, templates/, parts/, patterns/
- [ ] theme.json has Roma Pizza's custom colors, NOT Ollie defaults
- [ ] front-page.html references patterns by correct slugs
- [ ] Header uses paragraph-link navigation
- [ ] Footer has PressPilot credit
- [ ] No `{{TOKEN}}` strings in any file within the .zip
- [ ] .zip passes Playground validation: `node scripts/playground/validate-theme.js /tmp/theme.zip`

---

## Task 2.4: Create ImageHandler Service

**What:** Handles image sourcing for generated themes.

**Steps:**
1. Create `backend/app/Services/ImageHandler.php`
2. Create `backend/app/Contracts/ImageProviderInterface.php` (interface for swappable providers)
3. Implement two providers:
   a. `AIImageProvider` — calls AI image generation API (start with placeholder, make provider swappable)
   b. `UnsplashProvider` — calls Unsplash API for stock photography
4. Service logic:
   - Receive image requirements from token spec (IMAGE_HERO needs 1920x800, IMAGE_FEATURE needs 800x500, etc.)
   - Call appropriate provider based on tier
   - Download/generate images
   - Save to temp theme directory as `assets/images/{token_name}.jpg`
   - Return map of image token → local file path
5. Fallback: if image generation fails, use placeholder from `https://placehold.co/1920x800`

**Verification:**
- [ ] Given restaurant context: generates at least 3 images (hero, about, feature)
- [ ] Images are valid files (not 0-byte, correct format)
- [ ] Image paths work when referenced in pattern markup
- [ ] Unsplash provider returns relevant images for "italian restaurant"
- [ ] Fallback to placeholder works when API is unavailable

**Note:** AI image generation provider choice needs Omar's input. Build the interface first so provider is swappable later. Use Unsplash for initial testing.

---

## Task 2.5: Create AIPlanner Service

**What:** Calls Claude API to generate content for all tokens.

**Steps:**
1. Create `backend/app/Services/AIPlanner.php`
2. Create `backend/config/presspilot.php` (API keys, model selection, etc.)
3. System prompt must:
   - Explain the token vocabulary (include token-schema.json content)
   - Specify output format (JSON matching token names)
   - Emphasize: text only, no HTML, no block markup
4. User prompt contains: business name, description, category, language, pages needed
5. Response handling:
   - Parse JSON response
   - Validate all required tokens are present
   - Validate token values fit within maxLength constraints
   - Retry logic: up to 2 retries for malformed JSON
6. Create `backend/tests/Unit/AIPlannerTest.php` (mock the API call)

**Verification:**
- [ ] Given "Roma Pizza, Italian restaurant in NYC": returns valid JSON
- [ ] JSON contains all required tokens for home, about, contact, menu, blog pages
- [ ] Content is relevant to an Italian restaurant (not generic)
- [ ] Token values respect maxLength from token-schema.json
- [ ] Malformed JSON response triggers retry (test with mock)
- [ ] After 2 failed retries, throws `ContentGenerationException`

**Note:** Use Claude Sonnet 4 for cost efficiency. Make model configurable in config/presspilot.php.

---

## Task 2.6: Wire Up GenerateThemeJob

**What:** Refactor the existing job to use all new services.

**Steps:**
1. Refactor `backend/app/Jobs/GenerateThemeJob.php`
2. Pipeline:
   ```php
   // 1. Plan content
   $content = $aiPlanner->generateContent($project);
   
   // 2. Select patterns
   $patterns = $patternSelector->selectForProject($project);
   
   // 3. Inject content into patterns
   $injectedPatterns = $tokenInjector->injectAll($patterns, $content);
   
   // 4. Handle images
   $images = $imageHandler->generateImages($project, $content);
   
   // 5. Assemble theme
   $themePath = $themeAssembler->assemble($project, $injectedPatterns, $images);
   
   // 6. Validate with Playground
   $validation = $playgroundValidator->validate($themePath);
   if (!$validation->passed) {
       // Retry once with different patterns
       $patterns = $patternSelector->selectAlternatives($project);
       // ... retry assembly ...
   }
   
   // 7. Upload to Supabase
   $downloadUrl = Storage::disk('supabase')->put($themePath);
   
   // 8. Trigger welcome email via n8n
   Http::post(config('presspilot.n8n_webhook_url'), [
       'user_email' => $project->user_email,
       'business_name' => $project->name,
       'download_url' => $downloadUrl,
   ]);
   ```
3. Create `backend/app/Services/PlaygroundValidator.php` (wraps the Node.js validation script)
4. Create `backend/app/Services/EmailNotifier.php` (sends n8n webhook for welcome email)

**Verification (END-TO-END TEST):**
- [ ] `POST /api/generate` with Roma Pizza payload → job dispatched
- [ ] `/api/status?id={jobId}` eventually returns `completed`
- [ ] Download URL works and serves a valid .zip
- [ ] Downloaded .zip passes Playground validation independently
- [ ] .zip installs on a real WordPress site without Attempt Recovery errors
- [ ] Welcome email webhook fires (check n8n execution log)
- [ ] Test with 3 different verticals: restaurant, corporate, portfolio

---

## PHASE 2 CHECKPOINT

**Before moving to Phase 3, Omar must verify:**

1. ✅ Generate themes for 3 different business types (restaurant, corporate, portfolio)
2. ✅ ALL 3 produce valid .zip files that pass Playground validation
3. ✅ Open each in Playground — ZERO Attempt Recovery errors
4. ✅ Content is relevant and professional (not generic filler)
5. ✅ Navigation uses paragraph links in ALL generated themes
6. ✅ Welcome email webhook triggers correctly
7. ✅ All files committed to `feat/phase-2-assembly-engine` branch
8. ✅ PR passes CodeRabbit review

**CodeRabbit checks:**
- Services follow single responsibility principle
- No raw block markup in PHP code (only in pattern files)
- All API keys in config, never hardcoded
- Proper error handling with retries
- Test coverage on PatternSelector, TokenInjector, ThemeAssembler

**After Omar approves → Merge PR → Begin [PHASE-3.md](PHASE-3.md)**
