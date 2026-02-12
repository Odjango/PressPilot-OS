/**
 * Universal Header Pattern - TT4-Aligned
 *
 * Creates a sticky header with solid background for reliable readability
 * over full-bleed hero sections. Uses the "presspilot-header" class for
 * CSS styling (sticky position, z-index, backdrop blur).
 *
 * Header Overlay Best Practices:
 * 1. Solid white/base background (not transparent)
 * 2. Higher z-index than hero (1000+)
 * 3. Sticky positioning for scroll behavior
 * 4. Backdrop blur for modern glass effect
 */
export const getUniversalHeaderContent = (businessName: string, pages: { title: string, slug: string }[], hasLogo?: boolean, isEcommerce?: boolean) => {
    // Generate Navigation Links provided by the Recipe
    const landingPages = [...pages];
    if (!landingPages.find(p => p.slug === 'home' || p.slug === '')) {
        landingPages.unshift({ title: 'Home', slug: '' });
    }
    const navLinks = landingPages.map(page => {
        const linkAttrs = JSON.stringify({
            label: page.title,
            url: `/${page.slug === 'home' || page.slug === '' ? '' : page.slug}`,
            kind: 'custom',
            isTopLevelLink: true
        });
        return `<!-- wp:navigation-link ${linkAttrs} /-->`;
    }).join('\n');

    // Use wp:site-logo block - self-closing, WordPress handles the image
    // Logo is set programmatically via functions.php on theme activation
    const logoBlock = hasLogo
        ? `<!-- wp:site-logo {"width":80,"className":"site-logo"} /-->`
        : '';

    // Starter ecommerce mode intentionally avoids WooCommerce-specific blocks.
    const miniCartBlock = '';

    return `
<!-- wp:group {"tagName":"header","className":"presspilot-header","align":"full","backgroundColor":"base","style":{"spacing":{"padding":{"top":"var:preset|spacing|30","bottom":"var:preset|spacing|30","left":"var:preset|spacing|50","right":"var:preset|spacing|50"}},"border":{"bottom":{"color":"var:preset|color|contrast-3","width":"1px"}}},"layout":{"type":"flex","justifyContent":"space-between","flexWrap":"nowrap"}} -->
<header class="wp-block-group alignfull presspilot-header has-base-background-color has-background" style="border-bottom-color:var(--wp--preset--color--contrast-3);border-bottom-width:1px;padding-top:var(--wp--preset--spacing--30);padding-right:var(--wp--preset--spacing--50);padding-bottom:var(--wp--preset--spacing--30);padding-left:var(--wp--preset--spacing--50)">

    <!-- wp:group {"layout":{"type":"flex","flexWrap":"nowrap"},"style":{"spacing":{"blockGap":"15px"}}} -->
    <div class="wp-block-group">
        ${logoBlock}
        <!-- wp:site-title {"level":0,"style":{"typography":{"fontStyle":"normal","fontWeight":"700","fontSize":"1.5rem"}},"textColor":"contrast"} /-->
    </div>
    <!-- /wp:group -->

    <!-- wp:group {"layout":{"type":"flex","flexWrap":"nowrap","justifyContent":"right"},"style":{"spacing":{"blockGap":"var:preset|spacing|30"}}} -->
    <div class="wp-block-group">
        <!-- wp:navigation {"textColor":"contrast","layout":{"type":"flex","justifyContent":"right","orientation":"horizontal"},"style":{"typography":{"fontWeight":"600","fontSize":"1rem"},"spacing":{"blockGap":"var:preset|spacing|30"}}} -->
        ${navLinks}
        <!-- /wp:navigation -->${miniCartBlock}
    </div>
    <!-- /wp:group -->

</header>
<!-- /wp:group -->
`;
};
