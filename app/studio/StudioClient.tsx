"use client";

import { useCallback, useMemo, useState, useEffect, useRef } from "react";
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
import { HeroCarousel } from "@/src/components/HeroCarousel";
import ColorPalettePreview from "./components/ColorPalettePreview";
import FontStylePreview, { getFontStyles } from "./components/FontStylePreview";
import { PALETTES, FONT_PROFILE_OPTIONS, HERO_LAYOUT_OPTIONS, BRAND_STYLE_OPTIONS, getPreviewColors, type TT4FontProfile, type TT4PaletteId, type TT4HeroLayout, type TT4BrandStyle, type PreviewColors } from "@/lib/theme/palettes";
import MenuUploader from "./components/MenuUploader";
import LogoUploader from "./components/LogoUploader";
import { RestaurantMenu } from "@/src/generator/types";
import StepProgress from "./components/StepProgress";
import { ArrowLeft, ArrowRight, Wand2, Download, CheckCircle2, Sparkles, Info, X, Loader2, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";

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

  // Customization State
  const [customHeroTitle, setCustomHeroTitle] = useState<string>("");
  const [customPaletteId, setCustomPaletteId] = useState<string | null>(null);
  const [customFontPairId, setCustomFontPairId] = useState<string | null>(null);
  const [customLogoBase64, setCustomLogoBase64] = useState<string>("");
  const [logoColors, setLogoColors] = useState<string[]>([]);

  // Brand Kit Preservation - store original logo colors separately from palette customizations
  const [originalBrandKitColors, setOriginalBrandKitColors] = useState<string[]>([]);
  const [paletteOverrides, setPaletteOverrides] = useState<{paletteId: string, colors: string[]} | null>(null);

  // TT4-Aligned Design System State
  const [selectedFontProfile, setSelectedFontProfile] = useState<TT4FontProfile>('modern');
  const [selectedHeroLayout, setSelectedHeroLayout] = useState<TT4HeroLayout>('fullBleed');
  const [selectedBrandStyle, setSelectedBrandStyle] = useState<TT4BrandStyle>('playful');

  const [generating, setGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);
  const [artifacts, setArtifacts] = useState<ArtifactResponse | null>(null);
  const [menus, setMenus] = useState<RestaurantMenu[]>([]);

  // Contact Information State (Phase 13 - Best Practices)
  const [contactEmail, setContactEmail] = useState<string>("");
  const [contactPhone, setContactPhone] = useState<string>("");
  const [contactAddress, setContactAddress] = useState<string>("");
  const [contactCity, setContactCity] = useState<string>("");
  const [contactState, setContactState] = useState<string>("");
  const [contactZip, setContactZip] = useState<string>("");
  const [socialFacebook, setSocialFacebook] = useState<string>("");
  const [socialInstagram, setSocialInstagram] = useState<string>("");
  const [showContactFields, setShowContactFields] = useState<boolean>(false);

  // Hero Preview State (Phase 10)
  const [heroPreviewLoading, setHeroPreviewLoading] = useState(false);
  const [heroPreviewError, setHeroPreviewError] = useState<string | null>(null);
  const [heroPreviews, setHeroPreviews] = useState<Array<{
    layout: TT4HeroLayout;
    screenshotUrl: string;
    label: string;
    description: string;
  }> | null>(null);
  const [previewSessionId, setPreviewSessionId] = useState<string | null>(null);

  // Refs for Color Pickers
  const colorPickerRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Store original brand kit colors when logo colors are first extracted
  useEffect(() => {
    if (logoColors.length > 0 && originalBrandKitColors.length === 0) {
      setOriginalBrandKitColors([...logoColors]);
    }
  }, [logoColors, originalBrandKitColors.length]);

  // Compute preview colors based on palette selection
  // Handles both Brand Kit and palette override colors
  const previewColors = useMemo(() => {
    // If using a customized preset palette, use the override colors
    if (paletteOverrides && customPaletteId === paletteOverrides.paletteId + '-custom') {
      return getPreviewColors('brand', paletteOverrides.colors);
    }
    return getPreviewColors(customPaletteId, logoColors);
  }, [customPaletteId, logoColors, paletteOverrides]);

  // Live Preview Renderer
  const renderHeroPreview = (styleId: string, label: string, description: string) => {
    // Colors
    const primary = logoColors[0] || '#000000';
    const secondary = logoColors[1] || '#ffffff';
    const accent = logoColors[2] || '#666666';

    const Logo = () => customLogoBase64 ? (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={customLogoBase64} alt="Brand Logo" className="h-16 w-auto object-contain max-w-[200px]" />
    ) : (
      <div className="text-2xl font-black tracking-tighter" style={{ color: primary }}>LOGO</div>
    );

    // Variation A: SPLIT (Balanced)
    if (styleId === 'variation_a') {
      return (
        <div className="w-full h-full flex bg-neutral-50 relative overflow-hidden">
          {/* Left Content */}
          <div className="w-1/2 flex flex-col justify-center p-12 z-10">
            <div className="mb-6"><Logo /></div>
            <h3 className="text-4xl font-black mb-4 leading-tight text-neutral-900">
              {customHeroTitle || label}
            </h3>
            <p className="text-sm font-medium text-neutral-500 mb-8 max-w-sm leading-relaxed">
              {description}
            </p>
            <div className="flex gap-3">
              <div className="px-6 py-2.5 rounded-lg text-sm font-bold shadow-lg transform hover:-translate-y-1 transition-transform" style={{ backgroundColor: primary, color: '#fff' }}>
                Get Started
              </div>
              <div className="px-6 py-2.5 rounded-lg text-sm font-bold border-2" style={{ borderColor: isLight(secondary) ? '#e5e5e5' : secondary, color: primary }}>
                Learn More
              </div>
            </div>
          </div>
          {/* Right Visual */}
          <div className="w-1/2 relative bg-white">
            <div className="absolute inset-0 opacity-10" style={{
              backgroundImage: `radial-gradient(${accent} 1px, transparent 1px)`,
              backgroundSize: '20px 20px'
            }} />
            <div className="absolute inset-0 flex items-center justify-center">
              {customLogoBase64 ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={customLogoBase64} alt="Brand Graphic" className="w-2/3 h-auto opacity-90 drop-shadow-2xl transform rotate-3 scale-110" />
              ) : (
                <div className="w-64 h-64 rounded-full flex items-center justify-center text-4xl font-black opacity-10" style={{ backgroundColor: primary, color: 'white' }}>
                  IMG
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }

    if (styleId === 'variation_b') {
      return (
        <div className="w-full h-full relative overflow-hidden flex flex-col justify-center items-center text-center p-12"
          style={{ backgroundColor: primary }}
        >
          {/* Background Abstract */}
          <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
            <div className="absolute -top-20 -left-20 w-96 h-96 rounded-full blur-3xl mix-blend-overlay" style={{ backgroundColor: accent }} />
            <div className="absolute top-1/2 right-0 w-80 h-80 rounded-full blur-3xl mix-blend-overlay" style={{ backgroundColor: secondary }} />
          </div>

          <div className="relative z-10 max-w-2xl bg-white/10 backdrop-blur-md p-12 rounded-3xl border border-white/10 shadow-2xl">
            <div className="flex justify-center mb-6 scale-90 opacity-90 brightness-200 contrast-200 grayscale">
              <Logo />
            </div>
            <h3 className="text-4xl font-black mb-4 leading-tight text-white drop-shadow-md">
              {customHeroTitle || label}
            </h3>
            <p className="text-sm font-medium text-white/80 mb-8 leading-relaxed max-w-lg mx-auto">
              {description}
            </p>
            <div className="px-8 py-3 rounded-full text-sm font-bold shadow-xl transform hover:scale-105 transition-transform inline-block"
              style={{
                backgroundColor: secondary,
                color: isLight(secondary) ? '#000' : '#fff'
              }}>
              Explore Now
            </div>
          </div>
        </div>
      );
    }

    // Variation C: MINIMAL (Clean)
    return (
      <div className="w-full h-full bg-white flex flex-col items-center justify-center relative p-12">
        <div className="absolute top-0 w-full h-2" style={{ background: `linear-gradient(to right, ${primary}, ${accent})` }} />

        <div className="text-center max-w-xl">
          <div className="mb-8 flex justify-center scale-110 transition-transform duration-700 hover:rotate-6">
            <Logo />
          </div>

          <div className="space-y-4">
            <span className="text-[10px] font-black tracking-[0.2em] uppercase text-neutral-400">Welcome to</span>
            <h3 className="text-5xl font-black tracking-tighter text-neutral-900">
              {project?.name || 'Your Brand'}
            </h3>
          </div>

          <div className="mt-12 flex justify-center gap-8">
            <div className="text-center group cursor-pointer">
              <div className="w-12 h-12 rounded-2xl bg-neutral-50 flex items-center justify-center mb-2 group-hover:bg-black group-hover:text-white transition-colors">
                <ArrowRight className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Services</span>
            </div>
            <div className="text-center group cursor-pointer">
              <div className="w-12 h-12 rounded-2xl bg-neutral-50 flex items-center justify-center mb-2 group-hover:bg-black group-hover:text-white transition-colors">
                <ArrowRight className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Contact</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Helper for text contrast
  const isLight = (color: string) => {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const brightness = ((r * 299) + (g * 587) + (b * 114)) / 1000;
    return brightness > 155;
  };

  // Geometric SVG icon for hero layout selection - matches user's design
  const HeroLayoutIcon = ({ layout }: { layout: TT4HeroLayout }) => {
    const iconClass = "w-full h-full";
    // Colors matching the user's design
    const bgColor = "#1e293b";      // Dark slate background
    const heroColor = "#4ade80";    // Emerald green for hero areas
    const textColor = "#166534";    // Dark green for text lines

    switch (layout) {
      case 'fullBleed':
        // Large green area filling most of the icon with centered text lines
        return (
          <svg viewBox="0 0 80 80" className={iconClass}>
            <rect x="0" y="0" width="80" height="80" rx="12" fill={bgColor}/>
            <rect x="8" y="8" width="64" height="64" rx="4" fill={heroColor}/>
            <rect x="20" y="32" width="40" height="4" rx="1" fill={textColor}/>
            <rect x="26" y="42" width="28" height="3" rx="1" fill={textColor} opacity="0.7"/>
          </svg>
        );
      case 'fullWidth':
        // Header bar, green band in middle, footer bar
        return (
          <svg viewBox="0 0 80 80" className={iconClass}>
            <rect x="0" y="0" width="80" height="80" rx="12" fill={bgColor}/>
            <rect x="8" y="8" width="64" height="10" rx="2" fill={heroColor} opacity="0.4"/>
            <rect x="8" y="24" width="64" height="32" rx="2" fill={heroColor}/>
            <rect x="24" y="38" width="32" height="4" rx="1" fill={textColor}/>
            <rect x="8" y="62" width="64" height="10" rx="2" fill={heroColor} opacity="0.4"/>
          </svg>
        );
      case 'split':
        // Header, left text with button, right image area, footer
        return (
          <svg viewBox="0 0 80 80" className={iconClass}>
            <rect x="0" y="0" width="80" height="80" rx="12" fill={bgColor}/>
            <rect x="8" y="8" width="64" height="8" rx="2" fill={heroColor} opacity="0.4"/>
            {/* Left side - text lines */}
            <rect x="10" y="24" width="24" height="3" rx="1" fill={heroColor}/>
            <rect x="10" y="30" width="20" height="2" rx="1" fill={heroColor} opacity="0.6"/>
            <rect x="10" y="35" width="18" height="2" rx="1" fill={heroColor} opacity="0.6"/>
            <rect x="10" y="44" width="14" height="6" rx="2" fill={heroColor}/>
            {/* Right side - image area */}
            <rect x="42" y="20" width="30" height="36" rx="4" fill={heroColor}/>
            {/* Footer */}
            <rect x="8" y="64" width="64" height="8" rx="2" fill={heroColor} opacity="0.4"/>
          </svg>
        );
      case 'minimal':
        // Centered text lines and button only
        return (
          <svg viewBox="0 0 80 80" className={iconClass}>
            <rect x="0" y="0" width="80" height="80" rx="12" fill={bgColor}/>
            <rect x="18" y="24" width="44" height="4" rx="1" fill={heroColor}/>
            <rect x="26" y="34" width="28" height="3" rx="1" fill={heroColor} opacity="0.6"/>
            <rect x="28" y="50" width="24" height="8" rx="3" fill={heroColor}/>
          </svg>
        );
    }
  };

  const [currentStep, setCurrentStep] = useState(1);
  const [jobId, setJobId] = useState<string | null>(null);
  const [jobStatus, setJobStatus] = useState<string>("pending");
  const [pollCount, setPollCount] = useState(0);

  // Polling logic for Step 5 (Deliver)
  useEffect(() => {
    if (currentStep === 5 && jobId && jobStatus !== "completed" && jobStatus !== "failed") {
      const timer = setTimeout(async () => {
        try {
          const res = await fetch(`/api/status?id=${jobId}`);
          if (!res.ok) return;
          const data = await res.json();
          setJobStatus(data.status);

          if (data.status === "completed") {
            setArtifacts({
              themeUrl: data.themeUrl,
              staticUrl: data.staticUrl,
              slug: data.project_id
            });
            toast.success("Generation complete! Your kit is ready.");
          } else if (data.status === "failed") {
            toast.error("Generation failed. Please try again.");
          }

          setPollCount(prev => prev + 1);
        } catch (err) {
          console.error("Polling error:", err);
        }
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [currentStep, jobId, jobStatus, pollCount]);

  const steps = [
    { id: 1, label: "Context" },
    { id: 2, label: "Homepage" },
    { id: 3, label: "Refine" },
    { id: 4, label: "Preview" },
    { id: 5, label: "Deliver" }
  ];



  const variationList = useMemo(
    () => variations?.variationSet.variations ?? [],
    [variations]
  );

  const updateBrandColor = (index: number, newColor: string) => {
    const next = [...logoColors];
    next[index] = newColor;
    setLogoColors(next);
    setCustomPaletteId('brand');
  };

  // Copy preset palette colors for customization WITHOUT overwriting Brand Kit
  const copyPaletteToLogoColors = (paletteId: string) => {
    const palette = PALETTES.find(p => p.id === paletteId);
    if (!palette) return;

    const getColor = (slug: string) => palette.colors.find(c => c.slug === slug)?.color;

    // Map to 3-color array matching logoColors structure
    const newColors = [
      getColor('accent') || '#374151',      // Primary -> accent
      getColor('accent-3') || '#1F2937',    // Secondary -> accent-3
      getColor('accent-4') || '#9CA3AF',    // Tertiary -> accent-4 (pop color)
    ];

    // Store as palette override instead of overwriting logoColors
    setPaletteOverrides({ paletteId, colors: newColors });
    setCustomPaletteId(paletteId + '-custom'); // e.g., 'saas-bright-custom'
  };

  // Restore original Brand Kit colors
  const restoreBrandKit = () => {
    if (originalBrandKitColors.length > 0) {
      setLogoColors([...originalBrandKitColors]);
    }
    setPaletteOverrides(null);
    setCustomPaletteId('brand');
  };

  // Update palette override colors (when editing a customized preset)
  const updatePaletteOverrideColor = (index: number, newColor: string) => {
    if (!paletteOverrides) return;
    const newColors = [...paletteOverrides.colors];
    newColors[index] = newColor;
    setPaletteOverrides({ ...paletteOverrides, colors: newColors });
  };

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

  // Sync customization state when variation changes
  useEffect(() => {
    if (selectedVariation) {
      // Only set hero title if not already customized
      if (!customHeroTitle) {
        setCustomHeroTitle(project?.name || selectedVariation.preview.label);
      }
      setCustomFontPairId(selectedVariation.tokens.font_pair_id);

      // Default to Brand Kit if colors were extracted, otherwise use variation default
      if (logoColors.length > 0) {
        setCustomPaletteId('brand');
      } else {
        setCustomPaletteId(selectedVariation.tokens.palette_id);
      }
    }
  }, [selectedVariation, logoColors.length]);

  const studioInput = useCallback((): StudioFormInput => {
    // Check if using a customized preset palette (ends with '-custom')
    const isCustomizedPreset = customPaletteId?.endsWith('-custom');
    const basePaletteId = isCustomizedPreset
      ? customPaletteId.replace('-custom', '')
      : customPaletteId;

    // Map UI palette selection to TT4 palette ID
    const selectedPaletteId: TT4PaletteId | undefined = customPaletteId === 'brand'
      ? 'brand-kit'
      : isCustomizedPreset
        ? 'brand-kit' // Customized presets use brand-kit mode with override colors
        : (basePaletteId as TT4PaletteId) || undefined;

    // Build userEditedBrandKit from appropriate color source
    let userEditedBrandKit;
    if (isCustomizedPreset && paletteOverrides) {
      // Using customized preset colors
      userEditedBrandKit = [
        { slot: 'primary' as const, hex: paletteOverrides.colors[0] },
        { slot: 'accent' as const, hex: paletteOverrides.colors[2] || paletteOverrides.colors[1] },
        { slot: 'background' as const, hex: '#ffffff' }
      ];
    } else if (customPaletteId === 'brand' && logoColors.length > 0) {
      // Using original brand kit colors
      userEditedBrandKit = [
        { slot: 'primary' as const, hex: logoColors[0] },
        { slot: 'accent' as const, hex: logoColors[2] || logoColors[1] },
        { slot: 'background' as const, hex: '#ffffff' }
      ];
    }

    return {
      businessName: project?.name ?? '',
      businessDescription: brief,
      primaryLanguage: DEFAULT_LANGUAGE,
      businessCategory: selectedBusinessCategoryId || DEFAULT_CATEGORY,
      slug: project?.slug,
      heroTitle: customHeroTitle,
      paletteId: customPaletteId ?? undefined,
      fontPairId: customFontPairId ?? undefined,
      logoBase64: customLogoBase64 || undefined,
      palette: logoColors.length > 0 ? {
        primary: logoColors[0],
        secondary: logoColors[1],
        accent: logoColors[2]
      } : undefined,
      menus: menus.length > 0 ? menus : undefined,

      // TT4-Aligned Design System Fields
      selectedPaletteId,
      userEditedBrandKit,
      fontProfile: selectedFontProfile,
      heroLayout: selectedHeroLayout,
      // Restaurant-only: brandStyle determines Tove (playful) vs Frost (modern)
      brandStyle: selectedBusinessCategoryId === 'restaurant_cafe' ? selectedBrandStyle : undefined,

      // Contact Information (Phase 13 - Best Practices)
      contactEmail: contactEmail || undefined,
      contactPhone: contactPhone || undefined,
      contactAddress: contactAddress || undefined,
      contactCity: contactCity || undefined,
      contactState: contactState || undefined,
      contactZip: contactZip || undefined,
      socialLinks: (socialFacebook || socialInstagram) ? {
        facebook: socialFacebook || undefined,
        instagram: socialInstagram || undefined
      } : undefined
    };
  }, [project?.name, project?.slug, brief, customHeroTitle, customPaletteId, customFontPairId, customLogoBase64, logoColors, menus, selectedBusinessCategoryId, selectedFontProfile, selectedHeroLayout, selectedBrandStyle, paletteOverrides, contactEmail, contactPhone, contactAddress, contactCity, contactState, contactZip, socialFacebook, socialInstagram]);

  // Handler for generating hero previews (Phase 10)
  const handleGeneratePreviews = useCallback(async () => {
    setHeroPreviewLoading(true);
    setHeroPreviewError(null);
    setHeroPreviews(null);

    try {
      const response = await fetch('/api/studio/hero-previews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input: studioInput() })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.details || 'Preview generation failed');
      }

      const data = await response.json();
      setHeroPreviews(data.previews);
      setPreviewSessionId(data.sessionId);
      setCurrentStep(4); // Advance to Hero Preview step
      toast.success("Hero previews generated! Select your favorite layout.");

    } catch (error) {
      console.error('[StudioClient] preview generation error:', error);
      const message = error instanceof Error ? error.message : 'Failed to generate previews';
      setHeroPreviewError(message);
      toast.error(message);
    } finally {
      setHeroPreviewLoading(false);
    }
  }, [studioInput]);

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
      // Auto-advance to step 2 on success
      setCurrentStep(2);
      toast.success("Design directions generated!");
    } catch (error) {
      console.error("[StudioClient] variations error", error);
      setAssignError("Couldn’t fetch variations. Please try again.");
      toast.error("Couldn't fetch variations.");
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
      const payload = (await response.json().catch(() => ({}))) as any;

      if (!response.ok) {
        throw new Error(payload.error || "Unable to start generation.");
      }

      setJobId(payload.jobId);
      setJobStatus("pending");

      // Advance to step 5 (Deliver) on success
      setCurrentStep(5);
      toast.success("Theme generation started!");
    } catch (error) {
      console.error("[StudioClient] generate error", error);
      setGenerateError(
        error instanceof Error ? error.message : "Failed to generate kit.",
      );
      toast.error("Failed to start generation.");
    } finally {
      setGenerating(false);
    }
  }, [selectedVariation?.id, studioInput, variations, selectedBusinessCategoryId]);


  useEffect(() => {
    let mounted = true;

    async function loadProject() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const accessToken = session?.access_token || 'bypass-token';

        // Fetch project via API which handles bypass logic
        const response = await fetch(`/api/projects?slug=${slug}`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.error || 'Failed to load project');
        }

        const { project: data } = await response.json();

        if (!mounted) return;

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
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-700 border-t-white mx-auto mb-4"></div>
          <p className="text-sm text-slate-400">Loading studio...</p>
        </div>
      </div>
    );
  }

  if (projectError || !project) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-12">
        <div className="rounded-2xl border border-red-900/50 bg-red-950/50 p-6 text-center">
          <h3 className="text-lg font-semibold text-red-400 mb-2">Access Error</h3>
          <p className="text-sm text-red-300 mb-6">{projectError ?? 'Project not found'}</p>
          <button
            onClick={() => router.push('/projects')}
            className="inline-flex items-center rounded-full bg-slate-800 border border-red-900/50 px-6 py-2 text-sm font-semibold text-red-400 hover:bg-slate-700 transition"
          >
            Return to Projects
          </button>
        </div>
      </div>
    );
  }

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
    <div className="max-w-4xl mx-auto" dir="auto">
      <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6 px-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-[10px] font-bold text-slate-950 shadow-lg">PP</span>
            <span className="text-xs font-black uppercase tracking-[0.3em] text-slate-500">PressPilot Studio</span>
          </div>
          <h1 className="text-4xl font-black text-white tracking-tight">
            {project.name}
          </h1>
          <p className="text-sm font-medium text-slate-500">
            Project ID: <span className="font-mono">{project.id.slice(0, 8)}</span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest leading-none">Status</span>
            <span className="text-xs font-black text-emerald-400 uppercase tracking-wider">{project.status}</span>
          </div>
          <div className="h-10 w-[1px] bg-slate-800 hidden sm:block mx-2" />
          <button
            onClick={() => router.push('/projects')}
            className="rounded-xl border border-slate-700 bg-slate-900 px-5 py-2.5 text-xs font-bold text-slate-300 hover:border-white hover:text-white transition-all"
          >
            Dashboard
          </button>
        </div>
      </div>

      <StepProgress steps={steps} currentStep={currentStep} />

      <div className="min-h-[400px]">
        {/* STEP 1: CONTEXT */}
        {currentStep === 1 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="rounded-3xl border border-slate-800 bg-slate-900 p-8">
              <div className="flex flex-col gap-2 mb-8">
                <p className="text-xs font-bold uppercase tracking-widest text-slate-500">
                  Step 1: The Vision
                </p>
                <h2 className="text-3xl font-bold text-white">
                  Define your business
                </h2>
              </div>

              <div className="space-y-8">
                <div className="space-y-4">
                  <label className="text-sm font-bold text-white flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded bg-white text-[10px] text-slate-950">1</span>
                    Business Category
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {BUSINESS_CATEGORIES.map((cat) => {
                      const selected = cat.id === selectedBusinessCategoryId;
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => setSelectedBusinessCategoryId(cat.id)}
                          className={`text-left rounded-2xl border p-4 transition-all duration-300 group ${selected
                            ? 'border-emerald-500 bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 scale-[1.02]'
                            : 'border-slate-700 hover:border-emerald-500/50 bg-slate-800/50'
                            }`}
                        >
                          <div className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${selected ? 'text-emerald-100' : 'text-slate-500'}`}>
                            {cat.shortLabel}
                          </div>
                          <div className="text-base font-bold text-white">
                            {cat.label}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-4">
                  <label htmlFor="studio-brief" className="text-sm font-bold text-white flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded bg-white text-[10px] text-slate-950">2</span>
                    The Brief
                  </label>
                  <textarea
                    id="studio-brief"
                    value={brief}
                    onChange={(event) => setBrief(event.target.value)}
                    rows={5}
                    placeholder="Describe the personality of your business..."
                    className="w-full rounded-2xl border border-slate-700 bg-slate-800/50 px-6 py-4 text-base text-white placeholder:text-slate-500 focus:border-white focus:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-white/5 transition-all"
                  />
                  <p className="text-xs text-slate-500 italic">
                    PressPilot uses this to select the perfect typography and color palettes.
                  </p>
                </div>

                <div className="pt-2">
                  <LogoUploader
                    value={customLogoBase64}
                    onChange={(val, colors) => {
                      setCustomLogoBase64(val);
                      if (colors) setLogoColors(colors);
                    }}
                  />
                </div>

                {/* Contact Information Section (Phase 13 - Best Practices) */}
                <div className="pt-4 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowContactFields(!showContactFields)}
                    className="w-full flex items-center justify-between text-left"
                  >
                    <label className="text-sm font-bold text-white flex items-center gap-2 cursor-pointer">
                      <span className="flex h-5 w-5 items-center justify-center rounded bg-slate-600 text-[10px] text-white">3</span>
                      Contact Info
                      <span className="text-xs font-normal text-slate-500">(Optional)</span>
                    </label>
                    <span className="text-slate-500 text-sm">{showContactFields ? '−' : '+'}</span>
                  </button>

                  {showContactFields && (
                    <div className="mt-4 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <input
                          type="email"
                          value={contactEmail}
                          onChange={(e) => setContactEmail(e.target.value)}
                          placeholder="Business email"
                          className="rounded-xl border border-slate-700 bg-slate-800/50 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-white focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-white/5 transition-all"
                        />
                        <input
                          type="tel"
                          value={contactPhone}
                          onChange={(e) => setContactPhone(e.target.value)}
                          placeholder="Phone number"
                          className="rounded-xl border border-slate-700 bg-slate-800/50 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-white focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-white/5 transition-all"
                        />
                      </div>
                      <input
                        type="text"
                        value={contactAddress}
                        onChange={(e) => setContactAddress(e.target.value)}
                        placeholder="Street address"
                        className="w-full rounded-xl border border-slate-700 bg-slate-800/50 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-white focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-white/5 transition-all"
                      />
                      <div className="grid grid-cols-3 gap-3">
                        <input
                          type="text"
                          value={contactCity}
                          onChange={(e) => setContactCity(e.target.value)}
                          placeholder="City"
                          className="rounded-xl border border-slate-700 bg-slate-800/50 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-white focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-white/5 transition-all"
                        />
                        <input
                          type="text"
                          value={contactState}
                          onChange={(e) => setContactState(e.target.value)}
                          placeholder="State"
                          className="rounded-xl border border-slate-700 bg-slate-800/50 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-white focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-white/5 transition-all"
                        />
                        <input
                          type="text"
                          value={contactZip}
                          onChange={(e) => setContactZip(e.target.value)}
                          placeholder="ZIP"
                          className="rounded-xl border border-slate-700 bg-slate-800/50 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-white focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-white/5 transition-all"
                        />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <input
                          type="url"
                          value={socialFacebook}
                          onChange={(e) => setSocialFacebook(e.target.value)}
                          placeholder="Facebook URL"
                          className="rounded-xl border border-slate-700 bg-slate-800/50 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-white focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-white/5 transition-all"
                        />
                        <input
                          type="url"
                          value={socialInstagram}
                          onChange={(e) => setSocialInstagram(e.target.value)}
                          placeholder="Instagram URL"
                          className="rounded-xl border border-slate-700 bg-slate-800/50 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-white focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-white/5 transition-all"
                        />
                      </div>
                      <p className="text-xs text-slate-500 italic">
                        This info will appear in your Contact page and footer. Leave blank for generic placeholders.
                      </p>
                    </div>
                  )}
                </div>

                {selectedBusinessCategoryId === 'restaurant_cafe' && (
                  <div className="space-y-6 pt-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
                    {/* Brand Style Selector - Restaurant Only */}
                    <div className="space-y-3">
                      <label className="text-sm font-bold text-white flex items-center gap-2">
                        <span className="flex h-5 w-5 items-center justify-center rounded bg-emerald-500 text-[10px] text-white">R</span>
                        Restaurant Style
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {BRAND_STYLE_OPTIONS.map((style) => {
                          const selected = style.id === selectedBrandStyle;
                          return (
                            <button
                              key={style.id}
                              type="button"
                              onClick={() => setSelectedBrandStyle(style.id)}
                              className={`text-left rounded-2xl border p-4 transition-all ${
                                selected ? 'border-emerald-500 bg-emerald-950/50 ring-2 ring-emerald-500/20' : 'border-slate-700 hover:border-slate-500 bg-slate-800/30'
                              }`}
                            >
                              <div className="flex items-center gap-3 mb-2">
                                <span className="text-2xl">{style.icon}</span>
                                <span className={`text-base font-bold ${selected ? 'text-emerald-400' : 'text-white'}`}>{style.label}</span>
                              </div>
                              <p className="text-xs text-slate-400">{style.description}</p>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Menu Uploader */}
                    <MenuUploader menus={menus} onChange={setMenus} />
                  </div>
                )}
              </div>

              <div className="mt-12 flex justify-end">
                <button
                  type="button"
                  onClick={handleAssign}
                  disabled={assigning || !brief.trim()}
                  className="group flex items-center gap-3 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 px-10 py-5 text-base font-bold text-white transition-all hover:from-emerald-400 hover:to-emerald-500 hover:scale-105 disabled:from-slate-700 disabled:to-slate-800 disabled:text-slate-500 disabled:scale-100 disabled:cursor-not-allowed shadow-xl shadow-emerald-500/20"
                >
                  {assigning ? (
                    <>
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-emerald-200 border-t-white" />
                      Assigning to AI...
                    </>
                  ) : (
                    <>
                      Continue to Variations
                      <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </div>
              {assignError && (
                <p className="mt-4 text-sm font-medium text-red-400 bg-red-950/50 p-4 rounded-xl border border-red-900/50 text-center animate-in fade-in zoom-in duration-300">
                  {assignError}
                </p>
              )}
            </div>
          </div>
        )}

        {/* STEP 2: HOMEPAGE DIRECTION */}
        {currentStep === 2 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="text-center mb-8">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">
                Step 2
              </p>
              <h2 className="text-3xl font-bold text-white">
                Choose Your Homepage Direction
              </h2>
              <p className="text-slate-400 mt-2 max-w-lg mx-auto">
                Select the hero layout that best represents your brand's personality
              </p>
            </div>

            {/* Hero Layout Cards */}
            <div className="grid gap-6 max-w-3xl mx-auto">
              {HERO_LAYOUT_OPTIONS.map((layout) => {
                const isSelected = selectedHeroLayout === layout.id;
                return (
                  <div
                    key={layout.id}
                    className={`rounded-2xl border-2 p-6 transition-all duration-300 ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-950/30 shadow-lg shadow-emerald-500/10'
                        : 'border-slate-700 bg-slate-900 hover:border-slate-500'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-xl overflow-hidden">
                          <HeroLayoutIcon layout={layout.id} />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-white">{layout.label}</h3>
                          <p className="text-sm text-slate-400">{layout.description}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedHeroLayout(layout.id);
                          setCurrentStep(3);
                        }}
                        className={`px-6 py-3 rounded-full text-sm font-bold transition-all ${
                          isSelected
                            ? 'bg-emerald-500 text-white hover:bg-emerald-400'
                            : 'bg-slate-800 text-white hover:bg-slate-700 border border-slate-600'
                        }`}
                      >
                        Use This Hero
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-12 flex items-center justify-center border-t border-slate-800 pt-8">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Context
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: REFINE */}
        {currentStep === 3 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="text-center mb-8">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">
                Step 3
              </p>
              <h2 className="text-3xl font-bold text-white">
                Refine the Direction
              </h2>
              <p className="text-slate-400 mt-2">
                Fine-tune your theme's appearance
              </p>
            </div>

            {/* Selected Hero Layout Banner */}
            <div className="rounded-2xl border border-emerald-800 bg-emerald-950/30 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg overflow-hidden">
                    <HeroLayoutIcon layout={selectedHeroLayout} />
                  </div>
                  <div>
                    <p className="text-xs text-emerald-400 font-medium">Selected Layout</p>
                    <p className="text-white font-bold">
                      {HERO_LAYOUT_OPTIONS.find(l => l.id === selectedHeroLayout)?.label}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="text-xs text-emerald-400 hover:text-emerald-300 underline"
                >
                  Change
                </button>
              </div>
            </div>

            {/* Refinement Controls - Pills and Toggles */}
            <div className="rounded-3xl border border-slate-800 bg-slate-900 p-8 space-y-8">
              {/* Typography Pills */}
              <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500">
                  Typography Style
                </label>
                <div className="flex flex-wrap gap-2">
                  {FONT_PROFILE_OPTIONS.map((profile) => (
                    <button
                      key={profile.id}
                      type="button"
                      onClick={() => {
                        setSelectedFontProfile(profile.id);
                        setCustomFontPairId(profile.id);
                      }}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                        selectedFontProfile === profile.id
                          ? 'bg-white text-slate-950'
                          : 'bg-slate-800 text-white hover:bg-slate-700 border border-slate-700'
                      }`}
                    >
                      {profile.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Palette Section */}
              <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500">
                  Color Palette
                </label>
                <div className="flex flex-wrap gap-2">
                  {logoColors.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setCustomPaletteId('brand')}
                      className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                        customPaletteId === 'brand'
                          ? 'bg-emerald-500 text-white'
                          : 'bg-slate-800 text-white hover:bg-slate-700 border border-emerald-700'
                      }`}
                    >
                      <Sparkles className="w-3 h-3" />
                      Brand Kit
                      <div className="flex gap-1 ml-1">
                        {logoColors.slice(0, 3).map((c, i) => (
                          <div key={i} className="w-3 h-3 rounded-full border border-white/30" style={{ backgroundColor: c }} />
                        ))}
                      </div>
                    </button>
                  )}
                  {PALETTES.map((palette) => (
                    <button
                      key={palette.id}
                      type="button"
                      onClick={() => setCustomPaletteId(palette.id)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                        customPaletteId === palette.id
                          ? 'bg-white text-slate-950'
                          : 'bg-slate-800 text-white hover:bg-slate-700 border border-slate-700'
                      }`}
                    >
                      {palette.label}
                      <ColorPalettePreview paletteId={palette.id} />
                    </button>
                  ))}
                </div>
                {originalBrandKitColors.length > 0 && customPaletteId !== 'brand' && (
                  <button
                    type="button"
                    onClick={restoreBrandKit}
                    className="text-xs text-emerald-400 hover:text-emerald-300 underline"
                  >
                    ↩️ Restore Brand Kit
                  </button>
                )}
              </div>

              {/* Hero Headline */}
              <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500">
                  Hero Headline
                </label>
                <input
                  type="text"
                  value={customHeroTitle}
                  onChange={(e) => setCustomHeroTitle(e.target.value)}
                  placeholder={project.name}
                  className="w-full rounded-xl border border-slate-700 bg-slate-800/50 px-4 py-3 text-sm font-medium text-white placeholder:text-slate-500 focus:border-white focus:outline-none transition-all"
                />
              </div>

              {selectedBusinessCategoryId === 'ecommerce_store' && (
                <div className="rounded-xl border border-amber-800 bg-amber-950/50 px-4 py-3 text-sm text-amber-300">
                  <p className="font-medium">💡 Demo Mode</p>
                  <p className="mt-1 text-xs text-amber-400">
                    This creates a demo e-commerce site with placeholder products. For real transactions, install WooCommerce after activating the theme.
                  </p>
                </div>
              )}
            </div>

            {/* Live Preview - Layout Aware */}
            <div className="rounded-3xl border border-slate-800 bg-slate-900 p-8">
              <div className="flex items-center justify-between mb-6">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500">
                  Live Preview • {HERO_LAYOUT_OPTIONS.find(l => l.id === selectedHeroLayout)?.label}
                </label>
                <div className="flex gap-1.5">
                  <div className="h-2 w-2 rounded-full bg-red-400" />
                  <div className="h-2 w-2 rounded-full bg-yellow-400" />
                  <div className="h-2 w-2 rounded-full bg-green-400" />
                </div>
              </div>

              {/* Layout-specific preview */}
              <div className="transition-all duration-300">
                {selectedHeroLayout === 'fullBleed' && (
                  <div
                    className="rounded-2xl p-8 text-center space-y-4 min-h-[200px] flex flex-col items-center justify-center"
                    style={{ backgroundColor: previewColors.accent3 }}
                  >
                    <h4 className="text-3xl font-black tracking-tight" style={{ color: previewColors.base, fontFamily: getFontStyles(selectedFontProfile).heading }}>
                      {customHeroTitle || project.name}
                    </h4>
                    <p className="text-sm max-w-md" style={{ color: previewColors.base, opacity: 0.9, fontFamily: getFontStyles(selectedFontProfile).body }}>
                      {heroSubtitle}
                    </p>
                    <div className="flex justify-center gap-3 pt-2">
                      <div className="rounded-full px-6 py-2 text-sm font-bold" style={{ backgroundColor: previewColors.accent, color: previewColors.base }}>
                        Get Started
                      </div>
                      <div className="rounded-full px-6 py-2 text-sm font-bold" style={{ backgroundColor: 'transparent', color: previewColors.base, border: `2px solid ${previewColors.base}` }}>
                        Learn More
                      </div>
                    </div>
                  </div>
                )}

                {selectedHeroLayout === 'fullWidth' && (
                  <div className="space-y-3">
                    <div className="h-10 rounded-lg" style={{ backgroundColor: previewColors.contrast3 }} />
                    <div
                      className="rounded-2xl p-8 text-center space-y-4"
                      style={{ backgroundColor: previewColors.accent3 }}
                    >
                      <h4 className="text-2xl font-black tracking-tight" style={{ color: previewColors.base, fontFamily: getFontStyles(selectedFontProfile).heading }}>
                        {customHeroTitle || project.name}
                      </h4>
                      <p className="text-sm" style={{ color: previewColors.base, opacity: 0.8, fontFamily: getFontStyles(selectedFontProfile).body }}>
                        {heroSubtitle}
                      </p>
                      <div className="flex justify-center gap-3 pt-2">
                        <div className="rounded-full px-5 py-2 text-sm font-bold" style={{ backgroundColor: previewColors.accent, color: previewColors.base }}>
                          Get Started
                        </div>
                      </div>
                    </div>
                    <div className="h-8 rounded-lg" style={{ backgroundColor: previewColors.contrast3 }} />
                  </div>
                )}

                {selectedHeroLayout === 'split' && (
                  <div className="flex rounded-2xl overflow-hidden min-h-[180px]">
                    {/* Left: Text */}
                    <div className="w-1/2 p-6 flex flex-col justify-center" style={{ backgroundColor: previewColors.base }}>
                      <h4 className="text-xl font-black mb-2 tracking-tight" style={{ color: previewColors.contrast, fontFamily: getFontStyles(selectedFontProfile).heading }}>
                        {customHeroTitle || project.name}
                      </h4>
                      <p className="text-xs mb-4 line-clamp-2" style={{ color: previewColors.contrast2, fontFamily: getFontStyles(selectedFontProfile).body }}>
                        {heroSubtitle}
                      </p>
                      <div className="flex gap-2">
                        <div className="rounded px-4 py-1.5 text-xs font-bold" style={{ backgroundColor: previewColors.accent, color: previewColors.base }}>
                          Get Started
                        </div>
                        <div className="rounded px-4 py-1.5 text-xs font-bold" style={{ backgroundColor: 'transparent', color: previewColors.contrast, border: `1px solid ${previewColors.contrast3}` }}>
                          Learn More
                        </div>
                      </div>
                    </div>
                    {/* Right: Image placeholder */}
                    <div className="w-1/2 flex items-center justify-center" style={{ backgroundColor: previewColors.accent3 }}>
                      <div className="text-center" style={{ color: previewColors.base }}>
                        <ImageIcon className="w-8 h-8 mx-auto opacity-50" />
                        <p className="text-xs mt-2 opacity-50">Hero Image</p>
                      </div>
                    </div>
                  </div>
                )}

                {selectedHeroLayout === 'minimal' && (
                  <div
                    className="rounded-2xl p-12 text-center space-y-6 min-h-[180px] flex flex-col items-center justify-center"
                    style={{ backgroundColor: previewColors.base, border: `1px solid ${previewColors.contrast3}` }}
                  >
                    <h4 className="text-3xl font-black tracking-tight" style={{ color: previewColors.contrast, fontFamily: getFontStyles(selectedFontProfile).heading }}>
                      {customHeroTitle || project.name}
                    </h4>
                    <p className="text-sm max-w-sm" style={{ color: previewColors.contrast2, fontFamily: getFontStyles(selectedFontProfile).body }}>
                      {heroSubtitle}
                    </p>
                    <div className="rounded-full px-6 py-2 text-sm font-bold" style={{ backgroundColor: previewColors.accent, color: previewColors.base }}>
                      Get Started
                    </div>
                  </div>
                )}
              </div>

              <div
                className="rounded-xl p-3 mt-4 transition-colors duration-300"
                style={{ backgroundColor: previewColors.accent2 }}
              >
                <p className="text-xs font-medium text-center" style={{ color: previewColors.contrast }}>
                  {FONT_PROFILE_OPTIONS.find(f => f.id === selectedFontProfile)?.label} typography
                </p>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between pt-4">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Homepage
              </button>
              <button
                type="button"
                disabled={heroPreviewLoading}
                onClick={handleGeneratePreviews}
                className="flex items-center gap-3 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 px-10 py-5 text-base font-bold text-white transition-all hover:from-emerald-400 hover:to-emerald-500 hover:scale-105 disabled:from-slate-700 disabled:to-slate-800 disabled:text-slate-500 shadow-xl shadow-emerald-500/20"
              >
                {heroPreviewLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Rendering...
                  </>
                ) : (
                  <>
                    Preview with Real Content
                    <ImageIcon className="h-5 w-5" />
                  </>
                )}
              </button>
            </div>
            {heroPreviewError && (
              <div className="mt-4 text-sm font-medium text-red-400 bg-red-950/50 p-4 rounded-xl border border-red-900/50 text-center space-y-3">
                <p>{heroPreviewError}</p>
                <button
                  type="button"
                  onClick={() => setCurrentStep(4)}
                  className="inline-flex items-center gap-2 rounded-full bg-white/10 px-6 py-3 text-sm font-bold text-white hover:bg-white/20 transition-colors"
                >
                  Skip Preview — Go to Generate
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* STEP 4: PREVIEW WITH REAL CONTENT */}
        {currentStep === 4 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="text-center mb-8">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">
                Step 4
              </p>
              <h2 className="text-3xl font-bold text-white">
                Preview with Real Content
              </h2>
              <p className="text-slate-400 mt-2 max-w-lg mx-auto">
                This is an actual WordPress-rendered screenshot of your theme
              </p>
            </div>

            {/* Selected Layout Info */}
            <div className="rounded-2xl border border-emerald-800 bg-emerald-950/30 p-4 max-w-2xl mx-auto">
              <div className="flex items-center justify-center gap-3">
                <div className="w-10 h-10 rounded-lg overflow-hidden">
                  <HeroLayoutIcon layout={selectedHeroLayout} />
                </div>
                <div>
                  <p className="text-white font-bold">
                    {HERO_LAYOUT_OPTIONS.find(l => l.id === selectedHeroLayout)?.label}
                  </p>
                  <p className="text-xs text-emerald-400">
                    {FONT_PROFILE_OPTIONS.find(f => f.id === selectedFontProfile)?.label} typography
                  </p>
                </div>
              </div>
            </div>

            {heroPreviews && heroPreviews.length > 0 ? (
              <div className="max-w-4xl mx-auto">
                {/* Show only the selected layout preview */}
                {(() => {
                  const selectedPreview = heroPreviews.find(p => p.layout === selectedHeroLayout) || heroPreviews[0];
                  return (
                    <div className="rounded-2xl border border-slate-700 bg-slate-900 overflow-hidden shadow-2xl">
                      <div className="aspect-[16/9] relative">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={selectedPreview.screenshotUrl}
                          alt={selectedPreview.label}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  );
                })()}
              </div>
            ) : (
              <div className="flex items-center justify-center py-20">
                <div className="text-center space-y-4">
                  <div className="h-16 w-16 mx-auto rounded-full bg-slate-800 flex items-center justify-center">
                    <ImageIcon className="h-8 w-8 text-slate-500" />
                  </div>
                  <p className="text-sm text-slate-400">No preview available</p>
                  <button
                    type="button"
                    onClick={handleGeneratePreviews}
                    disabled={heroPreviewLoading}
                    className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-bold text-slate-950"
                  >
                    {heroPreviewLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      'Generate Preview'
                    )}
                  </button>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between border-t border-slate-800 pt-8">
              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                className="flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Refine
              </button>
              <button
                type="button"
                onClick={handleGenerate}
                disabled={generating}
                className="flex items-center gap-3 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 px-10 py-5 text-base font-bold text-white transition-all hover:from-emerald-400 hover:to-emerald-500 hover:scale-105 disabled:from-slate-700 disabled:to-slate-800 disabled:text-slate-500 shadow-xl shadow-emerald-500/20"
              >
                {generating ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Generating Theme...
                  </>
                ) : (
                  <>
                    Generate Final Theme
                    <Wand2 className="h-5 w-5" />
                  </>
                )}
              </button>
            </div>
            {generateError && (
              <p className="mt-4 text-sm font-medium text-red-400 bg-red-950/50 p-4 rounded-xl border border-red-900/50 text-center">
                {generateError}
              </p>
            )}
          </div>
        )}

        {/* STEP 5: DELIVER */}
        {currentStep === 5 && (
          <div className="mx-auto max-w-2xl space-y-12 py-12 text-center animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="space-y-4">
              <div className="flex justify-center">
                {jobStatus === "completed" ? (
                  <div className="h-24 w-24 rounded-full bg-white text-slate-950 flex items-center justify-center shadow-2xl animate-in zoom-in duration-500">
                    <CheckCircle2 className="h-12 w-12" />
                  </div>
                ) : jobStatus === "failed" ? (
                  <div className="h-24 w-24 rounded-full bg-red-600 text-white flex items-center justify-center shadow-2xl">
                    <X className="h-12 w-12" />
                  </div>
                ) : (
                  <div className="relative">
                    <div className="h-24 w-24 rounded-full border-4 border-slate-800 border-t-white animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Sparkles className="h-8 w-8 text-white animate-pulse" />
                    </div>
                  </div>
                )}
              </div>
              <h2 className="text-4xl font-black text-white tracking-tight">
                {jobStatus === "completed"
                  ? "Your Kit is Ready"
                  : jobStatus === "failed"
                    ? "Generation Failed"
                    : "Building Your Assets"}
              </h2>
              <p className="mx-auto max-w-md text-slate-400 font-medium">
                {jobStatus === "completed"
                  ? "Download your professional WordPress theme and static site bundle below."
                  : jobStatus === "failed"
                    ? "There was an error while generating your theme. Please try again or contact support."
                    : "PressPilot is currently compiling your custom block theme, injecting patterns, and generating your static site."}
              </p>
            </div>

            <div className="flex justify-center">
              <div className={`group relative flex flex-col items-center rounded-3xl border-2 p-8 transition-all duration-500 max-w-sm w-full ${jobStatus === "completed"
                ? "border-white bg-slate-900 shadow-2xl hover:-translate-y-2 scale-100"
                : "border-slate-800 bg-slate-900/50 opacity-40 scale-95"
                }`}>
                <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-slate-800 text-white group-hover:bg-white group-hover:text-slate-950 transition-colors duration-500">
                  <Download className="h-10 w-10" />
                </div>
                <h3 className="mb-2 text-xl font-bold text-white">WordPress Theme</h3>
                <p className="mb-8 text-sm text-slate-400 font-medium h-10 text-center">
                  Standalone block theme (.zip) with all your custom styles.
                </p>
                <button
                  disabled={jobStatus !== "completed"}
                  onClick={() => window.open(artifacts?.themeUrl || '', "_blank")}
                  className="w-full rounded-2xl bg-white px-6 py-4 text-sm font-black text-slate-950 transition-all hover:scale-105 active:scale-95 disabled:opacity-20 shadow-xl shadow-white/20"
                >
                  Download Theme
                </button>
              </div>
            </div>

            {jobStatus === "completed" && (
              <div className="pt-12 fade-in animate-in duration-1000">
                <button
                  onClick={() => {
                    setCurrentStep(1);
                    setJobId(null);
                    setJobStatus("pending");
                  }}
                  className="inline-flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-white transition-colors group"
                >
                  <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                  Generate Another Design
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
