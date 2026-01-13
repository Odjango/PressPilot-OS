# PressPilot Factory - Project Log

> Development history, issues, fixes, and decisions documented chronologically.

---

## Project Overview

**Goal:** Transform PressPilot into a high-standard, AI-orchestrated website factory with:
- 12 distinct visual layout styles
- 10 business category configurations
- Contextual placeholder images
- WCAG AA-compliant color contrast
- Pixel-perfect static site export

**Server:** https://factory.presspilotapp.com (134.209.167.43)

---

## Phase 1: Static Export Fix

**Date:** January 12, 2026
**Status:** Completed

### Problem
Static site export had font mismatch - live preview used Mona Sans from Ollie theme, but static export showed fallback fonts.

### Investigation
- Explored Simply Static plugin integration
- Discovered Simply Static takes ~39 minutes for full site export (5300+ pages)
- Determined Simply Static is impractical for API that needs seconds response time

### Solution
Enhanced custom static exporter to include fonts:

1. Added `copy_fonts()` method to copy Mona Sans from Ollie theme
2. Added `@font-face` CSS declaration in generated stylesheets
3. Font files copied to `/assets/fonts/` in static export

### Files Modified
- `factory-plugin/includes/class-static-exporter.php`
  - Added `copy_fonts()` method
  - Added font CSS generation in `generate_css()`

### Test Result
- Generated static site with restaurant category
- Downloaded ZIP, opened locally
- Fonts now match live preview exactly

---

## Phase 2: 10+ Layout System

**Date:** January 12, 2026
**Status:** Completed

### Goal
Expand from 4 layouts to 12 distinct visual styles for maximum variety.

### Layouts Created

| Layout | Hero Pattern | CTA Pattern | Style Description |
|--------|-------------|-------------|-------------------|
| modern | hero-centered | cta | Bold colors, centered, clean grid |
| classic | hero-split | cta-banner | Split layout, professional |
| minimal | hero-minimal | cta | Dark hero, large typography |
| elegant | hero | cta-banner | Balanced, refined styling |
| bold | hero-bold | cta-gradient | Large text, vibrant, rounded CTAs |
| corporate | hero-corporate | cta-simple | Trust badges, split with image |
| creative | hero-creative | cta-dark | Dark background, asymmetric |
| startup | hero-gradient | cta-gradient | Gradient backgrounds, SaaS style |
| agency | hero-agency | cta-dark | Portfolio style, large typography |
| local | hero-local | cta-simple | Contact-first, location emphasis |
| ecommerce | hero-product | cta-banner | Product-focused, trust badges |
| restaurant | hero-food | cta-banner | Food imagery, reservation focus |

### Files Created
**Hero Patterns (8 new):**
- `patterns/hero-bold.html` - Accent background, huge typography
- `patterns/hero-gradient.html` - Gradient from primary to accent
- `patterns/hero-corporate.html` - Split layout with trust badges
- `patterns/hero-creative.html` - Dark asymmetric layout
- `patterns/hero-local.html` - Contact card prominent
- `patterns/hero-product.html` - E-commerce with ratings
- `patterns/hero-food.html` - Image overlay with gradient
- `patterns/hero-agency.html` - Portfolio style

**CTA Patterns (3 new):**
- `patterns/cta-simple.html` - Horizontal split, minimal
- `patterns/cta-gradient.html` - Gradient background
- `patterns/cta-dark.html` - Dark background with arrow

**Configuration:**
- `layouts/presets.json` - All 12 layout definitions
- `includes/class-layout-manager.php` - Layout management class

### Test Results
- Tested startup layout: Gradient hero rendered correctly
- Tested agency layout: Dark creative style applied
- Tested restaurant layout: Food hero with image overlay working

---

## Phase 3: Placeholder Image System

**Date:** January 12, 2026
**Status:** Completed

### Goal
Generate 5-6 contextual images per website based on business category.

### Implementation

**Image Sources:**
- Hero/About/Feature images: Unsplash Source API (free, no auth)
- Testimonial avatars: pravatar.cc (realistic faces)

**Category-Specific Queries:**

| Category | Hero Keywords | About Keywords |
|----------|---------------|----------------|
| restaurant | restaurant,food,dining,cuisine | chef,kitchen,cooking |
| corporate | office,business,modern-workplace | team,meeting,collaboration |
| ecommerce | shopping,products,retail,store | warehouse,packaging,delivery |
| agency | creative,design,studio,workspace | creative-team,designers |
| startup | technology,startup,innovation | startup-team,coding,developers |
| local | storefront,small-business | owner,entrepreneur |

