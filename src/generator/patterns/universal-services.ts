
import { PageContent } from '../types';

/**
 * Universal Services Pattern - TT4-Aligned
 *
 * Uses TT4 semantic color tokens for visual palette differentiation:
 * - Hero: Uses accent (primary brand color) for strong visual impact
 * - Services Grid: Uses accent-2 (light accent) for branded section background
 * - Service Cards: Use base background with accent-colored buttons
 */
export const getUniversalServicesContent = (content?: PageContent) => {
    const title = content?.hero_title || 'Our Services';
    const sub = content?.hero_sub || 'World-class solutions for your business needs.';
    const heroImage = content?.hero_image || '{{HERO_IMAGE_3}}';

    // Service Features / Pricing Grid
    // Using simple "Columns" or "Grid" (wp:group with layout:grid)
    const features = content?.features || [
        { title: 'Standard Service', desc: 'Reliable and efficient service for small businesses.' },
        { title: 'Premium Service', desc: 'Advanced features and priority support for growing teams.' },
        { title: 'Enterprise', desc: 'Custom solutions tailored to your organization.' }
    ];

    const gridItems = features.map(feat => `
    <!-- wp:group {"style":{"spacing":{"padding":{"top":"var:preset|spacing|40","bottom":"var:preset|spacing|40","left":"var:preset|spacing|40","right":"var:preset|spacing|40"}},"border":{"radius":"8px"}},"backgroundColor":"base","layout":{"type":"flex","orientation":"vertical"}} -->
    <div class="wp-block-group has-base-background-color has-background" style="border-radius:8px;padding-top:var(--wp--preset--spacing--40);padding-right:var(--wp--preset--spacing--40);padding-bottom:var(--wp--preset--spacing--40);padding-left:var(--wp--preset--spacing--40)">
        <!-- wp:heading {"level":3,"textColor":"accent-3"} -->
        <h3 class="wp-block-heading has-accent-3-color has-text-color">${feat.title}</h3>
        <!-- /wp:heading -->

        <!-- wp:paragraph {"textColor":"contrast-2"} -->
        <p class="has-contrast-2-color has-text-color">${feat.desc}</p>
        <!-- /wp:paragraph -->

        <!-- wp:buttons -->
        <div class="wp-block-buttons"><!-- wp:button {"width":100,"backgroundColor":"accent","textColor":"base"} -->
        <div class="wp-block-button has-custom-width wp-block-button__width-100"><a class="wp-block-button__link has-base-color has-accent-background-color has-text-color has-background wp-element-button">Learn More</a></div>
        <!-- /wp:button --></div>
        <!-- /wp:buttons -->
    </div>
    <!-- /wp:group -->
    `).join('');

    return `
    <!-- wp:cover {"url":"${heroImage}","dimRatio":70,"overlayColor":"accent","align":"full","style":{"spacing":{"padding":{"top":"var:preset|spacing|60","bottom":"var:preset|spacing|60"}}},"layout":{"type":"constrained"}} -->
    <div class="wp-block-cover alignfull" style="padding-top:var(--wp--preset--spacing--60);padding-bottom:var(--wp--preset--spacing--60)">
        <span aria-hidden="true" class="wp-block-cover__background has-accent-background-color has-background-dim-70 has-background-dim"></span>
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

    <!-- wp:group {"align":"full","style":{"spacing":{"padding":{"top":"var:preset|spacing|60","bottom":"var:preset|spacing|60"}}},"backgroundColor":"accent-2","layout":{"type":"constrained"}} -->
    <div class="wp-block-group alignfull has-accent-2-background-color has-background" style="padding-top:var(--wp--preset--spacing--60);padding-bottom:var(--wp--preset--spacing--60)">
        <!-- wp:group {"align":"wide","layout":{"type":"grid","columnCount":3,"minimumColumnWidth":null}} -->
        <div class="wp-block-group alignwide">
            ${gridItems}
        </div>
        <!-- /wp:group -->
    </div>
    <!-- /wp:group -->
    `;
};
