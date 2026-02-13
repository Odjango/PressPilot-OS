<!--
SYNC IMPACT REPORT
==================
Version change: 1.0.0 → 1.1.0 (MINOR: Added GENERATOR_API.md reference + expanded data flow guidance)
Modified Principles:
- VI. Data Flow Pipeline: Added ContentEngine page-specific injection pattern
Added Sections:
- docs/GENERATOR_API.md to Core Truth Documents
Removed Sections: None
Templates Requiring Updates:
- .specify/templates/plan-template.md: No changes needed
- .specify/templates/spec-template.md: No changes needed
- .specify/templates/tasks-template.md: No changes needed
Follow-up TODOs: None
Core Truth Documents:
- docs/PROJECT_ROADMAP.md
- docs/AGENT_CONTEXT_MASTER.md
- docs/AGENT_GUIDE.md
- docs/PRESSPILOT_QUALITY_BAR.md
- docs/DATA_FLOW.md
- docs/hero-system.md
- docs/GENERATOR_API.md (NEW)
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

The hero system provides 4 distinct layouts that MUST be maintained in sync across
TypeScript (build-time) and PHP (preview-time) implementations.

| Layout | Block Type | Background | Use Case |
|--------|-----------|------------|----------|
| fullBleed | wp:cover | Image + 75% overlay | Restaurants, portfolios |
| fullWidth | wp:group | Solid color (accent-3) | SaaS, tech companies |
| split | wp:columns | White, 50/50 split | Professional services |
| minimal | wp:group | White, centered text | Startups, minimalist |

Sync requirements:
- src/generator/patterns/hero-variants.ts MUST match src/preview/heroPreviewInjector.ts
- Both MUST use identical TT4 color tokens
- Any new layout MUST be added to both files simultaneously
- Types in src/generator/types.ts MUST include all layout options

**Rationale**: Preview screenshots must match final theme output.

### VI. Data Flow Pipeline

User data flows through a typed pipeline from Studio UI to final theme. All interfaces
MUST be kept in sync.

Pipeline: StudioFormInput to PressPilotSaaSInput to GeneratorData to ContentJSON to Final Theme

Pipeline interfaces:
- StudioFormInput: UI-facing (lib/presspilot/studioAdapter.ts)
- PressPilotSaaSInput: API contract (types/presspilot.ts)
- GeneratorData: Internal generator (src/generator/types.ts)
- ContentJSON: Builder output (src/generator/modules/ContentBuilder.ts)
- PageContent: Page-level data (src/generator/types.ts)

Adding new fields requires updates to ALL interfaces plus:
- Transform functions
- Slot creation in ContentBuilder.ts
- Pattern usage in universal-*.ts files
- Tests in tests/unit/data-flow.test.ts

**Page-Specific Content Injection** (ContentEngine pattern):
For fields that only apply to specific page templates, ContentEngine.generatePages() injects
data based on the template type:
- universal-menu: Receives menus array from ContentJSON
- universal-about: Receives chef/team fields, about paragraphs from ContentJSON
- Future templates: Follow the same pattern in ContentEngine.ts

When adding new page-specific fields:
1. Add field to PageContent interface in src/generator/types.ts
2. Add injection logic in ContentEngine.generatePages() for the template
3. Update the pattern to read from content parameter
4. Document in docs/GENERATOR_API.md

**Rationale**: Type safety across the pipeline prevents runtime errors.

### VII. Vertical Expansion Protocol

New verticals MUST follow the Generator 2.0 architecture: Tokens to Recipes to Sections.

Required artifacts for a new vertical:
1. Design tokens file: src/generator/design-system/verticals/{vertical}.ts
2. Layout recipes: Data-driven section definitions with background slots
3. Section patterns: 5+ patterns minimum
4. Unit tests: Token resolution + recipe selection + section order validation

**Rationale**: Data-driven generation ensures consistency.

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
3. Consult Style Engine: Colors, fonts, authorized pairings
4. Reference Patterns: Reuse existing src/generator/patterns/
5. Check GENERATOR_API.md: For field names, placeholders, and content flow

### Code Review Requirements
- All PRs MUST verify constitution compliance
- Complexity MUST be justified
- New patterns require approval
- Breaking changes require migration plan

### Testing Discipline
- Run npm run build and npm test before committing
- Visual regression for any pattern changes
- Data flow tests for any interface changes

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

**Version**: 1.1.0 | **Ratified**: 2026-02-12 | **Last Amended**: 2026-02-13
