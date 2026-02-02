# Hero System Architecture

This document describes the hero layout system used for both theme generation and real-time preview rendering.

## Overview

The hero system provides 4 distinct layout options for homepage hero sections:

| Layout | Description | Best For |
|--------|-------------|----------|
| `fullBleed` | Full-screen image with dark overlay | Restaurants, portfolios, creative businesses |
| `fullWidth` | Solid color band (no image) | SaaS, tech companies, clean brands |
| `split` | Two columns: text left, image right | Professional services, agencies |
| `minimal` | Large centered text on white | Startups, minimalist brands |

## Implementation Architecture

### Why Two Implementations?

The hero system is implemented in **two places** that must stay synchronized:

1. **TypeScript (Build-time)**: `src/generator/patterns/hero-variants.ts`
   - Used when generating the final downloadable theme ZIP
   - Produces WordPress block markup that gets written to `front-page.html`

2. **PHP (Runtime)**: `src/preview/heroPreviewInjector.ts` → generates PHP
   - Used for real-time WordPress preview screenshots
   - Injects PHP into `functions.php` to dynamically switch hero layouts
   - Accessed via `?pp_hero_preview=<layout>` query parameter

### Data Flow

```
Studio UI Selection
        ↓
   [Preview Flow]                    [Final Theme Flow]
        ↓                                   ↓
heroPreviewInjector.ts               hero-variants.ts
(generates PHP)                      (TypeScript)
        ↓                                   ↓
WordPress renders                    HTML written to
hero dynamically                     front-page.html
        ↓                                   ↓
Playwright captures                  Theme ZIP created
screenshot
```

## File Locations

| File | Purpose |
|------|---------|
| `src/generator/patterns/hero-variants.ts` | TypeScript hero generators for final theme |
| `src/preview/heroPreviewInjector.ts` | PHP generator for preview mode |
| `src/preview/HeroPreviewRunner.ts` | Playwright orchestration for screenshots |
| `app/api/studio/hero-previews/route.ts` | API endpoint for preview generation |

## Hero Layout Specifications

### Full-Bleed Hero (`fullBleed`)

```
┌────────────────────────────────────┐
│           Background Image         │
│         (75% dark overlay)         │
│                                    │
│         ╔══════════════╗           │
│         ║   Headline   ║           │
│         ║  Subheadline ║           │
│         ║  [CTA] [CTA] ║           │
│         ╚══════════════╝           │
│                                    │
└────────────────────────────────────┘
```

- Block: `wp:cover` with `align: "full"`
- Overlay: `dimRatio: 75`, `overlayColor: "accent-3"`
- Padding: `spacing|60` (top/bottom)
- Content width: 900px constrained
- Text color: `base` (white)

### Full-Width Band (`fullWidth`)

```
┌────────────────────────────────────┐
│       Solid Color Background       │
│         (accent-3 color)           │
│                                    │
│         ╔══════════════╗           │
│         ║   Headline   ║           │
│         ║  Subheadline ║           │
│         ║  [CTA] [CTA] ║           │
│         ╚══════════════╝           │
│                                    │
└────────────────────────────────────┘
```

- Block: `wp:group` with `align: "full"`
- Background: `backgroundColor: "accent-3"`
- Padding: `spacing|50` (shorter than fullBleed)
- Content width: 900px constrained
- Text color: `base` (white)

### Split Hero (`split`)

```
┌─────────────────┬──────────────────┐
│                 │                  │
│   Headline      │                  │
│   Subheadline   │     Image        │
│   [CTA] [CTA]   │   (rounded)      │
│                 │                  │
└─────────────────┴──────────────────┘
```

- Block: `wp:group` → `wp:columns`
- Background: `base` (white)
- Columns: 50% / 50%
- Left column: vertically centered text
- Right column: image with 12px border-radius
- Text color: `contrast` (dark)
- CTA outline: `accent` color

### Minimal Hero (`minimal`)

```
┌────────────────────────────────────┐
│                                    │
│                                    │
│         Large Headline             │
│           Subheadline              │
│             [CTA]                  │
│                                    │
│                                    │
└────────────────────────────────────┘
```

- Block: `wp:group` with `align: "full"`
- Background: `base` (white)
- Padding: `spacing|60` (generous)
- Content width: 800px (narrower)
- Single CTA button only
- Text color: `contrast` (dark)
- Larger typography scale

## TT4 Color Tokens

All hero layouts use semantic color tokens from Twenty Twenty-Four:

| Token | Usage |
|-------|-------|
| `base` | Light backgrounds, button text on dark bg |
| `contrast` | Dark text on light backgrounds |
| `contrast-2` | Secondary/muted text |
| `accent` | Primary button background |
| `accent-3` | Hero overlay/background color |

## Adding a New Hero Layout

To add a new hero layout (e.g., `video` or `carousel`):

### Step 1: Update TypeScript

In `src/generator/patterns/hero-variants.ts`:

```typescript
export function getVideoHero(content?: PageContent): string {
    // Return WordPress block markup
    return `<!-- wp:cover {...} -->...<!-- /wp:cover -->`;
}

// Update the selector function
export function getHeroByLayout(layout: HeroLayout | undefined, content?: PageContent): string {
    switch (layout) {
        // ... existing cases
        case 'video':
            return getVideoHero(content);
        default:
            return getFullBleedHero(content);
    }
}
```

### Step 2: Update PHP Generator

In `src/preview/heroPreviewInjector.ts`:

Add a new PHP function that produces identical markup:

```typescript
function pp_hero_video(\$title, \$sub, \$video_url) {
    return '<!-- Same markup as TypeScript version -->';
}
```

Update the switch statement in `pp_get_hero_variant()`.

### Step 3: Update Types

In `src/generator/types.ts`:

```typescript
export type HeroLayout = 'fullBleed' | 'fullWidth' | 'split' | 'minimal' | 'video';
```

### Step 4: Update Studio UI

In `lib/theme/palettes.ts`, add to `HERO_LAYOUT_OPTIONS`:

```typescript
{ id: 'video', label: 'Video Hero', description: 'Autoplay background video', icon: '🎬' }
```

## Testing

### Generate Theme with Specific Layout

```bash
# Via CLI
npx ts-node src/generator/index.ts --data='{"heroLayout":"split","name":"Test"}'

# Check output
cat output/test/templates/front-page.html | grep -A 20 "wp:columns"
```

### Test Preview System

1. Start WordPress: `docker-compose up -d wordpress`
2. Start Next.js: `npm run dev`
3. Navigate to Studio, complete Steps 1-3
4. Click "Preview Real Heroes"
5. Verify 4 distinct screenshots appear

### Visual Verification

```bash
# Run Playwright screenshot tests
npx playwright test tests/visual/theme-hero-capture.spec.ts
```

## Troubleshooting

### Preview Screenshots All Look the Same

Check that PHP injection is working:
1. In generated theme's `functions.php`, search for `PP_HERO_PREVIEW_LAYOUT`
2. Manually test: `http://localhost:8089/?pp_hero_preview=split`
3. Verify different markup is rendered

### TypeScript/PHP Mismatch

If previews don't match final theme:
1. Compare output of TypeScript function vs PHP function
2. Check for escaping differences (PHP uses `esc_html()`, `esc_attr()`)
3. Ensure both use identical TT4 color tokens

### Block Validation Errors in WordPress

If WordPress shows "This block contains unexpected or invalid content":
1. Verify JSON attributes are valid (no trailing commas)
2. Ensure HTML wrapper matches block type
3. Check for properly closed blocks (`<!-- /wp:blockname -->`)
