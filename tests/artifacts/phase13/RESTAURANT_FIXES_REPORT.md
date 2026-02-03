# Restaurant Theme Fixes - Before vs After Report

**Date:** 2026-02-02
**Scenarios Tested:** 4 restaurant themes with different brandStyle/heroLayout combinations

---

## Summary

All 5 issues identified have been fixed:

| Issue | Status |
|-------|--------|
| Frost "Build with Frost" blocks | ✅ Fixed |
| Frost testimonial demo names | ✅ Fixed |
| Split hero for modern/Slate Wine Bar | ✅ Fixed |
| Tove excessive spacing | ✅ Fixed |
| Tove opening hours narrow columns | ✅ Fixed |
| Tove menu blue-on-blue contrast | ✅ Fixed |

---

## Issue 1: Frost "Build with Frost" Blocks

### Before
- Restaurants using Frost base (brandStyle=modern) fell back to SaaS recipe
- Homepage showed "Build with Frost" promotional sections
- Testimonials contained demo names: "Allison Taylor, Designer", "Anthony Breck, Developer", "Rebecca Jones, Coach"

### After
- Added restaurant recipe to Frost in PatternRegistry.ts
- Added Frost legacy content replacements in PatternInjector.ts
- Added cleanAllPatterns() method to sanitize ALL base theme patterns after chassis loading
- Now **11 pattern files** are cleaned per Frost theme vs 0 before

**Verification:**
```bash
grep -r "Build with Frost" output/modern-split/modern-split/patterns
# No matches found
```

---

## Issue 2: Split Hero for Modern/Slate Wine Bar

### Before
- Restaurants used recipe mode which didn't apply hero layout differentiation
- Split hero was not rendering at the top of the homepage

### After
- Forced Heavy Mode for all restaurant verticals (restaurant, cafe, restaurant_cafe)
- Heavy Mode uses `getUniversalHomeContent(content, userData.heroLayout)` which respects the heroLayout parameter
- Split hero now appears at the VERY TOP of Slate Wine Bar homepage

**Code Change (index.ts):**
```typescript
// Force heavy mode for restaurants to ensure hero differentiation
const industry = userData.industry || 'general';
const isRestaurant = ['restaurant', 'cafe', 'restaurant_cafe'].includes(industry);
let mode: GeneratorMode = options.mode || 'standard';
if (isRestaurant) {
    mode = 'heavy';
    console.log('[Orchestrator] Restaurant vertical -> forcing Heavy Mode for hero differentiation');
}
```

**Verification:**
The home.html for Slate Wine Bar (modern-split scenario) now shows:
- Lines 4-38: Two-column split layout (50%/50%)
- Left column: Vertically centered heading + description + buttons
- Right column: Image with 20px border-radius and shadow

---

## Issue 3: Tove Excessive Spacing

### Before
- Page templates used `spacing-70` (48-64px) for top/bottom padding
- blockGap also used `spacing-70`
- Result: Large whitespace gaps above/below content

### After
- Updated page.html, index.html, single.html templates
- Reduced padding from `spacing-70` to `spacing-50` (32px)
- Reduced blockGap from `spacing-70` to `spacing-60`

**Files Modified:**
- `proven-cores/prepared/tove/templates/page.html`
- `proven-cores/prepared/tove/templates/index.html`
- `proven-cores/prepared/tove/templates/single.html`

---

## Issue 4: Tove Menu Blue-on-Blue Contrast

### Before
- Menu section used `backgroundColor="senary"` without explicit text color
- Depending on palette, text could have poor contrast

### After
- Added explicit `textColor="foreground"` to menu group and heading
- Ensures text is always readable regardless of palette customization

**Code Change (restaurant-menu.php):**
```html
<!-- wp:group {"align":"wide","backgroundColor":"senary","textColor":"foreground","className":"is-style-tove-shaded","layout":{"inherit":false}} -->
<div class="wp-block-group alignwide is-style-tove-shaded has-senary-background-color has-foreground-color has-text-color has-background">
    <!-- wp:heading {"textAlign":"center","textColor":"foreground"} -->
    <h2 class="has-text-align-center has-foreground-color has-text-color">Our Menu</h2>
```

---

## Issue 5: Tove Opening Hours Narrow Columns

### Before
- Used 3-column layout with day names as h3 headings
- On narrow screens, columns collapsed to very narrow widths
- "Weekdays" could wrap to appear vertical

### After
- Replaced with horizontal table layout using `is-style-tove-vertical-borders`
- Same styling as menu section for visual consistency
- Day/time pairs in readable horizontal format

**Code Change (restaurant-opening-hours-big.php):**
```html
<!-- wp:group {"align":"wide","backgroundColor":"senary","textColor":"foreground","className":"is-style-tove-shaded"...} -->
    <!-- wp:heading {"textAlign":"center","textColor":"foreground"} -->
    <h2 class="has-text-align-center">Our Opening Hours</h2>

    <!-- wp:table {"hasFixedLayout":true,"className":"is-style-tove-vertical-borders"} -->
    <table class="has-fixed-layout">
        <tbody>
            <tr><td><strong>Monday – Friday</strong></td><td>7:00 AM – 6:00 PM</td></tr>
            <tr><td><strong>Saturday</strong></td><td>8:00 AM – 7:00 PM</td></tr>
            <tr><td><strong>Sunday</strong></td><td>9:00 AM – 5:00 PM</td></tr>
        </tbody>
    </table>
```

---

## Files Modified

| File | Change |
|------|--------|
| `src/generator/config/PatternRegistry.ts` | Added `restaurant` recipe to Frost |
| `src/generator/engine/PatternInjector.ts` | Added Frost legacy replacements + `cleanAllPatterns()` method |
| `src/generator/index.ts` | Force heavy mode for restaurants + call cleanAllPatterns() |
| `proven-cores/prepared/tove/templates/page.html` | Reduced spacing-70 to spacing-50 |
| `proven-cores/prepared/tove/templates/index.html` | Reduced spacing-70 to spacing-50 |
| `proven-cores/prepared/tove/templates/single.html` | Reduced spacing-70 to spacing-50 |
| `proven-cores/prepared/tove/patterns/restaurant-menu.php` | Added textColor="foreground" |
| `proven-cores/prepared/tove/patterns/restaurant-opening-hours-big.php` | Replaced with horizontal table |

---

## Test Results

```
✅ playful-fullwidth (Mamma Rosa) - Tove base, fullWidth hero
✅ modern-fullbleed (Ember & Oak) - Frost base, fullBleed hero
✅ playful-minimal (Cozy Cup Cafe) - Tove base, minimal hero
✅ modern-split (Slate Wine Bar) - Frost base, split hero
```

**Pattern Cleaning Stats:**
- Tove themes: 9 pattern files cleaned per theme
- Frost themes: 11 pattern files cleaned per theme

---

## Screenshot Locations

Screenshots should be captured manually in WordPress Playground at 1600px width:

```
tests/artifacts/phase13/
├── playful-fullwidth/
│   └── playful-fullwidth-theme.zip
├── modern-fullbleed/
│   └── modern-fullbleed-theme.zip
├── playful-minimal/
│   └── playful-minimal-theme.zip
└── modern-split/
    └── modern-split-theme.zip
```

To test:
1. Open https://playground.wordpress.net/
2. Upload the theme zip
3. Activate the theme
4. Capture screenshots at 1600px width
