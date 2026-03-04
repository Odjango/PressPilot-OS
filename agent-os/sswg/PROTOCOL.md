# SSWG Implementation Protocol

> **SSWG** = Solid Smart WordPress Theme Generator
> **Authority:** This document supersedes `agent-protocol.md` for all SSWG work. Where they conflict, THIS FILE wins. The old agent-protocol was written for the raw-markup generation approach which is now DEPRECATED.

---

## What is SSWG?

A pattern-assembly engine that generates WordPress FSE themes by:
1. AI generates **content only** (JSON with text values)
2. A deterministic engine **selects pre-validated patterns** from proven-cores
3. The engine **injects content** into patterns via `{{TOKEN}}` replacement
4. The engine **assembles a theme.zip** with correct structure
5. **WordPress Playground validates** the output
6. User downloads a crash-free theme

**AI decides WHAT to build. The engine decides HOW.**
These concerns are NEVER mixed.

---

## Resolved Decisions (FINAL — Do Not Reopen)

| Decision | Resolution | Why |
|----------|-----------|-----|
| Primary Core Theme | **Ollie** (+ Tove for restaurant, Frost for minimal) | 99 patterns, best token system, 7 color vars |
| Validation Engine | **WordPress Playground** via `@wp-playground/cli` | Zero-setup, runs in Node.js, doubles as user preview |
| n8n Role | **Email ONLY** — sends welcome email via Brevo after generation | All generation logic is in Laravel. n8n is NOT in the critical path |
| Navigation | **Paragraph links in group** (NOT `core/navigation`) | `core/navigation` is the #1 cause of Attempt Recovery errors |
| Brand Modes | **Dropped for MVP** — add post-launch using Ollie's style variation system | Focus on one bulletproof pipeline first |
| Images | **AI-generated** for standard tiers. **Unsplash** for agency/bulk tier | Standard users need generated images. Agency users bring their own |
| Placeholder System | **`{{TOKEN}}` string replacement** in Laravel | Simpler than QuickWP's PHP functions. No PHP runtime needed for patterns |
| Pattern Count | **80-100 tokenized patterns** from 338 available in proven-cores | Maximum variety across all categories and verticals |

---

## Architecture Overview

```
User (Next.js) → POST /api/generate → Laravel API
                                          ↓
                                    GenerateThemeJob (queued via Horizon)
                                          ↓
                                    ┌─────────────┐
                                    │  AIPlanner   │ → Calls Claude API
                                    │  (content)   │ → Returns JSON with token values
                                    └──────┬──────┘
                                           ↓
                                    ┌─────────────┐
                                    │  Pattern     │ → Reads registry.json
                                    │  Selector    │ → Picks patterns by vertical/style
                                    └──────┬──────┘
                                           ↓
                                    ┌─────────────┐
                                    │  Token       │ → str_replace {{TOKEN}} → content
                                    │  Injector    │ → Block structure NEVER touched
                                    └──────┬──────┘
                                           ↓
                                    ┌─────────────┐
                                    │  Image       │ → AI-generated OR Unsplash
                                    │  Handler     │ → Places in theme assets/
                                    └──────┬──────┘
                                           ↓
                                    ┌─────────────┐
                                    │  Theme       │ → Copies base from proven-core
                                    │  Assembler   │ → Swaps theme.json tokens
                                    │              │ → Builds .zip
                                    └──────┬──────┘
                                           ↓
                                    ┌─────────────┐
                                    │  Playground  │ → Installs theme
                                    │  Validator   │ → Checks for Attempt Recovery
                                    └──────┬──────┘
                                           ↓
                                    Upload to Supabase → Return download URL
                                           ↓
                                    n8n webhook → Brevo welcome email
```

---

## Execution Order

Work through phases sequentially. **Do NOT skip ahead.**

| Phase | File | Duration | What It Delivers |
|-------|------|----------|-----------------|
| 0 | [PHASE-0.md](PHASE-0.md) | 5-7 days | Playground validation + gold-standard theme |
| 1 | [PHASE-1.md](PHASE-1.md) | 7-10 days | 80-100 tokenized patterns + registry |
| 2 | [PHASE-2.md](PHASE-2.md) | 10-14 days | Laravel assembly engine (end-to-end generation) |
| 3 | [PHASE-3.md](PHASE-3.md) | 7-10 days | Frontend integration + Playground preview |
| 4 | [PHASE-4.md](PHASE-4.md) | 10-14 days | WPaify HTML-to-theme conversion |

