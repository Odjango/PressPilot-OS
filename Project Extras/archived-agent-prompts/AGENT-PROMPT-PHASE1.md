# Agent Prompt: PressPilot Generator Fix Plan — Phase 1 (Checkpoint & Hygiene)

> **Copy-paste this entire prompt to your AI coding agent to begin Phase 1.**

---

## YOUR ROLE

You are a Senior Engineer working on PressPilot OS, a SaaS that generates WordPress FSE themes. You are executing Phase 1 of a 4-phase fix plan to make this the best FSE theme generator in the industry.

## BEFORE YOU START

Read these files in this exact order — do NOT skip any:
1. `_memory/main.md` — Current project state, architecture decisions, what's been done
2. `docs/AGENT_CONTEXT_MASTER.md` — Vision, constraints, operational protocol
3. `CLAUDE.md` — Theme structure requirements, block markup rules, validation checklist
4. `GENERATOR-FIX-PLAN.md` — The full 4-phase plan (you are doing Phase 1 only)

## PHASE 1 TASKS (Execute in order)

### Task 1.1: Rebuild Gold Standard ZIP

The gold standard restaurant theme at `themes/gold-standard-restaurant/` has been fully audited and cleaned. All Ollie references removed, all assets present, all block markup standalone.

1. Delete the old ZIP if it exists: `themes/gold-standard-restaurant.zip`
2. Create a new ZIP from the `themes/gold-standard-restaurant/` directory
3. Use Node.js (Archiver or AdmZip — check `package.json` for which is installed)
4. Verify the ZIP by listing its contents — must include:
   - `style.css` (with PressPilot header, NOT Ollie)
   - `theme.json` (valid JSON, version 3)
   - `functions.php` (namespace gold-standard-restaurant, NOT ollie)
   - `index.php` ("Silence is golden")
   - `templates/` (index.html, front-page.html, page.html, single.html, 404.html, + others)
   - `parts/header.html` (inline block markup, NOT `ollie/header-light`)
   - `parts/footer.html` (inline block markup with PressPilot credit)
   - `patterns/` (all .php files)
   - `assets/fonts/Mona-Sans.woff2`
5. Verify with: `grep -r "ollie" themes/gold-standard-restaurant.zip` should return nothing (or use unzip -l to list, then grep the extracted content)

### Task 1.2: Update Phase 0 Completion Summary

Rewrite `PHASE-0-COMPLETION-SUMMARY.md` with honest status:

```markdown
# Phase 0 Completion Summary

**Date:** 2026-03-03 (Updated after independent audit)
**Status:** Foundation Complete — Validation Infrastructure is Scaffolding Only

## Task Status

| Task | Status | Notes |
|------|--------|-------|
| 0.1 — Install WP Playground CLI | ✅ Complete | `@wp-playground/cli@3.1.3` in devDependencies |
| 0.2 — Validation Blueprint | ✅ Complete | `validate-theme.blueprint.json` created |
| 0.3 — Validation Scripts | ⚠️ Scaffolding | Scripts exist but return hardcoded results. `@wp-playground/node` NOT installed. No actual Playground execution. |
| 0.4 — Validate All Cores | ⚠️ Scaffolding | HEALTH_MATRIX shows 0/6 passing (honest). Validation not implemented. |
| 0.5 — Gold Standard Theme | ✅ Complete | Fully standalone. No Ollie dependencies. All assets present. Block markup valid. Independently audited. |

## What "Scaffolding Only" Means

The validation scripts (`validate-theme.js`, `validate-all-cores.js`) have the correct structure
(blueprint generation, ZIP handling, JSON output) but do NOT actually:
- Launch WordPress Playground
- Install themes in a live environment
- Inspect DOM for "Attempt Recovery" errors
- Capture screenshots

This will be addressed in Phase 3 of the Generator Fix Plan with `@wp-playground/node` integration.

## Gold Standard Theme Audit

The `themes/gold-standard-restaurant/` theme was independently audited across 4 rounds:
- All Ollie namespace references removed (functions.php, templates, patterns, CSS classes)
- All broken asset references fixed (avatar images → placehold.co URLs)
- Font path corrected in theme.json (matches actual file location)
- All body copy rewritten to restaurant context (no "Ollie" marketing text)
- PressPilot credit in footer confirmed
- style.css header fully compliant with CLAUDE.md spec
```

### Task 1.3: Clean Dead Code in renderer.ts

Open `src/generator/recipes/renderer.ts`.

1. First, determine if `SECTION_RENDERERS` (Phase 2 legacy) is actually called anywhere:
   ```bash
   grep -rn "SECTION_RENDERERS\b" src/ --include="*.ts" | grep -v "SECTION_RENDERERS_V2"
   ```
