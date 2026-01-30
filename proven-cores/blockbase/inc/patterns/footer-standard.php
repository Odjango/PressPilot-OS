<?php
/**
 * Title: Footer Standard (Phosphor)
 * Slug: blockbase/footer-standard
 * Categories: footer
 * Block Types: core/template-part/footer
 * Description: PressPilot Standardized 3-Column Footer with Phosphor Icons
 */
?>

<!-- wp:group {"align":"full","style":{"spacing":{"padding":{"top":"var:preset|spacing|70","bottom":"var:preset|spacing|50"}}},"backgroundColor":"contrast","textColor":"base","layout":{"type":"constrained"}} -->
<div class="wp-block-group alignfull has-base-color has-contrast-background-color has-text-color has-background"
    style="padding-top:var(--wp--preset--spacing--70);padding-bottom:var(--wp--preset--spacing--50)">

    <!-- wp:columns {"align":"wide","style":{"spacing":{"blockGap":{"top":"var:preset|spacing|50","left":"var:preset|spacing|50"}}}} -->
    <div class="wp-block-columns alignwide">

        <!-- wp:column {"width":"40%"} -->
        <div class="wp-block-column" style="flex-basis:40%">
            <!-- wp:group {"layout":{"type":"flex","orientation":"horizontal","flexWrap":"nowrap"}} -->
            <div class="wp-block-group">
                <!-- wp:site-logo {"width":48,"shouldSyncIcon":false} /-->
                <!-- wp:site-title {"level":3,"style":{"typography":{"fontSize":"20px","fontWeight":"700"}}} /-->
            </div>
            <!-- /wp:group -->
            <!-- wp:paragraph {"style":{"spacing":{"margin":{"top":"var:preset|spacing|30"}},"typography":{"lineHeight":"1.6"},"elements":{"link":{"color":{"text":"var:preset|color|base"}}}},"fontSize":"small"} -->
            <p class="has-small-font-size" style="margin-top:var(--wp--preset--spacing--30);line-height:1.6">Crafted
                with precision. Powered by PressPilot OS.</p>
            <!-- /wp:paragraph -->
        </div>
        <!-- /wp:column -->

        <!-- wp:column {"width":"30%"} -->
        <div class="wp-block-column" style="flex-basis:30%">
            <!-- wp:heading {"level":6,"style":{"typography":{"textTransform":"uppercase","letterSpacing":"2px","fontWeight":"600"}},"fontSize":"small"} -->
            <h6 class="wp-block-heading has-small-font-size"
                style="font-weight:600;letter-spacing:2px;text-transform:uppercase">Quick Links</h6>
            <!-- /wp:heading -->
            <!-- wp:group {"style":{"spacing":{"blockGap":"var:preset|spacing|20"}},"layout":{"type":"flex","orientation":"vertical"}} -->
            <div class="wp-block-group">
                <!-- wp:paragraph {"style":{"elements":{"link":{"color":{"text":"var:preset|color|base"}}}}} -->
                <p class="has-link-color"><a href="/about" style="text-decoration:none">About Us</a></p>
                <!-- /wp:paragraph -->
                <!-- wp:paragraph {"style":{"elements":{"link":{"color":{"text":"var:preset|color|base"}}}}} -->
                <p class="has-link-color"><a href="/contact" style="text-decoration:none">Contact</a></p>
                <!-- /wp:paragraph -->
                <!-- wp:paragraph {"style":{"elements":{"link":{"color":{"text":"var:preset|color|base"}}}}} -->
                <p class="has-link-color"><a href="/services" style="text-decoration:none">Services</a></p>
                <!-- /wp:paragraph -->
            </div>
            <!-- /wp:group -->
        </div>
        <!-- /wp:column -->

        <!-- wp:column {"width":"30%"} -->
        <div class="wp-block-column" style="flex-basis:30%">
            <!-- wp:heading {"level":6,"style":{"typography":{"textTransform":"uppercase","letterSpacing":"2px","fontWeight":"600"}},"fontSize":"small"} -->
            <h6 class="wp-block-heading has-small-font-size"
                style="font-weight:600;letter-spacing:2px;text-transform:uppercase">Get In Touch</h6>
            <!-- /wp:heading -->
            <!-- wp:paragraph {"style":{"spacing":{"margin":{"bottom":"var:preset|spacing|30"}},"elements":{"link":{"color":{"text":"var:preset|color|base"}}}},"fontSize":"small"} -->
            <p class="has-small-font-size has-link-color" style="margin-bottom:var(--wp--preset--spacing--30)">Follow us
                on social media</p>
            <!-- /wp:paragraph -->
            <!-- wp:group {"style":{"spacing":{"blockGap":"var:preset|spacing|30"}},"layout":{"type":"flex","flexWrap":"nowrap"}} -->
            <div class="wp-block-group">
                <!-- wp:html -->
                <a href="#" aria-label="X (Twitter)"
                    style="color:var(--wp--preset--color--base);display:inline-flex"><svg
                        xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor"
                        viewBox="0 0 256 256">
                        <path
                            d="M214.75,211.71l-62.6-98.38,61.77-67.95a8,8,0,0,0-11.84-10.76L143.24,99.34,102.75,35.71A8,8,0,0,0,96,32H48a8,8,0,0,0-6.75,12.29l62.6,98.38L41.08,210.62a8,8,0,1,0,11.84,10.76l58.84-64.72,40.49,63.63A8,8,0,0,0,160,224h48a8,8,0,0,0,6.75-12.29ZM164.39,208,62.57,48h29l101.86,160Z" />
                    </svg></a>
                <!-- /wp:html -->
                <!-- wp:html -->
                <a href="#" aria-label="Instagram" style="color:var(--wp--preset--color--base);display:inline-flex"><svg
                        xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor"
                        viewBox="0 0 256 256">
                        <path
                            d="M128,80a48,48,0,1,0,48,48A48.05,48.05,0,0,0,128,80Zm0,80a32,32,0,1,1,32-32A32,32,0,0,1,128,160ZM176,24H80A56.06,56.06,0,0,0,24,80v96a56.06,56.06,0,0,0,56,56h96a56.06,56.06,0,0,0,56-56V80A56.06,56.06,0,0,0,176,24Zm40,152a40,40,0,0,1-40,40H80a40,40,0,0,1-40-40V80A40,40,0,0,1,80,40h96a40,40,0,0,1,40,40ZM192,76a12,12,0,1,1-12-12A12,12,0,0,1,192,76Z" />
                    </svg></a>
                <!-- /wp:html -->
                <!-- wp:html -->
                <a href="#" aria-label="LinkedIn" style="color:var(--wp--preset--color--base);display:inline-flex"><svg
                        xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor"
                        viewBox="0 0 256 256">
                        <path
                            d="M216,24H40A16,16,0,0,0,24,40V216a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V40A16,16,0,0,0,216,24Zm0,192H40V40H216V216ZM96,112v64a8,8,0,0,1-16,0V112a8,8,0,0,1,16,0Zm88,28v36a8,8,0,0,1-16,0V140a20,20,0,0,0-40,0v36a8,8,0,0,1-16,0V112a8,8,0,0,1,15.79-1.78A36,36,0,0,1,184,140ZM100,84A12,12,0,1,1,88,72,12,12,0,0,1,100,84Z" />
                    </svg></a>
                <!-- /wp:html -->
                <!-- wp:html -->
                <a href="#" aria-label="Facebook" style="color:var(--wp--preset--color--base);display:inline-flex"><svg
                        xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor"
                        viewBox="0 0 256 256">
                        <path
                            d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm8,191.63V152h24a8,8,0,0,0,0-16H136V112a16,16,0,0,1,16-16h16a8,8,0,0,0,0-16H152a32,32,0,0,0-32,32v24H96a8,8,0,0,0,0,16h24v63.63a88,88,0,1,1,16,0Z" />
                    </svg></a>
                <!-- /wp:html -->
            </div>
            <!-- /wp:group -->
        </div>
        <!-- /wp:column -->

    </div>
    <!-- /wp:columns -->

    <!-- wp:group {"style":{"spacing":{"margin":{"top":"var:preset|spacing|60"}}},"layout":{"type":"flex","justifyContent":"center"}} -->
    <div class="wp-block-group" style="margin-top:var(--wp--preset--spacing--60)">
        <!-- wp:paragraph {"align":"center","fontSize":"small","style":{"elements":{"link":{"color":{"text":"var:preset|color|base"}}}}} -->
        <p class="has-text-align-center has-small-font-size has-link-color">©
            <?php echo date('Y'); ?>
            <?php echo get_bloginfo('name'); ?>. All rights reserved. Powered by <a href="https://presspilot.app"
                style="font-weight:700;text-decoration:none">PressPilot</a>
        </p>
        <!-- /wp:paragraph -->
    </div>
    <!-- /wp:group -->

</div>
<!-- /wp:group -->