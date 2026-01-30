"use client";

import type { PressPilotVariationManifest } from "@/types/presspilot";
import { Check } from "lucide-react";

type VariationCardProps = {
  variation: PressPilotVariationManifest;
  selected: boolean;
  onSelect: () => void;
};

const FALLBACK_PALETTE = ["#111827", "#4b5563", "#d1d5db", "#f5f5f5"];

function resolvePalette(variation: PressPilotVariationManifest): string[] {
  const candidate = (variation as unknown as { colorPalette?: string[] })
    ?.colorPalette;
  if (Array.isArray(candidate) && candidate.length > 0) {
    return candidate.slice(0, 4);
  }
  return FALLBACK_PALETTE;
}

export default function VariationCard({
  variation,
  selected,
  onSelect,
}: VariationCardProps) {
  const palette = resolvePalette(variation);
  const heroHeadline =
    (variation as unknown as { heroHeadline?: string }).heroHeadline ??
    variation.preview.label;
  const heroSubheadline =
    (variation as unknown as { heroSubheadline?: string }).heroSubheadline ??
    variation.preview.description;

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`relative w-full rounded-3xl border-2 p-6 text-left transition-all duration-500 ease-out ${selected
        ? "border-black bg-white shadow-2xl scale-[1.02] z-10"
        : "border-neutral-100 bg-white hover:border-neutral-300 hover:shadow-xl"
        }`}
    >
      {selected && (
        <div className="absolute -top-3 -right-3 h-10 w-10 rounded-full bg-black text-white flex items-center justify-center shadow-xl animate-in zoom-in spin-in-90 duration-500">
          <Check className="h-6 w-6" strokeWidth={3} />
        </div>
      )}

      <div className="space-y-6">
        {/* Visual Preview */}
        <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-neutral-100 border border-neutral-100 shadow-inner">
          {variation.preview.imageUrl && (
            <img
              src={variation.preview.imageUrl}
              alt={variation.preview.label}
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400">
              {variation.preview.label}
            </span>
          </div>
          <h3 className="text-xl font-black text-neutral-900 leading-tight tracking-tight">
            {heroHeadline}
          </h3>
        </div>

        <p className="line-clamp-2 text-sm text-neutral-500 font-medium leading-relaxed h-10">
          {heroSubheadline}
        </p>

        <div className="flex items-center justify-between pt-4 border-t border-neutral-50">
          <div className="flex items-center -space-x-3">
            {palette.map((color, i) => (
              <div
                key={`${color}-${i}`}
                className="h-10 w-10 rounded-full border-4 border-white shadow-sm ring-1 ring-black/5 transition-transform hover:scale-110 hover:z-10"
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
          <span className="text-[10px] font-mono font-bold text-neutral-300">
            {variation.id.slice(0, 8).toUpperCase()}
          </span>
        </div>
      </div>
    </button>
  );
}
