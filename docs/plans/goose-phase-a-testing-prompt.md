# Goose Agent — PressPilot Phase A Smoke Test

> **Goal:** Generate themes for all 5 business verticals on production (presspilotapp.com), screenshot all results, and document pass/fail for each verification checkpoint.
>
> **Production URL:** https://presspilotapp.com
> **Studio URL:** https://presspilotapp.com/studio
> **API Base:** https://presspilotapp.com/api

---

## INSTRUCTIONS

You are testing the PressPilot theme generator. For each test case below:

1. Navigate to **https://presspilotapp.com/studio**
2. Fill out the form with the provided business data
3. Click **Generate** and wait for the theme to finish (takes 15-30 seconds)
4. When the result page appears, **take a screenshot** and save it
5. If a **Download ZIP** link appears, note the URL
6. Check every verification item and record PASS or FAIL
7. Save all screenshots in a folder called `phase-a-test-results/`

**Screenshot naming:** `{number}-{vertical}-{checkpoint}.png`
Example: `01-restaurant-result-page.png`, `02-restaurant-download-check.png`

---

## TEST CASE 1: Luigi's Pizza (Restaurant) — PRIMARY VERIFICATION

This is the most important test. It verifies all Session D UX fixes.

**Form Data:**
- Business Name: `Luigi's Pizza`
- Tagline: `Authentic Italian Pizza Since 1987`
- Description: `Family-owned pizzeria in downtown serving authentic Neapolitan-style pizza with fresh imported ingredients. Known for our wood-fired oven, handmade pasta, and warm Italian hospitality. We offer dine-in, takeout, and catering for events.`
- Category: `Restaurant`
- Hero Layout: `Full Bleed`
- Colors: Primary `#C8102E` (red), Secondary `#FFD700` (gold)
- Font Profile: `Modern`
- Logo: (skip if no upload option, or use any pizza-related image)

**Verification Checkpoints (Session D fixes):**

