'use client';

import React, { useEffect, useState } from 'react';

type BusinessType = {
  id: string;
  label: string;
  description?: string;
  styleVariation?: string; // used in the UI for preset label text
};

type Artifacts = {
  slug: string | null;
  themeZipPath: string | null;
  staticZipPath: string | null;
  themeUrl: string | null;
  staticUrl: string | null;
  businessTypeId?: string | null;
  styleVariation?: string | null;
  kitVersion?: string | null;
  siteArchetype?: string | null;
  navShell?: string | null;
};

type StageState = {
  inputsNormalized: boolean;
  variationsGenerated: boolean;
  variationSelected: boolean;
  kitsRequested: boolean;
  downloadsReady: boolean;
};

const initialStages: StageState = {
  inputsNormalized: false,
  variationsGenerated: false,
  variationSelected: false,
  kitsRequested: false,
  downloadsReady: false,
};

export default function MvpDemoPage() {
  // style presets / kit config
  const [businessTypes, setBusinessTypes] = useState<BusinessType[]>([]);
  const [selectedBusinessTypeId, setSelectedBusinessTypeId] = useState<string | null>(null);
  const [themeSlug, setThemeSlug] = useState<string>('presspilot-golden-foundation');

  // form data
  const [businessName, setBusinessName] = useState('Placeholder Co.');
  const [businessDescription, setBusinessDescription] = useState(
    'Describe the business in full sentences so the preview has real copy.'
  );
  const [primaryLanguage, setPrimaryLanguage] = useState('EN');
  const [businessCategory, setBusinessCategory] = useState<
    'service' | 'product' | 'nonprofit' | 'restaurant'
  >('service');

  // engine state
  const [stages, setStages] = useState<StageState>(initialStages);
  const [artifacts, setArtifacts] = useState<Artifacts>({
    slug: null,
    themeZipPath: null,
    staticZipPath: null,
    themeUrl: null,
    staticUrl: null,
    businessTypeId: null,
    styleVariation: null,
    kitVersion: null,
    siteArchetype: null,
    navShell: null,
  });

  const [isPreviewing, setIsPreviewing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDebug, setShowDebug] = useState(false);
  const [previewSummary, setPreviewSummary] = useState<string | null>(null);

  // load kit metadata + style presets
  useEffect(() => {
    async function loadKit() {
      try {
        const res = await fetch('/api/kit');
        if (!res.ok) throw new Error('Failed to load kit config');
        const json = await res.json();

        const types: BusinessType[] = ensureCorePresets(json.businessTypes ?? []);
        setBusinessTypes(types);

        if (types.length && !selectedBusinessTypeId) {
          setSelectedBusinessTypeId(types[0].id);
        }

        if (json.themeSlug) {
          setThemeSlug(json.themeSlug);
        }
      } catch (err: any) {
        console.error(err);
        setError('Could not load kit configuration.');
      }
    }

    loadKit();
  }, [selectedBusinessTypeId]);

  function resetEngineState() {
    setStages(initialStages);
    setArtifacts((prev) => ({
      ...prev,
      slug: null,
      themeZipPath: null,
      staticZipPath: null,
      themeUrl: null,
      staticUrl: null,
      kitVersion: null,
      styleVariation: null,
    }));
    setPreviewSummary(null);
    setError(null);
  }

  async function handlePreview() {
    if (!selectedBusinessTypeId) return;
    resetEngineState();
    setIsPreviewing(true);

    try {
      setStages((s) => ({ ...s, inputsNormalized: true }));

      const selectedStyleVariation =
        businessTypes.find((t) => t.id === selectedBusinessTypeId)?.styleVariation ?? null;

      const res = await fetch('/api/variations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessTypeId: selectedBusinessTypeId,
          styleVariation: selectedStyleVariation,
          input: {
            businessName,
            businessDescription,
            primaryLanguage,
            businessCategory,
          },
        }),
      });

      if (!res.ok) throw new Error('Preview request failed');

      await res.json(); // we don’t render the full variations here, only the hint

      setStages((s) => ({
        ...s,
        variationsGenerated: true,
        variationSelected: true,
      }));

      const label =
        businessTypes.find((t) => t.id === selectedBusinessTypeId)?.label ?? 'Selected style';

      setPreviewSummary(
        `Preview ready using “${label}” style for ${businessName} (${primaryLanguage}, ${businessCategory}).`
      );
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Preview failed.');
    } finally {
      setIsPreviewing(false);
    }
  }

  async function handleGenerate() {
    if (!selectedBusinessTypeId) return;
    resetEngineState();
    setIsGenerating(true);

    try {
      setStages((s) => ({ ...s, inputsNormalized: true }));

      const selectedStyleVariation =
        businessTypes.find((t) => t.id === selectedBusinessTypeId)?.styleVariation ?? null;

      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessTypeId: selectedBusinessTypeId,
          styleVariation: selectedStyleVariation,
          input: {
            businessName,
            businessDescription,
            primaryLanguage,
            businessCategory,
          },
        }),
      });

      if (!res.ok) throw new Error('Kit generation failed');

      const json = await res.json();

      setStages({
        inputsNormalized: true,
        variationsGenerated: true,
        variationSelected: true,
        kitsRequested: true,
        downloadsReady: true,
      });

      setArtifacts({
        slug: json.slug ?? null,
        themeZipPath: json.themeZipPath ?? null,
        staticZipPath: json.staticZipPath ?? null,
        themeUrl: json.themeUrl ?? null,
        staticUrl: json.staticUrl ?? null,
        businessTypeId: json.businessTypeId ?? selectedBusinessTypeId,
        styleVariation: json.styleVariation ?? null,
        kitVersion: json.kitVersion ?? null,
        siteArchetype: json.siteArchetype ?? null,
        navShell: json.navShell ?? null,
      });

      const label =
        businessTypes.find((t) => t.id === selectedBusinessTypeId)?.label ?? 'Selected style';

      setPreviewSummary(
        `Generated WordPress kit “${json.slug ?? themeSlug}” using “${label}” style.`
      );
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Generation failed.');
    } finally {
      setIsGenerating(false);
    }
  }

  const selectedStyle = businessTypes.find((t) => t.id === selectedBusinessTypeId);
  const heroPreviewTitle = businessName?.trim() || 'Your business name';
  const isRestaurant = selectedBusinessTypeId === 'restaurant_cafe';
  const isEcommerce = selectedBusinessTypeId === 'ecommerce_store';
  const heroPreviewSubtitle = isRestaurant
    ? 'Cozy wood-fired favorites · dine-in, pickup, and delivery.'
    : isEcommerce
    ? 'Launch drops, highlight best sellers, and showcase member perks.'
    : businessDescription?.trim() || 'Describe the business in full sentences so the preview has real copy.';
  const presetDescriptions: Record<string, string> = {
    saas: 'Bright blue / neutral palette.',
    'local-biz': 'Warm neutrals for community services.',
    ecommerce_store: 'Bold storefront styling.',
    'dark-pro': 'Dark-mode agency aesthetic.',
    restaurant_cafe: 'Warm terracotta and olive tones for dining rooms.',
  };
  const previewCtas = isRestaurant
    ? ['Book a table', 'View menu']
    : isEcommerce
    ? ['Shop best sellers', 'View catalog']
    : ['Primary CTA', 'Secondary CTA'];
  const previewHighlights = isRestaurant
    ? ['Menu-ready layouts', 'Reservation CTA', 'Delivery & pickup friendly']
    : isEcommerce
    ? ['Product storytelling', 'Promo-ready cards', 'Checkout friendly']
    : ['Navigation ready', 'Multilingual safe', 'Kit exports included'];
  const statusSteps = [
    { label: 'Inputs normalized', ok: stages.inputsNormalized },
    { label: 'Variations generated', ok: stages.variationsGenerated },
    { label: 'Variation selected', ok: stages.variationSelected },
    { label: 'Kits requested', ok: stages.kitsRequested },
    { label: 'Downloads ready', ok: stages.downloadsReady },
  ];

  return (
    <main className="min-h-screen bg-neutral-50">
      <div className="mx-auto flex min-h-screen max-w-5xl flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
        <header className="space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full bg-sky-50 px-3 py-1 text-xs font-medium text-sky-700">
            <span className="h-1.5 w-1.5 rounded-full bg-sky-500" />
            <span>PressPilot MVP Studio</span>
          </div>
          <h1 className="text-2xl font-semibold text-neutral-900 sm:text-3xl">
            Turn one form into a WordPress kit + static site.
          </h1>
          <p className="text-sm text-neutral-600">
            Internal playground. Golden Foundation v5 · Style-aware. Not for customers.
          </p>
        </header>

        {error && (
          <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700 shadow-sm">
            {error}
          </p>
        )}

        <section className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1.3fr)]">
          <div className="space-y-8 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <div>
              <div className="flex items-baseline justify-between gap-2">
                <h2 className="text-sm font-semibold text-neutral-900">1. Design style preset</h2>
                <p className="text-xs text-neutral-500">
                  Controls only the visual style applied to the Golden Foundation theme.
                </p>
              </div>
              {businessTypes.length === 0 ? (
                <p className="mt-4 text-xs text-neutral-500">Loading PressPilot kit catalog…</p>
              ) : (
                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  {businessTypes.map((type) => {
                    const selected = selectedBusinessTypeId === type.id;
                    return (
                      <button
                        key={type.id}
                        type="button"
                        onClick={() => {
                          setSelectedBusinessTypeId(type.id);
                          if (type.id === 'restaurant_cafe') {
                            setBusinessCategory('restaurant');
                          } else if (type.id === 'ecommerce_store') {
                            setBusinessCategory('product');
                          } else {
                            setBusinessCategory('service');
                          }
                          resetEngineState();
                        }}
                        className={`flex items-start justify-between rounded-xl border px-3 py-2 text-left text-sm transition ${
                          selected
                            ? 'border-sky-500 bg-sky-50 text-neutral-900'
                            : 'border-slate-200 bg-white text-neutral-800 hover:border-sky-400 hover:bg-sky-50'
                        }`}
                      >
                        <div>
                          <div className="font-medium">{type.label}</div>
                          <p className="text-xs text-neutral-500">
                            {presetDescriptions[type.id] || `${type.styleVariation} preset.`}
                          </p>
                        </div>
                        <span
                          className={`mt-1 h-2.5 w-2.5 rounded-full ${
                            selected ? 'bg-sky-500' : 'bg-slate-300'
                          }`}
                        />
                      </button>
                    );
                  })}
                </div>
              )}
              {selectedStyle && (
                <p className="mt-2 text-xs text-neutral-500">
                  {selectedStyle.label} · {selectedStyle.styleVariation}
                </p>
              )}
            </div>

            <div className="space-y-4">
              <div className="flex items-baseline justify-between gap-2">
                <h2 className="text-sm font-semibold text-neutral-900">2. Business info</h2>
                <p className="text-xs text-neutral-500">
                  These fields map one-to-one with the Stage 02 schema. This flows directly into the
                  generator.
                </p>
              </div>
              <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/60 p-4 text-xs text-neutral-600">
                Spec-only playground. Account + exports will drop in the next stage.
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="md:col-span-2 space-y-1">
                  <label className="text-xs font-medium text-neutral-700">Business name</label>
                  <input
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-100"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-neutral-700">Primary language</label>
                  <select
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-100"
                    value={primaryLanguage}
                    onChange={(e) => setPrimaryLanguage(e.target.value)}
                  >
                    <option value="EN">English</option>
                    <option value="AR">Arabic</option>
                    <option value="ES">Spanish</option>
                    <option value="FR">French</option>
                    <option value="DE">German</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-neutral-700">Business category</label>
                  <select
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-100"
                    value={businessCategory}
                    onChange={(e) =>
                      setBusinessCategory(
                        e.target.value as 'service' | 'product' | 'nonprofit' | 'restaurant'
                      )
                    }
                  >
                    <option value="service">Service</option>
                    <option value="product">Product</option>
                    <option value="nonprofit">Non-profit</option>
                    <option value="restaurant">Restaurant / Café</option>
                  </select>
                </div>
                <div className="md:col-span-2 space-y-1">
                  <label className="text-xs font-medium text-neutral-700">Business description</label>
                  <textarea
                    rows={4}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-100"
                    value={businessDescription}
                    onChange={(e) => setBusinessDescription(e.target.value)}
                    placeholder="Describe the business in full sentences so the preview has real copy."
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-sm font-semibold text-neutral-900">3. Run the engine</h2>
              <p className="text-xs text-neutral-500">
                Preview touches only the style layer. Generate builds the full WordPress theme +
                static kits.
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={handlePreview}
                  disabled={isPreviewing || isGenerating}
                  className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-neutral-800 shadow-sm hover:border-sky-400 hover:bg-sky-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isPreviewing ? 'Previewing…' : 'Preview designs'}
                </button>
                <button
                  type="button"
                  onClick={handleGenerate}
                  disabled={isGenerating || isPreviewing}
                  className="inline-flex items-center justify-center rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isGenerating ? 'Generating kits…' : 'Generate theme & static site'}
                </button>
              </div>
              {previewSummary && (
                <p className="text-xs text-neutral-500">Latest run: {previewSummary}</p>
              )}
            </div>
          </div>

          <div className="space-y-5 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-neutral-900">Preview shell</h3>
              <p className="text-xs text-neutral-500">
                Visual hint only. Real layout is rendered in WordPress using the Golden Foundation
                theme + patterns.
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-gradient-to-b from-white to-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                {primaryLanguage}
              </p>
              <h4 className="mt-2 text-lg font-semibold text-neutral-900">{heroPreviewTitle}</h4>
              <p className="mt-2 text-sm text-neutral-600">{heroPreviewSubtitle}</p>
              <div className="mt-4 flex flex-wrap gap-2 text-xs font-medium">
                <span className="rounded-full bg-sky-600 px-3 py-1 text-white">{previewCtas[0]}</span>
                <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-neutral-700">
                  {previewCtas[1]}
                </span>
              </div>
              <div className="mt-4 grid gap-2 text-xs text-neutral-500">
                {previewHighlights.map((feature) => (
                  <div key={feature} className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-sky-400" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-neutral-900">Final downloads</h3>
              <p className="text-xs text-neutral-500">Links appear after a successful generation.</p>
            </div>
            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
              <button
                type="button"
                disabled={!artifacts.themeUrl}
                onClick={() => artifacts.themeUrl && window.open(artifacts.themeUrl, '_blank')}
                className={`flex items-center justify-between rounded-lg border px-3 py-2 text-xs font-medium shadow-sm transition ${
                  artifacts.themeUrl
                    ? 'border-sky-300 bg-sky-50 text-sky-700 hover:bg-sky-100'
                    : 'border-slate-200 bg-slate-50 text-slate-400'
                }`}
              >
                <span>WordPress theme (.zip)</span>
                <span>{artifacts.themeUrl ? 'Download' : 'Generate to unlock'}</span>
              </button>
              <button
                type="button"
                disabled={!artifacts.staticUrl}
                onClick={() => artifacts.staticUrl && window.open(artifacts.staticUrl, '_blank')}
                className={`flex items-center justify-between rounded-lg border px-3 py-2 text-xs font-medium shadow-sm transition ${
                  artifacts.staticUrl
                    ? 'border-sky-300 bg-sky-50 text-sky-700 hover:bg-sky-100'
                    : 'border-slate-200 bg-slate-50 text-slate-400'
                }`}
              >
                <span>Static site (HTML/CSS/JS)</span>
                <span>{artifacts.staticUrl ? 'Download' : 'Generate to unlock'}</span>
              </button>
            </div>
          </div>
        </section>

        <section className="pb-6">
          <button
            type="button"
            onClick={() => setShowDebug((v) => !v)}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-neutral-700 shadow-sm hover:border-sky-400 hover:bg-sky-50"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            <span>{showDebug ? 'Hide developer debug' : 'Developer debug · OS view for Mort'}</span>
          </button>

          {showDebug && (
            <div className="mt-3 space-y-4 rounded-2xl bg-slate-950 p-4 text-xs text-slate-100 shadow-sm">
              <div>
                <h4 className="text-sm font-semibold text-white">Engine status</h4>
                <ol className="mt-2 space-y-1">
                  {statusSteps.map((step) => (
                    <li key={step.label}>
                      <StatusDot ok={step.ok} /> {step.label}
                    </li>
                  ))}
                </ol>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">Artifacts</h4>
                <pre className="mt-2 max-h-56 overflow-auto rounded-lg bg-black/60 px-3 py-2 font-mono text-[11px] text-emerald-200">
                  {JSON.stringify(artifacts, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function StatusDot({ ok }: { ok: boolean }) {
  return (
    <span
      className={['mr-2 inline-block h-2 w-2 rounded-full', ok ? 'bg-emerald-500' : 'bg-slate-300'].join(
        ' '
      )}
    />
  );
}

function ensureCorePresets(types: BusinessType[]): BusinessType[] {
  const requiredPresets: BusinessType[] = [
    {
      id: 'restaurant_cafe',
      label: 'Restaurant / Café',
      description: 'Designed for dining experiences',
      styleVariation: 'restaurant-soft',
    },
    {
      id: 'ecommerce_store',
      label: 'E-Commerce Store',
      description: 'Product-focused layout for online shops.',
      styleVariation: 'ecom-bold',
    },
  ];

  return requiredPresets.reduce((list, preset) => {
    if (list.some((type) => type.id === preset.id)) {
      return list;
    }
    return [...list, preset];
  }, types);
}


