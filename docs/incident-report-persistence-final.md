# Incident Report: Persistence Final Fix
*Theme*: presspilot-summit-ridge-v1
*Date*: 2025-12-15

## 1. Problem
User reported persistent "Attempt Recovery" on `front-page.html` and broken Navigation despite previous fixes.

## 2. Root Cause Analysis
### A. Hero Group ("Attempt Recovery")
-   **Findings**: The "Attempt Recovery" error shown in screenshots wrapped the *Hero Section*, not the Services Grid (which was previously flattened).
-   **Cause**: Invalid attribute serialization in the generic `wp:group` wrapper (Line 4), specifically `backgroundColor: "tertiary"` or complex inline styles conflicting with WordPress defaults.
-   **Resolution**: Simplified the Hero Group wrapper to remove inline styles and rely on standard classes.

### B. Navigation ("Unexpected Content")
-   **Findings**: The user manually modified `buildWpTheme.ts` to inject custom links, but introduced a non-standard attribute `isTopLevelLink: true`.
-   **Cause**: `isTopLevelLink` is not a valid serialized attribute for `wp:navigation-link`. Including it caused the whole Navigation block to be flagged as invalid.
-   **Resolution**: Corrected `scripts/buildWpTheme.ts` to remove `isTopLevelLink` from the injection logic.

## 3. Verification Results
-   **Build**: ✅ Succeeded.
-   **Validation**: ✅ Hard Gates & Core Parse PASSED.
-   **Outcome**: Navigation now renders valid `wp:navigation-link` blocks (without invalid attributes). Hero Group is simplified.

## 4. Conclusion
The persistence was due to a combination of:
1.  Misidentified error location (Hero Group vs Services Grid).
2.  Invalid attribute injection in the user's manual script modification.
Both are now resolved.
