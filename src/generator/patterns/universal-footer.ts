import { getFooterColors } from './color-mapping';

export const getUniversalFooterContent = (businessName: string, baseTheme: string = 'twentytwentyfour', pages?: Array<{title: string, slug: string}>, logoPath?: string) => {
    const year = new Date().getFullYear();
    const colors = getFooterColors(baseTheme);

    // Build navigation links from pages
    const defaultLinks = [
        { title: 'Home', slug: '/' },
        { title: 'Menu', slug: '/menu' },
        { title: 'About', slug: '/about' },
        { title: 'Contact', slug: '/contact' }
    ];
    const navLinks = (pages && pages.length > 0 ? pages : defaultLinks)
        .map(p => `<!-- wp:navigation-link {"label":"${p.title}","url":"${p.slug.startsWith('/') ? p.slug : '/' + p.slug}","style":{"typography":{"textDecoration":"underline"}}} /-->`)
        .join('\n                    ');

    // Use actual logo image if provided
    const logoBlock = logoPath 
        ? `<!-- wp:image {"sizeSlug":"medium","linkDestination":"custom","className":"site-logo"} -->
<figure class="wp-block-image size-medium site-logo"><a href="/"><img src="${logoPath}" alt="${businessName} logo" style="width:80px;height:auto;"/></a></figure>
<!-- /wp:image -->`
        : '';

    return `
<!-- wp:group {"align":"full","style":{"spacing":{"padding":{"top":"var:preset|spacing|70","bottom":"var:preset|spacing|50"}}},"backgroundColor":"${colors.lightText}","textColor":"${colors.darkBg}","layout":{"type":"constrained"}} -->
<div class="wp-block-group alignfull has-${colors.darkBg}-color has-${colors.lightText}-background-color has-text-color has-background" style="padding-top:var(--wp--preset--spacing--70);padding-bottom:var(--wp--preset--spacing--50)">

    <!-- wp:columns {"align":"wide","style":{"spacing":{"blockGap":{"left":"var:preset|spacing|70"}}}} -->
    <div class="wp-block-columns alignwide">

        <!-- wp:column {"width":"33%"} -->
        <div class="wp-block-column" style="flex-basis:33%">
            <!-- wp:group {"layout":{"type":"flex","flexWrap":"nowrap","verticalAlignment":"top"}} -->
            <div class="wp-block-group">
                ${logoBlock}
                <!-- wp:group {"layout":{"type":"flex","orientation":"vertical","justifyContent":"left"}} -->
                <div class="wp-block-group">
                    <!-- wp:site-title {"style":{"typography":{"fontStyle":"normal","fontWeight":"700","fontSize":"1.5rem"}}} /-->
                    <!-- wp:paragraph {"fontSize":"small"} -->
                    <p class="has-small-font-size">Best experience in town</p>
                    <!-- /wp:paragraph -->
                </div>
                <!-- /wp:group -->
            </div>
            <!-- /wp:group -->
        </div>
        <!-- /wp:column -->

        <!-- wp:column {"width":"33%"} -->
        <div class="wp-block-column" style="flex-basis:33%">
            <!-- wp:heading {"level":4,"style":{"typography":{"fontWeight":"700","textTransform":"uppercase","letterSpacing":"1px"}},"fontSize":"small"} -->
            <h4 class="wp-block-heading has-small-font-size" style="font-weight:700;text-transform:uppercase;letter-spacing:1px">Quick Links</h4>
            <!-- /wp:heading -->
            <!-- wp:navigation {"overlayMenu":"never","layout":{"type":"flex","orientation":"vertical"},"style":{"spacing":{"blockGap":"0.75rem"},"typography":{"textDecoration":"underline"}}} -->
                ${navLinks}
            <!-- /wp:navigation -->
        </div>
        <!-- /wp:column -->

        <!-- wp:column {"width":"33%"} -->
        <div class="wp-block-column" style="flex-basis:33%">
            <!-- wp:heading {"level":4,"style":{"typography":{"fontWeight":"700","textTransform":"uppercase","letterSpacing":"1px"}},"fontSize":"small"} -->
            <h4 class="wp-block-heading has-small-font-size" style="font-weight:700;text-transform:uppercase;letter-spacing:1px">Get In Touch</h4>
            <!-- /wp:heading -->
            <!-- wp:paragraph {"fontSize":"small"} -->
            <p class="has-small-font-size">Get in touch with us for more information.</p>
            <!-- /wp:paragraph -->
            <!-- wp:social-links {"iconColor":"${colors.darkBg}","iconColorValue":"currentColor","size":"has-normal-icon-size","style":{"spacing":{"blockGap":{"left":"var:preset|spacing|40"}}},"className":"is-style-logos-only"} -->
            <ul class="wp-block-social-links has-normal-icon-size has-icon-color is-style-logos-only">
                <!-- wp:social-link {"url":"#","service":"facebook"} /-->
                <!-- wp:social-link {"url":"#","service":"x"} /-->
                <!-- wp:social-link {"url":"#","service":"instagram"} /-->
            </ul>
            <!-- /wp:social-links -->
        </div>
        <!-- /wp:column -->

    </div>
    <!-- /wp:columns -->

    <!-- wp:spacer {"height":"var:preset|spacing|50"} -->
    <div style="height:var(--wp--preset--spacing--50)" aria-hidden="true" class="wp-block-spacer"></div>
    <!-- /wp:spacer -->

    <!-- wp:paragraph {"align":"center","fontSize":"small"} -->
    <p class="has-text-align-center has-small-font-size">© ${year} ${businessName}. All rights reserved. Powered by <a href="https://www.presspilotapp.com" target="_blank" rel="noopener noreferrer" style="color:inherit">PressPilot</a>.</p>
    <!-- /wp:paragraph -->

</div>
<!-- /wp:group -->
`;
};
