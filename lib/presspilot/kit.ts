import fs from 'fs/promises';
import path from 'path';
import { PressPilotNormalizedContext, PressPilotVariationManifest } from '@/types/presspilot';
import { VariationSchema } from '@/lib/presspilot/schema';
import { getVariationById } from '@/lib/presspilot/variationRegistry';
import { BUSINESS_CATEGORIES, type BusinessCategoryId } from '@/app/mvp-demo/businessCategories';

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

export interface PressPilotPricingTier {
  name: string;
  price: string;
  features: string[];
  cta: string;
  highlight?: boolean;
}

export interface PressPilotUpdateCard {
  eyebrow: string;
  title: string;
  body: string;
}

export interface PressPilotBusinessCopy {
  hero: PressPilotHeroConfig;
  features: PressPilotFeatureConfig[];
  contact: PressPilotContactConfig;
  featuresHeading: string;
  pricingHeading: string;
  pricingSubheading: string;
  pricing: PressPilotPricingTier[];
  updatesHeading: string;
  updatesSubheading: string;
  updates: PressPilotUpdateCard[];
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
  body: 'Tell us about your business and we\'ll tailor a kit to match your goals.',
  primaryCta: 'Book a call',
  email: 'hello@presspilot.app'
};

const DEFAULT_PRICING: PressPilotPricingTier[] = [
  {
    name: 'Starter',
    price: '$19 / month',
    features: ['1 brand setup', 'Basic analytics', 'Email support'],
    cta: 'Choose Starter'
  },
  {
    name: 'Growth',
    price: '$49 / month',
    features: ['Unlimited kits', 'Mode-aware add-ons', 'Priority support'],
    cta: 'Choose Growth',
    highlight: true
  },
  {
    name: 'Pro',
    price: '$99 / month',
    features: ['Dedicated strategist', 'Custom exports', 'Training & SLA'],
    cta: 'Choose Pro'
  }
];

const DEFAULT_UPDATES: PressPilotUpdateCard[] = [
  {
    eyebrow: 'Playbook',
    title: '{{brand}} release notes',
    body: 'Share a concise summary of your latest platform update or feature drop.'
  },
  {
    eyebrow: 'Case study',
    title: 'How teams ship faster',
    body: 'Highlight a customer win, metric, or testimonial from recent work.'
  },
  {
    eyebrow: 'Announcement',
    title: 'What\'s next for {{brand}}',
    body: 'Tease upcoming launches, events, or community projects to keep people excited.'
  }
];

/**
 * Builds a PressPilotKitConfig from code-only sources (businessCategories).
 * This avoids reading from disk at runtime, which is critical for production
 * environments (e.g., Coolify) where /build may be empty on container startup.
 *
 * The file-based presspilot-kit.json is still written into generated theme
 * folders for PHP activation bootstrap to read, but Node.js runtime should
 * never depend on it existing.
 */
function buildPressPilotKitFromCode(): PressPilotKitConfig {
  // Map business categories to business types with style variations
  const businessTypeMap: Record<string, string> = {
    'restaurant_cafe': 'restaurant-soft',
    'ecommerce_store': 'ecom-bold',
    'local_service': 'local-biz-soft',
    'health_fitness': 'saas-bright',
    'beauty_salon': 'local-biz-soft',
    'professional_services': 'saas-bright',
    'online_coach': 'saas-bright',
    'saas_product': 'saas-bright',
  };

  const businessTypes: PressPilotBusinessTypeConfig[] = BUSINESS_CATEGORIES.map((category) => ({
    id: category.id,
    label: category.label,
    styleVariation: businessTypeMap[category.id] || 'saas-bright',
    frontPagePatterns: ['hero-basic', 'features-grid', 'pricing-columns', 'blog-teasers', 'cta-contact'],
  }));

  return {
    theme: GOLDEN_FOUNDATION_THEME,
    version: '0.6.0',
    businessTypes,
    aiCopyTargets: {},
  };
}

