**SSWG IMPLEMENTATION PROTOCOL**

**Step-by-Step AI Agent Execution Guide**

PressPilot + WPaify \| March 2026

**How to Use This Document**

**For the AI Agent (Claude Code / Codex):** Follow each task
sequentially. Do NOT skip ahead. Each task has a verification step that
MUST pass before moving to the next task. If a task fails verification,
fix it before continuing.

**For Omar (Product Owner):** After each Phase completes, review the
agent\'s work against the verification criteria listed. Use CodeRabbit
for automated PR review on GitHub. Each phase ends with a checkpoint
where you approve or request fixes.

**For CodeRabbit (GitHub PR Review):** Each phase should be submitted as
a separate PR. Review for: file structure compliance, no hardcoded
values where tokens should be, valid JSON in all config files, and no
raw block markup generation.

**Resolved Decisions (Final)**

  ---------------------- ---------------------------------------------------------------------- ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  **Decision**           **Resolution**                                                         **Rationale**
  Primary Core Theme     Ollie (with Tove for restaurant, Frost for minimal)                    99 patterns, best token system, 7 color vars, 9 type presets. Richest library.
  Validation Engine      WordPress Playground (via \@wp-playground/cli)                         Runs in Node.js, no Docker/server needed, zero-setup, Blueprint-based config. Avoids WP Factory stability issues entirely.
  n8n Role               REMOVED from critical path. Email-only via Brevo/SendInBlue.           n8n workflows exist but add fragility. Laravel handles full pipeline. n8n ONLY sends post-generation welcome email via its existing Brevo integration.
  Navigation Approach    Option A: Paragraph links in group (NOT core/navigation)               Confirmed by FSE laws and codebase audit. core/navigation is the \#1 source of Attempt Recovery errors. All generated themes use paragraph links.
  Brand Modes            DROPPED for MVP. Implement as post-launch enhancement.                 Current focus: get one rock-solid generation pipeline working. Style variations add complexity without core value. Can add later using Ollie\'s existing style variation system.
  AI Image Generation    Required for standard tiers. Unsplash reserved for agency/bulk tier.   Standard users need AI-generated images. Agency tier users bring their own client images, so Unsplash stock is appropriate for them.
  Placeholder System     {{TOKEN}} string replacement (not QuickWP\'s PHP function approach)    Simpler to implement. QuickWP uses PHP functions (\$content-\>string()) which requires PHP runtime. {{TOKEN}} works with simple str\_replace in Laravel - no PHP execution needed.
  Pattern Count Target   80-100 tokenized patterns (up from initial 40-50)                      Omar wants maximum variety. 338 raw patterns available, tokenize the best 80-100 covering all categories and verticals.
  ---------------------- ---------------------------------------------------------------------- ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

**PHASE 0: Foundation & Playground Setup**

**Duration: 5-7 days** \| **PR Name: feat/phase-0-foundation**

**Goal:** Set up WordPress Playground as the validation engine, validate
all existing proven-core patterns, and establish the gold-standard
reference theme.

**TASK 0.1: Install WordPress Playground CLI**

**What:** Install \@wp-playground/cli in the PressPilot-OS project as a
dev dependency. Create a scripts/playground/ directory for all
Playground-related scripts.

**Files:** package.json (add devDependency), scripts/playground/

**Verification:** Run \'npx \@wp-playground/cli server\' from project
root. WordPress loads in terminal. Ctrl+C to stop. Must exit cleanly.

**NOTE:** Use Node.js 18+. The CLI runs WordPress via WebAssembly - no
PHP/MySQL/Docker needed.

**TASK 0.2: Create Validation Blueprint**

**What:** Write a Playground Blueprint JSON file that: (1) installs a
theme from a local .zip path, (2) activates it, (3) navigates to the
Site Editor, (4) checks for \'Attempt Recovery\' or block validation
errors. The blueprint should be reusable for any theme.zip.

**Files:** scripts/playground/validate-theme.blueprint.json

**Verification:** Run the blueprint with a known-good theme (e.g., Ollie
from proven-cores). It should pass. Run it with a known-bad theme (any
of the old broken themes from /themes/ that had Attempt Recovery). It
should fail.

**NOTE:** Blueprint steps: installTheme, login, navigate to
/wp-admin/site-editor.php. Use Playwright or the Playground JavaScript
API to inspect the page for error indicators.

**TASK 0.3: Build Validation Script**

**What:** Create a Node.js script that: (1) takes a theme.zip path as
argument, (2) launches Playground with the validation blueprint, (3)
activates the theme, (4) programmatically checks Site Editor for block
validation errors, (5) returns pass/fail with error details as JSON.

**Files:** scripts/playground/validate-theme.js

**Verification:** node scripts/playground/validate-theme.js
proven-cores/ollie/ should return {\"valid\": true}. Test with at least
3 known-good themes and 1 known-bad theme.

**NOTE:** This script replaces the entire WP Factory validation
requirement. It runs locally, in CI, and on the server.

**TASK 0.4: Validate All Proven Core Patterns**

**What:** Run the validation script against all 6 proven-core themes.
Build a pattern health matrix: for each theme, record pass/fail. Any
failing patterns get quarantined to proven-cores/quarantine/ with a log
of the error.

**Files:** scripts/playground/validate-all-cores.js,
proven-cores/HEALTH\_MATRIX.md

**Verification:** HEALTH\_MATRIX.md exists with pass/fail for all 6
cores. All passing themes have 0 Attempt Recovery errors. Any
quarantined patterns are documented with exact error messages.

**TASK 0.5: Build Gold Standard Reference Theme**

**What:** Manually assemble a complete 5-page restaurant theme using
ONLY patterns from Ollie + Tove. Pages: Home (hero + features +
testimonials + CTA), About (text + team), Menu (Tove restaurant
patterns), Contact (contact form pattern), Blog (post grid). Use
paragraph-link navigation (NOT core/navigation). Package as theme.zip.

**Files:** themes/gold-standard-restaurant/,
themes/gold-standard-restaurant.zip

**Verification:** Run validation script against
gold-standard-restaurant.zip. Must return {\"valid\": true} with ZERO
errors. Manually open in Playground and visually verify all 5 pages
render correctly in Site Editor with no error banners.

**NOTE:** This theme becomes the reference for what every generated
theme should look like. Take screenshots and save to
themes/gold-standard-restaurant/screenshots/.

**PHASE 0 CHECKPOINT**

**Omar reviews:** (1) Playground validation script works on at least 4
themes. (2) HEALTH\_MATRIX.md is complete. (3) Gold standard theme opens
cleanly in Playground with zero errors. (4) All files committed to
feat/phase-0-foundation branch.

**CodeRabbit reviews:** PR for feat/phase-0-foundation. Check: no
hardcoded paths, scripts are cross-platform, package.json is clean, no
committed node\_modules.

**PHASE 1: Pattern Tokenization Engine**

**Duration: 7-10 days** \| **PR Name: feat/phase-1-tokenization**

**Goal:** Tokenize 80-100 patterns from proven-cores with a complete
placeholder vocabulary. Build the pattern registry.

**TASK 1.1: Define Complete Token Vocabulary**

**What:** Create a token specification file that defines every
placeholder token, its type (text/image/url/color), which page types use
it, max length, and example values. Organize by page section.

**Files:** pattern-library/TOKEN\_SPEC.md,
pattern-library/token-schema.json

**Verification:** token-schema.json is valid JSON. Contains at least 70
unique tokens. Every token has: name, type, maxLength, description,
exampleValue, usedInSections\[\]. No duplicate token names.

**NOTE:** Token categories: Hero (8-10 tokens), Features/Services
(12-15), About/Team (8-10), Testimonials (6-8), Contact (6-8), Blog
(4-6), Pricing (8-10), CTA (4-6), Header/Footer (6-8),
Restaurant-specific (6-8), Image slots (8-10).

**TASK 1.2: Build Tokenizer Script**

**What:** Create a Node.js script that takes a raw pattern PHP file,
identifies all human-readable text content within block markup (text
inside \<p\>, \<h1\>-\<h6\>, \<a\>, \<span\> tags, and alt attributes),
and outputs a tokenized version with {{TOKEN}} placeholders. The script
should: (1) never modify block comment JSON attributes, (2) never modify
CSS classes or inline styles, (3) only replace text content nodes, (4)
generate a manifest of which tokens were inserted.

**Files:** scripts/tokenize-pattern.js

**Verification:** Run on ollie/hero-light.php: output should have
{{HERO\_PRETITLE}}, {{HERO\_TITLE}}, {{HERO\_TEXT}}, {{HERO\_CTA}} in
the correct positions. Block comment JSON must be IDENTICAL to input.
Run validation script on the tokenized pattern - it must still pass
(tokens don\'t break block validation).

**NOTE:** CRITICAL: The tokenizer MUST preserve exact whitespace in
block comments. Even one extra space in \<!\-- wp:cover
{\"dimRatio\":90} \--\> causes Attempt Recovery.

**TASK 1.3: Tokenize Priority Patterns (Batch 1: 40 patterns)**

**What:** Tokenize the first 40 patterns, prioritizing: 6 heroes (3
Ollie, 1 Frost, 1 Spectra, 1 TT4), 6 feature sections (3 Ollie, 2
Spectra, 1 TT4), 5 CTAs (2 Ollie, 2 Spectra, 1 Frost), 4 pricing (2
Ollie, 2 Spectra), 4 testimonials (2 Ollie, 1 Spectra, 1 TT4), 4 headers
(2 Ollie, 1 Spectra, 1 Tove), 4 footers (2 Ollie, 1 Frost, 1 Tove), 3
contact (Spectra), 2 about (Ollie, TT4), 2 blog (Ollie, TT4), 2 team
(Ollie, TT4), 2 restaurant (Tove).

**Files:** pattern-library/tokenized/ (40 .php files),
pattern-library/batch-1-manifest.json

**Verification:** All 40 tokenized patterns pass Playground validation
(run validate-theme script packaging each pattern into a minimal theme).
batch-1-manifest.json lists every pattern with its tokens, source core,
and category.

**TASK 1.4: Tokenize Extended Patterns (Batch 2: 40-60 more patterns)**

**What:** Tokenize remaining patterns to reach 80-100 total. Focus on:
more variety per category (dark/light variants), additional restaurant
patterns from Tove, portfolio patterns from Frost/TT4, newsletter/lead
capture patterns, FAQ patterns, and gallery patterns.

**Files:** pattern-library/tokenized/ (80-100 total .php files),
pattern-library/batch-2-manifest.json

**Verification:** All patterns pass Playground validation. Combined
manifest (pattern-library/registry.json) has 80-100 entries. Every
category has at least 3 pattern variants.

**TASK 1.5: Build Pattern Registry**

**What:** Create the master registry file that indexes all tokenized
patterns. Each entry must have: pattern\_id, slug, category, sub\_type,
source\_core, required\_tokens\[\], image\_slots,
vertical\_affinity\[\], style\_affinity\[\], complexity
(simple/moderate/complex), supports\_dark (boolean).

**Files:** pattern-library/registry.json

**Verification:** registry.json is valid JSON with 80-100 entries. Every
referenced pattern file exists in pattern-library/tokenized/. Every
token referenced in required\_tokens exists in TOKEN\_SPEC.md. No orphan
patterns (in directory but not registry) or ghost entries (in registry
but file missing).

**PHASE 1 CHECKPOINT**

**Omar reviews:** (1) TOKEN\_SPEC.md covers all content needs for 5-page
sites. (2) At least 80 tokenized patterns exist and pass validation. (3)
registry.json is complete and consistent. (4) Visual spot-check: open 5
random tokenized patterns in Playground, verify they render correctly
with placeholder text visible.

**CodeRabbit reviews:** PR for feat/phase-1-tokenization. Check: no
original demo text remaining in tokenized patterns, consistent token
naming convention, valid JSON in all manifests, no block comment
modifications.

**PHASE 2: Assembly Engine (Laravel)**

**Duration: 10-14 days** \| **PR Name: feat/phase-2-assembly-engine**

**Goal:** Build the core Laravel service that takes AI output JSON,
selects patterns, injects content, and produces a validated theme.zip.

**TASK 2.1: Create PatternSelector Service**

**What:** Laravel service class that takes a page specification (page
type, vertical, style preferences) and returns ranked list of matching
patterns from the registry. Selection criteria: (1) category match
(required), (2) vertical affinity (weighted), (3) style preference
(weighted), (4) complexity appropriate for page position (hero = complex
OK, footer = simple preferred). Must have deterministic fallbacks - if
no perfect match, select best available.

**Files:** backend/app/Services/PatternSelector.php,
backend/tests/Unit/PatternSelectorTest.php

**Verification:** Unit tests pass for: restaurant home page returns
restaurant-specific hero + Tove patterns. Corporate home returns Ollie
patterns. Unknown vertical falls back to Ollie general. Every page type
(home, about, services, contact, blog) returns at least 4 patterns.

**TASK 2.2: Create TokenInjector Service**

**What:** Laravel service class that takes a tokenized pattern file and
a key-value map of token values, performs string replacement, and
returns the final block markup. Rules: (1) ONLY replace {{TOKEN}}
strings, (2) never modify anything else, (3) validate all required
tokens are provided (fail if missing), (4) HTML-escape all injected text
values, (5) leave image tokens for separate handling.

**Files:** backend/app/Services/TokenInjector.php,
backend/tests/Unit/TokenInjectorTest.php

**Verification:** Unit tests: inject hero tokens into ollie/hero-light
produces valid block markup. Missing required token throws exception.
HTML special characters in business name are properly escaped. Block
comment JSON is byte-identical before and after injection.

**NOTE:** This is the heart of SSWG. It MUST be dead simple -
str\_replace with safeguards. No regex on block markup. No parsing. Just
replace tokens.

**TASK 2.3: Create ThemeAssembler Service**

**What:** Laravel service class that: (1) copies base theme structure
from chosen proven-core (style.css, functions.php, templates/, parts/),
(2) generates theme.json by taking Ollie\'s base theme.json and swapping
color palette values with user\'s design tokens, (3) assembles
tokenized+injected patterns into theme\'s patterns/ directory, (4)
builds header.html and footer.html parts using selected header/footer
patterns with paragraph-link navigation (NOT core/navigation), (5)
creates front-page.html template that references the selected patterns
by slug, (6) packages everything as .zip.

**Files:** backend/app/Services/ThemeAssembler.php,
backend/tests/Unit/ThemeAssemblerTest.php

**Verification:** Given a complete AI spec JSON for \'Roma Pizza\'
restaurant: produces a .zip file containing valid theme structure
(style.css, theme.json, functions.php, templates/, parts/, patterns/).
theme.json has Roma Pizza\'s colors, not Ollie defaults. patterns/
contains injected patterns with Roma Pizza content. front-page.html
references patterns by correct slugs. The .zip passes Playground
validation.

**TASK 2.4: Create ImageHandler Service**

**What:** Laravel service that handles image sourcing: (1) For standard
tiers: calls AI image generation API (provider TBD - Anthropic,
Stability, or DALL-E) with business context to generate hero images,
about images, feature images, (2) For agency tier: uses Unsplash API for
stock photography, (3) Downloads/generates images, places them in
theme\'s assets/images/ directory, (4) Updates image token values in
patterns to reference local paths.

**Files:** backend/app/Services/ImageHandler.php

**Verification:** Given a restaurant business context: generates at
least 3 images (hero, about, feature). Images are valid JPG/WebP files.
Image paths in assembled patterns point to existing files in the
theme.zip. For agency tier: Unsplash images download successfully and
are properly attributed.

**NOTE:** Image generation API choice needs Omar\'s input on
provider/budget. Build the interface first, make provider swappable.

**TASK 2.5: Create AIPlanner Service**

**What:** Laravel service that calls Claude API (or configurable LLM)
with business info and gets back the content JSON spec. Prompt
engineering: (1) System prompt explains the token vocabulary and output
format, (2) User prompt contains business name, description, category,
language, (3) Response must be valid JSON matching the token schema, (4)
Retry logic for malformed JSON (max 2 retries).

**Files:** backend/app/Services/AIPlanner.php,
backend/config/presspilot.php

**Verification:** Given \'Roma Pizza, Italian restaurant in NYC\':
returns valid JSON with all required tokens for home, about, contact,
menu, blog pages. Content is relevant to an Italian restaurant (not
generic corporate). Token values fit within maxLength constraints from
TOKEN\_SPEC.

**NOTE:** Use Claude Sonnet for cost efficiency on content generation.
Opus only if quality issues arise.

**TASK 2.6: Wire Up GenerateThemeJob**

**What:** Refactor the existing GenerateThemeJob to use the new
services: (1) AIPlanner generates content, (2) PatternSelector picks
patterns, (3) TokenInjector fills content, (4) ImageHandler adds images,
(5) ThemeAssembler builds .zip, (6) Playground validates, (7) Upload to
Supabase, (8) Return download URL. Also wire the welcome email: after
successful generation, trigger n8n webhook for Brevo welcome email.

**Files:** backend/app/Jobs/GenerateThemeJob.php (refactored),
backend/app/Services/EmailNotifier.php

**Verification:** Full end-to-end test: POST /api/generate with Roma
Pizza payload. Job completes. /api/status returns completed with
download URL. Downloaded .zip passes Playground validation. Welcome
email is triggered (verify in n8n execution log).

**NOTE:** n8n only handles the welcome email. All generation logic is in
Laravel. The n8n webhook just receives: {user\_email, business\_name,
download\_url}.

**PHASE 2 CHECKPOINT**

**Omar reviews:** (1) Generate a theme for a restaurant, a corporate
business, and an ecommerce store. All 3 must produce valid themes. (2)
Open each in Playground - zero Attempt Recovery errors. (3) Content is
relevant and professional. (4) Welcome email arrives. (5) Navigation
uses paragraph links, not core/navigation.

**CodeRabbit reviews:** PR for feat/phase-2-assembly-engine. Check:
services follow single responsibility, no raw block markup in PHP code
(only in pattern files), all API keys in config not hardcoded, proper
error handling with retries, test coverage on critical paths.

**PHASE 3: Frontend Integration & End-to-End**

**Duration: 7-10 days** \| **PR Name:
feat/phase-3-frontend-integration**

**Goal:** Connect the Next.js frontend to the new assembly engine. Full
user flow working.

**TASK 3.1: Update Studio/Dashboard to Use New API**

**What:** The existing /app/studio/ page collects business info. Update
it to send the payload format expected by the new GenerationController.
Ensure palette selection, font selection, business category, and all
contact fields are properly mapped.

**Files:** app/studio/page.tsx (updated), app/api/ routes (updated if
needed)

**Verification:** User can fill out the Studio form, click generate, see
progress indicator, and receive download link. The full flow works
end-to-end from browser to .zip download.

**TASK 3.2: Add Preview Component**

**What:** Build a preview component that loads the generated theme in an
embedded WordPress Playground instance using Playground\'s iframe API.
User generates theme, then sees a live preview before downloading.

**Files:** app/components/ThemePreview.tsx

**Verification:** After generation: preview loads within 10 seconds
showing the actual generated theme in a working WordPress instance. User
can navigate between pages in the preview. Preview uses Playground\'s
startPlaygroundWeb() to embed.

**NOTE:** This replaces the old WP Factory preview. Playground preview
runs entirely in the user\'s browser - no server resources consumed.

**TASK 3.3: Image Tier Integration**

**What:** Implement the image sourcing tier logic in the frontend:
Standard tier shows \'AI-generated images\' messaging. Agency tier shows
Unsplash image selection interface where users can search/pick images
before generation.

**Files:** app/studio/ (updated for tier logic)

**Verification:** Standard tier: generates with AI images automatically.
Agency tier: shows Unsplash picker, user selects images, those images
are used in the generated theme.

**TASK 3.4: Error Handling & Retry Flow**

**What:** Handle all failure cases gracefully: (1) AI content generation
fails - retry with backoff, (2) Image generation fails - fall back to
placeholder images, (3) Playground validation fails - log error, retry
assembly once with different pattern selection, (4) Network errors -
show retry button to user.

**Files:** Multiple files across frontend and backend

**Verification:** Simulate each failure case. User always sees a helpful
message. No unhandled errors. Retry mechanisms work. Fallback images are
acceptable quality.

**PHASE 3 CHECKPOINT**

**Omar reviews:** (1) Complete user journey: visit site, fill form,
generate, preview, download. Works for 3 different business types. (2)
Preview shows actual theme in Playground. (3) Downloaded .zip installs
on a real WordPress site without errors. (4) Error states show graceful
messages.

**PHASE 4: WPaify Integration**

**Duration: 10-14 days** \| **PR Name: feat/phase-4-wpaify**

**Goal:** Connect WPaify\'s HTML-to-theme conversion to the shared
pattern assembly engine.

**TASK 4.1: Build HTML Section Classifier**

**What:** Service that takes uploaded HTML file(s), parses them into
logical sections (header, hero, features, about, contact, footer, etc.)
using heuristic rules: (1) \<header\> tag or first nav = header section,
(2) First large image/cover area = hero, (3) Grid/columns with
icons/images = features, (4) Form elements = contact, (5) \<footer\> tag
= footer. For ambiguous sections, call AI classifier.

**Files:** backend/app/Services/WPaify/SectionClassifier.php

**Verification:** Given 3 different HTML templates (restaurant,
corporate, portfolio): correctly identifies at least 80% of sections.
Produces a section manifest with type, content, and confidence score for
each.

**TASK 4.2: Build Content Extractor**

**What:** Service that takes classified HTML sections and extracts text
content into token values. Maps: (1) First \<h1\> in hero section to
{{HERO\_TITLE}}, (2) First \<p\> after hero heading to {{HERO\_TEXT}},
(3) Button text to {{HERO\_CTA}}, (4) Feature headings/descriptions to
{{FEATURE\_N\_TITLE}}/{{FEATURE\_N\_TEXT}}, (5) Contact info to contact
tokens. Also extracts CSS design tokens: primary color, fonts, spacing
values.

**Files:** backend/app/Services/WPaify/ContentExtractor.php

**Verification:** Given a restaurant HTML site: extracts business name,
hero text, feature descriptions, contact info into correct token values.
Extracted colors match the original site\'s palette.

**TASK 4.3: Build Pattern Matcher for WPaify**

**What:** Service that takes classified+extracted sections and finds the
closest matching tokenized pattern for each. Uses: (1) section category
from classifier, (2) content slot count match (section has 3 features,
find pattern with 3 feature slots), (3) layout similarity (horizontal
grid vs vertical stack).

**Files:** backend/app/Services/WPaify/PatternMatcher.php

**Verification:** Given extracted sections from a restaurant site:
matches hero to an appropriate hero pattern, features to a features
pattern, etc. Every section gets a pattern match (fallback to general
patterns for unknown sections).

**NOTE:** WPaify themes won\'t be pixel-perfect replicas. They capture
structure + content + design intent and express them through proven
patterns. This is a feature, not a bug.

**TASK 4.4: Wire WPaify Pipeline**

**What:** Connect all WPaify services into a single pipeline: Upload
HTML/CSS/JS/images, Classify sections, Extract content + design tokens,
Match patterns, Inject content via TokenInjector, Assemble theme via
ThemeAssembler, Validate via Playground, Deliver .zip.

**Files:** backend/app/Jobs/ConvertHTMLThemeJob.php

**Verification:** Upload a static restaurant HTML site. Receive a valid
WordPress FSE theme.zip. Theme passes Playground validation. Content
from original site appears in the WordPress theme. Colors roughly match
the original.

**PHASE 4 CHECKPOINT**

**Omar reviews:** (1) Upload 3 different static HTML sites. All produce
valid WordPress themes. (2) Content is correctly extracted. (3) Themes
are professional-looking even if not pixel-perfect replicas. (4) Zero
Attempt Recovery errors in any generated theme.

**Quality Gates & Review Process**

**Every Generated Theme Must Pass:**

**Gate 1 - Structural:** Theme.zip contains required files: style.css,
theme.json, functions.php, templates/index.html, templates/page.html,
parts/header.html, parts/footer.html, at least 1 pattern file.

**Gate 2 - Schema:** theme.json validates against WordPress theme.json
schema v3. All color palette slugs exist. Font family definitions are
valid.

**Gate 3 - Block Markup:** Every pattern file has matching
opening/closing block comments. All block comment JSON is valid. No
orphan closing tags.

**Gate 4 - Playground:** Theme installs and activates in Playground
without errors. Site Editor loads all templates without \'Attempt
Recovery\' banners. All pages render.

**Gate 5 - Content:** No {{TOKEN}} placeholders remain in the final
output. No original demo text from proven-cores remains. Business name
appears in header. Navigation links work.

**Review Workflow**

**1.** Agent creates branch: feat/phase-N-description

**2.** Agent commits work, pushes to GitHub

**3.** Agent opens PR with description of what was done and which tasks
are complete

**4.** CodeRabbit runs automated review on the PR

**5.** Omar reviews: runs the verification steps listed in each task

**6.** If all checks pass: merge PR, move to next phase

**7.** If checks fail: agent fixes issues on the same branch, pushes
again

**Forbidden Practices (Agent MUST NOT)**

-   Generate raw block markup from scratch - ONLY use tokenized patterns
    from proven-cores

-   Use core/navigation block in header/footer parts - ONLY paragraph
    links in group

-   Hardcode hex colors in patterns - ONLY use semantic palette slugs
    (has-primary-color, etc.)

-   Hardcode pixel spacing - ONLY use theme.json preset references
    (var:preset\|spacing\|large)

-   Modify block comment JSON attributes during token injection - ONLY
    replace text content

-   Skip Playground validation before marking a theme as complete

-   Use n8n for generation logic - n8n ONLY handles welcome email
    notification

-   Commit API keys, secrets, or .env files to the repository
