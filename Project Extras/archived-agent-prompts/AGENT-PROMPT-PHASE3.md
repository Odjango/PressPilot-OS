# Agent Prompt: PressPilot Generator Fix Plan — Phase 3 (Automated WordPress Validation)

> **Copy-paste this entire prompt to your AI coding agent to begin Phase 3.**
> **Prerequisite:** Phase 1 must be complete. Phase 2 (P5 fix) can be done in parallel if needed.

---

## YOUR ROLE

You are a Senior Engineer working on PressPilot OS, a SaaS that generates WordPress FSE themes. You are implementing the automated WordPress Playground validation pipeline — the key differentiator that will make this the best FSE theme generator in the industry.

## BEFORE YOU START

Read these files in this exact order:
1. `_memory/main.md` — Current project state
2. `CLAUDE.md` — Theme structure requirements, block markup rules
3. `GENERATOR-FIX-PLAN.md` — The full 4-phase plan (you are doing Phase 3)
4. `src/generator/validators/BlockConfigValidator.ts` — Understand the existing static validator
5. `src/generator/validators/blocks/BlockAttributeSchema.ts` — Understand block attribute specs
6. `bin/generate.ts` — Understand the generation pipeline and where validation happens
7. `scripts/playground/validate-theme.js` — The current stub you're replacing
8. `themes/gold-standard-restaurant/` — The reference theme you'll validate against

Also read the `@wp-playground/node` documentation to understand the API:
- Check npm: `npm info @wp-playground/node`
- The key API is: create a Playground instance, install a theme, navigate to pages, inspect DOM

## WHAT YOU'RE BUILDING

A `PlaygroundValidator` that boots a WordPress Playground instance in-process, installs a generated theme, and checks for errors — all without Docker, external services, or network calls.

This replaces the current stub validation with real, live WordPress testing as a build gate.

## PHASE 3 TASKS

### Task 3.1: Install `@wp-playground/node`

```bash
npm install @wp-playground/node
```

Verify it installs cleanly. Check for peer dependency conflicts. This goes in `dependencies`, not `devDependencies`, because it will be used in the generation pipeline.

If `@wp-playground/node` doesn't exist or has a different package name, check:
- `@wp-playground/client`
- `@php-wasm/node`
- The WordPress Playground GitHub repo for the correct Node.js package

### Task 3.2: Create PlaygroundValidator

Create `src/generator/validators/PlaygroundValidator.ts`:

```typescript
import path from 'path';
import fs from 'fs';

// Types
export interface PlaygroundValidationResult {
  valid: boolean;
  errors: PlaygroundError[];
  warnings: PlaygroundWarning[];
  duration: number; // ms
  templatesChecked: string[];
}

export interface PlaygroundError {
  type: 'attempt-recovery' | 'block-error' | 'php-error' | 'js-error' | 'missing-template' | 'white-screen';
  message: string;
  template?: string;
  block?: string;
}

export interface PlaygroundWarning {
  type: 'php-notice' | 'deprecated' | 'missing-optional';
  message: string;
  template?: string;
}

export interface PlaygroundValidatorOptions {
  /** Theme directory to validate (NOT the ZIP — validate pre-archive) */
  themeDir: string;
  /** Max time in ms before timeout (default: 30000) */
  timeout?: number;
  /** Templates to check (default: all standard templates) */
  templates?: string[];
  /** Whether to capture screenshots (default: false) */
  captureScreenshots?: boolean;
  /** Directory to save screenshots (default: themeDir + '/screenshots') */
  screenshotDir?: string;
}
```

Implementation requirements:

1. **Boot Playground**: Create a WordPress Playground instance with:
   - WordPress 6.4+ (latest stable)
   - No plugins (clean environment)
   - The theme installed and activated

2. **Theme Installation**:
   - ZIP the theme directory into a temp file
   - Install it via Playground's theme installation API
   - Activate it
   - If Playground doesn't have a direct "install theme from ZIP" API, use the PHP execution API to:
     ```php
     // Copy theme files to wp-content/themes/
     // Then: switch_theme('theme-slug');
     ```

3. **Template Validation**: For each template (index.html, front-page.html, page.html, single.html, 404.html):
   - Navigate to the Site Editor for that template
   - Check for "Attempt Recovery" banner (DOM selector: `.block-editor-block-list__layout .block-editor-warning`)
   - Check for block error boundaries (`.block-editor-block-list__block.has-error`)
   - Check JavaScript console for errors
   - Check for PHP fatal errors (white screen / WP error page)

4. **Error Classification**:
   - `attempt-recovery`: The "This block contains unexpected or invalid content" banner — CRITICAL
   - `block-error`: Block-specific error boundary — CRITICAL
   - `php-error`: PHP fatal/error — CRITICAL
   - `js-error`: JavaScript errors in console — WARNING (unless it prevents rendering)
   - `white-screen`: Page returned empty — CRITICAL
   - `missing-template`: Template file exists but WordPress can't render it — WARNING

5. **Timeout Handling**:
   - If Playground boot takes > timeout, return a WARNING result (NOT a failure)
   - Log the timeout clearly
   - Don't block ZIP creation on infrastructure issues

6. **Cleanup**: Always destroy the Playground instance, even on error (use try/finally)

