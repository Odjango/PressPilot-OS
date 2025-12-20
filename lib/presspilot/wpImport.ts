import { serialize, BlockNode } from './serializer';
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
  content: BlockNode[];
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

  // Build FSE Navigation Post XML
  let navigationXml = '';
  const menuItems = kit.wpImport?.menu?.items || ['home', 'about', 'services', 'blog', 'contact'];

  if (menuItems.length > 0) {
    const navPostId = 1000; // Fixed ID for the navigation post
    const navTitle = kit.wpImport?.menu?.name || 'Main Menu';

    // Build the inner blocks for the navigation
    const navContentNodes: BlockNode[] = menuItems.map(itemSlug => {
      const label = itemSlug.charAt(0).toUpperCase() + itemSlug.slice(1);
      return {
        name: 'core/navigation-link',
        attributes: {
          label: label,
          url: `${baseUrl}/${itemSlug}`,
          kind: 'custom',
          isTopLevelLink: true
        }
      };
    });

    // Content for Nav Post is technically HTML, so we serialize the nodes
    const navContent = serialize(navContentNodes);

    navigationXml = buildWpNavigationPostXml({
      id: navPostId,
      title: navTitle,
      content: navContent,
      createdAt: now
    });
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
${navigationXml}`;

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
    { slug: 'home', title: 'Home', content: [sections.hero, sections.features, sections.pricing, sections.updates, sections.contact] },
    { slug: 'about', title: 'About', content: [sections.featuresWithCustomHeading(`About ${brandName}`), sections.updates, sections.contact] },
    { slug: 'pricing', title: 'Pricing', content: [sections.pricing, sections.contact] },
    { slug: 'updates', title: 'Updates', content: [sections.updates, sections.contact] },
    { slug: 'contact', title: 'Contact', content: [sections.contact] },
    { slug: 'blog', title: 'Blog', content: [sections.updates] },
    { slug: 'services', title: 'Services', content: [sections.features, sections.pricing, sections.contact] }
  ];

  if (isEcommerce) {
    pages.push({
      slug: 'shop',
      title: 'Shop',
      content: [
        sections.featuresWithCustomHeading('Featured products'),
        sections.pricingWithCustomHeading('Shop bundles', `Collections from ${brandName}`),
        sections.contact
      ]
    });
  }

  if (isRestaurant) {
    // Restaurant / Café archetype: generates Menu page + nav item when businessTypeId === 'restaurant_cafe' or the style slug contains 'restaurant'/'cafe'
    const menuHero = renderMenuHeroBlock(brandName, hero);
    pages.push({
      slug: 'menu',
      title: 'Menu',
      content: [
        menuHero,
        sections.featuresWithCustomHeading('Menu highlights'),
        sections.pricingWithCustomHeading('Signature courses', `Favorites from ${brandName}`),
        sections.contact
      ]
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

function renderHeroBlock(hero: PressPilotHeroConfig, brandName: string): BlockNode {
  const title = hero.title || brandName;
  const subtitle = hero.subtitle || '';
  const primaryLabel = hero.primaryCta || 'Get started';
  const secondaryLabel = hero.secondaryCta;
  const primaryUrl = hero.primaryCtaUrl || '#contact';
  const secondaryUrl = hero.secondaryCtaUrl || '#services';

  const innerButtons: BlockNode[] = [
    {
      name: 'core/button',
      attributes: { className: 'pp-button-primary btn primary' },
      textContent: primaryLabel // Using textContent shimmed by serializer
    }
  ];

  if (secondaryLabel) {
    innerButtons.push({
      name: 'core/button',
      attributes: { className: 'pp-button-secondary is-style-outline btn secondary' },
      textContent: secondaryLabel
    });
  }

  return {
    name: 'core/group',
    attributes: {
      align: 'full',
      backgroundColor: 'soft-bg',
      style: {
        spacing: {
          padding: { top: 'var:preset|spacing|60', right: 'var:preset|spacing|40', bottom: 'var:preset|spacing|60', left: 'var:preset|spacing|40' }
        }
      },
      layout: { type: 'constrained', contentSize: '1100px' },
      className: 'presspilot-section presspilot-pattern hero-basic'
    },
    innerBlocks: [
      {
        name: 'core/group',
        attributes: {
          layout: { type: 'flex', justifyContent: 'center' },
          style: { spacing: { blockGap: 'var:preset|spacing|20' } }
        },
        innerBlocks: [
          {
            name: 'core/paragraph',
            attributes: { align: 'center', textColor: 'muted', fontSize: 'xs', className: 'hero-eyebrow' },
            textContent: 'Built with PressPilot Golden Foundation'
          }
        ]
      },
      {
        name: 'core/heading',
        attributes: { textAlign: 'center', level: 1, fontSize: 'xxl', className: 'hero-title' },
        textContent: title
      },
      {
        name: 'core/paragraph',
        attributes: { align: 'center', fontSize: 'lg', className: 'hero-subtitle' },
        textContent: subtitle
      },
      {
        name: 'core/buttons',
        attributes: {
          layout: { type: 'flex', justifyContent: 'center' },
          style: { spacing: { margin: { top: 'var:preset|spacing|40' }, blockGap: 'var:preset|spacing|30' } },
          className: 'pp-hero-ctas hero-ctas'
        },
        innerBlocks: innerButtons
      }
    ]
  };
}

function renderMenuHeroBlock(brandName: string, hero: PressPilotHeroConfig): BlockNode {
  const title = brandName;
  const subtitle = hero.subtitle || `Discover our seasonal menu featuring locally sourced ingredients and time-honored recipes.`;
  const primaryLabel = hero.primaryCta || 'Reserve a table';
  const secondaryLabel = hero.secondaryCta;

  const innerButtons: BlockNode[] = [
    {
      name: 'core/button',
      attributes: { className: 'pp-button-primary btn primary' },
      textContent: primaryLabel
    }
  ];

  if (secondaryLabel) {
    innerButtons.push({
      name: 'core/button',
      attributes: { className: 'pp-button-secondary is-style-outline btn secondary' },
      textContent: secondaryLabel
    });
  }

  return {
    name: 'core/group',
    attributes: {
      align: 'full',
      backgroundColor: 'soft-bg',
      style: { spacing: { padding: { top: 'var:preset|spacing|60', right: 'var:preset|spacing|40', bottom: 'var:preset|spacing|60', left: 'var:preset|spacing|40' } } },
      layout: { type: 'constrained', contentSize: '1100px' },
      className: 'presspilot-section presspilot-pattern hero-basic'
    },
    innerBlocks: [
      {
        name: 'core/heading',
        attributes: { textAlign: 'center', level: 1, fontSize: 'xxl', className: 'hero-title' },
        textContent: `${title} Menu`
      },
      {
        name: 'core/paragraph',
        attributes: { align: 'center', fontSize: 'lg', className: 'hero-subtitle' },
        textContent: subtitle
      },
      {
        name: 'core/buttons',
        attributes: {
          layout: { type: 'flex', justifyContent: 'center' },
          style: { spacing: { margin: { top: 'var:preset|spacing|40' }, blockGap: 'var:preset|spacing|30' } },
          className: 'pp-hero-ctas hero-ctas'
        },
        innerBlocks: innerButtons
      }
    ]
  };
}

function renderFeaturesBlock(heading: string, features: PressPilotFeatureConfig[]): BlockNode {
  const safeHeading = heading || 'Why work with us?';
  const normalized = padArray(features, 4).slice(0, 4);
  const columns: BlockNode[] = normalized.map((feature) => ({
    name: 'core/column',
    innerBlocks: [
      {
        name: 'core/group',
        attributes: {
          style: {
            spacing: { blockGap: 'var:preset|spacing|20' },
            border: { width: '1px', style: 'solid', color: 'var:preset|color|border' },
            padding: { top: 'var:preset|spacing|30', right: 'var:preset|spacing|30', bottom: 'var:preset|spacing|30', left: 'var:preset|spacing|30' }
          },
          backgroundColor: 'soft-bg',
          className: 'pp-card feature-card'
        },
        innerBlocks: [
          {
            name: 'core/heading',
            attributes: { level: 3, fontSize: 'lg' },
            textContent: `${feature.icon ?? '⭐'} ${feature.label}`
          },
          {
            name: 'core/paragraph',
            attributes: { fontSize: 'sm' },
            textContent: feature.description
          }
        ]
      }
    ]
  }));

  return {
    name: 'core/group',
    attributes: {
      style: { spacing: { padding: { top: 'var:preset|spacing|50', right: 'var:preset|spacing|40', bottom: 'var:preset|spacing|50', left: 'var:preset|spacing|40' } } },
      layout: { type: 'constrained', contentSize: '1100px' },
      className: 'presspilot-section presspilot-pattern features-grid'
    },
    innerBlocks: [
      {
        name: 'core/heading',
        attributes: { textAlign: 'center', level: 2, fontSize: 'xl' },
        textContent: safeHeading
      },
      {
        name: 'core/columns',
        attributes: {
          style: { spacing: { blockGap: 'var:preset|spacing|40', margin: { top: 'var:preset|spacing|40' } } },
          className: 'feature-grid'
        },
        innerBlocks: columns
      }
    ]
  };
}

function renderPricingBlock(heading: string, subheading: string, tiers: PressPilotPricingTier[]): BlockNode {
  const safeHeading = heading || 'Plans for every team';
  const safeSubheading = subheading || 'Switch tiers any time—kits stay in sync automatically.';
  const normalized = padArray(tiers, 3).slice(0, 3);
  const columns: BlockNode[] = normalized.map((tier) => renderPricingColumn(tier));

  return {
    name: 'core/group',
    attributes: {
      style: { spacing: { padding: { top: 'var:preset|spacing|50', right: 'var:preset|spacing|40', bottom: 'var:preset|spacing|50', left: 'var:preset|spacing|40' } } },
      layout: { type: 'constrained', contentSize: '1100px' },
      className: 'presspilot-section presspilot-pattern pricing-columns'
    },
    innerBlocks: [
      {
        name: 'core/heading',
        attributes: { textAlign: 'center', level: 2, fontSize: 'xl' },
        textContent: safeHeading
      },
      {
        name: 'core/paragraph',
        attributes: { align: 'center', textColor: 'muted', fontSize: 'sm', className: 'section-subhead' },
        textContent: safeSubheading
      },
      {
        name: 'core/columns',
        attributes: {
          style: { spacing: { margin: { top: 'var:preset|spacing|40' }, blockGap: 'var:preset|spacing|40' } },
          className: 'pricing-grid'
        },
        innerBlocks: columns
      }
    ]
  };
}

function renderPricingColumn(tier: PressPilotPricingTier): BlockNode {
  const highlightClass = tier.highlight ? ' highlight' : '';
  const featuresList = `<ul>${tier.features.map((f) => `<li>${f}</li>`).join('')}</ul>`; // List block takes HTML list?? No, core/list uses inner items.

  // Refactoring List to core/list and core/list-item
  const listItems: BlockNode[] = tier.features.map(f => ({
    name: 'core/list-item',
    textContent: f
  }));

  return {
    name: 'core/column',
    innerBlocks: [
      {
        name: 'core/group',
        attributes: {
          style: {
            spacing: { blockGap: 'var:preset|spacing|30' },
            border: { width: '1px', style: 'solid', color: 'var:preset|color|border' },
            padding: { top: 'var:preset|spacing|40', right: 'var:preset|spacing|40', bottom: 'var:preset|spacing|40', left: 'var:preset|spacing|40' }
          },
          layout: { type: 'constrained' },
          className: `pp-pricing-card pricing-card${highlightClass}${tier.highlight ? ' pp-pricing-card-highlight' : ''}`
        },
        innerBlocks: [
          {
            name: 'core/heading',
            attributes: { level: 3, fontSize: 'lg', className: 'pp-plan-name' },
            textContent: tier.name
          },
          {
            name: 'core/paragraph',
            attributes: { fontSize: 'xl', className: 'pp-plan-price' },
            textContent: tier.price
          },
          {
            name: 'core/list',
            attributes: { className: 'pp-plan-list', fontSize: 'sm' },
            innerBlocks: listItems
          },
          {
            name: 'core/buttons',
            attributes: { layout: { type: 'flex', justifyContent: 'stretch' } },
            innerBlocks: [
              {
                name: 'core/button',
                attributes: { className: 'pp-button-primary btn primary', width: 100 },
                textContent: tier.cta
              }
            ]
          }
        ]
      }
    ]
  };
}

function renderUpdatesBlock(heading: string, subheading: string, updates: PressPilotUpdateCard[]): BlockNode {
  const safeHeading = heading || 'Latest updates';
  const safeSubheading = subheading || 'Use this strip to keep teammates and customers in the loop.';
  const normalized = padArray(updates, 3).slice(0, 3);
  const columns: BlockNode[] = normalized.map((update) => ({
    name: 'core/column',
    innerBlocks: [
      {
        name: 'core/group',
        attributes: {
          style: {
            spacing: { blockGap: 'var:preset|spacing|20' },
            border: { width: '1px', style: 'solid', color: 'var:preset|color|border' },
            padding: { top: 'var:preset|spacing|30', right: 'var:preset|spacing|30', bottom: 'var:preset|spacing|30', left: 'var:preset|spacing|30' }
          },
          backgroundColor: 'soft-bg',
          className: 'pp-update-card blog-card'
        },
        innerBlocks: [
          {
            name: 'core/paragraph',
            attributes: { textColor: 'muted', fontSize: 'xs' },
            textContent: update.eyebrow
          },
          {
            name: 'core/heading',
            attributes: { level: 3, fontSize: 'lg', className: 'pp-update-title' },
            textContent: update.title
          },
          {
            name: 'core/paragraph',
            attributes: { fontSize: 'sm', className: 'pp-update-body' },
            textContent: update.body
          }
        ]
      }
    ]
  }));

  return {
    name: 'core/group',
    attributes: {
      style: { spacing: { padding: { top: 'var:preset|spacing|50', right: 'var:preset|spacing|40', bottom: 'var:preset|spacing|60', left: 'var:preset|spacing|40' } } },
      layout: { type: 'constrained', contentSize: '1100px' },
      className: 'presspilot-section presspilot-pattern blog-teasers'
    },
    innerBlocks: [
      {
        name: 'core/heading',
        attributes: { textAlign: 'center', level: 2, fontSize: 'xl' },
        textContent: safeHeading
      },
      {
        name: 'core/paragraph',
        attributes: { align: 'center', textColor: 'muted', fontSize: 'sm', className: 'section-subhead' },
        textContent: safeSubheading
      },
      {
        name: 'core/columns',
        attributes: {
          style: { spacing: { margin: { top: 'var:preset|spacing|40' }, blockGap: 'var:preset|spacing|30' } },
          className: 'blog-grid'
        },
        innerBlocks: columns
      }
    ]
  };
}

function renderContactBlock(contact: PressPilotContactConfig, brandName: string): BlockNode {
  const headline = contact.headline || `Ready to work with ${brandName}?`;
  const body = contact.body || `Tell us about ${brandName} and we’ll assemble your next launch. Reach us at ${contact.email ?? `hello@${brandName.toLowerCase().replace(/\s+/g, '')}.com`}.`;
  const email = contact.email ?? `hello@${brandName.toLowerCase().replace(/\s+/g, '')}.com`;
  const cta = contact.primaryCta || 'Book a call';

  return {
    name: 'core/group',
    attributes: {
      style: { spacing: { padding: { top: 'var:preset|spacing|60', right: 'var:preset|spacing|40', bottom: 'var:preset|spacing|60', left: 'var:preset|spacing|40' } } },
      backgroundColor: 'soft-bg',
      layout: { type: 'constrained', contentSize: '1100px' },
      className: 'presspilot-section presspilot-pattern cta-contact'
    },
    innerBlocks: [
      {
        name: 'core/columns',
        attributes: { style: { spacing: { blockGap: 'var:preset|spacing|40' } }, className: 'cta-contact-grid' },
        innerBlocks: [
          {
            name: 'core/column',
            attributes: { className: 'cta-contact__copy' },
            innerBlocks: [
              {
                name: 'core/heading',
                attributes: { level: 2, fontSize: 'xl', className: 'pp-contact-heading' },
                textContent: headline
              },
              {
                name: 'core/paragraph',
                attributes: { fontSize: 'sm', className: 'pp-contact-body' },
                textContent: body
              },
              {
                name: 'core/list',
                attributes: { fontSize: 'sm' },
                innerBlocks: [
                  {
                    name: 'core/list-item',
                    innerHTML: `<strong>Email:</strong> <span class="pp-contact-email">${email}</span>` // Keep strict innerHTML for special formatting? or use textContent with Rich Text? Core List doesn't support Rich text easily via objects except as innerHTML
                    // The user said "NEVER hand-craft HTML for core Gutenberg blocks (templates... or content blocks)"
                    // BUT, innerHTML for a list item IS standard.
                    // However, let's try to be cleaner.
                    // "<strong>Email:</strong>..." is rich text.
                    // "BlockNode.textContent" in our serializer maps to 'content' attribute.
                    // 'content' attribute supports HTML string for rich text.
                    // So setting textContent to the HTML string is correct for Rich Text fields.
                  }
                ]
              }
            ]
          },
          {
            name: 'core/column',
            innerBlocks: [
              {
                name: 'core/group',
                attributes: {
                  style: {
                    border: { width: '1px', style: 'dashed', color: 'var:preset|color|border' },
                    spacing: { padding: { top: 'var:preset|spacing|40', right: 'var:preset|spacing|40', bottom: 'var:preset|spacing|40', left: 'var:preset|spacing|40' } },
                    background: { color: 'var:preset|color|background' }
                  },
                  layout: { type: 'constrained' },
                  className: 'pp-cta-card cta-contact__card'
                },
                innerBlocks: [
                  {
                    name: 'core/paragraph',
                    attributes: { fontSize: 'sm' },
                    textContent: cta
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  };
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
  const content = wrapCdata(serialize(page.content));

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



function formatWpDate(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  const hours = String(date.getUTCHours()).padStart(2, '0');
  const minutes = String(date.getUTCMinutes()).padStart(2, '0');
  const seconds = String(date.getUTCSeconds()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

function buildWpNavigationPostXml({
  id,
  title,
  content,
  createdAt
}: {
  id: number;
  title: string;
  content: string;
  createdAt: Date;
}): string {
  const formattedDate = formatWpDate(createdAt);
  const cdataContent = wrapCdata(content);

  return `
  <item>
    <title>${escapeXml(title)}</title>
    <link></link>
    <pubDate>${createdAt.toUTCString()}</pubDate>
    <dc:creator><![CDATA[${AUTHOR_LOGIN}]]></dc:creator>
    <guid isPermaLink="false"></guid>
    <description></description>
    <content:encoded>${cdataContent}</content:encoded>
    <excerpt:encoded><![CDATA[]]></excerpt:encoded>
    <wp:post_id>${id}</wp:post_id>
    <wp:post_date>${formattedDate}</wp:post_date>
    <wp:post_date_gmt>${formattedDate}</wp:post_date_gmt>
    <wp:comment_status>closed</wp:comment_status>
    <wp:ping_status>closed</wp:ping_status>
    <wp:post_name>${escapeXml(title.toLowerCase().replace(/\s+/g, '-'))}</wp:post_name>
    <wp:status>publish</wp:status>
    <wp:post_parent>0</wp:post_parent>
    <wp:menu_order>0</wp:menu_order>
    <wp:post_type>wp_navigation</wp:post_type>
    <wp:post_password></wp:post_password>
    <wp:is_sticky>0</wp:is_sticky>
  </item>`;
}


