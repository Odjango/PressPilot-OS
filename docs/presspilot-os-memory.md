# PressPilot OS – Engineering Memory File (Hybrid Command Mode)

This document is the **single source of truth** for AI agents working on the PressPilot OS repo.

You are not a random code generator.  
You are part of the **PressPilot AI Dev Team** building:

- A **kit-based WordPress + static site generator** (PressPilot OS)
- An **MVP Studio UI** (`/mvp-demo`) that lets a user fill one form and get:
  - A WordPress block theme zip
  - A static HTML/CSS/JS site zip

All work must respect the structure, contracts, and stages described here.

---

## 1. High-Level Product Concept

**PressPilot OS** takes:

- Business info (name, description, category, language)
- A chosen design style preset
- (Later) niche/archetype (SaaS, Local Biz, Restaurant, E-com, etc.)

…and outputs:

- A **static site kit**: zipped HTML/CSS/JS
- A **WordPress FSE block theme kit**: zipped theme folder

Via a simple internal UI at `/mvp-demo`.

### Core Principles

1. **Single form → multiple artifacts**  
   All outputs (static site, WP theme) must be derived from the **same normalized context** and selected variation.

2. **Engine first, CMS second**  
   WordPress is a **target** for generated kits, not the source of truth.

3. **Kits over themes**  
   Golden Foundation is the base; kits are **branded variations** (Tony Pizza, New Beedo, etc.).

4. **Stages, not vibes**  
   Work is organized in *stages* with clear acceptance tests (e.g. Stage-02 = Restaurant kit), not random tasks.

---

## 2. Architecture Overview

### Frontend – MVP Studio

- Next.js 14 App Router
- Page: `app/mvp-demo/page.tsx`
- Purpose:
  - Form to collect business info
  - Widget to choose a **design style preset**
  - Buttons:
    - **Preview designs** → `/api/variations`
    - **Generate theme & static site** → `/api/generate`
  - Debug panel:
    - Engine stage booleans
    - Final artifacts JSON

The frontend contract to the backend **MUST NOT** change casually.

### Backend – API Routes

- `app/api/kit/route.ts`
  - Returns kit catalog + style presets
  - Expected shape:
    ```ts
    {
      themeSlug: string;
      businessTypes: Array<{
        id: string;
        label: string;
        description?: string;
        styleVariation?: string | null;
      }>;
    }
    ```

- `app/api/variations/route.ts`
  - POST
  - Accepts:
    ```ts
    {
      businessTypeId?: string | null;
      // New simplified "studio" payload
      input?: {
        businessName: string;
        businessDescription: string;
        primaryLanguage: string; // e.g. "EN", "AR"
        businessCategory: "service" | "product" | "nonprofit";
      };
      // OR legacy:
      payload?: PressPilotSaaSInput;
    }
    ```
  - Responsibilities:
    - Normalize studio input → full `PressPilotSaaSInput` via adapter
    - Validate input
    - Resolve businessType + styleVariation
    - Generate **variationSet** (or fallback variations)
    - Return:
      ```ts
      {
        variationSet: {...};
        businessTypeId: string | null;
        styleVariation: string | null;
        kitVersion: string;
      }
      ```
  - **Frontend currently IGNORE details**; success is `res.ok === true` and status LEDs.

- `app/api/generate/route.ts`
  - POST
  - Accepts same studio input (or legacy payload) plus optional `variationId`.
  - Responsibilities:
    - Normalize + validate input
    - Resolve businessType + styleVariation
    - Resolve variation (A/B/…)
    - Build:
      - WordPress theme zip via `buildWordPressTheme`
      - Static site zip via `buildStaticSite`
    - Return:
      ```ts
      {
        slug: string;
        themeZipPath: string;
        staticZipPath: string;
        themeUrl: string;
        staticUrl: string;
        businessTypeId?: string | null;
        styleVariation?: string | null;
        kitVersion?: string | null;
        siteArchetype?: string | null;
        navShell?: any;
      }
      ```

---

## 3. Generator Subsystems

### 3.1 Context & Validation

Key ideas (exact filenames may vary):

- `PressPilotSaaSInput`
- `validateSaaSInput`
- `buildSaaSInputFromStudioInput`
- `applyBusinessInputs(context)`

These are responsible for:

- Converting studio form input → rich context (brand, CTAs, sections, etc.)
- Ensuring fields are valid & safe
- Preparing data for both WP and static builders

**Rule:**  
Do NOT bypass validation. If you add fields, extend schema + validation, do not attach random untyped props.

---

### 3.2 Variation Engine

Responsible files:

- `lib/presspilot/variations.ts`
- `generatePressPilotVariations`
- `buildFallbackVariationSet`

Responsibilities:

- Generate one or more layout/copy **variations** from context
- If external AI (OpenAI) is unavailable:
  - Use fallback deterministic variations so Preview and Generate still work

Frontend assumptions:

- Preview → we only need `res.ok`; not yet using full variationSet
- Generate → must pick a variation and use it for both WP & static

---

### 3.3 Kit Catalog & Styles

Responsible files:

- `lib/presspilot/kit.ts`
  - e.g. `getPressPilotBusinessTypes`
  - `resolveBusinessTypeStyle`

Purpose:

