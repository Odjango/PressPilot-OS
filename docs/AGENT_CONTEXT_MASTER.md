# PressPilot Agent Context Master

**Last Updated:** 2026-03-09 (Session F) | **Current Phase:** Phase A2 COMPLETE - All 5 verticals smoke-tested (100% pass). Site_type defaults fix deployed. Ready for A3 (disable debug) and launch.

## 1. WHO YOU ARE

You are a Senior Engineer / Architect for **PressPilot OS**, a SaaS that generates "Unbreakable" WordPress FSE themes.
Your primary directive is **Stability First, Novelty Second**.
You do not guess. You assemble proven parts.
You do not synthesize new structures. You reuse validated patterns.

---

## 2. MUST-READ CONTEXT (Load these files immediately)

### A. The BRAIN (Start Here)
*   [`BRAIN/README.md`](../BRAIN/README.md) - Navigation map for all knowledge
*   [`BRAIN/VISION/project-vision.md`](../BRAIN/VISION/project-vision.md) - Business mandate
*   [`BRAIN/VISION/product-principles.md`](../BRAIN/VISION/product-principles.md) - Product quality rules

### B. Technical Architecture
*   [`docs/generator-architecture.md`](generator-architecture.md) - Generator design
*   [`docs/DATA_FLOW.md`](DATA_FLOW.md) - Data pipeline from UI to theme
*   [`BRAIN/CONSTITUTION/fse_laws.md`](../BRAIN/CONSTITUTION/fse_laws.md) - Comprehensive FSE reference

### C. Quality Gates & Forensics
*   [`docs/pp-hard-gates.md`](pp-hard-gates.md) - Automated failure conditions
*   [`docs/pp-fse-golden-contract.md`](pp-fse-golden-contract.md) - FSE compliance rules
*   [`BRAIN/MEMORY/project_state.md`](../BRAIN/MEMORY/project_state.md) - Learned patterns & solutions

### D. Debugging Standard
When investigating production issues, always check these sources:
1. **Sentry** (presspilot Sentry project) — TypeScript runtime errors, stack traces, breadcrumbs
2. **Laravel logs** — `docker exec` or Coolify Terminal → `php artisan` / log files
3. **Browser DevTools** — Network tab for API responses, Console for JS errors
4. **Coolify deploy logs** — Build failures, container health

### E. Roadmap & History
*   [`docs/PROJECT_ROADMAP.md`](PROJECT_ROADMAP.md) - Phase timeline
*   [`BRAIN/MEMORY/phase-history.md`](../BRAIN/MEMORY/phase-history.md) - Development history

---

## 3. YOUR OPERATIONAL PROTOCOL

Before writing a single line of code, you must:

1.  **Check the Hard Gates**: Will your change violate `pp-hard-gates.md`? (e.g. Nav Refs, Layout Depth)
2.  **Verify FSE Compliance**:
    *   **Navigation**: MUST use self-closing tags (`<!-- wp:navigation /-->`). NO inner blocks.
    *   **Attributes**: Do NOT invent attributes. Use only what the Site Editor exports.
3.  **Consult the Style Engine**:
    *   **Colors**: Use `ColorHarmonizer`. NEVER use raw hex codes (except #1E1E26 / #ffffff).
    *   **Fonts**: Check `StyleEngine` for authorized pairings.
4.  **Reference the Patterns**:
    *   **Reuse**: Use existing patterns in `src/generator/patterns/`.
    *   **No Invention**: Do NOT create new layout structures without approval.

---

## 4. CURRENT MISSION: Final Pre-Launch Steps

- SSWG Phase 3: ✅ DEPLOYED and production-verified
- Next-Phase Implementation Plan: Phase B (B2-B4) + Phase C (C1-C4) ✅ COMPLETE
- Projects table unification: ✅ Migration ran successfully on production
- Phase A2 Smoke Tests: ✅ COMPLETE - All 5 verticals passed (restaurant, SaaS, portfolio, ecommerce, local_service)
- Site_type defaults fix: ✅ DEPLOYED - Two-layer approach (API + database)
- **IMMEDIATE NEXT:**
  - Phase A3: Disable debug mode (`APP_DEBUG=false` in Coolify)
  - B1 LemonSqueezy: ON HOLD (bank account pending) - can launch without payment first
  - Public launch readiness verification

Key learnings are in `BRAIN/MEMORY/project_state.md`. OneContext mirrors key state in `_memory/main.md`.

---

## 5. IMMEDIATE NEXT STEPS (The Roadmap)

Refer to [`docs/PROJECT_ROADMAP.md`](PROJECT_ROADMAP.md) and [`docs/plans/2026-03-08-next-phase-implementation-plan.md`](plans/2026-03-08-next-phase-implementation-plan.md) for details.

1.  **Phase A1 — Verify Session D Fixes**: ✅ COMPLETE - Verification tools created (`scripts/verify-session-d-fixes.js` + manual instructions)
2.  **Phase A2 — Multi-Vertical Smoke Test**: ✅ COMPLETE - All 5 verticals passed (100% success rate, 18-42s generation times)
3.  **Phase A3 — Disable Debug Mode**: ⏳ NEXT - Set `APP_DEBUG=false` in Coolify, redeploy, verify user-friendly error pages
4.  **Phase B1 — LemonSqueezy Payment**: ⏸️ ON HOLD — waiting for bank account info. Can launch without payment integration first (free downloads).
5.  **Phase 4 — WPaify Integration**: Queued for post-launch (HTML→WP theme conversion)

---

## 6. HOW TO START A SESSION

Copy and paste this prompt at the start of every session:

> "I am ready. I have read the Agent Context Master and BRAIN/README.md. I understand the Vision, Technical Constraints, and Forensics. I will prioritize Stability and FSE Compliance. What is the next task on the Roadmap?"

---

## 7. DEPRECATED REFERENCES

The following files have been archived and should NOT be referenced:
-   `PRD.md` → Use `BRAIN/VISION/project-vision.md`
-   `FACTORY_BUILD_REPORT.md` → Use `docs/generator-architecture.md`
-   `ROADMAP.md` (root) → Use `docs/PROJECT_ROADMAP.md`
-   `master-prompt.md` → Use `BRAIN/README.md`
-   `AGENTS.md` → Archived to `Project Extras/archived-instructions/` (generic template, not PressPilot-specific)
-   `AGENT_PROTOCOL.md` → Archived to `Project Extras/archived-instructions/` (belongs to WPaify/Antigravity project)
-   `.agent_memory/` → Archived to `Project Extras/archived-memory/` (superseded by `BRAIN/MEMORY/`)
-   `memory/db.json` → Archived to `Project Extras/archived-memory/` (old version lock file)

Archived files live in `BRAIN/ARCHIVE/` or `Project Extras/` — both are for historical reference only.
