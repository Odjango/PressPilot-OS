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

## Next Milestones

### M2: Quality & Polish
- Fix hero selector targeting in Playwright preview runner
- Verify no conflicting static testimonial patterns are shipped for recipe-rendered restaurant/cafe outputs
- Guard against sanitizer/escaper double-encoding regressions in content pipeline

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
