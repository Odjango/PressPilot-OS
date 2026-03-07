# TASK 3.3: Image Tier Integration — Agent Prompt

> **Context:** PressPilot is a SaaS that generates WordPress FSE themes. The Studio is a 5-step wizard (CONTEXT → HOMEPAGE → REFINE → PREVIEW → DELIVER). We need to add image tier selection so users choose between Standard (placeholder/AI images) and Agency (Unsplash curated images).
>
> **Branch:** Create `feat/phase-3.3-image-tier` from `main`.
>
> **Scope:** Frontend UI + data plumbing + backend routing. No new AI image generation — Standard tier uses existing placehold.co fallback.

---

## OVERVIEW

Add a two-tier image selection system:

| Tier | Label | Image Source | UI |
|------|-------|-------------|-----|
| **Standard** | "Standard" | placehold.co placeholders (AI images coming soon) | Simple message: "Placeholder images included — replace them in WordPress" |
| **Agency** | "Agency" | Unsplash API (curated by user) | Unsplash search picker for hero, about, and feature images |

---

## STEP 1: Add `imageTier` to StudioFormInput

**File:** `lib/presspilot/studioAdapter.ts`

Add to the `StudioFormInput` interface:

```typescript
// Image Tier (Phase 3.3)
imageTier?: 'standard' | 'agency';
selectedImages?: {
  hero?: string;       // Unsplash image URL
  about?: string;      // Unsplash image URL
  feature1?: string;   // Unsplash image URL
  feature2?: string;   // Unsplash image URL
  feature3?: string;   // Unsplash image URL
};
```

In `buildSaaSInputFromStudioInput()`, map these to the existing `system` fields:

```typescript
system: {
  ...existing,
  image_tier: input.imageTier === 'agency' ? 'stock' : 'mixed',
},
```

And pass `selectedImages` through to `visualAssets` or a new top-level field in the SaaS input so they reach the backend.

---

## STEP 2: Add Tier Selection UI to Studio Step 1

**File:** `app/studio/StudioClient.tsx`

### 2a. Add state variables (near line ~100, with other state):

```typescript
const [imageTier, setImageTier] = useState<'standard' | 'agency'>('standard');
const [selectedImages, setSelectedImages] = useState<{
  hero?: string;
  about?: string;
  feature1?: string;
  feature2?: string;
  feature3?: string;
}>({});
```

### 2b. Add tier selector in Step 1 UI

Place this AFTER the Contact Info accordion (section 4) and BEFORE the "Continue to Variations" button. It should be section 5.

Design guidance (match existing dark theme):
- Section header: `5 Image Source` with "(Optional)" label like Contact Info has
- Two selectable cards side by side (same card style as Business Category cards)
- Left card: **Standard** — "Placeholder images included. Replace them easily in WordPress after install." — Pre-selected by default, green border when selected
- Right card: **Agency** — "Choose professional images from Unsplash for a polished, ready-to-use theme." — When selected, reveals the Unsplash picker below

### 2c. Wire into `studioInput()` method

In the `studioInput()` method (around line 452), add:

```typescript
imageTier,
selectedImages: imageTier === 'agency' ? selectedImages : undefined,
```

---

## STEP 3: Create UnsplashPicker Component

**File:** `app/studio/components/UnsplashPicker.tsx` (NEW)

### Requirements:
- Dark theme matching existing Studio UI (bg-gray-900/800 cards, green accent, white text)
- Search input at top with debounced search (300ms)
- Grid of Unsplash thumbnail results (3 columns on desktop, 2 on mobile)
- Each image shows photographer credit overlay (Unsplash API requirement)
- Five labeled slots: "Hero Image", "About Image", "Feature 1", "Feature 2", "Feature 3"
- User clicks a thumbnail → it fills the currently active slot
- Slot indicators show which are filled (green check) vs empty (gray outline)
- "Hero Image" slot is pre-selected/active by default

