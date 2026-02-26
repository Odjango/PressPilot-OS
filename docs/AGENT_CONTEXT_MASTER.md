# PressPilot Agent Context Master

**Last Updated:** 2026-02-23 | **Current Phase:** All 5 verticals production-ready; Block Config Validation system added

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

### D. Roadmap & History
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

## 4. CURRENT MISSION: Stability + Launch Prep

**Generator 2.0** is complete across all 5 verticals. The current focus is stability hardening and P5 diagnosis:

-   **All Phases Complete:** Design system tokens + recipe engine for all 5 verticals
-   **Block Config Validation (2026-02-23):** New `BlockConfigValidator` enforces required block attributes at two checkpoints — pre-file-write logging and pre-ZIP hard gate
-   **P1–P4:** All resolved and verified (Feb 21, 2026)
-   **P5:** Generation stall at DELIVER step — still undiagnosed (needs Laravel/Horizon logs)

**Phase 15** (Documentation & Marketing) is ongoing in parallel.

Key learnings from all phases are captured in `BRAIN/MEMORY/project_state.md` and `_memory/main.md`.

---

## 5. IMMEDIATE NEXT STEPS (The Roadmap)

Refer to [`docs/PROJECT_ROADMAP.md`](PROJECT_ROADMAP.md) for the step-by-step plan.

1.  **P5 Diagnosis**: Find Laravel logs in Docker container (`/app/storage/logs/` may not exist — check Coolify log tab instead), check Horizon dashboard for failed/stalled jobs
2.  **Commit** block config validation work (5 files: 2 created, 3 modified)
3.  **User Guides**: Complete "Getting Started" docs for end-users
4.  **Developer Docs**: Finalize API documentation for `POST /api/generate`
5.  **Marketing Assets**: Generate screenshots of flagship themes (restaurant + ecommerce)

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

Archived files are in `BRAIN/ARCHIVE/` for historical reference only.
