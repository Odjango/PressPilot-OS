"use client";

import type { PressPilotVariationManifest } from "@/types/presspilot";

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
      className={`w-full rounded-2xl border px-4 py-4 text-left transition ${
        selected
          ? "border-black bg-neutral-50 ring-2 ring-black"
          : "border-neutral-200 bg-white hover:border-neutral-900"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-neutral-900">
          {variation.preview.label}
        </p>
        {selected ? (
          <span className="rounded-full bg-black px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
            Selected
          </span>
        ) : null}
      </div>
      <p className="mt-2 text-base font-semibold text-neutral-900">
        {heroHeadline}
      </p>
      <p className="mt-1 overflow-hidden text-sm text-neutral-600 text-ellipsis">
        {heroSubheadline}
      </p>
      <p className="mt-2 text-xs text-neutral-500">
        {variation.preview.description}
      </p>
      <div className="mt-4 flex items-center gap-2">
        {palette.map((color) => (
          <span
            key={color}
            className="h-6 w-6 rounded-full border border-white shadow"
            style={{ backgroundColor: color }}
            aria-label={`Color ${color}`}
          />
        ))}
      </div>
    </button>
  );
}


