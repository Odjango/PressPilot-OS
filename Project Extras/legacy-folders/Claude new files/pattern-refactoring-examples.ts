/**
 * Pattern Refactoring Examples
 * 
 * This file shows how to convert existing patterns from unsafe string
 * templates to the safe block generator approach.
 */

import {
  renderBlock,
  renderGroup,
  renderColumns,
  renderCover,
  renderHeading,
  renderParagraph,
  renderButtons,
  renderImage,
  renderSpacer,
  renderSocialLinks,
  renderSiteTitle,
  renderSiteLogo,
  renderNavigation,
  escapeHtml,
  validateBlockMarkup
} from './block-generator';

// ============================================================================
// EXAMPLE 1: UNIVERSAL HEADER
// ============================================================================

/**
 * ❌ BEFORE: Unsafe string template (CAUSES "Attempt Recovery")
 */
function unsafeHeader_BROKEN(colors: any, slots: any) {
  return `
<!-- wp:group {"style":{"spacing":{"padding":{"top":"20px","bottom":"20px"}}},"backgroundColor":"${colors.lightBg}","layout":{"type":"constrained"}} -->
<div class="wp-block-group has-${colors.lightBg}-background-color has-background" style="padding-top:20px;padding-bottom:20px">
  <!-- wp:columns {"verticalAlignment":"center"} -->
  <div class="wp-block-columns are-vertically-aligned-center">
    <!-- wp:column {"width":"200px"} -->
    <div class="wp-block-column" style="flex-basis:200px">
      <!-- wp:site-logo {"width":120} /-->
    </div>
    <!-- /wp:column -->
    <!-- wp:column -->
    <div class="wp-block-column">
      <!-- wp:navigation {"layout":{"type":"flex","justifyContent":"center"}} /-->
    </div>
    <!-- /wp:column -->
  </div>
  <!-- /wp:columns -->
</div>
<!-- /wp:group -->
`;
}

/**
 * ✅ AFTER: Safe block generator (NO "Attempt Recovery")
 */
function safeHeader(colors: { lightBg: string }, slots: any) {
  // Build header content using safe generators
  const logoColumn = renderBlock('column', { width: '200px' },
    `<div class="wp-block-column" style="flex-basis:200px">
      ${renderSiteLogo({ width: 120 })}
    </div>`
  );

  const navColumn = renderBlock('column', {},
    `<div class="wp-block-column">
      ${renderNavigation({ layout: { type: 'flex', justifyContent: 'center' } })}
    </div>`
  );

  const columnsContent = renderBlock('columns', { verticalAlignment: 'center' },
    `<div class="wp-block-columns are-vertically-aligned-center">
      ${logoColumn}
      ${navColumn}
    </div>`
  );

  return renderGroup(columnsContent, {
    backgroundColor: colors.lightBg,
    style: {
      spacing: {
        padding: { top: '20px', bottom: '20px' }
      }
    }
  });
}

// ============================================================================
// EXAMPLE 2: HERO SECTION (COVER BLOCK)
// ============================================================================

/**
 * ❌ BEFORE: Dangerous - user content could break JSON
 */
function unsafeHero_BROKEN(colors: any, slots: any) {
  // If slots.headline contains a quote like: Welcome to "Best" Coffee
  // This BREAKS: {"overlayColor":"${colors.darkBg}"}
  return `
<!-- wp:cover {"overlayColor":"${colors.darkBg}","minHeight":600,"align":"full","layout":{"type":"constrained"}} -->
<div class="wp-block-cover alignfull" style="min-height:600px">
  <span class="wp-block-cover__background has-${colors.darkBg}-background-color has-background-dim-100 has-background-dim"></span>
  <div class="wp-block-cover__inner-container">
    <!-- wp:heading {"textAlign":"center","level":1,"textColor":"${colors.lightText}"} -->
    <h1 class="wp-block-heading has-text-align-center has-${colors.lightText}-color has-text-color">${slots.headline}</h1>
    <!-- /wp:heading -->
    <!-- wp:paragraph {"align":"center","textColor":"${colors.lightText}"} -->
    <p class="has-text-align-center has-${colors.lightText}-color has-text-color">${slots.subheadline}</p>
    <!-- /wp:paragraph -->
  </div>
</div>
<!-- /wp:cover -->
`;
}

/**
 * ✅ AFTER: Safe - properly escapes all content
 */
function safeHero(
  colors: { darkBg: string; lightText: string },
  slots: { headline: string; subheadline: string; ctaText?: string; ctaUrl?: string }
) {
  // Content is escaped automatically
  const headline = renderHeading(slots.headline, {
    level: 1,
    textAlign: 'center',
    textColor: colors.lightText
  });

  const subheadline = renderParagraph(slots.subheadline, {
    align: 'center',
    textColor: colors.lightText
  });

  // Optional CTA button
  const cta = slots.ctaText 
    ? renderButtons([{
        text: slots.ctaText,
        url: slots.ctaUrl,
        backgroundColor: 'primary'
      }], { layout: { type: 'flex', justifyContent: 'center' } })
    : '';

  const innerContent = `${headline}\n${subheadline}\n${cta}`;

  return renderCover(innerContent, {
    overlayColor: colors.darkBg,
    minHeight: 600,
    align: 'full'
  });
}

// ============================================================================
// EXAMPLE 3: FOOTER WITH SOCIAL LINKS
// ============================================================================

