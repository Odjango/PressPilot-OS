# PHASE 4: WPaify Integration

> **Duration:** 10-14 days | **Branch:** `feat/phase-4-wpaify`
> **Prerequisite:** Phase 3 merged. PressPilot generation working end-to-end.
> **Goal:** Connect WPaify's HTML-to-theme conversion to the shared pattern assembly engine.

---

## Task 4.1: Build HTML Section Classifier

**What:** Service that parses uploaded HTML into logical sections.

**Steps:**
1. Create `backend/app/Services/WPaify/SectionClassifier.php`
2. Input: HTML file content (string)
3. Output: array of classified sections, each with type, HTML content, confidence score
4. Classification rules (heuristic-first, AI fallback):
   - `<header>` tag or first `<nav>` → **header** section
   - First large image area / `<section>` with background-image → **hero** section
   - Grid/columns with icons or small images → **features** section
   - `<form>` elements → **contact** section
   - `<footer>` tag → **footer** section
   - Cards with quotes or star ratings → **testimonials** section
   - Price tables / dollar signs → **pricing** section
   - Image grids without text → **gallery** section
   - Team member cards (photo + name + role) → **team** section
5. For sections with confidence < 0.6, call AI classifier (Claude) for disambiguation
6. Create `backend/tests/Unit/SectionClassifierTest.php`

**Verification:**
- [ ] Given 3 different HTML templates (restaurant, corporate, portfolio): correctly identifies 80%+ of sections
- [ ] Output includes type, raw HTML content, and confidence score for each section
- [ ] Low-confidence sections trigger AI classification
- [ ] Unit tests pass with mock HTML fixtures

---

## Task 4.2: Build Content Extractor

**What:** Extracts text content from classified HTML sections into token values.

**Steps:**
1. Create `backend/app/Services/WPaify/ContentExtractor.php`
2. Input: classified section (type + HTML content)
3. Output: key-value map of token → extracted text value
4. Extraction rules per section type:
   - **Hero:** first `<h1>` → `{{HERO_TITLE}}`, first `<p>` after h1 → `{{HERO_TEXT}}`, button text → `{{HERO_CTA}}`
   - **Features:** each feature heading → `{{FEATURE_N_TITLE}}`, each feature description → `{{FEATURE_N_TEXT}}`
   - **Contact:** email addresses → `{{CONTACT_EMAIL}}`, phone numbers → `{{CONTACT_PHONE}}`, address text → `{{CONTACT_ADDRESS}}`
   - **Footer:** copyright text → `{{FOOTER_COPYRIGHT}}`
5. Also extract design tokens from CSS:
   - Primary color (most used non-gray color) → design_tokens.primary
   - Font families → design_tokens.font_pair
   - Background colors → design_tokens.base
6. Create `backend/tests/Unit/ContentExtractorTest.php`

**Verification:**
- [ ] Given restaurant HTML: extracts business name, hero text, feature descriptions, contact info
- [ ] Extracted colors match the original site's visual palette
- [ ] All extracted values map to valid tokens from TOKEN_SPEC
- [ ] HTML entities are properly decoded in extracted text

---

## Task 4.3: Build Pattern Matcher for WPaify

**What:** Maps classified sections to the closest matching tokenized pattern.

**Steps:**
1. Create `backend/app/Services/WPaify/PatternMatcher.php`
2. Input: classified section (type + extracted content)
3. Output: best matching pattern_id from registry.json
4. Matching criteria:
   - Section category must match pattern category (required)
   - Content slot count: if section has 3 features, prefer patterns with 3 feature slots
   - Layout similarity: horizontal grid → prefer grid patterns, vertical stack → prefer stack patterns
   - Image count: if section has images, prefer patterns with image slots
5. Fallback: if no good match, use the most general pattern in that category from Ollie
6. Create `backend/tests/Unit/PatternMatcherTest.php`

**Verification:**
- [ ] Restaurant hero section → matches to appropriate hero pattern
- [ ] 3-column feature section → matches to 3-column feature pattern
- [ ] Section with no good match → falls back to Ollie general pattern
- [ ] Every classified section gets a pattern match (no unmatched sections)

**Note:** WPaify themes won't be pixel-perfect replicas of the original HTML. They capture structure + content + design intent and express them through proven WordPress patterns. This is a feature — the output is guaranteed valid FSE markup.

---

## Task 4.4: Wire WPaify Pipeline

**What:** Connect all WPaify services into a single generation job.

**Steps:**
1. Create `backend/app/Jobs/ConvertHTMLThemeJob.php`
2. Pipeline:
   ```php
   // 1. Classify sections
   $sections = $sectionClassifier->classify($uploadedHTML);
   
   // 2. Extract content from each section
   $content = $contentExtractor->extractAll($sections);
   
   // 3. Extract design tokens from CSS
   $designTokens = $contentExtractor->extractDesignTokens($uploadedCSS);
   
   // 4. Match sections to patterns
   $patterns = $patternMatcher->matchAll($sections, $content);
   
   // 5. Inject extracted content into matched patterns
   $injectedPatterns = $tokenInjector->injectAll($patterns, $content);
   
   // 6. Handle images (copy from uploaded files or use originals)
   $images = $imageHandler->processUploadedImages($uploadedFiles);
   
   // 7. Assemble theme (shared with PressPilot)
   $themePath = $themeAssembler->assemble($projectData, $injectedPatterns, $images);
   
   // 8. Validate with Playground
   $validation = $playgroundValidator->validate($themePath);
   
   // 9. Upload and deliver
   $downloadUrl = Storage::disk('supabase')->put($themePath);
   ```
3. Create WPaify API routes: `POST /api/wpaify/convert`, `GET /api/wpaify/status`
4. Create WPaify frontend upload page (or update existing)

**Verification:**
- [ ] Upload a static restaurant HTML site → receive valid WordPress theme.zip
- [ ] Theme passes Playground validation
- [ ] Content from original site appears in the WordPress theme
- [ ] Colors roughly match the original design
- [ ] Upload a corporate HTML site → same flow works
- [ ] Upload a portfolio HTML site → same flow works

---

## PHASE 4 CHECKPOINT

**Before considering SSWG MVP complete, Omar must verify:**

1. ✅ Upload 3 different static HTML sites → all produce valid WordPress themes
2. ✅ Content is correctly extracted from each
3. ✅ Themes are professional-looking (even if not pixel-perfect replicas)
4. ✅ ZERO Attempt Recovery errors in any generated theme
5. ✅ WPaify and PressPilot share the same assembly engine (TokenInjector, ThemeAssembler)
6. ✅ All files committed and PR passes review

**After Omar approves → Merge PR → SSWG MVP is complete!**

---

## Post-MVP Enhancements (Future)

These are NOT part of the current protocol but are queued for later:

- **Brand Modes:** Add 3-5 style variations using Ollie's existing system
- **WooCommerce tier:** E-commerce patterns with product grid integration
- **Multi-language:** RTL support for Arabic (already have arabic-rtl-theme reference)
- **Custom pattern upload:** Let agency users upload their own patterns to the library
- **A/B preview:** Show 2-3 theme variants side-by-side (original product vision)
