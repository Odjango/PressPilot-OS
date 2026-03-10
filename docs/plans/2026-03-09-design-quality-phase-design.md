# Design Quality Phase — Strategy & Design Document

> **Date:** 2026-03-09
> **Author:** Claude (WP Factory Architect) + Omar (Product Owner)
> **Status:** DRAFT — Awaiting Omar's review and approval
> **Phase:** Post-A3, next major initiative

---

## 1. Problem Statement

PressPilot's SSWG pipeline is **stable and functional** — all 5 verticals pass smoke tests, themes are crash-free, headers/footers work correctly. But the generated themes look *adequate*, not *premium*. To compete with WordPress.com, ZipWP, InstaWP, and 10Web, the visual quality gap must close.

**Current state:** 22 skeletons, functional layouts, correct block markup.
**Target state:** 50–75 rich skeletons, curated design tokens, professional-grade output indistinguishable from hand-crafted themes.

---

## 2. What We Have Today (Inventory)

### Skeleton Library (22 files)
| Category | Count | Files |
|----------|-------|-------|
| Heroes | 3 | hero-cover, hero-fullbleed, hero-split |
| About/Team | 2 | about-story, team-grid |
| Features | 2 | features-3col, features-6col |
| Products/Pricing/Menu | 3 | product-grid, pricing-3col, menu-2col |
| Testimonials | 1 | testimonials-3col |
| Content/CTA | 4 | cta-banner, page-banner, faq-accordion, gallery-grid |
| Restaurant-specific | 4 | chef-highlight, hours-location, reservation-cta, service-areas |
| Stats/Process | 2 | stats-numbers, process-steps |
| Contact | 1 | contact-info |

### Design Token System
- **146+ tokens** in token-schema.json with maxLength constraints
- **11-color palette** in base theme.json (primary, secondary, accent, background, foreground + tints)
- **7 fluid font sizes** using clamp()
- **7 fluid spacing presets** using clamp()
- Colors overridden per project from user input or AI extraction

### Key Gaps Identified
1. **Limited section variety** — only 1 testimonial layout, 1 about layout, 3 hero variants
2. **No layout variation logic** — same skeleton renders identically every time
3. **Typography feels generic** — single font family, no curated pairings per vertical
4. **Spacing inconsistencies** — hero uses spacing|70, features uses spacing|50, no unified rhythm
5. **No visual flourishes** — no gradients, overlapping elements, asymmetric columns, subtle shadows
6. **Color palette shallow** — 5 semantic colors but no tints/shades generated from them
7. **Image handling basic** — no aspect ratio enforcement, no focal point strategy

---

## 3. Competitive Landscape (Design Quality Focus)

### What Top Competitors Do Differently

| Technique | WordPress.com | ZipWP | 10Web | PressPilot (today) |
|-----------|:---:|:---:|:---:|:---:|
| Pattern library size | 100+ | 50+ | 80+ | 22 |
| Hero variants | 8-10 | 5-8 | 6-8 | 3 |
| Font pairing curation | ✅ | ✅ | ✅ | ❌ (single font) |
| 8px spacing grid | ✅ | ✅ | ✅ | Partial |
| Section layout variation | ✅ | ✅ | ✅ | ❌ |
| Color tint/shade generation | ✅ | ✅ | ✅ | ❌ |
| Industry-specific patterns | Partial | ✅ | ✅ | ✅ |
| Responsive image strategy | ✅ | ✅ | ✅ | Basic |

### The Single Biggest Gap
**Pattern richness.** Going from 22 to 50-75 high-quality skeletons is the single highest-impact change. Competitors with rich pattern libraries look professional; those with limited ones look like templates.

---

## 4. Strategy: Three Pillars of Design Quality

### Pillar 1: Skeleton Library Expansion (70% of visual impact)

**Goal:** Expand from 22 to 50-75 skeletons, with 2-3 quality variants per section type.

**New skeletons needed:**

#### Heroes (add 4-5 variants)
- `hero-centered` — centered text, no image, gradient or solid background
- `hero-video-bg` — video background cover (with fallback image)
- `hero-minimal` — large heading + subheading only, lots of whitespace
- `hero-image-grid` — hero with 2-3 tiled images alongside text
- `hero-testimonial` — hero with a featured testimonial/quote

#### About (add 3 variants)
- `about-timeline` — company history as vertical timeline
- `about-mission-values` — mission statement + 3 value cards
- `about-stats-story` — about text interspersed with stat callouts

#### Features (add 3 variants)
- `features-icon-cards` — cards with icon/emoji headers, hover-ready styling
- `features-alternating` — alternating left-right image+text rows
- `features-large-single` — one featured item with detailed description

