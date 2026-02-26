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
