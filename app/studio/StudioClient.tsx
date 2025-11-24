"use client";

import { useCallback, useMemo, useState } from "react";
import type { PressPilotVariationSet, VariationId } from "@/types/presspilot";
import type { StudioFormInput } from "@/lib/presspilot/studioAdapter";
import VariationCard from "./VariationCard";

type StudioProject = {
  id: string;
  owner_email: string;
  name: string;
  slug: string;
  status: string;
  created_at: string | null;
};

type VariationResponse = {
  variationSet: PressPilotVariationSet;
  businessTypeId: string | null;
  styleVariation: string | null;
};

type ArtifactResponse = {
  slug: string | null;
  themeUrl: string | null;
  staticUrl: string | null;
  themeZipPath?: string | null;
  staticZipPath?: string | null;
};

type Props = {
  project: StudioProject;
};

const DEFAULT_LANGUAGE = "en";
const DEFAULT_CATEGORY = "service";

export default function StudioClient({ project }: Props) {
  const defaultBrief = useMemo(
    () =>
      `${project.name} needs a polished WordPress kit with modern hero copy, clear CTAs, and a tone that matches a premium web studio.`,
    [project.name],
  );

  const [brief, setBrief] = useState(defaultBrief);
  const [assigning, setAssigning] = useState(false);
  const [assignError, setAssignError] = useState<string | null>(null);
  const [variations, setVariations] = useState<VariationResponse | null>(null);
  const [selectedVariationId, setSelectedVariationId] = useState<
    VariationId | null
  >(null);

  const [generating, setGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);
  const [artifacts, setArtifacts] = useState<ArtifactResponse | null>(null);

  const variationList = useMemo(
    () => variations?.variationSet.variations ?? [],
    [variations],
  );
  const selectedVariation = useMemo(() => {
    if (!variationList.length || !selectedVariationId) {
      return variationList[0] ?? null;
    }
    return (
      variationList.find((variation) => variation.id === selectedVariationId) ??
      variationList[0] ??
      null
    );
  }, [variationList, selectedVariationId]);

  const studioInput = useCallback((): StudioFormInput => {
    return {
      businessName: project.name,
      businessDescription: brief,
      primaryLanguage: DEFAULT_LANGUAGE,
      businessCategory: DEFAULT_CATEGORY,
    };
  }, [project.name, brief]);

  const handleAssign = useCallback(async () => {
    setAssigning(true);
    setAssignError(null);
    setVariations(null);
    setSelectedVariationId(null);
    setArtifacts(null);
    setGenerateError(null);

    try {
      const response = await fetch("/api/variations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          input: studioInput(),
        }),
      });
      const payload = (await response.json().catch(() => ({}))) as
        | VariationResponse
        | Record<string, unknown>;

      if (!response.ok) {
        throw new Error(
          (payload as { error?: string })?.error ??
            "Unable to request variations.",
        );
      }

      const typed = payload as VariationResponse;
      setVariations(typed);
      setSelectedVariationId(
        typed.variationSet.variations[0]?.id ?? null,
      );
    } catch (error) {
      console.error("[StudioClient] variations error", error);
      setAssignError("Couldn’t fetch variations. Please try again.");
    } finally {
      setAssigning(false);
    }
  }, [studioInput]);

  const handleGenerate = useCallback(async () => {
    if (!variations || !selectedVariation?.id) return;
    setGenerating(true);
    setGenerateError(null);
    setArtifacts(null);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          variationId: selectedVariation.id,
          businessTypeId: variations.businessTypeId,
          styleVariation: variations.styleVariation,
          input: studioInput(),
        }),
      });
      const payload = (await response.json().catch(() => ({}))) as
        | ArtifactResponse
        | Record<string, unknown>;

      if (!response.ok) {
        throw new Error(
          (payload as { error?: string })?.error ??
            "Unable to generate kit.",
        );
      }

      setArtifacts(payload as ArtifactResponse);
    } catch (error) {
      console.error("[StudioClient] generate error", error);
      setGenerateError(
        error instanceof Error ? error.message : "Failed to generate kit.",
      );
    } finally {
      setGenerating(false);
    }
  }, [selectedVariation?.id, studioInput, variations]);

  const styleTokens = selectedVariation?.tokens ?? null;
  const heroTitle =
    selectedVariation?.preview.label ?? project.name;
  const heroSubtitle =
    (selectedVariation as unknown as { heroSubheadline?: string })
      ?.heroSubheadline ??
    variations?.variationSet.context.narrative.description_long ??
    brief;
  const heroCtas =
    variations?.variationSet.context.visual.primary_ctas ?? [
      { label: "Book a call" },
      { label: "See services" },
    ];
  const canGenerate =
    !!variations && !!selectedVariation?.id && !assigning && !generating;

  return (
    <div className="space-y-8" dir="auto">
      <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
            Project
          </p>
          <h2 className="text-2xl font-semibold text-neutral-900">
            {project.name}
          </h2>
          <p className="text-sm text-neutral-500">
            Slug:{" "}
            <code className="rounded bg-neutral-100 px-2 py-1 text-xs">
              {project.slug}
            </code>
          </p>
        </div>

        <div className="mt-6 space-y-3">
          <label
            htmlFor="studio-brief"
            className="text-xs font-semibold uppercase tracking-wide text-neutral-500"
          >
            Business brief / niche / tone
          </label>
          <textarea
            id="studio-brief"
            value={brief}
            onChange={(event) => setBrief(event.target.value)}
            rows={5}
            className="w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm text-neutral-900 focus:border-black focus:outline-none"
          />
          <p className="text-xs text-neutral-500">
            This feeds the MVP engine to pick palettes, typography, and hero
            copy.
          </p>
        </div>

        <div className="mt-6 flex flex-wrap gap-4">
          <button
            type="button"
            onClick={handleAssign}
            disabled={assigning}
            className="inline-flex items-center justify-center rounded-full bg-black px-6 py-3 text-sm font-semibold text-white transition hover:bg-neutral-900 disabled:cursor-not-allowed disabled:bg-neutral-400"
          >
            {assigning ? "Assigning to AI…" : "Assign to AI"}
          </button>
          <button
            type="button"
            onClick={handleGenerate}
            disabled={!canGenerate}
            className="inline-flex items-center justify-center rounded-full border border-neutral-200 px-6 py-3 text-sm font-semibold text-neutral-900 transition hover:border-neutral-900 hover:text-black disabled:cursor-not-allowed disabled:border-neutral-200 disabled:text-neutral-400"
          >
            {generating ? "Generating kit…" : "Generate full kit"}
          </button>
        </div>
        <p className="mt-2 text-xs text-neutral-500">
          {selectedVariation
            ? `Selected variation: ${selectedVariation.preview.label}`
            : "No variation selected yet."}
        </p>

        {generateError ? (
          <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
            {generateError}
          </p>
        ) : null}
      </div>

      <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-neutral-900">
            AI variations
          </h3>
          <span className="text-xs uppercase tracking-wide text-neutral-500">
            Select a direction
          </span>
        </div>
        {assignError ? (
          <p className="mt-4 text-sm text-red-600">{assignError}</p>
        ) : null}
        {assigning ? (
          <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={`skeleton-${index}`}
                className="h-44 animate-pulse rounded-2xl border border-neutral-200 bg-neutral-50"
              />
            ))}
          </div>
        ) : variationList.length ? (
          <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {variationList.map((variation) => (
              <VariationCard
                key={variation.id}
                variation={variation}
                selected={variation.id === selectedVariation?.id}
                onSelect={() => setSelectedVariationId(variation.id)}
              />
            ))}
          </div>
        ) : (
          <p className="mt-4 text-sm text-neutral-500">
            Run “Assign to AI” to preview palette, hero copy, and layout ideas
            for this project.
          </p>
        )}
      </section>

      <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-neutral-900">
            Style & palette
          </h3>
          <span className="text-xs uppercase tracking-wide text-neutral-500">
            Preview
          </span>
        </div>
        {styleTokens ? (
          <dl className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-neutral-100 bg-neutral-50/75 p-4">
              <dt className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                Palette
              </dt>
              <dd className="mt-2 font-semibold text-neutral-900">
                {styleTokens.palette_id}
              </dd>
            </div>
            <div className="rounded-xl border border-neutral-100 bg-neutral-50/75 p-4">
              <dt className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                Font pairing
              </dt>
              <dd className="mt-2 font-semibold text-neutral-900">
                {styleTokens.font_pair_id}
              </dd>
            </div>
            <div className="rounded-xl border border-neutral-100 bg-neutral-50/75 p-4">
              <dt className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                Layout density
              </dt>
              <dd className="mt-2 font-semibold text-neutral-900">
                {styleTokens.layout_density}
              </dd>
            </div>
            <div className="rounded-xl border border-neutral-100 bg-neutral-50/75 p-4">
              <dt className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                Corner style
              </dt>
              <dd className="mt-2 font-semibold text-neutral-900">
                {styleTokens.corner_style}
              </dd>
            </div>
          </dl>
        ) : (
          <p className="mt-4 text-sm text-neutral-500">
            Run “Assign to AI” to preview palette, fonts, and density for this
            project.
          </p>
        )}
      </section>

      <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-neutral-900">
            Hero preview
          </h3>
          {variations?.styleVariation ? (
            <span className="text-xs uppercase tracking-wide text-neutral-500">
              {variations.styleVariation}
            </span>
          ) : null}
        </div>
        <div className="mt-4 rounded-2xl border border-neutral-100 bg-gradient-to-b from-neutral-50 to-white p-6 shadow-inner">
          <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
            Headline
          </p>
          <h4 className="mt-2 text-2xl font-semibold text-neutral-900">
            {heroTitle}
          </h4>
          <p className="mt-3 text-sm text-neutral-600">{heroSubtitle}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            {heroCtas.slice(0, 2).map((cta, index) => (
              <span
                key={`${cta.label}-${index}`}
                className={`inline-flex items-center rounded-full px-4 py-2 text-xs font-semibold ${
                  index === 0
                    ? "bg-black text-white"
                    : "border border-neutral-300 text-neutral-700"
                }`}
              >
                {cta.label}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-neutral-900">Downloads</h3>
          <span className="text-xs uppercase tracking-wide text-neutral-500">
            theme.zip + static.zip
          </span>
        </div>
        {artifacts?.themeUrl && artifacts?.staticUrl ? (
          <div className="mt-4 flex flex-wrap gap-4">
            <a
              href={artifacts.themeUrl}
              className="inline-flex items-center rounded-full bg-black px-6 py-3 text-sm font-semibold text-white transition hover:bg-neutral-900"
            >
              Download WordPress theme (.zip)
            </a>
            <a
              href={artifacts.staticUrl}
              className="inline-flex items-center rounded-full border border-neutral-200 px-6 py-3 text-sm font-semibold text-neutral-900 transition hover:border-neutral-900 hover:text-black"
            >
              Download static site (.zip)
            </a>
          </div>
        ) : (
          <p className="mt-4 text-sm text-neutral-500">
            Run “Generate full kit” to unlock download links for this project’s
            WordPress theme and static export.
          </p>
        )}
      </section>
    </div>
  );
}