### Props:
```typescript
interface UnsplashPickerProps {
  selectedImages: {
    hero?: string;
    about?: string;
    feature1?: string;
    feature2?: string;
    feature3?: string;
  };
  onImagesChange: (images: UnsplashPickerProps['selectedImages']) => void;
  businessCategory: string;  // Used as default search query
}
```

### API Integration:
- Create a Next.js API route: `app/api/unsplash/search/route.ts`
- This route calls the Unsplash API server-side (keeps API key secret)
- Environment variable: `UNSPLASH_ACCESS_KEY` (already may exist — check `.env` / Coolify)
- Endpoint: `GET https://api.unsplash.com/search/photos?query={query}&per_page=12&orientation=landscape`
- Return: array of `{ id, urls: { small, regular, full }, user: { name, links: { html } }, alt_description }`

### Unsplash Attribution:
- Each image must show "Photo by {name}" linking to photographer's Unsplash profile
- Include `utm_source=presspilot&utm_medium=referral` on attribution links (Unsplash API requirement)

### UX Flow:
1. Component appears when Agency tier is selected
2. Auto-searches using `businessCategory` as initial query (e.g., "restaurant", "ecommerce")
3. User can type custom search terms
4. Click image → fills active slot → auto-advances to next empty slot
5. Filled slots show thumbnail preview with X to remove
6. All 5 slots are optional — partial selection is fine

---

## STEP 4: Pass Tier Through API Generate Endpoint

**File:** `app/api/generate/route.ts`

The existing proxy logic already forwards the entire `input` object to Laravel. Verify that `imageTier` and `selectedImages` are included in the proxied payload. They should be because the proxy sends the full `input` field.

If the local (non-proxy) path is still active, also ensure `imageTier` and `selectedImages` flow through `buildSaaSInputFromStudioInput()` → `transformSaaSInputToGeneratorData()`.

---

## STEP 5: Update Laravel GenerationController

**File:** `backend/app/Http/Controllers/GenerationController.php`

In the `resolvePayload()` method (the large method that builds the canonical payload), update the `visualAssets` section:

```php
'visualAssets' => [
    'has_logo' => !empty($input['logoBase64']) || !empty($input['logoPath']),
    'logo_file_url' => $input['logoBase64'] ?? $input['logoPath'] ?? null,
    'image_tier' => $input['imageTier'] ?? 'standard',
    'image_source_preference' => ($input['imageTier'] ?? 'standard') === 'agency' ? 'unsplash' : 'placeholder',
    'selected_images' => $input['selectedImages'] ?? null,
    'image_keywords' => [$category, 'business'],
],
```

---

## STEP 6: Update ImageHandler to Use Tier

**File:** `backend/app/Services/ImageHandler.php`

Currently `resolveImages()` doesn't check tier. Update it:

### 6a. Accept tier in the method signature or extract from project data:

```php
public function resolveImages(array $projectData, string $destDir): array
{
    $tier = $projectData['visualAssets']['image_tier'] ?? 'standard';
    $selectedImages = $projectData['visualAssets']['selected_images'] ?? [];

    // ... existing token loop
}
```

### 6b. In the token resolution loop, add tier routing:

```php
foreach ($this->tokenSizes as $token => [$width, $height]) {
    // Agency tier: use user-selected Unsplash images if available
    if ($tier === 'agency') {
        $mappedUrl = $this->mapTokenToSelectedImage($token, $selectedImages);
        if ($mappedUrl) {
            $imageTokens[$token] = $mappedUrl;
            continue;
        }
    }

    // Standard tier (or agency fallback): use existing provider chain
    // ... existing fetchImage() logic
}
```

### 6c. Add the mapping method:

```php
private function mapTokenToSelectedImage(string $token, array $selectedImages): ?string
{
    $map = [
        'IMAGE_HERO' => 'hero',
        'IMAGE_ABOUT' => 'about',
        'IMAGE_FEATURE_1' => 'feature1',
        'IMAGE_FEATURE_2' => 'feature2',
        'IMAGE_GALLERY_1' => 'feature3',
    ];

    $key = $map[$token] ?? null;
    return ($key && !empty($selectedImages[$key])) ? $selectedImages[$key] : null;
}
```

