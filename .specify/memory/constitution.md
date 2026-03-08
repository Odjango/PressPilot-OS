<!--
SYNC IMPACT REPORT
==================
Version change: 1.1.0 → 2.0.0 (MAJOR: Node.js generator removed; pipeline now SSWG Laravel PHP)
Modified Principles:
- V. Hero System Contract: Removed TypeScript sync requirements, updated to PHP-only ThemeAssembler + pattern-library skeletons
- VI. Data Flow Pipeline: Complete rewrite for SSWG Laravel pipeline (AIPlanner → PatternSelector → TokenInjector → ThemeAssembler)
- VII. Vertical Expansion Protocol: Updated to pattern-library/vertical-recipes.json + skeletons architecture
Added Sections:
- VIII. Template Part Architecture (transparent header system)
- IX. Image Token Resolution (person-image overrides)
Removed Sections:
- All references to src/generator/, ContentBuilder.ts, ContentEngine.ts, universal-*.ts (deleted, archived to Project Extras)
Templates Requiring Updates:
- .specify/templates/plan-template.md: Check for src/generator references
- .specify/templates/spec-template.md: Check for src/generator references
- .specify/templates/tasks-template.md: Check for src/generator references
Follow-up TODOs:
- Verify docs/DATA_FLOW.md reflects Laravel pipeline
- Verify docs/GENERATOR_API.md reflects Laravel pipeline
Core Truth Documents:
- docs/PROJECT_ROADMAP.md
- docs/AGENT_CONTEXT_MASTER.md
- docs/AGENT_GUIDE.md
- docs/PRESSPILOT_QUALITY_BAR.md
- docs/DATA_FLOW.md
- docs/hero-system.md
- docs/GENERATOR_API.md
- _memory/main.md (NEW - master project memory and session log)
-->
# PressPilot OS Constitution

## Core Principles

### I. Stability First (NON-NEGOTIABLE)

Stability takes absolute precedence over novelty. Every code change MUST prioritize
reliability of generated themes over new features or improvements.

- Agents MUST NOT guess or invent new structures; they assemble proven parts
- Agents MUST NOT synthesize new layout structures without explicit approval
- All changes MUST pass existing tests before merge
- Hard Gates in docs/pp-hard-gates.md MUST be checked before any code change

**Rationale**: PressPilot core value proposition is Unbreakable WordPress FSE themes.
A single Attempt Recovery error destroys user trust. Stability failures are P0 bugs.

### II. FSE Block Grammar Compliance (NON-NEGOTIABLE)

All generated WordPress block markup MUST adhere to the WordPress Full Site Editing
block grammar specification. Violations cause theme crashes.

- Navigation blocks MUST use self-closing tags, never inner blocks
- Block attributes MUST be valid JSON (double quotes, no trailing commas)
- Container blocks (group, columns, cover) MUST have matching HTML wrapper elements
- All blocks MUST have matching closing comments or be self-closing
- Inline style attributes MUST NOT be removed (they are part of block grammar contract)
- Template syntax is FORBIDDEN in final output

**Rationale**: WordPress Site Editor performs character-by-character validation of block
markup. Any deviation triggers Attempt Recovery errors.

### III. Quality Bar Enforcement

Every generated homepage MUST meet the visual and structural quality bar defined in
docs/PRESSPILOT_QUALITY_BAR.md. No exceptions.

Page-level requirements:
- Story arc: Hero then Key section then Social proof then Final CTA
- Visual rhythm: Alternate light/dark or image/solid sections
- At least one breather band between dense content sections

Hero requirements:
- Exactly one H1, 1-2 short paragraphs, 1-2 primary CTAs
- One strong visual (unless intentionally minimal mode)
- Primary CTA MUST be visually dominant and clearly contrasted

Structure requirements:
- Exactly one H1 per page
- Logical heading hierarchy (no H1 to H4 jumps)
- All text MUST meet WCAG AA contrast for its size

**Rationale**: Generated sites must look like polished, premium block themes.

### IV. Design Token System

All section patterns MUST use design tokens exclusively. Raw values are forbidden.

