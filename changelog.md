# PressPilot OS – Changelog

> Log only **meaningful, stable changes** here (new workflows, major decisions, architecture shifts).  

## Entries

## [Unreleased]

### Fixed
- Testimonials no longer trigger "Attempt Recovery" errors in WordPress Site Editor for restaurant/cafe outputs.
  - Root cause: Conflicting pattern registration (`general-testimonials-columns.php`) coexisted with recipe-rendered testimonials.
  - Solution: Removed restaurant registration of the legacy pattern and added explicit restaurant/cafe cleanup in `PatternInjector`.
- Business names with apostrophes now display correctly (for example, `Luigi's Pizza`).
  - Root cause: Double HTML-entity encoding (`'` -> `&#39;` -> `&amp;#39;`) through sanitize + PHP escaping stages.
  - Solution: Removed apostrophe entity encoding from sanitizer; PHP string escaping remains responsible for quote safety.

### Changed
- `src/generator/config/PatternRegistry.ts`: Removed `general-testimonials-columns.php` from Tove restaurant registration.
- `src/generator/engine/PatternInjector.ts`: Added explicit cleanup of `patterns/general-testimonials-columns.php` for restaurant/cafe generation.
- `src/generator/utils/sanitize.ts`: Removed single-quote to HTML entity conversion in `sanitizeForPHP()`.

- 2025-11-13 – Initial OS Skeleton  
  - Created core OS files: master-prompt.md, memory.md, workflows.json, modules.json.  
  - Added supporting structure: changelog.md, tasks.md, stages/.  
