# PressPilot OS – Long-Term Memory

> This file is the home for **stable truths** and **global conventions**.  
> No temporary tasks or stage notes live here.

---

## 1. Product & Vision

- **Primary Product:** PressPilot (PP) – a kit-first WordPress + SaaS “factory” that:
  - Collects user inputs (logo, palette, fonts, niche, language, reference URL, etc.).
  - Outputs ready-to-use WordPress sites, patterns, themes, and supporting assets.
  - Later stretches to non-WordPress apps (Next.js, full SaaS, etc.) through the same OS.

- **Secondary Use:** This OS should power other projects (Dr Gator, Tayseer, future SaaS ideas) with only light tweaks.

- **Design Identity (High Level):**
  - Clean, modern, slightly premium / “elite business” energy.
  - Interfaces should feel simple, low-friction, and obvious to non-technical users.
  - Default to **dark/light** or **black & white** schemes with minimalist vibes.

---

## 2. Core Principles

1. **System over vibes**  
   - Choose repeatable workflows over one-off inspiration.  
   - When something works, convert it into a workflow or module.

2. **Plain language, zero jargon walls**  
   - Explanations must be kid-clear.  
   - Complex stacks get broken into simple steps.

3. **One brain, many tools**  
   - Every AI or agent follows the same OS rules.  
   - Definitions here are the single source of truth.

4. **Production mindset**  
   - Ship production-quality code and architecture, not throwaway demos.  
   - Clarity beats cleverness.

---

## 3. Tech Stack Defaults

These defaults stand unless you justify a deviation.

- **Front-end / App Layer:**
  - Next.js (14+), React, TypeScript for dashboards and SaaS.  
  - Tailwind or lean utility systems are fine if they stay light.

- **WordPress Layer:**
  - Block themes managed via `theme.json`.  
  - Block patterns (hero, pricing, features, gallery, contact, etc.).  
  - WordPress Playground for demos and previews when possible.

- **AI Layer:**
  - GPT-style models for reasoning, content, structure.  
  - Plug in coding agents (Cursor, Manus, etc.) as implementers when needed.

- **Hosting:**
  - Vercel / Render / Cloudflare for cloud targets.  
  - WordPress can run on classic hosts or containers; keep exports and kits clean.

---

## 4. Naming & File Conventions

- **Project Folder Name:** `presspilot-os` or `PressPilot-OS` locally.
- **WordPress Starter Theme:** `pp-starter` (aka `presspilot-starter`).
- **Patterns Folder:** `patterns/` with names like:
  - `hero-minimal.php`
  - `pricing-cards.php`
  - `contact-split.php`
  - `gallery-grid.php`

- **Config and Docs:**
  - OS files: `master-prompt.md`, `memory.md`, `workflows.json`, `modules.json`.
  - Project docs: `README.md`, `CONVENTIONS.md`, `RUNBOOK.md` as needed.
  - Stage docs stay inside `stages/`.

- **General Style:**
  - Stick to kebab-case or snake_case per project and remain consistent.

---

## 5. Multilingual & RTL

- Multilingual coverage is a **core requirement**, never an optional add-on.
- The system should comfortably produce content/layouts for:  
  - English (EN), Spanish (ES), French (FR), Italian (IT), Arabic (AR), plus future languages.
- Arabic (AR) means:  
  - **RTL (Right-To-Left) layouts**.  
  - Correct typography and alignment.
- When building components or layouts:  
  - Ask “Can this flip to RTL?”  
  - Favor structural CSS (flex, grid) instead of hard-coded alignment.

---

## 6. Workflow Conventions

- Every major reusable process must be:  
  - Named.  
  - Described.  
  - Given explicit inputs and outputs.  
  - Stored in `workflows.json`.

- Each workflow can call smaller **modules** from `modules.json`.

- When drafting a new workflow:  
  1. Check existing entries to avoid duplicates.  
  2. Spell out:  
     - Inputs (what Mort or the system must provide).  
     - Outputs (files, configs, code, assets).  
     - Steps (point to modules where it helps).

---

## 7. Quality & Safety

- **Quality Bar:**  
  - Code must be copy-paste ready with correct syntax and zero blocking placeholders.  
  - Explanations must note each file’s location in the tree.  
  - UI/UX choices should feel deliberate, not random.

- **Safety:**  
  - Never store secrets (API keys, tokens) in memory.  
  - Assume secrets live in env vars or secure config.

---

## 8. Stable Decisions (Can Be Extended)

- PressPilot avoids plugin bloat and prefers:  
  - Block themes.  
  - Native WordPress features.  
  - A tight, curated set of add-ons.

- “Assign to AI” is a **core UX move**:  
  - The user hands over brand inputs (colors, copy, etc.).  
  - The OS assembles the full kit/site.

- Future entries here must be:  
  - Global.  
  - Long-term.  
  - Useful across stages and tools.
