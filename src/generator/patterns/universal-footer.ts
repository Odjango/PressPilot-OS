
export const getUniversalFooterContent = (businessName: string) => {
    const year = new Date().getFullYear();
    return `
    <!-- wp:group {"align":"full","style":{"spacing":{"padding":{"top":"var:preset|spacing|80","bottom":"var:preset|spacing|40"}}},"backgroundColor":"main","textColor":"base","layout":{"type":"constrained"}} -->
    <div class="wp-block-group alignfull has-base-color has-main-background-color has-text-color has-background" style="padding-top:var(--wp--preset--spacing--80);padding-bottom:var(--wp--preset--spacing--40)">
        <!-- wp:group {"align":"wide","layout":{"type":"flex","flexWrap":"wrap","justifyContent":"space-between"}} -->
        <div class="wp-block-group alignwide">
            <!-- wp:group {"layout":{"type":"flex","orientation":"vertical"}} -->
            <div class="wp-block-group">
                <!-- wp:site-title {"level":3,"style":{"typography":{"fontStyle":"normal","fontWeight":"700"}}} /-->
                <!-- wp:paragraph {"maxWidth":"300px"} -->
                <p class="has-small-font-size" style="max-width:300px">Experience the best flavors in town. Locally sourced, prepared with passion.</p>
                <!-- /wp:paragraph -->
            </div>
            <!-- /wp:group -->

            <!-- wp:group {"layout":{"type":"flex","flexWrap":"wrap","blockGap":"var:preset|spacing|60","verticalAlignment":"top"}} -->
            <div class="wp-block-group is-vertically-aligned-top">
                <!-- wp:group {"layout":{"type":"flex","orientation":"vertical"}} -->
                <div class="wp-block-group">
                    <!-- wp:heading {"level":4,"fontSize":"medium"} -->
                    <h4 class="wp-block-heading has-medium-font-size">Company</h4>
                    <!-- /wp:heading -->
                    <!-- wp:paragraph {"textColor":"base"} -->
                    <p class="has-base-color has-text-color"><a href="/about" style="color:var(--wp--preset--color--base);text-decoration:none">About Us</a></p>
                    <!-- /wp:paragraph -->
                    <!-- wp:paragraph {"textColor":"base"} -->
                    <p class="has-base-color has-text-color"><a href="/contact" style="color:var(--wp--preset--color--base);text-decoration:none">Contact</a></p>
                    <!-- /wp:paragraph -->
                </div>
                <!-- /wp:group -->

                <!-- wp:group {"layout":{"type":"flex","orientation":"vertical"}} -->
                <div class="wp-block-group">
                    <!-- wp:heading {"level":4,"fontSize":"medium"} -->
                    <h4 class="wp-block-heading has-medium-font-size">Connect</h4>
                    <!-- /wp:heading -->
                     <!-- wp:buttons {"layout":{"type":"flex","justifyContent":"left"}} -->
                    <div class="wp-block-buttons">
                        <!-- wp:button {"className":"is-style-outline"} -->
                        <div class="wp-block-button is-style-outline"><a class="wp-block-button__link wp-element-button" href="#">Facebook</a></div>
                        <!-- /wp:button -->
                        <!-- wp:button {"className":"is-style-outline"} -->
                        <div class="wp-block-button is-style-outline"><a class="wp-block-button__link wp-element-button" href="#">Instagram</a></div>
                        <!-- /wp:button -->
                    </div>
                    <!-- /wp:buttons -->
                </div>
                <!-- /wp:group -->
            </div>
            <!-- /wp:group -->
        </div>
        <!-- /wp:group -->

        <!-- wp:separator {"className":"is-style-wide"} -->
        <hr class="wp-block-separator is-style-wide"/>
        <!-- /wp:separator -->

        <!-- wp:group {"align":"wide","layout":{"type":"flex","flexWrap":"wrap","justifyContent":"space-between"}} -->
        <div class="wp-block-group alignwide">
            <!-- wp:paragraph {"fontSize":"small"} -->
            <p class="has-small-font-size">© ${year} ${businessName}. All rights reserved.</p>
            <!-- /wp:paragraph -->
        </div>
        <!-- /wp:group -->
    </div>
    <!-- /wp:group -->
    `;
};
