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
        ? "border-white bg-slate-900 shadow-2xl scale-[1.02] z-10"
        : "border-slate-800 bg-slate-900 hover:border-slate-600 hover:shadow-xl"
        }`}
    >
      {selected && (
        <div className="absolute -top-3 -right-3 h-10 w-10 rounded-full bg-white text-slate-950 flex items-center justify-center shadow-xl animate-in zoom-in spin-in-90 duration-500">
          <Check className="h-6 w-6" strokeWidth={3} />
        </div>
      )}

      <div className="space-y-6">
        {/* Visual Preview */}
        <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-slate-800 border border-slate-700 shadow-inner">
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
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
              {variation.preview.label}
            </span>
          </div>
          <h3 className="text-xl font-black text-white leading-tight tracking-tight">
            {heroHeadline}
          </h3>
        </div>

        <p className="line-clamp-2 text-sm text-slate-400 font-medium leading-relaxed h-10">
          {heroSubheadline}
        </p>

        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
          <div className="flex items-center -space-x-3">
            {palette.map((color, i) => (
              <div
                key={`${color}-${i}`}
                className="h-10 w-10 rounded-full border-4 border-slate-900 shadow-sm ring-1 ring-white/5 transition-transform hover:scale-110 hover:z-10"
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
          <span className="text-[10px] font-mono font-bold text-slate-600">
            {variation.id.slice(0, 8).toUpperCase()}
          </span>
        </div>
      </div>
    </button>
  );
}
