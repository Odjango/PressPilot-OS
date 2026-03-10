# Post-Palette-Resolver: Validation & Follow-Up Tasks

Copy everything below the line into Claude Code terminal:

---

## Context

We just merged a major architecture change: **CorePaletteResolver** — a multi-core color slug mapping system. The changes span 18 files:

**New file:**
- `backend/app/Services/CorePaletteResolver.php` — maps 10 semantic color roles across 6 proven-cores

**Modified backend (3 files):**
- `backend/app/Services/TokenInjector.php` — added `setCore()` + runtime slug rewriting after token injection
- `backend/app/Services/ThemeAssembler.php` — core-aware theme.json loading, resolved palette overrides, dynamic footer
- `backend/app/Jobs/GenerateThemeJob.php` — wires `$projectData['core']` to both services

**Modified skeletons (14 files):**
All skeleton files in `pattern-library/skeletons/` now use Ollie canonical slugs. Previous TT4 slugs (`base-2`, `contrast-2`, `contrast`) were replaced with Ollie equivalents (`tertiary`, `secondary`, `main`).

## Your Mission — 3 Parallel Validation Agents + 1 Sequential Follow-Up

### Wave 1: Dispatch 3 Agents in Parallel

**Agent 1: PHP Validation + Unit Test**
```
Task: Validate CorePaletteResolver integration and write a unit test.

1. Read `backend/app/Services/CorePaletteResolver.php`
2. Read `backend/app/Services/TokenInjector.php` (focus on setCore + rewriteHtml integration)
3. Read `backend/app/Services/ThemeAssembler.php` (focus on writeThemeJson + buildPressPilotFooter)
4. Read `backend/app/Jobs/GenerateThemeJob.php` (focus on core selection wiring)

Verify:
- CorePaletteResolver::resolve() returns canonical slug for ollie (identity mapping)
- CorePaletteResolver::resolve() returns correct target slug for each core
- CorePaletteResolver::rewriteHtml() handles all 4 replacement patterns:
  (a) "textColor":"secondary" → "textColor":"body" (for spectra-one)
  (b) has-secondary-color → has-body-color
  (c) has-secondary-background-color → has-body-background-color
  (d) "iconColor":"main" → "iconColor":"heading"
- Longer slugs are replaced before shorter ones (primary-accent before primary)
- ThemeAssembler uses $resolver->resolve() for palette overrides, not hardcoded slugs
- ThemeAssembler footer uses resolved $bgColor, $darkText, $mutedText variables
- GenerateThemeJob reads 'core' from projectData and passes to both services

Write a test at `backend/tests/Unit/CorePaletteResolverTest.php`:
- Test resolve() for each core returns expected slugs
- Test rewriteHtml() correctly transforms sample HTML for twentytwentyfour and spectra-one
- Test rewriteHtml() is a no-op for ollie
- Test rewriteHtml() handles the partial-match edge case (primary-accent vs primary)

Run: `cd backend && php artisan test --filter=CorePaletteResolver`
All tests must pass.
```

**Agent 2: Skeleton Audit**
```
Task: Audit all skeleton files for color slug consistency.

1. Read every .html file in `pattern-library/skeletons/`
2. For each file, extract all color references:
   - JSON attributes: "textColor", "backgroundColor", "overlayColor", "iconColor"
   - CSS classes: has-*-color, has-*-background-color

Verify:
- ZERO instances of TT4 slugs: base-2, contrast-2, contrast (as standalone color)
- All color slugs used are valid Ollie palette slugs:
  primary, primary-accent, primary-alt, primary-alt-accent, main, main-accent,
  base, secondary, tertiary, border-light, border-dark
- Every block comment JSON is valid (parseable)
- Every opening block has a matching closer (or is self-closing)
- No remaining {{TOKEN}} placeholders in committed files (these are injected at runtime, but should exist in source)

Output: A summary table of (filename, color slugs used, validation status).
If ANY file fails, list the exact line number and issue.
```

**Agent 3: ThemeAssembler Footer Verification**
```
Task: Verify the footer renders correctly with resolved color variables.

1. Read `backend/app/Services/ThemeAssembler.php`, specifically buildPressPilotFooter()
2. Trace the data flow:
   - $resolver->resolve('tertiary', $this->coreSlug) → $bgColor
   - $resolver->resolve('main', $this->coreSlug) → $darkText
   - $resolver->resolve('secondary', $this->coreSlug) → $mutedText
3. Verify every heredoc interpolation ({$bgColor}, {$darkText}, {$mutedText}) appears in both:
   - Block comment JSON (e.g., "backgroundColor":"{$bgColor}")
   - CSS class (e.g., has-{$bgColor}-background-color)
4. Verify the footer block structure:
   - Outer group has backgroundColor + textColor
   - Tagline paragraph has textColor = mutedText
   - Heading h4s have textColor = darkText
   - Contact paragraph has textColor = mutedText
   - Social links have iconColor = darkText
   - Copyright paragraph has textColor = mutedText
5. Count total interpolations: should be exactly 13 instances of {$bgColor}, {$darkText}, or {$mutedText}

Also verify buildHeader() and buildHeaderTransparent() — these should NOT use resolved colors (they use "base" which is universal).
```

### Wave 2: Sequential (after all 3 agents complete)

**Agent 4: Integration Smoke Test**
```
Task: Run the full test suite and verify no regressions.

1. Run: `cd backend && php artisan test`
   - ALL existing tests must pass
   - The new CorePaletteResolverTest must pass
2. Validate JSON files:
   - `python3 -c "import json; json.load(open('pattern-library/skeleton-registry.json'))"`
   - `python3 -c "import json; json.load(open('pattern-library/vertical-recipes.json'))"`
   - `python3 -c "import json; json.load(open('pattern-library/font-pairings.json'))"`
   - `python3 -c "import json; json.load(open('proven-cores/cores.json'))"`
3. Verify proven-cores directory structure:
   - Each core in cores.json (except blockbase) has a theme.json file
   - Blockbase falls back to Ollie (confirmed by ThemeAssembler logic)
4. Count skeletons: `ls pattern-library/skeletons/*.html | wc -l`
   Should be 31 files.

If anything fails, fix it and re-run. Commit fixes with descriptive message.
```

## Skills to Use

- `superpowers:dispatching-parallel-agents` for Wave 1
- `superpowers:verification-before-completion` for Wave 2
- `superpowers:test-driven-development` for Agent 1 (writing the unit test)

## Critical Rules

1. DO NOT modify any skeleton file's block structure or content tokens — only fix color slug issues if found
2. DO NOT change CorePaletteResolver's PALETTE_MAP unless you find a confirmed mapping error
3. DO NOT touch vertical-recipes.json, skeleton-registry.json, or font-pairings.json
4. The footer heredoc uses PHP variable interpolation (`{$bgColor}`) — these are NOT WordPress tokens
5. All skeletons use `{{TOKEN_NAME}}` for content — these are runtime-injected, they SHOULD exist in source files

## Success Criteria

- Agent 1: CorePaletteResolverTest passes with 5+ test methods
- Agent 2: All 31 skeletons pass audit with zero TT4 slugs
- Agent 3: Footer has exactly 13 color interpolations, all correctly paired
- Agent 4: `php artisan test` passes, all JSON files valid, 31 skeletons counted
