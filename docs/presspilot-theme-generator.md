# PressPilot Theme Generator Master Directive (Version 1.1)

**ANTIGRAVITY — PRESSPILOT THEME GENERATOR MASTER DIRECTIVE**
(Use this EXACT text when prompting.)

You are not allowed to improvise, simplify, or redesign any part of the PressPilot Theme Generator.
You MUST follow all documented invariants, validations, and architectural laws found in this prompt.
Any change you make must obey these constraints, or you must STOP and request clarification before touching the code.

## SECTION 1 — NON-NEGOTIABLE INVARIANTS (THE LAWS)

You must not delete, weaken, bypass, or refactor around any of these rules.
They define the PressPilot generator’s behavior and must remain intact unless explicitly changed by Mort.

### Hero Rules
- Every generated page must begin with the correct hero pattern.
    - `front-page.html` → must use `presspilot-onion-v2/home-hero`.
    - Every other page template → must use `presspilot-onion-v2/page-hero`.
- The hero block must be:
    - `align: "full"`
    - First child inside `<main>`
    - Valid cover block with a placeholder image
- You must preserve and enforce `validateTemplateHeroes()`.

### Single H1 Rule
- Exactly one H1 must appear per page.
- Hero patterns contain the H1.
- All content patterns must contain zero H1s.
- You must keep `validateH1Count()`.

### Business Name Rule
- `BUSINESS_NAME` (derived from Config) is the single source of truth.
- ALL patterns, templates, demo content, and PHP files must pull from it.
- You must keep validation that scans for stale names such as “BeeBoo”, “Onion”, “CooCoo”, etc.

### Pattern Slug Rule
- All patterns must use correct final slugs: `presspilot-onion-v2/<pattern-name>`
- No pattern may reference `presspilot/...` or any mismatched prefix.
- You must keep slug validation.

### Placeholder Asset Rule
- Hero images must exist and must be non-zero-byte files.
    - `/assets/images/hero-placeholder-home.jpg`
    - `/assets/images/hero-placeholder-page.jpg`
- You must preserve placeholder asset validation.

### Demo Content & Destructive Mode (V1.1)
- **Destructive Mode:** If enabled in config, trash ALL existing pages and `wp_navigation` posts.
- **Content Generation:** Create pages based on the incoming config list.
- **Navigation:**
    - ALWAYS create a `wp_navigation` post titled "Main Navigation (AI)" containing links to the created pages.
    - **Header Wiring:** `parts/header.html` MUST use `wp:navigation` with an inner `wp:page-list` block as the safe default. It must NOT assume a specific navigation entity ID.

### Do Not Modify Golden Spec Rules
- The Golden Spec defines all allowed layout behaviors.
- You are NOT allowed to simplify, “clean up”, or optimize these rules.
- If a conflict arises, STOP and ask Mort before proceeding.

## SECTION 2 — REQUIRED WORKFLOW

Every time you change any file under `/scripts/`, `/themes/`, `/patterns/`, `/templates/`, or `/parts/`:

1.  **Step 1 — Run the Build**
    - `npx tsx scripts/buildWpTheme.ts`
2.  **Step 2 — If ANY validation fails**
    - You MUST stop, fix the cause, and run again.
3.  **Step 3 — Never bypass a validation**
    - Do not remove or weaken a validation to “make it pass”.
4.  **Step 4 — Update documentation FIRST if a rule must change**
    - Update `docs/presspilot-theme-generator.md`.
    - Then update validations.
    - Only then apply template/pattern changes.

## SECTION 3 — PROHIBITED ACTIONS

Antigravity, you are explicitly forbidden from:
- Removing validation just to make the build green
- “Simplifying” code by deleting guardrails
- Removing full-width align rules
- Moving hero blocks lower in the page
- Adding extra H1s
- Renaming slugs or patterns inconsistently
- Introducing new business name strings
- Editing or generating templates without running validations
- Overwriting placeholder images with empty or invalid files
- Modifying default WP demo content behavior
- Creating new templates that violate Golden Spec rules

If a task appears to conflict with these laws, STOP and ask Mort.

## SECTION 4 — OUTPUT REQUIREMENTS

When completing work:
- **ALWAYS show:**
    - Updated file diffs
    - Validation results
    - Final generated theme folder structure
- **NEVER** assume behavior—verify with the build script.
- **NEVER** output partial solutions or speculative code.

## SECTION 5 — FAILURE MODE

If you cannot complete a task while respecting these laws, you MUST say:
“This requires changing a protected invariant. I need Mort’s approval before modifying the rule.”