---

## STEP 7: Create Unsplash API Route

**File:** `app/api/unsplash/search/route.ts` (NEW)

```typescript
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get('query');
  if (!query) {
    return NextResponse.json({ error: 'Missing query parameter' }, { status: 400 });
  }

  const accessKey = process.env.UNSPLASH_ACCESS_KEY;
  if (!accessKey) {
    return NextResponse.json({ error: 'Unsplash API not configured' }, { status: 503 });
  }

  const response = await fetch(
    `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=12&orientation=landscape`,
    {
      headers: {
        Authorization: `Client-ID ${accessKey}`,
      },
    }
  );

  if (!response.ok) {
    return NextResponse.json({ error: 'Unsplash API error' }, { status: response.status });
  }

  const data = await response.json();

  // Return only what the frontend needs
  const results = data.results.map((photo: any) => ({
    id: photo.id,
    urls: {
      small: photo.urls.small,
      regular: photo.urls.regular,
      full: photo.urls.full,
    },
    alt: photo.alt_description || query,
    photographer: {
      name: photo.user.name,
      url: `${photo.user.links.html}?utm_source=presspilot&utm_medium=referral`,
    },
  }));

  return NextResponse.json({ results });
}
```

---

## FILES CHANGED SUMMARY

| File | Action | Description |
|------|--------|-------------|
| `lib/presspilot/studioAdapter.ts` | MODIFY | Add `imageTier` and `selectedImages` to `StudioFormInput`, wire through `buildSaaSInputFromStudioInput()` |
| `app/studio/StudioClient.tsx` | MODIFY | Add tier state, tier selection UI in Step 1, wire into `studioInput()` |
| `app/studio/components/UnsplashPicker.tsx` | CREATE | Unsplash image search & selection component |
| `app/api/unsplash/search/route.ts` | CREATE | Server-side Unsplash API proxy |
| `backend/app/Http/Controllers/GenerationController.php` | MODIFY | Extract `imageTier` and `selectedImages` into `visualAssets` |
| `backend/app/Services/ImageHandler.php` | MODIFY | Add tier-based image routing, map selected images to tokens |

---

## VERIFICATION CHECKLIST

After implementation, manually test:

- [ ] Step 1 shows tier selection cards below Contact Info
- [ ] Standard tier is pre-selected by default
- [ ] Selecting Agency reveals the Unsplash picker
- [ ] Unsplash search returns results (need `UNSPLASH_ACCESS_KEY` env var)
- [ ] Clicking an image fills the active slot with a thumbnail preview
- [ ] Switching back to Standard hides the picker and clears selections
- [ ] Generation with Standard tier produces theme with placehold.co images (existing behavior)
- [ ] Generation with Agency tier + selected images produces theme with Unsplash URLs in the image tokens
- [ ] No TypeScript errors (`npx tsc --noEmit`)
- [ ] Existing generation flow (no tier selected) still works identically (backward compatible)

---

## IMPORTANT CONSTRAINTS

1. **Do NOT modify the 5-step wizard order.** Tier selection goes IN Step 1, not as a new step.
2. **Do NOT add Unsplash API key to client-side code.** The API route handles this server-side.
3. **Do NOT break the existing generation flow.** `imageTier` defaults to `'standard'` everywhere — no existing behavior changes if the field is missing.
4. **Match the existing dark theme styling.** Look at how Business Category cards and Contact Info accordion are styled in `StudioClient.tsx` and match exactly.
5. **Keep the UnsplashPicker self-contained.** All Unsplash logic in one component file + one API route. No scattered imports.
6. **Unsplash attribution is legally required.** Every displayed image must show photographer credit.

---

## ENVIRONMENT VARIABLE NEEDED

Add to Coolify (both `nextjs-app` and `.env.local` for dev):

```
UNSPLASH_ACCESS_KEY=your_unsplash_access_key_here
```

Omar will need to get this from https://unsplash.com/developers — create an app, get the Access Key.
