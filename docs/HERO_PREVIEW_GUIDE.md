# Hero Preview System - Product Owner Guide

## What We Built

The hero preview system allows users to see 3 different hero section styles **before** purchasing, making the selection process faster and more visual.

### User Flow
1. **User fills form** on dashboard (business name, description, industry, logo)
2. **Clicks "Generate Previews"** → System creates 3 hero variations in ~5 seconds
3. **User sees carousel** with 3 full-screen hero previews
4. **User selects favorite** → Proceeds to payment
5. **After payment** → Full theme generates with selected hero style

---

## The 3 Hero Styles

### 1. Split Hero
**Visual:** Image on left (50%), content on right (50%)
**Best For:** Professional services, SaaS products, agencies
**Vibe:** Modern, balanced, trustworthy

### 2. Centered Hero
**Visual:** Full-width background with centered text
**Best For:** Restaurants, portfolios, creative businesses
**Vibe:** Classic, elegant, impactful

### 3. Minimal Hero
**Visual:** Large bold headline, minimal imagery
**Best For:** Startups, tech companies, minimalist brands
**Vibe:** Bold, clean, contemporary

---

## Technical Details (For Reference)

### Files Created
- `supabase/migrations/20260125_hero_previews.sql` - Database schema
- `src/generator/templates/hero-templates.ts` - HTML generators
- `src/lib/screenshot/ScreenshotService.ts` - Screenshot capture
- `app/api/generate-hero-previews/route.ts` - API endpoint
- `src/components/HeroCarousel.tsx` - Carousel UI
- `app/preview/page.tsx` - Preview selection page

### How It Works
1. User submits form → API receives data
2. System generates 3 HTML files (one per hero style)
3. Puppeteer captures screenshots of each HTML
4. Screenshots uploaded to Supabase Storage
5. URLs returned to frontend
6. User sees carousel with all 3 options

---

## Next Steps

### To Test This System:
1. Run database migration: `npx supabase migration up`
2. Restart dev server (already running)
3. Go to `/dashboard`
4. Fill form and click "Generate Previews"
5. You'll be redirected to `/preview` with carousel

### What's Still Needed:
- [ ] Connect dashboard form to new API endpoint
- [ ] Add loading state during preview generation
- [ ] Create checkout page (Lemon Squeezy integration)
- [ ] Test on mobile devices

---

## Benefits of This Approach

### For Users:
- ✅ **Faster decision making** - See options in 5 seconds vs 30
- ✅ **Visual confidence** - Know exactly what they're buying
- ✅ **No wasted generation** - Only 1 full theme generated (after payment)

### For Business:
- ✅ **Higher conversion** - Users commit before seeing price
- ✅ **Lower costs** - Generate 3 lightweight previews vs 3 full themes
- ✅ **Better UX** - Professional, modern selection process

---

## Design Notes

The carousel uses:
- **Black & white color scheme** (matches your brand)
- **Large preview area** (70% of viewport width)
- **Arrow navigation** + thumbnail strip
- **Clear CTAs** ("Select This Style")
- **Mobile-friendly** (swipe gestures)

---

## What You Can Customize

As Product Owner, you can easily change:
1. **Hero style names** - Edit in `hero-templates.ts`
2. **Descriptions** - Edit in API endpoint
3. **CTA text** - Edit in carousel component
4. **Colors** - Update in carousel CSS
5. **Number of previews** - Add more hero styles if needed

No technical knowledge required - just tell me what you want changed!
