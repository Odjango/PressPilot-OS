# Phase 2.7 — Step-by-Step Execution Index

> **IMPORTANT:** Execute ONE step at a time. Each step is a self-contained task file.
> Do NOT load the full PHASE-2.7-QUALITY-FIX.md spec — it's too large. Use these individual step files instead.

## Execution Order

| Step | File | What it does | Depends on |
|------|------|-------------|------------|
| 1 | `STEP-1-SKELETONS.md` | Create ~20 fully-tokenized HTML skeleton patterns | None |
| 2 | `STEP-2-REGISTRY.md` | Create skeleton-registry.json + vertical-recipes.json | Step 1 |
| 3 | `STEP-3-TOKEN-SCHEMA.md` | Rewrite token-schema.json with all skeleton tokens | Step 1 |
| 4 | `STEP-4-AIPLANNER.md` | Rewrite AIPlanner.php for vertical-specific content | Steps 2, 3 |
| 5 | `STEP-5-PATTERNSELECTOR.md` | Rewrite PatternSelector.php for recipe-based selection | Step 2 |
| 6 | `STEP-6-TOKENINJECTOR.md` | Update TokenInjector.php with block validation | Steps 1, 3 |
| 7 | `STEP-7-THEMEASSEMBLER.md` | Update ThemeAssembler.php with PressPilot footer + inner pages | Steps 1-6 |
| 8 | `STEP-8-GENERATETHEMEJOB.md` | Wire updated services in GenerateThemeJob.php | Steps 4-7 |
| 9 | `STEP-9-VERIFICATION.md` | Generate 5 themes and verify quality | Step 8 |

## How to Execute

1. Open the step file (e.g., `STEP-1-SKELETONS.md`)
2. Read ONLY that file — it has everything you need
3. Complete all tasks in the file
4. Run the verification checks at the bottom of the file
5. Move to the next step

## Parallel Execution

Steps 2 and 3 can run in parallel (both depend only on Step 1).
Steps 4, 5, and 6 can run in parallel (they modify different files).
Steps 7 and 8 must be sequential (8 depends on 7).
