'use client';

import { useMemo, useState } from 'react';
import VariationPreviewTabs from './VariationPreviewTabs';
import DownloadPanel from './DownloadPanel';
import ProgressIndicator from './ProgressIndicator';
import { DownloadLinks, PressPilotVariationSet, VariationId } from '@/types/presspilot';

interface DemoPreviewPanelProps {
  variationSet: PressPilotVariationSet;
}

export default function DemoPreviewPanel({ variationSet }: DemoPreviewPanelProps) {
  const [selectedVariationId, setSelectedVariationId] = useState<VariationId>(variationSet.variations[0].id);
  const [downloads, setDownloads] = useState<DownloadLinks | undefined>();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Placeholder until real auth arrives.
  const selectedVariation = useMemo(
    () => variationSet.variations.find((variation) => variation.id === selectedVariationId) ?? variationSet.variations[0],
    [selectedVariationId, variationSet]
  );

  const handleGenerate = () => {
    if (!isLoggedIn) {
      alert('Login required for generation');
      return;
    }
    setIsGenerating(true);
    // Fake delay before revealing downloads.
    setTimeout(() => {
      setDownloads({
        themeZipUrl: `/build/themes/${variationSet.context.brand.slug}.zip`,
        staticSiteZipUrl: `/build/static/${variationSet.context.brand.slug}.zip`
      });
      setIsGenerating(false);
    }, 1200);
  };

  return (
    <div className="space-y-6">
      <VariationPreviewTabs variationSet={variationSet} selectedId={selectedVariationId} onSelect={setSelectedVariationId} />
      <div className="space-y-2">
        <button
          type="button"
          className="w-full rounded bg-neutral-900 px-4 py-3 text-sm font-semibold text-white"
          onClick={handleGenerate}
        >
          Generate Theme & Static Site
        </button>
        <button
          type="button"
          className="w-full rounded border border-neutral-300 px-4 py-2 text-xs text-neutral-600"
          onClick={() => setIsLoggedIn((prev) => !prev)}
        >
          Toggle login placeholder (currently {isLoggedIn ? 'logged in' : 'logged out'})
        </button>
      </div>
      {!isLoggedIn && (
        <p className="text-xs text-neutral-500">
          Preview mode only. Login prompt placeholder appears when generation is requested.
        </p>
      )}
      <ProgressIndicator
        isPreviewLoading={false}
        isGenerateLoading={isGenerating}
        hasInput
        hasPreview
        selectionMade
        kitsRequested={isGenerating || Boolean(downloads)}
        hasDownloads={Boolean(downloads)}
      />
      <DownloadPanel
        themeUrl={downloads?.themeZipUrl ?? null}
        staticUrl={downloads?.staticSiteZipUrl ?? null}
        isGenerating={isGenerating}
        slug={variationSet.context.brand.slug}
      />
    </div>
  );
}
