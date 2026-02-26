# PressPilot OS – Changelog

> Log only **meaningful, stable changes** here (new workflows, major decisions, architecture shifts).  

## Entries

## [Unreleased]

### Added
- **FSE Knowledge Base Integration** - Complete WordPress 6.7+ block specification system
  - 9 markdown documentation files covering 39+ WordPress core blocks
  - TypeScript block generator with automatic attribute defaults
  - Zero validation errors in WordPress Site Editor
  - Single source of truth for all block specifications

### Changed
- **Theme Generator** - Now uses FSE Knowledge Base instead of hardcoded strings
  - `src/generator/patterns/universal-header.ts` - Refactored to use `getBlockGenerator()`
  - Automatic application of block defaults (e.g., `isLink:true` for site-logo)
  - Guaranteed WordPress FSE compliance

### Technical Details
- **New files:**
  - `src/lib/fse-kb/parser.ts` - Block specification database
  - `src/lib/fse-kb/index.ts` - Singleton generator instance
  - `docs/fse-kb/*.md` - Complete FSE documentation (9 files)
- **Updated files:**
  - `src/generator/patterns/universal-header.ts` - FSE KB integration
- **Benefits:**
  - Zero "Attempt Recovery" errors in WordPress
  - Automatic WordPress updates (defaults from KB)
  - Better code maintainability
  - Production-ready theme output

### Developer Impact
- **Breaking Change:** None - output format unchanged
- **New API:** `initFSEKnowledgeBase()` and `getBlockGenerator()` available
- **Documentation:** See `docs/fse-kb/FSE-KNOWLEDGE-BASE-INDEX.md`

### Fixed
- Full-bleed hero now uses the correct FSE architecture: header is rendered inline inside the Cover block (not as a separate template part above it).
  - Root cause: home templates always injected `header` template-part above `<main>`, so "fullBleed" behaved like full-width hero with a separate top bar.
  - Solution: added conditional header template-part omission for `fullBleed` and injected an inline transparent header as the first element inside Cover inner-container.
- Restaurant testimonials image blocks no longer emit duplicate width/height sizing in both CSS and HTML attributes.
  - Root cause: `core/image` markup in `social-proof.ts` used `style="...width:48px;height:48px"` while also outputting `width="48" height="48"`.
  - Solution: Removed inline width/height styles and kept canonical HTML width/height attributes.
- Testimonials avatar image blocks now keep border radius only in block JSON metadata and no longer emit inline `<img style="border-radius:...">`.
  - Root cause: inline img border styles are non-canonical for `wp:image` and can trigger editor recovery/validation issues.
  - Solution: retained `style.border.radius` in wp:image JSON and removed inline `<img>` border-radius styles.
- Hero layout selection is now applied in the checkout bypass generation path.
  - Root cause: `app/api/generate/route.ts` stored `selected_style` but did not map it into `studioInput.heroLayout`, causing default hero behavior.
  - Solution: Added `normalizeHeroLayout()` mapping and injected resolved `heroLayout` into bypass `studioInput`.
- Testimonials no longer trigger "Attempt Recovery" errors in WordPress Site Editor for restaurant/cafe outputs.
  - Root cause: Conflicting pattern registration (`general-testimonials-columns.php`) coexisted with recipe-rendered testimonials.
  - Solution: Removed restaurant registration of the legacy pattern and added explicit restaurant/cafe cleanup in `PatternInjector`.
- Business names with apostrophes now display correctly (for example, `Luigi's Pizza`).
  - Root cause: Double HTML-entity encoding (`'` -> `&#39;` -> `&amp;#39;`) through sanitize + PHP escaping stages.
  - Solution: Removed apostrophe entity encoding from sanitizer; PHP string escaping remains responsible for quote safety.

### Changed
- `src/generator/patterns/universal-header.ts`: Added `getInlineTransparentHeader()` for full-bleed hero overlay navigation.
- `src/generator/patterns/hero-variants.ts`: `getFullBleedHero()` now accepts `businessName/pages/hasLogo`, renders inline header inside Cover, and uses `minHeight:100vh`; `getHeroByLayout()` now forwards these params.
- `src/generator/patterns/universal-home.ts`: Extended parameter flow with `businessName/pages/hasLogo` and propagated through recipe render contexts plus generic hero call.
- `src/generator/page-builder.ts`: Added `fullBleed` conditional to skip header template-part and pass header context into `getUniversalHomeContent()`.
- `src/generator/recipes/types.ts`: Extended `RenderContext` with `businessName/pages/hasLogo`.
- `src/generator/recipes/renderer.ts`: Hero rendering now forwards `businessName/pages/hasLogo` to `getHeroByLayout()`.
- `src/generator/engine/PatternInjector.ts`: Home template assembly now passes header context to universal-home and conditionally omits header template-part for `fullBleed`.
- `src/generator/engine/ContentEngine.ts`: `buildPageTemplate()` call now passes `businessName/pages/hasLogo` for standard page generation.
- `src/generator/patterns/sections/social-proof.ts`: Removed inline `width:48px;height:48px` from testimonial avatar `<img>` styles; retained `width="48" height="48"`.
- `app/api/generate/route.ts`: Added bypass hero-layout normalization and wired result into `studioInput.heroLayout`.
- `src/generator/config/PatternRegistry.ts`: Removed `general-testimonials-columns.php` from Tove restaurant registration.
- `src/generator/engine/PatternInjector.ts`: Added explicit cleanup of `patterns/general-testimonials-columns.php` for restaurant/cafe generation.
- `src/generator/utils/sanitize.ts`: Removed single-quote to HTML entity conversion in `sanitizeForPHP()`.

- 2025-11-13 – Initial OS Skeleton  
  - Created core OS files: master-prompt.md, memory.md, workflows.json, modules.json.  
  - Added supporting structure: changelog.md, tasks.md, stages/.  
