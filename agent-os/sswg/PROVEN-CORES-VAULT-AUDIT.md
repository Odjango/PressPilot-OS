**PROVEN CORES VAULT AUDIT**

**& SSWG Gap Analysis**

PressPilot + WPaify Architecture Deep Dive

March 2026 \| Confidential

**For:** Omar (Product Owner, PressPilot / WPaify)

**Purpose:** Complete inventory of proven cores vault assets, gap
analysis against SSWG requirements, and actionable engineering roadmap.

**Based on:** Full source audit of PressPilot-OS repo (393 commits),
plugin v6.3, proven-cores/ directory, backend Laravel pipeline, and
QuickWP open-source reference.

**Part 1: Proven Cores Vault Inventory**

The /proven-cores/ directory contains 6 open-source FSE themes curated
as source material for pattern extraction. This is the foundation
everything builds on.

**1.1 Core Themes Overview**

  -------------------- -------------- ------------------------------ ----------------------------- --------------------------------------------------------- ----------------------
  **Core Theme**       **Patterns**   **Style Vars**                 **Templates**                 **Strength**                                              **SSWG Status**
  Ollie                99 patterns    7 colors + 9 type + 4 styles   8 templates                   SaaS/Startup, richest pattern library                     PRIMARY CORE - READY
  Spectra One          86 patterns    7 colors + 6 styles            9 templates                   General business, WooCommerce-ready                       READY
  Twenty Twenty-Four   58 patterns    3 style variations             Portfolio + Blog + Business   Portfolio, editorial, official WP core theme              READY
  Frost                51 patterns    All have dark/light variants   9 templates (incl. blank)     Minimal/portfolio, light+dark pairs                       READY
  Tove                 43 patterns    No color vars                  5 templates                   Restaurant-specific patterns (menu, hours, reservation)   READY
  Blockbase            1 pattern      3 style vars                   8 templates                   Automattic\'s base theme for child themes                 MINIMAL - BASE ONLY
  -------------------- -------------- ------------------------------ ----------------------------- --------------------------------------------------------- ----------------------

**Total available patterns: 338** across all cores.

**Total unique pattern categories:** Heroes (18+), Features (15+), CTAs
(20+), Pricing (12+), Testimonials (10+), Headers (15+), Footers (18+),
Blog/Posts (12+), Contact (10+), Team (5+), FAQ (4+), Portfolio/Gallery
(8+)

**1.2 Placeholder Token System**

The /proven-cores/prepared/ directory contains tokenized copies of all 6
themes. Patterns have {{PLACEHOLDER}} tokens injected at content
insertion points. Current tokens discovered:

  ------------------------ --------------------- ------------------------------------
  **Token**                **Used In**           **Purpose**
  {{HERO\_TITLE}}          Hero patterns         Main headline text
  {{HERO\_PRETITLE}}       Hero patterns         Eyebrow/label text above headline
  {{HERO\_TEXT}}           Hero patterns         Subheadline / description
  {{HERO\_CTA}}            Hero buttons          Primary call-to-action button text
  {{BUSINESS\_NAME}}       Headers, footers      Site name / brand
  {{SERVICES\_TITLE}}      Feature sections      Section heading
  {{SERVICES\_TEXT}}       Feature sections      Section description
  {{PRICING\_TITLE}}       Pricing tables        Pricing section heading
  {{PRICING\_TEXT}}        Pricing tables        Plan descriptions
  {{PRICING\_CTA}}         Pricing buttons       Pricing button text
  {{FAQ\_TITLE}}           FAQ sections          FAQ section heading
  {{NEWSLETTER\_TITLE}}    Newsletter sections   Newsletter heading
  {{NEWSLETTER\_TEXT}}     Newsletter sections   Newsletter description
  {{NEWSLETTER\_BUTTON}}   Newsletter CTA        Subscribe button text
  ------------------------ --------------------- ------------------------------------

**Critical Finding: Token Coverage Gap**

**PROBLEM:** Only 14 unique tokens exist. The patterns contain many more
text insertion points that still have original Ollie/Frost/etc. demo
text hardcoded. A full SSWG implementation needs approximately 60-80
unique tokens to cover all content slots across page types.