### Files Created
- `includes/class-image-provider.php`
  - `get_hero_image($category)` - 1920x1080 contextual hero
  - `get_about_image($category)` - 800x600 about section
  - `get_feature_image($category, $index)` - 600x400 features
  - `get_avatar($index)` - 150x150 testimonial avatars
  - `get_all_images($category)` - All images for a site

### Files Modified
- `includes/class-pattern-loader.php`
  - Constructor accepts image_provider
  - Added `get_contextual_images()` method
  - Added `prepare_testimonials_with_avatars()` method
- `presspilot-factory.php`
  - Instantiates image_provider
  - Passes to pattern_loader

### Test Results
- Restaurant: Food/dining hero images loading
- Startup: Tech/office imagery appearing
- Avatars: Realistic faces in testimonials section

---

## Phase 4: Category-Specific Logic

**Date:** January 12, 2026
**Status:** Completed

### Goal
Smart page generation based on business category - restaurants get Menu page, startups get Pricing page, etc.

### Categories Defined

| Category | Pages | Recommended Layout |
|----------|-------|-------------------|
| restaurant | home, menu, about, contact | restaurant |
| corporate | home, services, about, contact | corporate |
| ecommerce | home, shop, about, contact | ecommerce |
| agency | home, work, about, contact | agency |
| startup | home, features, pricing, about, contact | startup |
| local | home, services, about, contact | local |
| healthcare | home, services, about, contact | corporate |
| realestate | home, listings, about, contact | classic |
| fitness | home, classes, about, contact | bold |
| education | home, courses, about, contact | modern |

### Files Created
- `includes/class-category-config.php`
  - `get_pages($category)` - Returns page definitions
  - `get_nav_order($category)` - Returns navigation order
  - `get_features($category)` - Returns category features
  - `get_recommended_layout($category)` - Returns default layout

### Files Modified
- `includes/class-api-handler.php`
  - Updated category enum: 10 categories
  - Updated layout enum: 12 layouts
  - `handle_generate()` - Auto-selects layout from category if not specified
  - `create_pages_for_category()` - Uses category config instead of hardcoded pages

### Test Results

| Test | Category | Pages Created | Result |
|------|----------|---------------|--------|
| 1 | healthcare | 4 (home, services, about, contact) | Pass |
| 2 | fitness | 4 (home, classes, about, contact) | Pass |
| 3 | startup | 5 (home, features, pricing, about, contact) | Pass |

---

## Phase 5: Color Contrast System

**Date:** January 12, 2026
**Status:** Completed

### Goal
Ensure WCAG AA compliance by auto-calculating readable text colors based on backgrounds.

### Problem
Patterns had hardcoded white text (`#ffffff`) which became unreadable on light backgrounds like yellow (`#FDE047`) or light green (`#A3E635`).

### Solution
Created color utility class using WCAG luminance calculations:

