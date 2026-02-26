/**
 * Safe Block Generator for WordPress FSE Themes
 * 
 * This utility eliminates "Attempt Recovery" errors caused by
 * malformed JSON in block attributes by using proper serialization.
 * 
 * @module block-generator
 * @version 1.0.0
 */

// ============================================================================
// CORE BLOCK GENERATOR
// ============================================================================

/**
 * Safely renders a WordPress block with properly serialized JSON attributes.
 * 
 * @param name - Block name without 'wp:' prefix (e.g., 'group', 'cover', 'columns')
 * @param attrs - Block attributes object (will be JSON.stringify'd safely)
 * @param content - Inner HTML content (can include nested blocks)
 * @returns Valid WordPress block markup
 * 
 * @example
 * renderBlock('cover', 
 *   { overlayColor: 'primary', minHeight: 500 },
 *   '<div class="wp-block-cover__inner-container">...</div>'
 * )
 */
export function renderBlock(
  name: string,
  attrs: Record<string, unknown> = {},
  content: string = ''
): string {
  // Clean undefined values from attributes
  const cleanAttrs = Object.fromEntries(
    Object.entries(attrs).filter(([_, v]) => v !== undefined)
  );
  
  // Serialize attributes safely
  const jsonAttrs = Object.keys(cleanAttrs).length > 0 
    ? ` ${JSON.stringify(cleanAttrs)}` 
    : '';
  
  // Self-closing block (no content)
  if (!content.trim()) {
    return `<!-- wp:${name}${jsonAttrs} /-->`;
  }
  
  // Block with content
  return `<!-- wp:${name}${jsonAttrs} -->
${content}
<!-- /wp:${name} -->`;
}

/**
 * Renders a self-closing block (like spacer, separator)
 */
export function renderSelfClosingBlock(
  name: string,
  attrs: Record<string, unknown> = {}
): string {
  const cleanAttrs = Object.fromEntries(
    Object.entries(attrs).filter(([_, v]) => v !== undefined)
  );
  const jsonAttrs = Object.keys(cleanAttrs).length > 0 
    ? ` ${JSON.stringify(cleanAttrs)}` 
    : '';
  return `<!-- wp:${name}${jsonAttrs} /-->`;
}

// ============================================================================
// SPECIALIZED BLOCK HELPERS
// ============================================================================

/**
 * Creates a Group block (most common container)
 */
export function renderGroup(
  content: string,
  options: {
    layout?: 'constrained' | 'default' | 'flex' | 'grid';
    tagName?: 'div' | 'section' | 'main' | 'article' | 'aside' | 'header' | 'footer';
    backgroundColor?: string;
    textColor?: string;
    className?: string;
    style?: Record<string, unknown>;
    align?: 'wide' | 'full';
  } = {}
): string {
  const { layout = 'constrained', tagName = 'div', ...rest } = options;
  
  const attrs: Record<string, unknown> = {
    ...rest,
    tagName: tagName !== 'div' ? tagName : undefined,
    layout: { type: layout }
  };
  
  const Tag = tagName;
  const classes = ['wp-block-group', options.className].filter(Boolean).join(' ');
  
  return renderBlock('group', attrs, 
    `<${Tag} class="${classes}">${content}</${Tag}>`
  );
}

/**
 * Creates a Columns block with nested Column blocks
 */
export function renderColumns(
  columns: Array<{ content: string; width?: string; verticalAlignment?: string }>,
  options: {
    isStackedOnMobile?: boolean;
    verticalAlignment?: 'top' | 'center' | 'bottom';
    className?: string;
  } = {}
): string {
  const columnsAttrs: Record<string, unknown> = {
    isStackedOnMobile: options.isStackedOnMobile ?? true,
    verticalAlignment: options.verticalAlignment,
    className: options.className
  };
  
  const columnsContent = columns.map(col => {
    const colAttrs: Record<string, unknown> = {
      width: col.width,
      verticalAlignment: col.verticalAlignment
    };
    return renderBlock('column', colAttrs,
      `<div class="wp-block-column">${col.content}</div>`
    );
  }).join('\n\n');
  
  return renderBlock('columns', columnsAttrs,
    `<div class="wp-block-columns">${columnsContent}</div>`
  );
}

/**
 * Creates a Cover block (hero sections)
 */
export function renderCover(
  content: string,
  options: {
    url?: string;
    alt?: string;
    overlayColor?: string;
    customOverlayColor?: string;
    dimRatio?: number;
    minHeight?: number;
    minHeightUnit?: string;
    align?: 'wide' | 'full';
    className?: string;
    style?: Record<string, unknown>;
  } = {}
): string {
  const attrs: Record<string, unknown> = {
    ...options,
    layout: { type: 'constrained' }
  };
  
  // Build background style
  let bgStyle = '';
  if (options.url) {
    bgStyle = `background-image:url(${options.url})`;
  } else if (options.customOverlayColor) {
    bgStyle = `background-color:${options.customOverlayColor}`;
  }
  
  const minHeightStyle = options.minHeight 
    ? `min-height:${options.minHeight}${options.minHeightUnit || 'px'}` 
    : '';
  
  const styleAttr = [bgStyle, minHeightStyle].filter(Boolean).join(';');
  
  return renderBlock('cover', attrs,
    `<div class="wp-block-cover"${styleAttr ? ` style="${styleAttr}"` : ''}>
<span aria-hidden="true" class="wp-block-cover__background has-background-dim"></span>
<div class="wp-block-cover__inner-container">
${content}
</div>
</div>`
  );
}

