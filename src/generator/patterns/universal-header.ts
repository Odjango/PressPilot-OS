export const getUniversalHeaderContent = (businessName: string, pages: { title: string, slug: string }[], logoPath?: string) => {
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

    // Use wp:html block for logo - WordPress won't validate raw HTML = no block errors ever
    const logoBlock = logoPath 
        ? `<!-- wp:html -->
<a href="/" class="site-logo-link"><img src="${logoPath}" alt="${businessName} logo" class="site-logo" style="width:80px;height:auto;object-fit:contain;"/></a>
<!-- /wp:html -->`
        : '';

    return `
<!-- wp:group {"align":"full","style":{"spacing":{"padding":{"top":"var:preset|spacing|40","bottom":"var:preset|spacing|40","left":"var:preset|spacing|50","right":"var:preset|spacing|50"}}},"layout":{"type":"flex","justifyContent":"space-between","flexWrap":"nowrap"}} -->
<div class="wp-block-group alignfull" style="padding-top:var(--wp--preset--spacing--40);padding-right:var(--wp--preset--spacing--50);padding-bottom:var(--wp--preset--spacing--40);padding-left:var(--wp--preset--spacing--50)">
    
    <!-- wp:group {"layout":{"type":"flex","flexWrap":"nowrap"},"style":{"spacing":{"blockGap":"15px"}}} -->
    <div class="wp-block-group">
        ${logoBlock}
        <!-- wp:site-title {"level":0,"style":{"typography":{"fontStyle":"normal","fontWeight":"700","fontSize":"1.5rem"}}} /-->
    </div>
    <!-- /wp:group -->

    <!-- wp:navigation {"layout":{"type":"flex","justifyContent":"right","orientation":"horizontal"},"style":{"typography":{"fontWeight":"600","fontSize":"1rem"}}} -->
    ${navLinks}
    <!-- /wp:navigation -->

</div>
<!-- /wp:group -->
`;
};
