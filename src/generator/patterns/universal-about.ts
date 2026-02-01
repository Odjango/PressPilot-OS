
import { PageContent } from '../types';

export const getUniversalAboutContent = (content?: PageContent) => {
    const title = content?.hero_title || 'About Us';
    const sub = content?.hero_sub || 'We are a dedicated team of professionals.';

    // Team Section Builder
    let teamHtml = '';
    if (content?.team && content.team.length > 0) {
        const teamMembers = content.team.map(member => `
        <!-- wp:group {"style":{"spacing":{"padding":{"top":"var:preset|spacing|30","bottom":"var:preset|spacing|30","left":"var:preset|spacing|30","right":"var:preset|spacing|30"},"blockGap":"var:preset|spacing|10"}},"backgroundColor":"base","layout":{"type":"flex","orientation":"vertical","justifyContent":"center"}} -->
        <div class="wp-block-group has-base-background-color has-background" style="padding-top:var(--wp--preset--spacing--30);padding-right:var(--wp--preset--spacing--30);padding-bottom:var(--wp--preset--spacing--30);padding-left:var(--wp--preset--spacing--30)">
            <!-- wp:image {"aspectRatio":"1","scale":"cover","sizeSlug":"large","linkDestination":"none","className":"is-style-rounded"} -->
            <figure class="wp-block-image size-large is-style-rounded"><img src="https://placehold.co/400x400" alt="${member.name}" style="aspect-ratio:1;object-fit:cover"/></figure>
            <!-- /wp:image -->

            <!-- wp:heading {"textAlign":"center","level":3} -->
            <h3 class="wp-block-heading has-text-align-center">${member.name}</h3>
            <!-- /wp:heading -->

            <!-- wp:paragraph {"align":"center","style":{"typography":{"textTransform":"uppercase","letterSpacing":"1px"}},"fontSize":"small"} -->
            <p class="has-text-align-center has-small-font-size" style="letter-spacing:1px;text-transform:uppercase">${member.role}</p>
            <!-- /wp:paragraph -->
        </div>
        <!-- /wp:group -->
        `).join('');

        teamHtml = `
        <!-- wp:group {"align":"full","style":{"spacing":{"padding":{"top":"var:preset|spacing|60","bottom":"var:preset|spacing|60"}}},"backgroundColor":"accent-2","layout":{"type":"constrained"}} -->
        <div class="wp-block-group alignfull has-accent-2-background-color has-background" style="padding-top:var(--wp--preset--spacing--60);padding-bottom:var(--wp--preset--spacing--60)">
            <!-- wp:heading {"textAlign":"center","align":"wide","textColor":"contrast"} -->
            <h2 class="wp-block-heading alignwide has-text-align-center has-contrast-color has-text-color">Meet the Team</h2>
            <!-- /wp:heading -->

            <!-- wp:group {"align":"wide","layout":{"type":"grid","columnCount":3,"minimumColumnWidth":null},"style":{"spacing":{"margin":{"top":"var:preset|spacing|40"}}}} -->
            <div class="wp-block-group alignwide" style="margin-top:var(--wp--preset--spacing--40)">
                ${teamMembers}
            </div>
            <!-- /wp:group -->
        </div>
        <!-- /wp:group -->
        `;
    }

    return `
    <!-- wp:group {"align":"full","style":{"spacing":{"padding":{"top":"var:preset|spacing|60","bottom":"var:preset|spacing|60"}}},"backgroundColor":"accent-3","textColor":"base","layout":{"type":"constrained"}} -->
    <div class="wp-block-group alignfull has-base-color has-accent-3-background-color has-text-color has-background" style="padding-top:var(--wp--preset--spacing--60);padding-bottom:var(--wp--preset--spacing--60)">
        <!-- wp:heading {"textAlign":"center","level":1,"textColor":"base","fontSize":"x-large"} -->
        <h1 class="wp-block-heading has-text-align-center has-base-color has-text-color has-x-large-font-size">${title}</h1>
        <!-- /wp:heading -->

        <!-- wp:paragraph {"align":"center","textColor":"base","fontSize":"large"} -->
        <p class="has-text-align-center has-base-color has-text-color has-large-font-size">${sub}</p>
        <!-- /wp:paragraph -->
    </div>
    <!-- /wp:group -->

    <!-- wp:group {"align":"full","layout":{"type":"constrained"}} -->
    <div class="wp-block-group alignfull">
        <!-- wp:group {"align":"wide","style":{"spacing":{"padding":{"top":"var:preset|spacing|50","bottom":"var:preset|spacing|50"}}},"layout":{"type":"flex","flexWrap":"wrap","verticalAlignment":"center"}} -->
        <div class="wp-block-group alignwide" style="padding-top:var(--wp--preset--spacing--50);padding-bottom:var(--wp--preset--spacing--50)">
            <!-- wp:column {"width":"50%"} -->
            <div class="wp-block-column" style="flex-basis:50%">
                <!-- wp:heading -->
                <h2 class="wp-block-heading">Our Story</h2>
                <!-- /wp:heading -->
                <!-- wp:paragraph -->
                <p>We started with a simple idea: make software that just works. Today, we help thousands of businesses streamline their operations.</p>
                <!-- /wp:paragraph -->
            </div>
            <!-- /wp:column -->
            
            <!-- wp:column {"width":"50%"} -->
            <div class="wp-block-column" style="flex-basis:50%">
                <!-- wp:image {"sizeSlug":"large","linkDestination":"none"} -->
                <figure class="wp-block-image size-large"><img src="https://placehold.co/800x600" alt="Office"/></figure>
                <!-- /wp:image -->
            </div>
            <!-- /wp:column -->
        </div>
        <!-- /wp:group -->
        
        ${teamHtml}
    </div>
    <!-- /wp:group -->
    `;
}
