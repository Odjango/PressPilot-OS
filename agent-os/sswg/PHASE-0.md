# PHASE 0: Foundation & Playground Setup

> **Duration:** 5-7 days | **Branch:** `feat/phase-0-foundation`
> **Prerequisite:** Read [PROTOCOL.md](PROTOCOL.md) first.
> **Goal:** Set up WordPress Playground as the validation engine, validate all proven-core patterns, and build the gold-standard reference theme.

---

## Task 0.1: Install WordPress Playground CLI

**What:** Install `@wp-playground/cli` as a dev dependency. Create `scripts/playground/` directory.

**Steps:**
1. Run `npm install --save-dev @wp-playground/cli` in project root
2. Create `scripts/playground/` directory
3. Verify installation: `npx @wp-playground/cli server` should start a WordPress instance in terminal
4. Ctrl+C to stop. Must exit cleanly.

**Files created/modified:**
- `package.json` (new devDependency)
- `scripts/playground/` (new directory)

**Verification:**
- [ ] `npx @wp-playground/cli server` starts successfully
- [ ] WordPress admin is accessible at the URL shown in terminal
- [ ] Clean exit on Ctrl+C

**Note:** Requires Node.js 18+. The CLI runs WordPress via WebAssembly — no Docker/MySQL/PHP needed.

---

## Task 0.2: Create Validation Blueprint

**What:** Write a Playground Blueprint JSON file that installs a theme from a local path, activates it, and navigates to the Site Editor for validation.

**Steps:**
1. Create `scripts/playground/validate-theme.blueprint.json`
2. Blueprint should:
   - Install theme from local zip/directory
   - Activate the theme
   - Log in as admin
   - Navigate to `/wp-admin/site-editor.php`
3. Test with Ollie from `proven-cores/ollie/`

**Blueprint structure:**
```json
{
  "landingPage": "/wp-admin/site-editor.php",
  "steps": [
    { "step": "login", "username": "admin", "password": "password" },
    {
      "step": "installTheme",
      "themeZipFile": {
        "resource": "url",
        "url": "THEME_PATH_HERE"
      }
    }
  ]
}
```

**Files created:**
- `scripts/playground/validate-theme.blueprint.json`

**Verification:**
- [ ] Blueprint loads Ollie theme in Playground
- [ ] Site Editor opens without errors
- [ ] Theme is active (visible in Appearance > Themes)

---

## Task 0.3: Build Validation Script

**What:** Create a Node.js script that automates theme validation end-to-end.

**Steps:**
1. Create `scripts/playground/validate-theme.js`
2. Script takes a theme path as argument: `node validate-theme.js /path/to/theme/`
3. Script should:
   a. If path is a directory, zip it to a temp file
   b. Launch Playground with the blueprint + theme
   c. Wait for Site Editor to load
   d. Inspect the page for block validation error indicators (Attempt Recovery banners, error notices)
   e. Output JSON result: `{"valid": true/false, "errors": []}`
4. Use Playwright or Playground's JavaScript API for page inspection

**Files created:**
- `scripts/playground/validate-theme.js`

**Verification:**
- [ ] `node scripts/playground/validate-theme.js proven-cores/ollie/` returns `{"valid": true}`
- [ ] `node scripts/playground/validate-theme.js proven-cores/frost/` returns `{"valid": true}`
- [ ] `node scripts/playground/validate-theme.js proven-cores/tove/` returns `{"valid": true}`
- [ ] Test with a known-broken theme from `themes/` (any with historical Attempt Recovery issues). Should return `{"valid": false, "errors": [...]}`

**Note:** This script replaces the entire WP Factory validation requirement. It runs locally, in CI, and on the server.

---

## Task 0.4: Validate All Proven Core Patterns

**What:** Run validation against all 6 proven-core themes. Build a health matrix.

**Steps:**
1. Create `scripts/playground/validate-all-cores.js`
2. Run validation for each core: ollie, frost, tove, spectra-one, twentytwentyfour, blockbase
3. Record pass/fail results
4. Any failing themes: document the exact errors
5. Create `proven-cores/HEALTH_MATRIX.md` with results

**Expected format for HEALTH_MATRIX.md:**
```markdown
# Proven Cores Health Matrix
| Core | Patterns | Validation | Errors |
|------|----------|-----------|--------|
| Ollie | 99 | PASS | 0 |
| Frost | 51 | PASS | 0 |
| ... | ... | ... | ... |
```