### Task 3.3: Wire into Generation Pipeline

Edit `bin/generate.ts`:

1. Import PlaygroundValidator
2. After `BlockConfigValidator` check (Step 2C) and before ZIP creation, add Step 2D:

```typescript
// Step 2D: WordPress Playground validation
console.error('[STEP 2D] Running WordPress Playground validation...');
const playgroundResult = await PlaygroundValidator.validate({
  themeDir: themeDir,
  timeout: 30000,
  templates: ['index', 'front-page', 'page', 'single', '404']
});

if (!playgroundResult.valid) {
  const criticalErrors = playgroundResult.errors.filter(
    e => ['attempt-recovery', 'block-error', 'php-error', 'white-screen'].includes(e.type)
  );
  if (criticalErrors.length > 0) {
    console.error('[STEP 2D] ❌ Playground validation FAILED:');
    criticalErrors.forEach(e => console.error(`  - ${e.type}: ${e.message} (template: ${e.template})`));
    process.exit(1);
  }
}

// Log warnings (don't block)
playgroundResult.warnings.forEach(w =>
  console.error(`[STEP 2D] ⚠️ ${w.type}: ${w.message}`)
);
console.error(`[STEP 2D] ✅ Playground validation passed (${playgroundResult.duration}ms)`);
```

3. **Feature flag**: Add `SKIP_PLAYGROUND_VALIDATION=true` environment variable to bypass this step (for development speed). In production, it should always run.

### Task 3.4: Replace Stub Scripts

Rewrite `scripts/playground/validate-theme.js` → `scripts/playground/validate-theme.ts`:

```typescript
#!/usr/bin/env tsx
import { PlaygroundValidator } from '../../src/generator/validators/PlaygroundValidator';

const themeDir = process.argv[2];
if (!themeDir) {
  console.error('Usage: tsx validate-theme.ts <theme-directory>');
  process.exit(1);
}

const result = await PlaygroundValidator.validate({
  themeDir,
  timeout: 30000,
  captureScreenshots: true
});

console.log(JSON.stringify(result, null, 2));
process.exit(result.valid ? 0 : 1);
```

Rewrite `scripts/playground/validate-all-cores.ts`:
- Loop through all proven cores in `proven-cores/cores.json`
- For each core that has a theme directory, run PlaygroundValidator
- Generate `proven-cores/HEALTH_MATRIX.md` with REAL results
- Include: pass/fail, error count, warnings, validation duration

### Task 3.5: Add npm Scripts

In `package.json`, add:
```json
{
  "scripts": {
    "validate:theme": "tsx scripts/playground/validate-theme.ts",
    "validate:all-cores": "tsx scripts/playground/validate-all-cores.ts",
    "validate:gold-standard": "tsx scripts/playground/validate-theme.ts themes/gold-standard-restaurant"
  }
}
```

### Task 3.6: Tests

Create `tests/unit/playground-validator.test.ts`:

1. **Happy path**: Validate gold-standard-restaurant → should pass
2. **Broken cover block**: Create a temp theme with a `core/cover` missing `dimRatio` → should detect `attempt-recovery`
3. **Missing template part**: Create a temp theme with `<!-- wp:template-part {"slug":"nonexistent"} /-->` → should detect the missing part
4. **Timeout handling**: Test with timeout=1 → should return warning, not crash
5. **Cleanup**: Verify Playground instance is destroyed after each test (no resource leaks)

## IMPORTANT CONSTRAINTS

- **Do NOT modify the generator engine** (ContentBuilder, PatternInjector, StyleEngine, recipes, design tokens)
- **Do NOT modify existing validators** (BlockConfigValidator, StructureValidator, TokenValidator, BlockValidator)
- **Do NOT modify any section patterns or templates**
- The PlaygroundValidator is an ADDITION to the validation pipeline, not a replacement for existing validators
- If `@wp-playground/node` API doesn't support what you need, document the limitation and implement the closest possible alternative
- If Playground can't inspect the Site Editor DOM directly, consider:
  - Navigating to the frontend (not editor) and checking for PHP errors
  - Using Playground's PHP execution API to run `switch_theme()` + `wp_get_theme()` checks
  - Using the REST API to check template rendering

## SUCCESS CRITERIA

- [ ] `@wp-playground/node` (or equivalent) installed
- [ ] `src/generator/validators/PlaygroundValidator.ts` created and working
- [ ] `bin/generate.ts` has Step 2D wired in (with feature flag)
- [ ] `scripts/playground/validate-theme.ts` replaces the stub
- [ ] `scripts/playground/validate-all-cores.ts` replaces the stub
- [ ] `npm run validate:gold-standard` passes
- [ ] At least 3 unit tests passing
- [ ] `npx tsc --noEmit` passes
- [ ] `proven-cores/HEALTH_MATRIX.md` updated with real results
- [ ] Git commit: `feat(validator): PlaygroundValidator — live WordPress theme validation`

## OUTPUT FORMAT

When complete, report:
1. What files were created/modified
2. PlaygroundValidator test results (gold standard + broken theme)
3. HEALTH_MATRIX real results (which cores pass, which fail, why)
4. Any limitations or workarounds needed
5. `npx tsc --noEmit` result
6. Git commit hash
7. Confirmation: "Phase 3 complete. Ready for Phase 4."
