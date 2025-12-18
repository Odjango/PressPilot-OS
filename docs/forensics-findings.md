# Forensic Inspection: Heavy Content Baseline
*Source*: `tests/fixtures/heavy-spec`
*Theme*: `pp-repro-heavy.zip`

## Overview
This forensic scan establishes the baseline for "FSE Hard Gates". The theme was generated using a "Heavy Content" fixture (cloned from `torture-spec`) to simulate a resource-intensive WordPress site.

## Findings

### 1. Structural Integrity (Gate 1 Target)
-   **Current State**: Generator emits balanced blocks.
-   **Risk**: Complex nesting (Group > Group > Columns > Column > Group) relies on generator consistency. Any deviation triggers "Attempt Recovery".
-   **Mitigation**: Stack-based validator (Gate 1) will permanently lock this.

### 2. JSON Attributes (Gate 2 Target)
-   **Current State**: Attributes are valid JSON.
-   **Risk**: Manual string concatenation in `buildWpTheme.ts` can introduce syntax errors (e.g., unescaped quotes).
-   **Mitigation**: Gate 2 will enforce `JSON.parse` on every attribute block.

### 3. Business Logic (Gate 3 Target)
-   **Nav Refs**: 0 Found. (Current validator enforces this).
-   **Presets**: All referenced presets exist.
-   **Template Validity**: `index.html` and `front-page.html` exist.

### 4. Layout Discipline (Gate 4 Target)
-   **Observation**: `front-page.html` uses heavy nesting (12 sections).
-   **Risk**: Deep `wp:row` chains or uncontrolled images.
-   **Action**: Gate 4 will inspect nesting depth and image attributes.

## Conclusion
The current `pp-repro-heavy.zip` passes strict validation *with the current rule set*. However, the "Hard Gates" upgrade is required to:
1.  Make structural validation (HTML correctness) explicit and fail-hard.
2.  Prevent any future generator regression (via Agent C upgrades).
3.  Enforce layout discipline as a rule, not just a convention.
