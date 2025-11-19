import fs from 'fs/promises';
import path from 'path';
import { PressPilotNormalizedContext, PressPilotVariationManifest } from '@/types/presspilot';
import { VariationSchema } from '@/lib/presspilot/schema';
import { getVariationById } from '@/lib/presspilot/variationRegistry';

export interface PressPilotHeroConfig {
  title: string;
  subtitle: string;
  primaryCta: string;
  secondaryCta?: string;
  primaryCtaUrl?: string;
  secondaryCtaUrl?: string;
}

export interface PressPilotFeatureConfig {
  icon: string;
  label: string;
  description: string;
}

export interface PressPilotContactConfig {
  headline: string;
  body: string;
  primaryCta: string;
  email?: string;
}

export interface PressPilotBusinessCopy {
  hero: PressPilotHeroConfig;
  features: PressPilotFeatureConfig[];
  contact: PressPilotContactConfig;
  featuresHeading: string;
}

export interface PressPilotBusinessTypeConfig {
  id: string;
  label: string;
  styleVariation: string;
  frontPagePatterns: string[];
  hero?: PressPilotHeroConfig;
  features?: PressPilotFeatureConfig[];
  contact?: PressPilotContactConfig;
  featuresHeading?: string;
}

export type PressPilotKitConfig = {
  theme: string;
  version: string;
  businessTypes: PressPilotBusinessTypeConfig[];
  aiCopyTargets: Record<string, unknown>;
};

const GOLDEN_FOUNDATION_THEME = 'presspilot-golden-foundation';

const DEFAULT_HERO: PressPilotHeroConfig = {
  title: 'Launch with PressPilot',
  subtitle: 'Drop your brand info into a PressPilot kit and publish faster than ever.',
  primaryCta: 'Get started',
  secondaryCta: 'See preview',
  primaryCtaUrl: '#contact',
  secondaryCtaUrl: '#services'
};

const DEFAULT_FEATURES: PressPilotFeatureConfig[] = [
  {
    icon: '⭐',
    label: '{{brand}} story blocks',
    description: 'Hero, headline, and CTA patterns tuned for your team.'
  },
  {
    icon: '⚡',
    label: 'Faster launches',
    description: '{{brand}} ships a theme + static site bundle in one click.'
  },
  {
    icon: '🧭',
    label: 'Mode-aware navigation',
    description: 'Menus adapt to the archetype and inputs you provide.'
  },
  {
    icon: '🛠️',
    label: 'Builder friendly',
    description: 'Clean theme.json + patterns ready for handoff.'
  }
] as const;

const DEFAULT_CONTACT: PressPilotContactConfig = {
  headline: 'Ready to ship?',
  body: 'Tell us about your business and we’ll tailor a kit to match your goals.',
  primaryCta: 'Book a call',
  email: 'hello@presspilot.app'
};

function getGoldenFoundationKitPath() {
  return path.join(process.cwd(), 'build', 'themes', GOLDEN_FOUNDATION_THEME, 'presspilot-kit.json');
}

export async function loadPressPilotKit(): Promise<PressPilotKitConfig> {
  const kitPath = getGoldenFoundationKitPath();
  const raw = await fs.readFile(kitPath, 'utf8');
  const data = JSON.parse(raw) as PressPilotKitConfig;

  if (!data.businessTypes || !Array.isArray(data.businessTypes)) {
    throw new Error('presspilot-kit.json: businessTypes missing or invalid');
  }

  return data;
}

export async function getPressPilotBusinessTypes(): Promise<PressPilotBusinessTypeConfig[]> {
  const kit = await loadPressPilotKit();
  return kit.businessTypes;
}

export function getStyleVariationForBusinessTypeId(
  kit: PressPilotKitConfig,
  businessTypeId: string | null | undefined
): string | null {
  if (!businessTypeId) return null;
  const match = kit.businessTypes.find((businessType) => businessType.id === businessTypeId);
  return match ? match.styleVariation : null;
}

