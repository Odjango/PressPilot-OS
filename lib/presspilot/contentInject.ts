import fs from 'fs/promises';
import path from 'path';
import {
  PressPilotBusinessCopy,
  PressPilotContactConfig,
  PressPilotFeatureConfig,
  PressPilotHeroConfig
} from '@/lib/presspilot/kit';

const PATTERN_FILES = [
  { file: 'hero-basic.php', type: 'hero' as const },
  { file: 'features-grid.php', type: 'features' as const },
  { file: 'cta-contact.php', type: 'contact' as const }
];

function injectHeroTokens(content: string, hero: PressPilotHeroConfig): string {
  return content
    .replace(/{{HERO_TITLE}}/g, hero.title)
    .replace(/{{HERO_SUBTITLE}}/g, hero.subtitle)
    .replace(/{{HERO_PRIMARY_CTA}}/g, hero.primaryCta)
    .replace(/{{HERO_SECONDARY_CTA}}/g, hero.secondaryCta ?? '')
    .replace(/{{HERO_PRIMARY_CTA_URL}}/g, hero.primaryCtaUrl ?? '#contact')
    .replace(/{{HERO_SECONDARY_CTA_URL}}/g, hero.secondaryCtaUrl ?? '#services');
}

function ensureFeatureCount(features: PressPilotFeatureConfig[]): PressPilotFeatureConfig[] {
  const list = [...features];
  const fallback: PressPilotFeatureConfig = {
    icon: '⭐',
    label: 'Feature',
    description: 'Describe a key benefit here.'
  };

  while (list.length < 4) {
    list.push(list[0] ?? { ...fallback });
  }

  return list.slice(0, 4);
}

function injectFeatureTokens(content: string, features: PressPilotFeatureConfig[], heading: string): string {
  const safe = ensureFeatureCount(features);
  let updated = content.replace(/{{FEATURE_SECTION_HEADING}}/g, heading);

  safe.forEach((feature, index) => {
    const token = index + 1;
    const iconRegex = new RegExp(`{{FEATURE_${token}_ICON}}`, 'g');
    const titleRegex = new RegExp(`{{FEATURE_${token}_TITLE}}`, 'g');
    const descRegex = new RegExp(`{{FEATURE_${token}_DESC}}`, 'g');

    updated = updated
      .replace(iconRegex, feature.icon)
      .replace(titleRegex, feature.label)
      .replace(descRegex, feature.description);
  });

  return updated;
}

function injectContactTokens(content: string, contact: PressPilotContactConfig): string {
  return content
    .replace(/{{CONTACT_HEADLINE}}/g, contact.headline)
    .replace(/{{CONTACT_BODY}}/g, contact.body)
    .replace(/{{CONTACT_PRIMARY_CTA}}/g, contact.primaryCta)
    .replace(/{{CONTACT_EMAIL}}/g, contact.email ?? '');
}

export async function applyBusinessCopyToTheme(themeDir: string, copy: PressPilotBusinessCopy, brandName: string) {
  const patternsDir = path.join(themeDir, 'patterns');

  for (const entry of PATTERN_FILES) {
    const filePath = path.join(patternsDir, entry.file);
    try {
      await fs.access(filePath);
    } catch {
      continue;
    }

    const original = await fs.readFile(filePath, 'utf8');
    let updated = original;

    if (entry.type === 'hero') {
      updated = injectHeroTokens(original, copy.hero);
    } else if (entry.type === 'features') {
      updated = injectFeatureTokens(original, copy.features, copy.featuresHeading);
    } else if (entry.type === 'contact') {
      updated = injectContactTokens(original, copy.contact);
    }

    if (updated !== original) {
      await fs.writeFile(filePath, updated, 'utf8');
    }
  }

  await injectFooterBrand(themeDir, brandName);
}

async function injectFooterBrand(themeDir: string, brandName: string) {
  const footerPath = path.join(themeDir, 'parts', 'footer.html');
  try {
    await fs.access(footerPath);
  } catch {
    return;
  }

  const original = await fs.readFile(footerPath, 'utf8');
  const updated = original.replace(/{{BRAND_NAME}}/g, brandName);
  if (updated !== original) {
    await fs.writeFile(footerPath, updated, 'utf8');
  }
}

