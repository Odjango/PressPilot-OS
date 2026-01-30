# Generator Architecture – Orchestrated Proven-Core Themes

## 1. Purpose

The PressPilot generator is an **orchestrated system** that assembles production-ready WordPress FSE themes from a curated vault of **Proven-Core** themes.  
It does not invent new theme structures on the fly; instead it:

1) Chooses the best existing core,  
2) Prepares content and style data as JSON contracts,  
3) Applies those contracts to the filesystem.

Only the decision and data layers use AI. Assembly is deterministic.

## 2. Proven-Core Catalog (`proven-cores/cores.json`)

- All selectable cores live under `proven-cores/` (blockbase, frost, ollie, spectra-one, tove, etc.).
- Each core is identified by a `coreId` string:

  - Format: `baseTheme/variant-slug`  
    Examples: `tove/cafe-landing`, `spectra-one/store-minimal`.

- The catalog file `proven-cores/cores.json` contains an array of theme entries:

  - `coreId`: unique identifier used by the generator.
  - `baseTheme`: which folder under `proven-cores/` it belongs to.
  - `vertical`: restaurant, ecommerce, etc.
  - Optional metadata: `style`, `layout`, `features`, `bestFor`.

The generator may only select cores that exist in this catalog.

## 3. ThemeSelector (Decision)

**Responsibility:** choose the best `coreId` for a given business.

- Input:
  - Vertical (restaurant, ecommerce, etc.).
  - Business profile (size, tone, requirements).
- Logic:
  - Load `cores.json`.
  - Filter and score cores using tags (vertical, layout, features, style).
  - Optionally use an AI model to break ties and generate a short reasoning string.
- Output:
  - `coreThemeId` (e.g. `tove/cafe-landing`).
  - `baseTheme` (e.g. `tove`).
  - `reasoning` (why this core was chosen).

Downstream modules treat this selection as fixed.

## 4. Builders – Data Contracts

After a core is selected:

### ContentBuilder

- Produces `ContentJSON` aligned to the chosen core:
  - Hero copy, sections, CTAs, menus, pages.
  - Slot names match the patterns of the selected proven core.
- Does not change theme structure; only fills content for existing slots.

### StyleBuilder

- Produces `StyleJSON`:
  - Color palette, typography scale, spacing tokens, theme metadata.
- Must respect global rules in `THEME_RULES.md` (contrast, spacing, etc.).

Builders hold the business and brand logic.

## 5. Assembly Engines (Deterministic Application)

The engines follow an **Assembler pattern**:

- **StyleEngine** – applies `StyleJSON` to `theme.json` and style files.
- **PatternInjector** – injects pattern content using `ContentJSON` slots.
- **ContentEngine** – generates pages and wiring, using `ContentJSON`.

Engines:

- Never call AI models.
- Never make selection or business decisions.
- Only apply the decisions encoded in the JSON contracts.

> Engines apply decisions; they do not make them.

## 6. End-to-End Flow (Example: Restaurant)

1. ThemeSelector reads `cores.json` and selects `tove/cafe-landing`.
2. ContentBuilder creates `ContentJSON` for the restaurant based on user input.
3. StyleBuilder creates `StyleJSON` that respects theme rules and brand settings.
4. Engines apply both JSON contracts to the `tove` core, producing a new FSE theme.
5. The output is validated and packed as `output/<theme-name>.zip`.
