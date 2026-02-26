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

## Entry 004
- Date: 2026-02-26
- Commit: `cccc07d` — chore: commit accumulated post-Feb23 work and project scaffolding
- Task: Committed all staged work that had accumulated since the Feb 23 BlockConfigValidator commit.
- Files added: `_memory/` system, `docs/fse-kb/` (7 batch files + index), `src/lib/fse-kb/`, FSE test runners, `AI_INSTRUCTIONS.md`, `CONTRIBUTING.md`, `.claude/rules/WP_FSE_SKILL.md`, `.github/instructions/wp-fse.instructions.md`, `SKILLS/user/wordpress-fse-blocks/SKILL.md`, WP smoke test screenshots for all 5 verticals.
- Files updated: `CLAUDE.md`, `README.md`, `changelog.md`, `docs/AGENT_CONTEXT_MASTER.md`, `docs/PROJECT_ROADMAP.md`, `package.json`, `universal-header.ts`.
- Behavior: No behavior change — pure scaffolding and docs commit.

## Entry 005
- Date: 2026-02-26
- Commits: `41977ad`, `509eb6c`, `3d3848e` — major project reorganization
- Task: Full project cleanup — memory consolidation, instruction file archiving, clutter removal.
- Memory: Consolidated 4 competing memory systems into 1. `BRAIN/MEMORY/` is now the canonical system. Migrated `coding_standards.md` and `identity.md` from `.agent_memory/` into `BRAIN/MEMORY/`. `_memory/` kept for OneContext. Archived `.agent_memory/` and `memory/`.
- Instructions: Archived `AGENTS.md` (generic template, not PressPilot-specific) and `AGENT_PROTOCOL.md` (belongs to WPaify/Antigravity, wrong project). Active instruction files: `CLAUDE.md`, `AI_INSTRUCTIONS.md`, `CONTRIBUTING.md`, `BRAIN/CONSTITUTION/agent-protocol.md`, `.claude/rules/`, `.github/instructions/`.
- Clutter: Created `Project Extras/` with 9 subfolders. Moved 2,211 tracked files off the root, including debug logs, test ZIPs, old scripts, old workflows, legacy folders, test output runs, old docs.
- tsconfig.json: Added `"Project Extras"` to exclude list — prevents archived `.ts` files from polluting TypeScript compilation.
- Behavior: No functional change. Generator, frontend, backend, all tests unchanged. TypeScript passes clean.
- Follow-ups: P5 diagnosis (Laravel/Horizon generation stall at DELIVER step).
