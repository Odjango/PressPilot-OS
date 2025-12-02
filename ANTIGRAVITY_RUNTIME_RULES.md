# ANTIGRAVITY RUNTIME RULES
These rules govern all runtime behavior of the PressPilot Theme Generator
and apply to any agent, script, or component that uses or modifies the
theme generation system.

These rules are strict. They override all other logic, prompts, or agent
intent.

---

## 1. VALIDATION IS THE GATEKEEPER
No generated theme may pass through the generator unless all validations
succeed:

- validateTemplateHeroes
- validateH1Count
- validatePatternSlugs
- validateBusinessNamePlaceholders
- validatePlaceholderAssets
- validateGoldenSpec
- validateTemplateSet (if present)

Any failure must stop execution immediately.

Agents must not bypass, disable, weaken, or comment out these checks.

---

## 2. NEVER MODIFY GOLDEN SPEC WITHOUT AUTHORIZATION
The directory `golden-spec/` represents the immutable reference standard.
It defines correct layout, pattern structure, CSS behavior, and template
composition.

No alterations are allowed unless:
1. Mort explicitly approves the change.
2. Documentation is updated first.
3. Validations are updated second.
4. Code is updated last.

---

## 3. BUSINESS NAME IS SINGLE SOURCE OF TRUTH
All theme output must derive the site name, hero text, labels, and titles
from BUSINESS_NAME.

Any detection of stale text (e.g., “BeeBoo”, “Onion”, “MooZoo”, etc.) is
considered a validation failure.

---

## 4. TEMPLATE & PATTERN INTEGRITY
Templates must:
- Begin with correct hero patterns
- Contain no layout improvisations
- Contain no alternative or nested hero blocks
- Preserve canonical structure:
  Header → Main → Footer

Patterns must:
- Use correct slugs
- Contain no extra H1 elements
- Use placeholder hero images with valid paths

---

## 5. DEMO CONTENT RESET LOGIC
When activating a generated theme:
- Delete all existing Pages created by any previous PressPilot imports
- Delete all Menus created by previous runs
- Recreate canonical pages
- Recreate navigation menu
- Wire menu to header navigation block

This logic must remain intact.

---

## 6. NO SILENT REFACTORING
No component, function, or script may:
- Rename slugs
- Reorganize paths
- Merge or delete pattern files
- Invert template logic
- Remove imports
- Replace cover blocks
- Introduce new block types

Unless this is explicitly ordered by Mort.

---

## 7. INDEX / FRONT-PAGE RESILIENCE
The following files must ALWAYS exist and be valid:
- templates/front-page.html
- templates/index.html
- templates/page-*.html
- parts/header.html
- parts/footer.html

If Gutenberg reports “unexpected or invalid content,” this is considered a
runtime failure and must be fixed before delivering a theme.

---

## 8. ABSOLUTE PROHIBITIONS
The following actions are forbidden:
- Disabling validations
- Overwriting Golden Spec files without approval
- Replacing placeholder images with empty files
- Moving hero out of first position in `<main>`
- Adding or removing H1 elements
- Adding new demo pages not part of the canonical set
- Changing directory structures
- Refactoring without running validations

---

## 9. FAILURE MODE
If any rule conflicts with requested changes, the agent must stop and say:

"This request modifies a protected invariant. I require explicit approval
from Mort before proceeding."

---

## 10. BEHAVIORAL REQUIREMENT
Agents must operate as deterministic build systems, not creative models.

This file, the Master Directive, and the Personality Lock form a
non-negotiable governance layer for all future development.