**Algorithm:**
1. Convert hex to RGB
2. Apply gamma correction per WCAG 2.1 spec
3. Calculate relative luminance: `L = 0.2126*R + 0.7152*G + 0.0722*B`
4. If luminance > 0.179, use dark text (#1f2937), else white (#ffffff)

### Files Created
- `includes/class-color-utils.php`
  - `get_contrast_color($background)` - Returns readable text color
  - `get_relative_luminance($hex)` - WCAG luminance calculation
  - `get_contrast_ratio($color1, $color2)` - WCAG contrast ratio
  - `meets_wcag_aa($fg, $bg)` - Check AA compliance
  - `lighten($hex, $percent)` - Lighten color
  - `darken($hex, $percent)` - Darken color

### New Template Variables
| Variable | Description |
|----------|-------------|
| `{{color_primary_text}}` | Readable text for primary backgrounds |
| `{{color_secondary_text}}` | Readable text for secondary backgrounds |
| `{{color_accent_text}}` | Readable text for accent backgrounds |
| `{{color_primary_light}}` | Primary lightened 20% |
| `{{color_primary_dark}}` | Primary darkened 20% |

### Files Modified
- `includes/class-pattern-loader.php`
  - Added contrast color generation in `prepare_render_data()`
  - Added new color keys to `$raw_keys` array

**Patterns Updated:**
- `patterns/hero-bold.html` - Uses `{{color_accent_text}}`
- `patterns/hero-centered.html` - Uses `{{color_primary_text}}`
- `patterns/hero-corporate.html` - Uses `{{color_primary_text}}`
- `patterns/hero-food.html` - Uses `{{color_accent_text}}`
- `patterns/cta.html` - Uses `{{color_primary_text}}`
- `patterns/cta-simple.html` - Uses `{{color_primary_text}}`

### Test Results

**Test Case:** Light yellow primary (`#FDE047`), golden accent (`#FBBF24`)

| Before | After |
|--------|-------|
| `background:#FBBF24;color:#ffffff` (unreadable) | `background:#FBBF24;color:#1f2937` (readable) |

Verified dark text now appears on light backgrounds automatically.

---

## Hotfix: n8n Compatibility

**Date:** January 12, 2026
**Status:** Completed

### Problem
After Phase 4, the `layout` parameter had:
- Default value: `''` (empty string)
- Enum validation: Did NOT include empty string

This would cause WordPress REST API to reject requests where n8n doesn't send a layout parameter.

### Impact
- n8n workflows not sending `layout` would get 400 error
- API would reject valid requests

### Solution
Added empty string to the layout enum:

```php
'enum' => [ '', 'modern', 'classic', ... ]
```

This allows:
1. n8n to omit layout parameter (uses category's recommended layout)
2. n8n to explicitly set layout (uses specified layout)
3. Backward compatibility with existing workflows

### Files Modified
- `includes/class-api-handler.php` - Added `''` to layout enum

### Test Result
```bash
# Request without layout parameter
curl -X POST .../generate -d '{"businessName":"Test","category":"corporate"}'
# Response: success: true, pages_created: 4
```

---

## Server Cleanup

**Date:** January 12, 2026
**Status:** Completed

### Problem
Coolify dashboard showed 504 Gateway Timeout during deployment. Investigation revealed:
- Memory pressure (2.8GB/3.8GB used, swap at 1.5GB)
- Accumulated static exports (~40 files, 884MB)
- Accumulated theme exports (~41 files, 79MB)
- Docker unused resources

### Actions Taken

**1. Old Export Cleanup:**
| Resource | Before | After |
|----------|--------|-------|
| Static exports | 40 files (884MB) | 3 files (544KB) |
| Theme exports | 41 files (79MB) | 3 files (6MB) |

**2. Docker Cleanup:**
```bash
docker system prune -af --volumes
docker builder prune -af
```
Freed: 107MB of unused Docker resources

**3. Total Space Recovered:**
| Metric | Before | After |
|--------|--------|-------|
| Disk Used | 22GB (46%) | 21GB (43%) |
| Space Freed | - | ~1GB |

### Deployment Result
- Build completed successfully despite 504 UI timeout
- New container running: `hkws0oc4okw0ww408ksw4wwg:4325238...`
- All services healthy

### Post-Cleanup Verification
```bash
# API Test - Corporate
curl -X POST .../generate -d '{"category":"corporate"}'
# Result: success, 4 pages, 2.53s

# API Test - Fitness (new category)
curl -X POST .../generate -d '{"category":"fitness"}'
# Result: success, 4 pages, 1.97s
```

### Recommendation
Add periodic cleanup job for old exports (keep last 3-5 files):
```bash
# Add to cron or Coolify scheduled task
cd /path/to/presspilot-factory/static && ls -t | tail -n +4 | xargs rm -rf
cd /path/to/presspilot-factory/themes && ls -t | tail -n +4 | xargs rm -f
```

---

## Commit History

| Commit | Date | Description |
|--------|------|-------------|
| `4325238` | 2026-01-12 | feat: Add 12 layouts, 10 categories, contextual images, and WCAG color contrast |
| `d9369f0` | 2026-01-12 | fix: Rewrite static exporter to build HTML directly |
| `4b7583f` | 2026-01-12 | fix: Add default content for Features, Testimonials, Values sections |
| `fd61c32` | 2026-01-12 | fix: Use explicit inline colors in patterns |
| `7b3e0f4` | 2026-01-12 | fix: Optimize static site exporter and improve URL handling |

---

## Known Issues / Future Improvements

### Not Yet Addressed
1. **Gradient text contrast** - Gradients use hardcoded white; could analyze both endpoints
2. **Some hero patterns still have hardcoded colors** - hero-gradient, hero-creative use white for dark overlays (acceptable)
3. **Image caching** - Unsplash URLs change on each request; could implement caching

### Potential Enhancements
1. Add more layout patterns (pricing tables, team grids, FAQ sections)
2. Implement custom font selection beyond Mona Sans
3. Add animation/transition options per layout
4. Create A/B testing for layout variations

---

## Deployment Notes

### Deploy Command
```bash
scp -r factory-plugin/* root@134.209.167.43:/var/lib/docker/volumes/bb6b60fe00c76ab4ab0aaca0e12ded2c0814fad9aeb2295d57050c747d7068c2/_data/wp-content/plugins/factory-plugin/
```

### Test Command
```bash
curl -X POST https://factory.presspilotapp.com/wp-json/presspilot/v1/generate \
  -H "Content-Type: application/json" \
  -H "X-PressPilot-Key: pp_factory_2026_109540718b67c8f1acb967948eecf2e1" \
  -d '{"businessName":"Test","category":"startup","colors":{"primary":"#6366F1"}}'
```

---

*Last Updated: January 13, 2026*