- Colors: Use ColorHarmonizer and preset palette tokens
- Spacing: Use scale tokens (XS-XL)
- Typography: Use authorized font pairings from StyleEngine
- Radii and shadows: Use token presets only

Brand mode differentiation:
- Playful: Pastel bands, softer radii, friendly typography
- Modern: Neutral backgrounds, sharper radii, bold typography, photo-driven
- Minimal: White/negative space, limited color, simple shapes
- Bold: Strong color blocks, high contrast, fewer grays

**Rationale**: Tokens ensure consistency, maintainability, and accessibility compliance.

### V. Hero System Contract

The hero system provides 4 distinct layouts implemented in the SSWG Laravel pipeline
(`backend/app/Services/ThemeAssembler.php`).

| Layout | Block Type | Background | Use Case |
|--------|-----------|------------|----------|
| fullBleed | wp:cover | Image + 75% overlay | Restaurants, portfolios |
| fullWidth | wp:group | Solid color (accent-3) | SaaS, tech companies |
| split | wp:columns | White, 50/50 split | Professional services |
| minimal | wp:group | White, centered text | Startups, minimalist |

Implementation:
- Hero skeletons live in `pattern-library/skeletons/hero-*.html`
- ThemeAssembler selects hero type based on AIPlanner output
- fullBleed heroes MUST use `header-transparent` template part (white text on dark cover)
- All other hero types use the regular `header` template part (dark text)
- Hero selection logic is in `ThemeAssembler::buildFrontPage()`

**Rationale**: Hero layout determines header visibility; transparent header prevents
unreadable dark-on-dark text.

### VI. Data Flow Pipeline (SSWG Laravel)

User data flows through the SSWG (Site Scaffolding & Wireframe Generation) pipeline.
All services are in `backend/app/Services/`.

Pipeline: Studio UI → Laravel API → AIPlanner → PatternSelector → TokenInjector → ThemeAssembler → ZIP

Pipeline stages:
- **Studio UI** (`src/components/StudioClient.tsx`): Collects business name, logo, tagline, description, category
- **Laravel API** (`backend/routes/api.php`): Receives form data, dispatches generation job
- **AIPlanner** (`backend/app/Services/AIPlanner.php`): Calls Claude API to generate content tokens (headlines, bios, descriptions) per page
- **PatternSelector** (`backend/app/Services/PatternSelector.php`): Picks skeleton patterns from `pattern-library/vertical-recipes.json` based on business category
- **TokenInjector** (`backend/app/Services/TokenInjector.php`): Fills `{{PLACEHOLDER}}` tokens in skeleton HTML with AI-generated content
- **ImageHandler** (`backend/app/Services/ImageHandler.php`): Fetches Unsplash images for `IMAGE_*` tokens with token-specific query overrides
- **ThemeAssembler** (`backend/app/Services/ThemeAssembler.php`): Wraps injected sections with header/footer, writes theme.json, style.css, functions.php, creates ZIP

Adding new fields requires updates to:
- AIPlanner prompt (to generate the new token)
- Skeleton HTML (to include the `{{NEW_TOKEN}}` placeholder)
- TokenInjector (if new token type needs special handling)
- ImageHandler `$tokenQueryOverrides` (if new image token needs specific Unsplash query)

**Rationale**: Clean separation of concerns; each service has one job.

### VII. Vertical Expansion Protocol

New verticals MUST follow the SSWG architecture: Recipes → Skeletons → Tokens.

Required artifacts for a new vertical:
1. Recipe entry in `pattern-library/vertical-recipes.json` with page arrays (home, about, services, contact)
2. Skeleton HTML files in `pattern-library/skeletons/` for any new section patterns
3. Each inner page MUST have at least 3 skeleton sections (no single-section pages)
4. Token placeholders in skeletons MUST match AIPlanner's output token names
5. Any new `IMAGE_*` tokens for people MUST have entries in ImageHandler `$tokenQueryOverrides`

Current verticals: restaurant, ecommerce, saas, portfolio, local_service

**Rationale**: Data-driven generation ensures consistency. Enriched inner pages prevent
the "bare page" problem where inner pages look unstyled.

### VIII. Template Part Architecture

The theme uses two header variants to handle dark/light hero backgrounds:

