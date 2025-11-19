'use client';

import { useState } from 'react';

interface DownloadPanelProps {
  themeUrl: string | null;
  staticUrl: string | null;
  isGenerating: boolean;
  slug?: string | null;
}

type DownloadKind = 'theme' | 'static';

export default function DownloadPanel({ themeUrl, staticUrl, isGenerating, slug }: DownloadPanelProps) {
  const [activeDownload, setActiveDownload] = useState<DownloadKind | null>(null);
  const downloadsReady = Boolean(themeUrl && staticUrl) && !isGenerating;
  const wrapperClass = downloadsReady ? 'border-emerald-300 bg-emerald-50/80' : 'border-neutral-200 bg-white';

  const handleDownload = async (kind: DownloadKind) => {
    const url = kind === 'theme' ? themeUrl : staticUrl;
    if (!url || activeDownload) return;

    try {
      setActiveDownload(kind);
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Download failed');
      }
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const inferredSlug = slug ?? 'presspilot-kit';
      link.href = objectUrl;
      link.download = `${inferredSlug}-${kind}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(objectUrl);
    } catch (error) {
      console.error(`[DownloadPanel] ${kind} download failed`, error);
      alert('Download failed. Please try again.');
    } finally {
      setActiveDownload(null);
    }
  };

  const renderButton = (kind: DownloadKind, label: string) => {
    const url = kind === 'theme' ? themeUrl : staticUrl;
    const isActive = activeDownload === kind;
    if (!downloadsReady || !url) {
      return (
        <span className="flex-1 rounded-full border border-neutral-200 px-4 py-2 text-center text-sm font-semibold text-neutral-400">
          {label}
        </span>
      );
    }

    return (
      <button
        type="button"
        className={`flex-1 rounded-full px-4 py-2 text-center text-sm font-semibold text-white transition ${
          isActive ? 'bg-neutral-700' : 'bg-neutral-900 hover:bg-neutral-800'
        }`}
        onClick={() => handleDownload(kind)}
        disabled={isActive}
      >
        {isActive ? 'Downloading…' : label}
      </button>
    );
  };

  return (
    <div className={`space-y-3 rounded-2xl border p-4 text-sm shadow-sm ${wrapperClass}`}>
      <p className="text-sm font-semibold text-neutral-900">Final Downloads</p>
      <div className="flex flex-col gap-2 md:flex-row">
        {renderButton('theme', 'Download WordPress Theme (.zip)')}
        {renderButton('static', 'Download Static Site (HTML/CSS/JS)')}
      </div>
      {downloadsReady ? (
        <p className="text-xs text-neutral-600">
          Downloads ready
          {slug ? (
            <>
              {' '}
              for <span className="font-semibold">{slug}</span>
            </>
          ) : null}
          . Use the buttons above to grab the kit zips.
        </p>
      ) : (
        <p className="text-xs text-neutral-500">Generate exports to unlock the downloads.</p>
      )}
    </div>
  );
}
