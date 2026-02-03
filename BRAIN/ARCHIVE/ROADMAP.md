> **ARCHIVED** - This document is superseded. See [docs/PROJECT_ROADMAP.md](../../docs/PROJECT_ROADMAP.md) for the current, canonical roadmap with all phases through Phase 15.
>
> _Archived: 2026-02-02 | Reason: Duplicate roadmap, superseded by docs/PROJECT_ROADMAP.md_

---

# PROJECT SCOPE & VISION: PressPilot

## 1. The Core Concept
PressPilot is a SaaS platform that allows non-coders to generate custom WordPress FSE (Block) Themes by entering business details. It uses AI to populate content and a deterministic engine to build the code.

## 2. User Workflow (The Vision)
1.  **Input:** User enters Business Name, Logo, Tagline, and Description.
2.  **Selection:** User picks a "Kit" (Industry) and Style (Fonts/Colors).
3.  **Generation:** The engine builds a unique WordPress theme zip file.
    * *Future Goal:* Auto-integrate WooCommerce for E-commerce kits.
    * *Future Goal:* Auto-populate "Menu" pages for Restaurant kits.
4.  **Preview:** User sees 3 design variations before downloading.

## 3. Current Implementation Status
* **Existing:** We have the "Canonical Block Generator" that builds valid HTML.
* **Existing:** We have the CI/CD pipeline to validate themes.
* **In Progress:** Fixing "Attempt Recovery" errors in the generated themes.
* **Missing (To Build):** The AI Content Generation (OpenAI integration) and the "Restaurant/E-commerce" specific logic.

## 4. Design Guidelines
* **Fonts:** Must support Google Fonts natively.
* **Colors:** Users choose from 5-7 pre-set palettes.
* **Languages:** Support for English, Spanish, French, Italian, and Arabic (RTL).

## Phase 4: Production Scalability (The 1000-User Goal)
- [x] **Internal Generator Migration:** Removed N8N dependency; engine now runs 100% on Node.js.
- [x] **Memory Optimization:** Optimized build process to run on low-RAM (<1GB) VPS instances.
- [ ] **Async Job Queue (BullMQ/Redis):** _(Planned Next for High Traffic)_

## Phase 5: Business Logic (Payments & Auth)
- [x] **Supabase Integration:** (COMPLETED) - App is connected. Auth is ready.
- [ ] **Credit System:** Create `user_credits` table (UUID, integer).
- [ ] **Lemon Squeezy Integration:**
    - [ ] Webhook Handler (Internal API Route).
    - [ ] Frontend "Buy Credits" overlay.

## Phase 8: Core Engine Upgrade (Jan 2026) - COMPLETED
- [x] **Triple-Layout Generation:** Automatically build "Classic", "Modern", and "Minimal" variations.
- [x] **3-Color "Trinity" System:** Extract Primary, Secondary, and Accent from Logo.
- [x] **Frontend Color Editor:** Live preview and adjustment of brand colors.
- [x] **Dependency Cleanup:** Removed OpenAI and Legacy N8N artifacts.

## Phase 9: The "Go Live" Checklist
- [ ] Full End-to-End Test (Payment -> Credit Add -> Generation -> Email).
- [ ] UI Polish (Loading states, Error messages).
## Pre-Launch Security Checklist

### Git Branch Protection (GitHub Settings)
- [ ] Require pull request reviews before merging to main
- [ ] Require status checks to pass (TypeScript, build)
- [ ] Prevent force pushes to main
- [ ] Require branches to be up to date before merging

### How to enable:
1. Go to GitHub repo → Settings → Branches
2. Add rule for "main" branch
3. Enable required checks