**Files created:**
- `scripts/playground/validate-all-cores.js`
- `proven-cores/HEALTH_MATRIX.md`

**Verification:**
- [ ] HEALTH_MATRIX.md exists with results for all 6 cores
- [ ] All passing themes have 0 Attempt Recovery errors
- [ ] Any issues are documented with exact error messages

---

## Task 0.5: Build Gold Standard Reference Theme

**What:** Manually assemble a complete 5-page restaurant theme using ONLY patterns from Ollie + Tove. This becomes the reference for what every generated theme should look like.

**Steps:**
1. Create `themes/gold-standard-restaurant/`
2. Copy base structure from Ollie (style.css, functions.php, theme.json)
3. Build these pages using proven-core patterns:
   - **Home:** hero (ollie/hero-light or hero-dark) + features (ollie/feature-boxes-with-icon-dark) + testimonials (ollie/testimonials-and-logos) + CTA (ollie/text-call-to-action)
   - **About:** text section + team (ollie/team-members)
   - **Menu:** Tove restaurant patterns (tove/restaurant-menu, tove/restaurant-opening-hours)
   - **Contact:** contact pattern (ollie/card-contact or spectra-one/contact)
   - **Blog:** post grid (ollie/post-loop-grid-default)
4. Header: Use paragraph-link navigation (NOT core/navigation):
   ```html
   <!-- wp:group {"layout":{"type":"flex","justifyContent":"space-between"}} -->
   <div class="wp-block-group">
     <!-- wp:site-title /-->
     <!-- wp:group {"layout":{"type":"flex","flexWrap":"nowrap"}} -->
     <div class="wp-block-group">
       <!-- wp:paragraph {"fontSize":"small"} -->
       <p class="has-small-font-size"><a href="/">Home</a></p>
       <!-- /wp:paragraph -->
       <!-- wp:paragraph {"fontSize":"small"} -->
       <p class="has-small-font-size"><a href="/about">About</a></p>
       <!-- /wp:paragraph -->
       <!-- wp:paragraph {"fontSize":"small"} -->
       <p class="has-small-font-size"><a href="/menu">Menu</a></p>
       <!-- /wp:paragraph -->
       <!-- wp:paragraph {"fontSize":"small"} -->
       <p class="has-small-font-size"><a href="/contact">Contact</a></p>
       <!-- /wp:paragraph -->
       <!-- wp:paragraph {"fontSize":"small"} -->
       <p class="has-small-font-size"><a href="/blog">Blog</a></p>
       <!-- /wp:paragraph -->
     </div>
     <!-- /wp:group -->
   </div>
   <!-- /wp:group -->
   ```
5. Footer: Include PressPilot credit line per proven-cores.md rules
6. Modify theme.json colors to a restaurant palette (warm reds/oranges)
7. Package as .zip
8. Take screenshots in Playground and save to `themes/gold-standard-restaurant/screenshots/`

**Files created:**
- `themes/gold-standard-restaurant/` (complete theme directory)
- `themes/gold-standard-restaurant.zip`
- `themes/gold-standard-restaurant/screenshots/` (visual proof)

**Verification:**
- [ ] `node scripts/playground/validate-theme.js themes/gold-standard-restaurant/` returns `{"valid": true}`
- [ ] Open in Playground: ALL 5 pages render correctly in Site Editor
- [ ] ZERO Attempt Recovery errors or block validation warnings
- [ ] Navigation uses paragraph links (NOT core/navigation)
- [ ] Footer has PressPilot credit
- [ ] Screenshots saved showing all pages

---

## PHASE 0 CHECKPOINT

**Before moving to Phase 1, Omar must verify:**

1. ✅ Playground validation script works (tested on 4+ themes)
2. ✅ HEALTH_MATRIX.md is complete for all 6 cores
3. ✅ Gold standard theme opens cleanly in Playground with ZERO errors
4. ✅ All files committed to `feat/phase-0-foundation` branch
5. ✅ PR opened and CodeRabbit review passes

**CodeRabbit checks:**
- No hardcoded paths (all paths relative to project root)
- Scripts are cross-platform compatible
- package.json is clean (no extraneous dependencies)
- No committed node_modules

**After Omar approves → Merge PR → Begin [PHASE-1.md](PHASE-1.md)**
