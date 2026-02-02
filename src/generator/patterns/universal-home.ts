import { PageContent, HeroLayout } from '../types';
import { getHeroByLayout } from './hero-variants';

/**
 * Universal Home Pattern - TT4-Aligned
 *
 * Uses TT4 semantic color tokens for visual differentiation between palettes:
 * - Hero: Dynamic layout based on heroLayout selection (fullBleed, fullWidth, split, minimal)
 * - Feature Section: Uses base-2 for subtle surface distinction
 * - CTA Band: Uses accent background with base text for strong visual impact
 * - Values Section: Uses accent-2 (light accent) for secondary branded section
 */
export const getUniversalHomeContent = (content?: PageContent, heroLayout?: HeroLayout) => {
    // Get hero section based on layout selection (defaults to fullBleed)
    const heroSection = getHeroByLayout(heroLayout, content);

    return `${heroSection}

<!-- wp:group {"align":"full","style":{"spacing":{"padding":{"top":"var:preset|spacing|50","bottom":"var:preset|spacing|50"}}},"backgroundColor":"base-2","layout":{"type":"constrained"}} -->
<div class="wp-block-group alignfull has-base-2-background-color has-background" style="padding-top:var(--wp--preset--spacing--50);padding-bottom:var(--wp--preset--spacing--50)">
    <!-- wp:heading {"textAlign":"center","textColor":"contrast"} -->
    <h2 class="wp-block-heading has-text-align-center has-contrast-color has-text-color">Why Choose Us</h2>
    <!-- /wp:heading -->
    <!-- wp:paragraph {"align":"center","textColor":"contrast-2"} -->
    <p class="has-text-align-center has-contrast-2-color has-text-color">Discover what makes us different</p>
    <!-- /wp:paragraph -->
    <!-- wp:columns {"align":"wide","style":{"spacing":{"blockGap":{"left":"var:preset|spacing|40"},"margin":{"top":"var:preset|spacing|40"}}}} -->
    <div class="wp-block-columns alignwide" style="margin-top:var(--wp--preset--spacing--40)">
        <!-- wp:column -->
        <div class="wp-block-column">
            <!-- wp:heading {"level":3,"textColor":"accent"} -->
            <h3 class="wp-block-heading has-accent-color has-text-color">Quality Service</h3>
            <!-- /wp:heading -->
            <!-- wp:paragraph {"textColor":"contrast-2"} -->
            <p class="has-contrast-2-color has-text-color">We deliver exceptional results that exceed expectations every time.</p>
            <!-- /wp:paragraph -->
        </div>
        <!-- /wp:column -->
        <!-- wp:column -->
        <div class="wp-block-column">
            <!-- wp:heading {"level":3,"textColor":"accent"} -->
            <h3 class="wp-block-heading has-accent-color has-text-color">Expert Team</h3>
            <!-- /wp:heading -->
            <!-- wp:paragraph {"textColor":"contrast-2"} -->
            <p class="has-contrast-2-color has-text-color">Our professionals bring years of experience to every project.</p>
            <!-- /wp:paragraph -->
        </div>
        <!-- /wp:column -->
        <!-- wp:column -->
        <div class="wp-block-column">
            <!-- wp:heading {"level":3,"textColor":"accent"} -->
            <h3 class="wp-block-heading has-accent-color has-text-color">24/7 Support</h3>
            <!-- /wp:heading -->
            <!-- wp:paragraph {"textColor":"contrast-2"} -->
            <p class="has-contrast-2-color has-text-color">We're always here when you need us, day or night.</p>
            <!-- /wp:paragraph -->
        </div>
        <!-- /wp:column -->
    </div>
    <!-- /wp:columns -->
</div>
<!-- /wp:group -->

<!-- wp:group {"align":"full","style":{"spacing":{"padding":{"top":"var:preset|spacing|50","bottom":"var:preset|spacing|50"}}},"backgroundColor":"accent","layout":{"type":"constrained"}} -->
<div class="wp-block-group alignfull has-accent-background-color has-background" style="padding-top:var(--wp--preset--spacing--50);padding-bottom:var(--wp--preset--spacing--50)">
    <!-- wp:heading {"textAlign":"center","textColor":"base"} -->
    <h2 class="wp-block-heading has-text-align-center has-base-color has-text-color">Ready to Get Started?</h2>
    <!-- /wp:heading -->
    <!-- wp:paragraph {"align":"center","textColor":"base"} -->
    <p class="has-text-align-center has-base-color has-text-color">Join thousands of satisfied customers today.</p>
    <!-- /wp:paragraph -->
    <!-- wp:buttons {"layout":{"type":"flex","justifyContent":"center"},"style":{"spacing":{"margin":{"top":"var:preset|spacing|30"}}}} -->
    <div class="wp-block-buttons is-layout-flex is-content-justification-center" style="margin-top:var(--wp--preset--spacing--30)">
        <!-- wp:button {"backgroundColor":"base","textColor":"accent"} -->
        <div class="wp-block-button"><a class="wp-block-button__link has-accent-color has-base-background-color has-text-color has-background wp-element-button">Contact Us</a></div>
        <!-- /wp:button -->
    </div>
    <!-- /wp:buttons -->
</div>
<!-- /wp:group -->

<!-- wp:group {"align":"full","style":{"spacing":{"padding":{"top":"var:preset|spacing|50","bottom":"var:preset|spacing|50"}}},"backgroundColor":"accent-2","layout":{"type":"constrained"}} -->
<div class="wp-block-group alignfull has-accent-2-background-color has-background" style="padding-top:var(--wp--preset--spacing--50);padding-bottom:var(--wp--preset--spacing--50)">
    <!-- wp:heading {"textAlign":"center","textColor":"contrast"} -->
    <h2 class="wp-block-heading has-text-align-center has-contrast-color has-text-color">Our Values</h2>
    <!-- /wp:heading -->
    <!-- wp:columns {"align":"wide","style":{"spacing":{"margin":{"top":"var:preset|spacing|40"}}}} -->
    <div class="wp-block-columns alignwide" style="margin-top:var(--wp--preset--spacing--40)">
        <!-- wp:column {"style":{"spacing":{"padding":{"top":"var:preset|spacing|30","right":"var:preset|spacing|30","bottom":"var:preset|spacing|30","left":"var:preset|spacing|30"}}},"backgroundColor":"base"} -->
        <div class="wp-block-column has-base-background-color has-background" style="padding-top:var(--wp--preset--spacing--30);padding-right:var(--wp--preset--spacing--30);padding-bottom:var(--wp--preset--spacing--30);padding-left:var(--wp--preset--spacing--30)">
            <!-- wp:heading {"level":3,"textColor":"accent-3"} -->
            <h3 class="wp-block-heading has-accent-3-color has-text-color">Innovation</h3>
            <!-- /wp:heading -->
            <!-- wp:paragraph {"textColor":"contrast-2"} -->
            <p class="has-contrast-2-color has-text-color">We constantly push boundaries to deliver cutting-edge solutions.</p>
            <!-- /wp:paragraph -->
        </div>
        <!-- /wp:column -->
        <!-- wp:column {"style":{"spacing":{"padding":{"top":"var:preset|spacing|30","right":"var:preset|spacing|30","bottom":"var:preset|spacing|30","left":"var:preset|spacing|30"}}},"backgroundColor":"base"} -->
        <div class="wp-block-column has-base-background-color has-background" style="padding-top:var(--wp--preset--spacing--30);padding-right:var(--wp--preset--spacing--30);padding-bottom:var(--wp--preset--spacing--30);padding-left:var(--wp--preset--spacing--30)">
            <!-- wp:heading {"level":3,"textColor":"accent-3"} -->
            <h3 class="wp-block-heading has-accent-3-color has-text-color">Integrity</h3>
            <!-- /wp:heading -->
            <!-- wp:paragraph {"textColor":"contrast-2"} -->
            <p class="has-contrast-2-color has-text-color">Honesty and transparency guide every decision we make.</p>
            <!-- /wp:paragraph -->
        </div>
        <!-- /wp:column -->
        <!-- wp:column {"style":{"spacing":{"padding":{"top":"var:preset|spacing|30","right":"var:preset|spacing|30","bottom":"var:preset|spacing|30","left":"var:preset|spacing|30"}}},"backgroundColor":"base"} -->
        <div class="wp-block-column has-base-background-color has-background" style="padding-top:var(--wp--preset--spacing--30);padding-right:var(--wp--preset--spacing--30);padding-bottom:var(--wp--preset--spacing--30);padding-left:var(--wp--preset--spacing--30)">
            <!-- wp:heading {"level":3,"textColor":"accent-3"} -->
            <h3 class="wp-block-heading has-accent-3-color has-text-color">Excellence</h3>
            <!-- /wp:heading -->
            <!-- wp:paragraph {"textColor":"contrast-2"} -->
            <p class="has-contrast-2-color has-text-color">We strive for perfection in everything we do.</p>
            <!-- /wp:paragraph -->
        </div>
        <!-- /wp:column -->
    </div>
    <!-- /wp:columns -->
</div>
<!-- /wp:group -->`;
};