function getGoldenFoundationKitPath() {
  return path.join(process.cwd(), 'themes', GOLDEN_FOUNDATION_THEME, 'presspilot-kit.json');
}

/**
 * Loads PressPilot kit configuration.
 * Tries to read from disk first (for local dev), but falls back to code-only
 * generation if the file doesn't exist (production/Coolify).
 * 
 * This ensures /api/generate and /api/variations work even when /build is empty.
 */
export async function loadPressPilotKit(): Promise<PressPilotKitConfig> {
  const kitPath = getGoldenFoundationKitPath();
  
  try {
    // Try to read from disk (for local dev convenience)
    const raw = await fs.readFile(kitPath, 'utf8');
    const data = JSON.parse(raw) as PressPilotKitConfig;

    if (data.businessTypes && Array.isArray(data.businessTypes) && data.businessTypes.length > 0) {
      return data;
    }
  } catch (error) {
    // File doesn't exist or is invalid - this is expected in production
    // Fall through to code-only generation
    if (error instanceof Error && 'code' in error && error.code !== 'ENOENT') {
      // Log non-ENOENT errors (permission issues, etc.) but still fall back
      console.warn('[PressPilot] Could not read kit JSON, using code-only fallback:', error.message);
    }
  }

  // Fallback: build from code (production-safe)
  return buildPressPilotKitFromCode();
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
  const pricing = buildPricingCopy(context);
  const updates = buildUpdatesCopy(context);

  return {
    hero,
    features,
    contact,
    featuresHeading,
    pricingHeading: pricing.heading,
    pricingSubheading: pricing.subheading,
    pricing: pricing.tiers,
    updatesHeading: updates.heading,
    updatesSubheading: updates.subheading,
    updates: updates.cards
  };
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
  const fallbackBody = `Tell us about ${context.brand.name} and we'll assemble your next launch.`;
  const baseBody = interpolateText(override?.body, context) ?? fallbackBody;
  const bodyWithEmail = baseBody.includes(email) ? baseBody : `${baseBody} Reach us at ${email}.`;

  return {
    headline: `Ready to work with ${context.brand.name}?`,
    body: bodyWithEmail,
    primaryCta: override?.primaryCta ?? 'Book a call',
    email
  };
}

function buildPricingCopy(
  context: PressPilotNormalizedContext,
  overrides?: PressPilotPricingTier[]
): { heading: string; subheading: string; tiers: PressPilotPricingTier[] } {
  const tiers = (overrides && overrides.length ? overrides : DEFAULT_PRICING).map((tier) => ({
    ...tier,
    name: interpolateText(tier.name, context) ?? tier.name,
    features: tier.features.map((feature) => interpolateText(feature, context) ?? feature),
    cta: interpolateText(tier.cta, context) ?? tier.cta
  }));

  return {
    heading: `Plans for every ${context.brand.category}`,
    subheading: `${context.brand.name} can switch tiers any time—kits stay in sync automatically.`,
    tiers
  };
}

function buildUpdatesCopy(
  context: PressPilotNormalizedContext,
  overrides?: PressPilotUpdateCard[]
): { heading: string; subheading: string; cards: PressPilotUpdateCard[] } {
  const cards = (overrides && overrides.length ? overrides : DEFAULT_UPDATES).map((card) => ({
    eyebrow: interpolateText(card.eyebrow, context) ?? card.eyebrow,
    title: interpolateText(card.title, context) ?? card.title,
    body: interpolateText(card.body, context) ?? card.body
  }));

  while (cards.length < 3) {
    cards.push(cards[0]);
  }

  return {
    heading: 'Latest updates',
    subheading: 'Use this space to share product launches, playbooks, or insights.',
    cards: cards.slice(0, 3)
  };
}

function interpolateText(value: string | undefined, context: PressPilotNormalizedContext): string | undefined {
  if (!value) return undefined;
  return value.replace(/{{\s*brand\s*}}/gi, context.brand.name);
}
