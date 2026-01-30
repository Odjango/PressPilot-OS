import { getFooterColors } from './color-mapping';

export const getUniversalFooterContent = (businessName: string, baseTheme: string = 'twentytwentyfour') => {
    const year = new Date().getFullYear();
    const colors = getFooterColors(baseTheme);

    const footerGroupAttrs = JSON.stringify({
        align: 'full',
        style: {
            spacing: {
                padding: { top: 'var:preset|spacing|80', bottom: 'var:preset|spacing|40' }
            }
        },
        backgroundColor: colors.darkBg,
        textColor: colors.lightText,
        layout: { type: 'constrained' }
    });

    const innerWideAttrs = JSON.stringify({
        align: 'wide',
        layout: { type: 'flex', flexWrap: 'nowrap', justifyContent: 'space-between' }
    });

    const logoGroupAttrs = JSON.stringify({
        layout: { type: 'flex', orientation: 'vertical' }
    });

    const siteTitleAttrs = JSON.stringify({
        level: 3,
        style: { typography: { fontStyle: 'normal', fontWeight: '700' } }
    });

    const taglineAttrs = JSON.stringify({
        maxWidth: '300px'
    });

    const linksSectionAttrs = JSON.stringify({
        layout: { type: 'flex', flexWrap: 'nowrap', blockGap: 'var:preset|spacing|60', verticalAlignment: 'top' }
    });

    const verticalGroupAttrs = JSON.stringify({
        layout: { type: 'flex', orientation: 'vertical' }
    });

    const headingAttrs = JSON.stringify({
        level: 4,
        fontSize: 'medium'
    });

    const socialLinksAttrs = JSON.stringify({
        iconColor: colors.lightText,
        iconColorValue: '#ffffff',
        size: 'has-small-icon-size',
        className: 'is-style-default',
        layout: { type: 'flex', justifyContent: 'left', flexWrap: 'nowrap' }
    });

    const separatorAttrs = JSON.stringify({
        className: 'is-style-wide'
    });

    const copyrightParaAttrs = JSON.stringify({
        fontSize: 'small'
    });

    return `
    <!-- wp:group ${footerGroupAttrs} -->
    <div class="wp-block-group alignfull has-${colors.lightText}-color has-${colors.darkBg}-background-color has-text-color has-background" style="padding-top:var(--wp--preset--spacing--80);padding-bottom:var(--wp--preset--spacing--40)">
        <!-- wp:group ${innerWideAttrs} -->
        <div class="wp-block-group alignwide">
            <!-- wp:group ${logoGroupAttrs} -->
            <div class="wp-block-group">
                <!-- wp:site-title ${siteTitleAttrs} /-->
                <!-- wp:paragraph ${taglineAttrs} -->
                <p class="has-small-font-size" style="max-width:300px">Experience the best flavors in town. Locally sourced, prepared with passion.</p>
                <!-- /wp:paragraph -->
            </div>
            <!-- /wp:group -->

            <!-- wp:group ${linksSectionAttrs} -->
            <div class="wp-block-group is-vertically-aligned-top">
                <!-- wp:group ${verticalGroupAttrs} -->
                <div class="wp-block-group">
                    <!-- wp:heading ${headingAttrs} -->
                    <h4 class="wp-block-heading has-medium-font-size">Company</h4>
                    <!-- /wp:heading -->
                    <!-- wp:paragraph -->
                    <p><a href="/about" style="color:inherit;text-decoration:none">About Us</a></p>
                    <!-- /wp:paragraph -->
                    <!-- wp:paragraph -->
                    <p><a href="/contact" style="color:inherit;text-decoration:none">Contact</a></p>
                    <!-- /wp:paragraph -->
                </div>
                <!-- /wp:group -->

                <!-- wp:group ${verticalGroupAttrs} -->
                <div class="wp-block-group">
                    <!-- wp:heading ${headingAttrs} -->
                    <h4 class="wp-block-heading has-medium-font-size">Connect</h4>
                    <!-- /wp:heading -->
                    
                    <!-- wp:social-links ${socialLinksAttrs} -->
                    <ul class="wp-block-social-links has-small-icon-size has-icon-color is-style-default">
                        <!-- wp:social-link {"url":"#","service":"facebook"} /-->
                        <!-- wp:social-link {"url":"#","service":"instagram"} /-->
                        <!-- wp:social-link {"url":"#","service":"twitter"} /-->
                    </ul>
                    <!-- /wp:social-links -->
                </div>
                <!-- /wp:group -->
            </div>
            <!-- /wp:group -->
        </div>
        <!-- /wp:group -->

        <!-- wp:separator ${separatorAttrs} -->
        <hr class="wp-block-separator is-style-wide"/>
        <!-- /wp:separator -->

        <!-- wp:group ${innerWideAttrs} -->
        <div class="wp-block-group alignwide">
            <!-- wp:paragraph ${copyrightParaAttrs} -->
            <p class="has-small-font-size">© ${year} ${businessName}. All rights reserved.</p>
            <!-- /wp:paragraph -->
            <!-- wp:paragraph ${copyrightParaAttrs} -->
            <p class="has-small-font-size">Powered by <a href="https://www.presspilotapp.com" target="_blank" rel="noopener noreferrer" style="color:inherit">PressPilot</a></p>
            <!-- /wp:paragraph -->
        </div>
        <!-- /wp:group -->
    </div>
    <!-- /wp:group -->
    <!-- DEBUG: FOOTER FIX APPLIED 2026-01-30 -->
    `;
};