2. If `SECTION_RENDERERS` is only used as a fallback in `renderSectionsWithRecipe()` or similar:
   - Check if the fallback path is ever hit (all 5 verticals use heavy mode which goes through V2)
   - If it's dead code: remove the entire `SECTION_RENDERERS` object
   - If it's a fallback: keep only the 6 non-stub entries (hero, story, menu-preview, promo-band, testimonials, final-cta) and remove the 41 stubs that return `''`
3. Run `npx tsc --noEmit` after changes to ensure type safety

### Task 1.4: Fix Known Data Issues

1. **Fix broken URL in `proven-cores/cores.json`:**
   - Find the entry for Frost with `"source": "https://github.com/g Theme/frost"` (broken — has a space)
   - Fix to: `"source": "https://github.com/developer-developer/developer-starter-theme"` or whatever the correct GitHub URL is for the Frost theme
   - If you can't determine the correct URL, use: `"source": "https://developer.wordpress.org/themes/frost/"`

2. **Update `docs/KNOWN_ISSUES.md`:**
   - Mark P1 (Hero preview captures wrong section) as RESOLVED (Feb 21)
   - Mark P2 (Site Editor "Attempt Recovery" on testimonials) as RESOLVED (Feb 21)
   - Mark P3 (Apostrophe encoding) as RESOLVED (Feb 20)
   - Mark P4 (Header embedded inside fullBleed hero Cover block) as RESOLVED (Feb 21)
   - Keep P5 (Generation stall at "Building Your Assets") as OPEN/UNDIAGNOSED
   - Reference commit hashes from `_memory/main.md`

### Task 1.5: Stage Phase 0 Audit Fixes (IMPORTANT — Don't Miss These)

During the independent Phase 0 audit (prior session), two pattern files were edited directly to fix broken avatar image references. These changes are ON DISK but NOT YET COMMITTED. They must be included in this commit.

Files already modified (verify with `git diff`):
- `themes/gold-standard-restaurant/patterns/testimonials-and-logos.php` — 4 broken `get_template_directory_uri()` avatar references replaced with `placehold.co` URLs
- `themes/gold-standard-restaurant/patterns/team-members.php` — 6 broken avatar references replaced (3 in block comment JSON `"url":` attrs + 3 in `<img src>`), names/roles updated to restaurant context, intro copy rewritten

Verify these changes are present:
```bash
git diff themes/gold-standard-restaurant/patterns/testimonials-and-logos.php
git diff themes/gold-standard-restaurant/patterns/team-members.php
```

If the diffs show the placehold.co URLs, stage them. If not, check `git stash list` or the session transcript — the changes must not be lost.

### Task 1.6: Git Commit

```bash
git add themes/gold-standard-restaurant.zip \
  PHASE-0-COMPLETION-SUMMARY.md \
  src/generator/recipes/renderer.ts \
  proven-cores/cores.json \
  docs/KNOWN_ISSUES.md \
  themes/gold-standard-restaurant/patterns/testimonials-and-logos.php \
  themes/gold-standard-restaurant/patterns/team-members.php
git commit -m "chore: Phase 0 checkpoint — gold standard clean, dead code removed, audit fixes committed, docs updated"
```

Verify: `git status` is clean, `npx tsc --noEmit` passes.

## WHAT NOT TO DO

- Do NOT modify any generator core files (ContentBuilder, PatternInjector, StyleEngine, etc.)
- Do NOT change any test files
- Do NOT touch theme.json, block patterns, or section renderers (except removing dead stubs)
- Do NOT install new packages
- Do NOT start Phase 2 work (P5 diagnosis) — that requires server access

## SUCCESS CRITERIA

When done, confirm:
- [ ] `themes/gold-standard-restaurant.zip` exists and contains all required files
- [ ] `PHASE-0-COMPLETION-SUMMARY.md` reflects honest status
- [ ] Dead stub renderers removed from `renderer.ts` (or clearly justified if kept)
- [ ] `proven-cores/cores.json` has no broken URLs
- [ ] `docs/KNOWN_ISSUES.md` has P1–P4 marked resolved, P5 marked open
- [ ] Phase 0 audit fixes (testimonials + team-members patterns) are staged and committed
- [ ] `npx tsc --noEmit` passes
- [ ] Git commit created with clean status

## OUTPUT FORMAT

When complete, report:
1. What files were modified (list them)
2. `npx tsc --noEmit` result
3. Git commit hash
4. Any issues or decisions you made
5. Confirmation: "Phase 1 complete. Ready for Phase 2."
