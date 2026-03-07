# Agent Prompt: PressPilot Generator Fix Plan — Phase 4 (Hardening & Documentation)

> **Copy-paste this entire prompt to your AI coding agent to begin Phase 4.**
> **Prerequisite:** Phase 1 and Phase 3 must be complete.

---

## YOUR ROLE

You are a Senior Engineer working on PressPilot OS. You are executing the final hardening phase to make this the best WordPress FSE theme generator in the industry.

## BEFORE YOU START

Read these files:
1. `_memory/main.md` — Current project state
2. `CLAUDE.md` — Theme structure requirements
3. `GENERATOR-FIX-PLAN.md` — The full 4-phase plan (you are doing Phase 4)
4. `src/generator/validators/BlockConfigValidator.ts` — Existing validator to extend
5. `src/generator/modules/ContentBuilder.ts` — Where slots are defined
6. `bin/generate.ts` — Generation pipeline

## PHASE 4 TASKS

### Task 4.1: Input Schema Validation

Create `src/generator/validators/InputValidator.ts`:

Purpose: Validate the JSON input to `bin/generate.ts` BEFORE any generation starts. Catch bad data early with actionable error messages.

Required validations:
- `base` field exists and is one of the valid base themes (check `proven-cores/cores.json` for the list)
- `mode` field exists and is `"standard"` or `"heavy"`
- `brandMode` is one of: `"modern"`, `"playful"`, `"bold"`, `"minimal"`
- `slug` is present and is a valid slug (lowercase, hyphens, no spaces)
- `outDir` is present and is a valid writable directory
- `data` object exists and has:
  - `businessName` (required, string, 1–100 chars)
  - `businessDescription` (optional, string, max 500 chars)
  - `businessCategory` (optional, string)
  - `tagline` (optional, string, max 150 chars)
  - `email` (optional, valid email format if present)
  - `phone` (optional, string)
  - `address` (optional, string)
  - Colors: if `primaryColor` is present, must be valid hex (#000000 format)
  - URLs: if `website`, `facebook`, `instagram` etc. are present, must be valid URLs

Return type:
```typescript
interface InputValidationResult {
  valid: boolean;
  errors: { field: string; message: string }[];
  warnings: { field: string; message: string }[];
}
```

Wire into `bin/generate.ts` as Step 0 (before anything else):
```typescript
// Step 0: Input validation
const inputResult = InputValidator.validate(input);
if (!inputResult.valid) {
  console.error('[STEP 0] ❌ Invalid input:');
  inputResult.errors.forEach(e => console.error(`  - ${e.field}: ${e.message}`));
  process.exit(1);
}
```

### Task 4.2: Content Length Safety

In `src/generator/modules/ContentBuilder.ts`, add smart truncation for all slot values.

Create a utility function:
```typescript
function truncateSlot(value: string, maxLength: number, label: string): string {
  if (value.length <= maxLength) return value;
  console.error(`[ContentBuilder] ⚠️ Truncated ${label}: ${value.length} → ${maxLength} chars`);
  return value.substring(0, maxLength - 1) + '…';
}
```

Apply to all slots with these limits:
| Slot Category | Max Length | Examples |
|---------------|-----------|---------|
| Business name | 60 chars | BUSINESS_NAME |
| Headlines/titles | 80 chars | HERO_TITLE, SERVICES_TITLE, PRICING_TITLE |
| Tagline/pretitle | 100 chars | HERO_PRETITLE |
| Body text (short) | 200 chars | HERO_TEXT, ABOUT_TEXT |
| Body text (long) | 400 chars | Descriptions, FAQ answers |
| Email | 254 chars | CONTACT_EMAIL |
| Phone | 20 chars | CONTACT_PHONE |
| URL | 2048 chars | SOCIAL_FACEBOOK, etc. |

This prevents layout overflow in fixed-width block patterns.

### Task 4.3: Accessibility Validator

Create `src/generator/validators/AccessibilityValidator.ts`:

This validator checks the generated theme HTML files for accessibility basics.

Required checks:

1. **Image alt text**: Every `<img` tag must have a non-empty `alt` attribute
   - Empty alt (`alt=""`) is acceptable for decorative images
   - Missing `alt` attribute entirely = ERROR

2. **Button content**: Every `<!-- wp:button -->` block must have visible text content (not just whitespace)

3. **Heading hierarchy**: Parse all headings (h1–h6) in each template
   - No skipped levels (h1 → h3 without h2 = WARNING)
   - Only one h1 per page (multiple h1s = WARNING)
   - Headings must have text content (empty heading = ERROR)

4. **Color contrast**: Using the theme.json palette:
   - Check foreground/background ratio meets WCAG AA (4.5:1 for normal text, 3:1 for large text)
   - Check primary color on background meets AA
   - This is a static check using hex values from theme.json, not a live render check

5. **Link text**: Links should not use generic text like "Click here" or "Read more" without context
   - This is a WARNING, not an error

Wire into `bin/generate.ts` after PlaygroundValidator (Step 2E):
```typescript
// Step 2E: Accessibility check
const a11yResult = AccessibilityValidator.validate(themeDir);
a11yResult.errors.forEach(e => console.error(`[A11Y] ❌ ${e.message}`));
a11yResult.warnings.forEach(w => console.error(`[A11Y] ⚠️ ${w.message}`));
// Accessibility errors are warnings, not build-blockers (yet)
```

### Task 4.4: Update All Documentation

1. **`PHASE-0-COMPLETION-SUMMARY.md`**: Should already be updated from Phase 1. Verify it's accurate.

2. **`docs/KNOWN_ISSUES.md`**: Should already have P1–P4 resolved. Add P5 resolution if Phase 2 was completed. If not, keep P5 as open.

3. **`proven-cores/HEALTH_MATRIX.md`**: Should have real results from Phase 3. Verify it reflects actual Playground validation.

4. **`_memory/main.md`**: Add a new section:
   ```markdown
   ## Generator Fix Plan Completion (2026-03-XX)
   - Phase 1: Checkpoint complete — gold standard ZIP rebuilt, dead code removed
   - Phase 2: P5 diagnosis — [status]
   - Phase 3: PlaygroundValidator — live WordPress validation as build gate
   - Phase 4: InputValidator + ContentBuilder truncation + AccessibilityValidator
   - All validators: InputValidator → BlockConfigValidator → PlaygroundValidator → AccessibilityValidator
   ```

5. **`docs/AGENT_CONTEXT_MASTER.md`**: Update Section 4 (Current Mission) to reflect completed work:
   ```markdown
   ## 4. CURRENT MISSION: Production Hardening Complete

   - P1–P4: Resolved (Feb 21)
   - P5: [RESOLVED/OPEN — based on Phase 2 status]
   - Generator Fix Plan: Complete (4 phases)
   - Validation pipeline: InputValidator → BlockConfigValidator → PlaygroundValidator → AccessibilityValidator
   - All 5 verticals production-ready with automated WordPress validation
   ```

### Task 4.5: Full Verification Suite

Run every test and validation command. ALL must pass:

```bash
# Type check
npx tsc --noEmit

# Unit tests
npm test

# Gold standard validation
npm run validate:gold-standard

# All proven cores validation
npm run validate:all-cores

# WordPress smoke tests (if WordPress is available)
npm run test:wp:smoke
```

For any failure:
1. Diagnose the root cause
2. Fix it
3. Re-run the full suite
4. Repeat until all green

### Task 4.6: Git Tag

```bash
git add -A
git commit -m "feat: Phase 4 complete — InputValidator, AccessibilityValidator, content safety, docs updated

- InputValidator: schema validation for generator input (Step 0)
- ContentBuilder: smart truncation for all slots (prevents layout overflow)
- AccessibilityValidator: image alt, heading hierarchy, color contrast
- All documentation updated to reflect current state
- Full test suite passing"

git tag v2.0.0-validated -m "First version with full automated WordPress validation pipeline"
```

## IMPORTANT CONSTRAINTS

- Do NOT modify existing validators (add new ones alongside them)
- Do NOT modify section patterns, recipes, or design tokens
- Do NOT change the generation pipeline order (only ADD steps)
- InputValidator errors MUST block generation (exit 1)
- Accessibility issues are warnings only (do NOT block generation)
- Content truncation must be transparent (log when it happens, but don't fail)

## SUCCESS CRITERIA

- [ ] `src/generator/validators/InputValidator.ts` created and wired into pipeline
- [ ] ContentBuilder has truncation on all slot values
- [ ] `src/generator/validators/AccessibilityValidator.ts` created and wired into pipeline
- [ ] All documentation updated and accurate
- [ ] `npx tsc --noEmit` passes
- [ ] `npm test` passes
- [ ] `npm run validate:gold-standard` passes
- [ ] Git tag `v2.0.0-validated` created
- [ ] No regressions in any existing tests

## OUTPUT FORMAT

When complete, report:
1. Files created/modified
2. Full test suite results
3. Validation pipeline summary (all validators in order)
4. Any decisions or tradeoffs made
5. Git commit hash and tag
6. Confirmation: "Phase 4 complete. Generator Fix Plan done. v2.0.0-validated tagged."
