import type { KitSummary } from '@/lib/presspilot/kitSummary';
import type {
  PressPilotBusinessCopy,
  PressPilotFeatureConfig,
  PressPilotPricingTier,
  PressPilotUpdateCard,
  PressPilotHeroConfig,
  PressPilotContactConfig
} from '@/lib/presspilot/kit';

type BuildParams = {
  kit: KitSummary;
  copy: PressPilotBusinessCopy;
};

type PageDefinition = {
  slug: string;
  title: string;
  content: string;
};

const AUTHOR_LOGIN = 'presspilot';
const AUTHOR_EMAIL = 'importer@presspilot.app';

export function buildWpImportXmlFromKit({ kit, copy }: BuildParams): string {
  const brandName = kit.brandName || 'PressPilot Site';
  const baseUrl = `https://presspilot.local/${kit.slug || brandName.toLowerCase().replace(/\s+/g, '-')}`;
  const now = new Date();
  const isEcommerce = detectEcommerce(kit);
  const isRestaurant = detectRestaurant(kit);

  const sections = buildSections(copy, brandName);
  const pages = buildPages({ sections, brandName, isEcommerce, isRestaurant, hero: copy.hero });

  // Create a map of slug -> postId for menu linking
  const pageIdMap = new Map<string, number>();
  pages.forEach((page, index) => {
    pageIdMap.set(page.slug, index + 1);
  });

  const itemsXml = pages
    .map((page, index) => buildItemXml({ page, index, baseUrl, createdAt: now }))
    .join('\n');

  // Build Menu XML if defined in kit
  let menuXml = '';
  let menuItemsXml = '';

  // Use the same menu items as static site (fallback to default list if missing)
  const menuItems = kit.wpImport?.menu?.items || ['home', 'about', 'services', 'blog', 'contact'];

  if (menuItems.length > 0) {
    const menuName = kit.wpImport?.menu?.name || 'Main Menu';
    const menuSlug = menuName.toLowerCase().replace(/\s+/g, '-');
    const menuId = pages.length + 1; // Menu term ID (arbitrary but unique)

    menuXml = buildMenuTermXml({ name: menuName, slug: menuSlug, id: menuId });

    menuItemsXml = menuItems
      .map((itemSlug, index) => {
        const targetPageId = pageIdMap.get(itemSlug);
        // Skip if we can't find the page (unless we want to support custom links later)
        if (!targetPageId) return '';

        // Post ID for the menu item itself (must be unique, start after pages)
        const menuItemId = pages.length + 100 + index;

        return buildMenuItemXml({
          menuSlug,
          menuItemId,
          order: index + 1,
          title: itemSlug.charAt(0).toUpperCase() + itemSlug.slice(1), // Fallback title
          url: `${baseUrl}/${itemSlug}`,
          objectId: targetPageId,
          createdAt: now
        });
      })
      .join('\n');
  }

  const channelXml = `
  <title>${escapeXml(brandName)}</title>
  <link>${escapeXml(baseUrl)}</link>
  <description>${escapeXml(kit.tagline ?? copy.hero.subtitle ?? '')}</description>
  <pubDate>${now.toUTCString()}</pubDate>
  <generator>https://presspilot.os</generator>
  <language>en-US</language>
  <wp:wxr_version>1.2</wp:wxr_version>
  <wp:base_site_url>${escapeXml(baseUrl)}</wp:base_site_url>
  <wp:base_blog_url>${escapeXml(baseUrl)}</wp:base_blog_url>
  <wp:author>
    <wp:author_id>1</wp:author_id>
    <wp:author_login><![CDATA[${AUTHOR_LOGIN}]]></wp:author_login>
    <wp:author_email><![CDATA[${AUTHOR_EMAIL}]]></wp:author_email>
    <wp:author_display_name><![CDATA[PressPilot Importer]]></wp:author_display_name>
    <wp:author_first_name><![CDATA[PressPilot]]></wp:author_first_name>
    <wp:author_last_name><![CDATA[Importer]]></wp:author_last_name>
  </wp:author>
${itemsXml}
${menuXml}
${menuItemsXml}`;

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
  xmlns:content="http://purl.org/rss/1.0/modules/content/"
  xmlns:wfw="http://wellformedweb.org/CommentAPI/"
  xmlns:dc="http://purl.org/dc/elements/1.1/"
  xmlns:wp="http://wordpress.org/export/1.2/"
  xmlns:excerpt="http://wordpress.org/export/1.2/excerpt/"
>
  <channel>${channelXml}
  </channel>
</rss>`;
}

function buildPages({
  sections,
  brandName,
  isEcommerce,
  isRestaurant,
  hero
}: {
  sections: ReturnType<typeof buildSections>;
  brandName: string;
  isEcommerce: boolean;
  isRestaurant: boolean;
  hero: PressPilotHeroConfig;
}): PageDefinition[] {
  const pages: PageDefinition[] = [
    { slug: 'home', title: 'Home', content: joinSections([sections.hero, sections.features, sections.pricing, sections.updates, sections.contact]) },
    { slug: 'about', title: 'About', content: joinSections([sections.featuresWithCustomHeading(`About ${brandName}`), sections.updates, sections.contact]) },
    { slug: 'pricing', title: 'Pricing', content: joinSections([sections.pricing, sections.contact]) },
    { slug: 'updates', title: 'Updates', content: joinSections([sections.updates, sections.contact]) },
    { slug: 'contact', title: 'Contact', content: sections.contact },
    { slug: 'blog', title: 'Blog', content: sections.updates },
    { slug: 'services', title: 'Services', content: joinSections([sections.features, sections.pricing, sections.contact]) }
  ];

  if (isEcommerce) {
    pages.push({
      slug: 'shop',
      title: 'Shop',
      content: joinSections([
        sections.featuresWithCustomHeading('Featured products'),
        sections.pricingWithCustomHeading('Shop bundles', `Collections from ${brandName}`),
        sections.contact
      ])
    });
  }

  if (isRestaurant) {
    // Restaurant / Café archetype: generates Menu page + nav item when businessTypeId === 'restaurant_cafe' or the style slug contains 'restaurant'/'cafe'
    const menuHero = renderMenuHeroBlock(brandName, hero);
    pages.push({
      slug: 'menu',
      title: 'Menu',
      content: joinSections([
        menuHero,
        sections.featuresWithCustomHeading('Menu highlights'),
        sections.pricingWithCustomHeading('Signature courses', `Favorites from ${brandName}`),
        sections.contact
      ])
    });
  }

  return pages;
}

function buildSections(copy: PressPilotBusinessCopy, brandName: string) {
  const hero = renderHeroBlock(copy.hero, brandName);
  const features = renderFeaturesBlock(copy.featuresHeading, copy.features);
  const pricing = renderPricingBlock(copy.pricingHeading, copy.pricingSubheading, copy.pricing);
  const updates = renderUpdatesBlock(copy.updatesHeading, copy.updatesSubheading, copy.updates);
  const contact = renderContactBlock(copy.contact, brandName);

  return {
    hero,
    features,
    pricing,
    updates,
    contact,
    featuresWithCustomHeading: (heading: string) => renderFeaturesBlock(heading, copy.features),
    pricingWithCustomHeading: (heading: string, subheading: string) => renderPricingBlock(heading, subheading, copy.pricing)
  };
}

function renderHeroBlock(hero: PressPilotHeroConfig, brandName: string): string {
  const title = escapeHtml(hero.title || brandName);
  const subtitle = escapeHtml(hero.subtitle || '');
  const primaryLabel = escapeHtml(hero.primaryCta || 'Get started');
  const secondaryLabel = hero.secondaryCta ? escapeHtml(hero.secondaryCta) : null;
  const primaryUrl = escapeAttribute(hero.primaryCtaUrl || '#contact');
  const secondaryUrl = escapeAttribute(hero.secondaryCtaUrl || '#services');

  const secondaryButton = secondaryLabel
    ? `
    <!-- wp:button {"className":"pp-button-secondary is-style-outline btn secondary"} -->
    <div class="wp-block-button pp-button-secondary is-style-outline btn secondary">
      <a class="wp-block-button__link pp-hero-cta-secondary btn secondary" href="${secondaryUrl}">${secondaryLabel}</a>
    </div>
    <!-- /wp:button -->`
    : '';

  return `<!-- wp:group {"align":"full","backgroundColor":"soft-bg","style":{"spacing":{"padding":{"top":"var:preset|spacing|60","right":"var:preset|spacing|40","bottom":"var:preset|spacing|60","left":"var:preset|spacing|40"}}},"layout":{"type":"constrained","contentSize":"1100px"},"className":"presspilot-section presspilot-pattern hero-basic"} -->
<div class="wp-block-group alignfull presspilot-section presspilot-pattern hero-basic has-soft-bg-background-color has-background">
  <!-- wp:group {"layout":{"type":"flex","justifyContent":"center"},"style":{"spacing":{"blockGap":"var:preset|spacing|20"}}} -->
  <div class="wp-block-group">
    <!-- wp:paragraph {"align":"center","textColor":"muted","fontSize":"xs","className":"hero-eyebrow"} -->
    <p class="has-text-align-center has-muted-color has-xs-font-size hero-eyebrow">Built with PressPilot Golden Foundation</p>
    <!-- /wp:paragraph -->
  </div>
  <!-- /wp:group -->

  <!-- wp:heading {"textAlign":"center","level":1,"fontSize":"xxl","className":"hero-title"} -->
  <h1 class="wp-block-heading has-text-align-center has-xxl-font-size pp-hero-headline hero-title">${title}</h1>
  <!-- /wp:heading -->

  <!-- wp:paragraph {"align":"center","fontSize":"lg","className":"hero-subtitle"} -->
  <p class="has-text-align-center has-lg-font-size pp-hero-subheadline hero-subtitle">${subtitle}</p>
  <!-- /wp:paragraph -->

  <!-- wp:buttons {"layout":{"type":"flex","justifyContent":"center"},"style":{"spacing":{"margin":{"top":"var:preset|spacing|40"},"blockGap":"var:preset|spacing|30"}},"className":"pp-hero-ctas hero-ctas"} -->
  <div class="wp-block-buttons pp-hero-ctas hero-ctas" style="margin-top:var(--wp--preset--spacing--40)">
    <!-- wp:button {"className":"pp-button-primary btn primary"} -->
    <div class="wp-block-button pp-button-primary btn primary">
      <a class="wp-block-button__link pp-hero-cta-primary btn primary" href="${primaryUrl}">${primaryLabel}</a>
    </div>
    <!-- /wp:button -->
    ${secondaryButton}
  </div>
  <!-- /wp:buttons -->
</div>
<!-- /wp:group -->`;
}

function renderMenuHeroBlock(brandName: string, hero: PressPilotHeroConfig): string {
  const title = escapeHtml(brandName);
  const subtitle = escapeHtml(hero.subtitle || `Discover our seasonal menu featuring locally sourced ingredients and time-honored recipes.`);
  const primaryLabel = escapeHtml(hero.primaryCta || 'Reserve a table');
  const secondaryLabel = hero.secondaryCta ? escapeHtml(hero.secondaryCta) : null;
  const primaryUrl = escapeAttribute(hero.primaryCtaUrl || '#contact');
  const secondaryUrl = escapeAttribute(hero.secondaryCtaUrl || '#menu');

  const secondaryButton = secondaryLabel
    ? `
    <!-- wp:button {"className":"pp-button-secondary is-style-outline btn secondary"} -->
    <div class="wp-block-button pp-button-secondary is-style-outline btn secondary">
      <a class="wp-block-button__link pp-hero-cta-secondary btn secondary" href="${secondaryUrl}">${secondaryLabel}</a>
    </div>
    <!-- /wp:button -->`
    : '';

  return `<!-- wp:group {"align":"full","backgroundColor":"soft-bg","style":{"spacing":{"padding":{"top":"var:preset|spacing|60","right":"var:preset|spacing|40","bottom":"var:preset|spacing|60","left":"var:preset|spacing|40"}}},"layout":{"type":"constrained","contentSize":"1100px"},"className":"presspilot-section presspilot-pattern hero-basic"} -->
<div class="wp-block-group alignfull presspilot-section presspilot-pattern hero-basic has-soft-bg-background-color has-background">
  <!-- wp:heading {"textAlign":"center","level":1,"fontSize":"xxl","className":"hero-title"} -->
  <h1 class="wp-block-heading has-text-align-center has-xxl-font-size pp-hero-headline hero-title">${title} Menu</h1>
  <!-- /wp:heading -->

  <!-- wp:paragraph {"align":"center","fontSize":"lg","className":"hero-subtitle"} -->
  <p class="has-text-align-center has-lg-font-size pp-hero-subheadline hero-subtitle">${subtitle}</p>
  <!-- /wp:paragraph -->

  <!-- wp:buttons {"layout":{"type":"flex","justifyContent":"center"},"style":{"spacing":{"margin":{"top":"var:preset|spacing|40"},"blockGap":"var:preset|spacing|30"}},"className":"pp-hero-ctas hero-ctas"} -->
  <div class="wp-block-buttons pp-hero-ctas hero-ctas" style="margin-top:var(--wp--preset--spacing--40)">
    <!-- wp:button {"className":"pp-button-primary btn primary"} -->
    <div class="wp-block-button pp-button-primary btn primary">
      <a class="wp-block-button__link pp-hero-cta-primary btn primary" href="${primaryUrl}">${primaryLabel}</a>
    </div>
    <!-- /wp:button -->
    ${secondaryButton}
  </div>
  <!-- /wp:buttons -->
</div>
<!-- /wp:group -->`;
}

function renderFeaturesBlock(heading: string, features: PressPilotFeatureConfig[]): string {
  const safeHeading = escapeHtml(heading || 'Why work with us?');
  const normalized = padArray(features, 4).slice(0, 4);
  const columns = normalized
    .map(
      (feature) => `    <!-- wp:column -->
    <div class="wp-block-column">
      <!-- wp:group {"style":{"spacing":{"blockGap":"var:preset|spacing|20"},"border":{"width":"1px","style":"solid","color":"var:preset|color|border"},"padding":{"top":"var:preset|spacing|30","right":"var:preset|spacing|30","bottom":"var:preset|spacing|30","left":"var:preset|spacing|30"}},"backgroundColor":"soft-bg","className":"pp-card feature-card"} -->
      <div class="wp-block-group has-soft-bg-background-color pp-card feature-card has-background" style="border-color:var(--wp--preset--color--border);border-style:solid;border-width:1px;padding-top:var(--wp--preset--spacing--30);padding-right:var(--wp--preset--spacing--30);padding-bottom:var(--wp--preset--spacing--30);padding-left:var(--wp--preset--spacing--30)">
        <!-- wp:heading {"level":3,"fontSize":"lg"} -->
        <h3 class="wp-block-heading has-lg-font-size pp-feature-title">${escapeHtml(feature.icon ?? '⭐')} ${escapeHtml(feature.label)}</h3>
        <!-- /wp:heading -->
        <!-- wp:paragraph {"fontSize":"sm"} -->
        <p class="has-sm-font-size pp-feature-body">${escapeHtml(feature.description)}</p>
        <!-- /wp:paragraph -->
      </div>
      <!-- /wp:group -->
    </div>
    <!-- /wp:column -->`
    )
    .join('\n');

  return `<!-- wp:group {"style":{"spacing":{"padding":{"top":"var:preset|spacing|50","right":"var:preset|spacing|40","bottom":"var:preset|spacing|50","left":"var:preset|spacing|40"}}},"layout":{"type":"constrained","contentSize":"1100px"},"className":"presspilot-section presspilot-pattern features-grid"} -->
<div class="wp-block-group presspilot-section presspilot-pattern features-grid" style="padding-top:var(--wp--preset--spacing--50);padding-right:var(--wp--preset--spacing--40);padding-bottom:var(--wp--preset--spacing--50);padding-left:var(--wp--preset--spacing--40)">
  <!-- wp:heading {"textAlign":"center","level":2,"fontSize":"xl"} -->
  <h2 class="wp-block-heading has-text-align-center has-xl-font-size">${safeHeading}</h2>
  <!-- /wp:heading -->

  <!-- wp:columns {"style":{"spacing":{"blockGap":"var:preset|spacing|40","margin":{"top":"var:preset|spacing|40"}}},"className":"feature-grid"} -->
  <div class="wp-block-columns feature-grid" style="margin-top:var(--wp--preset--spacing--40)">
${columns}
  </div>
  <!-- /wp:columns -->
</div>
<!-- /wp:group -->`;
}

function renderPricingBlock(heading: string, subheading: string, tiers: PressPilotPricingTier[]): string {
  const safeHeading = escapeHtml(heading || 'Plans for every team');
  const safeSubheading = escapeHtml(subheading || 'Switch tiers any time—kits stay in sync automatically.');
  const normalized = padArray(tiers, 3).slice(0, 3);
  const columns = normalized
    .map((tier) => renderPricingColumn(tier))
    .join('\n');

  return `<!-- wp:group {"style":{"spacing":{"padding":{"top":"var:preset|spacing|50","right":"var:preset|spacing|40","bottom":"var:preset|spacing|50","left":"var:preset|spacing|40"}}},"layout":{"type":"constrained","contentSize":"1100px"},"className":"presspilot-section presspilot-pattern pricing-columns"} -->
<div class="wp-block-group presspilot-section presspilot-pattern pricing-columns" style="padding-top:var(--wp--preset--spacing--50);padding-right:var(--wp--preset--spacing--40);padding-bottom:var(--wp--preset--spacing--50);padding-left:var(--wp--preset--spacing--40)">
  <!-- wp:heading {"textAlign":"center","level":2,"fontSize":"xl"} -->
  <h2 class="wp-block-heading has-text-align-center has-xl-font-size">${safeHeading}</h2>
  <!-- /wp:heading -->

  <!-- wp:paragraph {"align":"center","textColor":"muted","fontSize":"sm","className":"section-subhead"} -->
  <p class="has-text-align-center has-muted-color has-sm-font-size section-subhead">${safeSubheading}</p>
  <!-- /wp:paragraph -->

  <!-- wp:columns {"style":{"spacing":{"margin":{"top":"var:preset|spacing|40"},"blockGap":"var:preset|spacing|40"}},"className":"pricing-grid"} -->
  <div class="wp-block-columns pricing-grid" style="margin-top:var(--wp--preset--spacing--40)">
${columns}
  </div>
  <!-- /wp:columns -->
</div>
<!-- /wp:group -->`;
}

function renderPricingColumn(tier: PressPilotPricingTier): string {
  const highlightClass = tier.highlight ? ' highlight' : '';
  const features = tier.features.map((feature) => `<li>${escapeHtml(feature)}</li>`).join('');

  return `    <!-- wp:column -->
    <div class="wp-block-column">
      <!-- wp:group {"style":{"spacing":{"blockGap":"var:preset|spacing|30"},"border":{"width":"1px","style":"solid","color":"var:preset|color|border"},"padding":{"top":"var:preset|spacing|40","right":"var:preset|spacing|40","bottom":"var:preset|spacing|40","left":"var:preset|spacing|40"}},"layout":{"type":"constrained"},"className":"pp-pricing-card pricing-card${highlightClass}${tier.highlight ? ' pp-pricing-card-highlight' : ''}"} -->
      <div class="wp-block-group pp-pricing-card pricing-card${highlightClass}${tier.highlight ? ' pp-pricing-card-highlight' : ''}" style="${tier.highlight ? 'border-color:var(--wp--preset--color--primary);border-width:2px;' : 'border-color:var(--wp--preset--color--border);border-width:1px;'}border-style:solid;padding-top:var(--wp--preset--spacing--40);padding-right:var(--wp--preset--spacing--40);padding-bottom:var(--wp--preset--spacing--40);padding-left:var(--wp--preset--spacing--40)">
        <!-- wp:heading {"level":3,"fontSize":"lg"} -->
        <h3 class="wp-block-heading has-lg-font-size pp-plan-name">${escapeHtml(tier.name)}</h3>
        <!-- /wp:heading -->
        <!-- wp:paragraph {"fontSize":"xl"} -->
        <p class="has-xl-font-size pp-plan-price">${escapeHtml(tier.price)}</p>
        <!-- /wp:paragraph -->
        <!-- wp:list {"className":"pp-plan-list","fontSize":"sm"} -->
        <ul class="pp-plan-list has-sm-font-size">${features}</ul>
        <!-- /wp:list -->
        <!-- wp:buttons {"layout":{"type":"flex","justifyContent":"stretch"}} -->
        <div class="wp-block-buttons">
          <!-- wp:button {"className":"pp-button-primary btn primary","width":100} -->
          <div class="wp-block-button pp-button-primary btn primary">
            <a class="wp-block-button__link btn primary" href="#contact">${escapeHtml(tier.cta)}</a>
          </div>
          <!-- /wp:button -->
        </div>
        <!-- /wp:buttons -->
      </div>
      <!-- /wp:group -->
    </div>
    <!-- /wp:column -->`;
}

function renderUpdatesBlock(heading: string, subheading: string, updates: PressPilotUpdateCard[]): string {
  const safeHeading = escapeHtml(heading || 'Latest updates');
  const safeSubheading = escapeHtml(subheading || 'Use this strip to keep teammates and customers in the loop.');
  const normalized = padArray(updates, 3).slice(0, 3);
  const columns = normalized
    .map(
      (update) => `    <!-- wp:column -->
    <div class="wp-block-column">
      <!-- wp:group {"style":{"spacing":{"blockGap":"var:preset|spacing|20"},"border":{"width":"1px","style":"solid","color":"var:preset|color|border"},"padding":{"top":"var:preset|spacing|30","right":"var:preset|spacing|30","bottom":"var:preset|spacing|30","left":"var:preset|spacing|30"}},"backgroundColor":"soft-bg","className":"pp-update-card blog-card"} -->
      <div class="wp-block-group pp-update-card blog-card has-soft-bg-background-color has-background" style="border-color:var(--wp--preset--color--border);border-style:solid;border-width:1px;padding-top:var(--wp--preset--spacing--30);padding-right:var(--wp--preset--spacing--30);padding-bottom:var(--wp--preset--spacing--30);padding-left:var(--wp--preset--spacing--30)">
        <!-- wp:paragraph {"textColor":"muted","fontSize":"xs"} -->
        <p class="has-muted-color has-xs-font-size">${escapeHtml(update.eyebrow)}</p>
        <!-- /wp:paragraph -->
        <!-- wp:heading {"level":3,"fontSize":"lg"} -->
        <h3 class="wp-block-heading has-lg-font-size pp-update-title">${escapeHtml(update.title)}</h3>
        <!-- /wp:heading -->
        <!-- wp:paragraph {"fontSize":"sm"} -->
        <p class="has-sm-font-size pp-update-body">${escapeHtml(update.body)}</p>
        <!-- /wp:paragraph -->
      </div>
      <!-- /wp:group -->
    </div>
    <!-- /wp:column -->`
    )
    .join('\n');

  return `<!-- wp:group {"style":{"spacing":{"padding":{"top":"var:preset|spacing|50","right":"var:preset|spacing|40","bottom":"var:preset|spacing|60","left":"var:preset|spacing|40"}}},"layout":{"type":"constrained","contentSize":"1100px"},"className":"presspilot-section presspilot-pattern blog-teasers"} -->
<div class="wp-block-group presspilot-section presspilot-pattern blog-teasers" style="padding-top:var(--wp--preset--spacing--50);padding-right:var(--wp--preset--spacing--40);padding-bottom:var(--wp--preset--spacing--60);padding-left:var(--wp--preset--spacing--40)">
  <!-- wp:heading {"textAlign":"center","level":2,"fontSize":"xl"} -->
  <h2 class="wp-block-heading has-text-align-center has-xl-font-size">${safeHeading}</h2>
  <!-- /wp:heading -->

  <!-- wp:paragraph {"align":"center","textColor":"muted","fontSize":"sm","className":"section-subhead"} -->
  <p class="has-text-align-center has-muted-color has-sm-font-size section-subhead">${safeSubheading}</p>
  <!-- /wp:paragraph -->

  <!-- wp:columns {"style":{"spacing":{"margin":{"top":"var:preset|spacing|40"},"blockGap":"var:preset|spacing|30"}},"className":"blog-grid"} -->
  <div class="wp-block-columns blog-grid" style="margin-top:var(--wp--preset--spacing--40)">
${columns}
  </div>
  <!-- /wp:columns -->
</div>
<!-- /wp:group -->`;
}

function renderContactBlock(contact: PressPilotContactConfig, brandName: string): string {
  const headline = escapeHtml(contact.headline || `Ready to work with ${brandName}?`);
  const body = escapeHtml(contact.body || `Tell us about ${brandName} and we’ll assemble your next launch. Reach us at ${contact.email ?? `hello@${brandName.toLowerCase().replace(/\s+/g, '')}.com`}.`);
  const email = escapeHtml(contact.email ?? `hello@${brandName.toLowerCase().replace(/\s+/g, '')}.com`);
  const cta = escapeHtml(contact.primaryCta || 'Book a call');

  return `<!-- wp:group {"style":{"spacing":{"padding":{"top":"var:preset|spacing|60","right":"var:preset|spacing|40","bottom":"var:preset|spacing|60","left":"var:preset|spacing|40"}}},"backgroundColor":"soft-bg","layout":{"type":"constrained","contentSize":"1100px"},"className":"presspilot-section presspilot-pattern cta-contact"} -->
<div class="wp-block-group presspilot-section presspilot-pattern cta-contact has-soft-bg-background-color has-background" style="padding-top:var(--wp--preset--spacing--60);padding-right:var(--wp--preset--spacing--40);padding-bottom:var(--wp--preset--spacing--60);padding-left:var(--wp--preset--spacing--40)">
  <!-- wp:columns {"style":{"spacing":{"blockGap":"var:preset|spacing|40"}},"className":"cta-contact-grid"} -->
  <div class="wp-block-columns cta-contact-grid">
    <!-- wp:column -->
    <div class="wp-block-column cta-contact__copy">
      <!-- wp:heading {"level":2,"fontSize":"xl"} -->
      <h2 class="wp-block-heading has-xl-font-size pp-contact-heading">${headline}</h2>
      <!-- /wp:heading -->

      <!-- wp:paragraph {"fontSize":"sm"} -->
      <p class="has-sm-font-size pp-contact-body">${body}</p>
      <!-- /wp:paragraph -->

      <!-- wp:list {"fontSize":"sm"} -->
      <ul class="has-sm-font-size"><li><strong>Email:</strong> <span class="pp-contact-email">${email}</span></li></ul>
      <!-- /wp:list -->
    </div>
    <!-- /wp:column -->

    <!-- wp:column -->
    <div class="wp-block-column">
      <!-- wp:group {"style":{"border":{"width":"1px","style":"dashed","color":"var:preset|color|border"},"spacing":{"padding":{"top":"var:preset|spacing|40","right":"var:preset|spacing|40","bottom":"var:preset|spacing|40","left":"var:preset|spacing|40"}},"background":{"color":"var:preset|color|background"}},"layout":{"type":"constrained"},"className":"pp-cta-card cta-contact__card"} -->
      <div class="wp-block-group pp-cta-card cta-contact__card has-background" style="background-color:var(--wp--preset--color--background);border-color:var(--wp--preset--color--border);border-style:dashed;border-width:1px;padding-top:var(--wp--preset--spacing--40);padding-right:var(--wp--preset--spacing--40);padding-bottom:var(--wp--preset--spacing--40);padding-left:var(--wp--preset--spacing--40)">
        <!-- wp:paragraph {"fontSize":"sm"} -->
        <p class="has-sm-font-size">${cta}</p>
        <!-- /wp:paragraph -->
      </div>
      <!-- /wp:group -->
    </div>
    <!-- /wp:column -->
  </div>
  <!-- /wp:columns -->
</div>
<!-- /wp:group -->`;
}

function buildItemXml({
  page,
  index,
  baseUrl,
  createdAt
}: {
  page: PageDefinition;
  index: number;
  baseUrl: string;
  createdAt: Date;
}): string {
  const postId = index + 1;
  const date = new Date(createdAt.getTime() + index * 60 * 1000);
  const formattedDate = formatWpDate(date);
  const content = wrapCdata(page.content);

  return `
  <item>
    <title>${escapeXml(page.title)}</title>
    <link>${escapeXml(`${baseUrl}/${page.slug}`)}</link>
    <pubDate>${date.toUTCString()}</pubDate>
    <dc:creator><![CDATA[${AUTHOR_LOGIN}]]></dc:creator>
    <guid isPermaLink="false">${escapeXml(`${baseUrl}/?page_id=${postId}`)}</guid>
    <description></description>
    <content:encoded>${content}</content:encoded>
    <excerpt:encoded><![CDATA[]]></excerpt:encoded>
    <wp:post_id>${postId}</wp:post_id>
    <wp:post_date>${formattedDate}</wp:post_date>
    <wp:post_date_gmt>${formattedDate}</wp:post_date_gmt>
    <wp:comment_status>closed</wp:comment_status>
    <wp:ping_status>closed</wp:ping_status>
    <wp:post_name>${escapeXml(page.slug)}</wp:post_name>
    <wp:status>publish</wp:status>
    <wp:post_parent>0</wp:post_parent>
    <wp:menu_order>${index}</wp:menu_order>
    <wp:post_type>page</wp:post_type>
    <wp:post_password></wp:post_password>
    <wp:is_sticky>0</wp:is_sticky>
  </item>`;
}

function detectEcommerce(kit: KitSummary): boolean {
  const id = kit.businessTypeId?.toLowerCase() ?? '';
  const style = kit.styleVariation?.toLowerCase() ?? '';
  return id === 'ecommerce_store' || style.includes('ecom') || style.includes('store') || style.includes('shop');
}

/**
 * Restaurant / Café archetype: generates Menu page + nav item when businessTypeId === 'restaurant_cafe' or the style slug contains 'restaurant'/'cafe'
 */
function detectRestaurant(kit: KitSummary): boolean {
  const id = kit.businessTypeId?.toLowerCase() ?? '';
  const style = kit.styleVariation?.toLowerCase() ?? '';
  return id === 'restaurant_cafe' || style.includes('restaurant') || style.includes('cafe') || style.includes('menu');
}

function padArray<T>(items: T[], minLength: number): T[] {
  if (!items || items.length === 0) {
    return [];
  }
  const result = [...items];
  while (result.length < minLength) {
    result.push(result[result.length % items.length]);
  }
  return result;
}

function escapeHtml(value: string | undefined | null): string {
  if (!value) return '';
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function escapeAttribute(value: string | undefined | null): string {
  return escapeHtml(value ?? '');
}

function escapeXml(value: string | undefined | null): string {
  return escapeHtml(value);
}

function wrapCdata(value: string): string {
  return `<![CDATA[${value.replace(/]]>/g, ']]]]><![CDATA[>')}]]>`;
}

function joinSections(sections: string[]): string {
  return sections.filter(Boolean).join('\n\n').trim();
}

function formatWpDate(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  const hours = String(date.getUTCHours()).padStart(2, '0');
  const minutes = String(date.getUTCMinutes()).padStart(2, '0');
  const seconds = String(date.getUTCSeconds()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

function buildMenuTermXml({ name, slug, id }: { name: string; slug: string; id: number }): string {
  return `
  <wp:term>
    <wp:term_id>${id}</wp:term_id>
    <wp:term_taxonomy>nav_menu</wp:term_taxonomy>
    <wp:term_slug><![CDATA[${escapeXml(slug)}]]></wp:term_slug>
    <wp:term_parent></wp:term_parent>
    <wp:term_name><![CDATA[${escapeXml(name)}]]></wp:term_name>
  </wp:term>`;
}

function buildMenuItemXml({
  menuSlug,
  menuItemId,
  order,
  title,
  url,
  objectId,
  createdAt
}: {
  menuSlug: string;
  menuItemId: number;
  order: number;
  title: string;
  url: string;
  objectId: number;
  createdAt: Date;
}): string {
  const date = new Date(createdAt.getTime() + order * 1000); // Stagger times slightly
  const formattedDate = formatWpDate(date);

  return `
  <item>
    <title>${escapeXml(title)}</title>
    <link>${escapeXml(url)}</link>
    <pubDate>${date.toUTCString()}</pubDate>
    <dc:creator><![CDATA[${AUTHOR_LOGIN}]]></dc:creator>
    <guid isPermaLink="false">${escapeXml(url)}</guid>
    <description></description>
    <content:encoded><![CDATA[]]></content:encoded>
    <excerpt:encoded><![CDATA[]]></excerpt:encoded>
    <wp:post_id>${menuItemId}</wp:post_id>
    <wp:post_date>${formattedDate}</wp:post_date>
    <wp:post_date_gmt>${formattedDate}</wp:post_date_gmt>
    <wp:comment_status>closed</wp:comment_status>
    <wp:ping_status>closed</wp:ping_status>
    <wp:post_name>${escapeXml(`menu-item-${menuItemId}`)}</wp:post_name>
    <wp:status>publish</wp:status>
    <wp:post_parent>0</wp:post_parent>
    <wp:menu_order>${order}</wp:menu_order>
    <wp:post_type>nav_menu_item</wp:post_type>
    <wp:post_password></wp:post_password>
    <wp:is_sticky>0</wp:is_sticky>
    <category domain="nav_menu" nicename="${escapeXml(menuSlug)}"><![CDATA[${escapeXml(menuSlug)}]]></category>
    <wp:postmeta>
      <wp:meta_key>_menu_item_type</wp:meta_key>
      <wp:meta_value><![CDATA[post_type]]></wp:meta_value>
    </wp:postmeta>
    <wp:postmeta>
      <wp:meta_key>_menu_item_menu_item_parent</wp:meta_key>
      <wp:meta_value><![CDATA[0]]></wp:meta_value>
    </wp:postmeta>
    <wp:postmeta>
      <wp:meta_key>_menu_item_object_id</wp:meta_key>
      <wp:meta_value><![CDATA[${objectId}]]></wp:meta_value>
    </wp:postmeta>
    <wp:postmeta>
      <wp:meta_key>_menu_item_object</wp:meta_key>
      <wp:meta_value><![CDATA[page]]></wp:meta_value>
    </wp:postmeta>
    <wp:postmeta>
      <wp:meta_key>_menu_item_target</wp:meta_key>
      <wp:meta_value><![CDATA[]]></wp:meta_value>
    </wp:postmeta>
    <wp:postmeta>
      <wp:meta_key>_menu_item_classes</wp:meta_key>
      <wp:meta_value><![CDATA[a:1:{i:0;s:0:"";}]]></wp:meta_value>
    </wp:postmeta>
    <wp:postmeta>
      <wp:meta_key>_menu_item_xfn</wp:meta_key>
      <wp:meta_value><![CDATA[]]></wp:meta_value>
    </wp:postmeta>
    <wp:postmeta>
      <wp:meta_key>_menu_item_url</wp:meta_key>
      <wp:meta_value><![CDATA[]]></wp:meta_value>
    </wp:postmeta>
  </item>`;
}

