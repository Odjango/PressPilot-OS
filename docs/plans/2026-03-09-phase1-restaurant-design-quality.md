# Phase 1 Design: Restaurant Vertical — Polish + Variation

> **Date:** 2026-03-09
> **Status:** APPROVED by Omar
> **Scope:** Restaurant vertical only — make it the gold standard, then replicate to other verticals.
> **Constraint:** DO NOT break existing pipeline. Upgrade inputs (skeletons, recipes, tokens), not the engine.

---

## Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Phase 1 scope | Both polish + variation, restaurant only (Option C) | Smaller blast radius, one vertical becomes gold standard |
| Variant selection | Random for now (Option A), AI-guided later (Option B) | Zero pipeline changes to AIPlanner, variation immediately |
| Reference themes | Rosa2, TwentyTwentyFive, Neve FSE, Kadence Restaurant, WordPress Showcase | Omar's curated list — see DESIGN_REFERENCE_THEMES.md |

---

## Four Workstreams

### 1. Skeleton Polish & Expansion
- Rebuild existing restaurant skeletons with premium-quality markup (inspired by Rosa2 + TwentyTwentyFive)
- Add ~15 new skeleton variants for 2-3 options per section type
- Heroes: 3 → 6-7 variants
- Testimonials: 1 → 3 variants
- Features, CTAs, galleries all get alternatives
- Target: ~35-40 total skeletons (up from 22)
- New skeletons registered in skeleton-registry.json with correct required_tokens and vertical_affinity

### 2. Recipe Variation System
- Change vertical-recipes.json from single-skeleton entries to pipe-delimited alternatives
- Example: `"hero-cover | hero-minimal | hero-split"`
- PatternSelector randomly picks one per slot at generation time
- Modify PatternSelector::select() to parse pipe syntax and pick randomly
- Same page structure types (home, about, menu, services, contact), different visual feel every time

### 3. Font Pairing System
- Replace single-font approach with heading + body font pairs
- Restaurant: Playfair Display (heading) + Source Sans 3 (body)
- Update theme.json fontFamilies to register two font families (slug: "heading", slug: "body")
- ThemeAssembler injects both fonts
- No skeleton markup changes needed — headings and paragraphs already use separate blocks

### 4. Spacing Standardization
- Lock all skeletons to 8px-unit rhythm
- Map to WordPress preset spacing slots consistently:
  - Section padding (top/bottom): spacing|70 (large sections) or spacing|60 (compact sections)
  - Block gaps within sections: spacing|50
  - Inner element gaps: spacing|40 or spacing|30
- Audit every existing skeleton, replace ad-hoc values
- Define spacing rules per section type so all skeletons are consistent

---

## What Does NOT Change
- The 5-step pipeline (AIPlanner → PatternSelector → ImageHandler → TokenInjector → ThemeAssembler)
- Token schema format ({{TOKEN_NAME}} placeholders)
- AIPlanner prompts and token generation
- ImageHandler image sourcing
- ThemeAssembler ZIP structure
- All non-restaurant verticals (untouched in Phase 1)

---

## Files Affected

| File | Change Type |
|------|------------|
| pattern-library/skeletons/*.html | Rebuild existing + add new |
| pattern-library/skeleton-registry.json | Register new skeletons |
| pattern-library/vertical-recipes.json | Add pipe-delimited alternatives for restaurant |
| backend/app/Services/PatternSelector.php | Parse pipe syntax, random selection |
| proven-cores/ollie/theme.json | Add second font family slot |
| backend/app/Services/ThemeAssembler.php | Inject heading + body font pair |
| pattern-library/token-schema.json | Add tokens for any new skeletons that need them |

---

## Success Test
Generate 3 restaurant themes side by side:
- Each should look different in layout (variant selection working)
- All should look premium (polish working)
- None should look like they came from the same template
- All must pass existing smoke tests (nothing broken)

---

## References
- docs/plans/DESIGN_REFERENCE_THEMES.md (Omar's curated theme list)
- docs/plans/2026-03-09-design-quality-phase-design.md (master strategy doc)
- docs/plans/DESIGN_QUALITY_IMPLEMENTATION_GUIDE.md (code examples)
