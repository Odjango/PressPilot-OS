
import { PageContent } from '../types';

export const getUniversalContactContent = (content?: PageContent) => {
    const title = content?.hero_title || 'Contact Us';
    const sub = content?.hero_sub || 'We would love to hear from you.';

    return `
    <!-- wp:group {"align":"full","style":{"spacing":{"padding":{"top":"var:preset|spacing|60","bottom":"var:preset|spacing|60"}}},"backgroundColor":"contrast","textColor":"base","layout":{"type":"constrained"}} -->
    <div class="wp-block-group alignfull has-base-color has-contrast-background-color has-text-color has-background" style="padding-top:var(--wp--preset--spacing--60);padding-bottom:var(--wp--preset--spacing--60)">
        <!-- wp:heading {"textAlign":"center","level":1,"textColor":"base","fontSize":"x-large"} -->
        <h1 class="wp-block-heading has-text-align-center has-base-color has-text-color has-x-large-font-size">${title}</h1>
        <!-- /wp:heading -->
        <!-- wp:paragraph {"align":"center","textColor":"base","fontSize":"large"} -->
        <p class="has-text-align-center has-base-color has-text-color has-large-font-size">${sub}</p>
        <!-- /wp:paragraph -->
    </div>
    <!-- /wp:group -->

    <!-- wp:group {"align":"full","style":{"spacing":{"padding":{"top":"var:preset|spacing|60","bottom":"var:preset|spacing|60"}}},"layout":{"type":"constrained"}} -->
    <div class="wp-block-group alignfull" style="padding-top:var(--wp--preset--spacing--60);padding-bottom:var(--wp--preset--spacing--60)">
        <!-- wp:group {"align":"wide","layout":{"type":"flex","flexWrap":"wrap","verticalAlignment":"top"}} -->
        <div class="wp-block-group alignwide">
            
            <!-- wp:column {"width":"50%","style":{"spacing":{"padding":{"right":"var:preset|spacing|40"}}}} -->
            <div class="wp-block-column" style="padding-right:var(--wp--preset--spacing--40);flex-basis:50%">
                <!-- wp:heading {"level":3} -->
                <h3 class="wp-block-heading">Get In Touch</h3>
                <!-- /wp:heading -->
                <!-- wp:paragraph -->
                <p>Email: <a href="mailto:contact@presspilot.com">contact@presspilot.com</a><br>Phone: +1 555-0199</p>
                <!-- /wp:paragraph -->
                
                <!-- wp:separator -->
                <hr class="wp-block-separator has-alpha-channel-opacity"/>
                <!-- /wp:separator -->

                <!-- wp:heading {"level":3} -->
                <h3 class="wp-block-heading">Office</h3>
                <!-- /wp:heading -->
                <!-- wp:paragraph -->
                <p>123 Innovation Dr.<br>Tech City, TC 90210</p>
                <!-- /wp:paragraph -->
            </div>
            <!-- /wp:column -->

            <!-- wp:column {"width":"50%"} -->
            <div class="wp-block-column" style="flex-basis:50%">
                <!-- wp:image {"sizeSlug":"large"} -->
                <figure class="wp-block-image size-large"><img src="${content?.hero_image || 'https://placehold.co/800x450/EEE/31343C.png?text=Map+Location'}" alt="Map location"/></figure>
                <!-- /wp:image -->
            </div>
            <!-- /wp:column -->

        </div>
        <!-- /wp:group -->
    </div>
    <!-- /wp:group -->
    `;
};
