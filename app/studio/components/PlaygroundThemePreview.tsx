'use client';

import { useEffect, useRef, useState } from 'react';

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
        // Dynamic import — @wp-playground/client is browser-only
        const { startPlaygroundWeb } = await import('@wp-playground/client');

        await startPlaygroundWeb({
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
      {loading && !error && (
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