/**
 * ❌ BEFORE: Using wp:html for social icons (RISKY)
 */
function unsafeFooter_BROKEN(colors: any, slots: any) {
  return `
<!-- wp:group {"backgroundColor":"${colors.darkBg}","layout":{"type":"constrained"}} -->
<div class="wp-block-group has-${colors.darkBg}-background-color has-background">
  <!-- wp:html -->
  <div class="social-icons">
    <a href="${slots.facebookUrl}"><svg>...</svg></a>
    <a href="${slots.instagramUrl}"><svg>...</svg></a>
  </div>
  <!-- /wp:html -->
  <!-- wp:paragraph {"align":"center","textColor":"${colors.lightText}"} -->
  <p class="has-text-align-center">© ${slots.year} ${slots.businessName}. Powered by PressPilot.</p>
  <!-- /wp:paragraph -->
</div>
<!-- /wp:group -->
`;
}

/**
 * ✅ AFTER: Using core/social-links (STABLE)
 */
function safeFooter(
  colors: { darkBg: string; lightText: string },
  slots: { 
    facebookUrl?: string; 
    instagramUrl?: string;
    linkedinUrl?: string;
    year: string;
    businessName: string;
  }
) {
  // Build social links array dynamically
  const socialLinks: Array<{ service: any; url: string }> = [];
  if (slots.facebookUrl) socialLinks.push({ service: 'facebook', url: slots.facebookUrl });
  if (slots.instagramUrl) socialLinks.push({ service: 'instagram', url: slots.instagramUrl });
  if (slots.linkedinUrl) socialLinks.push({ service: 'linkedin', url: slots.linkedinUrl });

  const socialSection = socialLinks.length > 0 
    ? renderSocialLinks(socialLinks, {
        iconColor: colors.lightText,
        size: 'has-normal-icon-size'
      })
    : '';

  const copyright = renderParagraph(
    `© ${slots.year} ${slots.businessName}. Powered by PressPilot.`,
    { align: 'center', textColor: colors.lightText }
  );

  return renderGroup(`${socialSection}\n${renderSpacer(30)}\n${copyright}`, {
    backgroundColor: colors.darkBg,
    style: {
      spacing: {
        padding: { top: 'var:preset|spacing|50', bottom: 'var:preset|spacing|50' }
      }
    }
  });
}

// ============================================================================
// EXAMPLE 4: SERVICES SECTION (3 COLUMNS)
// ============================================================================

/**
 * ✅ SAFE: Services grid using renderColumns helper
 */
function safeServicesSection(
  colors: { primary: string; darkText: string },
  slots: {
    title: string;
    services: Array<{
      icon?: string;
      title: string;
      description: string;
    }>;
  }
) {
  // Section heading
  const sectionTitle = renderHeading(slots.title, {
    level: 2,
    textAlign: 'center',
    textColor: colors.darkText
  });

  // Build columns from services array
  const columns = slots.services.slice(0, 3).map(service => ({
    content: `
      ${service.icon ? renderImage({ url: service.icon, alt: service.title, align: 'center' }) : ''}
      ${renderHeading(service.title, { level: 3, textAlign: 'center' })}
      ${renderParagraph(service.description, { align: 'center' })}
    `
  }));

  const servicesGrid = renderColumns(columns, {
    isStackedOnMobile: true
  });

  return renderGroup(`${sectionTitle}\n${renderSpacer(40)}\n${servicesGrid}`, {
    style: {
      spacing: {
        padding: { top: 'var:preset|spacing|60', bottom: 'var:preset|spacing|60' }
      }
    }
  });
}

// ============================================================================
// VALIDATION WRAPPER
// ============================================================================

/**
 * Wraps any pattern generator with validation
 */
function withValidation<T extends (...args: any[]) => string>(
  patternFn: T
): T {
  return ((...args: Parameters<T>): string => {
    const markup = patternFn(...args);
    const validation = validateBlockMarkup(markup);
    
    if (!validation.valid) {
      console.error('Block validation failed:', validation.errors);
      throw new Error(`Invalid block markup: ${validation.errors.join(', ')}`);
    }
    
    return markup;
  }) as T;
}

// Usage: wrap your patterns for safety
const validatedHeader = withValidation(safeHeader);
const validatedHero = withValidation(safeHero);
const validatedFooter = withValidation(safeFooter);

// ============================================================================
// EXPORT
// ============================================================================

export {
  safeHeader,
  safeHero,
  safeFooter,
  safeServicesSection,
  withValidation
};

// ============================================================================
// MIGRATION CHECKLIST
// ============================================================================

/**
 * PATTERN MIGRATION CHECKLIST
 * 
 * For each pattern file in src/generator/patterns/:
 * 
 * □ 1. Import block-generator helpers at top of file
 * □ 2. Replace template literal blocks with renderBlock() calls
 * □ 3. Replace wp:html social icons with renderSocialLinks()
 * □ 4. Use escapeHtml() for any user-provided text content
 * □ 5. Wrap exported function with withValidation()
 * □ 6. Test generated output in WordPress editor
 * 
 * FILES TO MIGRATE (in priority order):
 * □ universal-header.ts
 * □ universal-footer.ts  
 * □ universal-home.ts
 * □ hero-*.ts patterns
 * □ services-*.ts patterns
 * □ about-*.ts patterns
 * □ cta-*.ts patterns
 * □ testimonials-*.ts patterns
 * □ contact-*.ts patterns
 */
