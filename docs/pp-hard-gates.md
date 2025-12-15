# PressPilot FSE Hard Gates Lock

## Overview
This document defines the "Hard Gates" implemented to permanently eliminate "Attempt Block Recovery" errors in PressPilot-generated themes. These gates are enforced by the `scripts/validateGenerator.ts` pipeline and respected by the `scripts/buildWpTheme.ts` generator.

## The Gates

### Gate 1: Block Markup Structural Gate
**Role**: Ensure HTML validity of Block Comments.
-   **Mechanism**: Stack-based parser.
-   **Rules**:
    -   Every `<!-- wp:BLOCK -->` must have a matching `<!-- /wp:BLOCK -->` (LIFO order).
    -   No "orphaned" closers or openers.
    -   Self-closing tags `<!-- wp:BLOCK /-->` are permitted and do not affect the stack.
-   **Failure**: Hard Fail. Prints file and line number of imbalance.

### Gate 2: Attributes JSON Gate
**Role**: Ensure Attribute Integrity.
-   **Mechanism**: JSON Parser.
-   **Rules**:
    -   Extract JSON object from `<!-- wp:BLOCK {JSON} -->`.
    -   `JSON.parse()` must succeed.
    -   No "corruption signatures" allowed (e.g., `var:preset||||` typos).
-   **Failure**: Hard Fail. Prints the malformed JSON snippet.

### Gate 3: PressPilot Hard Rules Gate
**Role**: Business Logic & Contract Enforcement.
-   **Rules**:
    -   **NAV-REF BAN**: No `ref` attributes in Navigation blocks allowed in ANY file (templates/parts/patterns/functions). Navigation must be "refless" (inline links).
    -   **PRESET EXISTENCE**: Every `var(--wp--preset--*)` or `var:preset|*` usage must map to a defined value in `theme.json`.
    -   **TEMPLATE VALIDITY**: `index.html` must exist. `front-page.html` (if present) must be balanced.
-   **Failure**: Hard Fail.

### Gate 4: Layout Discipline Gate
**Role**: Stability under Heavy Content.
-   **Rules**:
    -   **Section Wrappers**: Major sections (Hero, Features, etc.) must be wrapped in `wp:group` (tag: section/div) to contain layout blowouts.
    -   **Row Nesting**: Warn/Fail on `wp:row` nested > 4 levels deep (causes flexbox collapse in some browsers/editors).
    -   **Media Constraint**: Images in rows must have strict width/size attributes to prevent 0-height collapse.
-   **Failure**: Fail (Strict Mode) or Warn.

### Gate 5: Diagnostics
**Role**: Developer Aid.
-   **Output**:
    -   Note on Database Shadowing (User DB content overrides file content).
    -   Links to documentation.

## Generator Contract (Agent C)
The Generator (`buildWpTheme.ts`) is refactored to:
1.  **Never** manually concatenate block comment strings.
2.  Use `openBlock(name, attrs)` and `closeBlock(name)` helpers.
3.  Automatically validate JSON attributes at emit time.
4.  Enforce layout wrappers for all sections.
