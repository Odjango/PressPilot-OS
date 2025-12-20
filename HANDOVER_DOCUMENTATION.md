# PressPilot Handover Documentation

This document provides a comprehensive overview of the PressPilot codebase, architecture, and current status for new developers.

## 1. Architecture & Data Flow

PressPilot is a **Next.js** application that generates valid, block-based WordPress themes ("PressPilot OS") using a deterministic "Assembly Line" process.

### Core Data Flow
1.  **Input**: User (or AI) selects a "Kit" (business vertical) and specific "Variations" via the UI or API.
2.  **Extraction**: `lib/presspilot/extractor.ts` converts the Kit's business data into a normalized `SiteLayout` object.
3.  **Compilation**: `lib/presspilot/compiler.ts` transforms the `SiteLayout` into specific WordPress Block ASTs (Abstract Syntax Trees) for templates and parts.
4.  **Serialization**: `lib/presspilot/serializer.ts` (The "Canonical Serializer") converts ASTs into valid HTML/Block Markup, enforcing WordPress strict standards to prevent "Attempt Recovery" errors.
5.  **Assembly**: `scripts/buildWpTheme.ts` orchestrates the final build:
    *   Copies base files from `golden-spec/` (theme.json, functions.php).
    *   Writes generated attributes/patterns.
    *   Injects Version/Build ID into `style.css`.
    *   Zips the result into `dist/`.

### Critical Paths
-   **Generator Logic**: `lib/presspilot/` (The brain of the operation).
-   **Base Theme**: `golden-spec/` (The immutable foundation files).
-   **Build Scripts**: `scripts/` (Build, Validate, QA).
-   **CI/CD**: `n8n/presspilot-build-pipeline.json` & `.github/workflows/editor-gate.yml`.

---

## 2. Current Feature Status

### ✅ Working Features
-   **Canonical Block Generator**: Generates strictly valid Block HTML for Core, Group, Column, Navigation, and Button blocks.
-   **CI/CD Pipeline (n8n)**: A fully automated "Assembly Line" that builds, checks, and gates releases.
    -   **Gate 1**: Node.js Preflight (Static Analysis).
    -   **Gate 2**: PHP Round-Trip Validator (WP-CLI).
    -   **Gate 3**: GitHub Actions Editor Gate (Playwright).
-   **Playwright Verification**: Automated browser tests ensuring the Site Editor loads without "Attempt Recovery" errors.
-   **Theme Patterns**: Support for copying and validating Block Patterns.
-   **Heavy Content Mode**: Stress-testing capabilities with massive page generation.

### 🚧 Work In Progress / Maintenance Areas
-   **Strict Validation Limits**: The validator (`scripts/editor-validate.ts`) is extremely strict. It bans all manual HTML wrappers. Any new block implementation must use the Canonical Serializer.
-   **Pattern Registry**: While pattern files are copied, dynamic categorization in `theme.json` is manual.
-   **Design Tokens**: `theme.json` generation is currently based on a "Golden Spec". Dynamic token generation (colors/fonts) is partial.

---

## 3. Dependencies & Config

### Key Special Packages
-   **ADM-ZIP** (`adm-zip`): Used for generating the final theme ZIP file in Node.js.
-   **WordPress Packages** (`@wordpress/block-serialization-default-parser`, etc.): Used effectively as "Peer Dependencies" for parsing/validation logic.
-   **Canvas** (`canvas`): Used for potential image processing/generation tasks.
-   **Playwright** (`@playwright/test`): The core end-to-end testing framework.

### Environment Variables
Required in `.env.local` or CI environment:
-   `YOUTUBE_API_KEY` (For legacy YT Summary tool).
-   `LLM_API_KEY` (OpenAI/Anthropic for content generation).
-   `GITHUB_TOKEN` (For n8n to trigger GitHub Actions).

### CI/CD Environment
-   **n8n**: Orchestrates the pipeline.
-   **Docker**: Required for `scripts/wp-qa-gate.sh` to spin up a local WordPress instance for validation.

"Note for Replit: We cannot run the Docker-based wp-qa-gate.sh script inside this environment. We must rely on the Node.js validators only."

---

## 4. Generator Logic Deep Dive

This section details the internal mechanics of the Theme Generator for developers refactoring or debugging the core engine.

### The File Map
1.  **Entry Point**: `app/api/generate/route.ts` receives the POST request with user inputs/Variation ID.
2.  **Orchestrator**: `lib/presspilot/themeKit.ts` (`buildWordPressTheme`) manages the build lifecycle:
    -   Copies the base theme from `themes/presspilot-fse-v2`.
    -   Injects content and styles.
    -   Zips the result.
3.  **Style Logic**: `lib/presspilot/themeStyle.ts` handles `theme.json` modifications.
4.  **Content Logic**: `lib/presspilot/contentInject.ts` generates block patterns and page content.
5.  **XML Generation**: `lib/presspilot/wpImport.ts` builds the `presspilot-demo-content.xml` file.

### The Data Structure
User choices (Fonts, Colors) travel through this flow:
1.  **Frontend**: User selects a "Style Variation" (e.g., "Modern") in the Studio UI.
2.  **Normalization**: `lib/presspilot/context.ts` converts raw inputs into a `PressPilotNormalizedContext`.
3.  **Resolution**: `lib/presspilot/kit.ts` retrieves the strict `theme.json` tokens for that style (e.g., `fontFamily: "Inter"`).
4.  **Injection**: `lib/presspilot/themeStyle.ts` reads the base `theme.json` and blindly overwrites the `settings.typography.fontFamilies` and `settings.color.palette` arrays with the resolved tokens.

### The Validation Step
-   **Runtime (API)**: The API route does **NOT** validate the generated block markup. It assumes the "Canonical Serializer" (`lib/presspilot/serializer.ts`) produced valid HTML.
-   **Build Time (CI)**: True validation happens in `scripts/editor-validate.ts` (Node.js Analysis) and `scripts/wp-qa-gate.sh` (PHP/WP-CLI Assertion). These run *after* generation but *before* deployment.

### The Zipping Process
-   **Library**: `adm-zip`
-   **Location**: `lib/presspilot/themeKit.ts`
-   **Method**: `new AdmZip().addLocalFolder(themeDir).writeZip(...)`
-   **Output**: A clean ZIP file placed in `/tmp/presspilot-build/themes/` (or `artifacts/` in CI), containing the strictly valid theme structure.

"(Note: Check if we are using golden-spec or themes/presspilot-fse-v2 as the source)"

