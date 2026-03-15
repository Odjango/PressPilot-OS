# Visual Verification Guide - Dark Section Text Fixes

## Screenshot Captured
Location: `verification-screenshots/fixed-theme-homepage.png`

**Note**: The automated script captured the WordPress Playground default page. For full verification, manual theme installation is required.

---

## Manual Verification Steps

### 1. Upload Theme to WordPress Playground

1. Go to: https://playground.wordpress.net/
2. Click "Appearance" → "Themes" → "Add New" → "Upload Theme"
3. Upload: `themes/gold-standard-restaurant-fixed.zip`
4. Click "Activate"
5. View the homepage

### 2. What to Verify (Visual Checklist)

#### ✅ Hero Section (Top of Page)
**Expected Result:**
- Background: Restaurant/food image with **dark semi-transparent overlay**
- "Welcome to" text: **WHITE** and clearly readable
- "Gold Standard Restaurant" heading: **WHITE**, large, clearly readable
- Subtitle text: **WHITE** and clearly readable
- CTA buttons: Properly styled and visible

**Before (Broken):**
- Dark text on light overlay OR dark text on dark image = invisible
- dimRatio: 90 (too opaque)
- overlayColor: white/base
- Text inherited from parent (no explicit color)

**After (Fixed):**
- White text on dark overlay = always readable
- dimRatio: 60 (balanced)
- overlayColor: dark/main
- Text explicitly set to `textColor: "base"` (white)

---

#### ✅ Dark Feature Boxes Section
**Location:** "Why Guests Love Us" section (if present in templates using the pattern)

**Expected Result:**
- Background: Dark color (`backgroundColor: "main"`)
- Box titles: **WHITE/LIGHT** color (already working)
- Box descriptions: **LIGHT GRAY** (`textColor: "border-light"`) clearly readable

**Before (Broken):**
- Description paragraphs missing `textColor` attribute
- Inherited color might be dark/unreadable

**After (Fixed):**
- All description paragraphs have explicit `textColor: "border-light"`
- Class: `has-border-light-color has-text-color`

---

## Code-Level Verification

If you have access to the WordPress Site Editor:

### Check Hero Block Attributes

1. Go to: Appearance → Editor → Templates → Front Page
2. Click on the hero Cover block
3. Open the block settings panel (right sidebar)
4. Verify:
   - **Overlay opacity**: 60% (not 90%)
   - **Overlay color**: Dark color (not white/base)
   - Click on the heading inside the cover
   - Verify **Text color** is set to "Base" (white)

### Check Pattern Files

1. Go to: Appearance → Editor → Patterns
2. Find "Hero Light" pattern
3. Edit in Code view
4. Verify the `<!-- wp:cover -->` block has:
   ```json
   "dimRatio":60,
   "overlayColor":"main",
   "isDark":true
   ```
5. Verify ALL inner headings and paragraphs have:
   ```json
   "textColor":"base"
   ```

---

## Quick Test Without Installing

If you want to verify the code changes without installing:

### 1. Check Hero Pattern File
```bash
cat themes/gold-standard-restaurant/patterns/hero-light.php | grep -A 5 "wp:cover"
```

**Should show:**
- `"dimRatio":60`
- `"overlayColor":"main"`
- `"isDark":true`

### 2. Check Front Page Template
```bash
cat themes/gold-standard-restaurant/templates/front-page.html | grep -A 10 "wp:cover"
```

**Should show same attributes as above**

### 3. Check Feature Boxes
```bash
grep 'textColor.*border-light' themes/gold-standard-restaurant/patterns/feature-boxes-with-icon-dark.php | wc -l
```

**Should return:** 4 (one for each feature box description)

---

## Expected Visual Results Summary

| Section | Before | After |
|---------|--------|-------|
| Hero overlay | 90% white | 60% dark |
| Hero text color | Dark (inherited) | White (explicit) |
| Hero text visibility | ❌ Invisible on dark images | ✅ Always readable |
| Feature box descriptions | ❌ May inherit dark color | ✅ Explicit light color |
| Contrast checker (preview) | Simple brightness | WCAG luminance |

---

## Testing in Different Scenarios

The fixes ensure readability across all scenarios:

1. **Hero with dark image** (e.g., dark restaurant interior)
   - ✅ White text on 60% dark overlay = readable

2. **Hero with light image** (e.g., bright outdoor dining)
   - ✅ White text on 60% dark overlay = readable

3. **Hero with mixed light/dark image**
   - ✅ Overlay provides consistent background for white text

4. **Dark feature boxes on any page background**
   - ✅ Explicit light text color = always readable

---

## Files to Inspect

If manually reviewing the fixes:

1. **themes/gold-standard-restaurant/patterns/hero-light.php**
   - Lines 14-28: Cover block + inner text blocks

2. **themes/gold-standard-restaurant/templates/front-page.html**
   - Lines 6-24: Inline hero cover block

3. **themes/gold-standard-restaurant/patterns/feature-boxes-with-icon-dark.php**
   - Lines 40, 58, 76, 94: Description `<p>` tags with `textColor`

4. **app/studio/StudioClient.tsx**
   - Lines 428-445: `isLight()` function with WCAG formula

---

## Automated Test (Future)

To prevent regression, consider adding:

```typescript
// tests/visual/dark-section-contrast.spec.ts
test('hero text readable on dark overlay', async ({ page }) => {
  await page.goto('/');
  const hero = page.locator('.wp-block-cover').first();
  const heading = hero.locator('h1').first();

  // Verify text color is white/light
  const color = await heading.evaluate(el =>
    getComputedStyle(el).color
  );
  expect(color).toMatch(/rgb\(255, 255, 255\)|rgb\(2[45]\d, 2[45]\d, 2[45]\d\)/);

  // Verify overlay is dark with correct opacity
  const overlay = hero.locator('.wp-block-cover__background');
  const bgColor = await overlay.evaluate(el =>
    getComputedStyle(el).backgroundColor
  );
  expect(bgColor).toMatch(/rgba?\(\d+, \d+, \d+, 0\.6\)/);
});
```

---

**Verification Status:** ✅ Code fixes applied and committed
**Visual Verification:** ⏳ Awaiting manual WordPress Playground test
**Next Step:** Upload theme ZIP and capture screenshot of actual theme homepage
