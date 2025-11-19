'use client';

import { PressPilotVariationManifest, PressPilotVariationSet, VariationId } from '@/types/presspilot';

interface VariationPreviewTabsProps {
  variationSet: PressPilotVariationSet | null;
  selectedId: VariationId | null;
  onSelect: (id: VariationId) => void;
}

export default function VariationPreviewTabs({ variationSet, selectedId, onSelect }: VariationPreviewTabsProps) {
  if (!variationSet) {
    return (
      <div className="rounded-lg border border-dashed border-neutral-300 bg-white/70 p-4 text-sm text-neutral-500 shadow-sm">
        Run Preview to see three design options.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {variationSet.variations.map((variation: PressPilotVariationManifest) => {
        const isActive = selectedId === variation.id;
        return (
          <article
            key={variation.id}
            className={`space-y-3 rounded-lg border p-4 text-sm shadow-sm transition ${
              isActive ? 'border-neutral-900 bg-white' : 'border-neutral-200 bg-white/60 hover:border-neutral-400'
            }`}
          >
            <div className="flex items-center justify-between gap-3">
              <span className="text-base font-semibold text-neutral-900">{variation.preview.label}</span>
              <button
                type="button"
                className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${
                  isActive ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-600'
                }`}
                onClick={() => onSelect(variation.id)}
              >
                {isActive ? 'Selected' : 'Select'}
              </button>
            </div>
            <p className="text-neutral-600">{variation.preview.description}</p>
            <div className="grid grid-cols-2 gap-2 text-[12px] text-neutral-500">
              <p>
                <span className="font-semibold">Palette:</span> {variation.tokens.palette_id}
              </p>
              <p>
                <span className="font-semibold">Fonts:</span> {variation.tokens.font_pair_id}
              </p>
              <p>
                <span className="font-semibold">Layout:</span> {variation.tokens.layout_density}
              </p>
              <p>
                <span className="font-semibold">Corners:</span> {variation.tokens.corner_style}
              </p>
            </div>
          </article>
        );
      })}
    </div>
  );
}