/**
 * Creates a Heading block
 */
export function renderHeading(
  text: string,
  options: {
    level?: 1 | 2 | 3 | 4 | 5 | 6;
    textAlign?: 'left' | 'center' | 'right';
    textColor?: string;
    className?: string;
    style?: Record<string, unknown>;
  } = {}
): string {
  const { level = 2, textAlign, ...rest } = options;
  const attrs: Record<string, unknown> = {
    ...rest,
    level,
    textAlign
  };
  
  const Tag = `h${level}`;
  const alignClass = textAlign ? ` has-text-align-${textAlign}` : '';
  
  return renderBlock('heading', attrs,
    `<${Tag} class="wp-block-heading${alignClass}">${escapeHtml(text)}</${Tag}>`
  );
}

/**
 * Creates a Paragraph block
 */
export function renderParagraph(
  text: string,
  options: {
    align?: 'left' | 'center' | 'right';
    textColor?: string;
    backgroundColor?: string;
    className?: string;
    style?: Record<string, unknown>;
  } = {}
): string {
  const { align, ...rest } = options;
  const attrs: Record<string, unknown> = {
    ...rest,
    align
  };
  
  const alignClass = align ? ` has-text-align-${align}` : '';
  
  return renderBlock('paragraph', attrs,
    `<p class="${alignClass}">${escapeHtml(text)}</p>`
  );
}

/**
 * Creates a Buttons container with Button blocks
 */
export function renderButtons(
  buttons: Array<{
    text: string;
    url?: string;
    style?: 'fill' | 'outline';
    backgroundColor?: string;
    textColor?: string;
    className?: string;
  }>,
  options: {
    layout?: { type: 'flex'; justifyContent?: string };
    className?: string;
  } = {}
): string {
  const buttonsContent = buttons.map(btn => {
    const btnAttrs: Record<string, unknown> = {
      backgroundColor: btn.backgroundColor,
      textColor: btn.textColor,
      className: btn.className
    };
    
    const linkContent = btn.url 
      ? `<a class="wp-block-button__link wp-element-button" href="${escapeHtml(btn.url)}">${escapeHtml(btn.text)}</a>`
      : `<span class="wp-block-button__link wp-element-button">${escapeHtml(btn.text)}</span>`;
    
    return renderBlock('button', btnAttrs,
      `<div class="wp-block-button${btn.style === 'outline' ? ' is-style-outline' : ''}">${linkContent}</div>`
    );
  }).join('\n');
  
  return renderBlock('buttons', options,
    `<div class="wp-block-buttons">${buttonsContent}</div>`
  );
}

/**
 * Creates an Image block
 */
export function renderImage(
  options: {
    url: string;
    alt?: string;
    caption?: string;
    width?: number;
    height?: number;
    sizeSlug?: 'thumbnail' | 'medium' | 'large' | 'full';
    linkDestination?: 'none' | 'media' | 'attachment';
    align?: 'left' | 'center' | 'right' | 'wide' | 'full';
    className?: string;
  }
): string {
  const attrs: Record<string, unknown> = {
    url: options.url,
    alt: options.alt || '',
    sizeSlug: options.sizeSlug || 'full',
    linkDestination: options.linkDestination || 'none',
    align: options.align,
    className: options.className
  };
  
  if (options.width) attrs.width = options.width;
  if (options.height) attrs.height = options.height;
  
  const imgTag = `<img src="${escapeHtml(options.url)}" alt="${escapeHtml(options.alt || '')}"${options.width ? ` width="${options.width}"` : ''}${options.height ? ` height="${options.height}"` : ''}/>`;
  const captionTag = options.caption 
    ? `<figcaption class="wp-element-caption">${escapeHtml(options.caption)}</figcaption>` 
    : '';
  
  return renderBlock('image', attrs,
    `<figure class="wp-block-image size-${options.sizeSlug || 'full'}">${imgTag}${captionTag}</figure>`
  );
}

/**
 * Creates a Spacer block
 */
export function renderSpacer(height: number = 50, unit: string = 'px'): string {
  return renderSelfClosingBlock('spacer', { 
    height: `${height}${unit}` 
  });
}

/**
 * Creates a Separator block
 */
