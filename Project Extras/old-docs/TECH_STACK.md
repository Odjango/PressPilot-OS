# TECH STACK & CODING STANDARDS

## 1. Core Frameworks
* **Frontend:** Next.js (App Router).
* **Language:** TypeScript (Strict typing preferred).
* **Styling:** Tailwind CSS + Shadcn/UI (if applicable).

## 2. WordPress Generation Engine (CRITICAL)
* **Architecture:** "Canonical Serializer" pattern. We do NOT use PHP to generate themes; we generate strict HTML/JSON via Node.js.
* **Key Libraries:**
    * `adm-zip` & `archiver`: For zipping the final theme package.
    * `jimp`: For native Node.js image processing and color extraction.
    * `@wordpress/block-serialization-default-parser`: Peer dependency for validation.
* **Output Target:** WordPress Full Site Editing (FSE) Block Themes.
    * Must produce a valid `theme.json` (Version 2 Schema).
    * Must use strictly valid Block Grammar (e.g., ``).

## 3. DevOps & Infrastructure
* **Hosting:** Digital Ocean Droplet (Managed by Coolify).
* **CI/CD:** GitHub Actions (Deployment).
* **Testing:** Playwright (E2E) and Node.js-based static analysis.

## 4. Replit Environment Constraints
* **NO DOCKER:** We cannot run the `wp-qa-gate.sh` script (which requires Docker) inside Replit.
* **Validation:** We must rely on `scripts/editor-validate.ts` (Node.js) for immediate feedback.