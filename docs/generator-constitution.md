# PressPilot Generator Constitution v1.1
**Status**: LOCKED
**Last Updated**: 2026-02-13
**Purpose**: Eliminate instability, Attempt Recovery, and nondeterministic output by removing generator freedom.

## 0. Prime Directive (Non-Negotiable)
The Generator is not allowed to **synthesize new structure**.
It MUST **Assemble** from proven parts.
The Generator is not allowed to **guess**.

If the Generator cannot satisfy a rule below:
- It must NOT output partial content
- It must NOT insert placeholders
- It must NOT help
- It must either:
1.  Emit the **minimal safe layout** from a proven Recipe, or
2.  **Fail the build** with a reason (dev mode only)

## 1. Theme Scope and File Contract (MVBT)
The Generator MUST output exactly this minimum structure based on a Base Theme (Ollie, Frost, TT4):

- style.css (Configured from Base)
- theme.json (Configured from Base + User Colors)
- functions.php (Standard PressPilot Core)
- index.php (dummy / silence only)
- screenshot.png (From Base)
- assets/ (Copied from Base)
- templates/front-page.html (Assembled via Recipe)
- templates/page-about.html (Universal pattern)
- templates/page-contact.html (Universal pattern)
- templates/page-*.html (Industry-specific pages)
- parts/header.html (From Base Pattern)
- parts/footer.html (From Base Pattern)
- patterns/ (Injected from Recipe)

**Forbidden**:
- Synthesized Block Markup (rewriting HTML by hand)
- Dynamic DB seeding
- Conditional file generation outside of Recipe logic

## 2. theme.json - The Global Brain
**Mandatory**:
- Adhere to Base Theme structure (do not reinvent)
- settings.appearanceTools = true
- Explicit color palette slugs (mapped to User Input)

**Forbidden**:
- Changing the structure of the Base Theme theme.json
- Inline CSS styles in block markup (unless present in Base Pattern)

## 3. Assembly Contract (No Freedom)
The Generator must operate as an **Assembly Engine**:
1. **Select Recipe**: Identify the correct LayoutRecipe from PatternRegistry based on Industry.
2. **Copy Patterns**: Copy referenced patterns from Base Theme to Output.
3. **Inject Content**: Perform safe text replacement inside the pattern files.
4. **Assemble Template**: Reference these patterns in front-page.html.

### 3.1 Header and Footer
- Must use the Base Theme designated Header/Footer patterns.
- Must not be synthesized from scratch.

### 3.2 Main Template (templates/front-page.html)
**Allowed Blocks**: wp:pattern (ONLY)
**Required Structure**: Sequence of wp:pattern blocks defined by the Recipe.

## 4. Navigation Contract (Global)
Navigation is **structural**, not data-driven.
- **Restaurant Exception**: If Industry = Restaurant, a dedicated Menu page is allowed.

## 5. Pattern Contract (Recipe Driven)
Patterns are allowed only if they exist in the PatternRegistry Recipe.

If wp:pattern is used:
1. Must be part of the active Layout Recipe
2. File MUST exist in patterns/ (copied from Base)
3. Slug MUST resolve exactly
4. No placeholders

**Validator Rule**:
- Pattern not in Recipe = **FAIL**
- Missing pattern file = **FAIL**

## 6. Placeholder Ban (Global)
The Generator MUST NEVER emit:
- Pattern Placeholder
- Marker blocks
- Temporary blocks
- TODO blocks
- Empty schema fillers
- Unreplaced {{variable}} tokens

Empty-but-valid core blocks are allowed.
Placeholder blocks are not.

## 7. Layout Discipline (Heavy Content Safety)
**Rules**:
- Max nesting depth enforced
- Sections must follow a known wrapper schema
- Unsafe recursive block chains forbidden
- Media must be constrained by layout rules

**Violation** = **FAIL**

## 8. Generator Emission Rules
**Mandatory**:
- All block markup emitted via safe builders
- Attributes serialized via JSON.stringify
- Emit-time corruption scan

**Forbidden**:
- String concatenation of block comments
- Conditional structure logic
- Smart fallback guessing

## 9. Validator Authority
The Validator is the **final judge**.

**Validator Output Rules**:
- **PASS**
- or **FAIL** with: Rule ID, File path, Exact snippet

No warnings. No suggestions.

## 10. Zero-Improvisation Clause
If input is ambiguous or insufficient:
1. Generator emits **minimal safe layout**
2. Or build fails (dev mode)

The Generator must never invent content structure.

## 11. Success Definition (Immutable)
A theme is considered successful ONLY if:
1. Passes all **Hard Gates**
2. Passes **Core grammar parse**
3. Opens Site Editor with **zero Attempt Recovery**
4. Navigation **renders immediately**
5. No DB shadowing required

## 12. Data Flow Contract (v2 Architecture)

### 12.1 Content Pipeline
User data flows through a typed pipeline. All interfaces MUST be kept in sync:

Catalog/API Input to GeneratorData to ContentBuilder to ContentJSON to ContentEngine to Templates

**Key Interfaces** (defined in src/generator/types.ts):
- GeneratorData: Input to the generator
- PageContent: Data available to page patterns
- ContentJSON: Output of ContentBuilder (includes pass-through for all fields)

### 12.2 Page-Specific Content Injection
ContentEngine injects template-specific data based on page type:

| Template | Injected Data |
|----------|---------------|
| universal-menu | menus array |
| universal-about | Chef/team fields, about paragraphs |
| universal-contact | Contact info, hours, social links |

**Adding New Page Fields**:
1. Add field to PageContent interface in types.ts
2. Add injection logic in ContentEngine.generatePages()
3. Update the pattern to read from content parameter
4. Document in docs/GENERATOR_API.md

### 12.3 Field Reference
All placeholder fields, their formats, and mappings are documented in:
**docs/GENERATOR_API.md** - The authoritative field reference

Common field naming:
- Business name: name (not businessName)
- Hero title: hero_headline (not headline)
- Chef data: chef_name_1, chef_role_1, chef_bio_1 (flattened format)
- Team data: team_1_name, team_1_role, team_1_bio (flattened format)

## Final Lock Statement
This Constitution overrides all tutorials, opinions, and past behavior.

Any future feature:
- MUST declare which rules it touches
- MUST extend the Validator
- MUST not weaken existing constraints
- MUST update docs/GENERATOR_API.md if adding new fields

## Related Documents
- docs/GENERATOR_API.md - Field reference, placeholders, content flow
- docs/PRESSPILOT_QUALITY_BAR.md - Visual quality standards
- docs/DATA_FLOW.md - Data pipeline architecture
- .specify/memory/constitution.md - Project-wide constitution
