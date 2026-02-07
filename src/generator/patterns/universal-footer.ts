import { getFooterColors } from './color-mapping';

export const getUniversalFooterContent = (businessName: string, baseTheme: string = 'twentytwentyfour', pages?: Array<{title: string, slug: string}>, hasLogo?: boolean) => {
    const year = new Date().getFullYear();
    // Note: colors variable kept for potential future use but footer now uses fixed light colors
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

    // Use wp:site-logo block - self-closing, WordPress handles the image
    // Logo is set programmatically via functions.php on theme activation
    const logoBlock = hasLogo
        ? `<!-- wp:site-logo {"width":60,"className":"site-logo"} /-->`
        : '';

    // Phase 15.3: Use base-2 (light gray) for footer background
    // This ensures a clean, light footer appearance instead of dark voids
    return `
<!-- wp:group {"align":"full","style":{"spacing":{"padding":{"top":"var:preset|spacing|70","bottom":"var:preset|spacing|50"}}},"backgroundColor":"base-2","textColor":"contrast","layout":{"type":"constrained"}} -->
<div class="wp-block-group alignfull has-contrast-color has-base-2-background-color has-text-color has-background" style="padding-top:var(--wp--preset--spacing--70);padding-bottom:var(--wp--preset--spacing--50)">

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
                    <!-- wp:paragraph {"fontSize":"small","textColor":"contrast-2"} -->
                    <p class="has-small-font-size has-contrast-2-color has-text-color">Best experience in town</p>
                    <!-- /wp:paragraph -->
                </div>
                <!-- /wp:group -->
            </div>
            <!-- /wp:group -->
        </div>
        <!-- /wp:column -->

        <!-- wp:column {"width":"33%"} -->
        <div class="wp-block-column" style="flex-basis:33%">
            <!-- wp:heading {"level":4,"textColor":"contrast","style":{"typography":{"fontWeight":"700","textTransform":"uppercase","letterSpacing":"1px"}},"fontSize":"small"} -->
            <h4 class="wp-block-heading has-small-font-size has-contrast-color has-text-color" style="font-weight:700;text-transform:uppercase;letter-spacing:1px">Quick Links</h4>
            <!-- /wp:heading -->
            <!-- wp:navigation {"overlayMenu":"never","layout":{"type":"flex","orientation":"vertical"},"style":{"spacing":{"blockGap":"0.75rem"},"typography":{"textDecoration":"underline"}},"textColor":"contrast"} -->
                ${navLinks}
            <!-- /wp:navigation -->
        </div>
        <!-- /wp:column -->

        <!-- wp:column {"width":"33%"} -->
        <div class="wp-block-column" style="flex-basis:33%">
            <!-- wp:heading {"level":4,"textColor":"contrast","style":{"typography":{"fontWeight":"700","textTransform":"uppercase","letterSpacing":"1px"}},"fontSize":"small"} -->
            <h4 class="wp-block-heading has-small-font-size has-contrast-color has-text-color" style="font-weight:700;text-transform:uppercase;letter-spacing:1px">Get In Touch</h4>
            <!-- /wp:heading -->
            <!-- wp:paragraph {"fontSize":"small","textColor":"contrast-2"} -->
            <p class="has-small-font-size has-contrast-2-color has-text-color">Get in touch with us for more information.</p>
            <!-- /wp:paragraph -->
            <!-- wp:social-links {"iconColor":"contrast","iconColorValue":"currentColor","size":"has-normal-icon-size","style":{"spacing":{"blockGap":{"left":"var:preset|spacing|40"}}},"className":"is-style-logos-only"} -->
            <ul class="wp-block-social-links has-normal-icon-size has-icon-color is-style-logos-only">
                <!-- wp:social-link {"url":"{{SOCIAL_FACEBOOK}}","service":"facebook"} /-->
                <!-- wp:social-link {"url":"{{SOCIAL_TWITTER}}","service":"x"} /-->
                <!-- wp:social-link {"url":"{{SOCIAL_INSTAGRAM}}","service":"instagram"} /-->
            </ul>
            <!-- /wp:social-links -->
        </div>
        <!-- /wp:column -->

    </div>
    <!-- /wp:columns -->

    <!-- wp:spacer {"height":"var:preset|spacing|50"} -->
    <div style="height:var(--wp--preset--spacing--50)" aria-hidden="true" class="wp-block-spacer"></div>
    <!-- /wp:spacer -->

    <!-- wp:paragraph {"align":"center","fontSize":"small","textColor":"contrast-2"} -->
    <p class="has-text-align-center has-small-font-size has-contrast-2-color has-text-color">© ${year} ${businessName}. All rights reserved. Powered by <a href="https://www.presspilotapp.com" target="_blank" rel="noopener noreferrer" style="color:inherit">PressPilot</a>.</p>
    <!-- /wp:paragraph -->

</div>
<!-- /wp:group -->
`;
};