#### Testimonials (add 3 variants)
- `testimonials-single-featured` — one large testimonial with photo, centered
- `testimonials-carousel-static` — multiple testimonials in horizontal scroll layout
- `testimonials-with-logos` — testimonial quotes with company/brand logos

#### CTA (add 2 variants)
- `cta-split` — half image, half CTA text (not just banner)
- `cta-gradient` — gradient background with floating card CTA

#### Gallery (add 2 variants)
- `gallery-masonry` — varied-height grid layout
- `gallery-featured` — one large image + 4 small grid

#### Content sections (add 3-5)
- `newsletter-signup` — email capture section (currently referenced but missing!)
- `blog-preview` — latest 3 posts grid
- `partners-logos` — logo strip/grid of partner brands
- `before-after` — comparison layout (great for portfolio, services)
- `video-embed` — centered video section with description

#### Vertical-specific additions
- **Restaurant:** `specials-highlight`, `instagram-feed-placeholder`
- **E-commerce:** `featured-product-spotlight`, `categories-grid`
- **SaaS:** `integration-logos`, `comparison-table`
- **Portfolio:** `case-study-preview`, `skills-list`
- **Local Service:** `service-pricing-table`, `coverage-map-placeholder`

**How to build them:** Study 3-5 reference themes per vertical (WordPress.com showcase, ThemeForest top sellers, Flavor theme demos). Reverse-engineer the design patterns. Rebuild as FSE block markup with proper token slots.

### Pillar 2: Design Token Refinement (20% of visual impact)

**Goal:** Curated, vertical-aware design defaults that feel intentional, not random.

#### A. Font Pairing System
Replace the single-font approach with curated pairs:

| Vertical | Heading Font | Body Font | Personality |
|----------|-------------|-----------|-------------|
| Restaurant | Playfair Display | Source Sans 3 | Warm, inviting |
| E-commerce | Inter | Inter | Clean, modern |
| SaaS | Plus Jakarta Sans | Inter | Tech-forward |
| Portfolio | Space Grotesk | DM Sans | Creative, bold |
| Local Service | Nunito | Open Sans | Friendly, trustworthy |

The AI Planner or a new `FontPairing` service can select the pair based on vertical + optional user style preference.

#### B. Spacing Scale Standardization
Adopt a strict 8px-unit rhythm:

```
--spacing-xs: 8px   (0.5rem)
--spacing-sm: 16px  (1rem)
--spacing-md: 24px  (1.5rem)
--spacing-lg: 32px  (2rem)
--spacing-xl: 48px  (3rem)
--spacing-2xl: 64px (4rem)
--spacing-3xl: 96px (6rem)
```

Map these to WordPress preset spacing slots. All skeletons use ONLY these values (no ad-hoc pixel values).

#### C. Color Palette Enhancement
From the user's primary color, auto-generate:
- Primary (as-is)
- Primary Light (10% tint)
- Primary Dark (20% shade)
- Secondary (complementary or analogous)
- Accent (triadic or user-supplied)
- Neutral Light, Neutral Dark (for text/backgrounds)

This can be done in ThemeAssembler or a new `ColorPalette` utility using HSL manipulation.

#### D. Shadow & Border Radius Tokens
Add design "warmth" tokens:
- `--radius-sm: 4px`, `--radius-md: 8px`, `--radius-lg: 16px`, `--radius-xl: 24px`
- `--shadow-sm`, `--shadow-md`, `--shadow-lg` (subtle box shadows)
- Vertical personality: SaaS = sharper (4px radius), Restaurant = softer (12-16px radius)

### Pillar 3: Composition Intelligence (10% of visual impact)

**Goal:** Pages feel curated, not auto-generated.

#### A. Layout Variation Rotation
When a vertical recipe calls for `features`, randomly select from `features-3col`, `features-icon-cards`, or `features-alternating` instead of always using the same one. This prevents "every site looks the same" syndrome.

Implementation: Extend `vertical-recipes.json` to allow arrays of alternatives per slot:
```json
{
  "home": [
    "hero-cover | hero-fullbleed | hero-split",
    "features-3col | features-alternating | features-icon-cards",
    "testimonials-3col | testimonials-single-featured",
    "cta-banner | cta-split"
  ]
}
```

PatternSelector picks one per slot (could be random, or AI-guided based on business description).

#### B. Section Pacing Rules
Define rules for good page flow:
- Never place two text-heavy sections adjacent
- Alternate between light and dark background sections
- CTA should appear after every 3-4 content sections
- Hero → Content → Social proof → CTA is the golden pattern
- End every page with a CTA (not just testimonials)

