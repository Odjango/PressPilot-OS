# PressPilot Project Memory
**State Saved: 2026-02-02** | **Current Phase: 14 Complete**

---

## 1. Core Directives (User Mandates)

*   **The "Rental" Prohibition:** ZERO external plugin dependencies. Standalone themes only.
*   **The "Blueprint" Rule:** File-based structure (zip), not database layouts.
*   **Semantic Ownership:** Standard WP hierarchy (`archive.php`, `single.php`).

---

## 2. Generator Architecture (Phase 13-14)

### Proven-Core Orchestration Model
The generator assembles themes from proven base themes rather than synthesizing new code:
- **Chassis System:** Load pre-validated base themes (Frost, Tove, TT4)
- **Recipe Mode:** Pattern-based assembly for standard verticals
- **Heavy Mode:** Full content injection with hero differentiation (used for restaurants)

### Base Theme Routing
| Vertical | brandStyle | Base Theme |
|----------|-----------|------------|
| Restaurant | playful | Tove |
| Restaurant | modern | Frost |
| General | - | TT4 |

### Hero Layout System
Four hero variants implemented (Phase 13):
- **fullBleed:** Full-width cover with dark overlay
- **fullWidth:** Constrained content, full-width background
- **split:** Two-column layout (50%/50%)
- **minimal:** Clean, text-focused header

---

## 3. Learned Factory Patterns

### Footer Factory
*   **Structure:** Must use **Paragraph Links** inside Group blocks.
*   **Prohibition:** Do NOT use `core/navigation` block in the footer (causes "Attempt Recovery" errors).
*   **Styling:** Must match Brand Colors (Primary Background, Text Contrast).

### Brand Factory (Color Logic)
*   **Source of Truth:**
    1.  **Manual Override:** User picks via UI (Primary/Secondary/Accent).
    2.  **Smart Extraction:** If no manual override, extract 3-color palette from **Uploaded Logo** using k-means clustering.
    3.  **Fallback:** Preset JSON (e.g., `restaurant-soft.json`).
*   **Requirement:** The user must have a "Color Wheel" option (Implemented in MVP Demo).

### Navigation Logic
*   **Restoration:** "Menu" and "Map" pages must be functional (content + nav links), not empty.
*   **Restaurant Specifics:** `page-menu.html` must be generated with a 2-column grid pattern.

---

## 4. Content Injection System (Phase 13-14)

### Slot-Based Injection
ContentBuilder creates a `slots` dictionary with `{{PLACEHOLDER}}` format:
```typescript
slots['{{BUSINESS_NAME}}'] = userData.name;
slots['{{CONTACT_EMAIL}}'] = userData.email || '';
slots['{{CONTACT_PHONE}}'] = userData.phone || '';
slots['{{SOCIAL_FACEBOOK}}'] = userData.socialLinks?.facebook || '#';
```

PatternInjector applies these via `applySlotReplacements()`.

### Legacy Content Replacement
For base themes with hardcoded demo content (Frost, Tove, TT4):
- **Frost:** "Build with Frost" → business name, testimonial demo names replaced
- **Tove:** "Niofika Café" → business name, address replaced
- **TT4:** "Études" → business name

### Pattern Cleaning (Phase 14)
After chassis loading, ALL base theme patterns are sanitized:
```typescript
await patternInjector.cleanAllPatterns(themeDir, userData);
```
This ensures patterns in the WordPress pattern library don't contain marketing content.

---

## 5. Restaurant Vertical Fixes (Phase 14)

### Frost (brandStyle=modern)
- Added restaurant recipe to PatternRegistry (was falling back to SaaS)
- Added legacy content replacements for "Build with Frost" and testimonial names
- Forces **Heavy Mode** for hero layout differentiation

### Tove (brandStyle=playful)
- Reduced page template spacing from `spacing-70` to `spacing-50`
- Added explicit `textColor="foreground"` to menu patterns
- Rewrote opening hours from 3-column to horizontal table layout

### Heavy Mode Forcing
Restaurants always use Heavy Mode to ensure hero differentiation:
```typescript
if (isRestaurant) {
    mode = 'heavy';
    console.log('[Orchestrator] Restaurant vertical -> forcing Heavy Mode');
}
```

---

## 6. Data Flow Pipeline

```
StudioFormInput (UI)
    → buildSaaSInputFromStudioInput()
    → PressPilotSaaSInput (API)
    → transformSaaSInputToGeneratorData()
    → GeneratorData (Internal)
    → ContentBuilder.invoke()
    → ContentJSON (slots + pages)
    → PatternInjector
    → Final Theme (.html, .php)
```

See [docs/DATA_FLOW.md](../../docs/DATA_FLOW.md) for full documentation.

---

## 7. Quality Gates

### ContentValidator
Post-generation validation prevents demo content from shipping:
```typescript
const FORBIDDEN_STRINGS = [
    'Niofika Café', 'Niofika', 'hammarby@niofika.se',
    'Études', 'Build with Frost', 'Allison Taylor',
    // ...
];
```

### Hard Gates (5 validation layers)
1. Block Markup Structural Gate (stack-based parser)
2. Attributes JSON Gate (JSON.parse validation)
3. PressPilot Hard Rules Gate (NAV-REF BAN, PRESET EXISTENCE)
4. Layout Discipline Gate (nesting depth, media constraints)
5. Diagnostics

See [docs/pp-hard-gates.md](../../docs/pp-hard-gates.md) for details.

---

## 8. Architect Skills (Role Definitions)

The system leverages specialized "Architect" skills found in `CONSTITUTION/verticals/`:
*   `restaurant_architect.md`: Defines the "Menu Grid" pattern and Nav injection
*   `woocommerce_architect.md`: Defines shop page patterns
*   `fitness_architect.md`: Defines class schedule patterns
*   `portfolio_architect.md`: Defines gallery patterns

**Status:** These patterns are implemented in `PatternInjector.ts` and recipe configs. Code is the enforceable law.

---

## 9. Recent Commits (Reference)

| Commit | Date | Description |
|--------|------|-------------|
| `cf4ccf9` | 2026-02-02 | feat: Phase 14 - Restaurant theme fixes (Frost & Tove) |
| `82a3eee` | 2026-02-02 | feat: Phase 13 - generator best practices upgrade |
| `5054842` | 2026-02-02 | fix: add Tove content replacement to PatternInjector |
| `562826b` | 2026-02-02 | feat: Phase 11 - hero visual differentiation + restaurant brandStyle |

---

## 10. Known Patterns to Preserve

### Patterns That Work
- Heavy Mode for restaurants (ensures hero differentiation)
- Pattern cleaning after chassis load (removes demo content)
- Slot-based content injection (predictable, testable)
- Legacy content replacement (handles base theme marketing)

### Patterns to Avoid
- Navigation blocks in footer (causes "Attempt Recovery")
- Hardcoded hex colors (use theme.json presets)
- Recipe mode for restaurants (doesn't apply hero layouts)
- Template placeholders like `{{variable}}` (old system, replaced by blocks)
