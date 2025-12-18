# Forensics Report: Attempt Recovery (Capital Corp)
*Theme*: presspilot-capital-corp-v1
*Date*: 2025-12-16

## 1. Analysis Scope
Files examined:
-   `parts/header.html`
-   `parts/footer.html`
-   `templates/front-page.html`
-   `templates/index.html`

## 2. Suspect Findings
### A. Header Navigation (`parts/header.html`)
-   **Structure**: Inline `wp:navigation-link` blocks.
-   **Anomaly**: The `wp:navigation` block wrapper has `layout: flex`. WordPress 6.x sometimes misbehaves if `overlayMenu` attribute is missing or ambiguous, though typically it defaults to "mobile".
-   **Risk**: Low, but strict serialization is vital.

### B. Complex Blocks in `front-page.html`
1.  **`wp:gallery` (Line 214)**:
    -   Uses `has-nested-images`. This is the modern format.
    -   Structure: `figure > figure > img`. matches block content.
    -   **Risk**: Moderate. If inner HTML deviates even slightly from what WP expects for `columns` attribute, it breaks.

2.  **`wp:details` (Line 277)**:
    -   This is a newer block.
    -   Content: `<details class="wp-block-details"><summary>...</summary>... blocks ...</details>`.
    -   **Risk**: High. If whitespace exists between `</summary>` and the first inner block comment, it can trigger recovery.

### C. Raw HTML / Leakage
-   **Inspection**: `front-page.html` seems tightly packed.
-   **Pattern**: Inner blocks in `wp:group` are indented.
-   **Crucial Rule**: The WP Parser is generally fine with indentation *between* blocks, but *inside* certain container blocks (like `wp:navigation` or `wp:buttons`), whitespace can be fatal.
-   **Findings**:
    -   `wp:buttons` (Line 20) contains `\n` and indentation.
    -   `wp:columns` (Line 6) contains `\n` and indentation.
    -   These are generally safe *unless* the parent block (e.g. `wp:buttons`) expects pure JSON-like serialization in some versions.
    -   However, **Navigation** in `header.html` was flattened to a single line previously. This was a known fix.

## 3. Conclusion & Fix Plan
The most likely culprit for "Attempt Recovery" in a "generated" theme is **HTML/JSON mismatch** or **invalid attribute serialization**.

**Validaton Plan (EV-01)**:
We cannot use Full Editor Validation (missing deps).
We will implement **Strict Leakage Validation**:
1.  Parse content using `block-serialization-default-parser`.
2.  Iterate valid blocks.
3.  **Fatal Error** if `freeform` (raw HTML) block is detected *between* defined blocks in strict contexts (Layouts).
4.  **Fatal Error** if `wp:pattern` is missing (already covered).
5.  **Fatal Error** if explicit "Placeholder" text found.

**Specific Target**:
We will treat `wp:buttons`, `wp:navigation`, and `wp:gallery` as "Strict Containers" where inner whitespace is suspect.
