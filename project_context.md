# PROJECT CONTEXT: PressPilot (AI WordPress Theme Generator)

## 1. PROJECT MISSION
PressPilot is a SaaS platform that generates complete, valid WordPress websites in 90 seconds. 
- **Core Mechanism:** User Input (Biz Info + Logo) -> **Library Assembly Engine** -> WordPress Theme ZIP.
- **Critical Rule:** We generate "Unbreakable" FSE Themes by **Assembling proven parts**, not synthesizing new code. We use "Layout Recipes" to combine vetted patterns from base themes (Ollie, Frost, TT4).

## 2. ARCHITECTURE & FILE MAP (SOURCE OF TRUTH)
The logic is strictly modular. The Agent must strictly use these files:

### A. The "Brain" (Generator Engine)
- **Directory:** `src/generator/`
- **Orchestrator:** `src/generator/index.ts`
- **Pattern Registry:** `src/generator/config/PatternRegistry.ts` (Defines Layout Recipes)
- **Assembly Engine:** `src/generator/engine/PatternInjector.ts` (Executes Recipes)
- **Content Logic:** `src/generator/engine/ContentEngine.ts`
- **Role:** Assembles a ready-to-use theme by injecting user content into a selected sequence of proven patterns.

### B. The "Hands" (SaaS App)
- **Directory:** `app/`
- **API Route:** `app/api/generate/route.ts` - Orchestrates the external AI calls and triggers the Generator Engine.
- **Static Site:** `lib/presspilot/staticSite.ts` - Generates the HTML/CSS preview version.

### C. The Legacy / Deprecated
- **Directory:** `factory-plugin/`
- **Status:** **DEPRECATED**. Legacy PHP modules (`site-assembler.php`, `content-generator.php`) have been removed. The plugin exists only for basic cleanup/branding hooks on the preview instance, but does NOT generate the theme.

## 3. "NO HALLUCINATION" PROTOCOLS
1.  **Block Patterns Only:** All page output must match the structure in `patterns/`.
2.  **Zero Dependency:** Do not write code that requires an external plugin.
3.  **FSE Reference:** Always consult `WORDPRESS_FSE_REFERENCE.md` for validation rules.

## 4. CURRENT GOAL: Tech Stack Refactor
We have successfully consolidated the generation logic into the Node.js architecture.
- **Immediate Task:** Build "Restaurant Menu" features into the Node generator (Phase 2).