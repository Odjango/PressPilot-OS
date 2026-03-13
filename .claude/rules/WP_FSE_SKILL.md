Trigger: “This rule applies ONLY when output includes <!-- wp: markup, templates/.html, parts/.html, patterns/*.php, or theme JSON block style decisions.”

When generating ANY WordPress blocks/templates/patterns:
Read: docs/fse-kb/FSE-KNOWLEDGE-BASE-INDEX.md
Identify blocks you will use
Read relevant batch files in docs/fse-kb/BLOCK-REFERENCE-BATCH-*.md
Generate markup strictly per specs
Critical rules:
Never guess block markup (always reference docs)
Validate parent/child nesting constraints
Apply attributes + classes exactly
Use Block Context API patterns where required

Required output footer (always):
KB Index read: YES
Batch files read: <list>
Blocks used: <list>
Nesting validated: YES
No guessing: YES

---

## Pattern Library Quality Standards (March 2026)

**Pattern Library Status:** STABLE — All 362 patterns are linting-clean.

When modifying or creating pattern files:

1. **BANNED PATTERNS (NEVER use):**
   - ❌ Hardcoded hex colors (e.g., `#E3E3F0`, `#ffffff`) — use theme.json tokens
   - ❌ `wp:navigation` with `ref` attribute — causes broken menu references
   - ❌ `iconColorValue` or `iconBackgroundColorValue` attributes — use semantic slugs only
   - ❌ Dangerous fixed px widths on layout blocks (safe: border-width, image dimensions)

2. **REQUIRED TOKEN STANDARDS:**
   - Border colors: `var:preset|color|tertiary` (JSON) or `var(--wp--preset--color--tertiary)` (inline)
   - Social-links: Use `iconColor`/`iconBackgroundColor` semantic slugs without `*Value` duplicates
   - All color references must map to theme.json palette tokens

3. **LINTER REQUIREMENT:**
   - MUST run `tools/lint-patterns.sh` before committing any pattern changes
   - Exit code 0 = safe to commit
   - Exit code 1 = violations detected, DO NOT PROCEED

**Pattern Inventory:** 362 total (31 skeletons + 331 proven-cores: Frost, Ollie, Spectra-One, Tove, TwentyTwentyFour)