| # | Check | What to Look For | PASS/FAIL |
|---|-------|-------------------|-----------|
| 1.1 | Theme generates successfully | Result page shows download link, no error | |
| 1.2 | Transparent header on homepage | Header text should be WHITE over the hero image (not dark text on dark image) | |
| 1.3 | Footer composition | Logo + business name side-by-side horizontally, tagline stacked below | |
| 1.4 | Person images | If testimonials section exists, images should be people/portraits, NOT food/restaurant images | |
| 1.5 | Inner pages exist | Should have About, Menu, Contact pages (not just homepage) | |
| 1.6 | No "Attempt Recovery" | If you can preview the theme in WordPress, no yellow "Attempt Recovery" banner in Site Editor | |
| 1.7 | No truncated words | All text should be complete words — no cut-off text like "smok" or "thre" | |
| 1.8 | PressPilot credit in footer | Footer should contain "Powered by PressPilot" link | |
| 1.9 | Brand colors applied | Red (#C8102E) and gold (#FFD700) should be visible in buttons, accents, etc. | |
| 1.10 | Navigation menu | Header should have working nav links (Home, About, Menu, Contact) | |

**Screenshots to take:**
- `01-restaurant-form-filled.png` — The filled form before clicking Generate
- `02-restaurant-generating.png` — The loading/generating state
- `03-restaurant-result-page.png` — The final result page
- `04-restaurant-homepage-hero.png` — Close-up of the hero section (check transparent header)
- `05-restaurant-footer.png` — Close-up of the footer (check composition + credit)
- `06-restaurant-inner-pages.png` — Any inner page visible (About or Menu)

---

## TEST CASE 2: TechFlow SaaS (SaaS)

**Form Data:**
- Business Name: `TechFlow`
- Tagline: `Automate Your Workflow`
- Description: `TechFlow is a project management SaaS platform that helps teams streamline their workflows with AI-powered automation, real-time collaboration tools, and customizable dashboards. Trusted by over 500 teams worldwide to save 10+ hours per week.`
- Category: `SaaS`
- Hero Layout: `Split`
- Colors: Primary `#2563EB` (blue), Secondary `#10B981` (green)
- Font Profile: `Modern`

**Verification Checkpoints:**

| # | Check | What to Look For | PASS/FAIL |
|---|-------|-------------------|-----------|
| 2.1 | Theme generates successfully | Result page shows download link | |
| 2.2 | SaaS-appropriate content | Sections about features, pricing, or CTA — not restaurant menu | |
| 2.3 | Split hero layout | Two-column layout in hero section | |
| 2.4 | Brand colors applied | Blue (#2563EB) visible in UI elements | |
| 2.5 | Inner pages | Should have relevant pages (About, Services/Features, Contact) | |
| 2.6 | No truncated words | All text complete, no mid-word cuts | |

**Screenshots:**
- `07-saas-result-page.png`
- `08-saas-homepage.png`

---

## TEST CASE 3: Sarah Chen Photography (Portfolio)

**Form Data:**
- Business Name: `Sarah Chen Photography`
- Tagline: `Capturing Life's Beautiful Moments`
- Description: `Award-winning portrait and wedding photographer based in Austin, Texas. Specializing in natural light photography, editorial shoots, and documentary-style wedding coverage. Over 200 weddings photographed with a fine art approach that tells your unique story.`
- Category: `Portfolio`
- Hero Layout: `Full Width`
- Colors: Primary `#1A1A1A` (near black), Secondary `#D4AF37` (gold)
- Font Profile: `Elegant`

**Verification Checkpoints:**

| # | Check | What to Look For | PASS/FAIL |
|---|-------|-------------------|-----------|
| 3.1 | Theme generates successfully | Result page shows download link | |
| 3.2 | Portfolio-appropriate content | Gallery/work section, about section | |
| 3.3 | Elegant typography | Fonts should feel refined, not blocky | |
| 3.4 | Brand colors applied | Dark + gold palette visible | |
| 3.5 | No truncated words | All text complete | |

**Screenshots:**
- `09-portfolio-result-page.png`
- `10-portfolio-homepage.png`

---

## TEST CASE 4: UrbanThreads (Ecommerce)

**Form Data:**
- Business Name: `UrbanThreads`
- Tagline: `Streetwear That Speaks`
- Description: `Online streetwear brand offering limited-edition graphic tees, hoodies, and accessories designed by independent artists. Every piece is ethically produced with sustainable materials. Free shipping on orders over $75. New drops every Friday.`
- Category: `Ecommerce`
- Hero Layout: `Full Bleed`
- Colors: Primary `#000000` (black), Secondary `#FF6B35` (orange)
- Font Profile: `Bold`

**Verification Checkpoints:**

| # | Check | What to Look For | PASS/FAIL |
|---|-------|-------------------|-----------|
| 4.1 | Theme generates successfully | Result page shows download link | |
| 4.2 | Ecommerce-appropriate content | Product sections, shop CTA, categories | |
| 4.3 | Full bleed hero | Full-width hero image with overlay | |
| 4.4 | Brand colors applied | Black + orange palette visible | |
| 4.5 | No truncated words | All text complete | |

**Screenshots:**
- `11-ecommerce-result-page.png`
- `12-ecommerce-homepage.png`

---

## TEST CASE 5: BrightSmile Dental (Local Service)

**Form Data:**
- Business Name: `BrightSmile Dental`
- Tagline: `Your Family's Smile, Our Priority`
- Description: `Friendly family dental practice offering comprehensive dental care including cleanings, cosmetic dentistry, orthodontics, and emergency services. Dr. Patel and team have been serving the Riverside community for over 15 years. New patients welcome, most insurance accepted.`
- Category: `Local Service`
- Hero Layout: `Minimal`
- Colors: Primary `#0891B2` (teal), Secondary `#F0F9FF` (light blue)
- Font Profile: `Friendly`

**Verification Checkpoints:**

| # | Check | What to Look For | PASS/FAIL |
|---|-------|-------------------|-----------|
| 5.1 | Theme generates successfully | Result page shows download link | |
| 5.2 | Local service content | Services list, contact info, about section | |
| 5.3 | Minimal hero layout | Clean, text-focused header | |
| 5.4 | Brand colors applied | Teal (#0891B2) visible | |
| 5.5 | No truncated words | All text complete | |

**Screenshots:**
- `13-local-service-result-page.png`
- `14-local-service-homepage.png`

---

## API FALLBACK (If UI doesn't work)

If the Studio UI is not accessible, use these curl commands instead. Run them from a terminal:

```bash
# Test 1: Restaurant
curl -s -X POST https://presspilotapp.com/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Luigi'\''s Pizza",
    "tagline": "Authentic Italian Pizza Since 1987",
    "description": "Family-owned pizzeria in downtown serving authentic Neapolitan-style pizza with fresh imported ingredients. Known for our wood-fired oven, handmade pasta, and warm Italian hospitality.",
    "category": "restaurant",
    "heroLayout": "fullBleed",
    "colorPrimary": "#C8102E",
    "colorSecondary": "#FFD700",
    "fontProfile": "modern"
  }' | jq .

# Then poll status (replace JOB_ID with actual job ID from response):
# curl -s "https://presspilotapp.com/api/status?id=JOB_ID" | jq .

# Test 2: SaaS
curl -s -X POST https://presspilotapp.com/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "name": "TechFlow",
    "tagline": "Automate Your Workflow",
    "description": "TechFlow is a project management SaaS platform that helps teams streamline their workflows with AI-powered automation, real-time collaboration tools, and customizable dashboards.",
    "category": "saas",
    "heroLayout": "split",
    "colorPrimary": "#2563EB",
    "colorSecondary": "#10B981",
    "fontProfile": "modern"
  }' | jq .

# Test 3: Portfolio
curl -s -X POST https://presspilotapp.com/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Sarah Chen Photography",
    "tagline": "Capturing Life'\''s Beautiful Moments",
    "description": "Award-winning portrait and wedding photographer based in Austin, Texas. Specializing in natural light photography, editorial shoots, and documentary-style wedding coverage.",
    "category": "portfolio",
    "heroLayout": "fullWidth",
    "colorPrimary": "#1A1A1A",
    "colorSecondary": "#D4AF37",
    "fontProfile": "elegant"
  }' | jq .

# Test 4: Ecommerce
curl -s -X POST https://presspilotapp.com/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "name": "UrbanThreads",
    "tagline": "Streetwear That Speaks",
    "description": "Online streetwear brand offering limited-edition graphic tees, hoodies, and accessories designed by independent artists. Every piece is ethically produced with sustainable materials.",
    "category": "ecommerce",
    "heroLayout": "fullBleed",
    "colorPrimary": "#000000",
    "colorSecondary": "#FF6B35",
    "fontProfile": "bold"
  }' | jq .

# Test 5: Local Service
curl -s -X POST https://presspilotapp.com/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "name": "BrightSmile Dental",
    "tagline": "Your Family'\''s Smile, Our Priority",
    "description": "Friendly family dental practice offering comprehensive dental care including cleanings, cosmetic dentistry, orthodontics, and emergency services. Dr. Patel and team have been serving the Riverside community for over 15 years.",
    "category": "local_service",
    "heroLayout": "minimal",
    "colorPrimary": "#0891B2",
    "colorSecondary": "#F0F9FF",
    "fontProfile": "friendly"
  }' | jq .
```

For each API test:
1. Record the `jobId` from the generate response
2. Poll `/api/status?id={jobId}` every 5 seconds until status is `completed` or `failed`
3. If completed, record the `themeUrl` and `staticUrl`
4. Download the ZIP and inspect the contents

---

## RESULTS SUMMARY TEMPLATE

After all tests, fill in this summary and save it as `phase-a-test-results/RESULTS.md`:

```markdown
# Phase A Test Results — PressPilot

**Date:** [DATE]
**Tester:** Goose Agent
**Production URL:** https://presspilotapp.com

## Summary

| # | Vertical | Business | Status | Time | Notes |
|---|----------|----------|--------|------|-------|
| 1 | Restaurant | Luigi's Pizza | ✅/❌ | __s | |
| 2 | SaaS | TechFlow | ✅/❌ | __s | |
| 3 | Portfolio | Sarah Chen Photography | ✅/❌ | __s | |
| 4 | Ecommerce | UrbanThreads | ✅/❌ | __s | |
| 5 | Local Service | BrightSmile Dental | ✅/❌ | __s | |

## Session D Fix Verification (Test 1 only)

| Fix | Status | Notes |
|-----|--------|-------|
| Transparent header | ✅/❌ | |
| Footer composition | ✅/❌ | |
| Person images | ✅/❌ | |
| Inner pages | ✅/❌ | |
| No Attempt Recovery | ✅/❌ | |
| No truncated words | ✅/❌ | |
| PressPilot credit | ✅/❌ | |
| Brand colors | ✅/❌ | |
| Navigation menu | ✅/❌ | |

## Issues Found

[List any issues here with screenshots referenced]

## Screenshots

[List all screenshots taken with file names]
```

---

## AFTER TESTING

Once all tests complete:
1. Save all screenshots to `phase-a-test-results/`
2. Fill in `phase-a-test-results/RESULTS.md`
3. If ALL 5 verticals generate successfully with no critical issues, Phase A is PASS
4. If any critical issue is found, document it clearly with the screenshot filename

**Critical issues** = generation fails, blank page, Attempt Recovery errors, completely wrong content (e.g., restaurant content on SaaS theme)

**Non-critical issues** = minor styling differences, image quality, spacing tweaks — note these but don't block Phase A
