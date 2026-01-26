# PressPilot Project Memory
**State Saved: 2024-05-21**

## 1. Core Directives (User Mandates)
*   **The "Rental" Prohibition:** ZERO external plugin dependencies. Standalone themes only.
*   **The "Blueprint" Rule:** File-based structure (zip), not database layouts.
*   **Semantic Ownership:** Standard WP hierarchy (`archive.php`, `single.php`).

## 2. Learned Factory Patterns
### Footer Factory
*   **Structure:** Must use **Paragraph Links** inside Group blocks.
*   **Prohibition:** Do NOT use `core/navigation` block in the footer (causes "Attempt Recovery" errors).
*   **Styling:** Must match Brand Colors (Primary Background, Text Contrast).

### Brand Factory (Color Logic)
*   **Source of Truth:**
    1.  **Manual Override:** User picks via UI (Primary/Secondary/Accent).
    2.  **Smart Extraction:** If no manual override, extracting 3-color palette from **Uploaded Logo**.
    3.  **Fallback:** Preset JSON (e.g., `restaurant-soft.json`).
*   **Requirement:** The user must have a "Color Wheel" option (Implemented in MVP Demo).

### Navigation Logic
*   **Restoration:** "Menu" and "Map" pages must be functional (content + nav links), not empty.
*   **Restaurant Specifics:** `page-menu.html` must be generated with a 2-column grid pattern.

## 3. Architect Skills (Role Definitions)
The system leverages specialized "Architect" skills found in `SKILLS/`:
*   `restaurant_architect.md`: Defines the "Menu Grid" pattern and Nav injection.
*   `design_director.md`: Defines global style rules.

**Status:** These patterns are currently HARDCODED into `PatternInjector.ts` and `color-extractor.ts`. Code is the enforceable law.