export function renderSeparator(
  options: {
    style?: 'default' | 'wide' | 'dots';
    color?: string;
    className?: string;
  } = {}
): string {
  const attrs: Record<string, unknown> = {
    className: options.style ? `is-style-${options.style}` : undefined,
    backgroundColor: options.color
  };
  
  return renderBlock('separator', attrs,
    '<hr class="wp-block-separator has-alpha-channel-opacity"/>'
  );
}

/**
 * Creates Social Links block (replacement for wp:html social icons)
 */
export function renderSocialLinks(
  links: Array<{
    service: 'facebook' | 'twitter' | 'instagram' | 'linkedin' | 'youtube' | 'tiktok' | 'pinterest' | 'whatsapp' | 'email';
    url: string;
  }>,
  options: {
    iconColor?: string;
    iconBackgroundColor?: string;
    size?: 'has-small-icon-size' | 'has-normal-icon-size' | 'has-large-icon-size' | 'has-huge-icon-size';
    className?: string;
  } = {}
): string {
  const attrs: Record<string, unknown> = {
    iconColor: options.iconColor,
    iconBackgroundColor: options.iconBackgroundColor,
    className: [options.size || 'has-normal-icon-size', options.className].filter(Boolean).join(' ')
  };
  
  const linksContent = links.map(link => 
    renderBlock(`social-link`, { service: link.service, url: link.url })
  ).join('\n');
  
  return renderBlock('social-links', attrs,
    `<ul class="wp-block-social-links">${linksContent}</ul>`
  );
}

/**
 * Creates a Navigation block
 */
export function renderNavigation(
  options: {
    ref?: number;
    overlayMenu?: 'never' | 'mobile' | 'always';
    icon?: 'menu';
    hasIcon?: boolean;
    layout?: { type: 'flex'; justifyContent?: string };
    textColor?: string;
    backgroundColor?: string;
    className?: string;
  } = {}
): string {
  return renderSelfClosingBlock('navigation', {
    ...options,
    layout: options.layout || { type: 'flex', justifyContent: 'center' }
  });
}

/**
 * Creates a Site Title block
 */
export function renderSiteTitle(
  options: {
    level?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
    isLink?: boolean;
    linkTarget?: '_self' | '_blank';
    textAlign?: 'left' | 'center' | 'right';
    textColor?: string;
    className?: string;
  } = {}
): string {
  return renderSelfClosingBlock('site-title', {
    level: options.level ?? 1,
    isLink: options.isLink ?? true,
    ...options
  });
}

/**
 * Creates a Site Logo block
 */
export function renderSiteLogo(
  options: {
    width?: number;
    isLink?: boolean;
    linkTarget?: '_self' | '_blank';
    shouldSyncIcon?: boolean;
    className?: string;
  } = {}
): string {
  return renderSelfClosingBlock('site-logo', {
    width: options.width || 120,
    isLink: options.isLink ?? true,
    ...options
  });
}

/**
 * Creates a Template Part block
 */
export function renderTemplatePart(
  slug: string,
  area: 'header' | 'footer' | 'sidebar' = 'header',
  tagName?: string
): string {
  return renderSelfClosingBlock('template-part', {
    slug,
    area,
    tagName
  });
}

/**
 * Creates a Pattern block
 */
export function renderPattern(slug: string): string {
  return renderSelfClosingBlock('pattern', { slug });
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Escapes HTML entities to prevent XSS and markup issues
 */
export function escapeHtml(text: string): string {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Validates that a string is valid block markup
 */
export function validateBlockMarkup(markup: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Check for balanced open/close tags
  const openTags = (markup.match(/<!-- wp:([a-z-]+\/)?[a-z-]+(?:\s|{)/g) || []).length;
  const closeTags = (markup.match(/<!-- \/wp:/g) || []).length;
  const selfClosing = (markup.match(/\/-->/g) || []).length - closeTags;
  
  if (openTags !== closeTags + selfClosing) {
    errors.push(`Mismatched block tags: ${openTags} opens, ${closeTags} closes, ${selfClosing} self-closing`);
  }
  
  // Check JSON validity in block attributes
  const jsonMatches = markup.matchAll(/<!-- wp:[a-z-\/]+\s+(\{[^}]+\})/g);
  for (const match of jsonMatches) {
    try {
      JSON.parse(match[1]);
    } catch (e) {
      errors.push(`Invalid JSON in block: ${match[1].substring(0, 50)}...`);
    }
  }
  
  return { valid: errors.length === 0, errors };
}

// ============================================================================
// EXPORT ALL
// ============================================================================

export default {
  renderBlock,
  renderSelfClosingBlock,
  renderGroup,
  renderColumns,
  renderCover,
  renderHeading,
  renderParagraph,
  renderButtons,
  renderImage,
  renderSpacer,
  renderSeparator,
  renderSocialLinks,
  renderNavigation,
  renderSiteTitle,
  renderSiteLogo,
  renderTemplatePart,
  renderPattern,
  escapeHtml,
  validateBlockMarkup
};
