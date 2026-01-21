# GEMINI PROTOCOL: PRESSPILOT BRAIN
**Date:** 2026-01-20
**Status:** MAPPED (Protocol Alpha Complete)

## 1. TECH STACK (CONFIRMED)
*   **Frontend / Interface (The SaaS App):** Next.js 16+ (App Router), TypeScript, Tailwind CSS, Shadcn/UI.
    *   *Note:* Shadcn is used primarily for the **PressPilot Studio UI**, not the generated WordPress themes.
*   **Core Engine (The Generator):** Node.js-based "Canonical Serializer" (`src/generator/`).
    *   Generates strictly valid WordPress Block Themes (FSE).
    *   **Output:** Standard HTML/JSON block patterns. No external React libraries (like Shadcn) are injected into the final theme, ensuring 100% FSE compatibility.
*   **Orchestration:** n8n Workflows (Business Logic + AI Glue).
*   **Legacy / Live Environment:** `factory-plugin/` (PHP) used for runtime logic on the WordPress instance (the "Factory").
*   **Infrastructure:** DigitalOcean (Coolify), Supabase.

## 2. DIRECTORY MAP (THE TERRITORY)
### A. The Studio (User Interface)
*   `app/`: Next.js App Router pages (Home, API routes).
*   `components/`: React UI components (Shadcn/UI).
*   `lib/`: Shared utilities (Supabase client, etc.).

### B. The Engine (Theme Generator)
*   `src/generator/index.ts`: **The Orchestrator.** Endpoint that receives JSON and builds the ZIP.
    *   `src/generator/engine/ChassisLoader.ts`: Loads base theme files.
    *   `src/generator/engine/StyleEngine.ts`: Applies colors/fonts to `theme.json`.
    *   `src/generator/engine/PatternInjector.ts`: Injects block patterns.
    *   `src/generator/engine/ContentEngine.ts`: Generates PHP loaders for content mapping.
*   `output/`: Where generated ZIPs land.
*   **Knowledge Base:**
    *   `WORDPRESS_FSE_REFERENCE.md` (Root): The "FSE Constitution" for validation.
    *   `PRD.md` (Root): The "Product Constitution" defining strict feature sets (Restaurant, E-com, Multi-lang).

### C. The Bridge (Workflows)
*   `n8n/`: Workflow definitions (`workflows_v2.json`) connecting UI -> AI -> Engine.

### D. The Legacy / Runtime
*   `factory-plugin/`: PHP logic `PressPilot_Factory` presumably used on the live site for preview/staging behavior.

## 3. THE VISION vs. REALITY
**Vision:** "A Web App where users input business info to generate deeply customized, niche-specific (e.g. Restaurant, E-com) WordPress Block Themes owned forever."

### ✅ BUILT (The Foundation)
*   **Studio UI:** Functional Next.js interface for inputs.
*   **Node.js Generator (v2):** "Unbreakable" Serializer refactored for modularity.
*   **Pattern Injection:** Standard/Native mode implemented.
*   **Content Loader:** Basic PHP injection mechanism (`ContentEngine.ts`) to map content on activation.
*   **Validation:** Architecture ("Pattern Selection") validated by `WORDPRESS_FSE_REFERENCE.md` (re: QuickWP).

### 🚧 MISSING (The Updates)
*   **Advanced AI Content:** `ContentEngine` is currently a scaffold. Deep AI text generation seems delegated to n8n simplistically. The "Agentic" content generation described in legacy docs is not fully native to the Node engine yet.
*   **Specialized Kits:** Support for "Restaurant" (Menu CPTs) and "E-commerce" (WooCommerce) is marked as "Future Goal" in Roadmap.
*   **Repo Consolidation:** clear separation between "The Tool" (Node) and "The Platform" (PHP Plugin) is cleaner now, but documentation (`project_context.md`) still references the old PHP-centric architecture as the "Source of Truth".

## 4. IMMEDIATE ACTION ITEMS
1.  **Update Documentation:** `project_context.md` is outdated (references PHP `PressPilot_Content_Generator` as core). `TECH_STACK.md` is more accurate.
2.  **Refine Content Engine:** Move AI logic closer to the Generator or strictly define the n8n contract.