Each phase has a **CHECKPOINT** at the end. Omar reviews before you proceed.

---

## The {{TOKEN}} System — CRITICAL CONTEXT

The old `agent-protocol.md` says "No `{{placeholder}}` syntax anywhere." That rule applied to the OLD approach where agents generated final block markup directly.

**NEW RULE (SSWG):** `{{TOKEN}}` placeholders exist ONLY in pattern source files inside `pattern-library/tokenized/`. They are replaced by the TokenInjector service BEFORE the pattern becomes part of the final theme. The FINAL theme.zip output must NEVER contain any `{{TOKEN}}` strings — that rule still holds.

**Where tokens live:**
- `pattern-library/tokenized/*.php` — YES, these contain `{{HERO_TITLE}}` etc.
- `themes/*/patterns/*.php` — NEVER. Final output has real content.

---

## Forbidden Practices

You MUST NOT:

1. **Generate raw block markup from scratch** — ONLY use tokenized patterns from proven-cores
2. **Use `core/navigation` block** in header/footer parts — ONLY paragraph links in group
3. **Hardcode hex colors in patterns** — ONLY use semantic palette slugs (`has-primary-color`)
4. **Hardcode pixel spacing** — ONLY use theme.json preset references (`var:preset|spacing|large`)
5. **Modify block comment JSON** during token injection — ONLY replace text content between HTML tags
6. **Skip Playground validation** before marking a theme as complete
7. **Use n8n for generation logic** — n8n ONLY handles the welcome email
8. **Commit API keys, secrets, or `.env` files**
9. **Re-open resolved decisions** listed above — they are FINAL

---

## Quality Gates

Every generated theme MUST pass ALL of these before delivery:

1. **Structural:** theme.zip has style.css, theme.json, functions.php, templates/index.html, templates/page.html, parts/header.html, parts/footer.html, at least 1 pattern
2. **Schema:** theme.json validates against WP schema v3. All color slugs exist. Font definitions valid.
3. **Markup:** Every pattern has matching opening/closing block comments. All block comment JSON is valid.
4. **Playground:** Theme activates without errors. Site Editor loads all templates without Attempt Recovery.
5. **Content:** No `{{TOKEN}}` placeholders remain. No original demo text remains. Business name appears in header.

---

## Review Workflow

1. Create branch: `feat/phase-N-description`
2. Commit work, push to GitHub
3. Open PR with description of completed tasks
4. CodeRabbit runs automated review
5. Omar runs verification steps from the phase file
6. Pass → merge, move to next phase. Fail → fix on same branch.

---

## File Map

```
agent-os/sswg/
├── PROTOCOL.md              ← You are here (read first)
├── PHASE-0.md               ← Foundation & Playground setup
├── PHASE-1.md               ← Pattern tokenization
├── PHASE-2.md               ← Assembly engine (Laravel)
├── PHASE-3.md               ← Frontend integration
├── PHASE-4.md               ← WPaify integration
└── TOKEN_SPEC_DRAFT.md      ← Starting token vocabulary

pattern-library/             ← Created in Phase 1
├── tokenized/               ← Tokenized pattern files
├── registry.json            ← Pattern metadata index
├── token-schema.json        ← Token definitions
└── TOKEN_SPEC.md            ← Human-readable token docs

scripts/playground/           ← Created in Phase 0
├── validate-theme.js        ← Theme validation script
├── validate-theme.blueprint.json
└── validate-all-cores.js
```

---

## Related Documents (Read in This Order)

1. **This file** — `agent-os/sswg/PROTOCOL.md`
2. **Current phase file** — `agent-os/sswg/PHASE-{N}.md`
3. **FSE Laws** — `BRAIN/CONSTITUTION/fse_laws.md` (block validation rules)
4. **Proven Cores Rules** — `agent-os/standards/proven-cores.md` (core theme usage rules)
5. **Product Vision** — `BRAIN/VISION/project-vision.md` (business context)
