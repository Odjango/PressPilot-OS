# Incident Report: Serialization & Layout (Header Fix)
*Theme*: presspilot-summit-ridge-v1
*Date*: 2025-12-15

## 1. Problem
User reported:
-   **Header Cut from Top**: Header content pushed up or styled incorrectly.
-   **No Navigation**: Navigation block not preventing "Unexpected Content" error.

## 2. Root Cause Analysis
### A. Header Layout ("Cut from Top")
-   **Cause**: The `wp:group` wrapper for `header.html` contained verbose padding serialization (`style="padding-top:var(--wp--preset--spacing--sm)..."`). When WordPress encountered parsing issues or conflicting global styles, it likely stripped the padding or miscalculated sticky positioning, causing content to be cut off.
-   **Fix**: Replaced the verbose wrapper with a simplified, class-based version: `<!-- wp:group {"tagName":"header","align":"full","backgroundColor":"base","layout":{"type":"constrained"}} -->`.

### B. Navigation ("Unexpected Content")
-   **Cause**: The `buildWpTheme.ts` script (modified by user/previous steps) injected navigation links joined by **newlines** (`.join('\n')`).
-   **Conflict**: `wp:navigation` is extremely sensitive to whitespace between inner blocks when serialized. The injected newlines were treated as "Freeform Content", triggering validation failure.
-   **Fix**: Modified `buildWpTheme.ts` to join links with an empty string (`.join('')`) and remove newlines from the wrapper injection.

## 3. Verification Results
-   **Build**: ✅ Succeeded.
-   **Validation**: ✅ Hard Gates & Core Parse PASSED.
-   **Outcome**: Navigation injection is now "whitespace-safe". Header wrapper is "style-safe".

## 4. Conclusion
"Unexpected Content" in Navigation is almost always due to whitespace or invalid attributes. By flattening the injection and removing newlines, we ensure strict block validity.
