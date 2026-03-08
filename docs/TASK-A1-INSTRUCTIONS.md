# Task A1: Verify Session D Fixes - Instructions

**Goal:** Confirm all 5 UX fixes from commit `ec67554` work in production.

**Estimated Time:** 15-20 minutes

---

## Prerequisites

✅ Backend redeployed via Coolify
✅ OPENAI_API_KEY added to both laravel-app and laravel-horizon
✅ Migration run (`php artisan migrate`)
✅ Site loads at presspilotapp.com

---

## Step 1: Generate Test Theme

1. **Go to Studio:** Visit https://presspilotapp.com/studio

2. **Fill out the form:**
   - **Business Name:** `Luigi's Pizza`
   - **Category:** Restaurant
   - **Description:**
     ```
     Family-owned pizzeria serving authentic Neapolitan-style pizza made with
     fresh, locally-sourced ingredients. Traditional wood-fired oven. Dine-in,
     takeout, and delivery available.
     ```
   - **Upload Logo:** Use any restaurant logo image (PNG/JPG). If you don't have one, download a sample from:
     - https://via.placeholder.com/400x400/C8102E/FFFFFF?text=LP (red square with "LP")
     - Or search "pizza logo png" on Unsplash

3. **Complete all Studio steps:**
   - Step 1: Enter business info (above)
   - Step 2: Choose hero layout (select **Full Bleed**)
   - Step 3: Select colors & fonts (keep defaults or use Brand Kit from logo)
   - Step 4: Review and Generate

4. **Wait for generation to complete** (30-60 seconds)

5. **Download the ZIP file** when prompted

---

## Step 2: Verify Session D Fixes (Automated)

Run the automated verification script on the downloaded ZIP:

```bash
cd /Users/soluwrx/Downloads/PressPilot-OS/PressPilot-OS

# Run verification script
node scripts/verify-session-d-fixes.js ~/Downloads/luigi-pizza.zip
```

**Expected Output:**

```
============================================================
Session D Fixes Verification
============================================================

Fix #1: Transparent Header
────────────────────────────────────────────────────────
✓ header-transparent.html exists
✓ site-title has textColor: base
✓ navigation has textColor: base
✓ front-page.html references header-transparent slug

Fix #2: Logo Size & Spacing
────────────────────────────────────────────────────────
✓ header.html: Logo width is 60px
✓ header-transparent.html: Logo width is 60px
✓ footer.html: Logo width is 60px
✓ header.html: Has blockGap spacing
✓ footer.html: Has blockGap spacing

Fix #3: Footer Composition
────────────────────────────────────────────────────────
✓ Footer has horizontal flex layout (logo + name side-by-side)
✓ Footer has verticalAlignment: center
✓ Footer has tight blockGap (0.25rem) for tagline

Fix #4: Inner Page Content Enrichment
────────────────────────────────────────────────────────
✓ page-about.html: Has 4 sections (≥3 required)
✓ page-services.html: Has 5 sections (≥3 required)
✓ page-contact.html: Has 3 sections (≥3 required)

Fix #5: Person Images (Not Food)
────────────────────────────────────────────────────────
✓ Found 3 person/portrait images
✓ Found 1 chef portrait images

============================================================
Verification Summary
============================================================

✓ All Session D fixes verified! ✨
```

**If you see warnings or errors:**
- Note which fix(es) failed
- Take screenshots if needed
- We'll debug before continuing to Task A2

---

## Step 3: Test in WordPress (Manual Verification)

### Option A: Local WordPress (Recommended)

If you have Local by Flywheel or similar:

1. **Install the theme:**
   ```bash
   # Copy ZIP to Local site's themes directory
   cp ~/Downloads/luigi-pizza.zip ~/Local\ Sites/test-site/app/public/wp-content/themes/

   # Or use WordPress admin:
   # Appearance → Themes → Add New → Upload Theme
   ```

2. **Activate the theme**

3. **Open Site Editor:**
   - Go to **Appearance → Editor**
   - Check for "Attempt Recovery" errors (should be NONE)

4. **Check templates:**
   - Click "Templates" in sidebar
   - Open each template (Front Page, Page, About, Services, Contact)
   - Verify no block errors

5. **View front-end:**
   - Visit the site in browser
   - Check header is transparent on homepage
   - Check footer has logo + name side-by-side
   - Check inner pages (About, Services, Contact) have content sections

### Option B: WordPress Playground (Quick Test)

1. **Go to:** https://playground.wordpress.net/

2. **Upload theme via drag-and-drop or blueprint**

3. **Activate and test** (same as above)

---

## Step 4: Document Results

Create a brief report:

```
✅ Theme generated successfully
✅ Automated verification: PASSED
✅ WordPress Site Editor: No "Attempt Recovery" errors
✅ All 5 fixes confirmed working
```

Or if issues found:

```
❌ Fix #X failed: [description]
Screenshot: [attach]
```

---

## Expected Fixes (Reference)

| Fix | What to Look For |
|-----|------------------|
| #1 | `parts/header-transparent.html` exists with white text |
| #2 | Logo is 60px wide in header/footer with spacing |
| #3 | Footer has logo + name side-by-side, tagline below |
| #4 | About/Services/Contact pages each have 3+ content sections |
| #5 | Team/chef images show people, not food |

---

## Troubleshooting

**Theme generation fails:**
- Check Laravel logs: `docker logs presspilot-laravel-horizon`
- Check Horizon dashboard: https://presspilotapp.com:8080/horizon (via SSH tunnel)
- Verify OPENAI_API_KEY is set correctly

**"Attempt Recovery" in Site Editor:**
- Note which template/part has the error
- Screenshot the error message
- Check the block markup in that file

**Images not showing:**
- Expected - Unsplash URLs may be blocked in some environments
- Focus on verifying the URL structure (portrait/person vs food/restaurant)

---

## Next Steps After A1

Once Task A1 is verified:
- ✅ **Task A2:** Multi-vertical smoke test (5 themes)
- ✅ **Task A3:** Disable debug mode (`APP_DEBUG=false`)

---

## Questions?

If you encounter issues:
1. Note the exact error message
2. Screenshot if visual issue
3. Check the verification script output
4. We can debug together before moving to A2
