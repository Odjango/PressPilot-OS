import fs from 'fs/promises';
import path from 'path';
import {
  PressPilotBusinessCopy,
  PressPilotContactConfig,
  PressPilotFeatureConfig,
  PressPilotHeroConfig
} from '@/lib/presspilot/kit';
import { NavItemSpec } from '@/lib/presspilot/site-architecture';

const PATTERN_FILES = [
  { file: 'hero-basic.php', type: 'hero' as const },
  { file: 'features-grid.php', type: 'features' as const },
  { file: 'pricing-columns.php', type: 'pricing' as const },
  { file: 'blog-teasers.php', type: 'updates' as const },
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

function ensurePricingCount(tiers: PressPilotBusinessCopy['pricing']): PressPilotBusinessCopy['pricing'] {
  const list = [...tiers];
  while (list.length < 3) {
    list.push(list[0]);
  }
  return list.slice(0, 3);
}

function injectPricingTokens(content: string, copy: PressPilotBusinessCopy): string {
  const tiers = ensurePricingCount(copy.pricing);
  let updated = content
    .replace(/{{PRICING_HEADING}}/g, copy.pricingHeading)
    .replace(/{{PRICING_SUBHEADING}}/g, copy.pricingSubheading);

  tiers.forEach((tier, index) => {
    const token = index + 1;
    const cardClassRegex = new RegExp(`{{PRICING_${token}_CARD_CLASS}}`, 'g');
    const nameRegex = new RegExp(`{{PRICING_${token}_NAME}}`, 'g');
    const priceRegex = new RegExp(`{{PRICING_${token}_PRICE}}`, 'g');
    const ctaRegex = new RegExp(`{{PRICING_${token}_CTA}}`, 'g');
    const featuresRegex = new RegExp(`{{PRICING_${token}_FEATURES}}`, 'g');
    const featuresMarkup = tier.features
      .map((feature) => `<li class="pp-plan-feature">${feature}</li>`)
      .join('');

    updated = updated
      .replace(cardClassRegex, tier.highlight ? ' highlight' : '')
      .replace(nameRegex, tier.name)
      .replace(priceRegex, tier.price)
      .replace(ctaRegex, tier.cta)
      .replace(featuresRegex, featuresMarkup);
  });

  return updated;
}

function ensureUpdateCount(updates: PressPilotBusinessCopy['updates']): PressPilotBusinessCopy['updates'] {
  const list = [...updates];
  while (list.length < 3) {
    list.push(list[0]);
  }
  return list.slice(0, 3);
}

function injectUpdateTokens(content: string, copy: PressPilotBusinessCopy): string {
  const updates = ensureUpdateCount(copy.updates);
  let updated = content
    .replace(/{{UPDATES_HEADING}}/g, copy.updatesHeading)
    .replace(/{{UPDATES_SUBHEADING}}/g, copy.updatesSubheading);

  updates.forEach((update, index) => {
    const token = index + 1;
    updated = updated
      .replace(new RegExp(`{{UPDATE_${token}_EYEBROW}}`, 'g'), update.eyebrow)
      .replace(new RegExp(`{{UPDATE_${token}_TITLE}}`, 'g'), update.title)
      .replace(new RegExp(`{{UPDATE_${token}_BODY}}`, 'g'), update.body);
  });

  return updated;
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
    } else if (entry.type === 'pricing') {
      updated = injectPricingTokens(original, copy);
    } else if (entry.type === 'updates') {
      updated = injectUpdateTokens(original, copy);
    } else if (entry.type === 'contact') {
      updated = injectContactTokens(original, copy.contact);
    }

    if (updated !== original) {
      await fs.writeFile(filePath, updated, 'utf8');
    }
  }

  // Footer logic moved to injectFooterContent which calls directly
}

// Helper to map Nav IDs to URLs
function getNavUrl(id: string): string {
  if (id === 'home') return '/';
  return `/${id}`;
}

export async function injectHeaderContent(themeDir: string, navShell: NavItemSpec[]) {
  const headerPath = path.join(themeDir, 'parts', 'header.html');
  try {
    // Ensure directory exists
    await fs.mkdir(path.dirname(headerPath), { recursive: true });
  } catch { }

  const navLinksHtml = navShell
    .map(
      (item) =>
        `<!-- wp:navigation-link {"label":"${item.label}","url":"${getNavUrl(item.id)}","kind":"custom","isTopLevelLink":true} /-->`
    )
    .join('');

  const headerHtml = `<!-- wp:group {"layout":{"type":"constrained"}} -->
<div class="wp-block-group"><!-- wp:group {"align":"wide","layout":{"type":"flex","justifyContent":"space-between","flexWrap":"wrap"}} -->
<div class="wp-block-group"><!-- wp:site-logo {"width":64,"shouldSyncIcon":false} /--><!-- wp:site-title {"level":1,"isLink":true} /--></div>
<!-- wp:navigation {"layout":{"type":"flex","orientation":"horizontal","justifyContent":"right"},"overlayMenu":"mobile"} -->
<nav class="wp-block-navigation is-layout-flex wp-container-nav">${navLinksHtml}</nav><!-- /wp:navigation -->
<!-- /wp:group --></div><!-- /wp:group -->`;

  await fs.writeFile(headerPath, headerHtml, 'utf8');
}

export async function injectFooterContent(themeDir: string, brandName: string, navShell: NavItemSpec[]) {
  const footerPath = path.join(themeDir, 'parts', 'footer.html');
  try {
    await fs.mkdir(path.dirname(footerPath), { recursive: true });
  } catch { }

  const year = new Date().getFullYear();
  const navLinksHtml = navShell
    .map(
      (item) =>
        `<!-- wp:navigation-link {"label":"${item.label}","url":"${getNavUrl(item.id)}","kind":"custom","isTopLevelLink":true} /-->`
    )
    .join('');

  const footerHtml = `<!-- wp:group {"style":{"spacing":{"padding":{"top":"var:preset|spacing|50","bottom":"var:preset|spacing|50"}}},"backgroundColor":"contrast","textColor":"base","layout":{"type":"constrained"}} -->
<div class="wp-block-group has-base-color has-contrast-background-color has-text-color has-background" style="padding-top:var(--wp--preset--spacing--50);padding-bottom:var(--wp--preset--spacing--50)">
<!-- wp:group {"align":"wide","layout":{"type":"flex","justifyContent":"space-between"}} -->
<div class="wp-block-group"><!-- wp:paragraph {"fontSize":"small"} -->
<p class="has-small-font-size">© ${year} ${brandName}</p><!-- /wp:paragraph -->
<!-- wp:navigation {"layout":{"type":"flex","orientation":"horizontal"}} -->
<nav class="wp-block-navigation is-layout-flex wp-container-nav">${navLinksHtml}</nav><!-- /wp:navigation -->
</div><!-- /wp:group --></div><!-- /wp:group -->`;

  await fs.writeFile(footerPath, footerHtml, 'utf8');
}

