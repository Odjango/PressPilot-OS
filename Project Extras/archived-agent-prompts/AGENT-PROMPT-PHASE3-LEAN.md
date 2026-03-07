# Phase 3: WordPress Playground Validation Pipeline (Lean Prompt)

## YOUR ROLE
Senior Engineer on PressPilot OS — a SaaS that generates WordPress FSE themes.

## CRITICAL CONTEXT (Don't read extra files — everything you need is here)

### Architecture correction
`@wp-playground/node` does NOT exist. Use the CLI instead:
```bash
npx @wp-playground/cli run-blueprint --blueprint=<path-to-blueprint.json>
```
This is already installed (`@wp-playground/cli@3.1.3` in devDependencies).

### Current validation pipeline in `bin/generate.ts`
```
Step 1: Parse input
Step 2: Build theme
Step 2C: BlockConfigValidator (static block attribute checks) — existing
Step 3: ZIP creation
```

You are adding **Step 2D** between 2C and 3.

### What exists today (stubs to replace)
- `scripts/playground/validate-theme.js` — stub that returns hardcoded `{valid: true}`
- `scripts/playground/validate-all-cores.js` — stub that returns 0/6 passing
- `themes/gold-standard-restaurant/` — fully working reference theme to validate against

---

## TASKS (Execute in order)

### Task 1: Create PlaygroundValidator

Create `src/generator/validators/PlaygroundValidator.ts`

**What it does:**
1. Takes a theme directory path
2. Creates a temporary blueprint JSON that:
   - Boots WordPress 6.4+
   - Installs the theme from the directory (ZIP it first to a temp file)
   - Activates the theme
   - Navigates to the homepage
   - Runs a PHP health check: `switch_theme()` succeeds, `wp_get_theme()->errors()` is empty, frontend renders without fatal
3. Runs `npx @wp-playground/cli run-blueprint --blueprint=<temp-blueprint.json>` as a subprocess via `child_process.execFile` or `child_process.spawn`
4. Parses stdout/stderr for:
   - PHP Fatal errors → CRITICAL
   - Theme activation failures → CRITICAL
   - WordPress "white screen" → CRITICAL
   - PHP Warnings/Notices → WARNING (don't block)
5. Returns structured result

**Types:**
```typescript
export interface PlaygroundValidationResult {
  valid: boolean;
  errors: { type: string; message: string; template?: string }[];
  warnings: { type: string; message: string }[];
  duration: number;
}

export interface PlaygroundValidatorOptions {
  themeDir: string;
  timeout?: number; // default 30000ms
}
```

**Key implementation details:**
- Use `child_process.execFile` with a timeout
- Blueprint JSON format — check `scripts/playground/validate-theme.blueprint.json` for the existing blueprint structure
- ZIP the theme dir to a temp file using `adm-zip` (already in node_modules)
- Clean up temp files in a `finally` block
- If the CLI subprocess times out or crashes, return a WARNING (not a failure) — don't block ZIP creation on infra issues

### Task 2: Wire into `bin/generate.ts`

After the BlockConfigValidator check (Step 2C), add:

```typescript
// Step 2D: WordPress Playground validation
if (process.env.SKIP_PLAYGROUND_VALIDATION !== 'true') {
  console.error('[STEP 2D] Running WordPress Playground validation...');
  const pgResult = await PlaygroundValidator.validate({ themeDir, timeout: 30000 });

  if (!pgResult.valid) {
    console.error('[STEP 2D] ❌ Playground validation FAILED:');
    pgResult.errors.forEach(e => console.error(`  - ${e.type}: ${e.message}`));
    process.exit(1);
  }

  pgResult.warnings.forEach(w => console.error(`[STEP 2D] ⚠️ ${w.type}: ${w.message}`));
  console.error(`[STEP 2D] ✅ Passed (${pgResult.duration}ms)`);
}
```

Read `bin/generate.ts` to find the exact insertion point (after BlockConfigValidator, before ZIP/archiver step).

### Task 3: Replace stub scripts

**`scripts/playground/validate-theme.ts`** (replace `.js` with `.ts`):
```typescript
#!/usr/bin/env tsx
import { PlaygroundValidator } from '../../src/generator/validators/PlaygroundValidator';

const themeDir = process.argv[2];
if (!themeDir) { console.error('Usage: tsx validate-theme.ts <theme-dir>'); process.exit(1); }

const result = await PlaygroundValidator.validate({ themeDir, timeout: 30000 });
console.log(JSON.stringify(result, null, 2));
process.exit(result.valid ? 0 : 1);
```

**`scripts/playground/validate-all-cores.ts`** (replace `.js`):
- Read `proven-cores/cores.json` for the list of cores
- For each core that has a theme in `themes/` or `proven-cores/`, validate it
- Write results to `proven-cores/HEALTH_MATRIX.md`

### Task 4: Add npm scripts to `package.json`

```json
"validate:theme": "tsx scripts/playground/validate-theme.ts",
"validate:all-cores": "tsx scripts/playground/validate-all-cores.ts",
"validate:gold-standard": "tsx scripts/playground/validate-theme.ts themes/gold-standard-restaurant"
```

### Task 5: Test

Run `npm run validate:gold-standard` — it should pass.

Create `tests/unit/playground-validator.test.ts` with at least:
1. Gold standard theme passes
2. Timeout returns warning (not crash)
3. Missing theme directory returns error

### Task 6: Verify and commit

```bash
npx tsc --noEmit
npm run validate:gold-standard
git add -A
git commit -m "feat(validator): PlaygroundValidator — CLI-based WordPress theme validation"
```

---

## CONSTRAINTS

- Do NOT modify ContentBuilder, PatternInjector, StyleEngine, recipes, or design tokens
- Do NOT modify existing validators (BlockConfigValidator, etc.) — only ADD the new one
- Do NOT use `@wp-playground/node` or `@php-wasm/node` — they don't work. CLI subprocess only.
- If the CLI has issues, document them and implement the best possible fallback

## SUCCESS CRITERIA

- [ ] `PlaygroundValidator.ts` created using CLI subprocess approach
- [ ] Wired into `bin/generate.ts` as Step 2D (with `SKIP_PLAYGROUND_VALIDATION` env flag)
- [ ] Stub scripts replaced with real implementations
- [ ] `npm run validate:gold-standard` works
- [ ] `npx tsc --noEmit` passes
- [ ] Git commit created

## OUTPUT

Report: files created/modified, test results, any limitations, commit hash.
