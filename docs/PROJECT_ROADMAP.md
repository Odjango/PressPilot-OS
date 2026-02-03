# PressPilot OS — Development Roadmap

## Phase 1: Stabilization & Core Refactor (Current)
**Goal:** Reach 100% reliability for generated themes. Eliminate "Attempt Recovery" errors.
*   [x] **Refactor Generator Core:** Consolidate `PatternInjector`, `StructureValidator`, `ContentEngine` into `src/generator`.
*   [x] **Implement Color Harmonization:** `ColorHarmonizer` utility with WCAG checks and saturation caps.
*   [x] **Implement Stable Navigation:** Migrate `universal-header.ts` to use self-closing `wp:navigation` blocks.
*   [x] **Audit FSE Compliance:** Document full compliance rules in `WORDPRESS_FSE_REFERENCE.md`.
*   [x] **Final Smoke Test:** Verify `npm run dev` and `npm run build` pass consistently.

## Phase 2: Vertical Expansion (Restaurant & Café)
**Goal:** Deliver deep value for the Restaurant vertical with structured data features.
*   [x] **UI - Menu Upload Flow:** Create `src/app/studio/steps/MenuUploader.tsx`.
    *   Allow raw text paste or file upload.
    *   Parse into structured JSON (`RestaurantMenu` type).
*   [x] **Generator - Page Templates:** Create `src/generator/patterns/universal-menu.ts`.
    *   Implement "Menu Section" pattern (Tabs or List view).
    *   Implement "Dish Card" pattern (Image, Title, Price, Description).
*   [x] **Logic - Menu Injection:** Wire `ContentEngine` to populate menu patterns from parsed data.
*   [x] **Testing:** Verify menu page generation in standard and heavy content modes.


## Phase 3: SaaS Studio UI Polish
**Goal:** Make the "Hands" (SaaS App) feel as premium as the "Brain" (Generator).
*   [ ] **Global Layout:** Refine `app/layout.tsx` with unified header/footer.
*   [ ] **Step Navigation:** Implement smooth transitions between onboarding steps.
*   [ ] **Preview Accuracy:** Ensure `staticSite.ts` preview matches the final WordPress theme output 1:1.
*   [ ] **Mobile Responsiveness:** Verify Studio UI on mobile devices.

## Phase 13: Generator Best Practices Upgrade (Complete)
**Goal:** Improve data flow, hero differentiation, and content validation.
*   [x] **Contact Data Flow:** Wire Studio UI contact fields through full pipeline.
*   [x] **Hero Layout Differentiation:** Implement fullBleed, fullWidth, split, minimal hero variants.
*   [x] **Restaurant brandStyle Routing:** Map playful → Tove, modern → Frost.
*   [x] **Content Validation:** Add ContentValidator to catch forbidden demo strings.

## Phase 14: Restaurant Theme Fixes (Complete)
**Goal:** Fix critical issues in Frost and Tove restaurant theme generation.
*   [x] **Frost "Build with Frost" Removal:** Add restaurant recipe + legacy content replacements.
*   [x] **Frost Testimonial Names:** Replace demo names (Allison Taylor, etc.) with neutral guest names.
*   [x] **Split Hero Fix:** Force Heavy Mode for restaurants to ensure hero layout differentiation.
*   [x] **Tove Spacing Normalization:** Reduce page padding from spacing-70 to spacing-50.
*   [x] **Tove Menu Contrast:** Add explicit textColor="foreground" for readability.
*   [x] **Tove Opening Hours:** Replace narrow 3-column layout with horizontal table.
*   [x] **Pattern Cleaning:** Add cleanAllPatterns() to sanitize ALL base theme patterns post-chassis.

## Phase 15: Documentation & Marketing Prep
**Goal:** Prepare for public launch and user onboarding.
*   [ ] **User Guides:** Create "Getting Started" docs for end-users (installing the ZIP, using Site Editor).
*   [ ] **Developer Docs:** Finalize API documentation for `POST /api/generate`.
*   [ ] **Marketing Assets:** Generate screenshots of "Flagship" themes (Restaurant, Agency, SaaS).
*   [ ] **Landing Page:** Update the main landing page with "Generated in 90s" value prop and live demo link.

## Ongoing: "Hard Gates" Maintenance
*   **Validator:** Continuously update `WP Theme Output Checker` skill.
*   **Forensics:** Log any new FSE errors to `attempt-recovery-forensics.md`.
