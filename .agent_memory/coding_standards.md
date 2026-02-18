# Coding Standards (Extracted From Existing Code)

## Non-Negotiable Constraint
- The user is a non-coder. You must perform all edits directly. You are forbidden from suggesting manual code changes to the user.

## Architecture-First Rules
- Keep the established pipeline: input adapters -> data transform -> generator modules -> validators -> zip output.
- Do not bypass `bin/generate.ts` contract when changing generation flow.
- Keep backend invocation contract stable (`stdin`/`stdout` JSON shape used by Laravel job workers).

## File Structure Patterns (Current Project)
- Generator domain lives in `src/generator/` with subdomains:
  - `engine/` for orchestration primitives.
  - `modules/` for high-level builders.
  - `recipes/` for vertical composition logic.
  - `patterns/sections/` for section generators.
  - `validators/` for output quality gates.
- Next.js App Router API endpoints use `app/api/**/route.ts`.
- WordPress/PHP backend logic is isolated under `backend/` and plugin code in `factory-plugin/` variants.

## Naming Conventions (Observed)
- Classes/modules in generator engine commonly use PascalCase file names (e.g., `StyleEngine.ts`, `PatternInjector.ts`).
- Pattern/recipe content files are predominantly kebab-case (e.g., `restaurant-menu-preview.ts`, `startup-landing.ts`).
- Constants are uppercase snake case (`FORCE_HEAVY_FOR_RESTAURANTS`, etc.).
- Strong use of explicit TypeScript interfaces/types for contracts (`GeneratorData`, `LayoutRecipe`, etc.).

## Import and Path Conventions
- App layer frequently uses alias imports via `@/*` (from `tsconfig.json`).
- Generator layer commonly uses relative imports.
- Keep import style consistent with local file neighborhood; do not normalize entire repo stylistically.

## WordPress Output Conventions
- Patterns/templates must emit valid Gutenberg block comments and balanced wrappers.
- Theme-level tokens belong in `theme.json`; runtime CSS adjustments append to `style.css` via engine logic.
- Preserve validator compatibility (Structure/Block/Token validators must still pass).

## Styling Boundary Convention
- Tailwind: only for Next.js app UI (`app/`, `components/` web app surface).
- Generated WP themes: no Tailwind coupling; rely on FSE markup, presets, and theme CSS.
- Never introduce a dependency that forces WordPress output to require Tailwind at runtime.
