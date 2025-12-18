# PressPilot Generator Constitution v1
**Status**: LOCKED
**Purpose**: Eliminate instability, Attempt Recovery, and nondeterministic output by removing generator freedom.

## 0. Prime Directive (Non-Negotiable)
The Generator is not allowed to **invent structure**.
The Generator is not allowed to **guess**.
The Generator is not allowed to **improvise**.

If the Generator cannot satisfy a rule below:
❌ It must NOT output partial content
❌ It must NOT insert placeholders
❌ It must NOT “help”
✅ It must either:
1.  Emit the **minimal safe structure**, or
2.  **Fail the build** with a reason (dev mode only)

## 1. Theme Scope & File Contract (MVBT)
The Generator MUST output exactly this minimum structure:
```text
/
├─ style.css
├─ theme.json
├─ functions.php
├─ index.php          (dummy / silence only)
├─ screenshot.png
├─ assets/
├─ templates/
│  └─ index.html      (MANDATORY ENGINE)
├─ parts/
│  ├─ header.html
│  └─ footer.html
└─ patterns/          (ONLY if patterns are used)
```

**Forbidden**:
-   PHP templates (`header.php`, `page.php`, etc.)
-   Dynamic DB seeding
-   Conditional file generation

## 2. theme.json — The Global Brain
**Mandatory**:
-   schema: v2 or v3
-   `settings.appearanceTools = true`
-   `settings.layout.contentSize`
-   `settings.layout.wideSize`
-   Explicit color palette slugs
-   Explicit typography scale

**Forbidden**:
-   Hardcoded colors in templates
-   Referencing presets that do not exist
-   Inline CSS styles in block markup

**Rule**: If a preset is referenced anywhere and not defined → **FAIL**

## 3. Component Contracts (No Freedom)
### 3.1 Header (`parts/header.html`)
**Allowed Blocks**:
-   `core/group`
-   `core/site-logo`
-   `core/site-title`
-   `core/navigation`
-   `core/navigation-link`

**Required Structure**:
1.  group (tagName: header)
2.  inner group (layout: flex / row)
3.  site-logo
4.  site-title
5.  navigation (INLINE LINKS ONLY)

**Navigation Rules (Absolute)**:
-   Must use inline `navigation-link` blocks
-   Must never include `"ref"`
-   Must never be empty
-   Must never rely on DB menus

**Forbidden**:
-   `wp:pattern` (unless Pattern Rules satisfied)
-   Placeholders of any kind
-   PHP
-   Fixed heights
-   External menu references

**Violation** → **FAIL**

### 3.2 Main Template (`templates/index.html`)
**Allowed Blocks**:
-   `core/group`
-   `core/post-content`
-   Any content blocks allowed by layout discipline

**Required Structure**:
1.  group (tagName: main, layout: constrained)
2.  content blocks OR post-content

**Rules**:
-   Only ONE H1 maximum
-   No unresolved patterns
-   No placeholders
-   Must close all blocks correctly

### 3.3 Footer (`parts/footer.html`)
**Allowed Blocks**:
-   `core/group`
-   `core/columns`
-   `core/paragraph`
-   `core/navigation` (secondary, inline only)
-   `core/social-links`
-   `wp:pattern` (ONLY if Pattern Contract satisfied)

**Forbidden**:
-   PHP
-   Dynamic date logic
-   DB dependencies
-   Hardcoded navigation refs

## 4. Navigation Contract (Global)
Navigation is **structural**, not data-driven.

**Rules**:
-   Always inline
-   Always deterministic
-   Always visible on activation
-   No DB entities
-   No programmatic menu creation
-   Any `"ref"` anywhere → **FAIL**

## 5. Pattern Contract (Option B)
Patterns are allowed only if ALL conditions are met.

If `wp:pattern` is used:
1.  `/patterns/*.php` MUST exist
2.  Pattern file MUST include:
    -   valid pattern header
    -   pure block markup
3.  Slug MUST resolve exactly
4.  No placeholders
5.  No dynamic PHP

**Validator Rule**:
-   Missing pattern → **FAIL**
-   Placeholder pattern → **FAIL**

## 6. Placeholder Ban (Global)
The Generator MUST NEVER emit:
-   “Pattern Placeholder”
-   Marker blocks
-   Temporary blocks
-   TODO blocks
-   Empty schema fillers

Empty-but-valid core blocks are allowed.
Placeholder blocks are not.

## 7. Layout Discipline (Heavy Content Safety)
**Rules**:
-   Max nesting depth enforced
-   Sections must follow a known wrapper schema
-   Unsafe recursive block chains forbidden
-   Media must be constrained by layout rules

**Violation** → **FAIL**

## 8. Generator Emission Rules
**Mandatory**:
-   All block markup emitted via safe builders
-   Attributes serialized via `JSON.stringify`
-   Emit-time corruption scan

**Forbidden**:
-   String concatenation of block comments
-   Conditional structure logic
-   “Smart” fallback guessing

## 9. Validator Authority
The Validator is the **final judge**.

**Validator Output Rules**:
-   **PASS**
-   or **FAIL** with:
    -   Rule ID
    -   File path
    -   Exact snippet

No warnings. No suggestions.

## 10. Zero-Improvisation Clause
If input is ambiguous or insufficient:
1.  Generator emits **minimal safe layout**
2.  Or build fails (dev mode)

The Generator must never invent content structure.

## 11. Success Definition (Immutable)
A theme is considered successful ONLY if:
1.  Passes all **Hard Gates**
2.  Passes **Core grammar parse**
3.  Opens Site Editor with **zero Attempt Recovery**
4.  Navigation **renders immediately**
5.  No DB shadowing required

## Final Lock Statement
This Constitution overrides all tutorials, opinions, and past behavior.

Any future feature:
-   MUST declare which rules it touches
-   MUST extend the Validator
-   MUST not weaken existing constraints