**MISSING tokens needed:** {{ABOUT\_TITLE}}, {{ABOUT\_TEXT}},
{{TEAM\_MEMBER\_NAME}}, {{TEAM\_MEMBER\_ROLE}}, {{TESTIMONIAL\_TEXT}},
{{TESTIMONIAL\_AUTHOR}}, {{CONTACT\_TITLE}}, {{CONTACT\_TEXT}},
{{FEATURE\_N\_TITLE}}, {{FEATURE\_N\_TEXT}}, {{BLOG\_TITLE}},
{{FOOTER\_TEXT}}, {{FOOTER\_COPYRIGHT}}, {{SOCIAL\_LINKS}},
{{IMAGE\_HERO}}, {{IMAGE\_ABOUT}}, {{IMAGE\_FEATURE\_N}},
{{COLOR\_PRIMARY}}, {{COLOR\_SECONDARY}}, and more.

**1.3 Design Token System (theme.json)**

Ollie\'s theme.json is the most sophisticated, using a semantic color
palette with 11 named slots:

  ---------------- ------------------- ------------------- -----------------------------------------------
  **Slug**         **Semantic Name**   **Default Value**   **Role**
  primary          Brand               \#5344F4            Primary brand color - buttons, accents, links
  primary-accent   Brand Accent        \#e9e7ff            Lighter brand for hover states, badges
  primary-alt      Brand Alt           \#DEC9FF            Alternative accent for variety
  main             Contrast            \#1E1E26            Text color / dark backgrounds
  base             Base                \#ffffff            Page background
  secondary        Base Accent         \#545473            Muted text, captions
  tertiary         Tint                \#f8f7fc            Section alternate backgrounds
  border-light     Border Base         \#E3E3F0            Light mode borders
  border-dark      Border Contrast     \#4E4E60            Dark mode borders
  ---------------- ------------------- ------------------- -----------------------------------------------

**Ollie also provides:** 7 pre-built color variations (blue, green,
neon, orange, pink, red, teal), 9 typography presets, 4 style variations
(agency, creator, startup, studio), and 7 fluid spacing sizes using
clamp().

**This is exactly the system SSWG needs.** Instead of building a color
system from scratch, SSWG can adopt Ollie\'s 11-slot semantic palette
and swap color values per brand/style.

**1.4 Pattern Architecture (How They Actually Work)**

Every pattern in proven-cores is a PHP file with a standardized header
comment and pure WordPress block markup:

**Pattern Anatomy (from ollie/hero-light.php):**

The pattern file contains: (1) PHP header with Title, Slug, Categories,
Keywords, (2) Pure block markup with correctly nested opening/closing
comments, (3) Semantic color references like **has-primary-color** and
**has-base-background-color** (not hardcoded hex), (4) Spacing via
**var:preset\|spacing\|xx-large** (not px values), (5) Correct class
chains like **wp-block-button\_\_link wp-element-button**.

**Page Composition Pattern (from ollie/page-home.php):**

