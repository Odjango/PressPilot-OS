# TASK 3.2 — WordPress Playground Live Preview

> **Paste to your AI coding agent. Branch:** `feat/phase-3-frontend-integration`

---

## GOAL

After theme generation completes (Step 5 of Studio), show a **live WordPress Playground preview** in an iframe so the user sees their actual theme running in a real WordPress instance — all in-browser, no server needed. The download button appears below the preview.

## PACKAGES ALREADY INSTALLED

These are in `package.json` — do NOT install them again:
- `@wp-playground/client` (^3.1.3)
- `@wp-playground/wordpress` (^3.1.3)

## WHAT TO BUILD

### File 1: `app/studio/components/PlaygroundThemePreview.tsx`

Create a new component that:

1. Takes a `themeZipUrl` prop (the signed URL to the generated theme ZIP)
2. Renders an iframe
3. Uses `@wp-playground/client` to:
   - Boot a WordPress Playground instance inside the iframe
   - Install the theme ZIP from the URL
   - Activate the theme
   - Navigate to the front page
4. Shows a loading spinner while Playground boots
5. Shows an error state if Playground fails to load

**Implementation approach:**

```tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import { startPlaygroundWeb } from '@wp-playground/client';

interface PlaygroundThemePreviewProps {
  themeZipUrl: string;
  themeName?: string;
}

export default function PlaygroundThemePreview({ themeZipUrl, themeName }: PlaygroundThemePreviewProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!iframeRef.current || !themeZipUrl) return;

    let cancelled = false;

    async function boot() {
      try {
        const client = await startPlaygroundWeb({
          iframe: iframeRef.current!,
          remoteUrl: 'https://playground.wordpress.net/remote.html',
          blueprint: {
            landingPage: '/',
            preferredVersions: {
              php: '8.0',
              wp: 'latest',
            },
            steps: [
              {
                step: 'installTheme',
                themeZipFile: {
                  resource: 'url',
                  url: themeZipUrl,
                },
              },
              // Navigate to front page after install
              {
                step: 'setSiteOptions',
                options: {
                  blogname: themeName || 'My Site',
                },
              },
            ],
          },
        });

        if (!cancelled) {
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          console.error('[PlaygroundPreview] Boot failed:', err);
          setError('Preview failed to load. You can still download your theme below.');
          setLoading(false);
        }
      }
    }

    boot();
    return () => { cancelled = true; };
  }, [themeZipUrl, themeName]);

  return (
    <div className="w-full max-w-4xl mx-auto">
      {loading && (
        <div className="flex flex-col items-center justify-center h-[500px] rounded-2xl border-2 border-slate-800 bg-slate-900/50">
          <div className="h-12 w-12 rounded-full border-4 border-slate-800 border-t-white animate-spin mb-4" />
          <p className="text-slate-400 font-medium">Loading live preview...</p>
          <p className="text-slate-500 text-sm mt-1">This runs entirely in your browser</p>
        </div>
      )}

      {error && (
        <div className="flex flex-col items-center justify-center h-[200px] rounded-2xl border-2 border-slate-800 bg-slate-900/50">
          <p className="text-slate-400 font-medium">{error}</p>
        </div>
      )}

      <iframe
        ref={iframeRef}
        className={`w-full rounded-2xl border-2 border-slate-700 ${loading || error ? 'hidden' : 'block'}`}
        style={{ height: '600px' }}
      />
    </div>
  );
}
```

**IMPORTANT NOTES for the agent:**
- The `startPlaygroundWeb` API may have changed since the snippet above. Check the actual `@wp-playground/client` package types for the correct API. The existing file `src/generator/validators/PlaygroundValidator.ts` shows how Playground is already used in this project — reference it for API patterns.
- The `blueprint.steps` format uses `installTheme` with a `themeZipFile` object. Check the Playground docs at https://wordpress.github.io/wordpress-playground/ for the latest blueprint schema.
- The `themeZipUrl` is a Supabase signed URL (expires in 1 hour). Playground fetches it client-side, so CORS must allow it. Supabase Storage signed URLs are publicly accessible, so this should work.

### File 2: Update `app/studio/StudioClient.tsx` — Step 5 UI

Replace the current Step 5 JSX (the section inside `{currentStep === 5 && ( ... )}`) with:

1. **When generating (pending/processing):** Keep the current spinner + "Building Your Assets" text exactly as-is
2. **When completed:** Show the Playground preview ABOVE the download card
3. **When failed:** Keep the current error display exactly as-is

The completed state should look like:

```
[Checkmark icon]
"Your Kit is Ready"
"Preview your theme live below, then download when ready."

[===== Playground iframe (600px tall) =====]

[Download Theme button card — same as current]

[Generate Another Design link]
```

**Changes to make in StudioClient.tsx:**

1. Add import at top:
```tsx
import PlaygroundThemePreview from './components/PlaygroundThemePreview';
```

2. In the `jobStatus === "completed"` branch of Step 5, add the preview component BEFORE the download card:

```tsx
{jobStatus === "completed" && artifacts?.themeUrl && (
  <PlaygroundThemePreview
    themeZipUrl={artifacts.themeUrl}
    themeName={project?.name}
  />
)}
```

3. Keep ALL existing download card JSX unchanged. Just add the preview above it.

## WHAT NOT TO DO

- Do NOT remove or change the download button/card
- Do NOT change the spinner/pending/failed states
- Do NOT install any new packages
- Do NOT create a server-side endpoint for Playground — it runs entirely in the browser
- Do NOT touch any Laravel or API code
- Do NOT modify `PlaygroundValidator.ts` — that's for backend validation, separate from the UI preview

## TESTING

1. Run `npm run dev`
2. Go to Studio, fill form, generate a theme
3. When generation completes:
   - Preview iframe should appear with a loading spinner
   - After 10-15 seconds, a live WordPress site with your theme should appear
   - User can click around the preview (it's a real WordPress instance)
   - Download button still works below the preview
4. Test on mobile — iframe should be responsive (full width, 600px height)

## FILES CHANGED (SUMMARY)

| File | Action |
|------|--------|
| `app/studio/components/PlaygroundThemePreview.tsx` | CREATE — new component |
| `app/studio/StudioClient.tsx` | EDIT — add import + preview in Step 5 completed state |
