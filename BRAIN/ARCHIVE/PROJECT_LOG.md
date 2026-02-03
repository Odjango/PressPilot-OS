# DEPRECATED – Raw Development Log

> This file contains detailed, raw development history. For the canonical, summarized phase history, see:
> - [BRAIN/MEMORY/phase-history.md](../MEMORY/phase-history.md)
>
> This file is kept for historical reference and detailed technical context only.
>
> _Archived: 2026-02-02_

---

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

## Phase 6-8: See phase-history.md

For Phases 6-8 and beyond, see the canonical summary at [BRAIN/MEMORY/phase-history.md](../MEMORY/phase-history.md).

---

*Last Updated: January 24, 2026 (Original)*
*Archived: February 2, 2026*
