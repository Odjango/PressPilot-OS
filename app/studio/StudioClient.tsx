"use client";

import { useCallback, useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import type { PressPilotVariationSet, VariationId } from "@/types/presspilot";
import type { StudioFormInput } from "@/lib/presspilot/studioAdapter";
import {
  BUSINESS_CATEGORIES,
  type BusinessCategoryId,
  getBusinessCategoryById,
} from '@/app/mvp-demo/businessCategories';
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
  slug: string;
};

const DEFAULT_LANGUAGE = "en";
const DEFAULT_CATEGORY = "service";

export default function StudioClient({ slug }: Props) {
  const router = useRouter();
  const [project, setProject] = useState<StudioProject | null>(null);
  const [loadingProject, setLoadingProject] = useState(true);
  const [projectError, setProjectError] = useState<string | null>(null);

  const [brief, setBrief] = useState("");
  const [selectedBusinessCategoryId, setSelectedBusinessCategoryId] =
    useState<BusinessCategoryId | null>('local_service');
  const [assigning, setAssigning] = useState(false);
  const [assignError, setAssignError] = useState<string | null>(null);
  const [variations, setVariations] = useState<VariationResponse | null>(null);
  const [selectedVariationId, setSelectedVariationId] = useState<
    VariationId | null
  >(null);

  const [generating, setGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);
  const [artifacts, setArtifacts] = useState<ArtifactResponse | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadProject() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          // If no session, redirect to auth (client-side check)
          router.replace('/auth');
          return;
        }

        const { data, error } = await supabase
          .from('pp_projects')
          .select('id,owner_email,name,slug,status,created_at')
          .eq('slug', slug)
          .maybeSingle();

        if (!mounted) return;

        if (error) throw error;
        if (!data) throw new Error('Project not found');

        setProject(data as StudioProject);

        // Set default brief based on loaded project
        setBrief(
          `${data.name} needs a polished WordPress kit with modern hero copy, clear CTAs, and a tone that matches a premium web studio.`
        );
      } catch (err) {
        console.error('[StudioClient] loadProject error', err);
        if (mounted) {
          setProjectError('Unable to load project. It may not exist or you do not have permission.');
        }
      } finally {
        if (mounted) setLoadingProject(false);
      }
    }

    loadProject();

    return () => {
      mounted = false;
    };
  }, [slug, router]);

  if (loadingProject) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-neutral-200 border-t-black mx-auto mb-4"></div>
          <p className="text-sm text-neutral-500">Loading studio...</p>
        </div>
      </div>
    );
  }

  if (projectError || !project) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-12">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
          <h3 className="text-lg font-semibold text-red-800 mb-2">Access Error</h3>
          <p className="text-sm text-red-600 mb-6">{projectError ?? 'Project not found'}</p>
          <button
            onClick={() => router.push('/projects')}
            className="inline-flex items-center rounded-full bg-white border border-red-200 px-6 py-2 text-sm font-semibold text-red-700 hover:bg-red-50 transition"
          >
            Return to Projects
          </button>
        </div>
      </div>
    );
  }

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
      businessName: project?.name ?? '',
      businessDescription: brief,
      primaryLanguage: DEFAULT_LANGUAGE,
      businessCategory: DEFAULT_CATEGORY,
    };
  }, [project?.name, brief]);

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
      const category = getBusinessCategoryById(selectedBusinessCategoryId);
      const wpImportPreset = category
        ? {
          menu: category.defaultMenu,
          pages: category.defaultPages,
          frontPageSlug: 'home' as const,
        }
        : null;

      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          variationId: selectedVariation.id,
          businessTypeId: variations.businessTypeId,
          styleVariation: variations.styleVariation,
          businessCategoryId: selectedBusinessCategoryId,
          wpImportPreset,
          input: studioInput(),
        }),
      });
      const payload = (await response.json().catch(() => ({}))) as
        | ArtifactResponse
        | Record<string, unknown>;

      if (!response.ok) {
        const errorPayload = payload as { error?: string; details?: string };
        const errorMessage = errorPayload.error ?? "Unable to generate kit.";
        const errorDetails = errorPayload.details ? ` (${errorPayload.details})` : "";
        throw new Error(errorMessage + errorDetails);
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
          <label className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
            Business Category
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {BUSINESS_CATEGORIES.map((cat) => {
              const selected = cat.id === selectedBusinessCategoryId;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedBusinessCategoryId(cat.id)}
                  className={[
                    'text-left rounded-xl border px-3 py-3 transition',
                    selected
                      ? 'border-emerald-400 bg-emerald-50 shadow-sm'
                      : 'border-neutral-200 hover:border-neutral-400 hover:bg-neutral-50',
                  ].join(' ')}
                >
                  <div className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                    {cat.shortLabel}
                  </div>
                  <div className="mt-1 text-sm font-medium text-neutral-900">
                    {cat.label}
                  </div>
                </button>
              );
            })}
          </div>
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
                className={`inline-flex items-center rounded-full px-4 py-2 text-xs font-semibold ${index === 0
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


