
import { PageContent } from '../types';

export const getUniversalHomeContent = (content?: PageContent) => {
    const title = content?.hero_title || 'Welcome';
    const sub = content?.hero_sub || 'We enable businesses to grow.';

    return `
    <!-- wp:cover {"url":"https://s.w.org/images/core/5.3/MtBlanc1.jpg","dimRatio":60,"overlayColor":"black","align":"full","layout":{"type":"constrained"}} -->
    <div class="wp-block-cover alignfull has-black-background-color has-background-dim-60 has-background-dim"><span aria-hidden="true" class="wp-block-cover__background has-black-background-color has-background-dim-60 has-background-dim"></span><img class="wp-block-cover__image-background" src="https://s.w.org/images/core/5.3/MtBlanc1.jpg" alt="" data-object-fit="cover"/>
        <div class="wp-block-cover__inner-container">
            <!-- wp:heading {"textAlign":"center","level":1,"style":{"typography":{"fontSize":"4rem"}}} -->
            <h1 class="wp-block-heading has-text-align-center" style="font-size:4rem">${title}</h1>
            <!-- /wp:heading -->

            <!-- wp:paragraph {"align":"center","fontSize":"large"} -->
            <p class="has-text-align-center has-large-font-size">${sub}</p>
            <!-- /wp:paragraph -->

            <!-- wp:buttons {"layout":{"type":"flex","justifyContent":"center"}} -->
            <div class="wp-block-buttons">
                <!-- wp:button {"className":"is-style-fill"} -->
                <div class="wp-block-button is-style-fill"><a class="wp-block-button__link wp-element-button">Get Started</a></div>
                <!-- /wp:button -->
                
                <!-- wp:button {"className":"is-style-outline"} -->
                <div class="wp-block-button is-style-outline"><a class="wp-block-button__link wp-element-button">Learn More</a></div>
                <!-- /wp:button -->
            </div>
            <!-- /wp:buttons -->
        </div>
    </div>
    <!-- /wp:cover -->

    <!-- wp:group {"align":"full","style":{"spacing":{"padding":{"top":"var:preset|spacing|60","bottom":"var:preset|spacing|60"}}},"backgroundColor":"base","layout":{"type":"constrained"}} -->
    <div class="wp-block-group alignfull has-base-background-color has-background" style="padding-top:var(--wp--preset--spacing--60);padding-bottom:var(--wp--preset--spacing--60)">
        <!-- wp:columns {"align":"wide"} -->
        <div class="wp-block-columns alignwide">
            <!-- wp:column -->
            <div class="wp-block-column">
                <!-- wp:heading {"level":3} -->
                <h3 class="wp-block-heading">Fresh Ingredients</h3>
                <!-- /wp:heading -->
                <!-- wp:paragraph -->
                <p>We source only the best local produce for our dishes.</p>
                <!-- /wp:paragraph -->
            </div>
            <!-- /wp:column -->
            <!-- wp:column -->
            <div class="wp-block-column">
                <!-- wp:heading {"level":3} -->
                <h3 class="wp-block-heading">Expert Chefs</h3>
                <!-- /wp:heading -->
                <!-- wp:paragraph -->
                <p>Culinary masters dedicated to the perfect taste.</p>
                <!-- /wp:paragraph -->
            </div>
            <!-- /wp:column -->
            <!-- wp:column -->
            <div class="wp-block-column">
                <!-- wp:heading {"level":3} -->
                <h3 class="wp-block-heading">Fast Delivery</h3>
                <!-- /wp:heading -->
                <!-- wp:paragraph -->
                <p>Hot and fresh to your door in header than 30 minutes.</p>
                <!-- /wp:paragraph -->
            </div>
            <!-- /wp:column -->
        </div>
        <!-- /wp:columns -->
    </div>
    <!-- /wp:group -->
    `;
};
