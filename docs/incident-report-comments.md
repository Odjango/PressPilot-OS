# Incident Report: Attempt Recovery / Loose HTML Comments & Formatting
*Theme*: presspilot-summit-ridge-v1
*Date*: 2025-12-15

## 1. Problem
User reported "Attempt Block Recovery" errors on `front-page.html` and "Navigation no show" in `header.html`.
Error logs indicated "Unexpected or invalid content" within `wp:group` blocks.

## 2. Root Cause Analysis
### A. Front Page (Unexpected Content)
-   **Cause**: The authoring process introduced **HTML Comments** (e.g., `<!-- Section 1: Hero -->`) *between* block comments inside the main `wp:group`.
-   **Impact**: WordPress Parser interprets loose HTML/Text nodes inside a container block (like `group`) as "Freeform" content. If `wp:group` expects block children, this invalidates the block.

### B. Header / Navigation (Formatting)
-   **Cause**: The `wp:navigation` block contained indentation, newlines, and potentially loose whitespace between its inner block comments (`<!-- wp:navigation-link ... -->`).
-   **Impact**: While generally resilient, excessive whitespace or formatting inside a dynamic block's saved content can trigger parser mismatches or render issues (empty nav).

## 3. Resolution
-   **Front Page**: Removed all `<!-- Section ... -->` comments from `tests/fixtures/atlas-spec/templates/front-page.html` using `sed`.
-   **Header**: Flattened the `wp:navigation` block in `tests/fixtures/atlas-spec/parts/header.html` to a single line, removing all intermediate whitespace/newlines between inner blocks.

## 4. Verification Results
-   **Hard Gates Validation**: ✅ **PASSED**.
-   **Core Parse Test**: ✅ **PASSED**.
-   **Theme**: `themes/pp-summit-ridge.zip` generated with clean, strict block markup.

## 5. Prevention
Future templates must ensure `wp:group` and `wp:navigation` inner content contains *only* valid block comments/JSON, without interspersed HTML comments or decorative text nodes.