export async function resolveBusinessTypeStyle(
  businessTypeId: string | null | undefined
): Promise<{
  kit: PressPilotKitConfig;
  styleVariation: string | null;
  variation: VariationSchema | null;
}> {
  const kit = await loadPressPilotKit();
  const styleVariation = getStyleVariationForBusinessTypeId(kit, businessTypeId);
  const variation = styleVariation ? getVariationById(styleVariation) ?? null : null;
  return { kit, styleVariation, variation };
}

export async function getBusinessTypeConfig(
  businessTypeId: string
): Promise<PressPilotBusinessTypeConfig | undefined> {
  const kit = await loadPressPilotKit();
  return kit.businessTypes.find((businessType) => businessType.id === businessTypeId);
}

export async function resolveBusinessCopy(
  context: PressPilotNormalizedContext,
  variation: PressPilotVariationManifest,
  businessTypeId: string | null | undefined
): Promise<PressPilotBusinessCopy> {
  const kit = await loadPressPilotKit();
  const match = businessTypeId ? kit.businessTypes.find((businessType) => businessType.id === businessTypeId) : undefined;

  const hero = buildHeroCopy(context, variation, match?.hero);
  const features = buildFeatureCopy(context, match?.features);
  const contact = buildContactCopy(context, match?.contact);
  const featuresHeading =
    interpolateText(match?.featuresHeading, context) || `Why ${context.brand.name}?`;

  return { hero, features, contact, featuresHeading };
}

function buildHeroCopy(
  context: PressPilotNormalizedContext,
  variation: PressPilotVariationManifest,
  override?: PressPilotHeroConfig
): PressPilotHeroConfig {
  const description = context.narrative?.description_long?.trim();
  const primaryCta = context.visual.primary_ctas?.[0];
  const secondaryCta = context.visual.primary_ctas?.[1];
  const primary = override?.primaryCta ?? primaryCta?.label ?? 'Get started';
  const secondary = override?.secondaryCta ?? secondaryCta?.label ?? 'Explore services';

  return {
    title: context.brand.name,
    subtitle:
      (description && description.length > 220 ? `${description.slice(0, 217)}…` : description) ??
      override?.subtitle ??
      variation.preview.description ??
      'Launch your next experience in minutes with PressPilot.',
    primaryCta: primary,
    secondaryCta: secondary,
    primaryCtaUrl: override?.primaryCtaUrl ?? primaryCta?.url ?? '#contact',
    secondaryCtaUrl: override?.secondaryCtaUrl ?? secondaryCta?.url ?? '#services'
  };
}

function buildFeatureCopy(
  context: PressPilotNormalizedContext,
  overrides?: PressPilotFeatureConfig[]
): PressPilotFeatureConfig[] {
  const base = overrides && overrides.length ? overrides : DEFAULT_FEATURES;
  return base.map((feature, index) => ({
    icon: feature.icon || ['⭐', '🚀', '🎯', '✨'][index] || '⭐',
    label: interpolateText(feature.label, context) || `Feature ${index + 1}`,
    description: interpolateText(feature.description, context) || 'Tailored insight from PressPilot.'
  }));
}

function buildContactCopy(
  context: PressPilotNormalizedContext,
  override?: PressPilotContactConfig
): PressPilotContactConfig {
  const email = `hello@${context.brand.slug}.com`;
  const fallbackBody = `Tell us about ${context.brand.name} and we’ll assemble your next launch.`;
  const baseBody = interpolateText(override?.body, context) ?? fallbackBody;
  const bodyWithEmail = baseBody.includes(email) ? baseBody : `${baseBody} Reach us at ${email}.`;

  return {
    headline: `Ready to work with ${context.brand.name}?`,
    body: bodyWithEmail,
    primaryCta: override?.primaryCta ?? 'Book a call',
    email
  };
}

function interpolateText(value: string | undefined, context: PressPilotNormalizedContext): string | undefined {
  if (!value) return undefined;
  return value.replace(/{{\s*brand\s*}}/gi, context.brand.name);
}