- `parts/header.html` — Regular header with dark text (`textColor: contrast`) for light backgrounds
- `parts/header-transparent.html` — Transparent header with white text (`textColor: base`) for dark hero covers

Rules:
- `front-page.html` MUST use `header-transparent` slug when hero is fullBleed or fullWidth with dark background
- All other templates (page.html, single.html, 404.html) MUST use regular `header` slug
- Both header parts MUST be registered in `writeThemeJson()` templateParts array
- Logo size MUST be consistent across header, header-transparent, and footer (currently 60px)

**Rationale**: WordPress FSE has no CSS-only way to override template part text colors.
A separate template part is the clean solution for readable navigation on dark heroes.

### IX. Image Token Resolution

Image tokens are resolved by `ImageHandler.php` with token-specific Unsplash queries.

| Token Prefix | Unsplash Query | Why |
|-------------|---------------|-----|
| IMAGE_TEAM | professional person portrait headshot | Team sections need people, not business category images |
| IMAGE_CHEF | chef portrait professional kitchen | Chef highlight needs a person in kitchen context |
| IMAGE_TESTIMONIAL | person portrait professional | Testimonial avatars need faces |
| (all others) | Business category (e.g., "restaurant") | General business imagery |

Rules:
- Person-related tokens MUST use portrait queries via `$tokenQueryOverrides`
- New person-image tokens MUST be added to the overrides map
- The override is prefix-matched: `IMAGE_TEAM_1`, `IMAGE_TEAM_2` all match `IMAGE_TEAM`

**Rationale**: Without overrides, a restaurant theme gets food images for team/chef sections.

## Quality Gates

| Gate | Check | Failure Action |
|------|-------|----------------|
| FSE Compliance | Block markup validation | Build fails |
| Content Validation | No forbidden demo strings | Build fails |
| Contrast Check | WCAG AA on hero/CTA | Warning (P1 fix) |
| Heading Hierarchy | One H1, logical structure | Warning (P1 fix) |
| Hard Gates | Nav refs, layout depth | Build fails |

**Checkpoint**: A theme is NOT shippable if any gate fails.

## Development Workflow

### Before Writing Code
1. Check Hard Gates: Will the change violate docs/pp-hard-gates.md?
2. Verify FSE Compliance: Navigation, attributes, block closures
3. Reference Skeletons: Reuse existing `pattern-library/skeletons/`
4. Check vertical-recipes.json: Ensure new sections are wired into page recipes
5. Verify token names: AIPlanner output tokens MUST match skeleton `{{PLACEHOLDER}}` names
6. Check ImageHandler overrides: Any new person-image tokens need `$tokenQueryOverrides` entry

### Code Review Requirements
- All changes MUST verify constitution compliance
- Complexity MUST be justified
- New skeletons require visual review
- Breaking changes to ThemeAssembler require migration plan

### Testing Discipline
- Run `php -l` on all modified PHP files before committing
- Generate a test theme and visually inspect all pages
- Verify block markup with WordPress Site Editor (no Attempt Recovery errors)
- Test with logo and without logo scenarios

## Governance

This constitution supersedes all other practices.

### Amendment Procedure
1. Propose change with rationale in a PR
2. Update affected documentation
3. Increment version per semantic versioning
4. Update LAST_AMENDED_DATE to amendment date

### Core Truth Documents

These documents are authoritative sources that inform this constitution:
- docs/PROJECT_ROADMAP.md - Phase priorities and roadmap
- docs/AGENT_CONTEXT_MASTER.md - Agent operational protocol
- docs/AGENT_GUIDE.md - Quality enforcement rules
- docs/PRESSPILOT_QUALITY_BAR.md - Visual quality standards
- docs/DATA_FLOW.md - Data pipeline architecture
- docs/hero-system.md - Hero layout specifications
- docs/GENERATOR_API.md - Generator field reference, placeholders, and content flow
- _memory/main.md - Master project memory, session log, and architecture decisions
- pattern-library/vertical-recipes.json - Vertical-to-skeleton mapping
- CLAUDE.md - Agent operational contract (hot cache)

**Version**: 2.0.0 | **Ratified**: 2026-02-12 | **Last Amended**: 2026-03-08