- Define **business types** (SaaS, Local Biz, etc.)
- Map them to:
  - A `siteArchetype` (e.g. “saas”, “local-biz”, “restaurant”)
  - A `styleVariation` (e.g. “saas-bright”, “local-biz-soft”)
  - A kit version

**Rule:**  
When adding new archetypes (Restaurant, E-com, etc.), update this system **and** make the builders react to `siteArchetype`.

---

## 4. Builders

### 4.1 WordPress Theme Builder

Responsible files:

- `lib/presspilot/themeKit.ts`
  - `buildWordPressTheme(context, variation, options)`
- Theme source:
  - `wp-theme/*` or similar
  - `theme.json`
  - `style.css`
  - `templates/*`
  - `patterns/*` (e.g. `hero-centered.php`, pricing patterns, footer)

Responsibilities:

- Take `context` + `variation` + (optional) `businessTypeId`
- Apply copy + tokens into:
  - Hero
  - Services/features
  - Pricing
  - Blog/insights
  - Contact
  - Footer credits
- Write a **zip** containing:
  - Valid block theme
  - Patterns that are at least editor-tolerable

**Non-negotiables:**

- Do NOT break block comments structure (`<!-- wp:... -->` … `<!-- /wp:... -->`) without care.
- Do NOT hard-code brand names like “Apple Pie”; use:
  - `{{BRAND_NAME}}` tokens, OR  
  - WordPress `wp:site-title` blocks, OR  
  - generator context fields.

Known tolerable issue (for now):

- Some patterns may still trigger “Block contains unexpected or invalid content / Attempt Recovery” in editor, as long as:
  - Frontend renders correctly
  - Site is editable after “Convert to blocks” if the user wants

---

### 4.2 Static Site Builder

Responsible files:

- `lib/presspilot/staticSite.ts` (or similar)

Responsibilities:

- Build a static HTML/CSS/JS site that:
  - Uses the **same context and variation** as the WP theme
  - Includes:
    - Hero
    - Services
    - Pricing
    - Blog/insights
    - Contact

**Rule:**  
Static and WP outputs should tell the same “story” for the brand.

---

## 5. MVP Studio (Frontend UI)

File:

- `app/mvp-demo/page.tsx`

Key behaviors:

- Loads kit data from `/api/kit` on mount:
  - `businessTypes` and `themeSlug`
- Lets user choose a **Design style preset**:
  - Binds to `selectedBusinessTypeId`
- Collects:
  - businessName
  - businessDescription
  - primaryLanguage
  - businessCategory
- Buttons:
  - **Preview designs**:
    - Calls `/api/variations`
    - Sets stage LEDs:
      - inputsNormalized
      - variationsGenerated
      - variationSelected
  - **Generate theme & static site**:
    - Calls `/api/generate`
    - Sets all stage LEDs true
    - Fills `artifacts` JSON:
      - slug
      - themeUrl
      - staticUrl
      - etc.
- Shows:
  - Preview shell (fake hero/mock layout)
  - Final downloads bar
  - Debug panel for Mort: stages + artifacts JSON

**Frontend contract:**

- Do NOT change API paths.
- Do NOT drastically change request/response shapes without updating this memory file.
- UI improvements should:
  - Clarify what Preview vs Generate do
  - Show which preset/style is selected
  - Optionally surface some variation metadata

---

## 6. Non-Negotiable Rules for Agents

1. **No silent breaking of contracts**  
   - `/api/kit` → must return `themeSlug` + `businessTypes[]` as described  
   - `/api/variations` → must handle both legacy and studio input  
   - `/api/generate` → must return artifacts with valid download URLs

2. **Don’t touch Tailwind/PostCSS setup** unless explicitly asked.

3. **Don’t rename or move core directories** (e.g. `app/mvp-demo`, theme source, core libs).

4. **When editing WP patterns**, prefer:
   - Minimal changes
   - Valid block serialization
   - No random extra wrapper elements inside `<!-- wp:* -->` sections

5. **When adding new niche/archetype**:
   - Update kit catalog
   - Update copy/variation logic
   - Update both builders (WP + static) to reflect the niche

6. **Always run tests after major changes** (lint/build/smoke tests).

---

## 7. Known Quirks / Known Issues (Accepted for now)

- WordPress editor showing “Block contains unexpected or invalid content / Attempt recovery” on some blocks:
  - Allowed, **as long as**:
    - Front page renders correctly
    - Theme activates cleanly
    - No PHP fatal errors

- Footer sometimes shows old demo name:
  - Should progressively move to using brand/site-title tokens.
  - Hard-coded strings like “Apple Pie” are considered bugs to be eventually removed.

---

## 8. Stage-based Development

Work should be structured as *stages* (examples):

- **Stage-01** – MVP SaaS kit working end-to-end  
- **Stage-02** – Restaurant / Local Biz kit  
- **Stage-03** – E-commerce kit  
- **Stage-04** – Better style preset previews (visual)  
- **Stage-05** – Hardening + pattern editor compatibility

For each stage:

- Define 3–5 acceptance tests before coding.
- Commit all work that satisfies those tests, even if small cosmetic issues remain.
- Defer non-blocking editor warnings and cosmetic quirks to a later “Hardening” stage.

---
