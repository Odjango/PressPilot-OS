# Commit Memory

Use this file to capture concise notes for meaningful commits:
- date
- commit hash
- scope
- behavior change
- follow-ups

---

## Entry 001
- Date: 2026-02-21
- Task: Initialized persistent memory structure.
- Outcome: Created `_memory` folder with `main.md`, `commit.md`, and `log.md`. Synced project state.

## Entry 002
- Date: 2026-02-21
- Task: Fixed P2 validator landmine in vertical testimonial section renderers.
- Outcome: Replaced remaining `{{testimonial_*}}` placeholders in `saas-testimonials.ts`, `portfolio-testimonials.ts`, `ecommerce-testimonials.ts`, and `local-testimonials.ts` with sanitized dynamic values from `ctx.render.content` plus safe defaults. Confirmed no remaining mustache placeholders in those four files and `npx tsc --noEmit` passed.

## Entry 003
- Date: 2026-02-23
- Task: Block Config Validation — complete block attribute completeness system.
- Files created:
  - `src/generator/validators/blocks/BlockAttributeSchema.ts`
  - `src/generator/validators/BlockConfigValidator.ts`
- Files modified:
  - `src/generator/engine/PatternInjector.ts` (validateAndWrite + 12 call site swaps)
  - `bin/generate.ts` (expanded Step 2, getAllHtmlFiles helper, manifest write)
  - `src/generator/index.ts` (return slots in result)
- Behavior: ZIP now blocked on missing required block attributes. Content manifest written alongside ZIP. Pre-write logging for early diagnosis.
- `npx tsc --noEmit` passes.
- Follow-ups: Commit, then P5 stall diagnosis.
