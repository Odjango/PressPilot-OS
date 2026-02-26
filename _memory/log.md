# Work Log

Chronological notes of tasks, decisions, blockers, and validation runs.

---

## 2026-02-23 — Block Config Validation

**Task:** Implement two-checkpoint block attribute completeness validation to prevent incomplete block configs from shipping.

**What was built:**
- `BlockAttributeSchema.ts` — defines required/recommended attributes + valid values per block type
- `BlockConfigValidator.ts` — static validator that parses block JSON from HTML and checks completeness
- `PatternInjector.validateAndWrite()` — pre-file-write hook that logs issues before every HTML write
- `bin/generate.ts` Step 2C — pre-ZIP gate that scans ALL HTML files and blocks ZIP creation on critical issues
- Content manifest (`{slug}-manifest.json`) written alongside ZIP with slot→value map

**Decisions made:**
- Pre-write hook logs but does NOT block writes (early visibility without aborting assembly)
- Pre-ZIP gate is the hard stop (CRITICAL = exit 1, no download)
- `core/cover` `dimRatio` flagged as CRITICAL (most common silent crash cause)
- `core/template-part` `slug` flagged as CRITICAL (missing slug = header/footer disappears)
- `core/social-link` `service` + `url` both CRITICAL (broken icon + dead link)
- Content manifest written only when `result.slots` is non-empty

**TypeScript:** `npx tsc --noEmit` passes cleanly.

**Follow-ups:** Commit, then continue diagnosing P5 generation stall.

---

## 2026-02-26 — Project Audit, Memory Consolidation & Cleanup

**Context:** Omar (graphic designer, non-coder) requested a full health check of the project after working across multiple AI agents and IDEs. The project had accumulated significant organizational debt.

**Audit Findings:**
- Generator engine: solid. All 5 verticals production-ready, P1–P4 resolved.
- 4 competing memory systems coexisting: `_memory/`, `BRAIN/MEMORY/`, `.agent_memory/`, `memory/`
- Multiple conflicting AI instruction files at root level, some from wrong projects
- ~2,200 clutter files at root: debug logs, test ZIPs, old scripts, legacy folders, manual fix files, old workflow JSONs, build artifacts, 341 test output runs

**What was done:**

1. **Committed accumulated post-Feb-23 work** (`cccc07d`) — FSE KB docs, OneContext memory, Claude rules, GitHub Copilot instructions, WP smoke test screenshots, updated docs.

2. **Memory Consolidation:**
   - Winner: `BRAIN/MEMORY/` — most structured, referenced by `agent-protocol.md`, kept as canonical
   - `_memory/` kept in place — required by OneContext plugin (user explicitly installed it)
   - Unique content migrated from `.agent_memory/` → `BRAIN/MEMORY/coding_standards.md` + `BRAIN/MEMORY/user_profile.md`
   - `.agent_memory/` and `memory/db.json` archived to `Project Extras/archived-memory/`

3. **Instruction File Cleanup:**
   - Archived: `AGENTS.md` (generic 3-layer template — not PressPilot-specific), `AGENT_PROTOCOL.md` (Antigravity Autonomy Protocol — belongs to WPaify project), `gemini.md`
   - Kept: `CLAUDE.md`, `AI_INSTRUCTIONS.md`, `CONTRIBUTING.md`, `BRAIN/CONSTITUTION/agent-protocol.md`, `.claude/rules/WP_FSE_SKILL.md`, `.github/instructions/wp-fse.instructions.md`

4. **Project Extras folder created:**
   - `debug-logs/` — manual_fix_v1-v8, validation.log, error logs, playwright-report
   - `test-zips/` — all test-theme-*.zip and factory ZIPs
   - `old-scripts/` — debug scripts, cleanup utilities, test-validators.ts, PHP tools
   - `old-workflows/` — workflows.json v1-v3, kilo-code-settings, old configs
   - `old-docs/` — BUGFIX_REPORT, CAPABILITIES, HANDOVER, V3-ROADMAP, spec/, reports/
   - `test-output-runs/` — output/ (341 items), themes/ (190 folders), generated-themes/
   - `legacy-folders/` — n8n, factory-plugin v1+v2, presspilot-patterns, ollie, stages, bases, build, showcase, proven-cores, mu-plugins, php-generator, legacy folders from multiple past dev phases
   - `archived-memory/` + `archived-instructions/` — retired systems

5. **TypeScript fix:** Added `"Project Extras"` to `tsconfig.json` exclude list. Legacy `.ts` files in archive no longer pollute compilation. `npx tsc --noEmit` passes cleanly.

**Git commits:** `cccc07d`, `41977ad`, `509eb6c`, `3d3848e`

**Decisions made:**
- `presspilot.os.json` kept at root — imported by `lib/presspilot/kitRegistry.ts` and `lib/presspilot/variationRegistry.ts`
- `Project Extras/` is a folder, not a git submodule — all moves tracked as renames
- No functional code was changed — pure reorganization

**Follow-ups:**
- P5 diagnosis: Laravel/Horizon generation stall at DELIVER step (needs Docker container log path)
- Update `docs/KNOWN_ISSUES.md` to mark P1–P4 resolved
- Magazine Gallery: 52 theme combinations to generate
