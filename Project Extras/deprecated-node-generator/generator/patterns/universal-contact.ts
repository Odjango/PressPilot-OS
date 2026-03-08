
import { PageContent } from '../types';

/**
 * Universal Contact Pattern - TT4-Aligned
 *
 * Uses TT4 semantic color tokens for visual palette differentiation:
 * - Hero: Uses accent-3 (dark accent) for branded header
 * - Contact Info Section: Uses accent-2 background for visual warmth
 */
export const getUniversalContactContent = (content?: PageContent) => {
    const title = content?.hero_title || 'Contact Us';
    const sub = content?.hero_sub || `Contact ${content?.business_name || 'us'} today.`;
    const heroImage = content?.hero_image || 'https://picsum.photos/seed/contact/1200/800';

    // Use content fields directly (populated by ContentBuilder)
    const email = content?.email || 'contact@example.com';
    const phone = content?.phone || '(555) 123-4567';
    const address = content?.address || '123 Main Street';
    const city = content?.city || 'City';
    const state = content?.state || 'ST';
    const zip = content?.zip || '12345';

    return `
    <!-- wp:cover {"url":"${heroImage}","dimRatio":70,"overlayColor":"accent-3","align":"full","style":{"spacing":{"padding":{"top":"var:preset|spacing|60","bottom":"var:preset|spacing|60"}}},"layout":{"type":"constrained"}} -->
    <div class="wp-block-cover alignfull" style="padding-top:var(--wp--preset--spacing--60);padding-bottom:var(--wp--preset--spacing--60)">
        <span aria-hidden="true" class="wp-block-cover__background has-accent-3-background-color has-background-dim-70 has-background-dim"></span>
        <img class="wp-block-cover__image-background" alt="" src="${heroImage}" data-object-fit="cover"/>
        <div class="wp-block-cover__inner-container">
            <!-- wp:heading {"textAlign":"center","level":1,"textColor":"base","fontSize":"x-large"} -->
            <h1 class="wp-block-heading has-text-align-center has-base-color has-text-color has-x-large-font-size">${title}</h1>
            <!-- /wp:heading -->
            <!-- wp:paragraph {"align":"center","textColor":"base","fontSize":"large"} -->
            <p class="has-text-align-center has-base-color has-text-color has-large-font-size">${sub}</p>
            <!-- /wp:paragraph -->
        </div>
    </div>
    <!-- /wp:cover -->

    <!-- wp:group {"align":"full","style":{"spacing":{"padding":{"top":"var:preset|spacing|60","bottom":"var:preset|spacing|60"}}},"backgroundColor":"base-2","layout":{"type":"constrained"}} -->
    <div class="wp-block-group alignfull has-base-2-background-color has-background" style="padding-top:var(--wp--preset--spacing--60);padding-bottom:var(--wp--preset--spacing--60)">
        <!-- wp:group {"align":"wide","layout":{"type":"flex","flexWrap":"wrap","verticalAlignment":"top"}} -->
        <div class="wp-block-group alignwide">

            <!-- wp:column {"width":"50%","style":{"spacing":{"padding":{"right":"var:preset|spacing|40"}}}} -->
            <div class="wp-block-column" style="padding-right:var(--wp--preset--spacing--40);flex-basis:50%">
                <!-- wp:heading {"level":3,"textColor":"accent"} -->
                <h3 class="wp-block-heading has-accent-color has-text-color">Get In Touch</h3>
                <!-- /wp:heading -->
                <!-- wp:paragraph {"textColor":"contrast-2"} -->
                <p class="has-contrast-2-color has-text-color">Email: <a href="mailto:${email}">${email}</a><br>Phone: ${phone}</p>
                <!-- /wp:paragraph -->

                <!-- wp:separator {"backgroundColor":"contrast-3"} -->
                <hr class="wp-block-separator has-text-color has-contrast-3-color has-alpha-channel-opacity has-contrast-3-background-color has-background"/>
                <!-- /wp:separator -->

                <!-- wp:heading {"level":3,"textColor":"accent"} -->
                <h3 class="wp-block-heading has-accent-color has-text-color">Office</h3>
                <!-- /wp:heading -->
                <!-- wp:paragraph {"textColor":"contrast-2"} -->
                <p class="has-contrast-2-color has-text-color">${address}<br>${city}, ${state} ${zip}</p>
                <!-- /wp:paragraph -->

                <!-- wp:buttons {"style":{"spacing":{"margin":{"top":"var:preset|spacing|30"}}}} -->
                <div class="wp-block-buttons" style="margin-top:var(--wp--preset--spacing--30)">
                    <!-- wp:button {"backgroundColor":"accent","textColor":"base"} -->
                    <div class="wp-block-button"><a class="wp-block-button__link has-base-color has-accent-background-color has-text-color has-background wp-element-button">Send Message</a></div>
                    <!-- /wp:button -->
                </div>
                <!-- /wp:buttons -->
            </div>
            <!-- /wp:column -->

            <!-- wp:column {"width":"50%"} -->
            <div class="wp-block-column" style="flex-basis:50%">
                <!-- wp:image {"sizeSlug":"large"} -->
                <figure class="wp-block-image size-large"><img src="${heroImage}" alt="Map location"/></figure>
                <!-- /wp:image -->
            </div>
            <!-- /wp:column -->

        </div>
        <!-- /wp:group -->
    </div>
    <!-- /wp:group -->
    `;
};
