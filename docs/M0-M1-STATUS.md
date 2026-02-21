# M0/M1 Milestone Status

## M0: Laravel Backend Migration ✅ COMPLETE

### Completed
- [x] Laravel app with Horizon queue
- [x] GenerateThemeJob dispatching
- [x] TypeScript generator integration
- [x] Supabase storage uploads (themes/, previews/)
- [x] Redis queue processing
- [x] Health check endpoint (/api/internal/health)
- [x] Docker Compose deployment on Coolify

## M1: Production Deployment ✅ COMPLETE

### Completed
- [x] Frontend deployed to Coolify
- [x] Backend stack deployed (app, horizon, redis)
- [x] WordPress Factory connected
- [x] End-to-end theme generation working
- [x] Theme download functional
- [x] Multi-page themes (Home, About, Services, Contact, Menu)
- [x] Hero preview screenshots generated for 4 layouts
- [x] Preview images display in UI via `/api/previews/` runtime route

### Remaining Polish
- [ ] Hero preview capture accuracy (P1: wrong section selected in screenshot)
- [x] Site Editor "Attempt Recovery" on testimonial blocks (P2)
- [x] HTML apostrophe encoding (`&#39;`) in generated content (P3)
- [x] Testimonial avatar image sizing duplication removed (P2 follow-up)
- [x] Bypass checkout generation now applies selected hero layout (P4)

## Next Milestones

### M2: Quality & Polish
- Fix hero selector targeting in Playwright preview runner
- Verify no conflicting static testimonial patterns are shipped for recipe-rendered restaurant/cafe outputs
- Guard against sanitizer/escaper double-encoding regressions in content pipeline
- Keep bypass `/api/generate` hero-layout mapping aligned with Studio enum changes

### M3: Design Enhancement
- Expand pattern library
- More vertical-specific recipes
- Enhanced image selection
- Better typography pairing

### M4: User Experience
- Progress indicators
- Error messaging
- Theme customization options
- Preview improvements

---

## Patch Note: 2026-02-21

- **Testimonials recovery follow-up fix**
  - File: `src/generator/patterns/sections/social-proof.ts`
  - Change: Removed inline `width:48px;height:48px` from testimonial avatar image style while keeping `width="48" height="48"`.
- **Bypass hero-layout fix**
  - File: `app/api/generate/route.ts`
  - Change: Added `normalizeHeroLayout()` and passed normalized layout into bypass `studioInput.heroLayout` before payload transformation.
