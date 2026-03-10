# Phase 1 Execution Prompt for Claude Code

Copy everything below the line into Claude Code terminal:

---

Read the implementation plan at `docs/plans/2026-03-09-phase1-implementation-plan.md` and execute it using parallel subagents.

## Critical Safety Rule
DO NOT break any existing functionality. All 5 verticals (restaurant, ecommerce, saas, portfolio, local_service) must continue to work. Only the restaurant vertical's recipes get pipe-delimited alternatives. Other verticals stay untouched.

## Execution Strategy — Use Parallel Agents

The plan has 9 tasks with this dependency map:

**Wave 1 (run in parallel — no dependencies between them):**
- Task 1: PatternSelector pipe-delimited support (`backend/app/Services/PatternSelector.php`)
- Task 2: Font pairing system (`pattern-library/font-pairings.json` + `GenerateThemeJob.php` + `ThemeAssembler.php`)
- Task 3: Spacing standardization (audit all `pattern-library/skeletons/*.html`)

**Wave 2 (run in parallel — all depend on Task 1 being done):**
- Task 4: New hero skeletons (hero-minimal.html, hero-centered.html, hero-image-grid.html)
- Task 5: New testimonial skeletons (testimonials-single-featured.html, testimonials-with-rating.html)
- Task 6: New CTA + features skeletons (cta-split.html, features-alternating.html)
- Task 7: Restaurant-specific skeletons (specials-highlight.html, gallery-featured.html) — NOTE: this task requires updating AIPlanner prompt for SPECIALS_* tokens

**Wave 3 (sequential — depends on everything above):**
- Task 8: Wire final restaurant recipes in vertical-recipes.json
- Task 9: Integration test — run `php artisan test` and verify all pass

## Per-Task Rules
1. Read the FSE Knowledge Base (`docs/fse-kb/FSE-KNOWLEDGE-BASE-INDEX.md`) before writing ANY skeleton HTML
2. Every skeleton must follow WordPress FSE block markup spec exactly — validated JSON in block comments, matching open/close tags, required wrapper HTML elements
3. All new skeletons use standardized spacing: section padding = spacing|70 top/bottom + spacing|50 left/right, column gaps = spacing|60, block gaps = spacing|50, card padding = spacing|50, card internal gap = spacing|40, button gaps = spacing|30
4. Register every new skeleton in `pattern-library/skeleton-registry.json` with correct required_tokens and vertical_affinity
5. The implementation plan contains complete code for Tasks 1-6. Use it as-is, adapting only if you find issues during implementation
6. For Task 7 (specials-highlight, gallery-featured), build the skeleton HTML following the same patterns as the existing skeletons in the plan
7. Commit after each task with descriptive messages

## Testing
After all tasks complete:
- Run `cd backend && php artisan test` — ALL tests must pass
- Verify `pattern-library/skeleton-registry.json` is valid JSON (no trailing commas)
- Verify `pattern-library/vertical-recipes.json` is valid JSON
- Verify `pattern-library/font-pairings.json` is valid JSON
- Check that non-restaurant recipes in vertical-recipes.json are IDENTICAL to before (diff check)
- Count total skeletons — should be ~28-30 (up from 22)

## Skills to Use
Use `superpowers:executing-plans` for the overall workflow. Use `superpowers:dispatching-parallel-agents` for Wave 1 and Wave 2. Use `superpowers:verification-before-completion` before the final commit.

Begin by reading the full implementation plan, then dispatch Wave 1 agents.
