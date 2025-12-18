# Proof: Agent 3 & 4 (Canonical Wrapper & Header)
*Theme*: presspilot-capital-corp-v1
*Date*: 2025-12-16

## 1. Validation Logic
The **EV-01 (Gate 7)** was extended to enforce:
1.  **Wrapper Ban (Agent 3)**: Structural blocks (`core/group`, `core/columns`) must NOT contain manual HTML wrappers (`<div...>`, `<main...`).
2.  **Strict Leakage (Agent 3)**: 0 freeform HTML.
3.  **Header Check (Agent 4)**: `front-page.html` must contain `wp:template-part` for header.

## 2. Pass Log
```bash
$ npx tsx scripts/validateGenerator.ts themes/presspilot-capital-corp-v1

🔒 PressPilot Hard Gates Validation: themes/presspilot-capital-corp-v1
...
--- Gate 7: Editor Validation (EV-01) ---
🧠 Editor Validation (EV-01): Scanning themes/presspilot-capital-corp-v1...

✅ [EV-01] Passed. No freeform leakage or forbidden patterns.
✅ Validation PASSED.
```
*Note: The validator scanned `front-page.html`. Since it stripped the Header `<div>` wrapper and injected the template part, the output is now canonical.*

## 3. Verified Structures (Agent 2)
**Front Page Header**:
```html
<!-- wp:template-part {"slug":"header","area":"header","tagName":"header"} /-->
```

**Hero Group (Canonical)**:
```html
<!-- wp:group {"tagName":"main","layout":{"type":"constrained"}} -->
    <!-- wp:group {"align":"full","backgroundColor":"tertiary","layout":{"type":"constrained"}} -->
        <!-- wp:columns {"align":"wide"} -->
```
*(No `<main>` or `<div>` tags manually emitted)*.

## 4. Final Artifact
-   **Zip**: `themes/pp-victory-capital-corp.zip`
