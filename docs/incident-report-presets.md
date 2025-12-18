# Incident Report: Attempt Recovery / Broken Presets
*Theme*: presspilot-cascade-valley-v1
*Date*: 2025-12-15

## 1. Problem
User reported "Attempt Block Recovery" errors in the Site Editor for `index`, `header`, and `404` templates. Screenshots confirmed validation failures.

## 2. Root Cause Analysis
The errors were caused by **Undefined Presets in Block JSON Attributes**.
-   While CSS variables (e.g., `var(--wp--preset--spacing--40)`) were previously fixed, the **JSON attribute syntax** (e.g., `var:preset|spacing|40`) remained pointing to legacy slugs (`40`, `medium`, `x-large`).
-   WordPress Core throws "Attempt Recovery" when encountering a preset slug in `var:preset|...` that is not defined in `theme.json`.

## 3. Resolution
-   **Spec Update**: Batch-replaced all legacy JSON preset references in `tests/fixtures/atlas-spec` to use modern T-shirt sizes (`xs`, `sm`, `md`, `lg`, `xl`, `2xl`, `3xl`).
-   **Validator Upgrade**: Enhanced **Gate 3** to rigorously scan for `var:preset|TYPE|SLUG` patterns and validate the slug against the allowed list (`xs`...`3xl`, `base`...`contrast`).

## 4. Verification Results
-   **Hard Gates Validation**: ✅ **PASSED** (Gate 3 now passes with valid JSON presets).
-   **Core Parse Test**: ✅ **PASSED**.
-   **Theme**: `themes/pp-cascade-valley.zip` generated with fully resolved presets.

## 5. Prevention
The upgraded Gate 3 will now prevent any future build that introduces invalid JSON preset slugs, ensuring the "Attempt Recovery" error class is permanently eliminated.
