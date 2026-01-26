
export const getUniversalHeaderContent = (businessName: string, pages: { title: string, slug: string }[]) => {

    // Generate Navigation Links provided by the Recipe
    const navLinks = pages.map(page => {
        return `<!-- wp:navigation-link {"label":"${page.title}","url":"/${page.slug}","kind":"custom","isTopLevelLink":true} /-->`;
    }).join('\n');

    return `
    <!-- wp:group {"align":"full","style":{"spacing":{"padding":{"top":"var:preset|spacing|30","bottom":"var:preset|spacing|30","left":"var:preset|spacing|40","right":"var:preset|spacing|40"}}},"layout":{"type":"flex","justifyContent":"space-between"}} -->
    <div class="wp-block-group alignfull" style="padding-top:var(--wp--preset--spacing--30);padding-right:var(--wp--preset--spacing--40);padding-bottom:var(--wp--preset--spacing--30);padding-left:var(--wp--preset--spacing--40)">
        
        <!-- wp:group {"layout":{"type":"flex"}} -->
        <div class="wp-block-group">
            <!-- wp:site-title {"level":0,"style":{"typography":{"fontStyle":"normal","fontWeight":"700"}}} /-->
        </div>
        <!-- /wp:group -->

        <!-- wp:navigation {"layout":{"type":"flex","justifyContent":"right","orientation":"horizontal"},"style":{"typography":{"fontWeight":"500"}}} -->

        ${navLinks}
        <!-- /wp:navigation -->

    </div>
    <!-- /wp:group -->
    `;
};