Pages are composed by referencing pattern slugs: **\<!\-- wp:pattern
{\"slug\":\"ollie/hero-text-image-and-logos\"} /\--\>**. This is the
exact same approach WordPress.com and QuickWP use. The page template is
just a list of pattern references.

**KEY INSIGHT:** These patterns are ALREADY validated. They came from
shipping themes with thousands of active installs. They work in the Site
Editor without \'Attempt Recovery\' errors. This is what was missing
from the original PressPilot approach.

**Part 2: SSWG Gap Analysis**

Comparing what exists in the vault against what SSWG (Solid Smart WP
Theme Generator) requires for production-quality output matching
WordPress.com and ZipWP.

**2.1 Architecture Gap: Plugin v6.3 vs. SSWG Target**

  --------------------- ---------------------------------------------------------------- ------------------------------------------------------------------- ---------------------------------
  **Dimension**         **Plugin v6.3 (Current)**                                        **SSWG Target**                                                     **Gap**
  Block Markup Source   Hand-written JSON patterns with {{tokens}} in home-modern.json   Pre-validated PHP patterns from proven cores                        NEEDS MIGRATION
  Color System          Hardcoded hex (\#0073aa) in inline styles                        Semantic palette slugs from theme.json (has-primary-color)          NEEDS REWRITE
  Spacing               Hardcoded px (padding:60px)                                      Fluid clamp() via theme.json presets (var:preset\|spacing\|large)   NEEDS REWRITE
  Button Classes        Missing wp-element-button                                        Correct wp-block-button\_\_link wp-element-button chain             NEEDS FIX
  Theme Base            Third-party themes (Astra, Kadence, Neve, Blocksy)               Own FSE theme built from proven cores                               NEEDS NEW APPROACH
  AI Role               Generates JSON content per page type                             Selects patterns + generates JSON content tokens                    PARTIAL - ADD PATTERN SELECTION
  Theme Output          Pages inserted into existing WP install                          Complete standalone theme.zip file                                  ALREADY DONE IN SAAS
  Validation            None (trust and pray)                                            3-tier: Pattern + Assembly + WP Factory                             NEEDS IMPLEMENTATION
  Style Variations      None                                                             Multiple brand modes (modern, minimal, bold, playful, luxurious)    MISSING
  Navigation            core/navigation block (fragile)                                  Paragraph links in group (proven stable)                            NEEDS MIGRATION
  --------------------- ---------------------------------------------------------------- ------------------------------------------------------------------- ---------------------------------

**2.2 Pattern Coverage Gap**

Mapping SSWG required page sections to available proven-core patterns:

  ---------------------- ------------------------------- -------------------------- ------------------------------------------------------ -----------------------------
  **Section Type**       **Needed For**                  **Available Patterns**     **Best Source**                                        **Status**
  Hero / Banner          Every home page                 18+ across all cores       Ollie (6), Spectra (6), Frost (2), TT4 (2), Tove (4)   READY
  Features / Services    Services pages, home            15+ feature patterns       Ollie (5), Spectra (8), TT4 (2)                        READY
  Call-to-Action         Every page bottom, conversion   20+ CTA patterns           Ollie (6), Spectra (10), Frost (4)                     READY
  Pricing Tables         SaaS, services                  12+ pricing patterns       Ollie (4), Spectra (6), Frost (6)                      READY
  Testimonials           Social proof                    10+ testimonial patterns   Ollie (4), Spectra (3), Frost (4), TT4 (1)             READY
  Headers / Nav          Every page                      15+ header patterns        Ollie (6), Spectra (6), Tove (6)                       READY
  Footers                Every page                      18+ footer patterns        Ollie (7), Frost (7), Tove (8), Spectra (6)            READY
  Blog / Posts           Blog pages                      12+ post layouts           Ollie (5), TT4 (5), Tove (5), Spectra (4)              READY
  Contact                Contact pages                   10+ contact patterns       Spectra (9), Ollie (1)                                 READY
  Team                   About pages                     5+ team patterns           Ollie (1), TT4 (1), Frost (1)                          PARTIAL - LIMITED
  FAQ                    Support, services               4+ FAQ patterns            Spectra (2), Tove (1), TT4 (1)                         READY
  Portfolio / Gallery    Portfolio sites                 8+ gallery patterns        TT4 (5), Frost (1)                                     READY
  Restaurant Menu        Restaurant verticals            7 restaurant patterns      Tove (7)                                               READY
  E-commerce / Product   Store pages                     3+ product patterns        Frost (2), Spectra (1)                                 PARTIAL - NEEDS WOOCOMMERCE
  Newsletter / Lead      Lead capture                    3+ newsletter patterns     Ollie (1), Frost (2)                                   READY
  Numbers / Stats        Social proof, home              2+ stats patterns          Ollie (2)                                              PARTIAL - LIMITED
  ---------------------- ------------------------------- -------------------------- ------------------------------------------------------ -----------------------------

**VERDICT:** Pattern coverage is excellent. 338 patterns across 16+
categories. The vault already has more than enough raw material. The gap
is not pattern quantity - it\'s the engineering to tokenize, select, and
assemble them.

**2.3 SaaS Backend Gap**

The Laravel backend (GenerationController) already handles the right
flow: receive payload, create project, dispatch GenerateThemeJob, return
job ID for polling. Key gaps:

  ------------------------- --------------------------------------------------- ------------------------------------------------------------------ ----------------------------
  **Backend Component**     **Current State**                                   **SSWG Need**                                                      **Gap**
  GenerationController      Full CRUD with status polling                       Same, already works                                                DONE
  DataTransformer           Maps SaaS input to generator data                   Needs to also map to pattern selection                             NEEDS EXTENSION
  GenerateThemeJob          Dispatches to queue                                 Needs to call pattern assembly engine                              NEEDS NEW ENGINE
  Pattern Assembly Engine   Does not exist                                      Core SSWG logic: select patterns, inject tokens, build theme.zip   MISSING - CRITICAL
  WP Factory Validation     Factory exists but unstable (health check issues)   Must validate every generated theme.zip                            NEEDS STABILIZATION
  Supabase Storage          Working for file delivery                           Same, already works                                                DONE
  n8n Workflows             Exists but not integrated with new approach         May not be needed if Laravel handles assembly                      EVALUATE - POSSIBLY REMOVE
  ------------------------- --------------------------------------------------- ------------------------------------------------------------------ ----------------------------

**Part 3: SSWG Pattern Assembly Engine**

This is the missing piece. A deterministic PHP/Laravel service that
takes AI-generated JSON and assembles it into a valid theme using
proven-core patterns.

**3.1 Engine Pipeline**

**Step 1 - AI Planning (existing):** AI receives business info, outputs
a JSON spec with site\_name, design\_tokens, selected\_style, and
per-page content with pattern preferences.

**Step 2 - Pattern Selection (new):** Engine maps AI\'s page structure
to specific pattern slugs from the proven-cores registry. Uses
cores.json + pattern metadata to find best matches by vertical, style,
and section type.

**Step 3 - Token Injection (new):** Engine takes selected pattern
PHP/HTML files, replaces all {{TOKEN}} placeholders with AI-generated
content. String replacement only - block structure never changes.

**Step 4 - Theme Assembly (new):** Engine builds theme.zip: copies base
theme structure (templates, parts, functions.php) from selected core,
injects tokenized patterns into /patterns/ directory, generates
theme.json with user\'s design tokens.

**Step 5 - Validation (new):** Passes theme.zip to WP Factory for
activation test. Factory installs theme, loads Site Editor, checks for
\'Attempt Recovery\' errors. Pass/fail.

**Step 6 - Delivery (existing):** Upload validated theme.zip to
Supabase, return signed URL.

**3.2 AI Output Schema (What AI Produces)**

AI ONLY outputs this JSON. It never touches block markup.

**Example AI Output:**

{ \"site\_name\": \"Roma Pizza\", \"slug\": \"roma-pizza\",
\"vertical\": \"restaurant\", \"style\": \"modern\", \"design\_tokens\":
{ \"primary\": \"\#D4380D\", \"primary\_accent\": \"\#FFF1EC\",
\"base\": \"\#FFFFFF\", \"main\": \"\#1A1A2E\", \"secondary\":
\"\#666680\", \"tertiary\": \"\#FAF9F7\" }, \"font\_pair\":
\"pp-inter\", \"pages\": { \"home\": { \"pattern\_preferences\":
\[\"hero-cover\", \"features-grid\", \"testimonials\", \"cta\"\],
\"content\": { \"HERO\_TITLE\": \"Authentic Italian Pizza Since 1985\",
\"HERO\_TEXT\": \"Hand-tossed dough, fresh ingredients\...\",
\"HERO\_CTA\": \"View Our Menu\", \... } }, \"about\": { \... },
\"contact\": { \... } } }

**3.3 Pattern Registry (cores.json Enhancement)**

Current cores.json has 9 entries mapping coreId to
vertical/style/features. SSWG needs this expanded to individual pattern
level:

  -------------------- --------------------------------- -------------------------------------------------------------------------------------------------------------------------------------------------
  **Field**            **Purpose**                       **Example**
  pattern\_id          Unique identifier                 ollie/hero-light
  category             Section type                      hero \| features \| cta \| pricing \| testimonials \| header \| footer \| contact \| blog \| team \| faq \| gallery \| restaurant \| newsletter
  sub\_type            Variant within category           centered \| split \| dark \| light \| minimal \| bold
  required\_tokens     List of {{TOKEN}} placeholders    \[HERO\_TITLE, HERO\_TEXT, HERO\_CTA\]
  content\_slots       Count of text insertion points    3
  image\_slots         Count of image placeholders       1
  supports\_dark       Has dark mode variant             true/false
  source\_core         Which proven core it comes from   ollie \| frost \| tove \| spectra-one \| tt4
  vertical\_affinity   Best for which business types     \[\"saas\", \"agency\", \"general\"\]
  complexity           Layout complexity for matching    simple \| moderate \| complex
  -------------------- --------------------------------- -------------------------------------------------------------------------------------------------------------------------------------------------

**3.4 Theme.json Generation Strategy**

Instead of generating theme.json from scratch, SSWG uses Ollie\'s
theme.json as the canonical base and performs surgical color/font swaps:

**What changes per generation:** 11 color values in
settings.color.palette, 1-2 font family definitions in
settings.typography.fontFamilies, and style variation selection.

**What never changes:** Spacing scale (fluid clamp values), layout
dimensions (contentSize, wideSize), block-level style defaults,
appearance tools settings.

**This is exactly what WordPress.com\'s Assembler does.** They have one
fixed theme and only swap theme.json color/font tokens. Zero structural
changes.

**Part 4: Implementation Roadmap**

**4.1 Phase 0: Stabilize Foundation (Week 1-2)**

**0.1** Audit and fix WP Factory container health (currently showing
\'Running (unknown)\' in Coolify).

**0.2** Create factory validation endpoint: POST /validate accepts
theme.zip, installs it, loads Site Editor via Puppeteer, returns
pass/fail + any error messages.

**0.3** Run all 338 proven-core patterns through factory validation.
Build pass/fail matrix. Any pattern that fails gets quarantined.

**0.4** Establish baseline: pick one proven core (Ollie), manually build
a complete 5-page restaurant theme from its patterns. Validate. This
becomes the \'gold standard\' reference.

**4.2 Phase 1: Pattern Tokenization (Week 2-4)**

**1.1** Complete the token vocabulary. Expand from 14 tokens to \~60-80
covering all content insertion points across all page types.

**1.2** Build tokenizer script: takes raw proven-core pattern,
identifies all text content nodes, replaces with appropriate {{TOKEN}},
outputs prepared pattern.

**1.3** Tokenize top-priority patterns first (40-50 patterns covering: 5
heroes, 5 features, 4 CTAs, 3 pricing, 3 testimonials, 4 headers, 4
footers, 3 contact, 3 about, 2 blog, 2 team, 2 FAQ, 2 restaurant, 2
newsletter).

**1.4** Build pattern registry (enhanced cores.json) mapping every
tokenized pattern with its metadata, required tokens, and vertical
affinity.

**4.3 Phase 2: Assembly Engine (Week 4-6)**

**2.1** Build PatternAssemblyService in Laravel: accepts AI JSON spec,
selects patterns from registry, performs token replacement, outputs
assembled theme directory.

**2.2** Build ThemePackager: takes assembled directory, adds theme.json
(generated from Ollie base + user tokens), functions.php (from proven
core), templates and parts. Outputs valid theme.zip.

**2.3** Integrate with existing GenerateThemeJob: replace current
generation logic with new assembly pipeline.

**2.4** Wire up WP Factory validation as final step before delivery.

**4.4 Phase 3: Style System (Week 6-8)**

**3.1** Implement brand modes using Ollie\'s style variation system:
modern (default), minimal (Frost-inspired), bold (high contrast),
playful (rounded, colorful), luxurious (dark, serif).

**3.2** Each mode = a theme.json color palette + typography preset +
spacing adjustments. No block markup changes.

**3.3** Test all 5 modes against all pattern categories. Fix any visual
issues.

**4.5 Phase 4: WPaify Integration (Week 8-10)**

**4.1** Build HTML section classifier that maps uploaded HTML sections
to pattern categories.

**4.2** Build content extractor that pulls text content from HTML
sections into token values.

**4.3** Connect to shared pattern assembly engine: WPaify uses same
patterns, just with extracted content instead of AI-generated content.

**4.6 Build Order Rationale**

  -------------------- -------------- ---------------------------------------------- ------------------------------------------------
  **Phase**            **Duration**   **Deliverable**                                **Why This Order**
  0: Foundation        2 weeks        Stable Factory + validated pattern inventory   Can\'t build on broken infra
  1: Tokenization      2 weeks        40-50 tokenized patterns + registry            Patterns are the raw material for everything
  2: Assembly Engine   2 weeks        Working theme generation from patterns         Core product value - proves the approach works
  3: Style System      2 weeks        5 brand modes                                  Quality differentiator vs competitors
  4: WPaify            2 weeks        HTML-to-theme using shared engine              Leverages everything built in phases 0-3
  -------------------- -------------- ---------------------------------------------- ------------------------------------------------

**Part 5: Risk Register**

  ------------------------------------------- -------------- ----------------- --------------------------------------------------------------------------------------------------------------------------------------
  **Risk**                                    **Severity**   **Probability**   **Mitigation**
  WP Factory stays unstable                   HIGH           MEDIUM            Phase 0 priority. If container can\'t be fixed, consider WordPress Playground (browser-based) as alternative validation environment.
  Token replacement breaks block validation   HIGH           LOW               Tokens are placed ONLY in text content nodes, never in block comment JSON. String replacement can\'t break structure.
  Patterns become outdated with WP updates    MEDIUM         LOW               Proven cores are from stable themes. Re-validate quarterly. WordPress block markup is backward-compatible.
  AI selects wrong patterns for vertical      MEDIUM         MEDIUM            Pattern registry metadata + vertical affinity scoring. Fallback to safe defaults (Ollie general).
  Not enough visual variety with 5 cores      MEDIUM         LOW               338 patterns + 5 brand modes = thousands of combinations. More than ZipWP offers.
  Performance: assembly too slow              LOW            LOW               Assembly is string replacement + file copy. No API calls, no rendering. Should complete in \< 2 seconds.
  ------------------------------------------- -------------- ----------------- --------------------------------------------------------------------------------------------------------------------------------------

**Part 6: QuickWP Reference Comparison**

QuickWP by ThemeIsle is the closest open-source reference to what SSWG
should be. Here\'s how our approach compares:

  -------------------- -------------------------------------------- -------------------------------------------------- -----------------------------------------------------------
  **Dimension**        **QuickWP**                                  **SSWG (Planned)**                                 **Advantage**
  Theme Base           Single TT4 fork                              6 proven cores (338 patterns)                      SSWG: Much more variety
  Placeholder System   PHP functions: \$content-\>string(\'key\')   {{TOKEN}} replacement                              QuickWP: More structured. SSWG: Simpler to implement
  AI Provider          OpenAI (hosted API)                          Anthropic Claude (via Laravel)                     Neutral
  Preview              WordPress Playground (browser)               WP Factory (server)                                QuickWP: No server needed. SSWG: More reliable validation
  Style Variations     Color + font only                            5 brand modes + color + font                       SSWG: Richer customization
  Image Handling       Pexels API integration                       Unsplash (current), can add Pexels                 Neutral
  Output               Theme.zip for download                       Theme.zip for download                             Same
  Pattern Count        \~24 patterns                                40-50 tokenized (from 338 available)               SSWG: Significantly more
  Verticals            General only                                 Restaurant, E-commerce, SaaS, Portfolio, General   SSWG: Specialized verticals
  License              GPL-3 open source                            Proprietary SaaS                                   Different models
  -------------------- -------------------------------------------- -------------------------------------------------- -----------------------------------------------------------

**Bottom line:** SSWG has a stronger foundation (more patterns, more
cores, vertical specialization) but needs the assembly engine built.
QuickWP proves the approach works in production.

**Part 7: Decisions Needed From Omar**

**Decision 1: Primary Core Theme**

**Recommendation: Ollie as primary,** with Tove for restaurant verticals
and Frost for minimal/portfolio. Ollie has the richest pattern library
(99 patterns), best theme.json token system, and the most style
variations.

**Decision 2: WP Factory vs. WordPress Playground**

**Tradeoff:** Factory gives server-side validation but has stability
issues. Playground runs in-browser (no server needed) but is newer and
less proven for automated testing. Recommendation: Fix Factory first
(Phase 0). If it can\'t be stabilized in 2 weeks, pivot to Playground.

**Decision 3: n8n Workflow Role**

**Current state:** n8n workflows exist but may not be needed if Laravel
handles the full pipeline. Recommendation: Move all generation logic
into Laravel services. Remove n8n from the critical path. Keep it only
for non-critical tasks like email notifications.

**Decision 4: Navigation Approach**

**Options:** (A) Paragraph links in group (proven stable, what FSE laws
recommend), (B) Native core/navigation (fragile but editable in Site
Editor). Recommendation: Option A for generated themes. Users who want
to customize navigation can do so after install.

**Decision 5: Brand Mode Count**

**Options:** Start with 3 modes (modern, minimal, bold) or go for 5 (add
playful, luxurious). Recommendation: Start with 3 in Phase 3, add 2 more
as fast-follows.
