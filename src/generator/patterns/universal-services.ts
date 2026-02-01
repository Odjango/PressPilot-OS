
import { PageContent } from '../types';

export const getUniversalServicesContent = (content?: PageContent) => {
    const title = content?.hero_title || 'Our Services';
    const sub = content?.hero_sub || 'World-class solutions for your business needs.';
    // If a hero image is provided, use it as a cover, otherwise use the standard colored header
    const heroImage = content?.hero_image; // Optional layout shift

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
        <!-- wp:heading {"level":3} -->
        <h3 class="wp-block-heading">${feat.title}</h3>
        <!-- /wp:heading -->

        <!-- wp:paragraph -->
        <p>${feat.desc}</p>
        <!-- /wp:paragraph -->

        <!-- wp:buttons -->
        <div class="wp-block-buttons"><!-- wp:button {"width":100} -->
        <div class="wp-block-button has-custom-width wp-block-button__width-100"><a class="wp-block-button__link wp-element-button">Learn More</a></div>
        <!-- /wp:button --></div>
        <!-- /wp:buttons -->
    </div>
    <!-- /wp:group -->
    `).join('');

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

    <!-- wp:group {"align":"full","style":{"spacing":{"padding":{"top":"var:preset|spacing|60","bottom":"var:preset|spacing|60"}}},"backgroundColor":"tertiary","layout":{"type":"constrained"}} -->
    <div class="wp-block-group alignfull has-tertiary-background-color has-background" style="padding-top:var(--wp--preset--spacing--60);padding-bottom:var(--wp--preset--spacing--60)">
        <!-- wp:group {"align":"wide","layout":{"type":"grid","columnCount":3,"minimumColumnWidth":null}} -->
        <div class="wp-block-group alignwide">
            ${gridItems}
        </div>
        <!-- /wp:group -->
    </div>
    <!-- /wp:group -->
    `;
};