#### C. AI Planner Design Sense
Enhance the AI Planner prompt to consider:
- "Choose layouts that create visual rhythm — alternate image-left and image-right"
- "Use the featured/spotlight variant for the business's primary differentiator"
- "Ensure no two adjacent sections use the same column count"

---

## 5. Proposed Approach: Reference-Driven Skeleton Rebuild

Rather than designing skeletons from scratch, follow this process:

1. **Omar collects 3-5 reference themes per vertical** (screenshots or URLs of themes he thinks look amazing)
2. **Claude analyzes the design patterns** — spacing, typography scale, color distribution, section composition
3. **Claude rebuilds skeletons** as high-quality FSE block markup, matching the visual quality of the references
4. **Test each skeleton** in WordPress Playground for visual fidelity
5. **Update vertical recipes** with new skeleton alternatives
6. **Generate test themes** across all 5 verticals and compare against competitors

This is iterative — start with one vertical (restaurant, since we know it best), nail the quality, then expand to the other four.

---

## 6. Implementation Phases

### Phase 1: Foundation (Week 1-2) — Biggest bang for buck
- [ ] Omar provides 3-5 reference themes for restaurant vertical
- [ ] Rebuild hero skeletons (3-4 new high-quality variants)
- [ ] Implement font pairing system (2 fonts per vertical)
- [ ] Standardize spacing to 8px grid across all existing skeletons
- [ ] Create color palette auto-generation (tints/shades from primary)
- [ ] Test: Generate 3 restaurant themes, compare quality to before

### Phase 2: Library Expansion (Week 3-4)
- [ ] Add 15-20 new skeleton variants (testimonials, features, CTA, gallery, content)
- [ ] Implement layout variation rotation in PatternSelector
- [ ] Add section pacing rules to recipe composition
- [ ] Omar provides references for 2 more verticals (SaaS, Portfolio)
- [ ] Rebuild those vertical recipes with new skeletons
- [ ] Test: Generate themes across 3 verticals

### Phase 3: Polish & Remaining Verticals (Week 5-6)
- [ ] Complete remaining verticals (E-commerce, Local Service)
- [ ] Add shadow/radius design tokens per vertical personality
- [ ] Enhance AI Planner's design-aware prompting
- [ ] Add 5-10 more niche skeletons (video embed, blog preview, newsletter, logos)
- [ ] Full regression test across all 5 verticals
- [ ] Side-by-side comparison with competitor outputs

---

## 7. Success Criteria

After this phase, a generated PressPilot theme should:
- [ ] Look indistinguishable from a premium WordPress.com theme at first glance
- [ ] Have no two pages that feel repetitive in layout
- [ ] Use a harmonious, intentional color palette (not just "blue and white")
- [ ] Have typography that feels curated (heading + body font pairing)
- [ ] Include at least 2-3 section layout variants per type
- [ ] Pass Omar's "would I pay for this?" test
- [ ] Score well in a blind comparison against ZipWP / 10Web output

---

## 8. What Omar Needs to Do

The main thing that accelerates this phase is **reference material**. Specifically:

1. **Pick 3-5 restaurant themes you love** — from WordPress.com theme showcase, ThemeForest, or any site you think looks incredible. Screenshot the pages or share URLs.
2. **Pick 3-5 themes per remaining vertical** as we progress (SaaS, Portfolio, E-commerce, Local Service).
3. **Flag specific sections** you think look amazing — "I love how this testimonial section looks" or "this hero is exactly the vibe I want."

Everything else (skeleton coding, token systems, recipe updates, testing) is my job.

---

## 9. Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Skeleton explosion (too many) | Maintenance burden | Cap at 60-75, retire underperformers |
| Font loading performance | Slow page loads | Limit to 2 fonts, use font-display: swap |
| Over-engineering variation | Delays launch | Start with restaurant, iterate from there |
| Color auto-generation produces ugly combos | Bad themes | Fallback to curated palettes per vertical |
| Block markup complexity increases | More crash risk | Validate every new skeleton in Playground before merging |

---

## 10. Decision Log

| Decision | Rationale |
|----------|-----------|
| Reference-driven approach (not from scratch) | Faster, proven quality, less design risk |
| Start with restaurant vertical | Most tested, best understood, clearest reference points |
| 50-75 skeleton target (not 150+) | Sweet spot: enough variety without maintenance nightmare |
| Font pairing per vertical (not per theme) | Simpler, consistent, avoids bad user choices |
| Layout variation via recipe alternatives | Minimal pipeline changes, big visual impact |

---

*This document is ready for Omar's review. After approval, next step is to invoke the implementation planning phase and break this into actionable tasks.*
